---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 1: Contract-Driven Development"
date: 2024-03-16
description: "Contract-Driven Development"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/miko.jpg
---

## Recommended previous knowledge

### Java Spring Boot

Even though Contract-Driven development is language agnostic (it originated as an OOP concept), all my experience is in [Java Spring Boot](https://spring.io/projects/spring-boot), and the implementation I'm gonna use in future blogs will be in that technology.

I expect that you, the reader, are comfortable with Java Spring Boot concepts (specifically, Spring Boot 3 and Java 21).

I'll put some useful links with extra lectures here and then, but won't stop to explain.

### OpenAPI Specification (OAS)

_\(copy pasted from ChatGPT\)_

The [OpenAPI Specification (OAS)](https://swagger.io/specification/) defines a standard, language-agnostic interface to HTTP APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection. When properly defined, a consumer can understand and interact with the remote service with a minimal amount of implementation logic.

## Objectives

What am I expecting to achieve with the _"Pollito's Opinion on Spring Boot Development"_ blog series?

- Be a starting point for future Spring Boot projects.
- Embrace Component-Driven Development (CDD) practices.
- Encapsulate essential dependencies and best-practice boilerplate.
- Give the developer ownership and control over the code.

Without further ado, let's start!

## Contract-Driven Development

In the _[Design by contract wikipedia article](https://en.wikipedia.org/wiki/Design_by_contract)_, we can find the following affirmation:

![A design by contract scheme](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/Design_by_contract.png)

> [...] software designers should define formal, precise and verifiable interface specifications for software components, which extend the ordinary definition of abstract data types with preconditions, postconditions and invariants.

From that, I made my own adaptation of the Contract-Driven Development philosophy for microservices architecture:

> Microservices must comply with a contract, which defines inputs, outputs, and errors.

So, what is a contract?

#### Contract

Set of assertions containing the following information:

- Valid input values, and their meaning.
- Valid return values, and their meaning.
- Error values that can occur, and their meaning.

In a Contract there are two parties:

- **Consumer:** provides the input values and waits for the return.
- **Provider:** waits for the input values and provides the return.

There're no rules stating how many contracts a microservice complies with, or which roles it plays in them. But here are my personal recommendations to keep it as close as possible to the original definition:

1. A microservice complies at least with one contract, playing the provider role.
2. A microservice can play the consumer role in zero, one, or many contracts.
3. A microservice can play the consumer role in zero, one, or many contracts.

Let's go more in detail on each one.

1. A microservice complies at least with one contract, playing the provider role

![1provider1contractmanyconsumers](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/1provider1contractmanyconsumers.png)

For a microservice that strcitly follows the Contract-Driven development practices, without complying with this rule, it has no way of being invoked from outside sources.

Maybe there're scenarios when having a microservice running but not being able to be invoked is necessary, but at the moment of writing this, no scenario comes to mind.

2. A microservice plays the provider role in one and only one of its contracts

![1provider2contracts](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/1provider2contracts.png)

This isn't really Contract-Driven Development, is more about the proper philosophy of microservices. A microservice is meant to deal with one thing only, and do it well. For achieving that, it just makes sense then that the microservice is only a provider once, providing the endpoints to interact with the one thing it does well.

There might be totally valid exceptions to this. A clear example is a microservice that expose an [actuator](https://github.com/spring-projects/spring-boot/tree/v3.2.3/spring-boot-project/spring-boot-actuator) endpoint. Now you have a microservice that does two things, its main function, and exposing a health check call. And that's totally OK.

3. A microservice can play the consumer role in zero, one, or many contracts.

![zero](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/zero.png)
![one](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/one.png)
![many](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/many.png)

## TL;DR: What to take out from this blog?

- Microservices must comply with a contract, which defines inputs, outputs, and errors.
- A contract is a set of assertions containing the following information:
  - Valid input values, and their meaning.
  - Valid return values, and their meaning.
  - Error values that can occur, and their meaning.
- In a Contract there are two parties:
  - **Consumer:** provides the input values and waits for the return.
  - **Provider:** waits for the input values and provides the return.
- A microservice complies at least with one contract, playing the provider role.
- A microservice can play the consumer role in zero, one, or many contracts.

## Inspiration (Why am I writing this blog series?)

### Pichincha Bank's in-house solution

In my current role as Backend Developer at Pichincha Bank as an Onboarding and Security team member, Contract-Driven Development is mandatory.

To help with that, the bank bought this super secret all powerful library that given some yaml + configurations in the build.gradle, on build generates lots of boilerplate, related to things such as controller interfaces, feign clients interfaces, database entities, and even you can tell the library if you want the project in a MVC or Spring Reactor fashion.

I don't have definite proof about the next statement, but I think the super secret all powerful library is built on top of an [OpenAPI Generator](https://openapi-generator.tech/) fork, an open source project focused on code generation.

Even though this is great, this approach has two big issues:

- **Having a library to do it all it might be not the way to go:** Some coworkers mention that usually generates more boilerplate than needed, and that they have to play around the boilerplate generated cause is not exactly what needed.

- **You are locked in with the library and its requirements:** A do it all library includes many things behind the scenes you don't have any control at all, and worse, you have to adapt to. Brief example: until a few months ago, this library only allowed Java 17 + Spring Boot 2.4.x . What if I wanted to go with Spring Boot 3? Or for some reason needed to downgrade to Java 11? Well, you couldn't, you were locked in.

I know I can do better! That lead to the mentioned four objectives this blog series is expected to achieve:

- Be a starting point for future Spring Boot projects.
- Embrace Component-Driven Development (CDD) practices.
- Encapsulate essential dependencies and best-practice boilerplate.
- Give the developer ownership and control over the code.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) is a collection of re-usable components that you can copy and paste into your apps. You can use any framework that supports React.

How is that an inspiration for Spring Boot projects? It is on the opposite side of the development spectrum. The inspiration comes from this section in the [docs FAQ](https://ui.shadcn.com/docs):

> The idea behind this is to give you ownership and control over the code, allowing you to decide how the components are built and styled. Start with some sensible defaults, then customize the components to your needs. One of the drawback of packaging the components in an npm package is that the style is coupled with the implementation. The design of your components should be separate from their implementation.

That alligns perfectly with one of the objectives:

- Give the developer ownership and control over the code.

Having a starting point is great, but that shouldn't be a blocking issue when the business requirements expects you to adapt.

### Write my knowledge down

Not much to explain here, I want to write down the stuff I currently know, so nothing get lost. And when someone ask me "so what is your java knowledge?, I'd just link them here.

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 2: Best practices boilerplate](/en/blog/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2)
