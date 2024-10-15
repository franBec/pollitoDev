---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 6: Business logic"
date: 2024-10-15
description: "Business logic"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/maki-shijo-kaguya-sama-1024x576.jpg
---

## Some context

This is the sixth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

## Roadmap

Up to this point we've created

- A @RestController class that recieves incoming requests at /users.
- A feignClient interface that requests data from [jsonplaceholder users](https://jsonplaceholder.typicode.com/users).

Let's create a @Service class to complete the microservice.

![Untitled-2024-02-21-1828](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Untitled-2024-02-21-1828.png)

1. Create a @Mapper.
   - Keep the API integration layer distinct from the controller layer.
2. Create a cache.
   - Add dependencies.
   - Add expiring time in application.yml.
   - Create a cache configuration.
3. Create a @Service.
4. Run the application and see the results.

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

![Screenshot2024-10-15112732](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15112732.png)

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

![FCpH_GYVkAE9NaT](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/FCpH_GYVkAE9NaT.jpg)

## 4. Run the application and see the results

Do a maven clean and compile, and run the main application class. Then do a GET request to [localhost:8080/users](http://localhost:8080/users)

![Screenshot2024-10-15180830](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15180830.png)

You should find logs similar to these:

- -> LogFilter
- -> LoggingAspect\[UserController.getUsers()\]
- -> LoggingAspect\[UserApi.getUsers()\]
- <- LoggingAspect\[UserApi.getUsers()\]
- <- LoggingAspect\[UserController.getUsers()\]
- <- LogFilter

```log
2024-10-15T18:08:14.548+01:00  INFO 24904 --- [post] [nio-8080-exec-1] [10e05f8fd3cce1a5d7f122150251337d-5a0ac71f9f84be43] dev.pollito.post.filter.LogFilter        : >>>> Method: GET; URI: /users; QueryString: null; Headers: {user-agent: PostmanRuntime/7.42.0, accept: */*, cache-control: no-cache, postman-token: 4bb30f84-8b11-4db6-8142-69624d6b776c, host: localhost:8080, accept-encoding: gzip, deflate, br, connection: keep-alive}
2024-10-15T18:08:14.584+01:00  INFO 24904 --- [post] [nio-8080-exec-1] [10e05f8fd3cce1a5d7f122150251337d-5a0ac71f9f84be43] dev.pollito.post.aspect.LoggingAspect    : [UserController.getUsers()] Args: []
2024-10-15T18:08:14.607+01:00  INFO 24904 --- [post] [nio-8080-exec-1] [10e05f8fd3cce1a5d7f122150251337d-5a0ac71f9f84be43] dev.pollito.post.aspect.LoggingAspect    : [UserApi.getUsers()] Args: []
2024-10-15T18:08:15.362+01:00  INFO 24904 --- [post] [nio-8080-exec-1] [10e05f8fd3cce1a5d7f122150251337d-5a0ac71f9f84be43] dev.pollito.post.aspect.LoggingAspect    : [UserApi.getUsers()] Response: [class User {
    address: class Address {
        city: Gwenborough
        geo: class Geo {
            lat: -37.3159
            lng: 81.1496
        }
        street: Kulas Light
        suite: Apt. 556
        zipcode: 92998-3874
    }
    company: class Company {
        bs: harness real-time e-markets
        catchPhrase: Multi-layered client-server neural-net
        name: Romaguera-Crona
    }
    email: Sincere@april.biz
    id: 1
    name: Leanne Graham
    phone: 1-770-736-8031 x56442
    username: Bret
    website: hildegard.org
}, class User {
    address: class Address {
        city: Wisokyburgh
        geo: class Geo {
            lat: -43.9509
            lng: -34.4618
        }
        street: Victor Plains
        suite: Suite 879
        zipcode: 90566-7771
    }
    company: class Company {
        bs: synergize scalable supply-chains
        catchPhrase: Proactive didactic contingency
        name: Deckow-Crist
    }
    email: Shanna@melissa.tv
    id: 2
    name: Ervin Howell
    phone: 010-692-6593 x09125
    username: Antonette
    website: anastasia.net
}, class User {
    address: class Address {
        city: McKenziehaven
        geo: class Geo {
            lat: -68.6102
            lng: -47.0653
        }
        street: Douglas Extension
        suite: Suite 847
        zipcode: 59590-4157
    }
    company: class Company {
        bs: e-enable strategic applications
        catchPhrase: Face to face bifurcated interface
        name: Romaguera-Jacobson
    }
    email: Nathan@yesenia.net
    id: 3
    name: Clementine Bauch
    phone: 1-463-123-4447
    username: Samantha
    website: ramiro.info
}, class User {
    address: class Address {
        city: South Elvis
        geo: class Geo {
            lat: 29.4572
            lng: -164.2990
        }
        street: Hoeger Mall
        suite: Apt. 692
        zipcode: 53919-4257
    }
    company: class Company {
        bs: transition cutting-edge web services
        catchPhrase: Multi-tiered zero tolerance productivity
        name: Robel-Corkery
    }
    email: Julianne.OConner@kory.org
    id: 4
    name: Patricia Lebsack
    phone: 493-170-9623 x156
    username: Karianne
    website: kale.biz
}, class User {
    address: class Address {
        city: Roscoeview
        geo: class Geo {
            lat: -31.8129
            lng: 62.5342
        }
        street: Skiles Walks
        suite: Suite 351
        zipcode: 33263
    }
    company: class Company {
        bs: revolutionize end-to-end systems
        catchPhrase: User-centric fault-tolerant solution
        name: Keebler LLC
    }
    email: Lucio_Hettinger@annie.ca
    id: 5
    name: Chelsey Dietrich
    phone: (254)954-1289
    username: Kamren
    website: demarco.info
}, class User {
    address: class Address {
        city: South Christy
        geo: class Geo {
            lat: -71.4197
            lng: 71.7478
        }
        street: Norberto Crossing
        suite: Apt. 950
        zipcode: 23505-1337
    }
    company: class Company {
        bs: e-enable innovative applications
        catchPhrase: Synchronised bottom-line interface
        name: Considine-Lockman
    }
    email: Karley_Dach@jasper.info
    id: 6
    name: Mrs. Dennis Schulist
    phone: 1-477-935-8478 x6430
    username: Leopoldo_Corkery
    website: ola.org
}, class User {
    address: class Address {
        city: Howemouth
        geo: class Geo {
            lat: 24.8918
            lng: 21.8984
        }
        street: Rex Trail
        suite: Suite 280
        zipcode: 58804-1099
    }
    company: class Company {
        bs: generate enterprise e-tailers
        catchPhrase: Configurable multimedia task-force
        name: Johns Group
    }
    email: Telly.Hoeger@billy.biz
    id: 7
    name: Kurtis Weissnat
    phone: 210.067.6132
    username: Elwyn.Skiles
    website: elvis.io
}, class User {
    address: class Address {
        city: Aliyaview
        geo: class Geo {
            lat: -14.3990
            lng: -120.7677
        }
        street: Ellsworth Summit
        suite: Suite 729
        zipcode: 45169
    }
    company: class Company {
        bs: e-enable extensible e-tailers
        catchPhrase: Implemented secondary concept
        name: Abernathy Group
    }
    email: Sherwood@rosamond.me
    id: 8
    name: Nicholas Runolfsdottir V
    phone: 586.493.6943 x140
    username: Maxime_Nienow
    website: jacynthe.com
}, class User {
    address: class Address {
        city: Bartholomebury
        geo: class Geo {
            lat: 24.6463
            lng: -168.8889
        }
        street: Dayna Park
        suite: Suite 449
        zipcode: 76495-3109
    }
    company: class Company {
        bs: aggregate real-time technologies
        catchPhrase: Switchable contextually-based project
        name: Yost and Sons
    }
    email: Chaim_McDermott@dana.io
    id: 9
    name: Glenna Reichert
    phone: (775)976-6794 x41206
    username: Delphine
    website: conrad.com
}, class User {
    address: class Address {
        city: Lebsackbury
        geo: class Geo {
            lat: -38.2386
            lng: 57.2232
        }
        street: Kattie Turnpike
        suite: Suite 198
        zipcode: 31428-2261
    }
    company: class Company {
        bs: target end-to-end models
        catchPhrase: Centralized empowering task-force
        name: Hoeger LLC
    }
    email: Rey.Padberg@karina.biz
    id: 10
    name: Clementina DuBuque
    phone: 024-648-3804
    username: Moriah.Stanton
    website: ambrose.net
}]
2024-10-15T18:08:15.374+01:00  INFO 24904 --- [post] [nio-8080-exec-1] [10e05f8fd3cce1a5d7f122150251337d-5a0ac71f9f84be43] dev.pollito.post.aspect.LoggingAspect    : [UserController.getUsers()] Response: <200 OK OK,[class User {
    address: class Address {
        city: Gwenborough
        geo: class Geo {
            lat: -37.3159
            lng: 81.1496
        }
        street: Kulas Light
        suite: Apt. 556
        zipcode: 92998-3874
    }
    company: class Company {
        bs: harness real-time e-markets
        catchPhrase: Multi-layered client-server neural-net
        name: Romaguera-Crona
    }
    email: Sincere@april.biz
    id: 1
    name: Leanne Graham
    phone: 1-770-736-8031 x56442
    username: Bret
    website: hildegard.org
}, class User {
    address: class Address {
        city: Wisokyburgh
        geo: class Geo {
            lat: -43.9509
            lng: -34.4618
        }
        street: Victor Plains
        suite: Suite 879
        zipcode: 90566-7771
    }
    company: class Company {
        bs: synergize scalable supply-chains
        catchPhrase: Proactive didactic contingency
        name: Deckow-Crist
    }
    email: Shanna@melissa.tv
    id: 2
    name: Ervin Howell
    phone: 010-692-6593 x09125
    username: Antonette
    website: anastasia.net
}, class User {
    address: class Address {
        city: McKenziehaven
        geo: class Geo {
            lat: -68.6102
            lng: -47.0653
        }
        street: Douglas Extension
        suite: Suite 847
        zipcode: 59590-4157
    }
    company: class Company {
        bs: e-enable strategic applications
        catchPhrase: Face to face bifurcated interface
        name: Romaguera-Jacobson
    }
    email: Nathan@yesenia.net
    id: 3
    name: Clementine Bauch
    phone: 1-463-123-4447
    username: Samantha
    website: ramiro.info
}, class User {
    address: class Address {
        city: South Elvis
        geo: class Geo {
            lat: 29.4572
            lng: -164.2990
        }
        street: Hoeger Mall
        suite: Apt. 692
        zipcode: 53919-4257
    }
    company: class Company {
        bs: transition cutting-edge web services
        catchPhrase: Multi-tiered zero tolerance productivity
        name: Robel-Corkery
    }
    email: Julianne.OConner@kory.org
    id: 4
    name: Patricia Lebsack
    phone: 493-170-9623 x156
    username: Karianne
    website: kale.biz
}, class User {
    address: class Address {
        city: Roscoeview
        geo: class Geo {
            lat: -31.8129
            lng: 62.5342
        }
        street: Skiles Walks
        suite: Suite 351
        zipcode: 33263
    }
    company: class Company {
        bs: revolutionize end-to-end systems
        catchPhrase: User-centric fault-tolerant solution
        name: Keebler LLC
    }
    email: Lucio_Hettinger@annie.ca
    id: 5
    name: Chelsey Dietrich
    phone: (254)954-1289
    username: Kamren
    website: demarco.info
}, class User {
    address: class Address {
        city: South Christy
        geo: class Geo {
            lat: -71.4197
            lng: 71.7478
        }
        street: Norberto Crossing
        suite: Apt. 950
        zipcode: 23505-1337
    }
    company: class Company {
        bs: e-enable innovative applications
        catchPhrase: Synchronised bottom-line interface
        name: Considine-Lockman
    }
    email: Karley_Dach@jasper.info
    id: 6
    name: Mrs. Dennis Schulist
    phone: 1-477-935-8478 x6430
    username: Leopoldo_Corkery
    website: ola.org
}, class User {
    address: class Address {
        city: Howemouth
        geo: class Geo {
            lat: 24.8918
            lng: 21.8984
        }
        street: Rex Trail
        suite: Suite 280
        zipcode: 58804-1099
    }
    company: class Company {
        bs: generate enterprise e-tailers
        catchPhrase: Configurable multimedia task-force
        name: Johns Group
    }
    email: Telly.Hoeger@billy.biz
    id: 7
    name: Kurtis Weissnat
    phone: 210.067.6132
    username: Elwyn.Skiles
    website: elvis.io
}, class User {
    address: class Address {
        city: Aliyaview
        geo: class Geo {
            lat: -14.3990
            lng: -120.7677
        }
        street: Ellsworth Summit
        suite: Suite 729
        zipcode: 45169
    }
    company: class Company {
        bs: e-enable extensible e-tailers
        catchPhrase: Implemented secondary concept
        name: Abernathy Group
    }
    email: Sherwood@rosamond.me
    id: 8
    name: Nicholas Runolfsdottir V
    phone: 586.493.6943 x140
    username: Maxime_Nienow
    website: jacynthe.com
}, class User {
    address: class Address {
        city: Bartholomebury
        geo: class Geo {
            lat: 24.6463
            lng: -168.8889
        }
        street: Dayna Park
        suite: Suite 449
        zipcode: 76495-3109
    }
    company: class Company {
        bs: aggregate real-time technologies
        catchPhrase: Switchable contextually-based project
        name: Yost and Sons
    }
    email: Chaim_McDermott@dana.io
    id: 9
    name: Glenna Reichert
    phone: (775)976-6794 x41206
    username: Delphine
    website: conrad.com
}, class User {
    address: class Address {
        city: Lebsackbury
        geo: class Geo {
            lat: -38.2386
            lng: 57.2232
        }
        street: Kattie Turnpike
        suite: Suite 198
        zipcode: 31428-2261
    }
    company: class Company {
        bs: target end-to-end models
        catchPhrase: Centralized empowering task-force
        name: Hoeger LLC
    }
    email: Rey.Padberg@karina.biz
    id: 10
    name: Clementina DuBuque
    phone: 024-648-3804
    username: Moriah.Stanton
    website: ambrose.net
}],[]>
2024-10-15T18:08:15.444+01:00  INFO 24904 --- [post] [nio-8080-exec-1] [10e05f8fd3cce1a5d7f122150251337d-5a0ac71f9f84be43] dev.pollito.post.filter.LogFilter        : <<<< Response Status: 200
```

Repeat the request. The cache will come into play and you should expect:

- A much quicker response time: It went from 1014ms down to 13ms, a 98.7% speed increase.
  ![Screenshot2024-10-15181728](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15181728.png)

- The absence of UserApi.getUsers() in the logs: You should find logs similar to these:
  - -> LogFilter
  - -> LoggingAspect\[UserController.getUsers()\]
  - <- LoggingAspect\[UserController.getUsers()\]
  - <- LogFilter

```log
2024-10-15T18:17:22.726+01:00  INFO 24904 --- [post] [nio-8080-exec-9] [bd43401b0c1b99f83e825d3030bd43b2-67fc3b1f4a2d959b] dev.pollito.post.filter.LogFilter        : >>>> Method: GET; URI: /users; QueryString: null; Headers: {user-agent: PostmanRuntime/7.42.0, accept: */*, cache-control: no-cache, postman-token: 2520d4dd-f057-45cf-9480-0cc80f606e1c, host: localhost:8080, accept-encoding: gzip, deflate, br, connection: keep-alive}
2024-10-15T18:17:22.728+01:00  INFO 24904 --- [post] [nio-8080-exec-9] [bd43401b0c1b99f83e825d3030bd43b2-67fc3b1f4a2d959b] dev.pollito.post.aspect.LoggingAspect    : [UserController.getUsers()] Args: []
2024-10-15T18:17:22.730+01:00  INFO 24904 --- [post] [nio-8080-exec-9] [bd43401b0c1b99f83e825d3030bd43b2-67fc3b1f4a2d959b] dev.pollito.post.aspect.LoggingAspect    : [UserController.getUsers()] Response: <200 OK OK,[class User {
    address: class Address {
        city: Gwenborough
        geo: class Geo {
            lat: -37.3159
            lng: 81.1496
        }
        street: Kulas Light
        suite: Apt. 556
        zipcode: 92998-3874
    }
    company: class Company {
        bs: harness real-time e-markets
        catchPhrase: Multi-layered client-server neural-net
        name: Romaguera-Crona
    }
    email: Sincere@april.biz
    id: 1
    name: Leanne Graham
    phone: 1-770-736-8031 x56442
    username: Bret
    website: hildegard.org
}, class User {
    address: class Address {
        city: Wisokyburgh
        geo: class Geo {
            lat: -43.9509
            lng: -34.4618
        }
        street: Victor Plains
        suite: Suite 879
        zipcode: 90566-7771
    }
    company: class Company {
        bs: synergize scalable supply-chains
        catchPhrase: Proactive didactic contingency
        name: Deckow-Crist
    }
    email: Shanna@melissa.tv
    id: 2
    name: Ervin Howell
    phone: 010-692-6593 x09125
    username: Antonette
    website: anastasia.net
}, class User {
    address: class Address {
        city: McKenziehaven
        geo: class Geo {
            lat: -68.6102
            lng: -47.0653
        }
        street: Douglas Extension
        suite: Suite 847
        zipcode: 59590-4157
    }
    company: class Company {
        bs: e-enable strategic applications
        catchPhrase: Face to face bifurcated interface
        name: Romaguera-Jacobson
    }
    email: Nathan@yesenia.net
    id: 3
    name: Clementine Bauch
    phone: 1-463-123-4447
    username: Samantha
    website: ramiro.info
}, class User {
    address: class Address {
        city: South Elvis
        geo: class Geo {
            lat: 29.4572
            lng: -164.2990
        }
        street: Hoeger Mall
        suite: Apt. 692
        zipcode: 53919-4257
    }
    company: class Company {
        bs: transition cutting-edge web services
        catchPhrase: Multi-tiered zero tolerance productivity
        name: Robel-Corkery
    }
    email: Julianne.OConner@kory.org
    id: 4
    name: Patricia Lebsack
    phone: 493-170-9623 x156
    username: Karianne
    website: kale.biz
}, class User {
    address: class Address {
        city: Roscoeview
        geo: class Geo {
            lat: -31.8129
            lng: 62.5342
        }
        street: Skiles Walks
        suite: Suite 351
        zipcode: 33263
    }
    company: class Company {
        bs: revolutionize end-to-end systems
        catchPhrase: User-centric fault-tolerant solution
        name: Keebler LLC
    }
    email: Lucio_Hettinger@annie.ca
    id: 5
    name: Chelsey Dietrich
    phone: (254)954-1289
    username: Kamren
    website: demarco.info
}, class User {
    address: class Address {
        city: South Christy
        geo: class Geo {
            lat: -71.4197
            lng: 71.7478
        }
        street: Norberto Crossing
        suite: Apt. 950
        zipcode: 23505-1337
    }
    company: class Company {
        bs: e-enable innovative applications
        catchPhrase: Synchronised bottom-line interface
        name: Considine-Lockman
    }
    email: Karley_Dach@jasper.info
    id: 6
    name: Mrs. Dennis Schulist
    phone: 1-477-935-8478 x6430
    username: Leopoldo_Corkery
    website: ola.org
}, class User {
    address: class Address {
        city: Howemouth
        geo: class Geo {
            lat: 24.8918
            lng: 21.8984
        }
        street: Rex Trail
        suite: Suite 280
        zipcode: 58804-1099
    }
    company: class Company {
        bs: generate enterprise e-tailers
        catchPhrase: Configurable multimedia task-force
        name: Johns Group
    }
    email: Telly.Hoeger@billy.biz
    id: 7
    name: Kurtis Weissnat
    phone: 210.067.6132
    username: Elwyn.Skiles
    website: elvis.io
}, class User {
    address: class Address {
        city: Aliyaview
        geo: class Geo {
            lat: -14.3990
            lng: -120.7677
        }
        street: Ellsworth Summit
        suite: Suite 729
        zipcode: 45169
    }
    company: class Company {
        bs: e-enable extensible e-tailers
        catchPhrase: Implemented secondary concept
        name: Abernathy Group
    }
    email: Sherwood@rosamond.me
    id: 8
    name: Nicholas Runolfsdottir V
    phone: 586.493.6943 x140
    username: Maxime_Nienow
    website: jacynthe.com
}, class User {
    address: class Address {
        city: Bartholomebury
        geo: class Geo {
            lat: 24.6463
            lng: -168.8889
        }
        street: Dayna Park
        suite: Suite 449
        zipcode: 76495-3109
    }
    company: class Company {
        bs: aggregate real-time technologies
        catchPhrase: Switchable contextually-based project
        name: Yost and Sons
    }
    email: Chaim_McDermott@dana.io
    id: 9
    name: Glenna Reichert
    phone: (775)976-6794 x41206
    username: Delphine
    website: conrad.com
}, class User {
    address: class Address {
        city: Lebsackbury
        geo: class Geo {
            lat: -38.2386
            lng: 57.2232
        }
        street: Kattie Turnpike
        suite: Suite 198
        zipcode: 31428-2261
    }
    company: class Company {
        bs: target end-to-end models
        catchPhrase: Centralized empowering task-force
        name: Hoeger LLC
    }
    email: Rey.Padberg@karina.biz
    id: 10
    name: Clementina DuBuque
    phone: 024-648-3804
    username: Moriah.Stanton
    website: ambrose.net
}],[]>
2024-10-15T18:17:22.733+01:00  INFO 24904 --- [post] [nio-8080-exec-9] [bd43401b0c1b99f83e825d3030bd43b2-67fc3b1f4a2d959b] dev.pollito.post.filter.LogFilter        : <<<< Response Status: 200
```

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 7: Unit tests](/en/blog/2024-10-15-pollitos-opinion-on-spring-boot-development-7)
