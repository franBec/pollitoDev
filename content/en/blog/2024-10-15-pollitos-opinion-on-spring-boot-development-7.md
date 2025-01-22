---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 7: Unit tests"
date: 2024-10-15
description: "What to test? Mutation testing and reports"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/DALL·E2025-01-22211926.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [1. What to test?](#1-what-to-test)
  * [2. Mutation testing](#2-mutation-testing)
  * [3. Generate a report](#3-generate-a-report)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the seventh part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we are creating a Java Spring Boot Microservice that handles information about users.
  - You can find the code of the final result at [this GitHub repo - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
  - Here's a diagram of its components. For a deep explanation visit [Understanding the project](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-understanding-the-project)
    ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

We already created every component. In this blog we are going to focus on Unit tests. Let's start!

## 1. What to test?

When it comes to [unit testing](https://en.wikipedia.org/wiki/Unit_testing), my recommendation is:

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

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

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

## 3. Generate a report

After creating and making sure your unit tests work, run `pitest:mutationCoverage`
![Screenshot2024-10-15162331](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15162331.png)

You should find in target/pit-reports an index.html, that's the report.
![Screenshot2024-10-15173646](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/Screenshot2024-10-15173646.png)

Open it in your favourite browser and explore further each class if needed.
![screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48.png)

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 8: JpaRepository and H2](/en/blog/2024-11-22-pollitos-opinion-on-spring-boot-development-8)

