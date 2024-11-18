---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 7.5: The Devsu Lab episode"
date: 2024-10-30
description: "Contract Driven Development 102"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Untitled-2024-10-30-1828.png
---

## Introduction

Welcome to **"Contract Driven Development 102"**, the seventh-and-a-half installment of my [Spring Boot Development series](/en/categories/spring-boot-development/).

**For those arriving from Devsu Lab**, I’m [Pollito](/en/page/about), your host and a fellow Java Spring Boot Developer. This particular blog complements the ideas explained in the lab session, as support content of what we explored together.

**If you’re not from Devsu Lab** This is going to be a .zip version of the [Spring Boot Development series](/en/categories/spring-boot-development/) part 0 to 3, and then instead of using feignClient interfaces, this will use an in-memory database.

Here's some background:

- [Devsu](https://devsu.com/), the company where I work, holds "TED talk"-style events called Devsu Labs. These sessions are designed to share useful knowledge and skills with fellow developers.
- Here, alongside [Jorge](https://www.linkedin.com/in/jorge-v%C3%A1zquez-mendoza/), we are extending that experience by breaking down the concepts in a format you can revisit anytime.

Let’s get started!

## Oh, no! I was not there when Contract Driven Development 101 happened

This is "Contract Driven Development 102". If you missed our first lab, is basically [Pollito&rsquo;s Opinion on Spring Boot Development 1: Contract-Driven Development](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-1).

But in a nutshell...

> Don't write DTOs, declare what the microservice expects and returns.

~ Pollito 2024

## Project Structure

To put the concepts into practice, we'll dive into a project where Contract Driven Development principles are already implemented.

You can find the project in [the following GitHub repository](https://github.com/franBec/user_manager_backend).

The project is a simple Spring Boot microservice with...
- In-memory dummy MsSQL database.
- Endpoints:
  - /users: Get list of all users.
  - /users/{id}: Get user by matching its id.
- Best practices boilerplate.
- Business logic.

![Untitled-2024-10-30-2236](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Untitled-2024-10-30-2236.png)

## In-memory dummy MsSQL database
Doing an actual SQL Server setup is too much for a simple example. [H2](https://www.h2database.com/html/main.html) comes to the rescue! It is a lightweight, in-memory database engine (When you stop the app, the data is gone).

Here’s how it works:

1. Create some [Entities classes](https://github.com/franBec/user_manager_backend/tree/main/src/main/java/dev/pollito/user_manager_backend/entity): These are your representation of the database tables in your business code.
![Screenshot2024-10-31200319](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31200319.png)
2. In a [data.sql](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/data.sql) file, write the INSERT INTO queries that will fill the tables with mock data.
![Screenshot2024-10-31211225](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31211225.png)
3. Add properties in [application.yml](https://github.com/franBec/post/blob/feature/devsu-lab/src/main/resources/application.yml).
![Screenshot2024-10-31211757](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31211757.png)
4. Dependencies in [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml).
   - [Microsoft JDBC Driver For SQL Server](https://mvnrepository.com/artifact/com.microsoft.sqlserver/mssql-jdbc)
   - [H2 Database Engine](https://mvnrepository.com/artifact/com.h2database/h2)
![Screenshot2024-10-31214058](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31214058.png)

## Endpoints
1. Declare the expected endpoints, inputs and outputs in an [OAS yaml file](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/openapi/userManagerBackend.yaml).
2. In [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml), add the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin) and its required dependencies:
   - [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
   - [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
   - [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Make sure the \<inputSpec\> tag (line 232 in the screenshot) points to your OAS yaml file.
![Screenshot2024-10-31221800](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31221800.png)
![Screenshot2024-10-31223703](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31223703.png)

3. Maven clean.
4. Maven compile.
5. Create a [@RestController class](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/controller/UsersController.java) that implements the generated spring server interface.

This one already has business logic, which is "return whatever the service returns, with the proper HTTP status code" or "leave it as default" (it returns 501 NOT IMPLEMENTED).

- For this exercise, we're going to be doing the `findAll` and `findById` operations.

![Screenshot2024-11-09162725](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-09162725.png)

## Observability
Know what, when, and where things are happening in your codebase.

Considering we don't mind accidentally printing sensitive information (keys, passwords, etc.), I've found useful to log:

- Everything that comes in
- Everything that comes out.

### Aspect
An [Aspect](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/aspect/LogAspect.java) that logs before and after execution of public controller methods. 
  - We need the dependency [AspectJ Tools (Compiler)](https://mvnrepository.com/artifact/org.aspectj/aspectjtools)

![Screenshot2024-11-15203446](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15203446.png)
![Screenshot2024-11-15223105](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15223105.png)

### Filter implementation
A [Filter implementation](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/filter/LogFilter.java) that logs stuff that doesn't reach the controllers.
  - Needs a [configuration](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/config/LogFilterConfig.java)

![Screenshot2024-11-15224006](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15224006.png)
### Micrometer

- Micrometer dependencies for tracing. We need the dependencies:
  - [Micrometer Observation](https://mvnrepository.com/artifact/io.micrometer/micrometer-observation)
  - [Micrometer Tracing Bridge OTel](https://mvnrepository.com/artifact/io.micrometer/micrometer-tracing-bridge-otel)


## Normalization of errors
keep all errors the same, please.
- [@RestControllerAdvice](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) and [ProblemDetail](https://dev.to/noelopez/spring-rest-exception-handling-problem-details-2hkj).
## Business logic

asd
