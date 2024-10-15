---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 6: Business logic"
date: 2024-10-14
description: "Business logic"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-14-pollitos-opinion-on-spring-boot-development-6/maki-shijo-kaguya-sama-1024x576.jpg
---

## Some context

This is the sixth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

## Roadmap

Up to this point we've created

- A @RestController class that recieves incoming requests at /users.
- A feignClient interface that requests data from [jsonplaceholder users](https://jsonplaceholder.typicode.com/users).

Let's create a @Service class to complete the microservice.

![Untitled-2024-02-21-1828](/uploads/2024-10-14-pollitos-opinion-on-spring-boot-development-6/Untitled-2024-02-21-1828.png)

1. Create a @Mapper.
   - Keep the API integration layer distinct from the controller layer.
2. Create a cache.
   - Add dependencies.
   - Add expiring time in application.yml.
   - Create a cache configuration.
3. Create a @Service.

## 1. Create a @Mapper

Mappers are a [ &ldquo;choose your own adventure&rdquo; situation](https://www.baeldung.com/java-performance-mapping-frameworks). The one I use is [MapStruct](https://mapstruct.org/).

Create a @Mapper interface that recieves a list of jsonplaceholder's users, and returns a list of our own microservice users.

```java
import dev.pollito.post.model.User;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
  List<User> map(List<com.typicode.jsonplaceholder.model.User> users);
}
```

### Keep the API integration layer distinct from the controller layer

If you check what the mapper is doing, is mapping this:

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

![Screenshot2024-10-15112732](/uploads/2024-10-14-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15112732.png)

So you may be asking... why? Why do the mapping process instead of just returning the feignClient response DTO?

1. **Even if you wanted, you can't**: cause of the way this project heavily relies on Contract-Driven Development with the use of the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin).

   - Though we know that both the feignClient response DTO and the @RestController return DTO have the same inner structure, from the project POV, those two are different objects that have nothing in common.

2. **It would be a bad practice anyways**: Let's imagine that you don't use the plugin and instead you write your own DTOs by hand. Here's a list of reasons why using the same class for both mapping the feignClient response and @RestController return is a bad idea:

   - If you use the same DTO for both, any changes in the external API (new fields, deprecated fields, etc.) might unnecessarily impact your internal code.
   - Using a @RestController specific DTO lets you filter and tailor the response to only expose what's truly needed.
     - This prevents leaking sensitive or irrelevant information and helps reduce payload size, improving performance.
   - External API DTOs often need to map data formats or structures that are not directly useful to your application.
     - For example, a 3rd party API might return dates as strings, but internally you might want to work with LocalDate

By having separate DTOs, your codebase becomes easier to test and maintain. Changes to external services won't directly affect your core application's functionality.

## 2. Create a cache

This is optional but recommended for our specific case. We are consuming an API whose response never change (or if it does, we don't care). So, why not cache the response instead of asking the same thing over and over again?

Take into consideration that caching can lead to outdated responses. In real life that can become an unwanted side effect.

### Add dependencies

These are:

- [Spring Boot Starter Cache](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-cache): Starter for using Spring Framework's caching support.
- [Caffeine Cache](https://mvnrepository.com/artifact/com.github.ben-manes.caffeine/caffeine): A high performance caching library.

Here I leave some ready copy-paste for you. Consider double checking the latest version.

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

### Add expiring time in application.yml

Under jsonplaceholder, create a new property "expiresAfter".

_application.yml_

```yml
jsonplaceholder:
  baseUrl: https://jsonplaceholder.typicode.com/
  expiresAfter: 24 #hours
spring:
  application:
    name: post
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

### Create a cache configuration

_config/CacheConfig.java_

```java
import com.github.benmanes.caffeine.cache.Caffeine;
import dev.pollito.post.config.properties.JsonPlaceholderConfigProperties;
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

## 3. Create a @Service

_service/UserService.java_

```java
import dev.pollito.post.model.User;
import java.util.List;

public interface UserService {
  List<User> getUsers();
}
```

_service/impl/UserServiceImpl.java_

```java
import static dev.pollito.post.config.CacheConfig.JSON_PLACEHOLDER_CACHE;

import com.typicode.jsonplaceholder.api.UserApi;
import dev.pollito.post.mapper.UserMapper;
import dev.pollito.post.model.User;
import dev.pollito.post.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
  private final UserApi userApi;
  private final UserMapper userMapper;

  @Override
  @Cacheable(value = JSON_PLACEHOLDER_CACHE)
  public List<User> getUsers() {
    return userMapper.map(userApi.getUsers());
  }
}
```

Call the @Service method in the @RestController class.

_controller/UserController.java_

```java
import dev.pollito.post.api.UsersApi;
import dev.pollito.post.model.User;
import dev.pollito.post.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController implements UsersApi {
  private final UserService userService;

  @Override
  public ResponseEntity<List<User>> getUsers() {
    return ResponseEntity.ok(userService.getUsers());
  }
}
```

I want you to admire how the _List\<User\> getUsers()_ implementation and the call by the @RestController is just **one** line each.

- No log logic
- No try catch
- No if(Objects.isNull())

Just the return line... It is beautiful to see, it's almost art. For things like these I like coding.

![FCpH_GYVkAE9NaT](/uploads/2024-10-14-pollitos-opinion-on-spring-boot-development-6/FCpH_GYVkAE9NaT.jpg)

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 7: Unit tests](/en/blog/2024-10-15-pollitos-opinion-on-spring-boot-development-7)
