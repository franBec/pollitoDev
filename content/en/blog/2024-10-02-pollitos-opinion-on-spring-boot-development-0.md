---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 0: Introduction"
date: 2024-10-02
description: "Objectives and Inspiration"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-0/DALL·E2025-01-22201554.jpg
---

<!-- TOC -->
  * [Recommended previous knowledge](#recommended-previous-knowledge)
  * [Objectives](#objectives)
  * [Inspiration (Why am I writing this blog series?)](#inspiration-why-am-i-writing-this-blog-series)
    * [Pichincha Bank in-house solution](#pichincha-bank-in-house-solution)
    * [shadcn/ui](#shadcnui)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Recommended previous knowledge

I expect that you, the reader, are comfortable with [Java Spring Boot](https://spring.io/projects/spring-boot) concepts (specifically, Spring Boot 3 and Java 21).

You may be thinking:

> But Spring Boot is huge, there's no way I need to know all

To which I say, yep you are right :D

Here is a list of concepts I consider important to at least acknowledge their existence:

| Concept                               | Short definition                                                                                                         | Recommended lecture                                                                                                                                                                                          |
|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| @AspectJ                              | Annotation-based AOP framework used to define cross-cutting concerns like logging or transaction management.             | [Intro to AspectJ](https://www.baeldung.com/aspectj)                                                                                                                                                         |
| @ConfigurationProperties              | Binds external configuration properties (e.g., from application.properties) to Java objects in Spring Boot.              | [Guide to @ConfigurationProperties in Spring Boot](https://www.baeldung.com/configuration-properties-in-spring-boot)                                                                                         |
| @FeignClient                          | Declaratively creates REST clients in Spring, simplifying service-to-service calls.                                      | [Navigating Client-Server Communication with Spring’s @FeignClient Annotation](https://medium.com/@AlexanderObregon/navigating-client-server-communication-with-springs-feignclient-annotation-70376157cefd) |
| @RestController                       | Combines @Controller and @ResponseBody, simplifying the creation of RESTful web services in Spring.                      | [The Spring @Controller and @RestController Annotations](https://www.baeldung.com/spring-controller-vs-restcontroller)                                                                                       |
| @RestControllerAdvice                 | A specialized @ControllerAdvice for handling exceptions across all @RestControllers.                                     | [@RestControllerAdvice example in Spring Boot](https://www.bezkoder.com/spring-boot-restcontrolleradvice/)                                                                                                   |
| Declarative vs Imperative programming | Declarative expresses what the program should do, while imperative describes how to do it step by step.                  | [Declarative vs imperative](https://dev.to/ruizb/declarative-vs-imperative-4a7l)                                                                                                                             |
| Design by contract                    | A method of designing software where functions declare preconditions, postconditions, and invariants.                    | [Design by contract](https://en.wikipedia.org/wiki/Design_by_contract)                                                                                                                                       |
| DTO classes                           | Data Transfer Objects are simple classes used to carry data between processes without business logic.                    | [The DTO Pattern (Data Transfer Object)](https://www.baeldung.com/java-dto-pattern)                                                                                                                          |
| ErrorDecoder                          | Allows custom handling of HTTP errors in Feign clients by decoding error responses into meaningful exceptions.           | [Handling Exceptions in Feign Client with ErrorDecoder](https://medium.com/@mtl98/handling-exceptions-in-feign-client-with-errordecoder-28a7a17f81a6)                                                        |
| Fast fail exception handling          | A technique where systems halt execution immediately on encountering an error, preventing further processing.            | [Fast fail exception handling](https://medium.com/@qbyteconsulting/fast-fail-exception-handling-9bba83f7cce7)                                                                                                |
| Filter                                | Intercepts and processes HTTP requests and responses in a Spring Boot application.                                       | [Spring Boot – Servlet Filter](https://www.geeksforgeeks.org/spring-boot-servlet-filter/)                                                                                                                    |
| Lombok                                | A library that reduces boilerplate code in Java, providing annotations for auto-generating code like getters/setters.    | [Introduction to Project Lombok](https://www.baeldung.com/intro-to-project-lombok)                                                                                                                           |
| MapStruct                             | A code generator that simplifies the process of mapping between Java object models (DTOs to entities).                   | [Quick Guide to MapStruct](https://www.baeldung.com/mapstruct)                                                                                                                                               |
| Monitoring and Observability          | Tools and practices that help track system health, performance, and detect issues in applications.                       | [Monitoring and Observability with Spring Boot 3](https://medium.com/@minadev/monitoring-and-observability-with-spring-boot-3-2cb9cdb74a85)                                                                  |
| OpenAPI Generator                     | A tool that generates client/server code based on an OpenAPI specification.                                              | [OpenAPI Generator](https://openapi-generator.tech/)                                                                                                                                                         |
| OpenAPI Specification (OAS)           | A standard for defining RESTful APIs, providing a machine-readable API contract for documentation and client generation. | [OpenAPI Specification](https://swagger.io/specification/)                                                                                                                                                   |
| PIT Mutation Testing                  | A testing approach where small mutations are made to code to ensure tests can detect changes and errors.                 | [PIT Mutation Testing](https://pitest.org/)                                                                                                                                                                  |
| ProblemDetail                         | Standardized format for returning detailed error information in REST APIs.                                               | [Spring Rest - Exception Handling - Problem Details](https://dev.to/noelopez/spring-rest-exception-handling-problem-details-2hkj)                                                                            |
| Spring Boot - Actuator                | Provides endpoints to monitor and manage a Spring Boot application in production.                                        | [A Comprehensive Guide to Spring Boot Actuator](https://medium.com/@pratik.941/a-comprehensive-guide-to-spring-boot-actuator-c2bd63a32ede)                                                                   |
| Spring Initialzr                      | A web tool that helps generate Spring Boot project templates with the desired dependencies.                              | [Create Spring Boot application using initializr in 5 minutes](https://medium.com/railsfactory/create-spring-boot-application-using-initializr-in-5-mins-c70fc62fd7b0)                                       |
| Spring Web                            | The module in Spring Boot for building web applications, including REST APIs and MVC-based apps.                         | [Exploring the Spring Web Dependency — A Beginner’s Overview](https://medium.com/@AlexanderObregon/exploring-the-spring-web-dependency-a-beginners-overview-f19e4620ef5e)                                    |

If there's stuff you are not sure what it is or never put into practice, not worry much. You'll learn on the way (but don't expect from me a detailed explanation).

## Objectives

What am I expecting to achieve with the _"Pollito's Opinion on Spring Boot Development"_ blog series?

- Be a demonstration of how to consume and create an API following Design by Contract principles.
- Give the developer ownership and control over the code.

## Inspiration (Why am I writing this blog series?)

### Pichincha Bank in-house solution

In my current role, Contract-Driven Development is mandatory.

To help with that, the bank bought this super secret all powerful library that given some yaml + configurations in the build.gradle, on build generates lots of boilerplate, related to things such as controller interfaces, feign clients interfaces, database entities, and even you can tell the library if you want the project in an MVC or Spring Reactor fashion.

I don't have definite proof about the next statement, but I think the super secret all powerful library is built on top of an [OpenAPI Generator](https://openapi-generator.tech/) fork, an open source project focused on code generation.

This approach has two big issues:

- **Having a library to do it all it might be not the way to go:** Some coworkers mention that usually generates more boilerplate than needed, and that they have to play around the boilerplate generated cause is not exactly what needed.

- **You are locked in with the library and its requirements:** A do it all library includes many things behind the scenes you don't have any control at all, and worse, you have to adapt to. Brief example: until a few months ago, this library only allowed Java 17 + Spring Boot 2.4.x . What if I wanted to go with Spring Boot 3? Or for some reason needed to downgrade to Java 11? Well, you couldn't, you were locked in.

But even with those issues, I'm not against the idea. I'm the kind of developer that prefers declarative programing over imperative programming.

What would you prefer:

- Write [DTO classes](https://www.baeldung.com/java-dto-pattern)
- Declare in a yaml file the structure of what I except and what I return

Your typical YouTube and Udemy tutorial would prefer the former, I do the latter.

**Pichincha Bank's idea is great, the execution went poorly.** I know it can be done better! That lead to the creation of this blog series.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) is a collection of re-usable components that you can copy and paste into your apps. You can use any framework that supports React.

How is that an inspiration for Spring Boot projects? It is on the opposite side of the development spectrum. The inspiration comes from this section in the [docs FAQ](https://ui.shadcn.com/docs):

> The idea behind this is to give you ownership and control over the code, allowing you to decide how the components are built and styled. Start with some sensible defaults, then customize the components to your needs. One of the drawback of packaging the components in an NPM package is that the style is coupled with the implementation. The design of your components should be separate from their implementation.

That aligns perfectly with one of the objectives:

- Give the developer ownership and control over the code.

Having a starting point is great, but that shouldn't be a blocking issue when the business requirements expect you to adapt.

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 1: Contract-Driven Development](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-1)
