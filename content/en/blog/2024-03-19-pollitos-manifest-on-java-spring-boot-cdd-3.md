---
author: "Franco Becvort"
title: "Pollito's Manifest on Java Spring Boot Contract-Driven Development for microservices 3"
date: 2024-03-19
description: "Consumer generation"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/miko.jpeg
---

This is a continuation of [Pollito&rsquo;s Manifest on Java Spring Boot Contract-Driven Development for microservices 2](/en/blog/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2).

## springBootStarterTemplate -> feature/consumer-gen-example

[springBootStarterTemplate](https://github.com/franBec/springBootStarterTemplate) has three branches:

- [main](https://github.com/franBec/springBootStarterTemplate/tree/main): Satisfies
  - _"A microservice complies at least with one contract, playing the provider role."_
  - The zero scenario of "_A microservice can play the consumer role in zero, one, or many contracts._"
- [feature/provider-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/provider-gen-example): An example implementation of main
- [feature/consumer-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/consumer-gen-example): An extension of feature/provider-gen-example, which satisfies everything stated in main plus
  - The one or many scenarios of "_A microservice can play the consumer role in zero, one, or many contracts._"

Here I'll explain the steps I did to create feature/consumer-gen-example, so you can make your own provider + consumer microservice.

## Steps to make your microservice into a provider + consumer

0. Do all the steps for making the microservice into a provider first.
1. Add provider-generation specific dependencies.

Then for each contract where the microservice will play the consumer role, do:

2. Add the OAS file in resources/openapi.
3. Add an execution block in openapi-generator-maven-plugin.
4. Create a new Exception.
5. Handle the new created exception.
6. Create an Error Decoder that will throw the Exception.
7. Create the corresponding URL value in application.yml.
8. Create a @Configuration @ConfigurationProperties class to read the value from application.yml.
9. Configure a Feign client for interacting with the generated consumer API interface.
10. Create a pointcut in LoggingAspect.

Let's create an example. You can find it finished in feature/consumer-gen-example

### 0. Do all the steps for making the microservice into a provider first

For this, I'm gonna start from feature/provider-gen, and follow the steps to create a provider microservice with this a simple OAS called _animeinfo.yaml_

### 1. Add provider-generation specific dependencies

- [javax.annotation » javax.annotation-api » 1.3.2](https://mvnrepository.com/artifact/javax.annotation/javax.annotation-api/1.3.2): Solves error package javax.annotation does not exist.
- [io.github.openfeign » feign-okhttp » 13.2.1](https://mvnrepository.com/artifact/io.github.openfeign/feign-okhttp/13.2.1): Solves error package feign.okhttp does not exist.
- [org.springframework.cloud » spring-cloud-starter-openfeign » 4.1.0](https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-openfeign/4.1.0): Solves error package feign.form does not exist.
- [io.github.openfeign » feign-jackson » 13.2.1](https://mvnrepository.com/artifact/io.github.openfeign/feign-jackson/13.2.1): Solves error package feign.jackson does not exist.
- [com.google.code.findbugs » jsr305 » 3.0.2](https://mvnrepository.com/artifact/com.google.code.findbugs/jsr305/3.0.2): Solves error cannot find symbol @javax.annotation.Nullable.
- [org.junit.jupiter » junit-jupiter-api » 5.10.2](https://mvnrepository.com/artifact/org.junit.jupiter/junit-jupiter-api/5.10.2): Solves error package org.junit.jupiter.api does not exist.

Additionally, you will need to create configurations for the generated consumer interface(s). That is usually done with Gson:

- [io.github.openfeign » feign-gson » 13.2.1](https://mvnrepository.com/artifact/io.github.openfeign/feign-gson/13.2.1): Solves error Cannot resolve symbol 'GsonEncoder'.

Here is the pom.xml fragment so you can copy paste into the dependencies tag:

```xml
<dependency>
    <groupId>javax.annotation</groupId>
    <artifactId>javax.annotation-api</artifactId>
    <version>1.3.2</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
    <version>13.2.1</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>4.1.0</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-jackson</artifactId>
    <version>13.2.1</version>
</dependency>
<dependency>
    <groupId>com.google.code.findbugs</groupId>
    <artifactId>jsr305</artifactId>
    <version>3.0.2</version>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.10.2</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-gson</artifactId>
    <version>13.2.1</version>
</dependency>
```

### 2. Add the OAS file in resources/openapi

Here I'll add [jikan API](https://raw.githubusercontent.com/jikan-me/jikan-rest/master/storage/api-docs/api-docs.json), an unofficial [MyAnimeList](https://myanimelist.net/) API.

### 3. Add an execution block in openapi-generator-maven-plugin

Here's the execution block ready for you to copy paste it.

```xml
<execution>
  <id>consumer generation - jikan</id>
  <goals>
    <goal>generate</goal>
  </goals>
  <configuration>
    <inputSpec>${project.basedir}/src/main/resources/openapi/jikan.json</inputSpec>
    <generatorName>java</generatorName>
    <library>feign</library>
    <output>${project.build.directory}/generated-sources/openapi/</output>
    <apiPackage>moe.jikan.api</apiPackage>
    <modelPackage>moe.jikan.models</modelPackage>
    <configOptions>
      <feignClient>true</feignClient>
      <interfaceOnly>true</interfaceOnly>
      <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
    </configOptions>
  </configuration>
</execution>
```

What are the differences between an provider generation execution and a consumer generation execution?

| Aspect                     | Provider Generation                               | Consumer Generation                                      |
| -------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| **Purpose**                | Generate server-side code.                        | Generate client-side code to interact with the API.      |
| **Generator Name**         | **spring** (optimized for Spring Boot)            | **java** (generic Java code generation)                  |
| **Library**                | N/A (not specified as it's inherently for Spring) | **feign** (uses Feign library for HTTP requests)         |
| **Special Configurations** | **useSpringBoot3**: Optimized for Spring Boot 3.  | **feignClient**: Generated interfaces are Feign clients. |

Run and compile.

In this example, an error occurs in consumer generation - jikan. Here is the important fragment of it.

```
[INFO] --- openapi-generator-maven-plugin:7.2.0:generate (consumer generation - jikan) @ springBootStarterTemplate ---
[WARNING] C:\code\pollito\springBootStarterTemplate\src\main\resources\openapi\jikan.json [0:0]: unexpected error in Open-API generation
C:\code\pollito\springBootStarterTemplate\src\main\resources\openapi\jikan.json [0:0]: unexpected error in Open-API generation


org.openapitools.codegen.SpecValidationException: There were issues with the specification. The option can be disabled via validateSpec (Maven/Gradle) or --skip-validate-spec (CLI).
 | Error count: 3, Warning count: 7
Errors:
	-paths.'/anime'(get).parameters. There are duplicate parameter values
	-paths.'/manga'(get).parameters. There are duplicate parameter values
	-paths.'/schedules'(get).parameters. There are duplicate parameter values
Warnings:
	-paths.'/anime'(get).parameters. There are duplicate parameter values
	-paths.'/manga'(get).parameters. There are duplicate parameter values
	-paths.'/schedules'(get).parameters. There are duplicate parameter values

```

Luckly is a very easy error to fix. We have to delete those duplicated parameter values. For that I'll use [Swagger Editor](https://editor.swagger.io/) import file, and edit it myself.

For some reason the page asks to convert to yaml, which I accept. We can work with either of those formats, the plugin doesn't care.

![convert](/uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/Screenshot2024-03-19211441.png)

Also while fixing the error, I noticed that there's documentation about how an error looks, but no error schema, so I create one.

Replace the file, and try again. Now we should be good to go.

### 4. Create a new Exception

If we checked the target/generated-sources/openapi folder, we will find inside the moe.jikan package all the different generated APIs

![generated api clients](/uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/Screenshot2024-03-19212226.png)

Lucky for us, all those APIs produce the same error, so we can create just one exception

The exception can have as many fields as you want, but at minimal, needs to have the Error generated by the corresponding OAS.

```java
@RequiredArgsConstructor
@Getter
public class JikanException extends RuntimeException {
  private final transient Error error;
}
```

Always check from where Error is being imported. Here we want it from _moe.jikan.models_

![import the correct error](/uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/Screenshot2024-03-19214453.png)

### 5. Handle the new created exception

You can use the already existing **GlobalControllerAdvice**, or create a new one specifically for the controller that eventually calls down the API client interface that can throw an error.

Here, I'll create a new @RestControllerAdvice as an exercise.

Here you can handle your errors as you need. This is an example of how I do it in this scenario. I will return:

- 404 NOT FOUND when anime is not found
- 500 INTERNAL SERVER ERROR under any other circumstances.

Always check from where Error is being imported. Here we want it from _dev.pollito.springbootstartertemplate.models_

```java
@RestControllerAdvice(assignableTypes = AnimeController.class)
public class AnimeControllerAdvice {

  @ExceptionHandler(JikanException.class)
  public static ResponseEntity<Error> handle(JikanException e) {
    if (isNotFound(e)) {
      return buildErrorResponse(HttpStatus.NOT_FOUND, e, e.getError().getMessage());
    }

    return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e, e.getError().getMessage());
  }

  private static boolean isNotFound(JikanException e) {
    return Objects.nonNull(e.getError().getStatus())
        && e.getError().getStatus() == HttpStatus.NOT_FOUND.value();
  }
}
```

### 6. Create an Error Decoder that will throw the exception

This is a very basic and standard error decoder, nothing fancy going on here.

Always check from where Error is being imported. Here we want it from _moe.jikan.models_

```java
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

### 7. Create the corresponding URL value in application.yml

By default, the generated interface will use the URL in the OAS server section. Usually in many scenarios, that value doesn't exist, is a mock URL, or it works but is pointing to a development or testing ambient.

Defining a client URL in application.yml (or any external configuration file) rather than hardcoding it as a constant in your code, is a common best practice for several reasons:

- **Environment Flexibility:** In real-world applications, you often have different environments such as development, testing, staging, and production. Each of these environments might require different configurations, including different client URLs. Externalizing these values to a configuration file like application.yml makes it easy to change them per environment without changing the codebase.
- **Ease of Maintenance:** When a value is likely to change over time, keeping it in a configuration file means you can update it without having to recompile your code. This is especially useful for URLs, which can change due to new deployments, service migrations, or domain changes.
- **Security:** Hardcoding sensitive information, like URLs to internal systems or services, in the source code can pose a security risk, especially if the code is stored in a public or shared repository. Keeping such information in external configuration files helps in securing sensitive data, especially when combined with configuration management tools that support encryption of such properties.
- **Separation of Concerns:** By keeping configuration separate from code, you maintain a clear separation of concerns. Code defines behavior, while configuration specifies the environment-specific parameters. This adheres to the principles of [Twelve-Factor App methodology](https://12factor.net/), enhancing modularity and maintainability.
- **Dynamic Configuration:** Using external configurations allows for dynamic changes without the need for a new deployment. Some frameworks and platforms support refreshing configuration properties on the fly, which can be incredibly useful for feature toggles, adjusting log levels, or updating URLs without downtime.
- **Collaboration and Accessibility:** Developers, operations teams, and sometimes even automated deployment tools might need access to these configurations to adjust application behavior in different environments. Having them externalized in application.yml makes this process more accessible and collaborative.

For this example, the application.yml URL definition would look something like this:

```yaml
jikan:
  baseUrl: https://api.jikan.moe/v4
```

### 8. Create a @Configuration @ConfigurationProperties class to read the value from application.yml

This class reads values from application.yml. Here is an implementation example.

```java
@Configuration
@ConfigurationProperties(prefix = "jikan")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JikanProperties {
  String baseUrl;
}
```

### 9. Configure a Feign client for interacting with the generated consumer API interface

This class configures a Feign client for interacting with the generated consumer API interface, complete with custom serialization, deserialization, logging, and error handling.

Here is an implementation example:

```java
@Configuration
@ComponentScans(
        value = {
                @ComponentScan(
                        basePackages = {
                                "moe.jikan.api",
                        })
        })
@RequiredArgsConstructor
public class AnimeApiConfig {

  private final JikanProperties jikanProperties;

  @Bean
  public AnimeApi jikanApi() {
    return Feign.builder()
            .client(new OkHttpClient())
            .encoder(new GsonEncoder())
            .decoder(new GsonDecoder())
            .errorDecoder(new JikanErrorDecoder())
            .logger(new Slf4jLogger(AnimeApi.class))
            .logLevel(Logger.Level.FULL)
            .target(AnimeApi.class, jikanProperties.getBaseUrl());
  }
}
```

### 10. Create a pointcut in LoggingAspect

It is a nice practice to log whatever goes into and come out an API call. Beware you may accidently log sensible information.

Here I create jikanApiMethodsPointcut(), and add it into the logBefore() and logAfterReturning() methods.

```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {

  @Pointcut("execution(public * dev.pollito.springbootstartertemplate.controller..*.*(..))")
  public void controllerPublicMethodsPointcut() {}

  @Pointcut("execution(public * moe.jikan.api.*.*(..))")
  public void jikanApiMethodsPointcut() {}

  @Before("controllerPublicMethodsPointcut() || jikanApiMethodsPointcut()")
  public void logBefore(JoinPoint joinPoint) {
    log.info(
        "["
            + joinPoint.getSignature().toShortString()
            + "] Args: "
            + Arrays.toString(joinPoint.getArgs()));
  }

  @AfterReturning(
      pointcut = "controllerPublicMethodsPointcut() || jikanApiMethodsPointcut()",
      returning = "result")
  public void logAfterReturning(JoinPoint joinPoint, Object result) {
    log.info("[" + joinPoint.getSignature().toShortString() + "] Response: " + result);
  }
}
```

## Let's finish the example by putting everything together with business logic

1. Create a mapper interface.
2. Create a service interface.
3. Implement the interface.
4. Inject the interface in the controller.

### 1. Create a mapper interface

```java
@Mapper(componentModel = "spring")
public interface AnimeInfoMapper {

  @Mapping(source = "response.data.completed", target = "viewers")
  AnimeStatisticsViewers map(AnimeStatistics response);
}
```

### 2. Create a service interface

```java
public interface AnimeInfoService {
    AnimeStatisticsViewers getAnimeInfo(Integer id);
}
```

### 3. Implement the interface

```java
@Service
@RequiredArgsConstructor
public class AnimeInfoServiceImpl implements AnimeInfoService {
    private final AnimeApi animeApi;
    private final AnimeInfoMapper animeInfoMapper;

    @Override
    public AnimeStatisticsViewers getAnimeInfo(Integer id) {
        return animeInfoMapper.map(animeApi.getAnimeStatistics(id));
    }
}
```

### 4. Inject the interface in the controller

```java
@RestController
@RequiredArgsConstructor
public class AnimeInfoController implements AnimeApi {
  private final AnimeInfoService animeInfoService;

  @Override
  public ResponseEntity<AnimeStatisticsViewers> getAnimeStatisticsViewers(Integer id) {
    return ResponseEntity.ok(animeInfoService.getAnimeStatisticsViewers(id));
  }
}
```

### Give it a try

```shell
curl --location 'http://localhost:8080/anime?id=846'
```

Response:

```json
{
  "viewers": 119259
}
```

We get this in the logs

```
2024-03-21 09:29:44 INFO  o.a.c.c.C.[Tomcat].[localhost].[/] [SessionID: ] - Initializing Spring DispatcherServlet 'dispatcherServlet'
2024-03-21 09:29:44 INFO  o.s.web.servlet.DispatcherServlet [SessionID: ] - Initializing Servlet 'dispatcherServlet'
2024-03-21 09:29:44 INFO  o.s.web.servlet.DispatcherServlet [SessionID: ] - Completed initialization in 1 ms
2024-03-21 09:29:44 INFO  d.p.s.filter.LogFilter [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - >>>> Method: GET; URI: /anime; QueryString: id=846; Headers: {user-agent: PostmanRuntime/7.37.0, accept: */*, cache-control: no-cache, postman-token: 4dbf0736-7574-4c38-b034-e8411d6928ad, host: localhost:8080, accept-encoding: gzip, deflate, br, connection: keep-alive}
2024-03-21 09:29:44 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeController.getAnimeStatisticsViewers(..)] Args: [846]
2024-03-21 09:29:44 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeApi.getAnimeStatistics(..)] Args: [846]
2024-03-21 09:29:46 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeApi.getAnimeStatistics(..)] Response: class AnimeStatistics {
    data: class AnimeStatisticsData {
        watching: 5048
        completed: 119259
        onHold: null
        dropped: 3390
        planToWatch: null
        total: 161889
        scores: [class AnimeStatisticsDataScoresInner {
            score: 1
            votes: 287
            percentage: 0.3
        }, class AnimeStatisticsDataScoresInner {
            score: 2
            votes: 158
            percentage: 0.2
        }, class AnimeStatisticsDataScoresInner {
            score: 3
            votes: 323
            percentage: 0.4
        }, class AnimeStatisticsDataScoresInner {
            score: 4
            votes: 854
            percentage: 0.9
        }, class AnimeStatisticsDataScoresInner {
            score: 5
            votes: 2631
            percentage: 2.9
        }, class AnimeStatisticsDataScoresInner {
            score: 6
            votes: 6871
            percentage: 7.5
        }, class AnimeStatisticsDataScoresInner {
            score: 7
            votes: 19052
            percentage: 20.8
        }, class AnimeStatisticsDataScoresInner {
            score: 8
            votes: 28533
            percentage: 31.1
        }, class AnimeStatisticsDataScoresInner {
            score: 9
            votes: 20183
            percentage: 22.0
        }, class AnimeStatisticsDataScoresInner {
            score: 10
            votes: 12904
            percentage: 14.1
        }]
    }
}
2024-03-21 09:29:46 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeController.getAnimeStatisticsViewers(..)] Response: <200 OK OK,class AnimeStatisticsViewers {
    viewers: 119259
},[]>
2024-03-21 09:29:46 INFO  d.p.s.filter.LogFilter [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - <<<< Response Status: 200
```
