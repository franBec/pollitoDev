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
  * [(Optional) Add Health Check Endpoint](#optional-add-health-check-endpoint)
    * [Deploy Your Updated Next.js App](#deploy-your-updated-nextjs-app)
  * [Step 2: Create Monitoring Stack in Coolify](#step-2-create-monitoring-stack-in-coolify)
    * [Create Docker Compose Service](#create-docker-compose-service)
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
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

## Code Source

All code snippets shown in this post are available in the dedicated branch for this article on the project's GitHub repository. Feel free to clone it and follow along:

[https://github.com/franBec/tas/tree/feature/2025-11-03](https://github.com/franBec/tas/tree/feature/2025-11-03)

## Prerequisites: Transitioning to Production

In the [previous post](/en/blog/2025-11-02-large-software-projects), we successfully built a powerful local monitoring stack using Docker Compose.

The goal now is to lift this entire system—Metrics, Logs, and Traces—and deploy it alongside our Next.js application on our production VPS managed by **Coolify**.

## Step 1: Prepare Your Next.js App for Production

## (Optional) Add Health Check Endpoint

A simple health check endpoint is crucial for verifying that all our monitoring systems are correctly initialized and that our environment variables are being read properly.

**Note on Security:** While exposing this endpoint is helpful for debugging, it is generally recommended to restrict access to diagnostic endpoints in production and avoid exposing sensitive configuration data like environment variables here.

```ts
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
5. In the monitoring service, click **"Edit Compose File"** and paste [this complete configuration](https://github.com/franBec/tas/blob/feature/2025-11-02/src/resources/monitoring.yml).

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

If you implemented the optional health endpoint, check it. It should show the environment variables were correctly received:

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

Now you can configure the data sources and import a dashboard just as we did locally (Refer back to the [previous post](/en/blog/2025-11-02-large-software-projects) for detailed configuration steps.)

## What&rsquo;s Next?

This post concludes our deep dive into monitoring and observability, completing the operational maturity phase of the project.

With robust insight into our application's health, performance, and behavior, we can now tackle the next crucial and complicated architectural challenge: **Authentication and Authorization**.