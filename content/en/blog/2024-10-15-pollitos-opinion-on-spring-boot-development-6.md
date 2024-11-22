---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 6: Business logic"
date: 2024-10-15
description: "Business logic"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/maki-shijo-kaguya-sama-1024x576.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [1. Create a @Mapper](#1-create-a-mapper)
    * [Keep the API integration layer distinct from the controller layer](#keep-the-api-integration-layer-distinct-from-the-controller-layer)
  * [2. Create a cache](#2-create-a-cache)
    * [2.1. Add dependencies](#21-add-dependencies)
    * [2.2. Add expiring time in application.yml](#22-add-expiring-time-in-applicationyml)
    * [2.3. Create a cache configuration](#23-create-a-cache-configuration)
    * [2.4. Create UsersApiCacheService and implement it](#24-create-usersapicacheservice-and-implement-it)
  * [3. Create UsersService and implement it](#3-create-usersservice-and-implement-it)
    * [Why are you doing pagination?](#why-are-you-doing-pagination)
  * [4. Call the methods in UsersController](#4-call-the-methods-in-userscontroller)
  * [4. Run the application and see the results](#4-run-the-application-and-see-the-results)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the sixth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we are creating a Java Spring Boot Microservice that handles information about users.
    - You can find the code of the final result at [this GitHub repo - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
    - Here's a diagram of its components. For a deep explanation visit [Understanding the project](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-understanding-the-project)
      ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

So far we created:
- LogFilter.
- GlobalControllerAdvice.
- UsersController.
- UsersApi.

In this blog we are going to create UsersService and UsersApiCacheService. Let's start!

## 1. Create a @Mapper

Mappers are a [&ldquo;choose your own adventure&rdquo; situation](https://www.baeldung.com/java-performance-mapping-frameworks). The one I use is [MapStruct](https://mapstruct.org/).

Create a @Mapper interface that receives a list of jsonplaceholder's users, and returns a list of our own microservice users.

```java
import dev.pollito.user_manager_backend.model.User;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserModelMapper {
  List<User> map(List<com.typicode.jsonplaceholder.model.User> users);
}
```

### Keep the API integration layer distinct from the controller layer

If you check what the mapper is doing, it is mapping this:

```json
[
  {
    "address": {
      "city": "Gwenborough",
      "geo": {
        "lat": "-37.3159",
        "lng": "81.1496"
      },
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "zipcode": "92998-3874"
    },
    "company": {
      "bs": "harness real-time e-markets",
      "catchPhrase": "Multi-layered client-server neural-net",
      "name": "Romaguera-Crona"
    },
    "email": "Sincere@april.biz",
    "id": 1,
    "name": "Leanne Graham",
    "phone": "1-770-736-8031 x56442",
    "username": "Bret",
    "website": "hildegard.org"
  }
]
```

into this:

```json
[
  {
    "address": {
      "city": "Gwenborough",
      "geo": {
        "lat": "-37.3159",
        "lng": "81.1496"
      },
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "zipcode": "92998-3874"
    },
    "company": {
      "bs": "harness real-time e-markets",
      "catchPhrase": "Multi-layered client-server neural-net",
      "name": "Romaguera-Crona"
    },
    "email": "Sincere@april.biz",
    "id": 1,
    "name": "Leanne Graham",
    "phone": "1-770-736-8031 x56442",
    "username": "Bret",
    "website": "hildegard.org"
  }
]
```

Nope, that was not a mistake, I did not write the same thing twice.

![Screenshot2024-10-15112732](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15112732.png)

So you may be asking... why? Why do the mapping process instead of just returning the feignClient response DTO?

1. **Even if you wanted, you can't**: cause of the way this project heavily relies on Contract-Driven Development with the use of the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin).

   - Though we know that both the feignClient response DTO and the @RestController return DTO have the same inner structure, from the project POV, those two are different objects that have nothing in common.

2. **It would be a bad practice anyway**: Let's imagine that you don't use the plugin, and instead you write your own DTOs by hand. Here's a list of reasons why using the same class for both mapping the feignClient response and @RestController return is a bad idea:

   - If you use the same DTO for both, any changes in the external API (new fields, deprecated fields, etc.) might unnecessarily impact your internal code.
   - Using a @RestController specific DTO lets you filter and tailor the response to only expose what's truly needed.
     - This prevents leaking sensitive or irrelevant information and helps reduce payload size, improving performance.
   - External API DTOs often need to map data formats or structures that are not directly useful to your application.
     - For example, a 3rd party API might return dates as strings, but internally you might want to work with LocalDate.

By having separate DTOs, the codebase becomes easier to test and maintain. Changes to external services won't directly affect your core application's functionality.

## 2. Create a cache

This is optional but recommended for our specific case. We are consuming an API whose response never change (or if it does, we don't care). So, why not cache the response instead of asking the same thing over and over again?

Take into consideration that caching can lead to outdated responses. In real life that can become an unwanted side effect.

### 2.1. Add dependencies

These are:

- [Spring Boot Starter Cache](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-cache): Starter for using Spring Framework's caching support.
- [Caffeine Cache](https://mvnrepository.com/artifact/com.github.ben-manes.caffeine/caffeine): A high performance caching library.

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

Under the \<dependencies\> tag:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>3.1.8</version>
</dependency>
```

### 2.2. Add expiring time in application.yml

Under jsonplaceholder, create a new property "expiresAfter".

_application.yml_

```yml
jsonplaceholder:
  baseUrl: https://jsonplaceholder.typicode.com/
  expiresAfter: 24 #hours
spring:
  application:
    name: user_manager_backend
```

Don't forget to add it to the @ConfigurationProperties class so you can have access to it.

_config/properties/JsonPlaceholderConfigProperties.java_

```java
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jsonplaceholder")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JsonPlaceholderConfigProperties {
  String baseUrl;
  Integer expiresAfter;
}
```

### 2.3. Create a cache configuration

_config/CacheConfig.java_

```java
import com.github.benmanes.caffeine.cache.Caffeine;
import dev.pollito.user_manager_backend.config.properties.JsonPlaceholderConfigProperties;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
@RequiredArgsConstructor
public class CacheConfig {
  private final JsonPlaceholderConfigProperties jsonPlaceholderConfigProperties;
  public static final String JSON_PLACEHOLDER_CACHE = "JSON_PLACEHOLDER_CACHE";

  @Bean
  public CacheManager cacheManager() {
    CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager(JSON_PLACEHOLDER_CACHE);
    caffeineCacheManager.setCaffeine(
        Caffeine.newBuilder()
            .expireAfterWrite(jsonPlaceholderConfigProperties.getExpiresAfter(), TimeUnit.HOURS));

    return caffeineCacheManager;
  }
}
```

### 2.4. Create UsersApiCacheService and implement it

_service/UsersApiCacheService.java_

```java
import com.typicode.jsonplaceholder.model.User;
import java.util.List;

public interface UsersApiCacheService {
  List<User> getUsers();
}
```
_service/impl/UsersApiCacheServiceImpl.java_

```java

import static dev.pollito.user_manager_backend.config.CacheConfig.JSON_PLACEHOLDER_CACHE;

import com.typicode.jsonplaceholder.api.UserApi;
import com.typicode.jsonplaceholder.model.User;
import dev.pollito.user_manager_backend.service.UsersApiCacheService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersApiCacheServiceImpl implements UsersApiCacheService {
  private final UserApi userApi;

  @Override
  @Cacheable(value = JSON_PLACEHOLDER_CACHE)
  public List<User> getUsers() {
    return userApi.getUsers();
  }
}
```
## 3. Create UsersService and implement it

_service/UsersService.java_

```java
import dev.pollito.user_manager_backend.model.SortDirection;
import dev.pollito.user_manager_backend.model.User;
import dev.pollito.user_manager_backend.model.UserSortProperty;
import dev.pollito.user_manager_backend.model.Users;

public interface UsersService {
  User findById(Long id);

  Users findAll(
      Integer pageNumber,
      Integer pageSize,
      UserSortProperty sortProperty,
      SortDirection sortDirection,
      String q);
}
```

_service/impl/UsersServiceImpl.java_

```java
import dev.pollito.user_manager_backend.mapper.UserModelMapper;
import dev.pollito.user_manager_backend.model.Pageable;
import dev.pollito.user_manager_backend.model.SortDirection;
import dev.pollito.user_manager_backend.model.User;
import dev.pollito.user_manager_backend.model.UserSortProperty;
import dev.pollito.user_manager_backend.model.Users;
import dev.pollito.user_manager_backend.service.UsersApiCacheService;
import dev.pollito.user_manager_backend.service.UsersService;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersServiceImpl implements UsersService {
  private final UsersApiCacheService userApi;
  private final UserModelMapper userModelMapper;

  @Override
  public Users findAll(
      Integer pageNumber,
      Integer pageSize,
      UserSortProperty sortProperty,
      SortDirection sortDirection,
      String q) {
    List<User> users = getUsersFromApi();
    users = filterUsers(q, users);
    users = sortUsers(users, sortProperty, sortDirection);

    return new Users()
        .content(usersSubList(users, pageNumber, pageSize))
        .pageable(new Pageable().pageNumber(pageNumber).pageSize(pageSize))
        .totalElements(users.size());
  }

  @Override
  public User findById(Long id) {
    return getUsersFromApi().stream()
        .filter(user -> user.getId().equals(id))
        .findFirst()
        .orElseThrow(NoSuchElementException::new);
  }

  private List<User> getUsersFromApi() {
    return userModelMapper.map(userApi.getUsers());
  }

  private static List<User> filterUsers(String q, List<User> users) {
    if (Objects.nonNull(q) && !q.isEmpty()) {
      users = users.stream().filter(user -> filterUsersPredicate(q, user)).toList();
    }
    return users;
  }

  private static boolean filterUsersPredicate(@NotNull String q, @NotNull User user) {
    String query = q.toLowerCase();
    return (Objects.nonNull(user.getEmail()) && user.getEmail().toLowerCase().contains(query))
        || (Objects.nonNull(user.getName()) && user.getName().toLowerCase().contains(query))
        || (Objects.nonNull(user.getUsername())
            && user.getUsername().toLowerCase().contains(query));
  }

  private static List<User> sortUsers(
      List<User> users, @NotNull UserSortProperty sortProperty, SortDirection sortDirection) {
    Comparator<User> comparator =
        switch (sortProperty) {
          case EMAIL -> Comparator.comparing(User::getEmail);
          case ID -> Comparator.comparing(User::getId);
          case NAME -> Comparator.comparing(User::getName);
          case USERNAME -> Comparator.comparing(User::getUsername);
        };

    if (SortDirection.DESC.equals(sortDirection)) {
      comparator = comparator.reversed();
    }

    return users.stream().sorted(comparator).toList();
  }

  private static @NotNull List<User> usersSubList(
      @NotNull List<User> users, Integer pageNumber, Integer pageSize) {
    int total = users.size();
    int fromIndex = Math.min(pageNumber * pageSize, total);
    int toIndex = Math.min(fromIndex + pageSize, total);

    return users.subList(fromIndex, toIndex);
  }
}
```

### Why are you doing pagination?

- **Future proofing:** While the current dataset might be small (UsersApi only returns 10 users), it could grow over time. If pagination isn’t built in from the start, retrofitting it later can be complex and might require versioning or breaking changes.
- **Flexibility for Clients:** Different clients might prefer consuming smaller chunks of data, even for small datasets.
- **Performance Optimization:** Even with small datasets, some operations (e.g., sorting, filtering) might add overhead. Pagination lets the server and clients agree on data chunks, which can help maintain performance under varying workloads.
- **Security and Stability:** Pagination can help mitigate denial-of-service risks. Even for small datasets, limiting responses prevents accidental (or malicious) over-fetching of data.

## 4. Call the methods in UsersController

_controller/UsersController.java_

```java
import dev.pollito.user_manager_backend.api.UsersApi;
import dev.pollito.user_manager_backend.model.SortDirection;
import dev.pollito.user_manager_backend.model.User;
import dev.pollito.user_manager_backend.model.UserSortProperty;
import dev.pollito.user_manager_backend.model.Users;
import dev.pollito.user_manager_backend.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UsersController implements UsersApi {
  private final UsersService usersService;

  @Override
  public ResponseEntity<Users> findAll(
      Integer pageNumber,
      Integer pageSize,
      @NotNull UserSortProperty sortProperty,
      @NotNull SortDirection sortDirection,
      String q) {
    return ResponseEntity.ok(
        usersService.findAll(pageNumber, pageSize, sortProperty, sortDirection, q));
  }

  @Override
  public ResponseEntity<User> findById(Long id) {
    return ResponseEntity.ok(usersService.findById(id));
  }
}
```

I want you to admire how the call to UsersService is just **one** line each.

- No log logic.
- No try catch.
- No `if(Objects.isNull())`.

Just the return line... It is beautiful to see, it's almost art. For things like these I like coding.

![FCpH_GYVkAE9NaT](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/FCpH_GYVkAE9NaT.jpg)

## 4. Run the application and see the results

Do a maven clean and compile, and run the main application class. Then do a GET request to [localhost:8080/users](http://localhost:8080/users).

![Screenshot2024-10-15180830](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15180830.png)

Repeat the request. The cache will come into play, and you should find a much quicker response time: It went from 1014ms down to 13ms, a 98.7% speed increase.
![Screenshot2024-10-15181728](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15181728.png)

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 7: Unit tests](/en/blog/2024-10-15-pollitos-opinion-on-spring-boot-development-7)
