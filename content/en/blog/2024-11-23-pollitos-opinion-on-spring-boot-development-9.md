---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 9: Deployment"
date: 2024-11-23
description: "Deploy a containerized Spring Boot app"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-11-23-pollitos-opinion-on-spring-boot-development-9/DALL·E2025-01-22212315.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [Why &ldquo;dockerize&rdquo; a Spring Boot application](#why-dockerize-a-spring-boot-application)
  * [Dockerfile](#dockerfile)
    * [Stage 1: Build Stage](#stage-1-build-stage)
    * [Stage 2: Run Stage](#stage-2-run-stage)
  * [Deployment](#deployment)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the ninth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we created a Java Spring Boot Microservice that handles information about users.
    - You can find the code of the final result at [this GitHub repo](https://github.com/franBec/user_manager_backend)

In this blog we are going to focus on deploying the microservice. Let's start!

## Why &ldquo;dockerize&rdquo; a Spring Boot application

**1. Portability across environments**

- Docker containers bundle the application along with all its dependencies (e.g., JDK, libraries). 
- It ensures consistency across different environments (development, staging, production), avoiding the classic "it works on my machine" problem.

**2. Ease of deployment**

- A Docker image is a self-contained artifact that can be deployed anywhere Docker is supported (on-premises, AWS, GCP, Azure, etc.).

**3. Scalability**

- Containers are lightweight compared to traditional virtual machines, allowing you to spin up multiple instances of your Spring Boot app quickly. 
- Useful for microservices architecture where scaling individual services is common.

**4. Isolation**

- Each Docker container runs in its own isolated environment.
- This avoids conflicts between your Spring Boot app's dependencies and other apps or system-level libraries.

**5. Simplified CI/CD pipelines**

- Docker integrates seamlessly with CI/CD tools like Jenkins, GitLab CI, or GitHub Actions.

**6. Improved resource utilization**

- Containers share the host OS kernel, making them more resource-efficient than traditional VMs. 
- This enables running more instances of your Spring Boot app on the same hardware.

**7. Versioning and rollbacks**

- Docker images are versioned, allowing you to track changes and roll back to a previous version if needed.

**8. Cloud-Native alignment**

- Most cloud platforms are optimized for containerized applications.

**9. Simplifies team collaboration**

- Developers and DevOps teams can use the same Docker image to ensure that everyone is working with identical application setups.

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
- Inspired on Ramanamuttana's blog [&ldquo;Build a Docker Image using Maven and Spring boot&rdquo;](https://medium.com/@ramanamuttana/build-a-docker-image-using-maven-and-spring-boot-418e24c00776)
- This Dockerfile uses a multi-stage build to efficiently build and run.

### Stage 1: Build Stage

```Dockerfile
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
```
- **Base Image:** Uses a lightweight Maven image with Eclipse Temurin JDK 21 (Alpine-based for minimal size). This provides all tools necessary to build a Java application.
- **Alias (AS build):** Labels this stage as build for referencing in the later stages.

```Dockerfile
WORKDIR /app
```
- **Working Directory:** Sets the working directory to `/app` inside the container. All subsequent commands run relative to this directory.

```Dockerfile
COPY pom.xml .
COPY src ./src
```
- **Copy Dependencies:**
  - `pom.xml` is copied to the container to allow Maven to resolve dependencies.
  - The `src` folder is copied for the source code of the project.

```Dockerfile
RUN mvn clean package -DskipTests
```
- **Build Command: Executes Maven’s `clean package` lifecycle:**
  - Cleans any previous build artifacts.
  - Packages the application (usually into a `*.jar` file).
  - The `-DskipTests` flag skips running tests to speed up the build process.

Result: The compiled .jar file will be created in the `target/` directory.

### Stage 2: Run Stage

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
```
- **Base Image:** Uses a lightweight JRE-only (Java Runtime Environment) image for running the application. This makes the runtime image smaller and more efficient.

```Dockerfile
WORKDIR /app
```
**Working Directory:** Again sets the working directory as `/app`.

```Dockerfile
COPY --from=build /app/target/*.jar app.jar
```
- **Copy Artifact:** Pulls the `.jar` file created in the build stage from the `/app/target/` directory and places it as `app.jar` in the `/app` directory.

```Dockerfile
CMD ["java", "-jar", "app.jar"]
```
- **Command:** Defines the default command to run when the container starts:
  - Executes the `java` runtime to run the packaged Spring Boot application.

## Deployment

I decided to deploy the app in [Render](https://render.com/), because:
- It is free: free instances do have cold starts, but I don't care much for this demo.
- It is extremely straight forward.

Nonetheless, there are many options out there, or you can always create your own VPS.

Here's the tutorial I followed:

{{< youtube fwWvgk_SW2g >}}

## Next lecture
Work in progress...