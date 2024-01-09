---
author: "Franco Becvort"
title: "Contract-Driven Development 5: Controller validations aren't working... Why?"
date: 2024-01-09
description: "Workaround obsolete javax validations in Spring Boot 3"
categories: ["Programming Stuff"]
thumbnail: /uploads/2024-01-09-contract-driven-dev5/DALL·E2024-01-0822.22.45.png
---

_Workaround obsolete javax validations in Spring Boot 3._

## Check the github repo

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-5](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-5)

## Changes to the openAPI Specification.yaml

- Improved getArticlesByCountry:
  - Parameter limit now has minimum and maximum.
  - Parameter offset now has minimum and maximum.
- Improved getComments
  - Parameter limit now has minimum and maximum.
  - Parameter offset now has minimum.
  - Created parameter sortOrder.
  - On 500 returns Error.
- Improved postComment
  - Renamed schema CommentPostBody to CommentPostRequest.
  - On 201 returns CommentPostResponse.
  - On 500 returns Error.
- Replaced everything related to date-time to just string, with an example of a date time in ISO 8601 format.
  - Reason: on serialization for returning, instead of getting a String like "2024-01-04T15:30:00Z", an Object representing OffsetDateTime was returned.

```json
{
  "timestamp": {
    "offset": {
      "totalSeconds": 0,
      "id": "Z",
      "rules": {
        "fixedOffset": true,
        "transitions": [],
        "transitionRules": []
      }
    },
    "year": 2024,
    "monthValue": 1,
    "dayOfMonth": 3,
    "hour": 18,
    "minute": 31,
    "second": 48,
    "nano": 218000000,
    "dayOfWeek": "WEDNESDAY",
    "dayOfYear": 3,
    "month": "JANUARY"
  }
}
```

This can cause serialization issues in whoever consumes our service.

- Improved Error Schema: now is an object that consists in...
  - timestamp: The date and time when the error occurred in ISO 8601 format.
  - session: A unique UUID for the session instance where the error happened, useful for tracking and debugging purposes.
  - error: A brief error message or identifier.
  - message: A detailed error message.
  - method: The method that resulted in the error.

## Lets write some unit tests for our controllers

Here is an example of how to test ArticleController

```java
@ExtendWith(MockitoExtension.class)
class ArticleControllerTest {
  @InjectMocks private ArticleController articleController;
  @Mock private ArticleService articleService;

  @Test
  void whenGetArticlesByCountryThenReturnsArticles() {
    ResponseEntity<Articles> expectedResponse = ResponseEntity.ok(mockArticles());
    when(articleService.getArticlesByCountry(anyString(), anyInt(), anyInt()))
        .thenReturn(expectedResponse.getBody());

    ResponseEntity<Articles> actualResponse =
        articleController.getArticlesByCountry(MOCK_STRING, 0, 0);

    assertEquals(expectedResponse.getBody(), actualResponse.getBody());
  }
}
```

For this to work, is necesary to:

- Create ArticleService interface and a simple implementation.
- Inject it into ArticleController.

```java
public interface ArticleService {
  Articles getArticlesByCountry(String country, Integer limit, Integer offset);
}
```

```java
@Service
public class ArticleServiceImpl implements ArticleService {
  @Override
  public Articles getArticlesByCountry(String country, Integer limit, Integer offset) {
    return null;
  }
}
```

```java
@RestController
@RequiredArgsConstructor
public class ArticleController implements ArticleApi {

  private final ArticleService articleService;

  @Override
  public ResponseEntity<Articles> getArticlesByCountry(
      String country, Integer limit, Integer offset) {
    return ResponseEntity.ok(articleService.getArticlesByCountry(country, limit, offset));
  }
}
```

## Great, let's write a failing test... Why isn't failing?

Let's quickly change a line in ArticleControllerTest

```java
ResponseEntity<Articles> actualResponse =
        articleController.getArticlesByCountry(MOCK_STRING, 100, 0);
```

