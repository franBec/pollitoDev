---
author: "Franco Becvort"
title: "Pollito's Manifest on Java Spring Boot Contract-Driven Development for microservices 1"
date: 2024-03-16
description: "Objectives and Key principles"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/miko.jpeg
---

## Objectives

- Being a starting point for future Spring Boot projects.
- Embracing Component-Driven Development (CDD) practices.
- Encapsulating essential dependencies and best-practice boilerplates.
- Give the developer ownership and control over the code.

## Key principles

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

## Previous recommended knowledge

### Java Spring Boot

Even though Contract-Driven development is language agnostic (it originated as an OOP concept), all my experience is in [Java Spring Boot](https://spring.io/projects/spring-boot), and the implementation in this blog is gonna use that technology.

So it is recommended to feel comfortable with Java Spring Boot concepts. I will put some useful links with extra lectures here and then, but won't stop to explain.

### Contract-Driven Development

In the _[Design by contract wikipedia article](https://en.wikipedia.org/wiki/Design_by_contract)_, we can find the following affirmation:

![A design by contract scheme](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/Design_by_contract.png)

> [...] software designers should define formal, precise and verifiable interface specifications for software components, which extend the ordinary definition of abstract data types with preconditions, postconditions and invariants.

From that, I made my own adaptation of the Contract-Driven Development philosophy for microservices architecture:

> Microservices must comply with a contract, which defines inputs, outputs, and errors.

Let's define what a contract is.

#### Contract

Set of assertions containing the following information:

- Valid input values, and their meaning.
- Valid return values, and their meaning.
- Error values that can occur, and their meaning.

In a Contract there are two parties:

- **Consumer:** provides the input values and waits for the return.
- **Provider:** waits for the input values and provides the return.

There're no rules stating how many contracts a microservice complies with, or which roles it plays in them. But here are some of my personal recommendations:

- **A microservice complies at least with one contract, playing the provider role.**

![1provider1contractmanyconsumers](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/1provider1contractmanyconsumers.png)

For a microservice that strcitly follows the Contract-Driven development practices, without complying with this rule, it has no way of being invoked from outside sources.

Maybe there're scenarios when having a microservice running but not being able to be invoked is necessary, but at the moment of writing this, no scenario comes to mind.

- **A microservice plays the provider role in one and only one of its contracts.**

![1provider2contracts](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/1provider2contracts.png)

This isn't really Contract-Driven Development, is more about the proper philosophy of microservices. A microservice is meant to deal with one thing only, and do it well. For achieving that, it just makes sense then that the microservice is only a provider once, providing the endpoints to interact with the one thing it does well.

There might be totally valid exceptions to this. A clear example is a microservice that expose an [actuator](https://github.com/spring-projects/spring-boot/tree/v3.2.3/spring-boot-project/spring-boot-actuator) endpoint. Now you have a microservice that does two things, its main function, and exposing a health check call. And that's totally OK.

- **A microservice can play the consumer role in zero, one, or many contracts.**

![zero](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/zero.png)
![one](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/one.png)
![many](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/many.png)

### OpenAPI Specification (OAS)

The [OpenAPI Specification (OAS)](https://swagger.io/specification/) defines a standard, language-agnostic interface to HTTP APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection. When properly defined, a consumer can understand and interact with the remote service with a minimal amount of implementation logic.

In Contract-Driven Development, an OAS file is in fact, a contract.

### Aspect-Oriented Programming

Aspect-Oriented Programming (AOP) allows you to separate cross-cutting concerns (like logging, security, or transactions) from the main business logic of your application. In my case, I will be using it for logging purposes.

You can learn more in [baeldung Introduction to Spring AOP](https://www.baeldung.com/spring-aop).

## Inspiration

### Pichincha Bank's in-house solution

In my current role as Backend Developer at Pichincha Bank as an Onboarding and Security team member, Contract-Driven Development is mandatory.

To help with that, the bank bought this super secret all powerful library that given some yaml + configurations in the build.gradle, on build generates lots of boilerplate, related to things such as controller interfaces, feign clients interfaces, database entities, and even you can tell the library if you want the project in a MVC or Spring Reactor fashion. It is built on top of [OpenAPI Generator](https://openapi-generator.tech/) an open source project focused on code generation. Sadly I cannot disclosure much more info.

Even though this is great, this approach has two big issues:

- **Having a library to do it all it might be not the way to go:** Some coworkers mention that usually generates more boilerplate than needed, and that they have to play around the boilerplate generated cause is not exactly what needed.

- **You are locked in with the library and its requirements:** A do it all library includes many things behind the scenes you don't have any control at all, and worse, you have to adapt to. Brief example: until a few months ago, this library only allowed Java 17 + Spring Boot 2.4.x . What if I wanted to go with Spring Boot 3? Or for some reason needed to downgrade to Java 11? Well, you couldn't, you were locked in.

This lead to the mentioned four objectives this manifest is built on:

- Being a starting point for future Spring Boot projects.
- Embracing Component-Driven Development (CDD) practices.
- Encapsulating essential dependencies and best-practice boilerplates.
- Give the developer ownership and control over the code.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) is a collection of re-usable components that you can copy and paste into your apps. You can use any framework that supports React.

How is that an inspiration for Spring Boot projects? It is on the opposite side of the development spectrum. The inspiration comes from this section in the [docs FAQ](https://ui.shadcn.com/docs):

> The idea behind this is to give you ownership and control over the code, allowing you to decide how the components are built and styled. Start with some sensible defaults, then customize the components to your needs. One of the drawback of packaging the components in an npm package is that the style is coupled with the implementation. The design of your components should be separate from their implementation.

That alligns perfectly with one of the objectives:

- Give the developer ownership and control over the code.

Having a starting point is great, but that shouldn't be a blocking issue when the business requirements expects you to adapt.

## Who's the Anime Girl at the blog thumbnail?

Meet [Miko Iino](https://kaguyasama-wa-kokurasetai.fandom.com/wiki/Miko_Iino) (spoilers in the link to the wiki article, read at your own discretion), a character from the manga and anime series "Kaguya-sama: Love is War."

![Miko Iino](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/miko-iino-slapping.gif)

Known for her stringent adherence to rules and a strong sense of justice, her strictness and rigidity in following school regulations serve as a foundation for her actions and decisions.

As the series progresses, Miko's character undergoes significant development. Through her interactions and experiences, she learns the importance of flexibility, understanding, and empathy. While she never abandons her core principles, Miko becomes more adaptable, recognizing that a rigid adherence to rules might not always lead to the best outcomes.

This journey of Miko Iino mirrors the essence of what I aim to achieve here. This blog outlines a series of steps and best practices derived from personal experience, aimed at providing a template-like starting point for future projects that embrace Component-Driven Development (CDD) practices.

Akin to Miko's evolution, the guidelines presented are not set in stone. The underlying message here is one of balance: while it's crucial to have a structured approach and a set of standards to kickstart projects effectively, the dynamism of doing development requires an open-mindedness to adaptation.

Just as Miko learns to balance her strictness with flexibility, developers are encouraged to view these guidelines as a foundation — a starting point from which the project can evolve as dictated by the unique challenges and requirements it faces.

Citating [manupadev&rsquo;s blog](https://manupa.dev/blog/anatomy-of-shadcn-ui)

> The idea behind this is to give you ownership and control over the code, allowing you to decide how the components are built and styled. Start with some sensible defaults, then customize the components to your needs.

In embracing this approach, is important to acknowledge that while rules and frameworks provide necessary structure, the art of development lies in knowing when to adhere strictly to these guidelines and when to bend them to serve the project's greater good.

![Miko Iino](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/miko-iino-love-is-war.gif)

## Next lecture

[Pollito&rsquo;s Manifest on Java Spring Boot Contract-Driven Development for microservices 2](/en/blog/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2)
