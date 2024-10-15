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

## Roadmap

1. What to test.
2. Mutation testing.
3. Create tests.
4. Generate a report.

## 1. What to test

When it comes to [unit testing](https://en.wikipedia.org/wiki/Unit_testing), I like the approach that Pichincha Bank has:

- Do unit test on:
  - The controller package,
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

![Screenshot2024-10-15161825](/uploads/2024-10-14-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15161825.png)

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

![Screenshot2024-10-15162331](/uploads/2024-10-14-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15162331.png)

It should output logs similars to these:

```log
[INFO] Scanning for projects...
[INFO]
[INFO] --------------------------< dev.pollito:post >--------------------------
[INFO] Building post 0.0.1-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- pitest:1.17.0:mutationCoverage (default-cli) @ post ---
[INFO] Root dir is : C:\code\pollito\post
[INFO] Found plugin : Default csv report plugin
[INFO] Found plugin : Default xml report plugin
[INFO] Found plugin : Default html report plugin
[INFO] Found plugin : Static initializer code detector plugin
[INFO] Found plugin : Excluded annotations plugin
[INFO] Found plugin : Try with resources filter
[INFO] Found plugin : Inlined finally block filter plugin
[INFO] Found plugin : Implicit null check filter
[INFO] Found plugin : Method reference null check filter
[INFO] Found plugin : For each loop filter
[INFO] Found plugin : Enum junk filter
[INFO] Found plugin : Record junk mutation filter
[INFO] Found plugin : String switch filter
[INFO] Found plugin : Assertions filter
[INFO] Found plugin : Enum switch filter
[INFO] Found plugin : Logging calls filter
[INFO] Found plugin : Infinite for loop filter
[INFO] Found plugin : Long running iterator loop filter
[INFO] Found plugin : For loop counter filter
[INFO] Found plugin : Kotlin junk mutations filter
[INFO] Found plugin : Groovy junk mutations filter
[INFO] Found plugin : Max mutations per class limit
[INFO] Found plugin : Equals shortcut equivalent mutant filter
[INFO] Found plugin : Trivial return vals equivalence filter
[INFO] Found plugin : Filters mutants with line number <= 1
[INFO] Found plugin : Division by one equivalent mutant filter
[INFO] Found plugin : Lombok junk mutations filter
[INFO] Found plugin : Filter mutations to defensive wrappers such as unmodifiableCollection on return or field write
[INFO] Found plugin : Mutant export plugin
[INFO] Found plugin : Auto add java.awt.headless=true to keep keyboard focus on Mac OS
[INFO] Found plugin : Auto set number of threads based on machine
[INFO] Found plugin : Automatically add -ea to launch args to enable assertions
[INFO] Found plugin : Default build verifier
[INFO] Found plugin : Detect missing JUnit5 plugin
[INFO] Found plugin : Detect missing TestNG plugin
[INFO] Found plugin : Detect missing kotlin plugin
[INFO] Found plugin : Detect missing spring plugin
[INFO] Found plugin : Default coverage exporter
[INFO] Found shared classpath plugin : Default mutation engine
[INFO] Found shared classpath plugin : JUnit 5 test framework support
[INFO] Found shared classpath plugin : JUnit plugin
[INFO] Found shared classpath plugin : Support for mocking frameworks using javassist
[INFO] Found shared classpath plugin : Reset environment for javassist
[INFO] Available mutators : EXPERIMENTAL_ARGUMENT_PROPAGATION,FALSE_RETURNS,TRUE_RETURNS,CONDITIONALS_BOUNDARY,CONSTRUCTOR_CALLS,EMPTY_RETURNS,INCREMENTS,INLINE_CONSTS,INVERT_NEGS,MATH,NEGATE_CONDITIONALS,NON_VOID_METHOD_CALLS,NULL_RETURNS,PRIMITIVE_RETURNS,REMOVE_CONDITIONALS_EQUAL_IF,REMOVE_CONDITIONALS_EQUAL_ELSE,REMOVE_CONDITIONALS_ORDER_IF,REMOVE_CONDITIONALS_ORDER_ELSE,VOID_METHOD_CALLS,EXPERIMENTAL_BIG_DECIMAL,EXPERIMENTAL_BIG_INTEGER,EXPERIMENTAL_MEMBER_VARIABLE,EXPERIMENTAL_NAKED_RECEIVER,REMOVE_INCREMENTS,EXPERIMENTAL_SWITCH
[INFO] Adding org.pitest:pitest-junit5-plugin to SUT classpath
[INFO] Adding org.pitest:pitest to SUT classpath
[INFO] Auto adding org.junit.platform:junit-platform-launcher:jar:1.10.3 < central (https://repo.maven.apache.org/maven2, default, releases) to classpath.
[INFO] Mutating from C:\code\pollito\post\target\classes
16:25:39 PIT >> INFO : Verbose logging is disabled. If you encounter a problem, please enable it before reporting an issue.
16:25:39 PIT >> INFO : Created 3 mutation test units in pre scan
16:25:39 PIT >> INFO : Sending 23 test classes to minion
16:25:39 PIT >> INFO : Sent tests to minion
16:25:46 PIT >> INFO : MINION : WARNING: A Java agent has been loaded dynamically (C:\Users\franb\.m2\repository\net\bytebuddy\byte-buddy-agent\1.14.19\byte-buddy-agent-1.14.19.jar)
16:25:46 PIT >> INFO : MINION : WARNING: If a serviceability tool is in use, please run with -XX:+EnableDynamicAgentLoading to hide this warning
16:25:46 PIT >> INFO : MINION : WARNING: If a serviceability tool is not in use, please run with -Djdk.instrument.traceUsage for more information
16:25:46 PIT >> INFO : MINION : WARNING: Dynamic loading of agents will be disallowed by default in a future release
16:25:46 PIT >> INFO : MINION : OpenJDK 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
\16:25:48 PIT >> INFO : Calculated coverage in 8 seconds.
16:25:48 PIT >> INFO : Created 3 mutation test units
\================================================================================
16:25:54 PIT >> INFO : Completed in 14 seconds
- Mutators
================================================================================
> org.pitest.mutationtest.engine.gregor.mutators.VoidMethodCallMutator
>> Generated 2 Killed 2 (100%)
> KILLED 2 SURVIVED 0 TIMED_OUT 0 NON_VIABLE 0
> MEMORY_ERROR 0 NOT_STARTED 0 STARTED 0 RUN_ERROR 0
> NO_COVERAGE 0
--------------------------------------------------------------------------------
> org.pitest.mutationtest.engine.gregor.mutators.returns.NullReturnValsMutator
>> Generated 4 Killed 4 (100%)
> KILLED 4 SURVIVED 0 TIMED_OUT 0 NON_VIABLE 0
> MEMORY_ERROR 0 NOT_STARTED 0 STARTED 0 RUN_ERROR 0
> NO_COVERAGE 0
--------------------------------------------------------------------------------
> org.pitest.mutationtest.engine.gregor.mutators.returns.EmptyObjectReturnValsMutator
>> Generated 1 Killed 1 (100%)
> KILLED 1 SURVIVED 0 TIMED_OUT 0 NON_VIABLE 0
> MEMORY_ERROR 0 NOT_STARTED 0 STARTED 0 RUN_ERROR 0
> NO_COVERAGE 0
--------------------------------------------------------------------------------
> org.pitest.mutationtest.engine.gregor.mutators.NegateConditionalsMutator
>> Generated 1 Killed 1 (100%)
> KILLED 1 SURVIVED 0 TIMED_OUT 0 NON_VIABLE 0
> MEMORY_ERROR 0 NOT_STARTED 0 STARTED 0 RUN_ERROR 0
> NO_COVERAGE 0
--------------------------------------------------------------------------------
================================================================================
- Timings
================================================================================
> pre-scan for mutations : < 1 second
> scan classpath : < 1 second
> coverage and dependency analysis : 8 seconds
> build mutation tests : < 1 second
> run mutation analysis : 5 seconds
--------------------------------------------------------------------------------
> Total  : 14 seconds
--------------------------------------------------------------------------------
================================================================================
- Statistics
================================================================================
>> Line Coverage (for mutated classes only): 15/15 (100%)
>> Generated 8 mutations Killed 8 (100%)
>> Mutations with no coverage 0. Test strength 100%
>> Ran 8 tests (1 tests per mutation)
Enhanced functionality available at https://www.arcmutate.com/

Build messages:-
* Project uses Spring, but the Arcmutate Spring plugin is not present. (https://docs.arcmutate.com/docs/spring.html)
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  47.925 s
[INFO] Finished at: 2024-10-15T16:25:54+01:00
[INFO] ------------------------------------------------------------------------

Process finished with exit code 0
```

You should find in target/pit-reports an index.html, that's the report.
![Screenshot2024-10-15173646](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/Screenshot2024-10-15173646.png)

Open it in your favourite browser and explore further each class if needed.

![screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48.png)

## Next lecture

Work in progress...
