---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 4: feignClient interfaces"
date: 2024-10-02
description: "feignClient interfaces"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/DALL·E2025-01-22203233.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [1. More dependencies](#1-more-dependencies)
  * [2. Write an OAS yaml file](#2-write-an-oas-yaml-file)
  * [3. Generate the interfaces.](#3-generate-the-interfaces)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the fourth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we are creating a Java Spring Boot Microservice that handles information about users.
    - You can find the code of the final result at [this GitHub repo - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
    - Here's a diagram of its components. For a deep explanation visit [Understanding the project](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-understanding-the-project)
      ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

So far we created:
- LogFilter.
- GlobalControllerAdvice.
- UsersController.

In this blog we are going to create the UsersApi. Let's start!

## 1. More dependencies

These are:

- [Jakarta Annotations API](https://mvnrepository.com/artifact/jakarta.annotation/jakarta.annotation-api)
- [Spring Cloud Starter OpenFeign](https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-openfeign)
- [Feign OkHttp](https://mvnrepository.com/artifact/io.github.openfeign/feign-okhttp)
- [Feign Jackson](https://mvnrepository.com/artifact/io.github.openfeign/feign-jackson)
- [Feign Gson](https://mvnrepository.com/artifact/io.github.openfeign/feign-gson)
- [JUnit Jupiter API](https://mvnrepository.com/artifact/org.junit.jupiter/junit-jupiter-api)

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

Under the \<dependencies\> tag:

```xml
<dependency>
    <groupId>jakarta.annotation</groupId>
    <artifactId>jakarta.annotation-api</artifactId>
    <version>3.0.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>4.1.3</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
    <version>13.4</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-jackson</artifactId>
    <version>13.4</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-gson</artifactId>
    <version>13.4</version>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.11.1</version>
</dependency>
```

## 2. Write an OAS yaml file

Sometimes you'll get lucky and find that the REST endpoint you want to consume already has an available OAS. But in case it doesn't, you'll have to write a representation of what to expect from it.

For this scenario, I'm going to be using the /users from [{JSON} Placeholder](https://jsonplaceholder.typicode.com/) to get fake data about users. I was not able to find an OAS of it, so I made my own.

_resources/openapi/jsonplaceholder.yaml_

```yaml
openapi: 3.0.3
info:
  version: 1.0.0
  title: JSON Placeholder API
  description: See https://jsonplaceholder.typicode.com/
servers:
  - url: "https://jsonplaceholder.typicode.com/"
paths:
  /users:
    get:
      tags:
        - User
      operationId: getUsers
      summary: Get list of all users
      responses:
        "200":
          description: List of all users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/User"
        default:
          description: Error
          content:
            application/json:
              schema:
                type: object
components:
  schemas:
    Address:
      description: User address
      properties:
        city:
          description: Address city
          example: "Gwenborough"
          type: string
        geo:
          $ref: "#/components/schemas/Geo"
        street:
          description: Address street
          example: "Kulas Light"
          type: string
        suite:
          description: Address suit
          example: "Apt. 556"
          type: string
        zipcode:
          description: Adress zipcode
          example: "92998-3874"
          type: string
      type: object
    Company:
      description: User company
      properties:
        bs:
          description: Company business
          example: "harness real-time e-markets"
          type: string
        catchPhrase:
          description: Company catch phrase
          example: "Multi-layered client-server neural-net"
          type: string
        name:
          description: Company name
          example: "Romaguera-Crona"
          type: string
      type: object
    Geo:
      description: Address geolocalization
      properties:
        lat:
          description: Geolocalization latitude
          example: "-37.3159"
          type: string
        lng:
          description: Geolocalization longitude
          example: "81.1496"
          type: string
      type: object
    User:
      properties:
        address:
          $ref: "#/components/schemas/Address"
        company:
          $ref: "#/components/schemas/Company"
        email:
          description: User email
          example: "Sincere@april.biz"
          type: string
        id:
          description: User id
          example: 1
          type: integer
        name:
          description: User name
          example: "Leanne Graham"
          type: string
        phone:
          description: User phone
          example: "1-770-736-8031 x56442"
          type: string
        username:
          description: User username
          example: "Bret"
          type: string
        website:
          description: User website
          example: "hildegard.org"
          type: string
      type: object
```

## 3. Generate the interfaces.

Add a new execution task to the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin).

Here I leave some ready copy-paste for you.

```xml
<execution>
  <id>java (client) generation - <!-- todo: replace with the name of the OAS file -->.yaml</id>
  <goals>
      <goal>generate</goal>
  </goals>
  <configuration>
      <inputSpec>${project.basedir}/src/main/resources/openapi/<!-- todo: replace with the name of the OAS file -->.yaml</inputSpec>
      <generatorName>java</generatorName>
      <library>feign</library>
      <output>${project.build.directory}/generated-sources/openapi/</output>
      <apiPackage><!--todo: apiPackage--></apiPackage>
      <modelPackage><!--todo: modelPackage--></modelPackage>
      <configOptions>
          <feignClient>true</feignClient>
          <interfaceOnly>true</interfaceOnly>
          <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
          <useJakartaEe>true</useJakartaEe>
      </configOptions>
  </configuration>
</execution>
```

- Put the name of the OAS file: is the file that represent the contract of the REST endpoint you want to consume
- Fill the value of \<apiPackage\>: should be a java-style url that ends in .api (ie: com.typicode.jsonplaceholder.api)
- Fill the value of \<modelPackage\>: should be a java-style url that ends in .model (ie: com.typicode.jsonplaceholder.model)

It should look something like this:
![Screenshot2024-10-02205518](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/Screenshot2024-10-02205518.png)

Do a maven clean and compile.

If you check the target\generated-sources\openapi\ folder, you'll find everything that was generated by the two execution tasks.

![Screenshot2024-10-03172845](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/Screenshot2024-10-03172845.png)

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 5: Configuration of feignClient interfaces](/en/blog/2024-10-04-pollitos-opinion-on-spring-boot-development-5)
