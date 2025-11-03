---
author: "Franco Becvort"
title: "Large Software Projects: Monitoring your App in Production"
date: 2025-11-03
description: "Monitoring for Next.js on Coolify"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-11-03-large-software-projects/thumbnail.png
---

This post is part of my [Large Software Projects blog series](/en/categories/large-software-projects/).

<!-- TOC -->
  * [Code Source](#code-source)
  * [Prerequisites: Transitioning to Production](#prerequisites-transitioning-to-production)
  * [Step 1: Prepare Your Next.js App for Production](#step-1-prepare-your-nextjs-app-for-production)
    * [Update instrumentation.ts for Environment Variables](#update-instrumentationts-for-environment-variables)
    * [(Optional) Add Health Check Endpoint](#optional-add-health-check-endpoint)
    * [Deploy Your Updated Next.js App](#deploy-your-updated-nextjs-app)
  * [Step 2: Create Monitoring Stack in Coolify](#step-2-create-monitoring-stack-in-coolify)
    * [Create Docker Compose Service](#create-docker-compose-service)
    * [Add Docker Compose Configuration (The Monolithic Approach)](#add-docker-compose-configuration-the-monolithic-approach)
    * [Connect Monitoring Stack to Coolify Network](#connect-monitoring-stack-to-coolify-network)
    * [Set Environment Variables for Monitoring Stack](#set-environment-variables-for-monitoring-stack)
    * [Deploy Monitoring Stack](#deploy-monitoring-stack)
  * [Step 3: Connect Next.js App to Monitoring Stack](#step-3-connect-nextjs-app-to-monitoring-stack)
    * [Add Network Alias to Next.js App](#add-network-alias-to-nextjs-app)
    * [Add Environment Variables to Next.js App](#add-environment-variables-to-nextjs-app)
    * [Restart Services](#restart-services)
  * [Step 4: Verification and Visualization](#step-4-verification-and-visualization)
    * [Test Service Communication](#test-service-communication)
    * [Verify Health Endpoint (Optional)](#verify-health-endpoint-optional)
  * [Step 5: Set Up Grafana Access](#step-5-set-up-grafana-access)
    * [Expose Grafana with a Domain](#expose-grafana-with-a-domain)
    * [Access Grafana and Configure Data Sources](#access-grafana-and-configure-data-sources)
  * [Troubleshooting](#troubleshooting)
    * [Services Can't Communicate](#services-cant-communicate)
    * [Prometheus Shows Target Down](#prometheus-shows-target-down)
  * [What&rsquo;s Next?](#whats-next)
    * [1. Enabling Authentication in Loki](#1-enabling-authentication-in-loki)
    * [2. Unifying Trace Visualization](#2-unifying-trace-visualization)
    * [3. Transitioning the Series Focus: Authentication](#3-transitioning-the-series-focus-authentication)
<!-- TOC -->

## Code Source

All code snippets shown in this post are available in the dedicated branch for this article on the project's GitHub repository. Feel free to clone it and follow along:

[https://github.com/franBec/tas/tree/feature/2025-11-03](https://github.com/franBec/tas/tree/feature/2025-11-03)

## Prerequisites: Transitioning to Production

In our previous posts, we successfully built a powerful local monitoring stack using Docker Compose. The goal now is to lift this entire system—Metrics, Logs, and Traces—and deploy it alongside our Next.js application on our production VPS managed by **Coolify**.

To succeed, we rely on the instrumentation work already completed:

*   Next.js app deployed on a Coolify project ([Large Software Projects: Setting Up CI/CD and Deployment](/en/blog/2025-10-16-large-software-projects))
*   Next.js initialization of `prom-client` ([Next.js Instrumentation: Initializing Prom-client](/en/blog/2025-10-26-large-software-projects/#nextjs-instrumentation-initializing-prom-client)) and Metric endpoint ([Expose the Metrics Endpoint](/en/blog/2025-10-26-large-software-projects/#1-expose-the-metrics-endpoint))
*   Next.js initialization of `loki` ([Next.js Instrumentation: Initializing the logger](/en/blog/2025-10-27-large-software-projects/#nextjs-instrumentation-initializing-the-logger))
*   Next.js registration of OTel ([Next.js Instrumentation: Registering OpenTelemetry](/en/blog/2025-10-28-large-software-projects/#nextjs-instrumentation-registering-opentelemetry))

## Step 1: Prepare Your Next.js App for Production

### Update instrumentation.ts for Environment Variables

We use logical defaults (`|| "http://localhost:3100"`) for local development but prioritize the environment variables (`process.env.*`) for production.

`src/instrumentation.ts`

```ts
// Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/instrumentation.ts
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
        const { registerOTel } = await import("@vercel/otel");

        //prometheus initialization
        const prometheusRegistry = new Registry();
        collectDefaultMetrics({
            register: prometheusRegistry,
        });
        globalThis.metrics = {
            registry: prometheusRegistry,
        };

        //loki initialization
        globalThis.logger = pino(
            pinoLoki({
                host: process.env.LOKI_HOST || "http://localhost:3100",
                batching: true,
                interval: 5,
                labels: {
                    app: process.env.OTEL_SERVICE_NAME || "next-app",
                    environment: process.env.NODE_ENV || "development",
                },
            })
        );

        //otel initialization
        registerOTel();
    }
}
```

### (Optional) Add Health Check Endpoint

A simple health check endpoint is crucial for verifying that all our monitoring systems are correctly initialized and that our environment variables are being read properly.

**Note on Security:** While exposing this endpoint is helpful for debugging, it is generally recommended to restrict access to diagnostic endpoints in production and avoid exposing sensitive configuration data like environment variables here.

```ts title="src/app/api/health/route.ts"
export const runtime = "nodejs";

export async function GET() {
    return Response.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        monitoring: {
            metricsRegistry: !!globalThis?.metrics?.registry,
            logger: !!globalThis?.logger,
        },
        env: {
            otelLogLevel: process.env.OTEL_LOG_LEVEL,
            otelServiceName: process.env.OTEL_SERVICE_NAME,
            otelExporterOtlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
            lokiHost: process.env.LOKI_HOST,
            nodeEnv: process.env.NODE_ENV,
        },
    });
}
```

### Deploy Your Updated Next.js App

Commit and push these changes. If using Coolify's standard CI/CD setup, the application will automatically deploy, but the monitoring will be broken until we deploy the stack in the next step.

## Step 2: Create Monitoring Stack in Coolify

### Create Docker Compose Service

1. Go to your Coolify **Project**
2. Click **+ Add Resource**
3. Select **Docker Compose**
4. Let's name it `monitoring`

![Coolify Project Resources](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-2025-11-03-15_32_16.png)

### Add Docker Compose Configuration (The Monolithic Approach)

When deploying complex multiservice stacks like this in tools like Coolify, it is often simpler to merge all configuration files (`prometheus.yml`, `loki-config.yml`, etc.) directly into the main `docker-compose.yml` file using the `configs:` section. This makes management easier by keeping everything defined in one resource.

Click **"Edit Compose File"** and paste this complete configuration:

```yml
services:
  grafana:
    image: grafana/grafana:11.4.0
    environment:
      - GF_SECURITY_ADMIN_USER=${GF_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GF_ADMIN_PASSWORD}
    volumes:
      - grafana-storage:/var/lib/grafana
    ports:
      - "3001:3000"
    networks:
      coolify:
        aliases:
          - grafana

  prometheus:
    image: prom/prometheus:v3.0.1
    volumes:
      - prometheus-storage:/prometheus
    configs:
      - source: prometheus_config
        target: /etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    networks:
      coolify:
        aliases:
          - prometheus

  loki:
    image: grafana/loki:2.9.2
    configs:
      - source: loki_config
        target: /etc/loki/local-config.yml
    command: -config.file=/etc/loki/local-config.yml
    volumes:
      - loki-storage:/loki
    ports:
      - "3100:3100"
    networks:
      coolify:
        aliases:
          - loki

  otel-collector:
    image: otel/opentelemetry-collector:0.115.0
    restart: always
    command: ["--config=/etc/otel-collector-config.yml"]
    configs:
      - source: otel_config
        target: /etc/otel-collector-config.yml
    ports:
      - "4317:4317"
      - "4318:4318"
    networks:
      coolify:
        aliases:
          - otel-collector

  zipkin:
    image: openzipkin/zipkin:3.4.2
    ports:
      - "9411:9411"
    networks:
      coolify:
        aliases:
          - zipkin

networks:
  coolify:
    external: true
    name: coolify
configs:
  prometheus_config:
    content: |
      scrape_configs:
        - job_name: "next-app"
          static_configs:
            # IMPORTANT: Prometheus must scrape the Next.js container using its Coolify Network Alias
            - targets: ["next-app:3000"]
          metrics_path: "/api/metrics"
          scrape_interval: 15s

  loki_config:
    content: |
      auth_enabled: false # TODO: Enable authentication for true production setup
      server:
        http_listen_port: 3100
        grpc_listen_port: 9096
      common:
        path_prefix: /loki
        storage:
          filesystem:
            chunks_directory: /loki/chunks
            rules_directory: /loki/rules
        replication_factor: 1
        ring:
          kvstore:
            store: inmemory
      schema_config:
        configs:
          - from: 2020-10-24
            store: tsdb
            object_store: filesystem
            schema: v13
            index:
              prefix: index_
              period: 24h
      limits_config:
        retention_period: 672h
        ingestion_rate_mb: 10
        ingestion_burst_size_mb: 20
      ruler:
        storage:
          type: local
          local:
            directory: /loki/rules

  otel_config:
    content: |
      receivers:
        otlp:
          protocols:
            grpc:
              endpoint: "0.0.0.0:4317"
            http:
              endpoint: "0.0.0.0:4318"
      processors:
        batch:
          timeout: 1s
          send_batch_size: 1024
      exporters:
        zipkin:
          endpoint: "http://zipkin:9411/api/v2/spans" # Use Zipkin's network alias
          format: proto
        debug:
          verbosity: detailed
      extensions:
        health_check:
        pprof:
          endpoint: :1888
        zpages:
          endpoint: :55679
      service:
        extensions: [pprof, zpages, health_check]
        pipelines:
          traces:
            receivers: [otlp]
            processors: [batch]
            exporters: [zipkin, debug]

volumes:
  grafana-storage:
  prometheus-storage:
  loki-storage:
```

### Connect Monitoring Stack to Coolify Network

All services must live on the same Docker network for DNS resolution to work.

Ensure the checkbox **"Connect To Predefined Network"** is checked. Coolify will connect the stack to its default network named `coolify`.

![Connect to Coolify Network](/uploads/2025-11-03-large-software-projects/2025-11-03-15-40-55.png)

### Set Environment Variables for Monitoring Stack

These variables are primarily for securing and configuring Grafana.

In the monitoring service configuration, go to **Environment Variables** section and add:

```env
GF_ADMIN_PASSWORD=your-secure-password
GF_ADMIN_USER=admin
GF_SECURITY_ADMIN_USER=admin
GF_SERVER_ROOT_URL=
```

![Environment variables](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-service-z84sso4w8w08o4wc4c4w8wko-environment-variables-2025-11-03-15_46_15.png)

### Deploy Monitoring Stack

Click the **"Deploy"** button. The services will start.

**Note:** It is common for services to appear "running (unhealthy)". Unhealthy state. This doesn't mean that the resource is malfunctioning. More info in [Coolify Docs &ldquo;Health checks&rdquo;](https://coolify.io/docs/knowledge-base/health-checks)

## Step 3: Connect Next.js App to Monitoring Stack

Now we ensure the application container knows how to find the monitoring containers.

### Add Network Alias to Next.js App

In the Prometheus config (`prometheus_config` content above), we instructed Prometheus to scrape the Next.js app at **`next-app:3000`**. This means the Next.js container must have the network alias `next-app`.

**This is the crucial step that makes Prometheus scraping possible!** In your Next.js application configuration in Coolify, scroll down to the "Network" section and add the alias: `next-app`.

![Network section](/uploads/2025-11-03-large-software-projects/2025-11-03-16-37-07.png)

### Add Environment Variables to Next.js App

Finally, we inject the environment variables that tell the Next.js application where to send its logs and traces. We use the service aliases defined in the `docker-compose.yml` (`loki`, `otel-collector`).

In your **Next.js app** configuration in Coolify, go to **Environment Variables** and add:

```env
LOKI_HOST=http://loki:3100
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_LOG_LEVEL=info
OTEL_SERVICE_NAME=next-app
```

![next.js app environment variables](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-application-bsoswcgg44o8g0cogsk8c44o-environment-variables-2025-11-03-16_31_30.png)

### Restart Services

1. **Restart Next.js app** - This ensures the application picks up the new environment variables and network alias.
2. **Restart monitoring stack** - This ensures the monitoring services pick up any lingering changes.

Wait for both services to come up.

## Step 4: Verification and Visualization

### Test Service Communication

Use the Next.js app's terminal in Coolify to verify network connectivity to the monitoring stack:

```bash
# Test Loki
curl http://loki:3100/ready
# Should return: ready

# Test Prometheus
curl http://prometheus:9090/-/healthy
# Should return: Prometheus Server is Healthy.

# Test OTel Collector (404 is expected for root path, indicating it is running)
curl http://otel-collector:4318
# Should return: 404 page not found
```

![test service communication](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-application-bsoswcgg44o8g0cogsk8c44o-terminal-2025-11-03-16_52_53.png)

### Verify Health Endpoint (Optional)

If you implemented the optional health endpoint, check it: `https://whatever-is-your-domain/api/health`

It should show the environment variables were correctly received:
```json
{
  "status": "OK",
  "timestamp": "2025-11-03T16:49:29.362Z",
  "monitoring": {
    "metricsRegistry": true,
    "logger": true
  },
  "env": {
    "otelLogLevel": "info",
    "otelServiceName": "next-app",
    "otelExporterOtlpEndpoint": "http://otel-collector:4318",
    "lokiHost": "http://loki:3100",
    "nodeEnv": "production"
  }
}
```

## Step 5: Set Up Grafana Access

### Expose Grafana with a Domain

To make Grafana securely accessible outside of Coolify's proxy, we expose it via a dedicated subdomain with SSL.

1. In your Monitoring service, click on the Grafana service's **Settings**.
   ![Seatch for Grafana settings](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-service-z84sso4w8w08o4wc4c4w8wko-2025-11-03-16_58_15.png)
2. Go to the **Domains** section. Enter your desired monitoring subdomain (e.g., `https://grafana.yourdomain.com`) and Save. Coolify handles the necessary port routing and sets up SSL with Let's Encrypt.
   ![Grafana domain](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-service-z84sso4w8w08o4wc4c4w8wko-fc0w4g0g444swokscg4wo8k4-2025-11-03-17_06_24.png)

### Access Grafana and Configure Data Sources

1. Go to your new Grafana domain (e.g., `https://grafana.yourdomain.com`).
2. Login with the credentials defined in the environment variables:
    * Username: `admin` (or what you set in `GF_ADMIN_USER`)
    * Password: (what you set in `GF_ADMIN_PASSWORD`)

Now you can configure the data sources using the service aliases, just as we did locally:

*   **Prometheus URL:** `http://prometheus:9090`
*   **Loki URL:** `http://loki:3100`

(Refer back to [Large Software Projects: Collecting Metrics](/en/blog/2025-10-26-large-software-projects/#add-prometheus-data-source) and [Large Software Projects: Collecting Logs](/en/blog/2025-10-27-large-software-projects/#add-loki-data-source) for the detailed configuration steps.)

## Troubleshooting

### Services Can't Communicate

If services can't reach each other, the network alias setup is usually the culprit.

Verify all services are on the same network named `coolify`:

```bash
docker ps --format "table {{.Names}}\t{{.Networks}}"
```
All running containers (Next.js and all monitoring services) should show `coolify` in the networks column.

![All services are on the same network](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-server-t4kgg8s00cck880csg44csss-terminal-2025-11-03-17_16_54.png)

### Prometheus Shows Target Down

If Prometheus is running but shows your `next-app` target as "Down," check the logs and configuration:

1.  **Is the Next.js alias correct?** Double-check the network alias `next-app` is applied to the Next.js application container settings.
2.  **Verify the Prometheus config:** Ensure the scrape target in the `prometheus_config` uses the network alias: `- targets: ["next-app:3000"]`

You can manually inspect Prometheus targets by accessing its API via the Coolify terminal:

```bash
# Must be run from a container on the Coolify network, like the Next.js app
curl http://prometheus:9090/api/v1/targets | jq
```
![Prometheus targets](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-server-t4kgg8s00cck880csg44csss-terminal-2025-11-03-17_19_21.png)

## What&rsquo;s Next?

We have now reached a significant milestone: a complete, production-ready observability stack providing metrics, logs, and traces for our Next.js application, all managed by Coolify. This process took five dedicated blog posts to cover thoroughly.

However, no architectural setup is perfect, and there are immediate improvements to consider before we move on.

### 1. Enabling Authentication in Loki

For development simplicity, our Loki configuration currently uses `auth_enabled: false`. In a true production environment, this is a significant security risk, as anyone on the internal network could access the log data (unlikely, but not impossible).

It is highly recommended to investigate and implement authentication (often basic auth or leveraging existing identity providers) for the Loki server to restrict log ingestion and query access.

### 2. Unifying Trace Visualization

Currently, our trace data is sent to the OTel Collector and then routed to Zipkin. To view this data, we would need to expose Zipkin via a domain (which is trivial, following the same steps we used for Grafana).

However, the ideal "single pane of glass" philosophy requires seeing traces alongside metrics and logs within **Grafana**. Future enhancements should focus on setting up the **Grafana Trace Data Source** (e.g., integrating [Grafana Tempo](https://grafana.com/docs/tempo/latest/)).

### 3. Transitioning the Series Focus: Authentication

This post concludes our deep dive into monitoring and observability, completing the operational maturity phase of the project.

With robust insight into our application's health, performance, and behavior, we can now tackle the next crucial and complicated architectural challenge: **Authentication and Authorization**.