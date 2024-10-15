---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 6: Lógica de negocio"
date: 2024-10-15
description: "Lógica de negocio"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/maki-shijo-kaguya-sama-1024x576.jpg
---

## Un poco de contexto

Esta es la sexta parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

## Roadmap

Hasta este punto hemos creado:

- Una clase @RestController que recibe solicitudes entrantes en /users.
- Una interfaz de cliente falsa que solicita datos de [jsonplaceholder users](https://jsonplaceholder.typicode.com/users).

Creemos una clase @Service para completar el microservicio.

![Untitled-2024-02-21-1828](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Untitled-2024-02-21-1828.png)

1. Crear un @Mapper.
   - Mantenga la capa de integración de API separada de la capa del controlador.
2. Crear un caché.
   - Agregar dependencias.
   - Agregar tiempo de expiración en application.yml.
   - Crear una configuración de caché.
3. Crear un @Service.
4. Ejecutar la aplicación y ver los resultados.

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

a esto:

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

Quizás te preguntes... ¿por qué? ¿Por qué realizar el proceso de mapeo en lugar de simplemente devolver la respuesta DTO de feignClient?

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

### Agregar dependencias

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

### Agregar tiempo de expiración en application.yml

Bajo jsonplaceholder, cree una nueva propiedad "expiresAfter".

_application.yml_

```yml
jsonplaceholder:
  baseUrl: https://jsonplaceholder.typicode.com/
  expiresAfter: 24 #hours
spring:
  application:
    name: post
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

### Crear una configuración de caché

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

## 3. Crear un @Service

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

Llame al método @Service en la clase @RestController.

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

Quiero que admires cómo la implementación de _List\<User\> getUsers()_ y la llamada desde @RestController son solo **una** línea cada una.

- No log logic
- No try catch
- No if(Objects.isNull())

Solo la línea de retorno... Es hermoso de ver, es casi arte. Para cosas como estas me gusta programar.

![FCpH_GYVkAE9NaT](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/FCpH_GYVkAE9NaT.jpg)

## 4. Ejecutar la aplicación y ver los resultados

Realice un Maven clean and compile, y ejecute la clase de aplicación principal. Luego haga una solicitud GET a [localhost:8080/users](http://localhost:8080/users).

Deberías encontrar logs similares a estos:

- -> LogFilter
- -> LoggingAspect\[UserController.getUsers()\]
- -> LoggingAspect\[UserApi.getUsers()\]
- <- LoggingAspect\[UserApi.getUsers()\]
- <- LoggingAspect\[UserController.getUsers()\]
- <- LogFilter

Repita la solicitud. La memoria caché entrará en acción y debería encontrar:

- Un tiempo de respuesta mucho más rápido: pasó de 1014 ms a 13 ms, un aumento de velocidad del 98,7%.
  ![Screenshot2024-10-15181728](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15181728.png)
- La ausencia de UserApi.getUsers() en los logs: Deberías encontrar registros similares a estos:
  - -> LogFilter
  - -> LoggingAspect\[UserController.getUsers()\]
  - <- LoggingAspect\[UserController.getUsers()\]
  - <- LogFilter

## Siguiente lectura

[Pollito&rsquo;s Opinion on Spring Boot Development 7: Unit tests](/es/blog/2024-10-15-pollitos-opinion-on-spring-boot-development-7)