In our specification, we stated that limit has a maximum of 10, so for sure 100 should throw an exception right?... _Test passed._

Well for sure this is some Mockito stuff not mocking correctly. Let's just run the application and cURL it.

```bash
curl --location 'http://localhost:8080/article?limit=101'
```

Got 200 OK. So, who's to blame? Short answer, the plugin, cause it's outdated for current standards. Long answer and how to workaround it, keep reading.

## Little bit of background: javax, jakarta, and Spring Boot 3

I asked chatGPT:

> explain without much technical details whats the deal with the javax and jakarta packages, focusing on what the libraries do and why moving from javax to jakarta

And I got this:

### javax Packages

- Origin: The javax namespace has been a part of Java for many years. It originated as part of the Java 2 Platform, Enterprise Edition (J2EE), which was later renamed Java EE (Enterprise Edition).
- Purpose: These packages contain classes and interfaces for Java's enterprise features like web services, servlets, and JavaServer Pages (JSP). They are essential for building enterprise-level applications.
- Usage: They are widely used in many applications for features like database access, messaging, web applications, and security.

### Transition to Jakarta

- Ownership Change: The ownership of Java EE was transferred from Oracle to the Eclipse Foundation, a prominent open-source organization. This transfer necessitated a change in the namespace from javax to Jakarta.
- Why Jakarta?: The Eclipse Foundation could not use the javax namespace for legal and trademark reasons. Hence, they introduced the Jakarta namespace.
- Implications: This change means that future development and updates for enterprise Java will happen under the Jakarta namespace.

### Jakarta Packages

- Continuation: Jakarta EE is essentially a continuation of Java EE under a new namespace. It represents the future of enterprise Java.
- Compatibility and Changes: While there are compatibility concerns between javax and Jakarta, the fundamental functionalities remain similar. The change is primarily in the package names and namespaces.
- Community-driven: Being under the Eclipse Foundation, Jakarta EE is now more community-driven, potentially accelerating innovation and updates in enterprise Java.

### Spring Boot 3 drops javax in favor of jakarta

This change was driven by the move of Java EE to Jakarta EE under the Eclipse Foundation, which led to the renaming of packages from javax to jakarta.

For Spring Boot 3, here are the key points regarding compatibility with javax packages:

- Transition to Jakarta EE 9+: Spring Framework 6 and Spring Boot 3 are designed to work with Jakarta EE 9 and later versions. This means they are expected to use jakarta namespaces instead of javax.

- No Direct Support for javax Packages: Given the shift to Jakarta EE, Spring Boot 3 is likely to not directly support the older javax packages. Applications that rely on javax namespaces might need to be migrated to the jakarta namespaces to ensure compatibility with Spring Boot 3.

- Backward Compatibility: While Spring Boot 3 is forward-looking with its support for Jakarta EE, it might pose challenges for backward compatibility with applications built on older versions of Spring Boot that use javax packages.

## What does that has to do with the controller validations don't working then?

Well, sadly the plugin is only able to generate code in the pre Spring Boot 3 way, using javax. We can check that going into the interface our controller extends and reading into the imports. We will find:

```java
import javax.validation.Valid;
import javax.validation.constraints.*;
```

So what is happening is that our Spring Boot 3 application is simply ignoring the javax validation, resulting in our current behaviour.

So what are our options?

- Downgrade to Spring Boot 2.7: It goes against our objective of staying compatible with recents releases of Spring Boot and Java.
- Look for a better plugin: Yep, we are gonna go through that, in the next blog. Right now I want to have a branch with this current plugin working, even if it is with an ugly hack fix.
- Copy-paste the generated code into our source code, replacing every javax for jakarta: This ain't that bad, but now the generated code isn't really generated, it is yours. Even if it is copy pasted, now the responsability of testing and making sure the code works as intended is now yours. And in Contract-Driven Development, if we can evade that responsability, the better.
- Validate inputs the old way, with ifs elses: This may seems viable now, and is not that bad. But if our reallity is complicated and it results in a complex openAPI Specification, then the ifs-elses layer also grows in complexity. This solution is not that scalable.
- Make the injected service compatible with jakarta validation, and replicate the not working controller validation there: We are going with this one.

