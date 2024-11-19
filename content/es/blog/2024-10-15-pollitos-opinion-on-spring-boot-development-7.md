---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 7: Unit tests"
date: 2024-10-15
description: "Unit tests"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/GFvuurOXgAAiYC1.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [1. A qué hacer test?](#1-a-qué-hacer-test)
  * [2. Mutation testing](#2-mutation-testing)
  * [3. Crear tests](#3-crear-tests)
  * [4. Generar un reporte](#4-generar-un-reporte)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la séptima parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

Puedes encontrar el resultado final de la serie en [https://github.com/franBec/post](https://github.com/franBec/post).

## 1. A qué hacer test?

En lo que respecta a [unit testing](https://en.wikipedia.org/wiki/Unit_testing), esta es mi recomendación:

- Realice unit testing en:
  - El controller package.
  - El service package.
  - El util package, si existe, debe estar cubierto indirectamente por las otras pruebas unitarias.
  - Todo lo demás se puede ignorar.
- El código que se está testeando, debe tener:
  - Más del 70 % de line coverage.
  - Más del 60 % de mutation coverage.

## 2. Mutation testing

¿Qué significa "Más del 60 % de mutation coverage"? ¿Qué es la prueba de mutación? [Pitest](https://pitest.org/) la define como:

> Las pruebas de mutación son conceptualmente bastante simples. Los errores (o mutaciones) se introducen automáticamente en el código y luego se ejecutan las pruebas. Si las pruebas fallan, la mutación se elimina; si las pruebas pasan, la mutación sigue viva. La calidad de las pruebas se puede medir a partir del porcentaje de mutaciones eliminadas.

Para obtener esta métrica, utilizamos estos plugins que ya deberíamos tener desde la [parte 2](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2)

- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dento del tag \<plugins\>:

```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.17.0</version>
  <executions>
      <execution>
          <id>pit-report</id>
          <phase>test</phase>
          <goals>
              <goal>mutationCoverage</goal>
          </goals>
      </execution>
  </executions>
  <dependencies>
      <dependency>
          <groupId>org.pitest</groupId>
          <artifactId>pitest-junit5-plugin</artifactId>
          <version>1.2.1</version>
      </dependency>
  </dependencies>
  <configuration>
      <targetClasses>
          <param>${project.groupId}.${project.artifactId}.controller.*</param>
          <param>${project.groupId}.${project.artifactId}.service.*</param>
          <param>${project.groupId}.${project.artifactId}.util.*</param>
      </targetClasses>
      <targetTests>
          <param>${project.groupId}.${project.artifactId}.*</param>
      </targetTests>
  </configuration>
</plugin>
```

## 3. Crear tests

Todos estos archivos están dentro del test package.

![Screenshot2024-10-15161825](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15161825.png)

_controller/advice/GlobalControllerAdviceTest.java_

```java
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.pollito.post.exception.JsonPlaceholderException;
import java.util.stream.Stream;
import org.jetbrains.annotations.Contract;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ExtendWith(MockitoExtension.class)
class GlobalControllerAdviceTest {
  @InjectMocks private GlobalControllerAdvice globalControllerAdvice;

  @Contract(pure = true)
  private static @NotNull Stream<HttpStatus> httpStatusProvider() {
    return Stream.of(HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private static void problemDetailAssertions(
      @NotNull ProblemDetail response, @NotNull HttpStatus httpStatus) {
    assertEquals(httpStatus.value(), response.getStatus());
    assertNotNull(response.getProperties());
    assertNotNull(response.getProperties().get("timestamp"));
    assertNotNull(response.getProperties().get("trace"));
  }

  @Test
  void whenNoResourceFoundExceptionThenReturnProblemDetail() {
    ProblemDetail response = globalControllerAdvice.handle(mock(NoResourceFoundException.class));
    problemDetailAssertions(response, HttpStatus.NOT_FOUND);
  }

  @ParameterizedTest
  @MethodSource("httpStatusProvider")
  void whenJsonPlaceholderExceptionThenReturnProblemDetail(@NotNull HttpStatus httpStatus) {
    JsonPlaceholderException e = mock(JsonPlaceholderException.class);
    when(e.getStatus()).thenReturn(httpStatus.value());

    ProblemDetail response = globalControllerAdvice.handle(e);
    problemDetailAssertions(response, httpStatus);
  }

  @Test
  void whenExceptionThenReturnProblemDetail() {
    ProblemDetail response = globalControllerAdvice.handle(mock(Exception.class));
    problemDetailAssertions(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

_controller/UserControllerTest.java_

```java
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import dev.pollito.post.model.User;
import dev.pollito.post.service.UserService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {
  @InjectMocks private UserController userController;
  @Mock private UserService userService;

  @Test
  void whenGetUsersThenReturn200() {
    when(userService.getUsers()).thenReturn(List.of(new User()));

    ResponseEntity<List<User>> response = userController.getUsers();
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertFalse(response.getBody().isEmpty());
  }
}
```

_service/UserServiceTest.java_

```java
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import com.typicode.jsonplaceholder.api.UserApi;
import com.typicode.jsonplaceholder.model.User;
import dev.pollito.post.mapper.UserMapper;
import dev.pollito.post.service.impl.UserServiceImpl;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  @InjectMocks private UserServiceImpl userService;
  @Mock private UserApi userApi;
  @Spy private UserMapper userMapper = Mappers.getMapper(UserMapper.class);

  @Test()
  void whenGetUsersThenReturnUserList() {
    when(userApi.getUsers()).thenReturn(List.of(new User()));

    assertFalse(userService.getUsers().isEmpty());
  }
}
```

## 4. Generar un reporte

Ejecute pitest:mutationCoverage

![Screenshot2024-10-15162331](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15162331.png)

Deberías encontrar en target/pit-reports un index.html, ese es el informe.
![Screenshot2024-10-15173646](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/Screenshot2024-10-15173646.png)

Ábrelo en tu navegador favorito y explora más a fondo cada clase si es necesario.
![screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48.png)

## Siguiente lectura

Trabajo en progreso...
