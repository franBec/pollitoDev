---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 2: Mejores prácticas"
date: 2024-10-02
description: "Componentes y Flujo de trabajo"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/fujiwara.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [1. Entendiendo el proyecto](#1-entendiendo-el-proyecto)
    * [Componentes](#componentes)
    * [Flujo de trabajo](#flujo-de-trabajo)
  * [2. Crear un nuevo proyecto Spring Boot con la ayuda de Spring Initialzr](#2-crear-un-nuevo-proyecto-spring-boot-con-la-ayuda-de-spring-initialzr)
  * [3. Dependencias esenciales + mejores prácticas](#3-dependencias-esenciales--mejores-prácticas)
    * [3.1. Dependencias](#31-dependencias)
    * [3.2. Crear un @RestController básico, será útil más adelante](#32-crear-un-restcontroller-básico-será-útil-más-adelante)
    * [3.3. Logs](#33-logs)
      * [Aspecto](#aspecto)
      * [Filtro](#filtro)
    * [3.4. Normalización de los errores que se retornan](#34-normalización-de-los-errores-que-se-retornan)
    * [\[Opcional\] Personalizar @RestControllerAdvice.](#opcional-personalizar-restcontrolleradvice)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la segunda parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta serie es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, vamos a crear un microservicio Java Spring Boot que maneje información sobre los usuarios.
- Puedes encontrar el resultado final de la serie en el [repo de GitHub - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).

¡Comencemos!

## 1. Entendiendo el proyecto

Vamos a crear un microservicio Java Spring Boot que maneje información sobre los usuarios.

Aquí hay una explicación de sus componentes y flujo de trabajo:
![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

### Componentes

- **Cliente:**
  - Usuario o sistema que realiza la solicitud de API al microservicio.
- **LogFilter:**
  - Filtro que intercepta cada solicitud y respuesta para registrar información.
- **UsersController:**
  - La capa del controlador en el microservicio Spring Boot que maneja los endpoints HTTP (/users, /users/{id}).
  - Procesa la solicitud, interactúa con la capa de servicio y devuelve la respuesta.
- **UsersService:**
  - Capa de servicio que contiene la lógica empresarial. Se comunica con otros servicios o API si es necesario.
- **UsersApiCacheService:**
  - Capa de almacenamiento en caché para evitar llamadas innecesarias a API externas. Garantiza que la lógica debajo de esta capa (llamadas externas) se ejecute solo una vez mediante el uso de resultados almacenados en caché.
- **UsersApi:**
  - API externa que proporciona datos de usuario.
- **GlobalControllerAdvice:**
  - Un controlador de excepciones global. Si se produce una excepción en cualquier etapa del procesamiento de la solicitud, este componente la detecta y garantiza que la respuesta tenga el formato adecuado.

### Flujo de trabajo

1. **Solicitud entrante:** Un cliente envía una solicitud al microservicio (ej., GET /users o GET /users/{id}).
2. **LogFilter:** La solicitud pasa primero por LogFilter, que registra la información.
3. **Procesamiento del controlador:** La solicitud se enruta a UsersController, que invoca el método apropiado en función del endpoint.
4. **Capa de servicio:** El controlador delega la lógica empresarial a UsersService.
5. **Capa de almacenamiento en caché:** UsersService llama a UsersApiCacheService para verificar si los datos ya están almacenados en caché. Si están almacenados en caché, omite la llamada a la API externa.
6. **Llamada a la API externa:** Si los datos no están almacenados en caché, UsersApiCacheService invoca a UsersApi para obtener los datos de la API externa.
7. **Ensamblaje de respuesta:** Los datos se pasan nuevamente a través de las capas hasta el controlador, que formatea y envía la respuesta al cliente.
8. **Manejo de excepciones:** Si ocurre alguna excepción durante el proceso, GlobalControllerAdvice la intercepta y formatea la respuesta.

## 2. Crear un nuevo proyecto Spring Boot con la ayuda de Spring Initialzr

Usaré el Spring Initializr integrado que viene con IntelliJ IDEA 2021.3.2 (Ultimate Edition). Puedes obtener el mismo resultado yendo a [Spring Initialzr](https://start.spring.io/), siguiendo los mismos pasos y trabajando con el archivo zip generado.

![Screenshot2024-10-01233857](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01233857.png)

- **Language:** Java
- **Type:** Maven
  - Podrías hacer que esto funcione en Gradle, pero para este tutorial usaré Maven.
- **Java:** 21
  - Al momento de escribir este blog, Java 21 es la última versión LTS en la [Hoja de ruta de soporte de Oracle Java SE](https://www.oracle.com/java/technologies/java-se-support-roadmap.html).
- Packaging: JAR

**Group**, **Artifact**, y **Package name**
complételos correspondientes al proyecto que está realizando.

![Screenshot2024-10-01234953](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-01234953.png)

Al momento de escribir este blog, Spring Boot 3.3.4 es la última versión estable.

Agregue las dependencias:

- [Lombok](https://projectlombok.org/)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#using.devtools)
- [Spring Configuration Processor](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#appendix.configuration-metadata.annotation-processor)
- [Spring Web](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#web)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/3.3.4/reference/htmlsingle/index.html#actuator)

Realice un Maven clean and compile, y ejecute la clase de aplicación principal. Debería encontrar la página de error Whitelabel en [http://localhost:8080/](http://localhost:8080/)
![Screenshot2024-10-02000415](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02000415.png)

## 3. Dependencias esenciales + mejores prácticas

### 3.1. Dependencias

Agregue las dependencias:

- [JetBrains Java Annotations](https://mvnrepository.com/artifact/org.jetbrains/annotations)
- [AspectJ Tools (Compiler)](https://mvnrepository.com/artifact/org.aspectj/aspectjtools)
- [Micrometer Observation](https://mvnrepository.com/artifact/io.micrometer/micrometer-observation)
- [Micrometer Tracing Bridge OTel](https://mvnrepository.com/artifact/io.micrometer/micrometer-tracing-bridge-otel)
- [MapStruct Core](https://mvnrepository.com/artifact/org.mapstruct/mapstruct)

Y los plugins:

- [Apache Maven Compiler Plugin](https://mvnrepository.com/artifact/org.apache.maven.plugins/maven-compiler-plugin)
- [MapStruct Processor](https://mvnrepository.com/artifact/org.mapstruct/mapstruct-processor)
- [Lombok Mapstruct Binding](https://mvnrepository.com/artifact/org.projectlombok/lombok-mapstruct-binding)
- [fmt-maven-plugin](https://github.com/spotify/fmt-maven-plugin)
- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dentro del tag \<dependencies\>:

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

Dentro del tag \<plugins\> :

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

### 3.2. Crear un @RestController básico, será útil más adelante

_controller/UsersController.java_

```java
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsersController {
}
```

### 3.3. Logs

Teniendo en cuenta que no importe imprimir accidentalmente información confidencial (claves, contraseñas, etc.), me ha resultado útil loguear:

- Todo lo que entra.
- Todo lo que sale.

Para lograr esto vamos a utilizar:

- Un [Aspecto](https://www.baeldung.com/aspectj) que loguea antes y después de la ejecución de métodos públicos de controladores.
- Una [Filter interface](https://www.geeksforgeeks.org/spring-boot-servlet-filter/) que loguea información que no necesariamente llega a los controladores.

#### Aspecto

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

En la anotación Pointcut, apunta al paquete del controlador.
![Screenshot2024-10-02122012](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02122012.png)

#### Filtro

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

### 3.4. Normalización de los errores que se retornan

Una de las cosas más molestas al consumir un microservicio es que los errores que devuelve no son consistentes. En el trabajo me encuentro con muchos escenarios como:

service.com/users/-1 returns

```json
{
  "errorDescription": "User not found",
  "cause": "BAD REQUEST"
}
```

pero service.com/product/-1 retorna

```json
{
  "message": "not found",
  "error": 404
}
```

En estos casos la consistencia son los amigos que hicimos en el camino (y peor cuando los errores están escondidos detras de 200OK).

No queremos ser ese tipo de programadores. Vamos a gestionar los errores de forma adecuada con [@RestControllerAdvice](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) y [ProblemDetail](https://dev.to/noelopez/spring-rest-exception-handling-problem-details-2hkj), de modo que todos nuestros errores, al menos, tengan el mismo aspecto.

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

Ahora, cuando accedas a [http://localhost:8080/](http://localhost:8080/), no verás la página de error Whitelabel. En su lugar, encontrarás un json:

![Screenshot2024-10-02130952](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02130952.png)

A partir de ahora, todos los errores que devuelve este microservicio tienen la siguiente estructura:

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

Puede personalizar este objeto ajustando las propiedades ProblemDetail.

Si miras los logs, puedes encontrar información más detallada. Se ve tal que:

- -> LogFilter
- -> LoggingAspect
- -> GlobalControllerAdvice
- -> LoggingAspect
- -> LogFilter

Todos los logs tienen asociada una cadena larga similar a un UUID. Esto se debe a las dependencias de [micrometer](https://www.baeldung.com/micrometer). Cada solicitud que ingrese a este microservicio tendrá un número diferente, por lo que podemos diferenciar lo que sucede en caso de que aparezcan varias solicitudes al mismo tiempo y los registros comiencen a mezclarse entre sí.

### \[Opcional\] Personalizar @RestControllerAdvice.

En este momento, podrías estar pensando

> pero "No static resource" debería ser 404 en lugar de 500

A lo que te respondo que sí, tienes toda la razón y me gustaría que hubiera una forma de implementar ese comportamiento de forma predeterminada. Pero con esta normalización de errores, todo es 500 a menos que se explicite lo contrario. Creo que el sacrificio vale la pena.

Para que "No static resource" sea un error 404, agregue en la clase @RestControllerAdvice un nuevo método @ExceptionHandler(NoResourceFoundException.class). El resultado final se verá así:

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
}
```

Recuerda que en @RestControllerAdvice, el **orden de las funciones importa**. Debido a que cada excepción de cualquier tipo hereda de Exception.class, si la colocas al principio del archivo, siempre coincidirá. Por ese motivo, el método anotado con @ExceptionHandler(Exception.class) debe ser el último método público del archivo.

Ahora, cuando realiza una solicitud a [http://localhost:8080/](http://localhost:8080/), obtendrá el nuevo comportamiento esperado:

![Screenshot2024-10-02135949](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/Screenshot2024-10-02135949.png)

Repita este proceso para cualquier otra excepción que desee que tenga una respuesta predeterminada distinta de 500.

## Siguiente lectura

[La opinión de Pollito acerca del desarrollo en Spring Boot 3: Interfaces Spring server](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-3)
