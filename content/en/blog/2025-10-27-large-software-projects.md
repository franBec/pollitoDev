---
author: "Franco Becvort"
title: "Large Software Projects: Collecting Logs"
date: 2025-10-27
description: "Loki and Grafana"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-27-large-software-projects/thumbnail.png
---
<!-- TOC -->
  * [Code Source](#code-source)
  * [Blog Focus: The Logs](#blog-focus-the-logs)
  * [Pino and pino-loki](#pino-and-pino-loki)
  * [Next.js Instrumentation: Initializing the logger](#nextjs-instrumentation-initializing-the-logger)
  * [Logger Demonstration](#logger-demonstration)
    * [1. Success Route](#1-success-route)
    * [2. Failure Route](#2-failure-route)
  * [loki Configuration](#loki-configuration)
  * [Define loki Docker Service](#define-loki-docker-service)
  * [Grafana Dashboard Setup](#grafana-dashboard-setup)
    * [Add Loki Data Source](#add-loki-data-source)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

## Code Source

All code snippets shown in this post are available in the dedicated branch for this article on the project's GitHub repository. Feel free to clone it and follow along:

[https://github.com/franBec/tas/tree/feature/2025-10-27](https://github.com/franBec/tas/tree/feature/2025-10-27)

## Blog Focus: The Logs

We will focus on implementing logs collection:

![blog focus](/uploads/2025-10-27-large-software-projects/blog-focus.png)

## Pino and pino-loki

- [pino](https://getpino.io/#/) is a very low overhead JavaScript logger.
- [pino-loki](https://github.com/Julien-R44/pino-loki) is a transport layer that takes the formatted logs and ships them directly to our running Loki instance.

To install them run `pnpm add pino pino-loki`.

## Next.js Instrumentation: Initializing the logger

In the same `src/instrumentation.ts` where we declared the metric registry on the [previous blog](/en/blog/2025-10-26-large-software-projects/#nextjs-instrumentation-initializing-prom-client), we will also initialize the logger and make it globally available using `globalThis.metrics`.

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
    var logger: any | undefined;
}

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { Registry, collectDefaultMetrics } = await import("prom-client");
        const pino = (await import("pino")).default;
        const pinoLoki = (await import("pino-loki")).default;

        //Prom-client initialization
        const prometheusRegistry = new Registry();
        collectDefaultMetrics({
            register: prometheusRegistry,
        });
        globalThis.metrics = {
            registry: prometheusRegistry,
        };

        //logger initialization
        globalThis.logger = pino(
            pinoLoki({
                host: "http://localhost:3100", // Connects to the loki container via localhost:3100
                batching: true,
                interval: 5,
                labels: { app: "next-app" }, // Crucial label for querying in Grafana
            })
        );
    }
}
```

## Logger Demonstration

Now that the logger is initialized globally, let's create two simple API routes to demonstrate successful logging and error logging. We ensure these routes explicitly use the `nodejs` runtime to guarantee access to the instrumentation setup.

We’ll define `/api/hello-world` (always 200) and `/api/something-is-wrong` (always 500).

### 1. Success Route

```ts
// Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/app/api/examples/logging/route.ts
export const runtime = "nodejs";

export async function GET() {
    try {
        const { randomUUID } = await import("crypto");

        globalThis?.logger?.info({
            meta: {
                requestId: randomUUID(),
                extra: "This is some extra information that you can add to the meta",
                anything: "anything",
            },
            message: "Successful request handled",
        });
        return Response.json({
            message: "Hello world",
        });
    } catch (error) {
        globalThis?.logger?.error({
            err: error,
            message: "Something went wrong during success logging",
        });
    }
}
```

### 2. Failure Route

```ts
// Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/app/api/examples/logging/route.ts
export const runtime = "nodejs";

export async function GET() {
    try {
        throw new Error("Something is fundamentally wrong with this API endpoint");
    } catch (error) {
        globalThis?.logger?.error({
            err: error,
            message: "An error message here",
        });
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
```

## loki Configuration

For Loki to receive and correctly store the logs shipped by `pino-loki`, we need to provide it with a configuration file that dictates storage, retention, and endpoints.

We place this configuration in `src/resources/dev/monitoring/loki-config.yml`:

```yml
# Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/loki-config.yml
# Disable authentication (NOT recommended for production)
auth_enabled: false

# Server configuration
server:
  # Port where Loki will listen for incoming connections
  http_listen_port: 3100

# Common configuration settings
common:
  # Base directory for Loki's data storage
  path_prefix: /tmp/loki
  # Storage configuration - using local filesystem
  storage:
    filesystem:
      # Directory where Loki stores data chunks
      chunks_directory: /tmp/loki/chunks
  # Number of copies of each stream to maintain (1 for single instance)
  replication_factor: 1
  # Ring is Loki's internal coordination system
  ring:
    # Key-Value store configuration for ring
    kvstore:
      # Using in-memory storage (good for testing, NOT for production)
      store: inmemory

# Schema configuration defines how Loki organizes and stores log data
schema_config:
  configs:
    - from: 2020-10-24
      # Using TSDB (Time Series Database) storage format
      store: tsdb
      # Using local filesystem for object storage
      object_store: filesystem
      # Schema version
      schema: v13
      # Index configuration
      index:
        # Prefix for index files
        prefix: index_
        # Create new index files every 24 hours
        period: 24h

limits_config:
  # Keep logs for 28 days before deletion
  retention_period: 672h

ruler:
  storage:
    type: local
    local:
      directory: /loki/rules
# NOTE: This configuration is suitable for development/testing only.
# For production, you should:
# 1. Enable authentication
# 2. Use persistent storage instead of filesystem
# 3. Use external kvstore (like etcd or consul) instead of inmemory
# 4. Use proper persistent directory instead of /tmp
```

## Define loki Docker Service

In the same Docker Compose we used to define the Prometheus backend and the Grafana visualization layer on the [previous blog](/en/blog/2025-10-26-large-software-projects/#3-define-grafana-and-prometheus-docker-services), we will also define loki.

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

  loki:
    container_name: loki
    image: grafana/loki:2.9.2
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yml
    command: -config.file=/etc/loki/local-config.yml
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

### Add Loki Data Source

1.  Go to `http://localhost:3001/connections/datasources/new` and select **Loki**.
    ![new data source](/uploads/2025-10-27-large-software-projects/screencapture-localhost-3001-connections-datasources-new-2025-10-29-12_25_51.png)
2.  Set the "Connection URL" to `http://loki:3100` (We use the Docker service name, `loki`).
    ![loki connection url](/uploads/2025-10-27-large-software-projects/2025-10-27-20-28-07.png)
3.  Scroll down and click "Save & Test." You should see "Data source successfully connected."
4.  Go to [http://localhost:3001/dashboards](http://localhost:3001/dashboards) and select the dashboard we created in the previous blog.
    ![Dashboards](/uploads/2025-10-27-large-software-projects/screencapture-localhost-3001-dashboards-2025-10-29-12_26_14.png)
5.  Click **Edit** (top right) to enter Edit mode.
    ![Edit dashboard](/uploads/2025-10-27-large-software-projects/2025-10-27-20-33-29.png)
6.  Click on the "Add" dropdown and select "Visualization."
    ![Add visualization](/uploads/2025-10-27-large-software-projects/2025-10-27-20-34-04.png)
7.  Select **loki** as the data source.
8.  In the "label filters," select the label `app` and the value `next-app` (this is the label we defined in our `instrumentation.ts`).
    *   *Note:* If these values aren't available, make sure you ran the `docker-compose` services and hit the API routes a few times to generate data.
9.  In "operations," clear the default operation, and select **Add JSON Parser** (since `pino` outputs JSON logs).
10. On the right sidebar, change the "Visualization" type to **Logs**.
11. Click "Run query" to confirm the data appears. 
12. Save the Dashboard.

![Add loki data source](/uploads/2025-10-27-large-software-projects/2025-10-27-20-36-56.png)

You can now drag and resize the new log panel. 

Congratulations, you have a unified monitoring dashboard displaying both metrics and application logs! (Don't forget to save the dashboard).

![Final Dashboard](/uploads/2025-10-27-large-software-projects/screencapture-localhost-3001-d-PTSqcpJWk-nodejs-application-dashboard-2025-10-29-12_32_41.png)

## What&rsquo;s Next?

In the next blog we will set up tracing with an OTel collector and Zipkin.