---
author: "Franco Becvort"
title: "Contract-Driven Development: Crafting Microservices from the Ground Up"
date: 2023-12-28
description: "Delving into Java Spring Boot: A practical guide to crafting microservices with Contract-Driven Development"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2023-12-28-contract-driven-dev/DALL·E2024-01-2510.41.32.png
---

_Delving into Java Spring Boot: A practical guide to crafting microservices with Contract-Driven Development_

## Introduction

This is gonna be part 1 of many, talking about Contract-Driven Development. In this blog I'm gonna focus on...

- How some dev teams at Pichincha bank apply it.
- How my current team can't cause of limitations.
- How would I approach this development practice.

## Contract-Driven Development in a nutshell, by ChatGPT

Here is the part where I should explain what is Contract-Driven Development, but ChatGPT can do it better.

> explain Contract-Driven Development in a nutshell

_me asking ChatGPT_

And here's the answer I got...

Contract-Driven Development (CDD) is a software development approach where the design of software interfaces (or contracts) is the primary focus before implementing the actual functionality. This methodology is especially relevant in systems where various services or components need to interact with each other, such as in microservices architectures. Here's a concise explanation:

1. **Defining Contracts**: The process begins by defining the contracts. These are formal agreements on how software components interact. They specify the expected input and output data formats, error handling methods, and other interaction rules. This is typically done in a language-agnostic way using specifications like OpenAPI for web services.

2. **Collaboration and Communication**: Since contracts are agreed upon at the start, different teams can work in parallel on different components. They have a clear understanding of what to expect from each other's services. This approach improves communication and collaboration among teams.

3. **Mocking and Testing**: With contracts in place, developers can create mock implementations of services or APIs. This allows for testing the integration points without the need for the actual implementation to be complete.

4. **Implementation**: Once the contracts are defined and agreed upon, the actual development of the software components begins. The developers implement the functionality adhering to the specifications laid out in the contracts.

5. **Continuous Verification**: As development progresses, continuous testing ensures that the implementations remain compliant with the contracts. If a service changes, it must still fulfill its contract, or the contract must be renegotiated and all affected parties must agree.

6. **Maintenance and Evolution**: Contracts can evolve, but changes are managed carefully to ensure compatibility. This method provides a clear pathway for updating and maintaining systems over time.

CDD is particularly useful in reducing misunderstandings and errors in system integration, ensuring that different components can work together seamlessly. It also helps in creating more scalable and maintainable systems, as changes in one component have minimal impact on others, as long as the contract is adhered to.

I don't know about you, but for me, that sounds like a solid definition. Ok, moving on.

## How does Pichincha Bank apply contract driven development?

![spongebob gif](/uploads/2023-12-28-contract-driven-dev/spongebob.gif)

Pichincha bank backend is a huge **huge** hell of microservices, mostly caused by their Spotify-like philosophy of organizing the development team in tribes, chapter, and guilds.

Even though this promotes team autonomy and velocity (very questionable thing this last one), also generates this situation where there's no control whatsoever in the number of microservices, and each can easily have different programming practices.

This make that communication between services owned by different teams usually leads to great friction.

![spotify model](/uploads/2023-12-28-contract-driven-dev/spotifymodel.png)

{{< youtube FeENMTL4xBo >}}

To try to solve the friction problem, contract driven development became mandatory in all Java build with grade project, which are a huge number, I might guess 60-ish% of all the backend microservices.

To promote that, the bank bought this super secret all powerful library that given some yaml + configurations in the build.gradle, on build generates lots of boilerplate, related to things such as controller interfaces, feign clients interfaces, database entities, and even you can tell the library if you want the project in a MVC or Spring Reactor fashion.

Tries to do a lot, and do it mostly ok. I haven't used it that much, but I've heard mixed opinions from my fellow developers.

## So, if it is so good, why am I writing this?

Well two things...

- Having your library to do it all it might be not the way to go: some coworkers mention that usually generates more boilerplate than needed, and that they have to play around the boilerplate generated cause is not exactly what needed. I think this is mostly caused by the learning curve.

But my main reason is...

- The library is exclusive to Spring Boot projects built with Java 17 + spring boot 2.x.x (I think it can go as high as 2.4.x, I would need to double check this) + **gradle**.

And why the emphasis with the gradle? Well, currently in the team I'm working on, because of infrastructure and devops black magic, the pipeline can only execute maven projects with Java 11... I know, a little bit lame. And it seems this is a legacy thing, cause this is related to all the security backend repos and nobody wanna mess around much with them.

For those reasons, me and the rest of the security team are excluded from CDD practices momentarily. We all know momentarily stuff most likely than not become permanent.

## I'm gonna go build my own CDD Java spring boot project, with maven and public libraries

{{< youtube ubPWaDWcOLU >}}

At the moment of writing this I'm on PTO, kinda obligated. Company told me _"bro you haven't took any days off in 8 months, go out touch some grass"_. So I went to Madrid. Nice city, love the tortilla and that everyplace you order coca-cola they give it to you with a slice of lemon

![madrid](/uploads/2023-12-28-contract-driven-dev/IMG_20231226_174932.jpg)

You can take the programmer out of work, but not the programming out of the programmer. So, as a side personal project for these boring days, I decided to tackle the issue and create the equivalent of this super secret private library, but with stuff I can find on the internet that any dev can use. My two goals are:

- The project must be a maven project, using the latest Spring Boot and Java available at the moment. I'm flexible with this, cause I know that probably I'm gonna have to go down to Java 17. But I will try to stay on Spring Boot 3.

- Given openAPI Specifications (OAS) + configurations, on build it must be able to generate interfaces that the controller can implement, and the feign clients interfaces can extend.
  - For me this is just the amount of boilerplate needed to get the development started, though it is a personal preference. I'm not gonna be messing with entities and database stuff in this stage.

As a side but very important note, I don't know how to create libraries, and that is not the objective right now. At the moment, with having a pom.xml that works without much deprecated stuff in it, I'm more than satisfied.
