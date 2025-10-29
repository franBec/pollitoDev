---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Recolección de Trazas"
date: 2025-10-28
description: "OTel Collector y Zipkin"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-28-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
* [Código Fuente](#código-fuente)
* [El Foco del Post: Los Traces](#el-foco-del-post-los-traces)
* [Librerías OpenTelemetry](#librerías-opentelemetry)
* [Instrumentación en Next.js: Registrando OpenTelemetry](#instrumentación-en-nextjs-registrando-opentelemetry)
* [Configuración de Variables de Entorno OTel](#configuración-de-variables-de-entorno-otel)
    * [Configurando el Ambiente Host](#configurando-el-ambiente-host)
* [Configuración del OTel Collector](#configuración-del-otel-collector)
* [Definir OTel Collector y Zipkin](#definir-otel-collector-y-zipkin)
* [Visualización de Traces con Zipkin](#visualización-de-traces-con-zipkin)
* [Resolviendo el Error de Producción](#resolviendo-el-error-de-producción)
* [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-28](https://github.com/franBec/tas/tree/feature/2025-10-28)

## El Foco del Post: Las Trazas

Nos vamos a enfocar en implementar la recolección de *trazas*:

![blog focus](/uploads/2025-10-28-large-software-projects/blog-focus.png)

## Librerías OpenTelemetry

Necesitamos instalar los siguientes paquetes:

*   **`@vercel/otel`:** Esta es la librería oficial de distribución de OpenTelemetry de Vercel para Next.js, simplificando la creación de *tracing* y *spans* dentro del *framework*.
*   **`@opentelemetry/sdk-logs` / `@opentelemetry/api-logs` / `@opentelemetry/instrumentation`:** Los componentes fundamentales de OpenTelemetry necesarios para armar el ecosistema de *tracing* y *logging*.

Para instalarlos, ejecutá `pnpm add @vercel/otel @opentelemetry/sdk-logs @opentelemetry/api-logs @opentelemetry/instrumentation`.

## Instrumentación en Next.js: Registrando OpenTelemetry

En el mismo `src/instrumentation.ts` donde inicializamos el *logger* en el [post anterior](/es/blog/2025-10-27-large-software-projects/#instrumentación-en-nextjs-inicializando-el-logger), también vamos a registrar OpenTelemetry.

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
                host: "http://localhost:3100", // Connects to the loki container via localhost:3100
                batching: true,
                interval: 5,
                labels: { app: "next-app" }, // Crucial label for querying in Grafana
            })
        );

        //otel initialization
        registerOTel();
    }
}
```

## Configuración de Variables de Entorno OTel

Para que la instrumentación de OpenTelemetry sepa a dónde enviar sus datos y cómo etiquetarlos, necesitamos configurar variables de entorno específicas.

Dado que estamos ejecutando la aplicación Next.js *fuera* de Docker, estas variables deben definirse en el ambiente de la máquina *host* donde se inicia el proceso de Next.js.

### Configurando el Ambiente Host

1.  **Configuración de Ejecución/Debug del IDE:** Si usás un IDE como [JetBrains WebStorm](https://www.jetbrains.com/webstorm/), podés agregar estas variables directamente en las opciones de configuración de Run/Debug:

    Establecé la siguiente cadena de entorno: `OTEL_LOG_LEVEL=info;OTEL_SERVICE_NAME="next-app"`

    ![Run Debug configuration options](/uploads/2025-10-28-large-software-projects/2025-10-27-23-18-28.png)

    *Tip:* Es súper recomendable guardar todas tus variables de entorno de desarrollo no sensibles en un archivo de texto (ej., `src/resources/dev/env-dev.txt`) para que los nuevos desarrolladores puedan simplemente copiarlas y pegarlas en la configuración de su IDE.

2.  **Archivo `.env` del Proyecto:** Usamos el archivo `.env` del proyecto para referenciar estas variables de entorno, haciéndolas accesibles para el proceso de *build* y *runtime* de Next.js.

   ```env
   # OTel Configuration
   OTEL_LOG_LEVEL="${OTEL_LOG_LEVEL}"
   OTEL_SERVICE_NAME="${OTEL_SERVICE_NAME}"
   ```

## Configuración del OTel Collector

El *tracing* es gestionado por OpenTelemetry (OTel). Nuestra app Next.js, a través de `@vercel/otel`, envía datos de *trace* usando el protocolo OTLP a un servicio intermediario: el OpenTelemetry Collector.

El *Collector* actúa como un *hub* central, recibiendo los datos, procesándolos (como agruparlos eficientemente) y luego dirigiéndolos al *backend* final—en este caso, Zipkin.

La configuración para el *collector* está en `src/resources/dev/monitoring/otel-collector-config.yml`:

```yml
# Based of https://github.com/adityasinghcodes/nextjs-monitoring/blob/main/otel-collector-config.yml
# Receivers configuration - defines how the collector receives telemetry data
receivers:
  # OpenTelemetry Protocol (OTLP) receiver configuration
  otlp:
    protocols:
      # gRPC endpoint for receiving OTLP data
      grpc:
        endpoint: "0.0.0.0:4317"
      # HTTP endpoint for receiving OTLP data
      http:
        endpoint: "0.0.0.0:4318"

# Processors configuration - defines how telemetry data is processed
processors:
  # Batch processor aggregates data before exporting
  batch:
    timeout: 1s # Maximum time to wait before sending a batch
    send_batch_size: 1024 # Maximum number of spans to include in a batch

# Exporters configuration - defines where telemetry data is sent
exporters:
  # Zipkin exporter configuration
  zipkin:
    endpoint: "http://zipkin:9411/api/v2/spans" # Zipkin server endpoint (using the service name 'zipkin')
    format: proto # Use protobuf format for data
  # Debug exporter for troubleshooting
  debug:
    verbosity: detailed # Maximum verbosity level for debugging

# Extensions configuration - additional collector functionality
extensions:
  health_check: # Enables health checking endpoint
  pprof: # Enables profiling endpoint
    endpoint: :1888
  zpages: # Enables diagnostic pages
    endpoint: :55679

# Service configuration - ties together all the components
service:
  extensions: [pprof, zpages, health_check] # Enable all configured extensions
  pipelines:
    # Traces pipeline configuration
    traces:
      receivers: [otlp] # Use OTLP receiver
      processors: [batch] # Process with batch processor
      exporters: [zipkin, debug] # Export to Zipkin and debug
```

## Definir OTel Collector y Zipkin

En el mismo Docker Compose que usamos para definir Loki en el [post anterior](/es/blog/2025-10-27-large-software-projects/#definir-el-servicio-docker-de-loki), también definiremos el OTel Collector y Zipkin.

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

  otel-collector:
    container_name: otel-collector
    image: otel/opentelemetry-collector:0.115.0
    restart: always
    command: ["--config=/etc/otel-collector-config.yml"]
    volumes:
      - ./otel-collector-config.yml:/etc/otel-collector-config.yml
    ports:
      - "4317:4317" # OTLP gRPC receiver
      - "4318:4318" # OTLP HTTP receiver
      - "8888:8888" # Prometheus metrics exposed by collector
      - "8889:8889" # Prometheus exporter metrics
      - "13133:13133" # Health check extension
      - "55679:55679" # zPages extension
    networks:
      - monitoring

  zipkin:
    container_name: zipkin
    image: openzipkin/zipkin:3.4.2
    ports:
      - "9411:9411"
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

## Visualización de Traces con Zipkin

Asegurate de que tu motor Docker (tipo [Docker Desktop](https://www.docker.com/products/docker-desktop/)) esté corriendo en segundo plano.

1.  **Levantá el Stack:**
    ```bash
    docker-compose -f src/resources/dev/monitoring/docker-compose.yml up -d
    ```
2.  **Iniciá la App:** Ejecutá el *script* de inicio de tu aplicación Next.js en la máquina *host*.

Para ver las *trazas*:

1.  Andá a la UI de Zipkin: [http://localhost:9411/zipkin/](http://localhost:9411/zipkin/)
2.  En la esquina superior izquierda, hacé clic en el botón rojo "+" y seleccioná el Service Name `next-app`. Luego hacé clic en **RUN QUERY**.

Verás *spans* para todas las solicitudes recientes, incluidas las generadas por Prometheus *scrapeando* el *endpoint* `/api/metrics`.

![zipkin](/uploads/2025-10-28-large-software-projects/screencapture-localhost-9411-zipkin-2025-10-29-15_59_09.png)

## Resolviendo el Error de Producción

Volvamos a nuestro problema original: la pantalla de producción en blanco. Vamos a recrear el escenario con un componente que se rompe a propósito.

Creá una ruta simple `/route-with-error` con lógica rota:

```tsx
export const dynamic = "force-dynamic";

async function getData() {
    const res = await fetch("https://httpbin.org/status/500");
    return res.json();
}

export default async function RouteWithError() {
    const data = await getData();

    return (
        <div className="flex flex-col gap-4">
            <p>
                The data is: <strong>{JSON.stringify(data)}</strong>
            </p>
        </div>
    );
}
```

Si visitás [http://localhost:3000/route-with-error](http://localhost:3000/route-with-error) en un *build* de producción, obtendrás la temida página en blanco sin ninguna indicación de qué sucedió.

![screenshot of a production application blank page](/uploads/2025-10-25-large-software-projects/2025-10-29-16-25-53.png)

Sin embargo, al revisar Zipkin, la historia es completamente diferente:

![zipkin detecing route with error](/uploads/2025-10-28-large-software-projects/screencapture-localhost-9411-zipkin-2025-10-29-16_03_30.png)

Si hacemos clic en el *trace*, encontramos los detalles exactos:

![zipkin details route with error](/uploads/2025-10-28-large-software-projects/screencapture-localhost-9411-zipkin-traces-8308ed98a45c27ef53e9c6e974227907-2025-10-29-16_02_45.png)

A partir de esta única *traza*, sabemos la ruta exacta, el tipo exacto de error (`Unexpected end of JSON input`) y la causa exacta (`fetch get https://httpbin.org/status/500`). Podemos saltar inmediatamente al código correspondiente y *fixear* el *bug*.

## ¿Qué Sigue?

Hemos establecido un *stack* de monitoreo local y robusto utilizando herramientas estándar de la industria. El siguiente paso obvio es desplegar esta misma estrategia de monitoreo en nuestro entorno VPS de producción, lidiando con los desafíos de los *hostnames* externos, el almacenamiento persistente y la autenticación.