---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 3: Spring server interfaces"
date: 2024-10-02
description: "Spring server interfaces"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/yuu-ishigami.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [1. More dependencies](#1-more-dependencies)
  * [2. Write an OAS yaml file](#2-write-an-oas-yaml-file)
  * [3. Generate the interfaces](#3-generate-the-interfaces)
  * [4. Implement the interfaces](#4-implement-the-interfaces)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the third part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we are creating a Java Spring Boot Microservice that handles information about users.
  - You can find the code of the final result at [this GitHub repo - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
  - Here's a diagram of its components. For a deep explanation visit [Understanding the project](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-understanding-the-project)
    ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

So far we created:
- LogFilter.
- GlobalControllerAdvice.
- An empty UsersController.

In this blog we are going to complete the UsersController. Let's start!

## 1. More dependencies

These are:

- [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
- [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
- [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

Under the \<dependencies\> tag:

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

## 2. Write an OAS yaml file

Here's the example I'm going to be using for this blog series.

_resources/openapi/userManagerBackend.yaml_

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

## 3. Generate the interfaces

Add the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin) plugin.

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

Under the \<plugins\> tag:

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

Do a maven clean and compile.

If you check the target\generated-sources\openapi\ folder, you'll find everything that was generated. Those files represent the OAS we fed the plugin with.

![Screenshot2024-10-02165641](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02165641.png)

## 4. Implement the interfaces

Make the simple @RestController located in the controller package implement the desired interface that was generated in the previous step.

Then in IntelliJ, if you press Ctrl+O while standing in the line that has the _implements_ statement, a pop-up window will appear asking you which methods you'd like to override:

![Screenshot2024-10-02175532](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02175532.png)

Select the ones that you are interested in. IntelliJ will autofill the class. Now it looks something like this:

_controller/UsersController.java_

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

Now try [http://localhost:8080/user](http://localhost:8080/user). You should get the default response from the generated code, which is 501 NOT IMPLEMENTED:

![Screenshot2024-10-02180748](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02180748.png)

## Next lecture

If your microservice is not going to consume a REST endpoint, then this is all you need.

But don't you have curiosity how to do that while following Contract-Driven Development best practices? I know you do. Follow this next lecture: [Pollito&rsquo;s Opinion on Spring Boot Development 4: feignClient interfaces](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-4)
