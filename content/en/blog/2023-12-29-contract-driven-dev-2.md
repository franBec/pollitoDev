---
draft: true
author: "Franco Becvort"
title: "Contract-Driven Development 2: Coming up with a practice scenario"
date: 2023-12-29
description: "Let's create a simple application to put some ideas into practice"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2023-12-29-contract-driven-dev2/DALL·E2024-01-2510.33.51.png
---

_Let's create a simple application to put some ideas into practice._

## Check the github repo

This is a continuation of [Contract-Driven Development: Crafting Microservices from the Ground Up](/en/blog/2023-12-28-contract-driven-dev).

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-2](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-2)

## Sketch the app

After a very quick look at [AnyAPI](https://any-api.com/), I chose the APIs [weatherstack](https://weatherstack.com/) and [mediastack](https://mediastack.com/) to consume in the test application. Creating a free account in both is quite simple and more than enough for our purpose.

So, what's the app gonna do?

- Given a city name, we will show the current weather and some random news related to the country the city is in.
- Also will have a fake comment section, just to justify the creation of a POST endpoint in the backend.

![architecture](/uploads/2023-12-29-contract-driven-dev2/Untitled-2023-04-13-2132.png)
Sorry for the image looking so small. Feel free to right click -> open image in new tab

Observations:

- News endpoint expects country, but in the frontend I only have city. To solve that I could've gone by using some Google Maps API that allows me to f(city)=country. But that involves money I don't wanna expend in a sample project. Instead, I'm gonna use the location.country property in the 200 success response from weather API. This is not an ideal solution cause now news depends on weather, but again, this is just a sample project. In an ideal situation, each functionality should point to a microservice on its own.
- I ain't gonna bother with features such as autocomplete, or distinguishing between cities with same name. In case you are looking between two cities named the same, I'm gonna let weather API decides whatever it wants to return me.

## Let's begin: Creating the Java Spring Boot Backend

Here's the most difficult part, coming up with a name. After asking chatGPT for ideas, one stood out: _SpringCityExplorer_. So yep, now this is oficially **The Pollito Spring City Explorer Project**.

So now we go to [Spring Initializr](https://start.spring.io/), and:

- Project: Maven.
- Language: Java.
- Spring Boot: 3.2.1.
- Fill project metadata as you like.
- Packaging: Jar.
- Java: 17.
  - Why not 21? Two reasons...
    - When trying to execute a Maven project with Java 21 you get [java: error: release version 5 not supported](https://stackoverflow.com/questions/59601077/intellij-errorjava-error-release-version-5-not-supported). And the solution involves dealing with the pom.xml, something that we are not supposed to do in this early stage of just creating a project.
    - Main reason though is that I already know that we will have to downgrade to Java 17 due to some dependencies down the road. So better save myself the trouble now that is early in development.
- Some dependencies to get started: Lombok, Spring Web, and Spring Boot Dev Tools.

With all that, we are good to go, click on Generate, save the zip, extract wherever you want, open with your favourite IDE. Mine is IntelliJ IDEA 2021.3.2 (Ultimate Edition)

![Spring Initializr](/uploads/2023-12-29-contract-driven-dev2/screencapture-start-spring-io-2023-12-29-14_39_14.png)

After opening the project, do a quick maven clean and compile. Any problems that appears here are probably due to some conflict related to Java in your pc, IDE, and/or a mix of both. Google is your best friend here.

If everything is ok, go to your main class (annotated with @SpringBootApplication), run, and we should be good to go.

- If at any point appears a message of Lombok requesting something, just say yes.

After a few seconds, go to [localhost](http://localhost:8080/) and you should see an error message.

![Spring default error](/uploads/2023-12-29-contract-driven-dev2/screencapture-localhost-8080-2023-12-29-15_57_47.png)

Now is a good moment to init a git, and close it up here. Next part we'll create the OAS for the controllers to implement, and for the feign-client to extend.