## Pros and cons of the chosen hack fix

### Pro: Now that we are writing our own validations, we can even improve on things that the OAS falls short

While the OAS provides a robust framework for standard API validations, it can sometimes fall short in handling complex or unique validation scenarios that are specific to certain business logic or data formats. By writing our own validations, we can introduce a level of specificity and flexibility that the OAS might not inherently support.

This approach allows for a more granular control over the data integrity and the behavior of the API, ensuring that it aligns more precisely with the application's requirements and user expectations. Furthermore, custom validations can also serve as a means to introduce additional security checks or to enforce certain best practices that are beyond the scope of the OAS, thereby enhancing the overall robustness and reliability of the API.

### Pro: Is the least disruptive for the current situtation

The choice of implementing custom validations often emerges as a highly efficient and minimally disruptive solution, especially when compared to more drastic measures such as altering existing libraries.

### Con: We are doing manual work that is prone to fall in obsolence

Imagine that the requirements changes, and your architect or you create yourServiceOAS_V2.yaml. Now is not only drop, build and test. Now you have to manually implement changes.

Doing things manually implies that there's a chance of missing something. We developers can and will make mistakes. If something can be automatized to prevent avoidable human mistakes, it is good to put some thinnk effort into it.

### Con: The further away the error occurs, the more difficult it is to map its HTTP response status state

Giving the service the responsability of validate request inputs does not follow the "Early input validation principle". If an error is in the request, should be thrown as soon as possible. In this case, that should be in the controller.

Also this rises a new problem: now that the error is in the service, what status do I map it to? One would think _"easy 400-ish"_. But how can you be so certain?

- A ConstraintViolationException in a controller usually implies something wrong in the request.
- A ConstraintViolationException in a service, would be different reasons: maybe I'm using a third party library that doesn't allow negative numbers... that's a constraint violation that should map to a 500 status.

I think this is the biggest con of all. I'll let it slide at the moment, but the ideal solution is to not have a problem to begin with, so we are gonna be looking for a better plugin in the future.

## Implementing the solution

### Add jakarta in pom.xml

```xml
<!--
  It integrates the Hibernate Validator and the Validation API, providing a seamless experience for adding validation capabilities to Spring Boot applications.
  The specified version ensures compatibility with other Spring Boot 3.x components
-->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
  <version>3.1.2</version>
  <scope>compile</scope>
</dependency>
```

### Add jakarta annotations to the service interface

```java
import dev.pollito.springcityexplorer.annotation.ValidArticleCountry;
import dev.pollito.springcityexplorer.models.Articles;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;

@Validated
public interface ArticleService {
  Articles getArticlesByCountry(
      @ValidArticleCountry String country,
      @Min(1) @Max(10) Integer limit,
      @Min(0) @Max(10000) Integer offset);
}

```

Notice that:

- The imports are from jakarta.
- We can create our custom annotations! There are plenty of tutorials of how that work.

### Run and see it working

Request

```bash
curl --location 'http://localhost:8080/article?country=asd'
```

Response: at the moment is mapping to 500, as any ConstraintViolationException in a service would. Won't worry much about this right now.

```json
{
  "timestamp": "2024-01-09T12:34:31.755+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "trace": "all the trace exception long long text",
  "message": "getArticlesByCountry.country: Invalid country code",
  "path": "/article"
}
```

Dance and repeat for the rest of the endpoints. In POST /comment, it has a class as request body. You will need to replicate that class in your src code with jakarta annotations.

## Other minor changes in pom xml

- Added [mapstruct](https://mapstruct.org/).
- Added [formatting java code maven plugin by Spotify](https://github.com/spotify/fmt-maven-plugin).

## Next steps

- Looking for an improved code generation library to solve the problems presented here.
