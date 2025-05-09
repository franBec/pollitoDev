---
author: "Franco Becvort"
title: "The Perfect Software Project"
date: 2023-07-26
description: "Is it even possible? A little talk about different web dev architectures"
categories: ["Programing talk"]
thumbnail: /uploads/2023-07-26-the-perfect-software-project/softwareDev.jpg
---

<!-- TOC -->
  * [Introduction](#introduction)
  * [A Monolith](#a-monolith)
  * [Frontend + Backend](#frontend--backend)
  * [Microservices](#microservices)
  * [There Is Not a Perfect Software Project Approach, Isn&rsquo;t It?](#there-is-not-a-perfect-software-project-approach-isnt-it)
<!-- TOC -->

## Introduction

_What would the perfect software project even look like?_

I think that if I was asked this question when I started my path as a web developer (September 2021), a year ago (July 2022), and now (July 2023), you would get three different answers. That means I'm learning and changing perspective of what "the perfect software project" looks like.

These three answers are:

- A monolith: a house as one big unit, it gets the job done.
- Frontend and Backend: separation just makes sense.
- Microservices: benefits with challenges.

Let's get deep into each option

## A Monolith

_A house as one big unit, it gets the job done_

![monolith](/uploads/2023-07-26-the-perfect-software-project/monolith.jpg)

99.9% sure this is the first software architecture you learn, cause is the most intuitive to start with. Also, most tutorials and courses go for this approach.

A monolith is an all-in-one box, and for me the best way to explain it is using the famous "house analogy".

Imagine you're building a house. In traditional monolith web development, the entire house is constructed as one big unit, with all the rooms, functionalities, and infrastructure connected in a single structure.

In this analogy:

1. **House**: The monolith itself is like the house, which represents the entire web application or website.
2. **Rooms**: Inside the house, you have different rooms, such as the living room, kitchen, bedrooms, and bathroom. These rooms represent the various features and components of the web application, like user login, product listing, shopping cart, and payment processing.
3. **Infrastructure**: The plumbing, electricity, and other essential systems that support the entire house are like the underlying code, database, and resources that make the web application work.

Some key points about the monolith architecture:

1. **Everything in One Place**: Just like a house has everything under one roof, a monolith web application has all its code, functions, and data within a single codebase.
2. **Simplicity**: Building the whole house as one unit can be straightforward and easy to understand since everything is in one place.
3. **Communication**: In a monolith, all the rooms can communicate easily with each other since they are part of the same structure. Similarly, in web development, different features of the application can easily share data and functionalities.

However, here are some downsides:

1. **Scalability**: If you want to make the house bigger, you have to expand the whole thing, which can be more challenging and expensive. Similarly, in web development, as the application grows, it becomes harder to scale, and adding new features might become more complicated.
2. **Maintenance**: Imagine if there's a problem with the plumbing in one room; it might affect the entire house. Similarly, if there's a bug or issue in one part of the monolith code, it could impact the entire application.
3. **Development Speed**: In a monolith, when multiple teams work on different parts of the application, coordinating their efforts can be challenging. Changes in one area might require thorough testing and validation throughout the entire application.

But in the end, it gets the job done.

## Frontend + Backend

_Separation just makes sense_

![frontendBackend](/uploads/2023-07-26-the-perfect-software-project/frontendBackend.jpg)

Let's go with the restaurant analogy for this one.

Imagine you have a restaurant. In the early days, your restaurant was small, and everything happened in one place: the kitchen, the dining area, and the payment counter were all together (a monolith).

However, as your restaurant became more popular, you encountered some challenges:

1. **Scalability**: With increasing demand, it became harder to accommodate more customers, prepare food quickly, and manage the dining area simultaneously. You needed a way to expand without overcrowding the place.
2. **Specialization**: You noticed that your restaurant staff had diverse skills. Some were excellent cooks, while others were friendly and great at serving customers. But having everyone do everything caused inefficiencies.

To overcome these challenges, you decided to split your restaurant into two distinct areas:

1. **Frontend**: This is the dining area – the part of the restaurant that customers interact with directly. It's designed to be user-friendly and visually appealing. There are menus, waitstaff, and ambiance, all focused on creating a delightful experience for the customers.
2. **Backend**: This is the kitchen – the part of the restaurant hidden from the customers' view. It's where the chefs work efficiently to prepare the food, the inventory is managed, and orders are processed.

Here's why this separation makes sense:

1. **Improved Scalability**: With the frontend and backend separated, you can now expand either of them independently. If you want to accommodate more customers, you can focus on expanding the dining area (frontend) without affecting the kitchen's operations (backend).
2. **Specialization and Efficiency**: Now that the kitchen staff can solely focus on cooking and inventory management, they become more efficient in their tasks. The waitstaff can concentrate on providing excellent service to customers without having to worry about food preparation.
3. **Flexibility**: With an independent frontend and backend, you have the flexibility to upgrade or replace one without necessarily touching the other. For example, you can revamp the menu and dining area (frontend) without changing the entire kitchen setup (backend).

In web development terms:

- **Frontend**: This is the user interface (UI) of a website or web application that users interact with directly. It's responsible for the layout and overall user experience.
- **Backend**: This is the server-side of the application, handling tasks like data storage, processing, and business logic.

By separating the frontend and backend, web developers gain the same advantages as our restaurant analogy:

- **Scalability**: Each part can be scaled independently, allowing developers to handle increased traffic on the frontend or optimize the backend for better performance.
- **Specialization**: Developers with different skill sets can focus on their respective areas. Frontend developers specialize in creating appealing user interfaces, while backend developers focus on managing data and handling application logic.
- **Flexibility**: Changes or updates to one part of the application can be done without affecting the other. For instance, redesigning the frontend without altering the backend's functionality.

Overall, the split between frontend and backend allows for a more efficient and flexible web development process, making it easier to manage complex projects and deliver a better user experience to visitors.

## Microservices

_Benefits with challenges_
![spongebob](/uploads/2023-07-26-the-perfect-software-project/spongebob.jpg)

Imagine you have a city with a large, single, multipurpose building (like a mega-mall) that houses all the different businesses, services, and facilities. This is similar to a monolith architecture, where everything is tightly integrated into one large system.

Now, let's explore the pros and cons of transforming this city into a collection of smaller, independent buildings, each dedicated to a specific function:

**Pros:**

1. **Scalability**: With the mega-mall, if one business becomes extremely popular, it might create congestion and affect other businesses' operations. In a microservice city, if a particular service (e.g., shopping, entertainment, transportation) experiences high demand, it can scale independently without affecting others. This way, the city can efficiently manage growth and adapt to changing needs.
2. **Flexibility**: Each building in the microservice city can be designed and upgraded independently. If a service needs a new feature or technology, its building can be updated without affecting others. This allows the city to stay up to date with the latest trends and advancements.
3. **Fault Isolation**: In a mega-mall, if there's a fire or a security breach, it could impact the entire building and all businesses within it. In a microservice city, if a problem arises in one building, it can be contained to that specific area, reducing the risk of widespread disruption.
4. **Specialization**: Different businesses and services can specialize in what they do best. For example, one building could focus on shopping, another on healthcare, and another on entertainment. This specialization allows each service to excel and deliver high-quality experiences.
5. **Development Speed**: Independent teams can work on different buildings simultaneously, speeding up the development process. Changes and updates can be implemented faster since they are confined to specific buildings and don't require coordination across the entire city.

**Cons:**

1. **Complexity**: Managing a city with many independent buildings requires coordination and communication between services. Similarly, microservices add complexity in terms of inter-service communication, deployment, and monitoring.
2. **Infrastructure Overhead**: Each building needs its own infrastructure and resources, which can result in higher maintenance and operational costs compared to a single mega-mall.
3. **Integration Challenges**: With many independent services, ensuring seamless integration between them can be more challenging than a monolith. Developers must implement robust communication protocols and handle potential issues arising from service interactions.
4. **Deployment Complexity**: Deploying changes across multiple buildings (services) requires careful planning and coordination to avoid service disruptions.
5. **Learning Curve**: Transitioning from a monolith to a microservice architecture can be a significant shift for the development team, requiring them to learn new concepts and best practices.

In summary, a microservice architecture offers benefits like scalability, flexibility, fault isolation, specialization, and faster development. However, it comes with challenges related to complexity, infrastructure overhead, integration, deployment, and a learning curve.

## There Is Not a Perfect Software Project Approach, Isn&rsquo;t It?

Exactly. It is more of a "what is expected the product to do" situation. So here are some phrases that can help you out when having to choose one approach

- Monolith

  - "Is just a sample app for a course project".
  - "I just need something quick done".
  - "It is not going to increase in complexity".

- Frontend + Backend

  - "I want a clear separation between the user interface and server-side logic".
  - "The application may grow over time, and I want the flexibility to expand or update specific components independently".
  - "I have a team with different skill sets, and I want them to focus on their respective areas of expertise".

- Microservices
  - "I expect the application to have high traffic and need to scale components independently".
  - "Each part of the application has unique requirements, and I want to choose the best technology stack for each".
  - "Fault tolerance and isolation are crucial, and I want to minimize the impact of failures in one area on the rest of the application".
