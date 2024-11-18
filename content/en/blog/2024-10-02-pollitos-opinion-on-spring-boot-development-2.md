---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 2: Best practices boilerplate"
date: 2024-10-02
description: "Best practices boilerplate"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/fujiwara.jpg
---

## Some context

This is the second part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

You can find the final result of the series at [https://github.com/franBec/post](https://github.com/franBec/post).

## Roadmap

1. Create a new Spring Boot project with the help of [Spring Initialzr](https://start.spring.io/).
2. Essential dependencies + best practice boilerplates.

- 2.1. Dependencies.
- 2.2. Create an basic [@RestController](https://www.baeldung.com/spring-controller-vs-restcontroller), it is gonna be useful later.
- 2.3. Logs.
- 2.4. Normalization of errors being returned.
- \[Optional\] Customize [@RestControllerAdvice](https://www.bezkoder.com/spring-boot-restcontrolleradvice/).

Let's start!

## 1. Create a new Spring Boot project with the help of Spring Initialzr

I'll use the integrated Spring Initializr that comes with IntelliJ IDEA 2021.3.2 (Ultimate Edition). You can get the same result by going to [Spring Initialzr](https://start.spring.io/), following the same steps, and working with the generated zip.

![Screenshot2024-10-01232921](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01232921.png)
![Screenshot2024-10-01233857](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01233857.png)

- **Language:** Java
- **Type:** Maven
  - You could make this work in Gradle. But for this tutorial purpose, I'll be using Maven.
- **Java:** 21
  - At the moment of writing this blog, Java 21 is the latest LTS in the [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html).
- Packaging: JAR

**Group**, **Artifact**, and **Package name** fill them corresponding to the project you are making.

![Screenshot2024-10-01234953](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01234953.png)

At the moment of writing this blog, Spring Boot 3.3.4 is the latest stable release.

Add the dependencies:

- [Lombok](https://projectlombok.org/)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#using.devtools)
- [Spring Configuration Processor](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#appendix.configuration-metadata.annotation-processor)
- [Spring Web](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#web)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#actuator)

You should be welcomed by the HELP.md of an empty Spring Boot project.
![Screenshot2024-10-01235651](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01235651.png)

Do a maven clean and compile, and run the main application class. You should find the Whitelabel Error Page at [http://localhost:8080/](http://localhost:8080/).
![Screenshot2024-10-02000415](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02000415.png)

## 2. Essential dependencies + best practice boilerplates

These are:

- 2.1. Dependencies.
- 2.2. Create an basic [@RestController](https://www.baeldung.com/spring-controller-vs-restcontroller), it is gonna be useful later.
- 2.3. Logs.
- 2.4. Normalization of errors being returned.
- \[Optional\] Customize [@RestControllerAdvice](https://www.bezkoder.com/spring-boot-restcontrolleradvice/).

### 2.1. Dependencies

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

Here I leave some ready copy-paste for you. Consider double checking the latest version.

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

### 2.2. Create a basic @RestController, it is going to be useful later

_controller/UserController.java_

```java
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
}
```

### 2.3. Logs

Considering we don't mind accidentally printing sensitive information (keys, passwords, etc), I've found useful to log

- Everything that comes in
- Everything that comes out.

To achieve that we are going to be using:

- An [Aspect](https://www.baeldung.com/aspectj) that logs before and after execution of public controller methods.
- A [Filter interface](https://www.geeksforgeeks.org/spring-boot-servlet-filter/) that logs stuff that doesn't reach the controllers.

#### Aspect

_aspect/LoggingAspect.java_

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
public class LoggingAspect {

  @Pointcut("execution(public * dev.pollito.post.controller..*.*(..))") //todo: point to your controller package
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

### 2.4. Normalize errors being returned

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
  private ProblemDetail buildProblemDetail(@NotNull Exception e, HttpStatus status) {
    log.error(e.getClass().getSimpleName() + " being handled", e);
    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, e.getLocalizedMessage());
    problemDetail.setProperty("timestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()));
    problemDetail.setProperty("trace", Span.current().getSpanContext().getTraceId());
    return problemDetail;
  }
}
```

Now when going to [http://localhost:8080/](http://localhost:8080/), you won't see the Whitelabel Error Page. Instead you'll find a json:

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

```log
2024-10-02T13:41:10.183+01:00  INFO 13888 --- [post] [nio-8080-exec-5] [fb74d08c4b30785bad646ba6b477e03a-37ee842e6ed1a85c] dev.pollito.post.filter.LogFilter        : >>>> Method: GET; URI: /favicon.ico; QueryString: null; Headers: {host: localhost:8080, connection: keep-alive, sec-ch-ua-platform: "Windows", user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36, sec-ch-ua: "Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129", dnt: 1, sec-ch-ua-mobile: ?0, accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8, sec-fetch-site: same-origin, sec-fetch-mode: no-cors, sec-fetch-dest: image, referer: http://localhost:8080/, accept-encoding: gzip, deflate, br, zstd, accept-language: es-AR,es-419;q=0.9,es;q=0.8,en;q=0.7, cookie: twk_uuid_5e9c972069e9320caac54405=%7B%22uuid%22%3A%221.HQ0VlfQEK3Tc75cfW13poU4phbFtLRAtTgvSljf5VE2CNkFGhoaAdqTxr4UQxMNb3hVHmIjIMIGw11zvbolGsoFeEnS2KLERoUOK9%22%2C%22version%22%3A3%2C%22domain%22%3Anull%2C%22ts%22%3A1724169229165%7D; Idea-429012d6=8811ade9-8dbd-41c7-84df-e626d438104f, sec-gpc: 1}
2024-10-02T13:41:10.187+01:00  INFO 13888 --- [post] [nio-8080-exec-5] [fb74d08c4b30785bad646ba6b477e03a-37ee842e6ed1a85c] dev.pollito.post.aspect.LoggingAspect    : [GlobalControllerAdvice.handle(..)] Args: [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource favicon.ico.]
2024-10-02T13:41:10.188+01:00 ERROR 13888 --- [post] [nio-8080-exec-5] [fb74d08c4b30785bad646ba6b477e03a-37ee842e6ed1a85c] d.p.p.c.advice.GlobalControllerAdvice    : NoResourceFoundException being handled

org.springframework.web.servlet.resource.NoResourceFoundException: No static resource favicon.ico.
	at org.springframework.web.servlet.resource.ResourceHttpRequestHandler.handleRequest(ResourceHttpRequestHandler.java:585) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter.handle(HttpRequestHandlerAdapter.java:52) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.30.jar:6.0]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.13.jar:6.1.13]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.30.jar:6.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:195) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at dev.pollito.post.filter.LogFilter.doFilter(LogFilter.java:25) ~[classes/:na]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.13.jar:6.1.13]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.13.jar:6.1.13]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.13.jar:6.1.13]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.13.jar:6.1.13]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.springframework.web.filter.ServerHttpObservationFilter.doFilterInternal(ServerHttpObservationFilter.java:113) ~[spring-web-6.1.13.jar:6.1.13]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.13.jar:6.1.13]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.13.jar:6.1.13]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.13.jar:6.1.13]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:164) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:140) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:483) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:384) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:905) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1741) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1190) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.30.jar:10.1.30]
	at java.base/java.lang.Thread.run(Thread.java:1583) ~[na:na]

