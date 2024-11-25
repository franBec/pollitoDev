---
author: "Franco Becvort"
title: "Let's talk Java: Beans"
date: 2024-11-25
description: "the backbone of Spring's DI mechanism"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-beans/anime-girl-profile-while-drinking-coffee-szrx2slngz2l7abp.jpg
---

<!-- TOC -->
  * [What is a Bean?](#what-is-a-bean)
  * [Key characteristics of a Spring Bean](#key-characteristics-of-a-spring-bean)
    * [Example](#example)
  * [Dependency Injection to wire beans together](#dependency-injection-to-wire-beans-together)
    * [Injection methods](#injection-methods)
    * [Why use Dependency Injection?](#why-use-dependency-injection)
  * [Why Singleton by Default?](#why-singleton-by-default)
    * [When would you want to change Singleton behavior?](#when-would-you-want-to-change-singleton-behavior)
    * [When to stick to Singletons?](#when-to-stick-to-singletons)
  * [The lifecycle of a Spring Bean](#the-lifecycle-of-a-spring-bean)
    * [Lifecycle hooks in detail](#lifecycle-hooks-in-detail)
    * [Full lifecycle in code](#full-lifecycle-in-code)
    * [Bean lifecycle with scopes](#bean-lifecycle-with-scopes)
    * [When would you use these hooks?](#when-would-you-use-these-hooks)
  * [Conclusion](#conclusion)
<!-- TOC -->

Ah, the humble bean! It's one of those terms that we Java developers toss around so much, we sometimes forget to pause and appreciate its elegance. Let me help you peel back the layers on what a Spring bean really is.

## What is a Bean?

In the Spring framework, a bean is simply an object that is managed by the Spring IoC (Inversion of Control) container. It's the backbone of Spring's dependency injection (DI) mechanism.

To break it down:

- **Spring IoC Container:** Responsible for creating, configuring, and managing the lifecycle of beans.
- **Bean:** Any object instantiated, configured, and managed by the container.

## Key characteristics of a Spring Bean

**1. Defined in the Context**

- Beans are defined in the Spring configuration, either via:
  - Annotations (e.g., `@Component`, `@Service`, `@Repository`, `@Configuration`).
  - XML configuration (if you’re nostalgic for the early 2000s).
  - Java-based configuration (`@Bean` methods in `@Configuration` classes).

**2. Singleton by Default**

- By default, a Spring bean is a singleton (one instance per container). This can be customized with scopes like @Scope("prototype").

**3. Dependency Injection**

- Beans can be injected into each other using @Autowired, constructor injection, or setter injection. This promotes loose coupling and testability.

**4. Lifecycle Management**

- The container controls a bean's lifecycle, from instantiation to destruction. You can define custom hooks with annotations like @PostConstruct and @PreDestroy.

### Example
Here’s a simple bean:

```java
@Component
public class CoffeeMaker {
    public String brew() {
        return "Brewing a fresh cup of Java!";
    }
}
```
And another bean that depends on it:
```java
@Service
public class CoffeeShop {
    private final CoffeeMaker coffeeMaker;

    public CoffeeShop(CoffeeMaker coffeeMaker) {
        this.coffeeMaker = coffeeMaker;
    }

    public void openShop() {
        System.out.println(coffeeMaker.brew());
    }
}
```
Spring’s container detects the @Component and @Service annotations, creates beans for these classes, and wires them up.

## Dependency Injection to wire beans together

Dependency Injection (DI) is a design pattern where an object's dependencies are provided by an external source (the Spring IoC container) rather than the object itself creating them.

In Spring, DI is used to wire beans together, making applications loosely coupled and easier to test and maintain.

### Injection methods

**1. Field Injection:** Use `@Autowired` directly on a field.
```java
@Autowired
private MyService myService;
```

**2. Constructor Injection (Preferred):** Dependencies are provided via the constructor.
```java
@Service
public class MyService {
    private final MyDependency dependency;

    public MyService(MyDependency dependency) {
        this.dependency = dependency;
    }
}
```
**3. Setter Injection:** Dependencies are injected via a setter method.
```java
private MyDependency dependency;

@Autowired
public void setDependency(MyDependency dependency) {
    this.dependency = dependency;
}
```

### Why use Dependency Injection?
- Promotes loose coupling between objects.
- Makes testing easier by allowing mock dependencies to be injected.
- Centralizes object management in the Spring container.

Constructor injection is typically preferred because it ensures dependencies are immutable and mandatory for the object’s operation.

## Why Singleton by Default?

**1. Efficiency**

- Creating a single instance of a bean and sharing it across the application minimizes memory usage and object creation overhead. It's much cheaper than repeatedly creating new instances.
- Singleton beans work well for stateless services (which is the majority in most backend applications).

**2. Consistency**

- Singleton scope ensures that the same instance is used everywhere, promoting predictable behavior and reducing the chances of subtle bugs due to multiple stateful instances being accidentally created.

**3. Dependency Injection**

- Singleton beans simplify dependency injection. You inject the same instance across the application, and everyone gets a shared, consistent version.

**4. Thread-Safety**

- For stateless services (the most common case), a singleton bean is inherently thread-safe because it doesn't maintain any internal state specific to a request or thread.

### When would you want to change Singleton behavior?

The singleton model isn't always appropriate. Here are some situations where changing it makes sense:

**1. Stateful Beans (e.g., Request/Session Scoped)**

- If the bean holds data specific to a user session or HTTP request, using a singleton scope would cause incorrect data sharing across users/requests.
- Use `@RequestScope` or `@SessionScope` in such cases.

```java
@Component
@RequestScope
public class ShoppingCart {
private final List<Item> items = new ArrayList<>();

    public void addItem(Item item) {
        items.add(item);
    }

    public List<Item> getItems() {
        return items;
    }
}
```

**2. Prototype Scope for per-instance behavior**

- If you need a new instance of a bean every time it’s requested, use `@Scope("prototype")`.
- This is common for objects that are stateful or short-lived (e.g., a utility object holding temporary state).
- Each injection or retrieval from the container creates a new instance.

```java
@Component
@Scope("prototype")
public class TemporaryWorker {
    private final String id = UUID.randomUUID().toString();

    public String getId() {
        return id;
    }
}
```
### When to stick to Singletons?

- **Stateless Services:** Most service classes, like those annotated with `@Service` or `@Repository`, are stateless and should remain singletons.
- **Configuration or Utility Classes:** Classes that act as configuration holders or provide utility methods (e.g., caching, logging) benefit from the singleton scope.

Spring defaults to singleton because it fits the most common use case: stateless, shared services. You should change the scope when state or lifespan becomes critical to the bean’s function (e.g., per-request/session behavior, task-specific data).

If you find yourself asking whether you need a non-singleton, always ask:

- _Does this bean hold state?_
- _Is the state unique per user/session/request/task?_

## The lifecycle of a Spring Bean

**1. Instantiation**

- The Spring IoC container creates an instance of the bean, either through its constructor or a factory method.

**2. Dependency Injection**

- After instantiation, the container injects any dependencies (via constructor, setter, or field injection).

**3. Post-Initialization Hooks**

- Beans go through post-initialization hooks for additional setup or configuration:
  - If the bean implements the `InitializingBean` interface, its `afterPropertiesSet()` method is called.
  - If the bean has a method annotated with `@PostConstruct`, that method is executed.

**4. Ready for use**

- The bean is now fully initialized, dependencies are injected, and it's ready to serve.

**5. Destruction**

- When the application shuts down, the bean is destroyed. Spring provides hooks for custom cleanup:
  - If the bean implements `DisposableBean`, the `destroy()` method is called. 
  - If the bean has a method annotated with `@PreDestroy`, that method is executed.

### Lifecycle hooks in detail

**1. Initialization hooks**

- These are often used to initialize resources, start background threads, or perform setup tasks.
- Options:
  - `@PostConstruct`: A modern and annotation-based approach.
  - `InitializingBean.afterPropertiesSet()`: Interface-based approach.
  - Custom Initialization Methods: Declared with the `@Bean(initMethod = "methodName")` attribute.

```java
@Component
public class ExampleBean {
    @PostConstruct
    public void initialize() {
        System.out.println("Bean is initialized!");
    }
}
```
**2. Destruction hooks**

- These are used to release resources, close connections, or perform cleanup.
- Options:
  - `@PreDestroy`: The recommended annotation-based approach.
  - `DisposableBean.destroy()`: Interface-based approach.
  - Custom Destruction Methods: Declared with the `@Bean(destroyMethod = "methodName")` attribute.

```java
@Component
public class ExampleBean {
    @PreDestroy
    public void cleanup() {
        System.out.println("Bean is being destroyed!");
    }
}
```

### Full lifecycle in code

```java
@Component
public class ExampleBean implements InitializingBean, DisposableBean {
    public ExampleBean() {
        System.out.println("1. Bean is instantiated.");
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("2. @PostConstruct: Bean is initialized.");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("3. afterPropertiesSet(): Custom initialization logic.");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("4. @PreDestroy: Cleanup before destruction.");
    }

    @Override
    public void destroy() {
        System.out.println("5. destroy(): Final cleanup.");
    }
}
```

Output:
```log
1. Bean is instantiated.
2. @PostConstruct: Bean is initialized.
3. afterPropertiesSet(): Custom initialization logic.
4. @PreDestroy: Cleanup before destruction.
5. destroy(): Final cleanup.
```
### Bean lifecycle with scopes

- **Singleton Beans:** The lifecycle occurs once, when the container starts up and shuts down.
- **Prototype Beans:** The lifecycle occurs for each new instance. Destruction callbacks (like `@PreDestroy`) are not automatically invoked because the container doesn't manage the entire lifecycle of prototype beans.

### When would you use these hooks?

**Initialization**
- Setting up resources like database connections, caches, or thread pools.
- Performing validation or configuration checks.

**Destruction:**
- Closing database connections.
- Shutting down thread pools or background tasks.
- Cleaning up temporary files or releasing locks.

Spring gives you fine-grained control over a bean's lifecycle. While hooks like `@PostConstruct` and `@PreDestroy` are the most modern and widely used, the lifecycle is flexible enough to accommodate custom logic as needed.

## Conclusion

- Beans enable dependency injection, which leads to clean, modular code.
- Spring handles the heavy lifting like object lifecycle and dependencies, so you can focus on business logic.