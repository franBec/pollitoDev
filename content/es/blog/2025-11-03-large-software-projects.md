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
    * [(Opcional) Agregar Health Check](#opcional-agregar-health-check)
    * [Desplegar tu App Next.js Actualizada](#desplegar-tu-app-nextjs-actualizada)
  * [Paso 2: Crear el Stack de Monitoreo en Coolify](#paso-2-crear-el-stack-de-monitoreo-en-coolify)
    * [Crear el Servicio Docker Compose](#crear-el-servicio-docker-compose)
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
  * [¿Qué Sigue?](#qué-sigue)
    * [1. Habilitar la Autenticación en Loki](#1-habilitar-la-autenticación-en-loki)
<!-- TOC -->

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-11-03](https://github.com/franBec/tas/tree/feature/2025-11-03)

## Prerrequisitos: Haciendo la Transición a Producción

En el [post anterior](/es/blog/2025-11-02-large-software-projects), armamos un *stack* de monitoreo local usando Docker Compose.

El objetivo ahora es levantar todo este sistema—Métricas, Logs y Traces—y desplegarlo junto con nuestra aplicación Next.js en nuestro VPS de producción, manejado por **Coolify**.

## Paso 1: Preparar tu App Next.js para Producción

### (Opcional) Agregar Health Check

Un simple *endpoint* de chequeo de salud es clave para verificar que todos nuestros sistemas de monitoreo se hayan inicializado correctamente y que nuestras variables de entorno se estén leyendo bien.

**Nota sobre Seguridad:** Si bien exponer este *endpoint* es útil para debuguear, generalmente se recomienda restringir el acceso a los *endpoints* de diagnóstico en producción y evitar exponer datos de configuración sensibles como las variables de entorno aquí.

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

### Desplegar tu App Next.js Actualizada

Hacé *commit* y *push* de estos cambios. Si estás usando la configuración estándar de CI/CD de Coolify, la aplicación se va a desplegar automáticamente, pero el monitoreo va a estar roto hasta que despleguemos el *stack* en el siguiente paso.

## Paso 2: Crear el Stack de Monitoreo en Coolify

### Crear el Servicio Docker Compose

1. Andá a tu **Proyecto** en Coolify.
2. Hacé clic en **+ Add Resource** (Agregar Recurso).
3. Seleccioná **Docker Compose**.
4. Llamémoslo `monitoring`.
    ![Coolify Project Resources](/uploads/2025-11-03-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-2025-11-03-15_32_16.png)
5. En el `monitoring` service, hacé clic en **"Edit Compose File"** y pegá [esta configuración completa](https://github.com/franBec/tas/blob/feature/2025-11-02/src/resources/monitoring.yml).

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

Si implementaste el *endpoint* de salud opcional, chequealo. Debería mostrar que las variables de entorno fueron recibidas correctamente:

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

Ahora podés configurar las fuentes de datos e importar un panel tal como hicimos localmente (Volvé a chequear el [post anterior](/es/blog/2025-11-02-large-software-projects) para ver los pasos de configuración detallados.)

## ¿Qué Sigue?

Con un conocimiento profundo del estado, el rendimiento y el comportamiento de nuestra aplicación, dedicaremos un momento a implementar el **manejo de errores**, lo que permitirá al usuario recuperarse sin problemas cuando algo inevitablemente falle.

**Próximo Blog**: [Proyectos de Software Grandes: Manejo de Errores](/es/blog/2025-11-08-large-software-projects)