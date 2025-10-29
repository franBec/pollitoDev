---
author: "Franco Becvort"
title: "Large Software Projects: Collecting Metrics"
date: 2025-10-26
description: "Prometheus and Grafana"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-26-large-software-projects/thumbnail.png
---

This post is part of my [Large Software Projects blog series](/en/categories/large-software-projects/).

<!-- TOC -->
  * [Code Source](#code-source)
  * [Blog Focus: The Metrics](#blog-focus-the-metrics)
  * [Prom-client](#prom-client)
  * [The Runtime Split: A Next.js Requirement](#the-runtime-split-a-nextjs-requirement)
  * [Next.js Instrumentation: Initializing Prom-client](#nextjs-instrumentation-initializing-prom-client)
    * [Infrastructure Developer Notes](#infrastructure-developer-notes)
  * [Prometheus](#prometheus)
    * [1. Expose the Metrics Endpoint](#1-expose-the-metrics-endpoint)
    * [2. Configure Prometheus to Scrape the Endpoint](#2-configure-prometheus-to-scrape-the-endpoint)
    * [3. Define Grafana and Prometheus Docker Services](#3-define-grafana-and-prometheus-docker-services)
  * [Grafana Dashboard Setup](#grafana-dashboard-setup)
    * [Add Prometheus Data Source](#add-prometheus-data-source)
    * [Troubleshooting: Fixing the Node.js Version Panel](#troubleshooting-fixing-the-nodejs-version-panel)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

## Code Source

All code snippets shown in this post are available in the dedicated branch for this article on the project's GitHub repository. Feel free to clone it and follow along:

[https://github.com/franBec/tas/tree/feature/2025-10-26](https://github.com/franBec/tas/tree/feature/2025-10-26)

## Blog Focus: The Metrics

In the previous part, we established our hybrid monitoring architecture. Now it's time to build the first pillar: **Metrics**.

We will focus on implementing the entire pipeline for numerical data, from collection to visualization:

![blog focus](/uploads/2025-10-26-large-software-projects/blog-focus.png)

This involves:

1.  The **`prom-client`** integration within the Next.js Application.
2.  The **Prometheus** scraper/backend.
3.  The **Grafana** visualization layer for metrics.

Let's get our hands dirty.

## Prom-client

[Prom-client](https://github.com/siimon/prom-client) is the established, performant library for generating metrics in the Prometheus format. By calling one simple function, we gain automatic insight into CPU, memory, garbage collection, data that is often complex to gather via pure OpenTelemetry methods.

To install it run `pnpm add prom-client`.

## The Runtime Split: A Next.js Requirement

A critical consideration in Next.js is that parts of your application might run in different environments.

*   **Node.js Runtime:** The traditional, full-featured server environment. This is where system-level monitoring tools like `prom-client` must run.
*   **Edge Runtime:** A lightweight environment optimized for network speed. It **does not** support full Node.js APIs.

We must explicitly check for the `nodejs` runtime environment to prevent runtime crashes when importing and initializing our monitoring tools.

## Next.js Instrumentation: Initializing Prom-client

Next.js uses the special `src/instrumentation.ts` file to run initialization code once when a new server instance starts. This is the perfect place to register our metrics system.

We will initialize the metrics registry and make it globally available using `globalThis.metrics`.

```ts
// Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/instrumentation.ts
// Node.js-specific imports are moved into dynamic imports within runtime checks
// Prevent Edge runtime from trying to import Node.js-specific modules
declare global {
    var metrics:
        | {
        registry: any;
    }
        | undefined;
}

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { Registry, collectDefaultMetrics } = await import("prom-client");

        // Prom-client initialization
        const prometheusRegistry = new Registry();
        collectDefaultMetrics({
            register: prometheusRegistry,
        });
        globalThis.metrics = {
            registry: prometheusRegistry,
        };
    }
}
```

### Infrastructure Developer Notes

*   **Global Scope:** We use `globalThis` to share the `prometheusRegistry` across modules, as `instrumentation.ts` runs outside the standard module execution.
*   **Linting Exception:** Due to the necessary `globalThis` variable declarations, this file will clash with the linting rules. Add `src/instrumentation.ts` to the `eslint.config.mjs` ignores list.
*   **Testing Exception:** As an infrastructure file, this is not suitable for unit testing. Add `src/instrumentation.ts` to the `vitest.config.mts` test coverage exclude list.

## Prometheus

[Prometheus](https://prometheus.io/) is a pull-based system: it doesn't wait for your application to send data; it periodically scrapes (pulls) data from a dedicated HTTP endpoint you expose.

### 1. Expose the Metrics Endpoint

We create a simple `api/metrics` API route that uses our globally defined registry to output the gathered metrics data in the raw text format Prometheus expects.

```ts
// Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/app/api/metrics/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    try {
        if (!globalThis?.metrics?.registry) {
            return new NextResponse("Metrics Unavailable", {
                status: 503,
                headers: {
                    "Content-Type": "text/plain",
                },
            });
        }

        const metrics = await globalThis.metrics.registry.metrics();
        return new NextResponse(metrics, {
            headers: {
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        console.error("Error collecting metrics:", error);
        return new NextResponse("Error collecting metrics", {
            status: 500,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }
}
```

### 2. Configure Prometheus to Scrape the Endpoint

In `src/resources/dev/monitoring/prometheus.yml`, we define a scraping job that tells the Prometheus container where to find the application endpoint.

```yml
# Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/prometheus.yml
# Configuration for scraping metrics from different targets
scrape_configs:
  # Job for collecting metrics from Next.js application
  - job_name: "next-app"
    # Static list of target endpoints to scrape
    static_configs:
      # Using host.docker.internal to access host machine from Docker container
      # Port 3000 is the default Next.js port
      - targets: ["host.docker.internal:3000"]
    # Path where metrics endpoint is exposed in the Next.js app
    metrics_path: "/api/metrics"
```

### 3. Define Grafana and Prometheus Docker Services

We use Docker Compose to define the Prometheus backend and the Grafana visualization layer.

`src/resources/dev/monitoring/docker-compose.yml`

```yml
# Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/docker-compose.yml
services:
  grafana:
    container_name: grafana
    image: grafana/grafana:11.4.0
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin_user
      - GF_SECURITY_ADMIN_PASSWORD=admin_password
    volumes:
      - grafana-storage:/var/lib/grafana
    networks:
      - monitoring

  prometheus:
    container_name: prometheus
    image: prom/prometheus:v3.0.1
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-storage:/prometheus
    networks:
      - monitoring

networks:
  monitoring:
    name: monitoring
    driver: bridge

volumes:
  grafana-storage:
  prometheus-storage:
```

## Grafana Dashboard Setup

Make sure your Docker engine (like [Docker Desktop](https://www.docker.com/products/docker-desktop/)) is running in the background.

1.  **Start the Stack:**
    ```bash
    docker-compose -f src/resources/dev/monitoring/docker-compose.yml up -d
    ```
2.  **Start the App:** Run your Next.js application's start script on the host machine.

Go to [http://localhost:3001/](http://localhost:3001/) and log in using the credentials defined in the `docker-compose.yml` (`admin_user`/`admin_password`).

### Add Prometheus Data Source

1.  Navigate to [http://localhost:3001/connections/datasources/new](http://localhost:3001/connections/datasources/new) and select **Prometheus**.
    ![new Prometheus data source](/uploads/2025-10-26-large-software-projects/2025-10-27-18-59-53.png)
2.  Set the "Prometheus server URL" to `http://prometheus:9090` (We use the Docker service name, `prometheus`).
    ![Prometheus server URL](/uploads/2025-10-26-large-software-projects/2025-10-27-19-04-24.png)
3.  Scroll down and click **"Save & Test."** You should see the confirmation: "Successfully queried the Prometheus API."
4.  **Import a Dashboard:** Go to [http://localhost:3001/dashboard/import](http://localhost:3001/dashboard/import). We are going to use the community [Node.js Application Dashboard](https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/) (ID 11159).
5.  Enter Dashboard ID **11159**.
6.  Above the Import button, select the Prometheus data source you just created from the dropdown.
7.  Click **Import**.

![pick Prometheus data source](/uploads/2025-10-26-large-software-projects/screencapture-localhost-3001-dashboard-import-2025-10-27-19_09_31.png)

You now have a powerful dashboard displaying automatic metrics like CPU usage, memory consumption, garbage collection activity, and request counts.

![dashboard](/uploads/2025-10-26-large-software-projects/screencapture-localhost-3001-d-PTSqcpJWk-nodejs-application-dashboard-2025-10-27-19_11_12.png)

### Troubleshooting: Fixing the Node.js Version Panel

One common issue with this imported dashboard is that the "Node.js version" panel often appears empty. Let's fix this minor inconvenience:

1.  Click on the three vertical dots on the top right corner of that empty panel and select **Edit**.
    ![edit panel](/uploads/2025-10-26-large-software-projects/2025-10-28-23-06-10.png)
2.  In the Query editor ("Metric browser" area), clear the default query and input the correct metric name: `nodejs_version_info`.
3.  In the right-hand panel, under "Value options" -> "Calculation," set it to `Last *`.
4.  Under "Value options" -> "Fields," you should now be able to select the version string.
5.  Click "Run queries" to confirm the data appears.
6.  Click the "Save Dashboard" button (top right).

![Node.js version fix](/uploads/2025-10-26-large-software-projects/2025-10-27-19-19-22.png)

## What&rsquo;s Next?

We have successfully implemented the metrics pipeline, giving us deep numerical insight into the health and performance of our application.

However, a dashboard full of graphs only tells us **what** is happening (e.g., "CPU spiked by 50%"). It doesn't tell us **why** (e.g., "The spike was caused by a specific user request hitting a slow database query").

In the next blog we will set up structured logging with `pino-loki`.

**Next Blog**: [Large Software Projects: Collecting Logs](/en/blog/2025-10-27-large-software-projects)