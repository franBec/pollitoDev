---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 6: Lógica de negocio"
date: 2024-10-15
description: "Lógica de negocio"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/maki-shijo-kaguya-sama-1024x576.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [1. Crear un @Mapper](#1-crear-un-mapper)
    * [Mantenga la capa de integración de API separada de la capa del controlador](#mantenga-la-capa-de-integración-de-api-separada-de-la-capa-del-controlador)
  * [2. Crear un caché](#2-crear-un-caché)
    * [2.1. Agregar dependencias](#21-agregar-dependencias)
    * [2.2 Agregar tiempo de expiración en application.yml](#22-agregar-tiempo-de-expiración-en-applicationyml)
    * [2.3. Crear una configuración de caché](#23-crear-una-configuración-de-caché)
    * [2.4. Crear UsersApiCacheService e implementarlo](#24-crear-usersapicacheservice-e-implementarlo)
  * [3. Crear UsersService e implementarlo](#3-crear-usersservice-e-implementarlo)
    * [¿Por qué paginación?](#por-qué-paginación)
  * [4. Llamar los métodos en UsersController](#4-llamar-los-métodos-en-userscontroller)
  * [4. Ejecutar la aplicación y ver los resultados](#4-ejecutar-la-aplicación-y-ver-los-resultados)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la sexta parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta seria es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, estamos creando un microservicio Java Spring Boot que maneje información sobre los usuarios.
    - Puedes encontrar el resultado final de la serie en el [repo de GitHub - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
    - A continuación se muestra un diagrama de componentes. Para una explicación más detallada, visite [Entendiendo el proyecto](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-entendiendo-el-proyecto)
      ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

De momento hemos creado:
- LogFilter.
- GlobalControllerAdvice.
- UsersController.
- UsersApi.

En este blog vamos a crear UsersService y UsersApiCacheService. ¡Comencemos!

## 1. Crear un @Mapper

Los mappers son una situación de [&ldquo;elige tu propia aventura&rdquo;](https://www.baeldung.com/java-performance-mapping-frameworks). El que yo uso es [MapStruct](https://mapstruct.org/).

Cree una interfaz @Mapper que reciba una lista de usuarios de jsonplaceholder y devuelva una lista de nuestros propios usuarios de microservicio.

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

### Mantenga la capa de integración de API separada de la capa del controlador

Si compruebas lo que está haciendo el mapper, está mapeando esto:

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

A esto:

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

No, no fue un error, no escribí lo mismo dos veces.
![Screenshot2024-10-15112732](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15112732.png)

Quizás te preguntes... ¿Por qué? ¿Por qué realizar el proceso de mapeo en lugar de simplemente devolver la respuesta DTO de feignClient?

1. **Incluso si quisieras, no puedes**: debido a la forma en que este proyecto depende del desarrollo impulsado por contratos con el uso de [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin).

   - Aunque sabemos que tanto el DTO de respuesta feignClient como el DTO de retorno @RestController tienen la misma estructura interna, desde el punto de vista del proyecto, esos dos son objetos diferentes que no tienen nada en común.

2. **De todos modos, sería una mala práctica**: imaginemos que no utilizas el plugin y, en su lugar, escribes tus propios DTO a mano. Aquí tienes una lista de motivos por los que utilizar la misma clase para mapear la respuesta de feignClient y el retorno de @RestController es una mala idea:

   - Si utiliza el mismo DTO para ambos, cualquier cambio en la API externa (campos nuevos, campos obsoletos, etc.) podría afectar innecesariamente su código interno.
   - El uso de un DTO específico de @RestController le permite filtrar y adaptar la respuesta para exponer solo lo que realmente se necesita.
     - Esto evita la filtración de información confidencial o irrelevante y ayuda a reducir el tamaño de la carga útil, lo que mejora el rendimiento.
   - Los DTO de API externas a menudo necesitan mapear formatos o estructuras de datos que no son directamente útiles para su aplicación.
     - Por ejemplo, una API de terceros puede devolver fechas como cadenas, pero internamente es posible que desee trabajar con LocalDate.

Al tener DTO independientes, el código se vuelve más fácil de probar y mantener. Los cambios en los servicios externos no afectarán directamente la funcionalidad principal de su aplicación.

## 2. Crear un caché

Esto es opcional, pero se recomienda para nuestro caso específico. Estamos consumiendo una API cuya respuesta nunca cambia (o si lo hace, no nos importa). Entonces, ¿por qué no almacenar en caché la respuesta en lugar de preguntar lo mismo una y otra vez?

Ten en cuenta que el almacenamiento en caché puede generar respuestas obsoletas. En el mundo real, eso puede convertirse en un efecto secundario no deseado.

### 2.1. Agregar dependencias

Estas son:

- [Spring Boot Starter Cache](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-cache): Starter for using Spring Framework's caching support.
- [Caffeine Cache](https://mvnrepository.com/artifact/com.github.ben-manes.caffeine/caffeine): A high performance caching library.

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dento del tag \<dependencies\>:

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

### 2.2 Agregar tiempo de expiración en application.yml

Bajo jsonplaceholder, cree una nueva propiedad "expiresAfter".

_application.yml_

```yml
jsonplaceholder:
  baseUrl: https://jsonplaceholder.typicode.com/
  expiresAfter: 24 #hours
spring:
  application:
    name: user_manager_backend
```

No olvides agregarlo a la clase @ConfigurationProperties para que puedas tener acceso.

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

### 2.3. Crear una configuración de caché

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
### 2.4. Crear UsersApiCacheService e implementarlo

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

## 3. Crear UsersService e implementarlo

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

### ¿Por qué paginación?

- **Preparación para el futuro:** Si bien el conjunto de datos actual puede ser pequeño (UsersApi solo devuelve 10 usuarios), podría crecer con el tiempo. Si la paginación no está integrada desde el principio, actualizarla más adelante puede ser complejo y requerir versiones o cambios importantes.
- **Flexibilidad para clientes:** Diferentes clientes pueden preferir consumir cantidades más pequeñas de datos, incluso para conjuntos de datos pequeños.
- **Optimización del rendimiento:** Incluso con conjuntos de datos pequeños, algunas operaciones (por ejemplo, clasificación, filtrado) pueden agregar gastos generales. La paginación permite que el servidor y los clientes acuerden fragmentos de datos, lo que puede ayudar a mantener el rendimiento bajo diferentes cargas de trabajo.
- **Seguridad y estabilidad:** La paginación puede ayudar a mitigar los riesgos de denegación de servicio. Incluso para conjuntos de datos pequeños, limitar las respuestas evita una recuperación excesiva de datos accidental (o maliciosa).

## 4. Llamar los métodos en UsersController

Llame al método @Service en la clase @RestController.

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

Quiero que admires cómo la llamada a UsersService es solo **una** línea cada una.

- No lógica de logs.
- No try catch.
- No `if(Objects.isNull())`.

Solo la línea de retorno... Es hermoso de ver, es casi arte. Para cosas como estas me gusta programar.

![FCpH_GYVkAE9NaT](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/FCpH_GYVkAE9NaT.jpg)

## 4. Ejecutar la aplicación y ver los resultados

Realice un Maven clean and compile, y ejecute la clase de aplicación principal. Luego haga una solicitud GET a [localhost:8080/users](http://localhost:8080/users).

![Screenshot2024-10-15180830](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15180830.png)

Repita la solicitud. La memoria caché entrará en acción y debería encontrar un tiempo de respuesta mucho más rápido: pasó de 1014 ms a 13 ms, un aumento de velocidad del 98,7%.
![Screenshot2024-10-15181728](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15181728.png)

## Siguiente lectura

[Pollito&rsquo;s Opinion on Spring Boot Development 7: Unit tests](/es/blog/2024-10-15-pollitos-opinion-on-spring-boot-development-7)
