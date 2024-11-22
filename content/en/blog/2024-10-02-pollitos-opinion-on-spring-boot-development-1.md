---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 1: Contract-Driven Development"
date: 2024-10-02
description: "Principles"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/shirogane.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [Contract-Driven Development](#contract-driven-development)
  * [Contract](#contract)
  * [Conclusion](#conclusion)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the first part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- The objective of this blog is to understand those principles.

## Contract-Driven Development

In the _[Design by contract wikipedia article](https://en.wikipedia.org/wiki/Design_by_contract)_, we can find the following affirmation:

![A design by contract scheme](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/Design_by_contract.png)

> [...] software designers should define formal, precise and verifiable interface specifications for software components, which extend the ordinary definition of abstract data types with preconditions, postconditions and invariants.

From that, I made my own adaptation of the Contract-Driven Development philosophy for microservices architecture:

> Microservices must comply with a contract, which defines inputs, outputs, and errors.

So, what is a contract?

## Contract

Set of assertions containing the following information:

- Valid input values, and their meaning.
- Valid return values, and their meaning.
- Error values that can occur, and their meaning.

In a Contract there are two parties:

- **Consumer:** provides the input values and waits for the return.
- **Provider:** waits for the input values and provides the return.

There are no rules stating how many contracts a microservice complies with, or which roles it plays in them. But here are my personal recommendations to keep it as close as possible to the original definition:

1. A microservice complies at least with one contract, playing the provider role.
2. A microservice can play the consumer role in zero, one, or many contracts.
3. A microservice can play the consumer role in zero, one, or many contracts.

Let's go more in detail on each one.

1. A microservice complies at least with one contract, playing the provider role

![1provider1contractmanyconsumers](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/1provider1contractmanyconsumers.png)

For a microservice that strictly follows the Contract-Driven development practices, without complying with this rule, it has no way of being invoked from outside sources.

Maybe there are scenarios when having a microservice running but not being able to be invoked is necessary, but at the moment of writing this, no scenario comes to mind.

2. A microservice plays the provider role in one and only one of its contracts

![1provider2contracts](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/1provider2contracts.png)

This isn't really Contract-Driven Development, is more about the proper philosophy of microservices. A microservice is meant to deal with one thing only, and do it well. For achieving that, it just makes sense then that the microservice is only a provider once, providing the endpoints to interact with the one thing it does well.

There might be totally valid exceptions to this. A clear example is a microservice that expose an [actuator](https://github.com/spring-projects/spring-boot/tree/v3.2.3/spring-boot-project/spring-boot-actuator) endpoint. Now you have a microservice that does two things, its main function, and exposing a health check call. And that's totally OK.

3. A microservice can play the consumer role in zero, one, or many contracts.

![zero](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/zero.png)
![one](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/one.png)
![many](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/many.png)

## Conclusion

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

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 2: Best practices boilerplate](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2)
