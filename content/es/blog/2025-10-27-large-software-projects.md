---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Recolección de Logs"
date: 2025-10-27
description: "Loki y Grafana"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-27-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [El Foco del Post: Los Logs](#el-foco-del-post-los-logs)
  * [Pino y pino-loki](#pino-y-pino-loki)
  * [Instrumentación en Next.js: Inicializando el Logger](#instrumentación-en-nextjs-inicializando-el-logger)
  * [Demostración del Logger](#demostración-del-logger)
    * [1. Ruta de Éxito](#1-ruta-de-éxito)
    * [2. Ruta de Fallo](#2-ruta-de-fallo)
  * [Configuración de Loki](#configuración-de-loki)
  * [Definir el Servicio Docker de Loki](#definir-el-servicio-docker-de-loki)
  * [Configuración del Dashboard de Grafana](#configuración-del-dashboard-de-grafana)
    * [Agregar la Fuente de Datos Loki](#agregar-la-fuente-de-datos-loki)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-27](https://github.com/franBec/tas/tree/feature/2025-10-27)

## El Foco del Post: Los Logs

Nos enfocaremos en implementar la recolección de *logs*:

![blog focus](/uploads/2025-10-27-large-software-projects/blog-focus.png)

## Pino y pino-loki

- [pino](https://getpino.io/#/) es un *logger* de JavaScript con un *overhead* bajísimo (casi nada).
- [pino-loki](https://github.com/Julien-R44/pino-loki) es una capa de transporte que toma los *logs* formateados y los envía directamente a nuestra instancia de Loki que está corriendo.

Para instalarlos, ejecutá `pnpm add pino pino-loki`.

## Instrumentación en Next.js: Inicializando el Logger

En el mismo `src/instrumentation.ts` donde declaramos el registro de métricas en el [post anterior](/es/blog/2025-10-26-large-software-projects/#instrumentación-en-nextjs-inicializando-prom-client), también vamos a inicializar el *logger* y hacerlo disponible globalmente usando `globalThis.logger`.

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

## Demostración del Logger

Ahora que el *logger* está inicializado globalmente, vamos a crear dos rutas API sencillas para demostrar el *logging* exitoso y el *logging* de errores. Nos aseguramos de que estas rutas usen explícitamente el *runtime* `nodejs` para garantizar el acceso a la configuración de instrumentación.

Vamos a definir `/api/hello-world` (siempre 200) y `/api/something-is-wrong` (siempre 500).

### 1. Ruta de Éxito

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

### 2. Ruta de Fallo

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

## Configuración de Loki

Para que Loki reciba y almacene correctamente los *logs* enviados por `pino-loki`, necesitamos proporcionarle un archivo de configuración que dicte el almacenamiento, la retención y los *endpoints*.

Ponemos esta configuración en `src/resources/dev/monitoring/loki-config.yml`:

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
# NOTA: Esta configuración es adecuada solo para desarrollo/testing.
# Para producción, deberías:
# 1. Habilitar la autenticación
# 2. Usar almacenamiento persistente en lugar de filesystem
# 3. Usar un kvstore externo (como etcd o consul) en lugar de inmemory
# 4. Usar un directorio persistente apropiado en lugar de /tmp
```

## Definir el Servicio Docker de Loki

En el mismo Docker Compose que usamos para definir el *backend* de Prometheus y la capa de visualización de Grafana en el [post anterior](/es/blog/2025-10-26-large-software-projects/#3-definir-los-servicios-de-docker-para-grafana-y-prometheus), también definiremos Loki.

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

## Configuración del Dashboard de Grafana

Asegurate de que tu motor Docker (tipo [Docker Desktop](https://www.docker.com/products/docker-desktop/)) esté corriendo en segundo plano.

1.  **Levantá el Stack:**
    ```bash
    docker-compose -f src/resources/dev/monitoring/docker-compose.yml up -d
    ```
2.  **Iniciá la App:** Ejecutá el *script* de inicio de tu aplicación Next.js en la máquina *host*.

    *Acordate de pegar un par de requests a las rutas `/api/hello-world` y `/api/something-is-wrong` para generar data de logs.*

Andá a [http://localhost:3001/](http://localhost:3001/) e iniciá sesión usando las credenciales definidas en el `docker-compose.yml` (`admin_user`/`admin_password`).

### Agregar la Fuente de Datos Loki

1.  Andá a `http://localhost:3001/connections/datasources/new` y seleccioná **Loki**.
    ![new data source](/uploads/2025-10-27-large-software-projects/screencapture-localhost-3001-connections-datasources-new-2025-10-29-12_25_51.png)
2.  Establecé la "Connection URL" a `http://loki:3100` (Usamos el nombre del servicio Docker, `loki`).
    ![loki connection url](/uploads/2025-10-27-large-software-projects/2025-10-27-20-28-07.png)
3.  Desplazate hacia abajo y hacé clic en "Save & Test." Deberías ver "Data source successfully connected." (Fuente de datos conectada con éxito).
4.  Andá a [http://localhost:3001/dashboards](http://localhost:3001/dashboards) y seleccioná el *dashboard* que creamos en el post anterior.
    ![Dashboards](/uploads/2025-10-27-large-software-projects/screencapture-localhost-3001-dashboards-2025-10-29-12_26_14.png)
5.  Hacé clic en **Edit** (arriba a la derecha) para entrar en modo Edición.
    ![Edit dashboard](/uploads/2025-10-27-large-software-projects/2025-10-27-20-33-29.png)
6.  Hacé clic en el *dropdown* "Add" y seleccioná "Visualization."
    ![Add visualization](/uploads/2025-10-27-large-software-projects/2025-10-27-20-34-04.png)
7.  Seleccioná **Loki** como la fuente de datos.
8.  En los "label filters," seleccioná el *label* `app` y el valor `next-app` (este es el *label* que definimos en nuestro `instrumentation.ts`).
    *   *Nota:* Si estos valores no están disponibles, asegurate de que ejecutaste los servicios `docker-compose` y realizaste un par de requests a las rutas API para generar data.
9.  En "operations," borrá la operación por defecto y seleccioná **Add JSON Parser** (ya que `pino` genera *logs* JSON).
10. En la barra lateral derecha, cambiá el tipo de "Visualization" a **Logs**.
11. Hacé clic en "Run query" para confirmar que la data aparece.
12. Guardá el *Dashboard*.

![Add loki data source](/uploads/2025-10-27-large-software-projects/2025-10-27-20-36-56.png)

Ahora podés arrastrar y redimensionar el nuevo panel de *logs*.

¡Felicitaciones! Tenés un *dashboard* de monitoreo unificado que muestra tanto métricas como *logs* de la aplicación. (¡No te olvides de guardar el *dashboard*!).

![Final Dashboard](/uploads/2025-10-27-large-software-projects/screencapture-localhost-3001-d-PTSqcpJWk-nodejs-application-dashboard-2025-10-29-12_32_41.png)

## ¿Qué Sigue?

En el próximo post, vamos a configurar el *tracing* con un *collector* OTel y Zipkin.

**Próximo Post**: [Proyectos de Software Grandes: Recolección de Trazas](/es/blog/2025-10-28-large-software-projects)