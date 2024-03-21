---
author: "Franco Becvort"
title: "Contract-Driven Development 8: Improving deserialization and error handling"
date: 2024-01-23
description: "Improvements time"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-01-23-contract-driven-dev8/DALL·E2024-01-2320.40.34.png
---

_Improvements time._

## Check the github repo

This is a continuation of [Contract-Driven Development 7: We get weather forecast!](/en/blog/2024-01-18-contract-driven-dev-7).

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-8](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-8)

## Replacing serializer in favor of an extension

In the last blog I said:

> OpenAPI has a [supported vendor extensions section](https://openapi-generator.tech/docs/generators/java/#supported-vendor-extensions). We can check that sometime in the future.

Well that day is today.

### 1. Delete WeatherDeserializer

With this new feature, is not longer gonna be needed.

### 2. Replace the use of WeatherDeserializer in WeatherResponseDecoder

Now that there's no deserializer, in the decoder we don't have anything to register. Instead, we have to set a field naming policy of lower case with underscores

```java
return new GsonBuilder()
    .setFieldNamingPolicy(LOWER_CASE_WITH_UNDERSCORES)
    .create()
    .fromJson(responseBody, type);
```

### 3. Add the extension in the OAS yaml file

In the field localtime, which was the one that gave us problem last time cause is a reserved word, we add the extension needed. This will add the annotation on compile time.

```xml
localtime:
    type: string
    description: Returns the local time of the location used for this request.
    example: 2019-09-07 08:14
    x-field-extra-annotation: "@com.google.gson.annotations.SerializedName(\"localtime\")"
```

We can check it in the generated file Location.java

```java
public static final String JSON_PROPERTY_LOCALTIME = "localtime";
@com.google.gson.annotations.SerializedName("localtime")
private String _localtime;
```

and now when running the application, everything work! That's nice.

## Error handling with Controller Advice

Right now, when an error occurs, we let java decide what to return. I find that is not a good practice, and instead we should go for a Controller Advice.

If you don't know this [AOP paradigm](https://www.baeldung.com/spring-aop) implementation, I strongly suggest read the blog [@RestControllerAdvice example in Spring Boot](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) by bezkoder.

Here are some of the reasons in favor of usage of Controller Advice:

### User friendly error responses

In a well-designed API, it's crucial to consider the experience of the endpoint consumer. When an error occurs, sending back a complete stack trace is not just overwhelming but also unhelpful for the consumer trying to understand what went wrong.

An error controller advice in Spring allows us to craft clear, concise, and user-friendly error messages. This approach respects the principle of failing fast and failing clearly, guiding the consumer towards potentially rectifying the issue without exposing them to the unnecessary complexity of a full stack trace.

### Security concerns with exposing stack traces

Stack traces can reveal internal workings of the application, including package structures, class names, and sometimes even file paths and configuration details.

This information can be a gold mine for malicious users looking to exploit vulnerabilities. With error controller advice, we can control the output, ensuring that sensitive information stays within the confines of the server, thus adhering to best practices in security.

### Accurate error classification and handling

Spring's default error handling might sometimes misclassify user errors (like 400 Bad Requests) as server errors (500 Internal Server Error).

This is not just misleading but can also trigger incorrect diagnostic procedures. By implementing error controller advice, we gain finer control over error classification.

This accurate error categorization is not only helpful for API consumers but also for maintaining and monitoring the health of the application.

### Streamline error handling with Exceptions:

In traditional layered architectures, anaging error flows can become cumbersome if you're passing error information through various layers (like from service to controller) using custom objects or DTOs.

This approach often leads to bloated code and complicates the logic, as each layer needs to handle and possibly transform or augment the error information.

Now, contrast this with the elegance of using exceptions combined with controller advice:

- **Simplicity:** When an error occurs in the business logic, throwing a custom exception is straightforward and clear. This exception, carrying relevant error details, bubbles up the call stack naturally. There's no need for convoluted if-else blocks or checking return objects at each layer for potential errors.

- **Centralized error handling:** With controller advice, you centralize your error handling logic. This means you write the logic for transforming exceptions into HTTP responses once, and it applies across all your controllers. It's a one-stop shop for error handling, making your code cleaner and more maintainable.

- **Separation of concerns:** Your business logic focuses purely on business rules and operations, not on how errors should be communicated to the client. The controller advice takes the responsibility of translating business logic exceptions into user-friendly error messages and appropriate HTTP response statuses.

- **Ease of maintenance:** When changes are needed, such as modifying error response formats or adding new types of exceptions, you only need to update your controller advice. The business logic remains untouched, which is a significant advantage for maintenance and readability.

- **Consistency:** Regardless of which part of the business logic throws an exception, the controller advice ensures a consistent structure and information level in the response.

## Architecting Rest Controller Advice

The following architecture is very opinionated by me. It consists in two parts:

- **Global Controller Advice for common concerns**

  - **Uniform Handling of General Exceptions:** A global Controller Advice can handle exceptions that are common across the application.

  - **Application-Wide Consistency:** It ensures a consistent approach to handling certain types of errors or processing across all controllers, which is important for maintaining a uniform user experience.

  - **Efficiency:** By handling these concerns globally, you avoid duplicating code in multiple controllers, leading to cleaner, more maintainable, and less error-prone code.

- **Specific Controller Advice for Targeted Concerns (1 Controller Advice per Controller)**

  - **Controller-Specific Customization:** Each controller might have unique requirements or handle specific kinds of requests that necessitate specialized exception handling or data preprocessing. Having a Controller Advice dedicated to a specific controller allows for this fine-grained customization.

  - **Enhanced Clarity and Organization:** It's easier to track and maintain the code when you know that the exception handling or other cross-cutting concerns for a specific controller are handled in its dedicated Controller Advice.

  - **Scalability and Flexibility:** As your application grows, you may introduce new controllers with unique requirements. Having a pattern where each controller can have its own advice makes scaling and modifying parts of your application easier without impacting the global error handling strategy.

## Weird exception handling when it comes to weatherstack API

I like that weatherstack API has became an example of everything that can be out of the common when developing a solution.

What's wrong now with weatherstack? Well look at this request/response: I query for a non existing city. You would expect a 400 or 404, but look at this:
![weatherstack wrong response](/uploads/2024-01-23-contract-driven-dev8/Screenshot2024-01-24004908.png)

200... oh that's bad.

In their [docs](https://weatherstack.com/documentation) they mention API Error Codes, but never a thing that the status of the response will be 200.

We are not able to use an error decoder in WeatherApiConfig, cause Feign see 200 and thinks everything is OK. Instead we have to throw a custom exception in WeatherResponseDecoder.

But throwing expection here raises another problem: the custom exception thrown is encapsuled inside of DecodeException, and our Weather Rest Controller Advice says _"oh, I don't know this guy, I only know WeatherException."_

How to solve it? Add in the handler of Exception.class a condition checking if maybe the exception is a WeatherException wrapped in a DecodeException. If that condition is met, then delegate handling of the error to the correspondant Rest Controller Advice.

In words sounds too complicated, but in code looks something like this:

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Error> handle(Exception e) {
if (isWeatherException(e)) {
    return weatherControllerAdvice.handle((WeatherException) e.getCause());
}
return getGenericError(e);
}

private boolean isWeatherException(Exception e) {
return e instanceof DecodeException && e.getCause() instanceof WeatherException;
}
```

Don't forget that not every WeatherException is a Bad Request cause a city doesn't exists. That is only those error marked with status 615 (yes, very specific of our API provider).

So finally, add a verification for this code. If not, we return a generic error.

```java
public static final int BAD_REQUEST_ERROR_CODE = 615;

@ExceptionHandler(WeatherException.class)
public ResponseEntity<Error> handle(WeatherException e) {
if (isBadRequest(e)) {
    return getWeatherBadRequestError(e);
}
return getGenericError(e);
}

private boolean isBadRequest(WeatherException e) {
return Objects.nonNull(e.getWeatherStackError().getError())
    && Objects.nonNull(e.getWeatherStackError().getError().getCode())
    && e.getWeatherStackError().getError().getCode() == BAD_REQUEST_ERROR_CODE;
}
```

## Next steps

- Implement logging aspect and session UUID.
- Get news articles from mediastack.
