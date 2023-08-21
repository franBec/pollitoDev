---
author: "Franco Becvort"
title: "[The perfect software project #06] - Schema time!"
date: 2023-08-16
description: "Solid schemas for code correctness"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-16-the-perfect-software-project-006/Screenshot-2023-08-17-181619.png
---

## What is a schema? Why so important?

Let's start by stating the fact that javascript is a dynamically typed programming language, which means that variable types are determined at runtime and can change during the execution of the program.

While this flexibility can be advantageous for smaller projects or quick prototyping, it can pose significant challenges when it comes to developing and maintaining large-scale software projects.

Typescript was developed as a solution to these challenges, offering a statically typed alternative that provides stronger type enforcement, better code documentation, safer refactoring, and improved tooling support.

A typescript schema typically refers to a definition or structure that outlines the expected types, shapes, and constraints of data.

There are a few common contexts in which typescript schemas are used:

- Data Validation and Type Safety: By defining a schema, developers can ensure that data conforms to expected types and shapes, preventing runtime errors caused by incorrect data manipulation. Typescript's static type checking catches these errors at compile time.

- API Contracts: When developing APIs or interfaces between different parts of a system, specifying a typescript schema for input and output data helps establish clear communication between components. This reduces the chances of misunderstandings and ensures that data is processed correctly.

- Documentation and Self-Documentation: A well-defined typescript schema acts as self-documentation for the code. Developers can easily understand the structure of data and the expected types by referring to the schema, reducing the need for additional comments or documentation.

- Code Maintainability: As projects grow in complexity, maintaining code becomes challenging. A typescript schema aids in keeping the codebase organized, making it easier to update and refactor the code without introducing unexpected issues.

- IDE Support and Autocompletion: Many integrated development environments (IDEs) and code editors support typescript. A well-defined schema enables advanced features like autocompletion and type inference, which enhance productivity by guiding developers while writing code.

## Zod: the defacto schema library

Currently in the rich javascript ecosystem there are many libraries to make schemas. But since my first interaction with schemas back in 2022 until today, [Zod](https://zod.dev/) is considered the best option. From time to time a new tool appears that claims to be faster in runtime, or weightless, but remember what Theo said: _bleed responsibly_

{{< youtube o4h8PUVy5J8 >}}
{{< youtube 9UVPk0Ulm6U >}}
{{< youtube RWWgUB9LmzQ >}}
{{< youtube 9N50YV5NHaE >}}

Key features of Zod include:

- Type-First Approach: Zod leverages typescript's type system to define schemas. This means you create schema definitions using typescript types, which leads to more natural and intuitive schema creation.

- Runtime Validation: Zod provides runtime validation for data against the defined schemas. This helps catch errors early, even before they lead to unexpected runtime behavior.

- Serialization and Parsing: Zod can be used not only for validating data but also for parsing and serializing data. This makes it useful for handling data coming from different sources, such as APIs or databases.

- Composability: Schemas can be composed and combined, allowing you to build complex validation rules and structures out of simpler ones.

- Error Reporting: Zod provides detailed error messages when validation fails, which helps in diagnosing and fixing issues quickly.

- Type Inference: Zod's schema definitions allow for type inference, making it easier to work with the validated data in your typescript code.

### The zod + react-form-hook + shadcn/ui combo

Now we have this really interesting sinergy where: shadcn/ui uses react-hook-form for its forms, and react-hook-forms uses zod for its own validaiton.

So, with a solid schema definition, all kinda builds by itself, and thats how I've been making forms in this project.

At the moment I don't have any 100% working form yet cause no backend. I wanna do a lot of empty skeleton frontend before pluging everything together.

## Conclusion

There are lots of commits here, but mostly because I couldn't made my mind about where I'm gonna save my schemas in the folder structure.

So at the moment, these are the commits done. This can be checked in the GitHub branch [2023-08-11](https://github.com/franBec/sigem-monolith/tree/2023-08-11).

![commits](/uploads/2023-08-16-the-perfect-software-project-006/Screenshot-2023-08-17-182244.png)
