---
author: "Franco Becvort"
title: "Let's talk Java: Data persistence in Spring"
date: 2024-11-25
description: "Hibernate, JPA, Spring Data JPA, Lazy/Eager Loading"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-data-persistence-in-spring/ryou_yamada_mastering_spring.png
---

<!-- TOC -->
  * [Who does what](#who-does-what)
  * [Spring Boot with JPA](#spring-boot-with-jpa)
  * [What&rsquo;s the deal with Eager/Lazy Loading?](#whats-the-deal-with-eagerlazy-loading)
    * [What’s the Difference?](#whats-the-difference)
    * [Who’s responsible for Lazy/Eager Loading?](#whos-responsible-for-lazyeager-loading)
    * [Common issues and how to handle them](#common-issues-and-how-to-handle-them)
    * [Best Practices](#best-practices)
<!-- TOC -->

## Who does what

**Hibernate**
- **What is it?:** Hibernate is a Java-based Object-Relational Mapping (ORM) framework. It simplifies database interactions by allowing you to map Java objects to database tables and vice versa.
- **Key Role:** It acts as the underlying ORM provider. Hibernate handles:
  - Converting Java objects into SQL queries (and the reverse).
  - Managing relationships, caching, and lazy loading.
  - Simplifying CRUD operations.

**JPA**
- **What is it?:** JPA (Java Persistence API) is a specification for ORM frameworks. It defines a set of interfaces and annotations that frameworks like Hibernate must implement.
- **Key Role:** JPA is the abstraction layer. It provides a unified programming model so your application doesn't depend directly on a specific ORM framework (like Hibernate).

**Spring Data JPA**
- **What is it?:** Spring Data JPA is part of the larger Spring Data ecosystem, which provides abstractions for various data access technologies. Specifically, it sits on top of JPA to simplify repository management.
- **Key Role:** It automates the boring parts of data access. With Spring Data JPA, you get:
  - Prebuilt repository interfaces like `CrudRepository`, `JpaRepository`.
  - Query generation from method names (e.g., `findByNameAndAge()`).
  - Pagination and sorting out of the box.

**So... Who does what?**
- **Hibernate:** Deals directly with the database, translating between objects and SQL.
- **JPA:** Provides a blueprint for how Hibernate (or any ORM) should behave.
- **Spring Data JPA:** Simplifies your interaction with JPA.

## Spring Boot with JPA
The `spring-boot-starter-data-jpa` dependency does a lot of heavy lifting for you, but there are a few other things you’ll need to consider to make your Spring Boot project with JPA and Hibernate work seamlessly.

1. **Database Dependency:** You need a database driver (H2, MySQL, PostgreSQL, etc.). Spring Boot will automatically pick up the driver and configure Hibernate for the appropriate dialect based on your database.
2. You need to **configure your database connection** and a few JPA properties in `application.properties` (or `application.yml`).
3. **Entity Classes.**
4. **Repository Interfaces:** You’ll need to create a repository interface that extends Spring Data’s interfaces, like `JpaRepository`.

**Do You Need Anything Else?**
- **No XML Configuration:** Spring Boot handles the configuration automatically.
- **Advanced Queries:** Use `@Query` for custom queries if needed.
- **Custom Configurations:** If you need specific Hibernate properties, you can define them under `spring.jpa.properties.*` in the `application.properties`.

## What&rsquo;s the deal with Eager/Lazy Loading?

### What’s the Difference?

| Aspect            | Lazy Loading                                                                                                                               | Eager Loading                                                                                                                                |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Definition        | Associated data is loaded only when it’s accessed.                                                                                         | Associated data is loaded immediately with the parent entity.                                                                                |
| Advantages        | Saves memory by not loading unnecessary data.                                                                                              | Simplifies access to related data without worrying about session/transaction boundaries.                                                     |
| Disadvantages     | - Requires an active Hibernate session; accessing outside results in LazyInitializationException. - Can lead to N+1 problem if mismanaged. | - Loads unnecessary data, potentially wasting memory and processing time. - Can result in large, complex queries that slow down performance. |
| Use Case          | Best for scenarios where related data is not always needed.                                                                                | Best for scenarios where related data is always required.                                                                                    |
| Hibernate Default | LAZY: For `@OneToMany` and `@ManyToMany`.                                                                                                  | EAGER: For `@ManyToOne` and `@OneToOne`.                                                                                                     |

### Who’s responsible for Lazy/Eager Loading?

- **JPA and Hibernate:** JPA defines whether a relationship (@OneToMany, @ManyToOne, etc.) is loaded lazily or eagerly. Hibernate, as the default ORM, implements the behavior.
- **You (the Developer!):** As the developer, you decide when and where to use eager or lazy loading based on:
  - **The use case:** Do you need the associated data every time, or only occasionally?
  - **The performance impact:** Is it better to fetch everything in one go or defer the fetching until necessary?

### Common issues and how to handle them

**LazyInitializationException**

- **What Happens?:** Lazy-loaded data is accessed outside a transaction or Hibernate session, leading to an exception.
- **How to Fix?:** Use `@Transactional` to keep the session open

```java
@Transactional
public List<Post> getUserPosts(Long userId) {
    User user = userRepository.findById(userId).orElseThrow();
    return user.getPosts(); // Access within transaction
}
```

**N+1 Problem**

- **What Happens?:** Lazy loading triggers multiple queries—one for the parent entity and one for each associated entity.
- **How to Fix?:**
  - Use `JOIN FETCH` in queries.
  - Use `EntityGraph` to control what is eagerly fetched dynamically.

```java
@Query("SELECT u FROM User u JOIN FETCH u.posts WHERE u.id = :id")
Optional<User> findUserWithPosts(@Param("id") Long id);
```

```java
@EntityGraph(attributePaths = {"posts"})
Optional<User> findById(Long id);
```
**Overfetching with Eager Loading**

- **What Happens?:** Eager loading fetches unnecessary data, increasing query size and memory usage.
- **How to Fix?:** Switch to `FetchType.LAZY` for relationships you rarely use.

### Best Practices
1. **Default to Lazy:** Use `FetchType.LAZY` unless you’re absolutely sure the data is always needed.
2. **Transactional Scope:** Ensure lazy-loaded data is accessed within an active transaction.
3. **Optimize Queries:** Use `JOIN FETCH` or `EntityGraph` for specific use cases that require associated data.
4. **Profile and Monitor:** Use tools like Hibernate’s SQL logging or JPA metamodel to monitor what queries are being executed.
5. **Avoid Fetching Large Collections:** For `@OneToMany` or similar relationships, paginate the results when possible.