---
author: "Franco Becvort"
title: "Contract-Driven Development 10: The art of caching responses"
date: 2024-01-25
description: "Using caffeine to prevent unnecessary api request"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-01-25-contract-driven-dev10/DALL·E2024-01-2522.08.50.png
---

_Using caffeine to prevent unnecesary api request._

## Check the github repo

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-10](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-10)

## What is caching? Why is useful in our scenario?

> I got lazy here and asked chatgpt. Here's its answer

Caching, in the context of software development, is a technique where you store copies of frequently accessed data in a temporary storage area, known as a cache. The main goal is to improve the performance and efficiency of your application. Here's how it works and why it's particularly useful in the scenario you've described:

1. **Speed:** Accessing data from the cache is usually much faster than retrieving it from the original source, like a database or an external API. When dealing with weather data, which doesn't change every second, caching the data for an hour means that subsequent requests within that hour can be served almost instantaneously.

2. **Reduced Load:** By caching the data, you reduce the number of requests to the external weather service. This not only helps in reducing the load on the external service but also minimizes network traffic and can save costs, especially if the external service charges per API call.

3. **Improved Reliability:** If the external weather service goes down temporarily, your application can still serve data from the cache, ensuring better reliability and user experience.

4. **Data Consistency:** Caching weather data for a set period, like an hour, provides a consistent view of the data to all users during that period. This can be particularly important in scenarios where a consistent view of data is more valuable than real-time accuracy.

However, it's important to remember that caching is a trade-off. While it improves speed and efficiency, it may provide slightly outdated data. In the case of weather information, this trade-off is usually acceptable since weather conditions don't change drastically in short periods. But for other types of data where real-time accuracy is critical, caching might not be the best approach.

## How to cache

### 1. Add dependencies

```xml
<!-- Caching Abstraction -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
    <version>3.1.2</version>
    <scope>compile</scope>
</dependency>
<!-- high performance, near optimal caching library -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>3.1.5</version>
    <scope>compile</scope>
</dependency>
```

### 2. Create a Constant

This value will be the key to access the cache. Is good to create a Constant so we ensure consistency and prevent accidental access to non-existing caches.

Notice how we also have the key to accesss the session id in the logs. We did that in the previous blog.

```java
public class Constants {
  private Constants() {}

  public static final String SLF4J_MDC_SESSION_ID_KEY = "sessionId";
  public static final String WEATHER_CACHE = "weather";
}
```

### 3. Define how long will the cache last

In our case, I think that the weather don't change much in an hour. So I will save the cache for that time.

Is good practice to add it as a property in application.yml. That way:

- Different environments could have different caches lifespan. This can get usefull for testing purposes when we don't want to wait for an hour or more to check some behaviour.
- If we need to alter the lifespan, is easier to edit application.yml and don't require extensive testing.

```yml
weather:
  baseUrl: http://api.weatherstack.com
  secrets:
    key: ${WEATHER_API_KEY}
  expiresAfter: 3600 #seconds
```

```java
@Configuration
@ConfigurationProperties(prefix = "weather")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WeatherProperties {
  String baseUrl;
  Map<String, String> secrets;
  Integer expiresAfter;
}
```

### 4. Create the cache configuration

```java
@Configuration
@EnableCaching
@RequiredArgsConstructor
public class CacheConfig {
  private final WeatherProperties weatherProperties;

  @Bean
  public CacheManager cacheManager() {
    CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager(WEATHER_CACHE);
    caffeineCacheManager.setCaffeine(
        Caffeine.newBuilder()
            .expireAfterWrite(weatherProperties.getExpiresAfter(), TimeUnit.SECONDS));

    return caffeineCacheManager;
  }
}
```

### 5. Annotate the function you want to be cached

```java
@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements WeatherService {

  private final WeatherApi weatherApi;
  private final WeatherProperties weatherProperties;
  private final WeatherMapper weatherMapper;

  @Override
  @Cacheable(value = WEATHER_CACHE)
  public Weather getWeatherByCity(String city) {
    return weatherMapper.map(
        weatherApi.currentGet(
            new WeatherApi.CurrentGetQueryParams()
                .accessKey(weatherProperties.getSecrets().get("key"))
                .query(city)));
  }
}

```

