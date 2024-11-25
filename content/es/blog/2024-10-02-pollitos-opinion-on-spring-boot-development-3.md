---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 3: Interfaces Spring server"
date: 2024-10-02
description: "Interfaces Spring server"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/yuu-ishigami.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [1. Más dependencias](#1-más-dependencias)
  * [2. Escribir un archivo OAS yaml](#2-escribir-un-archivo-oas-yaml)
  * [3. Generar las interfaces](#3-generar-las-interfaces)
  * [4. Implementar las interfaces](#4-implementar-las-interfaces)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la tercera parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta serie es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, estamos creando un microservicio Java Spring Boot que maneje información sobre los usuarios.
  - Puedes encontrar el resultado final de la serie en el [repo de GitHub - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
  - A continuación se muestra un diagrama de componentes. Para una explicación más detallada, visite [Entendiendo el proyecto](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-entendiendo-el-proyecto)
    ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)
  
De momento hemos creado:
- LogFilter.
- GlobalControllerAdvice.
- Un UsersController vacío.

En este blog vamos a completar el UsersController. ¡Comencemos!

## 1. Más dependencias

Estas son:

- [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
- [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
- [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dentro del tag \<dependencies\>:

```xml
<dependency>
    <groupId>io.swagger.core.v3</groupId>
    <artifactId>swagger-core-jakarta</artifactId>
    <version>2.2.22</version>
</dependency>
<dependency>
    <groupId>org.openapitools</groupId>
    <artifactId>jackson-databind-nullable</artifactId>
    <version>0.2.6</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## 2. Escribir un archivo OAS yaml

Este es el ejemplo que usaré para esta serie de blogs.

_resources/openapi/post.yaml_

```yaml
openapi: 3.0.3
info:
  title: user_manager_backend API
  description: A RESTful API for managing a database of users. Supports CRUD operations.
  version: 1.0.0
  contact:
    name: Pollito
    url: https://pollito.dev
servers:
  - url: 'http://localhost:8080'
    description: dev
  - url: 'https://user-manager-backend-den3.onrender.com'
    description: prod
paths:
  /users:
    get:
      tags:
        - User
      summary: List all users
      operationId: findAll
      parameters:
        - description: Use this parameter to specify the page of your request
          in: query
          name: pageNumber
          schema:
            default: 0
            minimum: 0
            type: integer
        - description: Use this parameter to specify a pagination limit (number of results per page) for your request
          in: query
          name: pageSize
          schema:
            default: 10
            maximum: 10
            minimum: 1
            type: integer
        - description: Use this parameter to specify the property by which you want to sort the results of your request
          in: query
          name: sortProperty
          schema:
            $ref: '#/components/schemas/UserSortProperty'
        - description: Use this parameter to specify the direction (asc or desc) of your request results
          in: query
          name: sortDirection
          schema:
            $ref: '#/components/schemas/SortDirection'
        - description: Use this parameter to filter users by checking if provided string is part of email, name, or username (all ignore case). If not used, no filtering will be done.
          in: query
          name: q
          schema:
            minLength: 2
            maxLength: 255
            type: string
      responses:
        '200':
          description: List of all users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Users'
        default:
          description: Error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /users/{id}:
    get:
      tags:
        - User
      summary: Get user by identifier
      operationId: findById
      parameters:
        - description: User identifier
          in: path
          name: id
          required: true
          schema:
            format: int64
            type: integer
      responses:
        '200':
          description: A user
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        default:
          description: Error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
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
          $ref: '#/components/schemas/Geo'
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
    Error:
      properties:
        detail:
          description: Description of the problem.
          example: No value present
          type: string
        instance:
          description: The endpoint where the problem was encountered.
          example: "/generate"
          type: string
        status:
          description: http status code
          example: 500
          type: integer
        title:
          description: A short headline of the problem.
          example: "NoSuchElementException"
          type: string
        timestamp:
          description: ISO 8601 Date.
          example: "2024-01-04T15:30:00Z"
          type: string
        trace:
          description: opentelemetry TraceID, a unique identifier.
          example: "0c6a41e22fe6478cc391908406ca9b8d"
          type: string
        type:
          description: used to point the client to documentation where it is explained clearly what happened and why.
          example: "about:blank"
          type: string
      type: object
    Geo:
      description: Address geolocation
      properties:
        lat:
          description: Geolocation latitude
          example: "-37.3159"
          type: string
        lng:
          description: Geolocation longitude
          example: "81.1496"
          type: string
      type: object
    Pageable:
      type: object
      properties:
        pageNumber:
          description: Current page number (starts from 0)
          example: 0
          type: integer
        pageSize:
          description: Number of items retrieved on this page
          example: 1
          type: integer
    SortDirection:
      type: string
      enum: [ ASC, DESC ]
      default: ASC
    User:
      properties:
        address:
          $ref: '#/components/schemas/Address'
        company:
          $ref: '#/components/schemas/Company'
        creationTime:
          description: Creation time in ISO 8601 format
          example: "2023-11-01T08:30:00"
          type: string
        email:
          description: User email
          example: "Sincere@april.biz"
          type: string
        id:
          description: User id
          example: 1
          format: int64
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
    Users:
      properties:
        content:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pageable:
          $ref: '#/components/schemas/Pageable'
        totalElements:
          description: Total number of items that meet the criteria
          example: 10
          type: integer
      type: object
    UserSortProperty:
      enum: [
        email,
        id,
        name,
        username
      ]
      default: id
      type: string
```

## 3. Generar las interfaces

Agregue el plugin [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dentro del tag \<plugins\>:

```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>7.8.0</version>
    <executions>
        <execution>
            <id>spring (server) generation - <!-- todo: replace with the name of the OAS file -->.yaml</id>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <inputSpec>${project.basedir}/src/main/resources/openapi/<!-- todo: replace with the name of the OAS file -->.yaml</inputSpec>
                <generatorName>spring</generatorName>
                <output>${project.build.directory}/generated-sources/openapi/</output>
                <apiPackage>${project.groupId}.${project.artifactId}.api</apiPackage>
                <modelPackage>${project.groupId}.${project.artifactId}.model</modelPackage>
                <configOptions>
                    <interfaceOnly>true</interfaceOnly>
                    <skipOperationExample>true</skipOperationExample>
                    <useSpringBoot3>true</useSpringBoot3>
                    <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
                </configOptions>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Haga una maven clean and compile. Debería encontrar logs similares a estos:

Si revisas la carpeta target\generated-sources\openapi\, encontrarás todo lo que se generó. Esos archivos representan la especificación OAS con la que alimentamos el plugin.

![Screenshot2024-10-02165641](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02165641.png)

## 4. Implementar las interfaces

Haga que el @RestController simple ubicado en el paquete del controlador implemente la interfaz deseada que se generó en el paso anterior.

Luego, en IntelliJ, si presiona Ctrl+O mientras se encuentra en la línea que tiene la declaración _implements_, aparecerá una ventana emergente que le preguntará qué métodos desea sobreescribir:

![Screenshot2024-10-02175532](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02175532.png)

Seleccionamos aquellos métodos que nos interesa. IntelliJ completará automáticamente la clase. Ahora se ve algo así:

_controller/UserController.java_

```java
import dev.pollito.user_manager_backend.api.UsersApi;
import dev.pollito.user_manager_backend.model.SortDirection;
import dev.pollito.user_manager_backend.model.User;
import dev.pollito.user_manager_backend.model.UserSortProperty;
import dev.pollito.user_manager_backend.model.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UsersController implements UsersApi {
  @Override
  public ResponseEntity<Users> findAll(Integer pageNumber, Integer pageSize, UserSortProperty sortProperty, SortDirection sortDirection, String q) {
    return UsersApi.super.findAll(pageNumber, pageSize, sortProperty, sortDirection, q);
  }

  @Override
  public ResponseEntity<User> findById(Long id) {
    return UsersApi.super.findById(id);
  }
}
```

Ahora pruebe [http://localhost:8080/user](http://localhost:8080/user). Deberías obtener la respuesta predeterminada del código generado, que es 501 NO IMPLEMENTED:

![Screenshot2024-10-02180748](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02180748.png)

## Siguiente lectura

Si su microservicio no va a consumir un endpoint REST, esto es todo lo que necesita.

Pero ¿no tienes curiosidad por saber cómo hacerlo siguiendo las mejores prácticas de desarrollo basado en contratos? Sé que sí. Sigue esta próxima lección: [La opinión de Pollito acerca del desarrollo en Spring Boot 4: Interfaces feignClient](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-4)
