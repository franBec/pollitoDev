---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 5: Configuración de interfaces feignClient"
date: 2024-10-04
description: "Configuración de interfaces feignClient"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-04-pollitos-opinion-on-spring-boot-development-5/miko.jpg
---

## Un poco de contexto

Esta es la quinta parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

## Roadmap

Debido a que las [interfaces feignClient](https://medium.com/@AlexanderObregon/navigating-client-server-communication-with-springs-feignclient-annotation-70376157cefd) son un enfoque declarativo para realizar llamadas a una API REST, se necesita mucha configuración antes de poder usarlas.

Algunos de estos pasos se podrían obviar en favor de un enfoque más simple, pero como esta es _la opinión de Pollito_, las cosas se harán como yo las considero correctas.

Este blog va a ser largo...

1. Crear una nueva excepción.
2. Gestionar la nueva excepción creada.

   - Qué NO hacer.
   - Qué hacer.

3. Cree una [implementación de Error Decoder](https://medium.com/@mtl98/handling-exceptions-in-feign-client-with-errordecoder-28a7a17f81a6).
4. Agregue el valor de la URL en application.yml.
5. Cree una clase [@ConfigurationProperties](https://www.baeldung.com/configuration-properties-in-spring-boot).
6. Configure el feignClient.
7. Cree un nuevo @Pointcut.

¡Comencemos!

## 1. Crear una nueva excepción

_exception/JsonPlaceholderException.java_

```java
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class JsonPlaceholderException extends RuntimeException{
  private final int status;
}
```

No es necesario crear campos en la clase, ya que podría estar vacía. Pero aquí hay algunas cosas que pueden ser útiles luego:

- **Status**: es útil cuando se maneja la excepción y se necesita aplicar una lógica diferente según el estado de la respuesta.
- **Una clase de error**: si el servicio al que estás llamando tiene una estructura de error definida (o incluso varias), y está definida en el archivo OAS de dicho servicio, entonces, al compilar, tendrás una clase POJO de Java que representa esa estructura de error. Úsalos aquí como campos private final transitent.

Aquí muestro un ejemplo de _una clase Exception que tiene un campo de error_.

```java
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import moe.jikan.models.Error; // <-- Generated by an openapi-generator-maven-plugin execution task

@RequiredArgsConstructor
@Getter
public class JikanException extends RuntimeException {
  private final transient Error error;
}
```

## 2. Gestionar la nueva excepción creada

### Qué NO hacer

A menos que haya una lógica de negocio que implique que se debe hacer algo cuando falla la llamada a la API REST (u otra muy buena razón), **siempre permita que la excepción se propague**.

No haga esto:

```java
SomeObject foo(){
  try{
    //business code
    Something something = someClient.getSomething();
    //more business code and eventually return SomeObject
  }catch(Exception e){
    return null;
  }
}
```

Para obtener más información sobre por qué esto es malo, recomiendo [este artículo sobre Fast Fail exception handling](https://medium.com/@qbyteconsulting/fast-fail-exception-handling-9bba83f7cce7)

### Qué hacer

Deje que la clase @RestControllerAdvice se encargue de la excepción propagada.

Una vez aquí, tiene dos opciones:

1. Si no le importa que sea convierta en un 500 INTERNAL ERROR, no haga nada y pase al siguiente paso.
2. Si le importa, gestione la excepción.

Vayamos al escenario 2.

_controller/advice/GlobalControllerAdvice.java_

```java
import dev.pollito.post.exception.JsonPlaceholderException;
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

  @ExceptionHandler(JsonPlaceholderException.class)
  public ProblemDetail handle(@NotNull JsonPlaceholderException e) {
    return buildProblemDetail(
        e, e.getStatus() == 400 ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR);
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

## 3. Cree una implementación de Error Decoder

Esta es la implementación más simple de Error Decoder:

_errordecoder/JsonPlaceholderErrorDecoder.java_

```java
import dev.pollito.post.exception.JsonPlaceholderException;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.jetbrains.annotations.NotNull;

public class JsonPlaceholderErrorDecoder implements ErrorDecoder {
  @Override
  public Exception decode(String s, @NotNull Response response) {
    return new JsonPlaceholderException(response.status());
  }
}
```

Puede ser tan creativo como lo necesite su lógica de negocio.

A continuación, se muestra un ejemplo de una implementación más compleja de Error Decoder. El error que obtiene de la llamada a la API REST se asigna a una clase Error que forma parte de una excepción, por lo que se puede usar en otro lugar (probablemente una clase @RestControllerAdvice).

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.pollito.springbootstartertemplate.exception.JikanException;
import feign.Response;
import feign.codec.ErrorDecoder;
import java.io.IOException;
import java.io.InputStream;
import moe.jikan.models.Error; // <-- Generated by an openapi-generator-maven-plugin execution task

public class JikanErrorDecoder implements ErrorDecoder {
  @Override
  public Exception decode(String s, Response response) {
    try (InputStream body = response.body().asInputStream()) {
      return new JikanException(new ObjectMapper().readValue(body, Error.class));
    } catch (IOException e) {
      return new Default().decode(s, response);
    }
  }
}
```

## 4. Agregue el valor de la URL en application.yml

Si todavía no ha cambiado el nombre de application.properties, cámbiele el nombre a application.yml.

_src/main/resources/application.yml_

```yml
jsonplaceholder:
  baseUrl: https://jsonplaceholder.typicode.com/
spring:
  application:
    name: post #name of your application here
```

- Es importante que el nombre de las claves raíz (en este ejemplo en particular, 'jsonplaceholder') esté en minúsculas.
  - De lo contrario, más adelante recibirá el error "Prefix must be in canonical form".
- El orden en este archivo no importa. Me gusta tener todo ordenado alfabéticamente.

## 5. Cree una clase @ConfigurationProperties

_config/properties/JsonPlaceholderConfigProperties.java_

```java
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jsonplaceholder")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JsonPlaceholderConfigProperties {
  String baseUrl;
}
```

## 6. Configure el feignClient

_api/config/JsonPlaceholderApiConfig.java_

```java
import com.typicode.jsonplaceholder.api.UserApi; //todo: replace here
import dev.pollito.post.config.properties.JsonPlaceholderConfigProperties;
import dev.pollito.post.errordecoder.JsonPlaceholderErrorDecoder;
import feign.Feign;
import feign.Logger;
import feign.gson.GsonDecoder;
import feign.gson.GsonEncoder;
import feign.okhttp.OkHttpClient;
import feign.slf4j.Slf4jLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScans;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScans(
    value = {
        @ComponentScan(
            basePackages = {
                "com.typicode.jsonplaceholder.api", //todo: replace here
            })
    })
@RequiredArgsConstructor
public class JsonPlaceholderApiConfig {
  private final JsonPlaceholderConfigProperties jsonPlaceholderConfigProperties;

  @Bean
  public UserApi userApi(){ //todo: replace here
    return Feign.builder()
        .client(new OkHttpClient())
        .encoder(new GsonEncoder())
        .decoder(new GsonDecoder())
        .errorDecoder(new JsonPlaceholderErrorDecoder())
        .logger(new Slf4jLogger(UserApi.class)) //todo: replace here
        .logLevel(Logger.Level.FULL)
        .target(UserApi.class, jsonPlaceholderConfigProperties.getBaseUrl()); //todo: replace here
  }
}
```

Reemplace los valores marcados usando esta imagen como guía:
![Screenshot2024-10-03232447](/uploads/2024-10-04-pollitos-opinion-on-spring-boot-development-5/Screenshot2024-10-03232447.png)

## 7. Cree un nuevo @Pointcut

Imprima logs de todo lo que entra y sale de la interfaz feignClient.

Para ello:

1. Cree un nuevo @Pointcut que coincida con el feignClient que le interesa.
2. Agregue el Pointcut a los métodos @Before y @AfterReturning.

Después de ambos pasos, la clase debería verse así:

```java
import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

  @Pointcut("execution(public * dev.pollito.post.controller..*.*(..))")
  public void controllerPublicMethodsPointcut() {}

  @Pointcut("execution(public * com.typicode.jsonplaceholder.api.*.*(..))")
  public void jsonPlaceholderApiMethodsPointcut() {}

  @Before("controllerPublicMethodsPointcut() || jsonPlaceholderApiMethodsPointcut()")
  public void logBefore(@NotNull JoinPoint joinPoint) {
    log.info(
        "["
            + joinPoint.getSignature().toShortString()
            + "] Args: "
            + Arrays.toString(joinPoint.getArgs()));
  }

  @AfterReturning(
      pointcut = "controllerPublicMethodsPointcut() || jsonPlaceholderApiMethodsPointcut()",
      returning = "result")
  public void logAfterReturning(@NotNull JoinPoint joinPoint, Object result) {
    log.info("[" + joinPoint.getSignature().toShortString() + "] Response: " + result);
  }
}
```

## Siguiente lectura

asd