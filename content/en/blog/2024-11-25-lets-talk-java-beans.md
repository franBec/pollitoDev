---
author: "Franco Becvort"
title: "Hablemos de Java: Beans"
date: 2024-11-25
description: "The backbone of Spring's DI mechanism"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-beans/anime-girl-profile-while-drinking-coffee-szrx2slngz2l7abp.jpg
---

<!-- TOC -->
  * [What Is A Bean?](#what-is-a-bean)
  * [Key Characteristics Of A Spring Bean](#key-characteristics-of-a-spring-bean)
    * [Example](#example)
  * [Dependency Injection To Wire Beans Together](#dependency-injection-to-wire-beans-together)
    * [Injection Methods](#injection-methods)
    * [Why Use Dependency Injection?](#why-use-dependency-injection)
  * [Why Singleton By Default?](#why-singleton-by-default)
    * [When Would You Want To Change Singleton Behavior?](#when-would-you-want-to-change-singleton-behavior)
    * [When To Stick To Singletons?](#when-to-stick-to-singletons)
  * [The Lifecycle Of A Spring Bean](#the-lifecycle-of-a-spring-bean)
    * [Lifecycle Hooks In Detail](#lifecycle-hooks-in-detail)
    * [Full Lifecycle In Code](#full-lifecycle-in-code)
    * [Bean Lifecycle With Scopes](#bean-lifecycle-with-scopes)
    * [When Would You Use These Hooks?](#when-would-you-use-these-hooks)
  * [Conclusion](#conclusion)
<!-- TOC -->

Bean... It's one of those terms that we Java developers toss around so much, we sometimes forget to pause and appreciate its elegance. Let's discover what a Spring bean really is.

## What Is A Bean?

In the Spring framework, a bean is simply an object managed by the Spring IoC (Inversion of Control) container. It's the backbone of Spring's dependency injection (DI) mechanism.

To break it down:

- **Spring IoC Container:** Responsible for creating, configuring, and managing the lifecycle of beans.
- **Bean:** Any object instantiated, configured, and managed by the container.

## Key Characteristics Of A Spring Bean

- **Defined in the context**
  - Beans are defined in the Spring configuration, either via:
    - Annotations (e.g., `@Component`, `@Service`, `@Repository`, `@Configuration`).
    - XML configuration (if you’re nostalgic for the early 2000s).
    - Java-based configuration (`@Bean` methods in `@Configuration` classes).
- **Singleton by default**
  - By default, a Spring bean is a singleton (one instance per container). This can be customized with scopes like `@Scope("prototype")`.
- **Dependency injection**
  - Beans can be injected into each other using @Autowired, constructor injection, or setter injection. This promotes loose coupling and testability.
- **Lifecycle management**
  - The container controls a bean's lifecycle, from instantiation to destruction. You can define custom hooks with annotations like `@PostConstruct` and `@PreDestroy`.

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

## Dependency Injection To Wire Beans Together

Dependency Injection (DI) is a design pattern where an object's dependencies are provided by an external source (the Spring IoC container) rather than the object itself creating them.

This is the best video out there explaining the topic:

{{< youtube J1f5b4vcxCQ >}}


In Spring, DI is used to wire beans together, making applications loosely coupled and easier to test and maintain.

### Injection Methods

1. **Field injection:** Use `@Autowired` directly on a field.

    ```java
    @Autowired
    private MyService myService;
    ```

2. **Constructor injection (preferred):** Dependencies are provided via the constructor.

    ```java
    @Service
    public class MyService {
        private final MyDependency dependency;
    
        public MyService(MyDependency dependency) {
            this.dependency = dependency;
        }
    }
    ```

3. **Setter injection:** Dependencies are injected via a setter method.

    ```java
    private MyDependency dependency;
    
    @Autowired
    public void setDependency(MyDependency dependency) {
        this.dependency = dependency;
    }
    ```

### Why Use Dependency Injection?

- Promotes loose coupling between objects.
- Makes testing easier by allowing mock dependencies to be injected.
- Centralizes object management in the Spring container.

Constructor injection is typically preferred because it ensures dependencies are immutable and mandatory for the object’s operation.

## Why Singleton By Default?

- **Efficiency**
  - Creating a single instance of a bean and sharing it across the application minimizes memory usage and object creation overhead. It's much less expensive than repeatedly creating new instances.
  - Singleton beans work well for stateless services (which is the majority in most backend applications).
- **Consistency**
  - Singleton scope ensures that the same instance is used everywhere, promoting predictable behavior and reducing the chances of subtle bugs due to multiple stateful instances being accidentally created.
- **Dependency injection**
  - Singleton beans simplify dependency injection. You inject the same instance across the application, and everyone gets a shared, consistent version.
- **Thread-safety**
  - For stateless services (the most common case), a singleton bean is inherently thread-safe because it doesn't maintain any internal state specific to a request or thread.

### When Would You Want To Change Singleton Behavior?

The singleton model isn't always appropriate. Here are some situations where changing it makes sense:

- **Stateful beans (e.g., Request/Session Scoped)**
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

- **Prototype scope for per-instance behavior**
  - If you need a new instance of a bean every time it’s requested, use `@Scope("prototype")`.
  - This is common for objects that are stateful or short-lived (e.g., a utility object holding a temporary state).
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

### When To Stick To Singletons?

- **Stateless Services:** Most service classes, like those annotated with `@Service` or `@Repository`, are stateless and should remain singletons.
- **Configuration or Utility Classes:** Classes that act as configuration holders or provide utility methods (e.g., caching, logging) benefit from the singleton scope.

Spring defaults to singleton because it fits the most common use case: stateless, shared services. You should change the scope when state or lifespan becomes critical to the bean’s function (e.g., per-request/session behavior, task-specific data).

If you find yourself asking whether you need a non-singleton, always ask:

- _Does this bean hold state?_
- _Is the state unique per user/session/request/task?_

## The Lifecycle Of A Spring Bean

1. **Instantiation**.
   - The Spring IoC container creates an instance of the bean, either through its constructor or a factory method.
2. **Dependency injection**.
   - After instantiation, the container injects any dependencies (via constructor, setter, or field injection).
3. **Post-initialization hooks**.
   - Beans go through post-initialization hooks for additional setup or configuration:
     - If the bean implements the `InitializingBean` interface, its `afterPropertiesSet()` method is called.
     - If the bean has a method annotated with `@PostConstruct`, that method is executed.
4. **Ready for use**.
   - The bean is now fully initialized, dependencies are injected, and it's ready to serve.
5. **Destruction**.
   - When the application shuts down, the bean is destroyed. Spring provides hooks for custom cleanup:
     - If the bean implements `DisposableBean`, the `destroy()` method is called. 
     - If the bean has a method annotated with `@PreDestroy`, that method is executed.

### Lifecycle Hooks In Detail

1. **Initialization hooks**

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

2. **Destruction hooks**

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

### Full Lifecycle In Code

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
### Bean Lifecycle With Scopes

- **Singleton beans:** The lifecycle occurs once, when the container starts up and shuts down.
- **Prototype beans:** The lifecycle occurs for each new instance. Destruction callbacks (like `@PreDestroy`) are not automatically invoked because the container doesn't manage the entire lifecycle of prototype beans.

### When Would You Use These Hooks?

- **Initialization**:
  - Setting up resources like database connections, caches, or thread pools.
  - Performing validation or configuration checks.
- **Destruction**:
  - Closing database connections.
  - Shutting down thread pools or background tasks.
  - Cleaning up temporary files or releasing locks.

Spring gives you fine-grained control over a bean's lifecycle. While hooks like `@PostConstruct` and `@PreDestroy` are the most modern and widely used, the lifecycle is flexible enough to accommodate custom logic as needed.

## Conclusion

- Beans enable dependency injection, which leads to clean, modular code.
- Spring handles the heavy lifting like object lifecycle and dependencies, so you can focus on business logic.