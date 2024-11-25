---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 9: Despliegue"
date: 2024-11-23
description: "Despliegue un container con una aplicación Spring Boot"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-11-23-pollitos-opinion-on-spring-boot-development-9/75a5c679e3c53325156b046b3f68f081.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [¿Por qué &ldquo;dockerizar&rdquo; una aplicación Spring Boot](#por-qué-dockerizar-una-aplicación-spring-boot)
  * [Dockerfile](#dockerfile)
    * [Stage 1: Build Stage](#stage-1-build-stage)
    * [Stage 2: Run Stage](#stage-2-run-stage)
  * [Despliegue](#despliegue)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la novena parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta serie es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, hemos creado un microservicio Java Spring Boot que maneje información sobre los usuarios.
  - Puedes encontrar el resultado final de la serie en el [repo de GitHub](https://github.com/franBec/user_manager_backend/).

En este blog nos centraremos en el despliegue del microservicio. ¡Comencemos!

## ¿Por qué &ldquo;dockerizar&rdquo; una aplicación Spring Boot

**1. Portabilidad entre entornos**

- Los contenedores Docker agrupan la aplicación junto con todas sus dependencias (p. ej., JDK, bibliotecas).
- Garantiza la coherencia en diferentes entornos (desarrollo, test, producción), lo que evita el clásico problema de "funciona en mi máquina".

**2. Facilidad de implementación**

- Una imagen de Docker es un artefacto autónomo que se puede implementar en cualquier lugar donde se admita Docker (local, AWS, GCP, Azure, etc.).

**3. Escalabilidad**

- Los contenedores son livianos en comparación con las máquinas virtuales tradicionales, lo que le permite crear múltiples instancias de su aplicación Spring Boot rápidamente.
- Son útiles para la arquitectura de microservicios donde es común escalar servicios individuales.

**4. Aislamiento**

- Cada contenedor Docker se ejecuta en su propio entorno aislado.
- Esto evita conflictos entre las dependencias de su aplicación Spring Boot y otras aplicaciones o bibliotecas a nivel del sistema.

**5. Procesos de CI/CD simplificados**

- Docker se integra perfectamente con herramientas CI/CD como Jenkins, GitLab CI o GitHub Actions.

**6. Utilización mejorada de recursos**

- Los contenedores comparten el núcleo del sistema operativo host, lo que los hace más eficientes en el uso de recursos que las máquinas virtuales tradicionales.
- Esto permite ejecutar más instancias de su aplicación Spring Boot en el mismo hardware.

**7. Versiones**

- Las imágenes de Docker tienen versiones, lo que le permite realizar un seguimiento de los cambios y volver a una versión anterior si es necesario.

**8. Alineación con la nube nativa**

- La mayoría de las plataformas en la nube están optimizadas para aplicaciones en contenedores.

**9. Simplifica la colaboración en equipo**

- Los desarrolladores y los equipos de DevOps pueden usar la misma imagen de Docker para garantizar que todos trabajen con configuraciones de aplicaciones idénticas.

## Dockerfile

_Dockerfile_

```Dockerfile
# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

- Inspirado en el blog de Ramanamuttana [&ldquo;Build a Docker Image using Maven and Spring boot&rdquo;](https://medium.com/@ramanamuttana/build-a-docker-image-using-maven-and-spring-boot-418e24c00776)
- Este Dockerfile utiliza una compilación de varias etapas para compilar y ejecutar de manera eficiente.

### Stage 1: Build Stage

```Dockerfile
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
```
- **Imagen base:** utiliza una imagen Maven liviana con Eclipse Temurin JDK 21 (basada en Alpine para un tamaño mínimo). Esto proporciona todas las herramientas necesarias para crear una aplicación Java.
- **Alias (AS build):** etiqueta esta etapa como compilación para hacer referencia a ella en etapas posteriores.

```Dockerfile
WORKDIR /app
```
- **Working Directory:** Establece el directorio de trabajo en `/app` dentro del contenedor. Todos los comandos subsiguientes se ejecutan en relación con este directorio.

```Dockerfile
COPY pom.xml .
COPY src ./src
```
- **Copiar dependencias:**
  - `pom.xml` se copia al contenedor para permitir que Maven resuelva las dependencias.
  - Se copia la carpeta `src` que contiene el código fuente del proyecto.

```Dockerfile
RUN mvn clean package -DskipTests
```
- **Compilación: se ejecuta el ciclo de vida `clean package` de Maven:**
  - Limpia cualquier artefacto de compilación anterior.
  - Empaqueta la aplicación (normalmente en un archivo `*.jar`).
  - El indicador `-DskipTests` omite la ejecución de pruebas para acelerar el proceso de compilación.

Resultado: El archivo .jar compilado se creará en el directorio `target/`.

### Stage 2: Run Stage

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
```
- **Imagen base:** utiliza una imagen liviana exclusiva de JRE (Java Runtime Environment) para ejecutar la aplicación. Esto hace que la imagen de tiempo de ejecución sea más pequeña y eficiente.

```Dockerfile
WORKDIR /app
```
- **Working Directory:** nuevamente establece el directorio de trabajo como `/app`.

```Dockerfile
COPY --from=build /app/target/*.jar app.jar
```
- **Copiar artefacto:** extrae el archivo `.jar` creado en la etapa de compilación del directorio `/app/target/` y lo coloca como `app.jar` en el directorio `/app`.

```Dockerfile
CMD ["java", "-jar", "app.jar"]
```
- **Command:** define el comando predeterminado que se ejecutará cuando se inicie el contenedor:
  - Ejecuta el entorno de ejecución `java` para ejecutar la aplicación Spring Boot empaquetada.

## Despliegue
Decidí desplegar la aplicación en [Render](https://render.com/) porque:
- Es gratuita: las instancias gratuitas tienen arranques en frío, pero no me interesa mucho en esta demostración.
- Es extremadamente sencillo.

No obstante, existen muchas opciones, o siempre puedes crear tu propio VPS.

A continuación, te dejo el tutorial que seguí:

{{< youtube fwWvgk_SW2g >}}


## Siguiente lectura
Trabajo en progreso...