---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Monitoreando tu App en Producción"
date: 2025-11-03
description: "Monitoreo para Next.js en Coolify"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-11-03-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [Prerrequisitos: Haciendo la Transición a Producción](#prerrequisitos-haciendo-la-transición-a-producción)
  * [Paso 1: Preparar tu App Next.js para Producción](#paso-1-preparar-tu-app-nextjs-para-producción)
    * [Actualizar instrumentation.ts para Variables de Entorno](#actualizar-instrumentationts-para-variables-de-entorno)
    * [(Opcional) Agregar Health Check](#opcional-agregar-health-check)
    * [Desplegar tu App Next.js Actualizada](#desplegar-tu-app-nextjs-actualizada)
  * [Paso 2: Crear el Stack de Monitoreo en Coolify](#paso-2-crear-el-stack-de-monitoreo-en-coolify)
    * [Crear el Servicio Docker Compose](#crear-el-servicio-docker-compose)
    * [Agregar la Configuración de Docker Compose (El Enfoque Monolítico)](#agregar-la-configuración-de-docker-compose-el-enfoque-monolítico)
    * [Conectar el Stack de Monitoreo a la Red de Coolify](#conectar-el-stack-de-monitoreo-a-la-red-de-coolify)
    * [Establecer Variables de Entorno para el Stack de Monitoreo](#establecer-variables-de-entorno-para-el-stack-de-monitoreo)
    * [Desplegar el Stack de Monitoreo](#desplegar-el-stack-de-monitoreo)
  * [Paso 3: Conectar la App Next.js al Stack de Monitoreo](#paso-3-conectar-la-app-nextjs-al-stack-de-monitoreo)
    * [Agregar Alias de Red a la App Next.js](#agregar-alias-de-red-a-la-app-nextjs)
    * [Agregar Variables de Entorno a la App Next.js](#agregar-variables-de-entorno-a-la-app-nextjs)
    * [Reiniciar los Servicios](#reiniciar-los-servicios)
  * [Paso 4: Verificación y Visualización](#paso-4-verificación-y-visualización)
    * [Testear la Comunicación entre Servicios](#testear-la-comunicación-entre-servicios)
    * [Verificar el Endpoint de Salud (Opcional)](#verificar-el-endpoint-de-salud-opcional)
  * [Paso 5: Configurar el Acceso a Grafana](#paso-5-configurar-el-acceso-a-grafana)
    * [Exponer Grafana con un Dominio](#exponer-grafana-con-un-dominio)
    * [Acceder a Grafana y Configurar Fuentes de Datos](#acceder-a-grafana-y-configurar-fuentes-de-datos)
  * [Troubleshooting](#troubleshooting)
    * [Los Servicios No se Pueden Comunicar](#los-servicios-no-se-pueden-comunicar)
    * [Prometheus Muestra el Objetivo Caído (Target Down)](#prometheus-muestra-el-objetivo-caído-target-down)
  * [¿Qué Sigue?](#qué-sigue)
    * [1. Habilitar la Autenticación en Loki](#1-habilitar-la-autenticación-en-loki)
    * [2. Unificar la Visualización de Traces](#2-unificar-la-visualización-de-traces)
    * [3. Transición del Foco de la Serie: Autenticación](#3-transición-del-foco-de-la-serie-autenticación)
<!-- TOC -->ponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-11-03](https://github.com/franBec/tas/tree/feature/2025-11-03)

## Prerrequisitos: Haciendo la Transición a Producción

En nuestros posts anteriores, armamos un *stack* de monitoreo local usando Docker Compose. El objetivo ahora es levantar todo este sistema—Métricas, Logs y Traces—y desplegarlo junto con nuestra aplicación Next.js en nuestro VPS de producción, manejado por **Coolify**.

Para que esto salga bien, dependemos del laburo de instrumentación que ya completamos:

*   App Next.js desplegada en un proyecto Coolify ([Proyectos de Software Grandes: Configurando CI/CD y Despliegue](/en/blog/2025-10-16-large-software-projects))
*   Inicialización de `prom-client` en Next.js ([Instrumentación en Next.js: Inicializando Prom-client](/en/blog/2025-10-26-large-software-projects/#nextjs-instrumentation-initializing-prom-client)) y el *endpoint* de Métricas ([Exponer el Endpoint de Métricas](/en/blog/2025-10-26-large-software-projects/#1-exponer-el-endpoint-de-métricas))
*   Inicialización de `loki` en Next.js ([Instrumentación en Next.js: Inicializando el Logger](/en/blog/2025-10-27-large-software-projects/#nextjs-instrumentation-initializing-the-logger))
*   Registro de OTel en Next.js ([Instrumentación en Next.js: Registrando OpenTelemetry](/en/blog/2025-10-28-large-software-projects/#nextjs-instrumentation-registrando-opentelemetry))

## Paso 1: Preparar tu App Next.js para Producción

### Actualizar instrumentation.ts para Variables de Entorno

Usamos valores por defecto lógicos (`|| "http://localhost:3100"`) para el desarrollo local, pero le damos prioridad a las variables de entorno (`process.env.*`) para cuando estamos en producción.

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

### (Opcional) Agregar Health Check

Un simple *endpoint* de chequeo de salud es clave para verificar que todos nuestros sistemas de monitoreo se hayan inicializado correctamente y que nuestras variables de entorno se estén leyendo bien.

**Nota sobre Seguridad:** Si bien exponer este *endpoint* es útil para debuguear, generalmente se recomienda restringir el acceso a los *endpoints* de diagnóstico en producción y evitar exponer datos de configuración sensibles como las variables de entorno aquí.

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

### Desplegar tu App Next.js Actualizada

Hacé *commit* y *push* de estos cambios. Si estás usando la configuración estándar de CI/CD de Coolify, la aplicación se va a desplegar automáticamente, pero el monitoreo va a estar roto hasta que despleguemos el *stack* en el siguiente paso.

## Paso 2: Crear el Stack de Monitoreo en Coolify

### Crear el Servicio Docker Compose

1. Andá a tu **Proyecto** en Coolify.
2. Hacé clic en **+ Add Resource** (Agregar Recurso).
3. Seleccioná **Docker Compose**.
4. Llamémoslo `monitoring`.

![Coolify Project Resources](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-2025-11-03-15_32_16.png)

### Agregar la Configuración de Docker Compose (El Enfoque Monolítico)

Cuando desplegás *stacks* multiservicio complejos como este en herramientas como Coolify, suele ser más simple fusionar todos los archivos de configuración (`prometheus.yml`, `loki-config.yml`, etc.) directamente en el `docker-compose.yml` principal usando la sección `configs:`. Esto facilita un montón la gestión, ya que todo queda definido en un solo lugar.

Hacé clic en **"Edit Compose File"** y pegá esta configuración completa:

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

### Conectar el Stack de Monitoreo a la Red de Coolify

Todos los servicios tienen que vivir en la misma red de Docker para que la resolución de DNS funcione.

Asegurate de que la casilla **"Connect To Predefined Network"** (Conectar a Red Predefinida) esté tildada. Coolify conectará el *stack* a su red por defecto llamada `coolify`.

![Connect to Coolify Network](/uploads/2025-11-03-large-software-projects/2025-11-03-15-40-55.png)

### Establecer Variables de Entorno para el Stack de Monitoreo

Estas variables son principalmente para asegurar y configurar Grafana.

En la configuración del servicio `monitoring`, andá a la sección **Environment Variables** y agregá:

```env
GF_ADMIN_PASSWORD=your-secure-password
GF_ADMIN_USER=admin
GF_SECURITY_ADMIN_USER=admin
GF_SERVER_ROOT_URL=
```

![Environment variables](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-service-z84sso4w8w08o4wc4c4w8wko-environment-variables-2025-11-03-15_46_15.png)

### Desplegar el Stack de Monitoreo

Hacé clic en el botón **"Deploy"**. Los servicios van a arrancar.

**Nota:** Es común que los servicios aparezcan como "running (unhealthy)" (corriendo - no saludable). No te asustes. Esto no significa que el recurso esté fallando. Más info en [Coolify Docs &ldquo;Health checks&rdquo;](https://coolify.io/docs/knowledge-base/health-checks)

## Paso 3: Conectar la App Next.js al Stack de Monitoreo

Ahora nos aseguramos de que el contenedor de la aplicación sepa cómo encontrar los contenedores de monitoreo.

### Agregar Alias de Red a la App Next.js

En la configuración de Prometheus (el contenido de `prometheus_config` de arriba), instruimos a Prometheus a *scrapear* la app Next.js en **`next-app:3000`**. Esto significa que el contenedor de Next.js debe tener el *alias* de red `next-app`.

**¡Este es el paso clave que hace posible el *scraping* de Prometheus!** En la configuración de tu aplicación Next.js en Coolify, deslizate hasta la sección "Network" y agregá el *alias*: `next-app`.

![Network section](/uploads/2025-11-03-large-software-projects/2025-11-03-16-37-07.png)

### Agregar Variables de Entorno a la App Next.js

Finalmente, inyectamos las variables de entorno que le dicen a la aplicación Next.js dónde enviar sus *logs* y *traces*. Usamos los *aliases* de servicio definidos en el `docker-compose.yml` (`loki`, `otel-collector`).

En la configuración de tu **App Next.js** en Coolify, andá a **Environment Variables** y agregá:

```env
LOKI_HOST=http://loki:3100
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_LOG_LEVEL=info
OTEL_SERVICE_NAME=next-app
```

![next.js app environment variables](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-application-bsoswcgg44o8g0cogsk8c44o-environment-variables-2025-11-03-16_31_30.png)

### Reiniciar los Servicios

1. **Reiniciar la app Next.js** - Esto asegura que la aplicación tome las nuevas variables de entorno y el *alias* de red.
2. **Reiniciar el stack de monitoreo** - Esto asegura que los servicios de monitoreo recojan cualquier cambio pendiente.

Esperá a que ambos servicios se levanten.

## Paso 4: Verificación y Visualización

### Testear la Comunicación entre Servicios

Usá la terminal de la app Next.js en Coolify para verificar la conectividad de red con el *stack* de monitoreo:

```bash
# Test Loki
curl http://loki:3100/ready
# Debería devolver: ready

# Test Prometheus
curl http://prometheus:9090/-/healthy
# Debería devolver: Prometheus Server is Healthy.

# Test OTel Collector (se espera un 404 para la ruta raíz, indicando que está corriendo)
curl http://otel-collector:4318
# Debería devolver: 404 page not found
```

![test service communication](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-application-bsoswcgg44o8g0cogsk8c44o-terminal-2025-11-03-16_52_53.png)

### Verificar el Endpoint de Salud (Opcional)

Si implementaste el *endpoint* de salud opcional, chequealo: `https://tu-dominio/api/health`

Debería mostrar que las variables de entorno fueron recibidas correctamente:
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

## Paso 5: Configurar el Acceso a Grafana

### Exponer Grafana con un Dominio

Para que Grafana sea accesible de forma segura fuera del *proxy* de Coolify, lo exponemos a través de un subdominio dedicado con SSL.

1. En tu servicio `monitoring`, hacé clic en **Settings** (Configuración) del servicio Grafana.
   ![Seatch for Grafana settings](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-service-z84sso4w8w08o4wc4c4w8wko-2025-11-03-16_58_15.png)
2. Andá a la sección **Domains**. Ingresá el subdominio de monitoreo que querés (ej., `https://grafana.tudominio.com`) y Guardá. Coolify se encarga del ruteo de puertos necesario y arma el SSL con Let's Encrypt. ¡Un golazo!
   ![Grafana domain](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-service-z84sso4w8w08o4wc4c4w8wko-fc0w4g0g444swokscg4wo8k4-2025-11-03-17_06_24.png)

### Acceder a Grafana y Configurar Fuentes de Datos

1. Andá a tu nuevo dominio de Grafana (ej., `https://grafana.tudominio.com`).
2. Iniciá sesión con las credenciales definidas en las variables de entorno:
    * Username: `admin` (o el que configuraste en `GF_ADMIN_USER`)
    * Password: (el que configuraste en `GF_ADMIN_PASSWORD`)

Ahora podés configurar las fuentes de datos usando los *aliases* de servicio, tal como hicimos localmente:

*   **Prometheus URL:** `http://prometheus:9090`
*   **Loki URL:** `http://loki:3100`

(Volvé a chequear [Proyectos de Software Grandes: Recolección de Métricas](/en/blog/2025-10-26-large-software-projects/#add-prometheus-data-source) y [Proyectos de Software Grandes: Recolección de Logs](/en/blog/2025-10-27-large-software-projects/#add-loki-data-source) para ver los pasos de configuración detallados.)

## Troubleshooting

### Los Servicios No se Pueden Comunicar

Si los servicios no se pueden alcanzar entre sí, el problema suele estar en la configuración del *alias* de red.

Verificá que todos los servicios estén en la misma red llamada `coolify`:

```bash
docker ps --format "table {{.Names}}\t{{.Networks}}"
```
Todos los contenedores que estén corriendo (Next.js y todos los servicios de monitoreo) deberían mostrar `coolify` en la columna de redes.

![All services are on the same network](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-server-t4kgg8s00cck880csg44csss-terminal-2025-11-03-17_16_54.png)

### Prometheus Muestra el Objetivo Caído (Target Down)

Si Prometheus está corriendo, pero muestra tu objetivo `next-app` como "Down," chequeá los *logs* y la configuración:

1.  **¿El *alias* de Next.js es correcto?** Verificá dos veces que el *alias* de red `next-app` esté aplicado en la configuración del contenedor de la aplicación Next.js.
2.  **Verificá la configuración de Prometheus:** Asegurate de que el objetivo de *scrape* en `prometheus_config` use el *alias* de red: `- targets: ["next-app:3000"]`

Podés inspeccionar manualmente los objetivos de Prometheus accediendo a su API a través de la terminal de Coolify:

```bash
# Debe ejecutarse desde un contenedor en la red Coolify, como la app Next.js
curl http://prometheus:9090/api/v1/targets | jq
```
![Prometheus targets](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-server-t4kgg8s00cck880csg44csss-terminal-2025-11-03-17_19_21.png)

## ¿Qué Sigue?

Hemos llegado a un hito importantísimo: un *stack* de observabilidad completo y listo para producción, que proporciona métricas, *logs* y *traces* para nuestra aplicación Next.js, todo manejado por Coolify. Cubrir este proceso nos tomó cinco *posts* dedicados.

Sin embargo, ninguna configuración arquitectónica es perfecta, y hay mejoras inmediatas a considerar antes de seguir adelante.

### 1. Habilitar la Autenticación en Loki

Para simplificar el desarrollo, nuestra configuración de Loki actualmente usa `auth_enabled: false`. En un ambiente de producción real, esto es un riesgo de seguridad significativo, ya que cualquiera en la red interna podría acceder a los datos de *log* (improbable, pero no imposible).

Es recomendable investigar e implementar autenticación (a menudo *basic auth* o aprovechando proveedores de identidad existentes) para el servidor Loki, y así restringir la ingesta y el acceso a las consultas de *logs*.

### 2. Unificar la Visualización de Traces

Actualmente, nuestros datos de *trace* se envían al OTel Collector y luego se rutean a Zipkin. Para ver estos datos, necesitaríamos exponer Zipkin a través de un dominio (lo cual es trivial, siguiendo los mismos pasos que usamos para Grafana).

Sin embargo, la filosofía ideal de tener un "panel único" (*single pane of glass*) requiere ver los *traces* junto con las métricas y los *logs* dentro de **Grafana**. Las mejoras futuras deberían enfocarse en configurar la **Fuente de Datos de Traces de Grafana** (ej., integrando [Grafana Tempo](https://grafana.com/docs/tempo/latest/)).

### 3. Transición del Foco de la Serie: Autenticación

Este post concluye nuestra inmersión profunda en monitoreo y observabilidad, completando la fase de madurez operativa del proyecto.

Con un *insight* robusto sobre la salud, el rendimiento y el comportamiento de nuestra aplicación, ahora podemos encarar el siguiente desafío arquitectónico clave y complicado: **Autenticación y Autorización**.