---
author: "Franco Becvort"
title: "Large Software Projects: Introduction to Monitoring"
date: 2025-10-25
description: "Why Do We Need Instrumentation?"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-25-large-software-projects/thumbnail.png
---

This post is part of my [Large Software Projects blog series](/en/categories/large-software-projects/).

<!-- TOC -->
  * [Inspiration and Context](#inspiration-and-context)
  * [Why Do We Need Instrumentation?](#why-do-we-need-instrumentation)
    * [How Instrumentation Works](#how-instrumentation-works)
    * [The Three Pillars of Telemetry Data](#the-three-pillars-of-telemetry-data)
  * [How to Manage All These Telemetry Backends?](#how-to-manage-all-these-telemetry-backends)
  * [The Architectural Trade-Off: OTel Purity vs. Pragmatic Simplicity](#the-architectural-trade-off-otel-purity-vs-pragmatic-simplicity)
  * [What&rsquo;s next?](#whats-next)
<!-- TOC -->

## Inspiration and Context

This blog is heavily inspired by [Aditya Singh - Codes](https://www.youtube.com/@AdityaSinghCodes) YouTube video "Debug & Monitor Next.js Apps with Grafana Loki, Prometheus, Zipkin," which provides an excellent modern blueprint for monitoring a Next.js application.

{{< youtube GW5Va_O-5uQ >}}

Also, the thumbnail is inspired by [DECO*27](https://www.youtube.com/channel/UCGmO0S4S-AunjRdmxA6TQYg) YouTube video "モニタリング" (Monitaringu, Monitoring, quite fitting for today topic).

{{< youtube kbNdx0yqbZE >}}

With those credits out of the way, let's stop guessing what our code is doing and start knowing for sure.

## Why Do We Need Instrumentation?

Imagine you connect to your daily meeting on a Monday, and you are told that a critical route in production is broken. All the reporter has is this terrifying screenshot:

![screenshot of a production application blank page](/uploads/2025-10-25-large-software-projects/2025-10-29-16-25-53.png)

This scenario raises two immediate, massive problems for any dev:

1.  **Reactive Troubleshooting:** You only know there was a problem when a user (or worse, a client) actually raises a support ticket. You are always playing defense.
2.  **Debugging Blindly:** Without a centralized logging system, trying to reproduce this bug based on a single blank screenshot is nearly impossible. You have no context, no server state, and no stack trace.

The solution to move from reactive guessing to proactive management is **Instrumentation**. This is the process of integrating specific code into your application to collect operational data, providing the deep visibility needed to understand performance, reliability, and user behavior.

### How Instrumentation Works

The process is generally broken down into three logical steps:

1.  **Data Collection (The Application):** We modify our Next.js application to include specialized code that collects various kinds of data about the app's internal state and the host server environment.
2.  **Data Storage (The Telemetry Backends):** The collected data is shipped out of the application process and sent to a corresponding, optimized telemetry backend (a database designed specifically for logs, metrics, or traces).
3.  **Visualization (The Dashboard):** We use a powerful visualization tool (like [Grafana](https://grafana.com/)) to pull the stored data from the backends and present it in cohesive, readable dashboards.

### The Three Pillars of Telemetry Data

Instrumentation typically focuses on collecting three distinct kinds of data, often referred to as "The Three Pillars" of observability:

![The Three Pillars of observability](/uploads/2025-10-25-large-software-projects/Figure_Pillars_of_Observability_3f46671e09-4207991358.png)

| Kind of data being collected | Definition                                                                                      | Telemetry backend (where is stored)                           |
|:-----------------------------|:------------------------------------------------------------------------------------------------|:--------------------------------------------------------------|
| **Logs**                     | Text records of specific events or states happening within the application.                     | [Loki](https://grafana.com/docs/loki/latest/)                 |
| **Metrics**                  | Numerical, aggregate data points (e.g., CPU usage, request latency counts, memory consumption). | [Prometheus](https://prometheus.io/)                          |
| **Traces**                   | The complete journey of a single request as it flows through the various parts of your system.  | [Zipkin](https://zipkin.io/) (it's also a visualization tool) |

For this tutorial, we will be using the industry-leading tools listed above. While there are alternatives, this combination is robust, battle-tested, and popular.

## How to Manage All These Telemetry Backends?

Whenever you are put into a scenario where you have many services that need to communicate with each other over a single network, you should immediately think of Docker and Docker Compose.

- [Docker](https://www.docker.com/) is a tool that allows you to containerize applications, ensuring they run the same way everywhere.
  {{< youtube DQdB7wFEygo >}}
- [Docker Compose](https://docs.docker.com/compose/) is an orchestration tool that allows us to define and run multi-container Docker applications.
  {{< youtube DM65_JyGxCo >}}

In our monitoring context, we need five separate services (Grafana, Loki, Prometheus, Zipkin, and OpenTelemetry Collector) to communicate with each other over a single network. Docker Compose is the perfect blueprint for defining this monitoring ecosystem simply and repeatably.

In following blogs, we will approach the `docker-compose.yml` file which defines how our entire local monitoring stack looks.

## The Architectural Trade-Off: OTel Purity vs. Pragmatic Simplicity

When discussing modern observability, the OpenTelemetry (OTel) Collector is often hailed as the universal answer. And for good reason—it simplifies large-scale architectures by providing a powerful, centralized pipeline for all telemetry data.

**The Industry Recommended Architecture (OTel Centric):**

Ideally, every data signal (logs, metrics, and traces) would pass from the Application to the [OTel Collector](https://opentelemetry.io/docs/collector/), which would then process and route them to the appropriate backend.

1.  **Single Integration Point:** Your application only needs to connect to one OTLP endpoint.
2.  **Decoupling:** Your app code doesn't need to know the specifics of Prometheus or Loki.
3.  **Flexibility & Processing:** The collector handles sampling, batching, transformation, and load balancing.

![diagram monitoring architecture industry recommendation](/uploads/2025-10-25-large-software-projects/industry-recommendation.png)

However, as an experienced developer, I've learned that the **ideal** architecture often sacrifices simplicity and maintainability in favor of philosophical purity.

After wrestling to replicate this exact OTel-centric setup for the Next.js Node application, I hit two pragmatic roadblocks that justified simplifying the plan:

1.  **Loki OTLP Maturity:** While OTLP support in Loki is improving, configuring the OTLP receiver for logs proved cumbersome compared to existing, dedicated transport libraries.
    *   **Pragmatic Solution:** We will bypass OTel for logs and use a proven, direct library: [pino-loki](https://github.com/Julien-R44/pino-loki).
2.  **Prometheus Metrics Collection:** The official OTel NodeSDK doesn't automatically collect some key Node.js runtime metrics (like CPU usage, heap size, and specific version info) required by standard Grafana Prometheus dashboards.
    *   **Pragmatic Solution:** Fighting with custom dashboard JSON or hunting for compatible OTel metric libraries is a time sink. The simplest path is to use the industry-standard Node.js Prometheus library: [prom-client](https://github.com/siimon/prom-client), which exports all these metrics automatically via a standard HTTP endpoint that Prometheus can easily scrape.

Therefore, our chosen **Practical Architecture** will use a hybrid approach that leans on established, simple tools where OTel integration is complex, reserving the OTel Collector for what it does best: **Traces**.

![diagram monitoring architecture industry recommendation](/uploads/2025-10-25-large-software-projects/practical-approach-diagram.png)

| Component          | Industry Ideal (Pure OTel) | Practical Approach (Hybrid)                    | Justification                                                      |
|:-------------------|:---------------------------|:-----------------------------------------------|:-------------------------------------------------------------------|
| **OTEL Collector** | Handles all signals        | **Traces only**                                | Focus on reliable, easy trace handling.                            |
| **Logs**           | App → OTel → Loki          | App → **Direct (pino-loki)** → Loki            | Simpler setup, superior library support.                           |
| **Metrics**        | App → OTel → Prometheus    | Prometheus **← Scrapes /api/metrics** ← NextJS | Leverages `prom-client` for rich, automatic runtime metrics.       |
| **Visualization**  | Grafana for everything     | **Grafana (Metrics & Logs) + Zipkin (Traces)** | Using Zipkin's purpose-built trace UI for optimal troubleshooting. |

This hybrid model gives us full observability with maximum simplicity.

## What&rsquo;s next?

In the next post, we will get our hands dirty with code, writing the foundational boilerplate code to initialize the monitoring pillars and prepare our app to start collecting data.

**Next Blog**: [Large Software Projects: Collecting Metrics](/en/blog/2025-10-26-large-software-projects)