2024-10-02T13:41:10.188+01:00  INFO 13888 --- [post] [nio-8080-exec-5] [fb74d08c4b30785bad646ba6b477e03a-37ee842e6ed1a85c] dev.pollito.post.aspect.LoggingAspect    : [GlobalControllerAdvice.handle(..)] Response: ProblemDetail[type='about:blank', title='Internal Server Error', status=500, detail='No static resource favicon.ico.', instance='null', properties='{timestamp=2024-10-02T12:41:10.188892500Z, trace=fb74d08c4b30785bad646ba6b477e03a}']
2024-10-02T13:41:10.193+01:00  WARN 13888 --- [post] [nio-8080-exec-5] [fb74d08c4b30785bad646ba6b477e03a-37ee842e6ed1a85c] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource favicon.ico.]
2024-10-02T13:41:10.193+01:00  INFO 13888 --- [post] [nio-8080-exec-5] [fb74d08c4b30785bad646ba6b477e03a-37ee842e6ed1a85c] dev.pollito.post.filter.LogFilter        : <<<< Response Status: 500
```

Notice that all the logs have associated a long UUID like string. That is made by the [micrometer](https://www.baeldung.com/micrometer) dependencies. Each request incoming into this microservice will have a different number, so we can differentiate what's going on in case multiple request appears at the same time and the logs start mixing with each other.

### \[Optional\] Customize GlobalControllerAdvice

Right now you could be thinking

> but No static resource should be 404 insted of 500

to which I say, yes you're totally right and I wish there was a way to implement that behaviour by default. But with this normalizaiton of errors, everything is a 500 unless you explicitly say otherwise. I think the trade-off is worth it.

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
  private ProblemDetail buildProblemDetail(@NotNull Exception e, HttpStatus status) {
    log.error(e.getClass().getSimpleName() + " being handled", e);
    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, e.getLocalizedMessage());
    problemDetail.setProperty("timestamp", DateTimeFormatter.ISO_INSTANT.format(Instant.now()));
    problemDetail.setProperty("trace", Span.current().getSpanContext().getTraceId());
    return problemDetail;
  }
}
```

Remember that in @RestControllerAdvice, the **order of the functions matter**. Because every whatever-exception is a child of Exception.class, if you put it at the begining of the file, it will always match. For that reason, the method annotated with @ExceptionHandler(Exception.class) should be the last public method of the file.

Now when requesting to [http://localhost:8080/](http://localhost:8080/) you get the new expected behaviour:

![Screenshot2024-10-02135949](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02135949.png)

Repeat this process for any other Exception you'd like to have a non 500 default response.

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 3: Spring server interfaces](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-3)
