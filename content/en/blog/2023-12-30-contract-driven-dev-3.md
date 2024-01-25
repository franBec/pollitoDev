---
author: "Franco Becvort"
title: "Contract-Driven Development 3: Creation of contracts"
date: 2023-12-30
description: "Definition of contracts before getting our hands dirty"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2023-12-30-contract-driven-dev3/DALL·E2024-01-2510.25.18.png
---

_Definition of contracts before getting our hands dirty._

## Check the github repo

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-3](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-3)

## Little change in the naming of things

We are gonna rename everything related to "News" to "Article". That's cause news is a weird word that is a plural and singular on its own, and when talking about entities, we usually talk about a single entity, in singular. So, to ease of future understanding, we are doing that little change.

![diagram](/uploads/2023-12-30-contract-driven-dev3/Untitled-2023-04-13-2132.png)

## What contracts are we creating?

We need:

- 1 OAS that defines the endpoints our backend will offer:
  - I'm saving it in main/resources/openapi/controller
- A OAS for each third party service our backend consumes:
  - I'm saving them in main/resources/openapi/feignclient

Feel free to save your OAS wherever, as long as it is inside main/resources/

So at the moment, that would be a total of three files.

![contracts](/uploads/2023-12-30-contract-driven-dev3/Untitled-2023-12-30-1241.png)

I'm not gonna get into details on how to create an OAS. There're plenty of resources out there to learn + chatGPT is decent at it, but usually runs a little bit short.

### Creating the weatherstack.yaml and mediastack.yaml

Is about reading their respective docs, and doing the manual labor of writing the specification so it represents the desired behaviour. Maybe they have their specification.yaml files somewhere around, but I wasn't able to find them.

### Creating the springcityexplorer.yaml

It was divided in two steps:

- For the /weather and /article, it was more about thinking what I'm allowing my API consumers to do. The answers from my third party apps seems fine, so I'm mainly copy-pasting them so the end consumer can also have plenty of information and choose what to do with it.
- For the /comment
  - When POST, I decided that the end consumer will send a body with a short text.
  - When GET, I decided that the end user will have the pagination versatility provided by the Spring Data library I'm planning on using to deal with the fake in-memory database.

## Checking the end result

At the moment, our project looks like this
![file tree](/uploads/2023-12-30-contract-driven-dev3/Screenshot2023-12-30131549.png)

Feel free to review each yaml file in your fav OAS editor. I'm using [OpenAPI ​(Swagger)​ Editor](https://plugins.jetbrains.com/plugin/14837-openapi-swagger-editor), a Jetbrains plugin. But the most popular option nowadays is [Swagger Editor](https://editor.swagger.io/).
