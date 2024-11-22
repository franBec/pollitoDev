---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 7.5: The Devsu Lab episode"
date: 2024-10-30
description: "Contract Driven Development 102"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Untitled-2024-10-30-1828.png
draft: true
---
<!-- TOC -->
  * [Introduction](#introduction)
  * [Oh, no! I was not there when Contract Driven Development 101 happened](#oh-no-i-was-not-there-when-contract-driven-development-101-happened)
  * [Project Structure](#project-structure)
  * [In-memory dummy MsSQL database](#in-memory-dummy-mssql-database)
  * [Endpoints](#endpoints)
  * [Observability](#observability)
    * [@Aspect](#aspect)
    * [Filter implementation](#filter-implementation)
    * [Micrometer](#micrometer)
  * [Normalization of errors](#normalization-of-errors)
  * [Business logic](#business-logic)
    * [JpaRepository](#jparepository)
    * [@Service](#service)
  * [Some unit testing cause why not](#some-unit-testing-cause-why-not)
    * [Mutation testing](#mutation-testing)
    * [Generate a report](#generate-a-report)
  * [Deployment](#deployment)
  * [Bonus: Postman collection](#bonus-postman-collection)
  * [Next lecture](#next-lecture)
<!-- TOC -->

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

Why Microsoft SQL Server? Because is the one I'm more used to. Could've been any SQL database, I'm pretty sure H2 is database agnostic.
## Endpoints
1. Declare the expected endpoints, inputs and outputs in an [OAS yaml file](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/openapi/userManagerBackend.yaml).
2. In [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml), add the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin) and its required dependencies:
   - [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
   - [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
   - [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Make sure the \<inputSpec\> tag points to your OAS yaml file.
![Screenshot2024-10-31221800](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31221800.png)
![Screenshot2024-10-31223703](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31223703.png)

3. Maven clean.
4. Maven compile.
5. Create a [@RestController class](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/controller/UsersController.java) that implements the generated spring server interface.

![Screenshot2024-11-09162725](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-09162725.png)

## Observability
Know what, when, and where things are happening in your codebase.

Considering we don't mind accidentally printing sensitive information (keys, passwords, etc.), I've found useful to log:

- Everything that comes in.
- Everything that comes out.

### @Aspect
An [@Aspect](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/aspect/LogAspect.java) that logs before and after execution of public controller methods. 
  - We need the dependency [AspectJ Tools (Compiler)](https://mvnrepository.com/artifact/org.aspectj/aspectjtools)

![Screenshot2024-11-15203446](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15203446.png)
![Screenshot2024-11-15223105](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15223105.png)

### Filter implementation
A [Filter implementation](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/filter/LogFilter.java) that logs stuff that doesn't reach the controllers.
  - Needs to be registered with a [configuration class](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/config/LogFilterConfig.java)

![Screenshot2024-11-15224006](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15224006.png)
![Screenshot2024-11-18121011](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18121011.png)
### Micrometer

- Micrometer dependencies for tracing:
  - [Micrometer Observation](https://mvnrepository.com/artifact/io.micrometer/micrometer-observation)
  - [Micrometer Tracing Bridge OTel](https://mvnrepository.com/artifact/io.micrometer/micrometer-tracing-bridge-otel)

![Screenshot2024-11-18122150](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18122150.png)

All the logs will have an associated UUID. Each request incoming into this microservice will have a different number, so we can differentiate what's going on in case multiple request appears at the same time and the logs start mixing with each other.

## Normalization of errors

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

We don't want to be that kind of guy. We are going to do proper error handling with [@RestControllerAdvice](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/controller/advice/GlobalControllerAdvice.java).

![Screenshot2024-11-18123008](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18123008.png)

From now on, all the errors that this microservice returns have the following structure:
![Screenshot2024-10-02130952](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-02130952.png)

## Business logic

Now the easy part, putting everything together.

The more difficult thing will be the `q parameter` in GET /users:
![Screenshot2024-11-18130040](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18130040.png)

### JpaRepository

Usually with [creating a interface that extends JpaRepository](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/repository/UserRepository.java) is enough. But in this specific case, we have to do an interesting query with the `q parameter` in GET /users. For that, we are going to use `@Query`.

![Screenshot2024-11-18154110](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18154110.png)

### @Service

Create a [Service interface](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/service/UsersService.java) and [implement it](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/service/impl/UsersServiceImpl.java). Here's the main business logic.

In the implementation:
- Inject the repository to be able to query the database.
- Inject a mapper so everything is ready for the controller to return.

![Screenshot2024-11-18163405](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18163405.png)

## Some unit testing cause why not

When it comes to [unit testing](https://en.wikipedia.org/wiki/Unit_testing), this is my recommendation:

- Do unit test on:
    - The controller package.
    - The service package.
    - The util package, if exists, should be indirectly covered by the other unit tests.
    - Everything else can be ignored.
- On the code being tested, you must have:
    - Over 70% line coverage.
    - Over 60% mutation coverage.

### Mutation testing

What does it mean "Over 60% mutation coverage"? What is mutation testing? [Pitest](https://pitest.org/) defines it as:

> Mutation testing is conceptually quite simple. Faults (or mutations) are automatically seeded into your code, then your tests are run. If your tests fail then the mutation is killed, if your tests pass then the mutation lived. The quality of your tests can be gauged from the percentage of mutations killed.

To get this metric, we use these plugins:

- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

```xml
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
        <!--https://pitest.org/quickstart/mutators/ “STRONGER” group-->
        <mutators>
            <mutator>CONDITIONALS_BOUNDARY</mutator>
            <mutator>INCREMENTS</mutator>
            <mutator>INVERT_NEGS</mutator>
            <mutator>MATH</mutator>
            <mutator>NEGATE_CONDITIONALS</mutator>
            <mutator>VOID_METHOD_CALLS</mutator>
            <mutator>EMPTY_RETURNS</mutator>
            <mutator>FALSE_RETURNS</mutator>
            <mutator>TRUE_RETURNS</mutator>
            <mutator>NULL_RETURNS</mutator>
            <mutator>PRIMITIVE_RETURNS</mutator>
            <mutator>REMOVE_CONDITIONALS_EQUAL_ELSE</mutator>
            <mutator>EXPERIMENTAL_SWITCH</mutator>
        </mutators>
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
### Generate a report

After you wrote your units tests, is time to see how good are those test. For that, run `pitest:mutationCoverage`

You should find in target/pit-reports an index.html, that's the report.
![Screenshot2024-11-18185317](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18185317.png)

Open it in your favourite browser and explore further each class if needed.

![Screenshot2024-11-18185643](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18185643.png)

## Deployment

As simple as:

1. Create a [Dockerfile](https://github.com/franBec/user_manager_backend/blob/main/Dockerfile)
2. Deploy whenever a Dockerfile can be deployed (I chose [render](https://render.com/) free tier)

The complicated part was creating the Dockerfile. I did mine based on Ramanamuttana's blog [&ldquo;Build a Docker Image using Maven and Spring boot&rdquo;](https://medium.com/@ramanamuttana/build-a-docker-image-using-maven-and-spring-boot-418e24c00776).

This is the final result:

![screencapture-dashboard-render-web-srv-cstpigi3esus73e2i2dg-logs-2024-11-18-20_01_02](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/screencapture-dashboard-render-web-srv-cstpigi3esus73e2i2dg-logs-2024-11-18-20_01_02.png)

## Bonus: Postman collection

Here's a nice tip: create a Postman collection

1. Copy all the [OAS .yaml file](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/openapi/userManagerBackend.yaml) (CTRL+C).
2. Postman -> Import -> paste (CTRL+V)

![Screenshot2024-11-18200759](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18200759.png)

Replace the variable `baseUrl` with `https://user-manager-backend-den3.onrender.com` and you are ready to use my deployed version.
- It may have a very long first request (up to a minute or even more), because I'm using a free tier in my deployment, so the instance may have been spun down.

## Next lecture

Yes, there's more...