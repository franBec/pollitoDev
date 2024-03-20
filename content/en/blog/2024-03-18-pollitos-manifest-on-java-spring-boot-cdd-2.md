---
author: "Franco Becvort"
title: "Pollito's Manifest on Java Spring Boot Contract-Driven Development for microservices 2"
date: 2024-03-18
description: "Provider generation"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/miko.jpeg
---

## openapi-generator-maven-plugin

Before getting into technical talk, let me introduce the main component that will help to embrace the Compontent-Driven Development practices: the dependency [org.openapitools » openapi-generator-maven-plugin » 7.4.0](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0).

![openapi-generator-maven-plugin.png](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/openapi-generator-maven-plugin.png)

It is a powerful Maven plugin for Java projects that automates the generation of API client libraries, server stubs, and documentation from OAS files.

## springBootStarterTemplate

[springBootStarterTemplate](https://github.com/franBec/springBootStarterTemplate) is a starting point for future projects, designed to embrace Component-Driven Development (CDD) practices. It encapsulates essential dependencies and best-practice boilerplates.

It has three branches:

- [main](https://github.com/franBec/springBootStarterTemplate/tree/main): Satisfies
  - _"A microservice complies at least with one contract, playing the provider role."_
  - The zero scenario of "_A microservice can play the consumer role in zero, one, or many contracts._"
- [feature/provider-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/provider-gen-example): An example implementation of main
- [feature/consumer-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/consumer-gen-example): An extension of feature/provider-gen-example, which satisfies everything stated in main plus
  - The one or many scenarios of "_A microservice can play the consumer role in zero, one, or many contracts._"

## springBootStarterTemplate -> feature/provider-gen

Let's do a run of each relevant file content.

![filetree](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-18200516.png)

### aspect.LoggingAspect

Centralized logging logic across the application, particularly for controller methods.

### config.LogFilterConfig

Configuration class in a Spring Boot application, dedicated to setting up a custom filter, specifically filter.**LogFilter**.

By default, it ensures that LogFilter is applied globally to all requests.

### config.WebConfig

Configuration class focusing on [Cross-Origin Resource Sharing (CORS) settings](https://www.baeldung.com/spring-cors).

By default, it allows cross-origin requests from any source, which is good for dev purposes. However this might not be suitable for a production environment.

### controller.advice.GlobalControllerAdvice

[Global exception handler](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) designed to catch and handle various exceptions that may occur during the processing of web requests.

By default, it handles:

- **MissingServletRequestParameterException:** Caught when required request parameters are missing.
- **ConstraintViolationException:** Handled when Bean Validation API constraint violations occur.
- **MethodArgumentTypeMismatchException:** Caught when a method argument is not the expected type.
- **MethodArgumentNotValidException:** Handled when an argument annotated with @Valid fails validation.
- **Exception:** A generic catch-all for any other exceptions not explicitly handled by the other methods.

Each handler method returns a ResponseEntity\<Error\>, where Error is meant to be a schema in your provider OAS file.

By default also contains the annotation [@Order()](https://www.baeldung.com/spring-order) empty with no args. This means that the advice runs last in relation to other @ControllerAdvice components.

### filter.LogFilter

It implements a [servlet filter](https://www.geeksforgeeks.org/spring-boot-servlet-filter/) for logging request and response details.

- It initializes the [Mapped Diagnostic Context (MDC)](https://www.baeldung.com/mdc-in-log4j-2-logback) with a unique session ID for each request, facilitating easier tracing of logs related to specific requests.
- It logs details about the incoming request, including its method, URI, query string, and headers.
- After the request has been processed, it also logs the response status.

### util.Constants

Container for application-wide constants.

By default it only contains the constant SLF4J_MDC_SESSION_ID_KEY, used in **LogFilter** as a key in the SLF4J Mapped Diagnostic Context (MDC) for storing and retrieving a unique session identifier.

Feel free to add all your needed constants here.

### util.ErrorResponseBuilder

Utility for constructing error response entities, so all error responses have the same structure.

### SpringBootStarterTemplateApplication

Default entry point to a Spring Boot application.

### resources > openapi files

This is a totally arbitrary folder inside resources where I decided is good enough to put all the OAS files.

Is important to remember that in the definition of contract I made up, we need to comply with inputs, outputs, and errors.

> Microservices must comply with a contract, which defines inputs, outputs, and errors.

So, each contract should have an Error-like schema (no need for it to be named Error), which after generation tasks, will be used for constructing standardized error responses.

Here is my recommended Error schema:

```yaml
Error:
  type: object
  properties:
    timestamp:
      type: string
      description: The date and time when the error occurred in ISO 8601 format.
      format: date-time
      example: "2024-01-04T15:30:00Z"
    session:
      type: string
      format: uuid
      description: A unique UUID for the session instance where the error happened, useful for tracking and debugging purposes.
    error:
      type: string
      description: A brief error message or identifier.
    message:
      type: string
      description: A detailed error message.
    path:
      type: string
      description: The path that resulted in the error.
```

Feel free to organize files in subfolders if necessary. Don't forget to maintain consistency in the pom.xml (more on that later).

### resources > logback.xml

Configuration to log information to the console, with a customized pattern that includes a session ID for better traceability of log entries.

### pom.xml

- This template uses [Spring Boot 3.2.3](https://github.com/spring-projects/spring-boot/releases/tag/v3.2.3) and [Java 21](https://www.geeksforgeeks.org/java-jdk-21-new-features-of-java-21/)

- Basic dependencies: you'll find these in almost every Spring Boot 3 application out there:

  - [org.springframework.boot » spring-boot-starter-web » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web/3.2.3): Essential for building web applications using Spring Boot
  - [org.springframework.boot » spring-boot-devtools » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-devtools/3.2.3): Set of tools that make the development process with Spring Boot more efficient.
  - [org.springframework.boot » spring-boot-configuration-processor » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-configuration-processor/3.2.3): Generates metadata for configuration properties, making them easier to work with in IDEs.
  - [org.projectlombok » lombok » 1.18.30](https://mvnrepository.com/artifact/org.projectlombok/lombok/1.18.30): Reduces boilerplate code like getters, setters, and constructors through annotations.
  - [org.springframework.boot » spring-boot-starter-test » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-test/3.2.3): Includes support for JUnit, Spring Test & Spring Boot Test, AssertJ, Hamcrest, and a bunch of other libraries necessary for thorough testing.

- AOP:

  - [org.aspectj » aspectjweaver » 1.9.21.2](https://mvnrepository.com/artifact/org.aspectj/aspectjweaver/1.9.21.2): Modifies Java classes to weave in the aspects.

- Mapping:

  - [org.mapstruct » mapstruct » 1.5.5.Final](https://mvnrepository.com/artifact/org.mapstruct/mapstruct/1.5.5.Final): Mappings between Java bean types based on a convention over configuration approach. [There are many mappers out there](https://www.baeldung.com/java-performance-mapping-frameworks), is a pick your own poison situation.

- Dependencies required by [org.openapitools » openapi-generator-maven-plugin » 7.4.0](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0) when generating provider code:

  - [io.swagger.core.v3 » swagger-core-jakarta » 2.2.20](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta/2.2.20): Solves error package io.swagger.v3.oas.annotations does not exist.
  - [org.openapitools » jackson-databind-nullable » 0.2.6](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable/0.2.6): Solves error package org.openapitools.jackson.nullable does not exist.
  - [org.springframework.boot » spring-boot-starter-validation » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation/3.2.3): Solves validations being ignored.

- Plugins:

  - [org.springframework.boot » spring-boot-maven-plugin » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-maven-plugin/3.2.3) : Used for explicitly excluding lombok from the final packaged application, since Lombok is a compile-time only tool that helps reduce boilerplate code.
  - [org.apache.maven.plugins » maven-compiler-plugin » 3.12.1](https://mvnrepository.com/artifact/org.apache.maven.plugins/maven-compiler-plugin/3.12.1): Compiles the sources of your project.
  - [org.mapstruct » mapstruct-processor » 1.5.5.Final](https://mvnrepository.com/artifact/org.mapstruct/mapstruct-processor/1.5.5.Final): Needed to make mapstruct and lombok coexist
  - [org.projectlombok » lombok-mapstruct-binding » 0.2.0](https://mvnrepository.com/artifact/org.projectlombok/lombok-mapstruct-binding/0.2.0): Needed to make mapstruct and lombok coexist.
  - [com.spotify.fmt » fmt-maven-plugin » 2.23](https://mvnrepository.com/artifact/com.spotify.fmt/fmt-maven-plugin/2.23): Formats your Java source code to comply with [Google Java Format](https://google.github.io/styleguide/javaguide.html).
  - [org.openapitools » openapi-generator-maven-plugin » 7.4.0](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0): A Maven plugin to support the OpenAPI generator project. Is a code generator that embraces CDD practices.

This is an example of how to configure it for provider generation:

```xml
<plugin>
  <groupId>org.openapitools</groupId>
  <artifactId>openapi-generator-maven-plugin</artifactId>
  <version>7.2.0</version>
  <executions>
      <execution>
          <id>provider generation - your OAS file</id>
          <goals>
              <goal>generate</goal>
          </goals>
          <configuration>
              <inputSpec>${project.basedir}/src/main/resources/openapi/your OAS file</inputSpec>
              <generatorName>spring</generatorName>
              <output>${project.build.directory}/generated-sources/openapi/</output>
              <apiPackage>dev.pollito.springbootstartertemplate.api</apiPackage>
              <modelPackage>dev.pollito.springbootstartertemplate.models</modelPackage>
              <configOptions>
                  <interfaceOnly>true</interfaceOnly>
                  <useSpringBoot3>true</useSpringBoot3>
                  <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
              </configOptions>
          </configuration>
      </execution>
  </executions>
</plugin>
```

Let's check what's going on here.

- **Group ID and Artifact ID:** Identifies the OpenAPI Generator plugin itself.
- **Version:** Specifies the version of the OpenAPI Generator plugin.
- **Execution block:** Defines when and how the plugin's goal(s) should be executed within the build lifecycle.
  - **ID:** A unique identifier for this execution instance.
  - **Goals:** Specifies the generate goal, which tells the plugin to perform code generation.
  - **Configuration Block:** Provides detailed instructions on how the code generation should be performed.
    - **inputSpec:** Points to the location of the OpenAPI spec file that does the role of being the provider contract. In this case, animeinfo.yaml located under src/main/resources/openapi/ .
    - **generatorName:** Specifies the spring generator, indicating that the code should be generated with Spring in mind, tailoring the output for Spring-based projects.
    - **output:** The directory where the generated code should be placed. Personally I think target/generated-sources/openapi/ directory is a good place.
    - **apiPackage and modelPackage:** Define the Java package names for the generated API interfaces and model classes, respectively. These values are up to you. Personally I like to use the OAS file server url in reverse url notation. In case that info is not available, using the project groupId + artifactId is common practice
    - **configOptions:** A set of additional configuration options.
      - **interfaceOnly:** It set to true. You will need to create your own implementation anyways.
      - **useSpringBoot3:** Ensures compatibility with Spring Boot 3.
      - **useEnumCaseInsensitive:** If there are generated enums, it is configured to be case-insensitive, adding flexibility to how their values are deserialized.

### uml diagram

![uml](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/uml-provider.jpg)

## How to use this template

0. Clone the repo and remove its relationship to the original repository.

- **Optional but recommended** give it your own identity to the repo.

1. Add a OAS file in resources/openapi.

- Be sure your OAS have the recommended Error schema.
- If the schema is named diferent than Error, the code won't compile, and you'll need to change some imports as indicated by the compiler. Is not a big deal.

2. In pom.xml, uncomment the block code related to openapi-generator-maven-plugin.
3. Edit the block code so it points to your recently added OAS file in resources/api.

- Here you can also edit apiPackage and modelPackage tags. Again, the code won't compile, and you'll need to change some imports as indicated by the compiler. Is not a big deal x2.

4. maven clean + maven compile.
5. Create a @RestController and implement the generated interface.
6. Run the application.

## Implementation example

You can find this code in feature/provider-gen-example

### 0. Clone the repo and remove its relationship to the original repository.

Follow these steps

```bash
git clone https://github.com/franBec/springBootStarterTemplate.git
```

```bash
cd springBootStarterTemplate
```

```bash
rm -rf .git
git init
```

Now you have a totally new clean repo.

**Optional but recommended** give it your own identity to the repo. For this:

- Modify the groupId and artifactId in the pom.xml
- Refactor Your Package Structure to match the new groupId: This can usually be done easily within an IDE like IntelliJ IDEA or Eclipse by right-clicking on the package and choosing Refactor -> Rename.

### 1. Add a OAS file in resources/openapi

For this, I will yoink the [petstore example](https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml) from [The OpenAPI Specification github](https://github.com/OAI/OpenAPI-Specification).

Don't forget to add (or in this case replace the already existing) Error schema in the OAS with the recommended Error schema from this blog.

### 2. In pom.xml, uncomment the block code related to openapi-generator-maven-plugin

This is easy, just delete the <--- ---> that surround the block code

### 3. Edit the block code so it points to your recently added OAS file in resources/api

Here it how it looks after editing:

```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>7.2.0</version>
    <executions>
        <execution>
            <id>provider generation - petstore.yaml</id>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <inputSpec>${project.basedir}/src/main/resources/openapi/petstore.yaml</inputSpec>
                <generatorName>spring</generatorName>
                <output>${project.build.directory}/generated-sources/openapi/</output>
                <apiPackage>io.swagger.petstore.api</apiPackage>
                <modelPackage>io.swagger.petstore.models</modelPackage>
                <configOptions>
                    <interfaceOnly>true</interfaceOnly>
                    <useSpringBoot3>true</useSpringBoot3>
                    <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
                </configOptions>
            </configuration>
        </execution>
    </executions>
</plugin>
```

I edited the apiPackage and modelPackage tag values, so I get the compilation error and show how to fix.

### 4. maven clean + maven compile

As stated, we get _package dev.pollito.springbootstartertemplate.models does not exist_
![compile errors](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19115632.png)

Let's fix this. In each file, change the broken import. Be sure to import the one that was generated by the plugin. Error is a very common name, you could import the wrong one.

In this case, the one we need is the second one, from io.swagger.petstore.models

![compile errors](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19115917.png)

After fixing the imports, try compiling again. We should be good to go.

### 5. Create a @RestController and implement the generated interface.

I like to mantain a cohesion between the name the interface was given when generated, and my controller class name. So, let's look in the generated-sources which name the interface was given on generation.

![generated interface](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19120409.png)

There we can see, it was called _PetsApi_, so let´s create _PetsController_:

- Create it in the controller package (beware not to put it inside the advice package by accident).
- Give it the @RestController annotation
- Make it implement _PetsApi_.

```java
@RestController
public class PetsController implements PetsApi {
}
```

In intelliJ IDEA, if you press Ctrl+O inside a class that implements something, you'll get a pop up asking you which interface methods you want to override/implement.

Here select everything you need. Usually you won't need anything from java.lang.Object, and also you won't need the one method that returns Optional NativeWebRequest.

![ctrl+O](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19120950.png)

Now we have all this code:

```java
@RestController
public class PetsController implements PetsApi {
    @Override
    public ResponseEntity<Void> createPets(Pet pet) {
        return PetsApi.super.createPets(pet);
    }

    @Override
    public ResponseEntity<List<Pet>> listPets(Integer limit) {
        return PetsApi.super.listPets(limit);
    }

    @Override
    public ResponseEntity<Pet> showPetById(String petId) {
        return PetsApi.super.showPetById(petId);
    }
}
```

### 6. Run the application

Try this request:

```
curl --location 'http://localhost:8080/pets'
```

You'll recieve an empty body with a 501 Not Implemented status.

And the logs show the following information:

```
2024-03-19 12:20:04 INFO  d.p.s.filter.LogFilter [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - >>>> Method: GET; URI: /pets; QueryString: null; Headers: {user-agent: PostmanRuntime/7.37.0, accept: */*, cache-control: no-cache, postman-token: 3c483439-921c-48d5-ab28-a85d76fce2e8, host: localhost:8080, accept-encoding: gzip, deflate, br, connection: keep-alive}
2024-03-19 12:20:04 INFO  d.p.s.aspect.LoggingAspect [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - [PetsController.listPets(..)] Args: [null]
2024-03-19 12:20:05 INFO  d.p.s.aspect.LoggingAspect [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - [PetsController.listPets(..)] Response: <501 NOT_IMPLEMENTED Not Implemented,[]>
2024-03-19 12:20:05 INFO  d.p.s.filter.LogFilter [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - <<<< Response Status: 501
```

## Next lecture

[Pollito&rsquo;s Manifest on Java Spring Boot Contract-Driven Development for microservices 3](/en/blog/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3)
