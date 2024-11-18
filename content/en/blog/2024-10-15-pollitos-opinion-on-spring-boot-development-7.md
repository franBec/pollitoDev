---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 7: Unit tests"
date: 2024-10-15
description: "Unit tests"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/GFvuurOXgAAiYC1.jpg
---

## Some context

This is the seventh part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

You can find the final result of the series at [https://github.com/franBec/post](https://github.com/franBec/post).

## Roadmap

1. What to test.
2. Mutation testing.
3. Create tests.
4. Generate a report.

## 1. What to test

When it comes to [unit testing](https://en.wikipedia.org/wiki/Unit_testing), this is my recommendation:

- Do unit test on:
  - The controller package.
  - The service package.
  - The util package, if exists, should be indirectly covered by the other unit tests.
  - Everything else can be ignored.
- On the code being tested, you must have:
  - Over 70% line coverage.
  - Over 60% mutation coverage.

## 2. Mutation testing

What does it mean "Over 60% mutation coverage"? What is mutation testing? [Pitest](https://pitest.org/) defines it as:

> Mutation testing is conceptually quite simple. Faults (or mutations) are automatically seeded into your code, then your tests are run. If your tests fail then the mutation is killed, if your tests pass then the mutation lived. The quality of your tests can be gauged from the percentage of mutations killed.

To get this metric, we use these plugins that we should already have from [part 2](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2)

- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

Here I leave some ready copy-paste for you. Consider double checking the latest version.

Under the \<plugins\> tag:

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

## 3. Create tests

All these files are under the test package.

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

## 4. Generate a report

Run pitest:mutationCoverage

![Screenshot2024-10-15162331](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15162331.png)

You should find in target/pit-reports an index.html, that's the report.
![Screenshot2024-10-15173646](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/Screenshot2024-10-15173646.png)

Open it in your favourite browser and explore further each class if needed.

![screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48.png)

## Next lecture

Work in progress...