## That's it

Adding a cache is very straightfoward and brings lots of value to your application. Also, you'll look like a very smart developer that knows what is doing. Just be careful to not shoot yourself in the foot with [common mistakes](https://medium.com/upday-devs/3-common-mistakes-when-implementing-spring-cache-abstraction-a7ac2ee247ba).

Now let's test it!

```bash
curl --location 'http://localhost:8080/weather?city=lisbon'
```

Request time on first call: 792ms
![first request](/uploads/2024-01-25-contract-driven-dev10/Screenshot2024-01-25231802.png)

Request time on following calls: 7ms
![following request](/uploads/2024-01-25-contract-driven-dev10/Screenshot2024-01-25231953.png)

We just saved:

- 99.12% on request time
- Unnecessary requests to the weatherstack.api

## Some notes

### This works on requesting with other values

- When requesting for weather in London, first time is gonna be arround 800ms, and the following requests are gonna be around 7ms.
- Requesting for other cities does not affect the response cached for the previous cities: Each cache has its own time to expire independent from each other.

### If an exception is thrown, the cache doesn't save anything

In our scenario, when we request for a non-existing city, an exception is thrown at the decoder level.

> Again, got lazy and asked chatGPT to explain the inner details of why caching here doesn't work. Enjoy.

Let's break down this scenario into simpler terms:

1. **Service Method Throws an Error:** When your service method encounters an issue (like a failed database operation or an invalid input), it throws an exception. This is akin to a chef in a restaurant finding out that an ingredient is spoiled while cooking a dish.

2. **Controller Advice Catches the Error:** The controller advice in Spring acts like an error handler. It's like the restaurant manager who steps in when something goes wrong in the kitchen. The controller advice intercepts exceptions from across the application, including those from service methods.

3. **Why No Cache is Saved:** The caching mechanism typically works by storing the result of a successful method execution. When an exception is thrown, the method doesn't complete successfully, so there's no "successful result" to store in the cache. It's like the chef not serving a spoiled dish to a customer. The cache only keeps track of dishes (i.e., method results) that are properly cooked and ready to be served.

4. **The Role of Controller Advice:** The controller advice's job is to manage the error, not to cache it. It decides what the response should be when an error occurs (like an apology from the manager and an offer for a free meal next time). It doesn't concern itself with storing the failed attempt in any way.

In summary, when an error occurs in the service layer and is caught by controller advice, no cache is saved because the operation didn't complete successfully, and caching mechanisms are designed to store only successful outcomes. It's all about ensuring that only quality "dishes" make it to the cache "table"! 🍽️😊

> Pollito note: Back in university I would've loved chatGPT to explain me stuff. Processor architecture would've been so easy.

## Next steps

I think this is a good save point, so I'm gonna stop this blog series here for a bit.

I have other stuff in life to accomplish. Main three are:

- Obtaining the [Professional Cloud Architect](https://cloud.google.com/learn/certification/cloud-architect) certification by end of February.
- I got a guitar, all the needed stuff to plug it into the pc, [Musescore](https://musescore.org/), and even a total 100% licensed [Amplitube 5](https://www.ikmultimedia.com/products/amplitube5/). In the past, I used to think of myself as a musician. Now I'm looking to reconnect with my musician inner-self.
  ![guitar](/uploads/2024-01-25-contract-driven-dev10/IMG_20240126_103515.jpg)
- I wanna get a dark mode Lisbon metro map. Yep, totally random and not related, but I'm a map nerd. [The official metro map](https://www.metrolisboa.pt/wp-content/uploads/2022/04/Metropolitano-de-Lisboa_Mapa-da-Cidade_abr.2022.png) is on white background, which fair enough is ok. But I want it dark to print it and put it in the wall.

I hope to come back into this project. For when I come back I will probably just leave this backend as a microservice that just gets the weather, and start a frontend.

I also have this dream of creating the "Pollito contract-driven development Spring Boot 3 initializer". A simple web page where, given yaml files that defines your contracts, it generates a very opinionated project with what I consider good practices. Practically a knock-off of [spring intilalizr](https://start.spring.io/), but Contract-driven development oriented.

See you on a month or two. With love, Pollito 🐤
