---
author: "Franco Becvort"
title: "Spring Cloud: api-gateway and naming-server concepts"
date: 2024-04-09
description: "Spring Cloud Starter Gateway + Netflix Eureka combo"
categories: ["Spring Cloud"]
thumbnail: /uploads/2024-04-09-spring-cloud/DALL·E2024-04-0911.15.07.jpg
---

\[EDIT\]: Removed ranting about personal life that didn't add value to the blog.

DISCLAIMER: this is not a copy-paste of [Master Microservices with Spring Boot and Spring Cloud](https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/) Udemy course. I highly recommend buying that course. All the code shown below was written by me. Enjoy.

## Check the code!

You can check the code in the following repos (in all of them, stick to the branch feature/docker-compose. You may find other branches, that's me experimenting other solutions).

- [microservice-a](https://github.com/franBec/spring-cloud-v2-microservice-a/tree/feature/docker-compose)
- [microservice-b](https://github.com/franBec/spring-cloud-v2-microservice-b/tree/feature/docker-compose)
- [api-gateway](https://github.com/franBec/spring-cloud-v2-api-gateway/tree/feature/docker-compose)
- [naming-server](https://github.com/franBec/spring-cloud-v2-naming-server/tree/feature/docker-compose)
- [docker-compose](https://github.com/franBec/spring-cloud-v2-docker-compose)

## What's an api-gateway?

Let's analyze this diagram:

![diagram](/uploads/2024-04-09-spring-cloud/Untitled-2024-02-21-1828.png)

We have:

- **An end user:** someone who needs something from microservice-a.
- **microservice-a:** it returns "Hello world from microservice A" + whatever microservice-b has to say. So it depends of microservice-b.
- **microservice-b:** it returns "Hello world from microservice B".

So far so good. So... **what's that thing "api-gateway"?**

An API Gateway is the front door to your application, ensuring that every request is directed to the correct destination. This gateway serves several critical functions and can be leveraged in various use cases:

- **Routing:** The gateway directs incoming API requests to the appropriate microservice, enabling a client-side application to make requests using a single endpoint rather than having to manage URLs for each service.
- **Load Balancing:** It distributes incoming requests evenly across instances of a microservice, enhancing the system's scalability and reliability.
- **Authentication and Authorization:** The gateway can authenticate incoming requests, ensuring they are from a valid source and optionally enforce access controls, deciding which services a valid request may or may not access.
- **Rate Limiting:** To prevent any single service from being overwhelmed, the gateway can throttle the number of requests to a service over a period.
- **Cross-Cutting Concerns:** It can handle other concerns such as logging, monitoring, and security across all services without requiring duplication of effort in each microservice.
- **Aggregation:** The gateway can aggregate results from multiple microservices and return a consolidated response to the client, reducing the number of round trips between the client and server.

Use Cases:

- **E-Commerce Applications:** In an e-commerce system, the gateway can route product search requests to the product service, cart management to the cart service, and order processing to the order service, providing a seamless shopping experience.
- **IoT Applications:** For Internet of Things (IoT) platforms, the gateway can manage requests from millions of devices, routing them to the appropriate services for data processing, device management, and analytics.
- **Mobile Applications:** Mobile backends can leverage API Gateways to simplify client-side communication, handle different back-end versions, and aggregate data from multiple sources.

By acting as the central point for managing and directing traffic, a gateway microservice enhances the maintainability, scalability, and security of cloud-based applications.

## Example

Let's analyze the diagram, again, with more focus on the step by step.

![diagram](/uploads/2024-04-09-spring-cloud/Untitled-2024-02-21-1828.png)

1. Someone calls api-gateway/microservice-a. api-gateway receives this request and does whatever it is coded to do with said request (could maybe add a header, check auth, encode/decode info, or just be transparent and do nothing).
2. api-gateway knows where microservice-a is, and passes the request.
3. microservice-a receives the request. It needs something from microservice-b, so makes a new request that goes through the gateway.
4. Again, api-gateway does whatever it is coded to do with this new request to microservice-b. It knows where microservice-b is, and passes the request.
5. microservice-b receives a request, process it, and returns.
6. api-gateway returns.
7. microservice-a does what needed to do with microservice-b's response, and retuns.
8. Final response.

Could you've saved a few request/response by going straight from microservice-a to microservice-b? yep totally. Just for example purposes, I decided to do it this way. Maybe your reality needs to save those extra request, or maybe in needs to always go through the gateway. Each reality is different.

## A look into api-gateway code

When you get into the api-gateway code, you notice something... It is very empty.

![api-gateway code](/uploads/2024-04-09-spring-cloud/Screenshot2024-04-09120810.png)

- The LoggingFilter is just a filter that logs whatever comes through. In this example, I don't alter anything of the incoming request nor do any checking based on where is coming from or where is going. Here is where you can get creative.
- The main application file, is just an empty default Spring Boot main.

How does the api-gateway know where to send the requests? The answer is in the pom.xml.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

The **spring-cloud-starter-gateway** dependency gives to the microservice all the discused gateway characteristics.

Here the star of the show is **spring-cloud-starter-netflix-eureka-client**. It registers your API Gateway as a client with the Eureka Server (a service registry). This enables the gateway to discover and keep track of the instances of microservices available in your ecosystem.

When a request arrives at the API Gateway, the following steps occur:

1. The gateway identifies the route and the microservice to which the request should be forwarded based on the configured routing rules.
2. The gateway consults the Eureka Server to obtain the current instances of the target microservice, including their network locations.
3. The Eureka Server responds with the information about the available instances. It might return multiple instances if the target microservice is scaled horizontally for high availability.
4. The gateway applies any configured load balancing strategy to select an instance if multiple are available.
5. The request is forwarded to the chosen microservice instance for handling.

This combination of Spring Cloud Gateway and Eureka Client enables dynamic routing based on service discovery, making the system more resilient and scalable.

The API Gateway doesn't need to be statically configured with the locations of microservices. Instead, it dynamically resolves them, accommodating real-time changes in the microservices landscape, such as scaling events or services going down for maintenance.

## naming-server

Eureka Client register microservices into a service registry. Now we need that, a service registry. I call it **naming-server**.

When you look into its code, you notice something... It is literally empty! Just the main Spring Boot class with an annotation.

```java
@SpringBootApplication
@EnableEurekaServer
public class NamingServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(NamingServerApplication.class, args);
    }

}
```

Again, all the magic is done by a dependency in the pom.xml file.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

## Some considerations

### Registering in naming-server

Every microservice that wants to be registered in the naming-server to be found by other microservices, needs:

- actuator + eureka client dependencies:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
    <version>3.2.4</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <version>4.1.1</version>
</dependency>
```

- This piece of code in their application.yml:

```yml
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka #or wherever eureka server is
  instance:
    prefer-ip-address: true
```

### What are those micrometer and zipkin dependencies?

The [Master Microservices with Spring Boot and Spring Cloud](https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/) Udemy course also comes with some content about logging and tracing, so I decided to implement them here as well.

Without getting to technical about it, those dependencies helps with:

- Giving unique IDs to the logs.
- Passing down IDs through microservices, so then we can make a trace of where did the initial request go.
- Show in a dashboard the traces and metrics.

The only thing that had to change in the proper business code to make these dependencies work were:

- Adding some capabilities when building the Feign client. Here's an example of it taken from microservice-a:

```java
@Configuration
@ComponentScans(
    value = {
      @ComponentScan(
          basePackages = {
            "dev.pollito.microserviceb.api",
          })
    })
@RequiredArgsConstructor
public class MicroserviceBApiConfig {
  private final MicroserviceBProperties microserviceBProperties;
  private final MeterRegistry meterRegistry;
  private final ObservationRegistry observationRegistry;

  @Bean
  public HelloWorldApi microServiceBApi() {
    return Feign.builder()
        .client(new OkHttpClient())
        .encoder(new GsonEncoder())
        .decoder(new GsonDecoder())
        .errorDecoder(new MicroserviceBErrorDecoder())
        .logger(new Slf4jLogger(HelloWorldApi.class))
        .logLevel(Logger.Level.FULL)
        .addCapability(new MicrometerObservationCapability(observationRegistry))    // <-- THIS IS NEW
        .addCapability(new MicrometerCapability(meterRegistry))                     // <-- THIS IS NEW
        .target(HelloWorldApi.class, microserviceBProperties.getBaseUrl());
  }
}
```

- Adding some configs in the application.yml:

```yml
logging:
  pattern:
    level: "%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"
management:
  tracing:
    sampling:
      probability: 1.0
```

## Let's get this thing working

Use the [docker-compose](https://github.com/franBec/spring-cloud-v2-docker-compose) file to get everything started. I won't go into details on how docker compose works. This is a Spring Cloud blog, not a docker one.

I personally like to use docker desktop for these things, but you can go full CMD.

![docker desktop](/uploads/2024-04-09-spring-cloud/Screenshot2024-04-09134851.png)

If you check [localhost:8761](http://localhost:8761/), you'll find the Eureka Server with all the services that got registered.

![Eureka Server](/uploads/2024-04-09-spring-cloud/screencapture-localhost-8761-2024-04-09-13_50_52.png)

Executing this curl will make the whole process of going through the api-gateway, microservice-a, microservice-b and back.

```bash
curl --location 'http://172.22.224.1:8765/microservice-a'
```

![postman](/uploads/2024-04-09-spring-cloud/Screenshot2024-04-09135520.png)

We can see the whole request travel through the microservices thanks to zipkin. Go to [http://localhost:9411/zipkin/](http://localhost:9411/zipkin/).

![zipking](/uploads/2024-04-09-spring-cloud/screencapture-localhost-9411-zipkin-2024-04-09-13_57_47.png)

Click on "RUN QUERY" and you'll find your request.

![run query](/uploads/2024-04-09-spring-cloud/screencapture-localhost-9411-zipkin-2024-04-09-13_58_37.png)

Click on "SHOW" to see more details.

![show](/uploads/2024-04-09-spring-cloud/screencapture-localhost-9411-zipkin-traces-cdf928c51f86a7b8ebd4119cb04e32be-2024-04-09-13_59_42.png)

## Next steps

Deploying this same idea in Google Cloud GKE.
