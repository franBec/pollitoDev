---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 2: Best practices boilerplate"
date: 2024-10-02
description: "Components and Workflow"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/DALL·E2025-01-22202503.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [1. Understanding the project](#1-understanding-the-project)
    * [Components](#components)
    * [Workflow](#workflow)
  * [2. Create a new Spring Boot project with the help of Spring Initialzr](#2-create-a-new-spring-boot-project-with-the-help-of-spring-initialzr)
  * [3. Essential dependencies + best practice boilerplates](#3-essential-dependencies--best-practice-boilerplates)
    * [3.1. Dependencies](#31-dependencies)
    * [3.2. Create a basic @RestController, it is going to be useful later](#32-create-a-basic-restcontroller-it-is-going-to-be-useful-later)
    * [3.3. Logs](#33-logs)
      * [Aspect](#aspect)
      * [Filter](#filter)
    * [3.4. Normalize errors being returned](#34-normalize-errors-being-returned)
    * [\[Optional\] Customize GlobalControllerAdvice](#optional-customize-globalcontrolleradvice)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the second part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we are going to create a Java Spring Boot Microservice that handles information about users.
  - You can find the code of the final result at [this GitHub repo - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).

Let's start!

## 1. Understanding the project

We are going to create a Java Spring Boot Microservice that handles information about users.

Here's an explanation of its components and workflow:
![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

### Components

- **Requesting Client:**
   - User or system making the API request to the microservice.
- **LogFilter:**
   - Filter that intercepts every request and response to log information.
- **UsersController:**
   - The controller layer in the Spring Boot microservice that handles HTTP endpoints (/users, /users/{id}). 
   - It processes the request, interacts with the service layer, and returns the response.
- **UsersService:**
   - Service layer that contains the business logic. It communicates with other services or APIs if needed.
- **UsersApiCacheService:**
   - Caching layer to avoid unnecessary calls to external APIs. It ensures the logic below this layer (external calls) is executed only once by utilizing cached results.
- **UsersApi:**
   - External API that provides user data.
- **GlobalControllerAdvice:**
   - Global exception handler. If an exception occurs at any stage in the processing of the request, this component catches it and ensures the response is appropriately formatted.

### Workflow

1. **Incoming Request:** A client sends a request to the microservice (e.g., GET /users or GET /users/{id}).
2. **LogFilter:** The request first passes through the LogFilter, which logs information.
3. **Controller Processing:** The request is routed to the UsersController, which invokes the appropriate method based on the endpoint.
4. **Service Layer:** The controller delegates the business logic to the UsersService.
5. **Caching Layer:** UsersService calls UsersApiCacheService to check if the data is already cached. If cached, it skips calling the external API.
6. **External API Call:** If the data is not cached, UsersApiCacheService invokes UsersApi to fetch the data from the external API.
7. **Response Assembly:** The data is passed back up through the layers to the controller, which formats and sends the response to the client.
8. **Exception Handling:** If any exception occurs during the process, GlobalControllerAdvice intercepts it and formats the response.


## 2. Create a new Spring Boot project with the help of Spring Initialzr

I'll use the integrated Spring Initializr that comes with IntelliJ IDEA 2021.3.2 (Ultimate Edition). You can get the same result by going to [Spring Initialzr](https://start.spring.io/), following the same steps, and working with the generated zip.

![Screenshot2024-10-01233857](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01233857.png)

- **Language:** Java
- **Type:** Maven
  - You could make this work in Gradle. But for this tutorial purpose, I'll be using Maven.
- **Java:** 21
  - At the moment of writing this blog, Java 21 is the latest LTS in the [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html).
- Packaging: JAR

**Group**, **Artifact**, and **Package name** fill them corresponding to the project you are making.

At the moment of writing this blog, Spring Boot 3.3.4 is the latest stable release.

Add the dependencies:

- [Lombok](https://projectlombok.org/)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#using.devtools)
- [Spring Configuration Processor](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#appendix.configuration-metadata.annotation-processor)
- [Spring Web](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#web)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#actuator)

Do a maven clean and compile, and run the main application class. You should find the Whitelabel Error Page at [http://localhost:8080/](http://localhost:8080/).
![Screenshot2024-10-02000415](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02000415.png)

## 3. Essential dependencies + best practice boilerplates

### 3.1. Dependencies

Add the dependencies:

- [JetBrains Java Annotations](https://mvnrepository.com/artifact/org.jetbrains/annotations)
- [AspectJ Tools (Compiler)](https://mvnrepository.com/artifact/org.aspectj/aspectjtools)
- [Micrometer Observation](https://mvnrepository.com/artifact/io.micrometer/micrometer-observation)
- [Micrometer Tracing Bridge OTel](https://mvnrepository.com/artifact/io.micrometer/micrometer-tracing-bridge-otel)
- [MapStruct Core](https://mvnrepository.com/artifact/org.mapstruct/mapstruct)

And the plugins:

- [Apache Maven Compiler Plugin](https://mvnrepository.com/artifact/org.apache.maven.plugins/maven-compiler-plugin)
- [MapStruct Processor](https://mvnrepository.com/artifact/org.mapstruct/mapstruct-processor)
- [Lombok Mapstruct Binding](https://mvnrepository.com/artifact/org.projectlombok/lombok-mapstruct-binding)
- [fmt-maven-plugin](https://github.com/spotify/fmt-maven-plugin)
- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

Under the \<dependencies\> tag:

```xml
<dependency>
    <groupId>org.jetbrains</groupId>
    <artifactId>annotations</artifactId>
    <version>24.1.0</version>
    <scope>compile</scope>
</dependency>
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjtools</artifactId>
    <version>1.9.22.1</version>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-observation</artifactId>
    <version>1.13.4</version>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
    <version>1.3.4</version>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.6.1</version>
</dependency>
```

Under the \<plugins\> tag:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.1</version>
            </path>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </path>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>0.2.0</version>
            </dependency>
        </annotationProcessorPaths>
        <compilerArgs>
            <arg>-parameters</arg>
        </compilerArgs>
    </configuration>
</plugin>
<plugin>
    <groupId>com.spotify.fmt</groupId>
    <artifactId>fmt-maven-plugin</artifactId>
    <version>2.24</version>
    <executions>
        <execution>
            <goals>
                <goal>format</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <version>1.17.0</version>
    <executions>
        <execution>
            <id>pit-report</id>
            <phase>test</phase>
            <goals>
                <goal>mutationCoverage</goal>
            </goals>
        </execution>
    </executions>
    <dependencies>
        <dependency>
            <groupId>org.pitest</groupId>
            <artifactId>pitest-junit5-plugin</artifactId>
            <version>1.2.1</version>
        </dependency>
    </dependencies>
    <configuration>
        <targetClasses>
            <param>${project.groupId}.${project.artifactId}.controller.*</param>
            <param>${project.groupId}.${project.artifactId}.service.*</param>
            <param>${project.groupId}.${project.artifactId}.util.*</param>
        </targetClasses>
        <targetTests>
            <param>${project.groupId}.${project.artifactId}.*</param>
        </targetTests>
    </configuration>
</plugin>
```

### 3.2. Create a basic @RestController, it is going to be useful later

_controller/UsersController.java_

```java
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsersController {
}
```

### 3.3. Logs

Considering we don't mind accidentally printing sensitive information (keys, passwords, etc.), I've found useful to log

- Everything that comes in.
- Everything that comes out.

To achieve that we are going to be using:

- An [Aspect](https://www.baeldung.com/aspectj) that logs before and after execution of public controller methods.
- A [Filter interface](https://www.geeksforgeeks.org/spring-boot-servlet-filter/) that logs stuff that doesn't reach the controllers.

#### Aspect

_aspect/LogAspect.java_

```java
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LogAspect {

  @Pointcut("execution(public * dev.pollito.user_manager_backend.controller..*.*(..))") //todo: point to your controller package
  public void controllerPublicMethodsPointcut() {}

  @Before("controllerPublicMethodsPointcut()")
  public void logBefore(@NotNull JoinPoint joinPoint) {
    log.info(
        "["
            + joinPoint.getSignature().toShortString()
            + "] Args: "
            + Arrays.toString(joinPoint.getArgs()));
  }

  @AfterReturning(pointcut = "controllerPublicMethodsPointcut()", returning = "result")
  public void logAfterReturning(@NotNull JoinPoint joinPoint, Object result) {
    log.info("[" + joinPoint.getSignature().toShortString() + "] Response: " + result);
  }
}
```

In the Pointcut annotation, point to your controller package.

![Screenshot2024-10-02122012](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02122012.png)

#### Filter

_filter/LogFilter.java_

```java
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;

@Slf4j
public class LogFilter implements Filter {

  @Override
  public void doFilter(
      ServletRequest servletRequest,
      ServletResponse servletResponse,
      @NotNull FilterChain filterChain)
      throws IOException, ServletException {
    logRequestDetails((HttpServletRequest) servletRequest);
    filterChain.doFilter(servletRequest, servletResponse);
    logResponseDetails((HttpServletResponse) servletResponse);
  }

  private void logRequestDetails(@NotNull HttpServletRequest request) {
    log.info(
        ">>>> Method: {}; URI: {}; QueryString: {}; Headers: {}",
        request.getMethod(),
        request.getRequestURI(),
        request.getQueryString(),
        headersToString(request));
  }

  public String headersToString(@NotNull HttpServletRequest request) {
    Enumeration<String> headerNames = request.getHeaderNames();
    StringBuilder stringBuilder = new StringBuilder("{");

    while (headerNames.hasMoreElements()) {
      String headerName = headerNames.nextElement();
      String headerValue = request.getHeader(headerName);

      stringBuilder.append(headerName).append(": ").append(headerValue);

      if (headerNames.hasMoreElements()) {
        stringBuilder.append(", ");
      }
    }

    stringBuilder.append("}");
    return stringBuilder.toString();
  }

  private void logResponseDetails(@NotNull HttpServletResponse response) {
    log.info("<<<< Response Status: {}", response.getStatus());
  }
}
```

_config/LogFilterConfig.java_

```java
import dev.pollito.post.filter.LogFilter; //todo: import your own filter created in the previous step
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LogFilterConfig {

  @Bean
  public FilterRegistrationBean<LogFilter> loggingFilter() {
    FilterRegistrationBean<LogFilter> registrationBean = new FilterRegistrationBean<>();

    registrationBean.setFilter(new LogFilter());
    registrationBean.addUrlPatterns("/*");

    return registrationBean;
  }
}
```

### 3.4. Normalize errors being returned

One of the most annoying things when consuming a microservice is that the errors it returns are not consistent. At work, I have plenty of scenarios like:

service.com/users/-1 returns

```json
{
  "errorDescription": "User not found",
  "cause": "BAD REQUEST"
}
```

but service.com/product/-1 returns

```json
{
  "message": "not found",
  "error": 404
}
```

Consistency just flew out of the window there, and is annoying as f\*ck (and don't get me started with errors inside 200OK).

We don't want to be that kind of guy. We are going to do proper error handling with [@RestControllerAdvice](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) and [ProblemDetail](https://dev.to/noelopez/spring-rest-exception-handling-problem-details-2hkj), so all our errors at least they look the same.

_controller/advice/GlobalControllerAdvice.java_

```java
import io.opentelemetry.api.trace.Span;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalControllerAdvice {

  @ExceptionHandler(Exception.class)
  public ProblemDetail handle(@NotNull Exception e) {
    return buildProblemDetail(e, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @NotNull
  private static ProblemDetail buildProblemDetail(@NotNull Exception e, HttpStatus status) {
    String exceptionSimpleName = e.getClass().getSimpleName();
    log.error("{} being handled", exceptionSimpleName, e);
    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, e.getLocalizedMessage());
    problemDetail.setTitle(exceptionSimpleName);
    problemDetail.setProperty("timestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()));
    problemDetail.setProperty("trace", Span.current().getSpanContext().getTraceId());
    return problemDetail;
  }
}
```

Now when going to [http://localhost:8080/](http://localhost:8080/), you won't see the Whitelabel Error Page. Instead, you'll find a json:

![Screenshot2024-10-02130952](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02130952.png)

From now on, all the errors that this microservice returns have the following structure:

```yaml
detail:
  description: Description of the problem.
  example: "No static resource ."
  type: string
instance:
  description: The endpoint where the problem was encountered.
  example: "/"
  type: string
status:
  description: http status code
  example: 500
  type: integer
title:
  description: A short headline of the problem.
  example: "Internal Server Error"
  type: string
timestamp:
  description: ISO 8601 Date.
  example: "2024-10-02T12:29:19.326053Z"
  type: string
trace:
  description: opentelemetry TraceID, a unique identifier.
  example: "0c6a41e22fe6478cc391908406ca9b8d"
  type: string
type:
  description: used to point the client to documentation where it is explained clearly what happened and why.
  example: "about:blank"
  type: string
```

You can customize this object by adjusting the ProblemDetail properties.

When looking at the logs, you can find more detailed information. It goes:

- -> LogFilter
- -> LoggingAspect
- -> GlobalControllerAdvice
- -> LoggingAspect
- -> LogFilter

Notice that all the logs have associated a long UUID like string. That is made by the [micrometer](https://www.baeldung.com/micrometer) dependencies. Each request incoming into this microservice will have a different number, so we can differentiate what's going on in case multiple request appears at the same time and the logs start mixing with each other.

### \[Optional\] Customize GlobalControllerAdvice

Right now you could be thinking

> but No static resource should be 404 instead of 500

to which I say, yes you're totally right and I wish there was a way to implement that behaviour by default. But with this normalization of errors, everything is a 500 unless you explicitly say otherwise. I think the trade-off is worth it.

For making "No static resource" a 404, add in the @RestControllerAdvice class a new @ExceptionHandler(NoResourceFoundException.class) method. The final result looks like this:

_controller/advice/GlobalControllerAdvice.java_

```java
import io.opentelemetry.api.trace.Span;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
@Slf4j
public class GlobalControllerAdvice {

  @ExceptionHandler(NoResourceFoundException.class)
  public ProblemDetail handle(@NotNull NoResourceFoundException e) {
    return buildProblemDetail(e, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handle(@NotNull Exception e) {
    return buildProblemDetail(e, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @NotNull
  private static ProblemDetail buildProblemDetail(@NotNull Exception e, HttpStatus status) {
    String exceptionSimpleName = e.getClass().getSimpleName();
    log.error("{} being handled", exceptionSimpleName, e);
    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, e.getLocalizedMessage());
    problemDetail.setTitle(exceptionSimpleName);
    problemDetail.setProperty("timestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()));
    problemDetail.setProperty("trace", Span.current().getSpanContext().getTraceId());
    return problemDetail;
  }
}
```

Remember that in @RestControllerAdvice, the **order of the functions matter**. Because every whatever-exception is a child of Exception.class, if you put it at the beginning of the file, it will always match. For that reason, the method annotated with @ExceptionHandler(Exception.class) should be the last public method of the file.

Now when requesting to [http://localhost:8080/](http://localhost:8080/) you get the new expected behaviour:

![Screenshot2024-10-02135949](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02135949.png)

Repeat this process for any other Exception you'd like to have a non 500 default response.

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 3: Spring server interfaces](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-3)
