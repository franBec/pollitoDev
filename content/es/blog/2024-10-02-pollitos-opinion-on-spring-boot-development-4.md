---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 4: Interfaces feignClient"
date: 2024-10-02
description: "Interfaces feignClient"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/kaguya-season-3-ai-hayasaka-character-visual.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [1. Más dependencias](#1-más-dependencias)
  * [2. Escribir un archivo OAS yaml](#2-escribir-un-archivo-oas-yaml)
  * [3. Generar las interfaces](#3-generar-las-interfaces)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la cuarta parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta serie es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, estamos creando un microservicio Java Spring Boot que maneje información sobre los usuarios.
    - Puedes encontrar el resultado final de la serie en el [repo de GitHub - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
    - A continuación se muestra un diagrama de componentes. Para una explicación más detallada, visite [Entendiendo el proyecto](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-entendiendo-el-proyecto)
      ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

De momento hemos creado:
- LogFilter.
- GlobalControllerAdvice.
- UsersController.

En este blog vamos a crear el UsersApi. ¡Comencemos!

## 1. Más dependencias

Estas son:

- [Jakarta Annotations API](https://mvnrepository.com/artifact/jakarta.annotation/jakarta.annotation-api)
- [Spring Cloud Starter OpenFeign](https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-openfeign)
- [Feign OkHttp](https://mvnrepository.com/artifact/io.github.openfeign/feign-okhttp)
- [Feign Jackson](https://mvnrepository.com/artifact/io.github.openfeign/feign-jackson)
- [Feign Gson](https://mvnrepository.com/artifact/io.github.openfeign/feign-gson)
- [JUnit Jupiter API](https://mvnrepository.com/artifact/org.junit.jupiter/junit-jupiter-api)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dentro del tag \<dependencies\>:

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

## 2. Escribir un archivo OAS yaml

A veces, tendrás suerte y descubrirás que el endpoint REST que quieres consumir ya tiene un OAS disponible. Pero, en caso de que no sea así, tendrás que escribir una representación de lo que puedes esperar de él.

Para este escenario, usaré /users de [{JSON} Placeholder](https://jsonplaceholder.typicode.com/) para obtener datos falsos sobre los usuarios. No pude encontrar un archivo OAS de este, así que hice el mío propio.

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

## 3. Generar las interfaces

Agregue una nueva tarea de ejecución al [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin)

Aquí te dejo un copy-paste listo para usar.

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

- Pon el nombre del archivo OAS: es el archivo que representa el contrato del endpoint REST que quieres consumir
- Completa el valor de \<apiPackage\>: debe ser una url estilo java que termine en .api (es decir: com.typicode.jsonplaceholder.api)
- Completa el valor de \<modelPackage\>: debe ser una url estilo java que termine en .model (es decir: com.typicode.jsonplaceholder.model)

Debería verse así:
![Screenshot2024-10-02205518](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/Screenshot2024-10-02205518.png)

Realice un Maven clean and compile.

Si revisa la carpeta target\generated-sources\openapi\, encontrará todo lo que fue generado por las dos tareas de ejecución.

![Screenshot2024-10-03172845](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/Screenshot2024-10-03172845.png)

## Siguiente lectura

[La opinión de Pollito acerca del desarrollo en Spring Boot 5: Configuración de interfaces feignClient](/es/blog/2024-10-04-pollitos-opinion-on-spring-boot-development-5)
