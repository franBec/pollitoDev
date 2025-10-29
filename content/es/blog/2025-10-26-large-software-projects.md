---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Recolección de Métricas"
date: 2025-10-26
description: "Prometheus y Grafana"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-26-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [El Foco del Post: Las Métricas](#el-foco-del-post-las-métricas)
  * [Prom-client](#prom-client)
  * [La Separación de Runtime: Un Requisito de Next.js](#la-separación-de-runtime-un-requisito-de-nextjs)
  * [Instrumentación en Next.js: Inicializando Prom-client](#instrumentación-en-nextjs-inicializando-prom-client)
    * [Notas del Dev de Infraestructura](#notas-del-dev-de-infraestructura)
  * [Prometheus](#prometheus)
    * [1. Exponer el Endpoint de Métricas](#1-exponer-el-endpoint-de-métricas)
    * [2. Configurar Prometheus para Scrapear el Endpoint](#2-configurar-prometheus-para-scrapear-el-endpoint)
    * [3. Definir los Servicios de Docker para Grafana y Prometheus](#3-definir-los-servicios-de-docker-para-grafana-y-prometheus)
  * [Configuración del Dashboard de Grafana](#configuración-del-dashboard-de-grafana)
    * [Agregar la Fuente de Datos Prometheus](#agregar-la-fuente-de-datos-prometheus)
    * [Arreglando el Panel de Versión de Node.js](#arreglando-el-panel-de-versión-de-nodejs)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-26](https://github.com/franBec/tas/tree/feature/2025-10-26)

## El Foco del Post: Las Métricas

En la parte anterior, establecimos nuestra arquitectura de monitoreo híbrida. Ahora sí, es hora de meter el primer pilar: las **Métricas**.

Nos enfocaremos en implementar el *pipeline* completo para la data numérica, desde la recolección hasta la visualización:

![blog focus](/uploads/2025-10-26-large-software-projects/blog-focus.png)

Esto involucra:

1.  La integración de **`prom-client`** dentro de la Aplicación Next.js.
2.  El scraper/backend de **Prometheus**.
3.  La capa de visualización de métricas de **Grafana**.

¡Empecemos!

## Prom-client

[Prom-client](https://github.com/siimon/prom-client) es la librería establecida para generar métricas en el formato que usa Prometheus. Con solo llamar una función simple, obtenemos *insight* automático sobre la CPU, la memoria, la recolección de basura (*garbage collection*), data que suele ser un dolor de cabeza recolectar con métodos puros de OpenTelemetry.

Para instalarla, ejecutá `pnpm add prom-client`.

## La Separación de Runtime: Un Requisito de Next.js

Algo clave a tener en cuenta en Next.js es que partes de tu aplicación pueden correr en ambientes distintos. ¡Ojo con eso!

*   **Node.js Runtime:** El ambiente de servidor tradicional, con todas las funciones. Aquí es donde deben ejecutarse las herramientas de monitoreo a nivel de sistema, como `prom-client`.
*   **Edge Runtime:** Un ambiente liviano optimizado para velocidad de red. **No soporta** las APIs completas de Node.js.

Debemos chequear explícitamente el ambiente `nodejs` para evitar *crasheos* de *runtime* al importar e inicializar nuestras herramientas de monitoreo.

## Instrumentación en Next.js: Inicializando Prom-client

Next.js utiliza el archivo especial `src/instrumentation.ts` para ejecutar código de inicialización una sola vez cuando se inicia una nueva instancia del servidor. Este es el lugar perfecto para registrar nuestro sistema de métricas.

Vamos a inicializar el registro de métricas y hacerlo disponible globalmente usando `globalThis.metrics`.

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

### Notas del Dev de Infraestructura

*   **Alcance Global:** Usamos `globalThis` para compartir el `prometheusRegistry` entre módulos, ya que `instrumentation.ts` corre fuera de la ejecución estándar del módulo.
*   **Excepción de Linting:** Debido a las declaraciones necesarias de la variable `globalThis`, este archivo va a chocar con las reglas de *linting*. Agregá `src/instrumentation.ts` a la lista de ignorados de `eslint.config.mjs`.
*   **Excepción para Testing:** Como es un archivo de infraestructura, no es adecuado para pruebas unitarias. Agregá `src/instrumentation.ts` a la lista de exclusión de cobertura de pruebas de `vitest.config.mts`.

## Prometheus

[Prometheus](https://prometheus.io/) funciona bajo un sistema *pull*: no espera que tu aplicación le mande datos; periódicamente *scrapea* data desde un *endpoint* HTTP dedicado que vos exponés.

### 1. Exponer el Endpoint de Métricas

Creamos una ruta API simple `api/metrics` que usa nuestro registro definido globalmente para exponer la data de métricas recolectada en el formato de texto crudo que Prometheus espera.

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

### 2. Configurar Prometheus para Scrapear el Endpoint

En `src/resources/dev/monitoring/prometheus.yml`, definimos un trabajo de *scraping* que le dice al contenedor de Prometheus dónde encontrar el *endpoint* de la aplicación.

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

### 3. Definir los Servicios de Docker para Grafana y Prometheus

Usamos Docker Compose para definir el *backend* de Prometheus y la capa de visualización de Grafana.

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

## Configuración del Dashboard de Grafana

Asegurate de que tu motor Docker (tipo [Docker Desktop](https://www.docker.com/products/docker-desktop/)) esté corriendo en segundo plano.

1.  **Levantá el Stack:**
    ```bash
    docker-compose -f src/resources/dev/monitoring/docker-compose.yml up -d
    ```
2.  **Iniciá la App:** Ejecutá el *script* de inicio de tu aplicación Next.js en la máquina *host*.

Andá a [http://localhost:3001/](http://localhost:3001/) e iniciá sesión usando las credenciales definidas en el `docker-compose.yml` (`admin_user`/`admin_password`).

### Agregar la Fuente de Datos Prometheus

1.  Navegá a [http://localhost:3001/connections/datasources/new](http://localhost:3001/connections/datasources/new) y seleccioná **Prometheus**.
    ![new Prometheus data source](/uploads/2025-10-26-large-software-projects/2025-10-27-18-59-53.png)
2.  Establecé la "Prometheus server URL" a `http://prometheus:9090` (Usamos el nombre del servicio Docker, `prometheus`).
    ![Prometheus server URL](/uploads/2025-10-26-large-software-projects/2025-10-27-19-04-24.png)
3.  Desplazate hacia abajo y hacé clic en **"Save & Test."** Deberías ver la confirmación: "Successfully queried the Prometheus API."
4.  **Importar un Dashboard:** Andá a [http://localhost:3001/dashboard/import](http://localhost:3001/dashboard/import). Vamos a usar el [Node.js Application Dashboard](https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/) de la comunidad (ID 11159).
5.  Ingresá el ID del Dashboard **11159**.
6.  Arriba del botón Importar, seleccioná la fuente de datos Prometheus que acabás de crear en el *dropdown*.
7.  Hacé clic en **Import**.

![pick Prometheus data source](/uploads/2025-10-26-large-software-projects/screencapture-localhost-3001-dashboard-import-2025-10-27-19_09_31.png)

Ahora tenés un *dashboard* potente que muestra métricas automáticas como uso de CPU, consumo de memoria, actividad de recolección de basura y conteos de solicitudes. ¡Genial!

![dashboard](/uploads/2025-10-26-large-software-projects/screencapture-localhost-3001-d-PTSqcpJWk-nodejs-application-dashboard-2025-10-27-19_11_12.png)

### Arreglando el Panel de Versión de Node.js

Un problema común con este *dashboard* importado es que el panel de "Node.js version" suele aparecer vacío. Vamos a arreglar esta pequeña molestia:

1.  Hacé clic en los tres puntos verticales en la esquina superior derecha de ese panel vacío y seleccioná **Edit**.
    ![edit panel](/uploads/2025-10-26-large-software-projects/2025-10-28-23-06-10.png)
2.  En el "Query Editor" (área "Metric browser"), limpiá la consulta por defecto e ingresá el nombre de la métrica `nodejs_version_info`.
3.  En el panel de la derecha, debajo de "Value options" -> "Calculation," configuralo a `Last *`.
4.  Debajo de "Value options" -> "Fields," ahora deberías poder seleccionar la cadena de la versión.
5.  Hacé clic en "Run queries" para confirmar que aparece la data.
6.  Hacé clic en el botón "Save Dashboard" (arriba a la derecha).

![Node.js version fix](/uploads/2025-10-26-large-software-projects/2025-10-27-19-19-22.png)

## ¿Qué Sigue?

Hemos implementado con éxito el *pipeline* de métricas, dándonos un *insight* numérico profundo sobre la salud y el rendimiento de nuestra aplicación.

Sin embargo, un *dashboard* lleno de gráficos solo nos dice **qué** está pasando (ej., "el CPU subió un 50%"). No nos dice **por qué** (ej., "El pico fue causado por una solicitud de usuario específica que disparó una consulta lenta a la base de datos").

En el próximo post, vamos a configurar el *logging* estructurado con `pino-loki`.

**Próximo Post**: [Proyectos de Software Grandes: Recolección de Logs](/es/blog/2025-10-27-large-software-projects)
