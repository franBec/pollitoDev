---
author: "Franco Becvort"
title: "Contract-Driven Development 9: The art of logging"
date: 2024-01-24
description: "Logging request, responses, and errors"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-01-24-contract-driven-dev9/DALL·E2024-01-2419.49.17.png
---

_Logging request, responses, and errors._

## Check the github repo

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-9](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-9)

## Creating a Logger Filter

If you are not familiar with Filters, check this [Baeldung article](https://www.baeldung.com/spring-boot-add-filter).

This filter will have the particularity of using [sl4j\'s Mapped Diagnostic Contex](https://www.baeldung.com/mdc-in-log4j-2-logback) for saving a unique session id, which can be used in the whole application, not only for logging purposes, but also for returning in the errors to our API consumers.

Finally we can make use of this class for adding some useful logs about incoming request and outgoing responses.

```java
@Slf4j
public class LogFilter implements Filter {

  @Override
  public void doFilter(
      ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
      throws IOException, ServletException {
    MDC.put(SLF4J_MDC_SESSION_ID_KEY, UUID.randomUUID().toString());
    try {
      logRequestDetails((HttpServletRequest) servletRequest);
      filterChain.doFilter(servletRequest, servletResponse);
      logResponseDetails((HttpServletResponse) servletResponse);
    } finally {
      MDC.clear();
    }
  }

  private void logRequestDetails(HttpServletRequest request) {
    log.info(
        ">>>> Method: {}; URI: {}; QueryString: {}",
        request.getMethod(),
        request.getRequestURI(),
        request.getQueryString());
  }

  private void logResponseDetails(HttpServletResponse response) {
    log.info("<<<< Response Status: {}", response.getStatus());
  }
}
```

For this to work, we have to register the filter. In this configuration you can customize if you want your filter to affect all routes, or specific routes.

```java
@Configuration
public class LogFilterConfig {

  @Bean
  public FilterRegistrationBean<LogFilter> loggingFilter() {
    FilterRegistrationBean<LogFilter> registrationBean = new FilterRegistrationBean<>();

    registrationBean.setFilter(new LogFilter());
    registrationBean.addUrlPatterns("/*");

    return registrationBean;
  }
}
```

## Printing the Session id in the logs

Now that we have a Session id in sl4j\'s MDC, we can use it anywhere... even in logs! This is extremely useful for tracing purposes when something goes wrong.

We need to create a logback.xml. Here's a very simple one. Feel free to customize it to your own taste.

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} [SessionID: %X{sessionId}] - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="info">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

## Returning the Session id in error objects

As said before, now that we have a Session id in sl4j\'s MDC, we can use it anywhere... even in utility classes!

Check this example of how to create an instance of error.

```java
private static ResponseEntity<Error> buildErrorResponse(
    HttpStatus status, Exception e, String errorMessage) {
return ResponseEntity.status(status)
    .body(
        new Error()
            .error(e.getClass().getSimpleName())
            .message(errorMessage)
            .path(getCurrentRequestPath())
            .timestamp(OffsetDateTime.now())
            .session(UUID.fromString(MDC.get(SLF4J_MDC_SESSION_ID_KEY))));
}
```

## Creating logging aspects

We log with a session id on application request, on applicaiton response, and use the session id to return to our API consumers in case of errors.

From personal experience, there are three more places where we need to add logs:

1. Before and after returning any public function in the controller package (this also involves advices, which are in the controller package).
2. Before and after returning any call to a third party API
3. When an unhandled exception is about to be returned
   - **Heavily opinionated opinion:** Here's the only place when one should log an ERROR level. All other logs should be INFO or WARN level

We could manually add logs. But instead I'll take the Aspect Oriented approach.

## Aspects

### Adding dependencies

We need to add these dependencies in the pom.xml

```xml
<!-- Provides support for Aspect-Oriented Programming (AOP) in Java. -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjrt</artifactId>
    <version>1.9.19</version>
    <scope>compile</scope>
</dependency>

<!-- Weaves aspects into Java bytecode, either at compile time or load time. Integral for applying AOP concepts like logging, transactions, etc. -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.19</version>
    <scope>compile</scope>
</dependency>
```

### Create a Logging Aspect

```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {

  @Pointcut("execution(* com.weatherstack.api.*.*(..))")
  public void weatherstackApiMethodsPointcut() {}

  @Pointcut("execution(public * dev.pollito.springcityexplorer.controller..*.*(..))")
  public void controllerPublicMethodsPointcut() {}

  @Before("weatherstackApiMethodsPointcut() || controllerPublicMethodsPointcut()")
  public void logBefore(JoinPoint joinPoint) {
    log.info(
        "["
            + joinPoint.getSignature().toShortString()
            + "] Args: "
            + Arrays.toString(joinPoint.getArgs()));
  }

  @AfterReturning(
      pointcut = "weatherstackApiMethodsPointcut() || controllerPublicMethodsPointcut()",
      returning = "result")
  public void logAfterReturning(JoinPoint joinPoint, Object result) {
    log.info("[" + joinPoint.getSignature().toShortString() + "] Response: " + result);
  }
}
```

In the future, when adding more third party apis, we need to create a pointcut and add it to the methods logBefore() y logAfterReturning().

This covers point 1 and 2 of where to add logs. Now let's go with point 3.

## Manual log

### When an unhandled exception is about to be returned

Falling into the general Exception handler could means two things:

- An error that should be handled is not being handled.
- An error that we didn't even know could happen, just happened.

In both those scenarios, is important to log at ERROR level.

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Error> handle(Exception e) {
if (isWeatherException(e)) {
    return weatherControllerAdvice.handle((WeatherException) e.getCause());
}
log.error(GENERIC_ERROR_LOG_MESSAGE, e);
return getGenericError(e);
}
```

### Whenever you see it makes sense

The fact that weatherstack api has various non-standars behaviours come handly again for educational purposes.

As you just read above, we have to do an ugly check on the Exception handler to check if the exception may be a WeatherException wrapped in a DecodeException. After that we handle the exception managing to the WeatherException handler. But not everything ends there.

In the WeatherException handler, exists the chance that the error is not caused by a user bad request. In that very tricky scenario, a log could come handly.

```java
public static final String WEATHER_EXCEPTION_LOG_ERROR_MESSAGE =
    "{} is not caused by Bad Request. Error code: {}. Check API Error Codes in the docs https://weatherstack.com/documentation";

@ExceptionHandler(WeatherException.class)
public ResponseEntity<Error> handle(WeatherException e) {
if (isBadRequest(e)) {
    return getWeatherBadRequestError(e);
}
log.error(
    WEATHER_EXCEPTION_LOG_ERROR_MESSAGE,
    e.getClass().getSimpleName(),
    Objects.requireNonNull(e.getWeatherStackError().getError()).getCode());
return getGenericError(e);
}
```

## Practice exercise: reading some logs

Let's do some petitions, feed the logs to chatgpt, and ask him what it interprets out of it. If our logs are descriptive enough, then the AI will be able to give a good explanation.

I'll be using [Java & Spring Mentor](https://gptstore.ai/gpts/rvT63m587b-java-spring-mentor) chatGPT Plugin. You gotta love how this plugin has beef with javascript and python.

### Possible security concern

Logs can and will reveal secret info.

Some companies would say that we have to prevent this at all cost, in case logs are filtered. I see their security concerns and kinda agree. But there have been multiple ocassions when having some token or credentials printed in the logs helped me out to recreate and fix errors very quick and efficiently.

In the case of this repo specificaly, the access key of weatherstack api is compromised. To me, I don't care. But you may care and that's ok. Improve this repo as you need.

In the following logs, I will manually edit the access key out, cause I don't want to expose it here.

### Scenario 0: Starting the application

The following log is always printed at the beggining of the Spring Boot application. It is possible to configure it so it doesn't show. Let's see what chatgpt has to say about it.

**Here's the log:**

```log
C:\Users\franb\.jdks\corretto-17.0.6\bin\java.exe -XX:TieredStopAtLevel=1 -noverify -Dspring.output.ansi.enabled=always -Dcom.sun.management.jmxremote -Dspring.jmx.enabled=true -Dspring.liveBeansView.mbeanDomain -Dspring.application.admin.enabled=true "-javaagent:C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\lib\idea_rt.jar=49441:C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\bin" -Dfile.encoding=UTF-8 -classpath C:\code\pollito\springcityexplorer\springcityexplorer-backend\target\classes;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter-web\3.1.7\spring-boot-starter-web-3.1.7.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter\3.1.7\spring-boot-starter-3.1.7.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter-logging\3.1.7\spring-boot-starter-logging-3.1.7.jar;C:\Users\franb\.m2\repository\ch\qos\logback\logback-classic\1.4.14\logback-classic-1.4.14.jar;C:\Users\franb\.m2\repository\ch\qos\logback\logback-core\1.4.14\logback-core-1.4.14.jar;C:\Users\franb\.m2\repository\org\apache\logging\log4j\log4j-to-slf4j\2.20.0\log4j-to-slf4j-2.20.0.jar;C:\Users\franb\.m2\repository\org\apache\logging\log4j\log4j-api\2.20.0\log4j-api-2.20.0.jar;C:\Users\franb\.m2\repository\org\slf4j\jul-to-slf4j\2.0.9\jul-to-slf4j-2.0.9.jar;C:\Users\franb\.m2\repository\jakarta\annotation\jakarta.annotation-api\2.1.1\jakarta.annotation-api-2.1.1.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter-json\3.1.7\spring-boot-starter-json-3.1.7.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\datatype\jackson-datatype-jdk8\2.15.3\jackson-datatype-jdk8-2.15.3.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\module\jackson-module-parameter-names\2.15.3\jackson-module-parameter-names-2.15.3.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter-tomcat\3.1.7\spring-boot-starter-tomcat-3.1.7.jar;C:\Users\franb\.m2\repository\org\apache\tomcat\embed\tomcat-embed-core\10.1.17\tomcat-embed-core-10.1.17.jar;C:\Users\franb\.m2\repository\org\apache\tomcat\embed\tomcat-embed-websocket\10.1.17\tomcat-embed-websocket-10.1.17.jar;C:\Users\franb\.m2\repository\org\springframework\spring-web\6.0.15\spring-web-6.0.15.jar;C:\Users\franb\.m2\repository\org\springframework\spring-beans\6.0.15\spring-beans-6.0.15.jar;C:\Users\franb\.m2\repository\io\micrometer\micrometer-observation\1.11.7\micrometer-observation-1.11.7.jar;C:\Users\franb\.m2\repository\io\micrometer\micrometer-commons\1.11.7\micrometer-commons-1.11.7.jar;C:\Users\franb\.m2\repository\org\springframework\spring-webmvc\6.0.15\spring-webmvc-6.0.15.jar;C:\Users\franb\.m2\repository\org\springframework\spring-aop\6.0.15\spring-aop-6.0.15.jar;C:\Users\franb\.m2\repository\org\springframework\spring-context\6.0.15\spring-context-6.0.15.jar;C:\Users\franb\.m2\repository\org\springframework\spring-expression\6.0.15\spring-expression-6.0.15.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-devtools\3.1.7\spring-boot-devtools-3.1.7.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot\3.1.7\spring-boot-3.1.7.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-autoconfigure\3.1.7\spring-boot-autoconfigure-3.1.7.jar;C:\Users\franb\.m2\repository\org\projectlombok\lombok\1.18.30\lombok-1.18.30.jar;C:\Users\franb\.m2\repository\jakarta\xml\bind\jakarta.xml.bind-api\4.0.1\jakarta.xml.bind-api-4.0.1.jar;C:\Users\franb\.m2\repository\jakarta\activation\jakarta.activation-api\2.1.2\jakarta.activation-api-2.1.2.jar;C:\Users\franb\.m2\repository\net\bytebuddy\byte-buddy\1.14.10\byte-buddy-1.14.10.jar;C:\Users\franb\.m2\repository\org\springframework\spring-core\6.0.15\spring-core-6.0.15.jar;C:\Users\franb\.m2\repository\org\springframework\spring-jcl\6.0.15\spring-jcl-6.0.15.jar;C:\Users\franb\.m2\repository\org\mapstruct\mapstruct\1.5.3.Final\mapstruct-1.5.3.Final.jar;C:\Users\franb\.m2\repository\org\openapitools\jackson-databind-nullable\0.2.6\jackson-databind-nullable-0.2.6.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\core\jackson-databind\2.15.3\jackson-databind-2.15.3.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\core\jackson-core\2.15.3\jackson-core-2.15.3.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-swagger2\3.0.0\springfox-swagger2-3.0.0.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-spi\3.0.0\springfox-spi-3.0.0.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-core\3.0.0\springfox-core-3.0.0.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-schema\3.0.0\springfox-schema-3.0.0.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-swagger-common\3.0.0\springfox-swagger-common-3.0.0.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-spring-web\3.0.0\springfox-spring-web-3.0.0.jar;C:\Users\franb\.m2\repository\io\github\classgraph\classgraph\4.8.83\classgraph-4.8.83.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-spring-webmvc\3.0.0\springfox-spring-webmvc-3.0.0.jar;C:\Users\franb\.m2\repository\io\springfox\springfox-spring-webflux\3.0.0\springfox-spring-webflux-3.0.0.jar;C:\Users\franb\.m2\repository\com\fasterxml\classmate\1.5.1\classmate-1.5.1.jar;C:\Users\franb\.m2\repository\org\slf4j\slf4j-api\2.0.9\slf4j-api-2.0.9.jar;C:\Users\franb\.m2\repository\org\springframework\plugin\spring-plugin-core\2.0.0.RELEASE\spring-plugin-core-2.0.0.RELEASE.jar;C:\Users\franb\.m2\repository\org\springframework\plugin\spring-plugin-metadata\2.0.0.RELEASE\spring-plugin-metadata-2.0.0.RELEASE.jar;C:\Users\franb\.m2\repository\io\swagger\swagger-annotations\1.5.20\swagger-annotations-1.5.20.jar;C:\Users\franb\.m2\repository\io\swagger\swagger-models\1.5.20\swagger-models-1.5.20.jar;C:\Users\franb\.m2\repository\io\swagger\core\v3\swagger-core-jakarta\2.2.8\swagger-core-jakarta-2.2.8.jar;C:\Users\franb\.m2\repository\org\apache\commons\commons-lang3\3.12.0\commons-lang3-3.12.0.jar;C:\Users\franb\.m2\repository\io\swagger\core\v3\swagger-annotations-jakarta\2.2.8\swagger-annotations-jakarta-2.2.8.jar;C:\Users\franb\.m2\repository\io\swagger\core\v3\swagger-models-jakarta\2.2.8\swagger-models-jakarta-2.2.8.jar;C:\Users\franb\.m2\repository\org\yaml\snakeyaml\1.33\snakeyaml-1.33.jar;C:\Users\franb\.m2\repository\jakarta\validation\jakarta.validation-api\3.0.2\jakarta.validation-api-3.0.2.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\core\jackson-annotations\2.15.3\jackson-annotations-2.15.3.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\dataformat\jackson-dataformat-yaml\2.15.3\jackson-dataformat-yaml-2.15.3.jar;C:\Users\franb\.m2\repository\com\fasterxml\jackson\datatype\jackson-datatype-jsr310\2.15.3\jackson-datatype-jsr310-2.15.3.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter-validation\3.1.2\spring-boot-starter-validation-3.1.2.jar;C:\Users\franb\.m2\repository\org\apache\tomcat\embed\tomcat-embed-el\10.1.17\tomcat-embed-el-10.1.17.jar;C:\Users\franb\.m2\repository\org\hibernate\validator\hibernate-validator\8.0.1.Final\hibernate-validator-8.0.1.Final.jar;C:\Users\franb\.m2\repository\org\jboss\logging\jboss-logging\3.5.3.Final\jboss-logging-3.5.3.Final.jar;C:\Users\franb\.m2\repository\javax\annotation\javax.annotation-api\1.3.2\javax.annotation-api-1.3.2.jar;C:\Users\franb\.m2\repository\org\springframework\cloud\spring-cloud-starter-openfeign\4.0.3\spring-cloud-starter-openfeign-4.0.3.jar;C:\Users\franb\.m2\repository\org\springframework\cloud\spring-cloud-starter\4.0.3\spring-cloud-starter-4.0.3.jar;C:\Users\franb\.m2\repository\org\springframework\cloud\spring-cloud-context\4.0.3\spring-cloud-context-4.0.3.jar;C:\Users\franb\.m2\repository\org\springframework\security\spring-security-rsa\1.0.11.RELEASE\spring-security-rsa-1.0.11.RELEASE.jar;C:\Users\franb\.m2\repository\org\bouncycastle\bcpkix-jdk15on\1.69\bcpkix-jdk15on-1.69.jar;C:\Users\franb\.m2\repository\org\bouncycastle\bcprov-jdk15on\1.69\bcprov-jdk15on-1.69.jar;C:\Users\franb\.m2\repository\org\bouncycastle\bcutil-jdk15on\1.69\bcutil-jdk15on-1.69.jar;C:\Users\franb\.m2\repository\org\springframework\cloud\spring-cloud-openfeign-core\4.0.3\spring-cloud-openfeign-core-4.0.3.jar;C:\Users\franb\.m2\repository\org\springframework\boot\spring-boot-starter-aop\3.1.7\spring-boot-starter-aop-3.1.7.jar;C:\Users\franb\.m2\repository\io\github\openfeign\form\feign-form-spring\3.8.0\feign-form-spring-3.8.0.jar;C:\Users\franb\.m2\repository\io\github\openfeign\form\feign-form\3.8.0\feign-form-3.8.0.jar;C:\Users\franb\.m2\repository\commons-fileupload\commons-fileupload\1.4\commons-fileupload-1.4.jar;C:\Users\franb\.m2\repository\org\springframework\cloud\spring-cloud-commons\4.0.3\spring-cloud-commons-4.0.3.jar;C:\Users\franb\.m2\repository\org\springframework\security\spring-security-crypto\6.1.6\spring-security-crypto-6.1.6.jar;C:\Users\franb\.m2\repository\io\github\openfeign\feign-core\12.3\feign-core-12.3.jar;C:\Users\franb\.m2\repository\io\github\openfeign\feign-slf4j\12.3\feign-slf4j-12.3.jar;C:\Users\franb\.m2\repository\io\github\openfeign\feign-okhttp\12.4\feign-okhttp-12.4.jar;C:\Users\franb\.m2\repository\com\squareup\okhttp3\okhttp\4.10.0\okhttp-4.10.0.jar;C:\Users\franb\.m2\repository\com\squareup\okio\okio-jvm\3.0.0\okio-jvm-3.0.0.jar;C:\Users\franb\.m2\repository\org\jetbrains\kotlin\kotlin-stdlib-jdk8\1.8.22\kotlin-stdlib-jdk8-1.8.22.jar;C:\Users\franb\.m2\repository\org\jetbrains\kotlin\kotlin-stdlib-jdk7\1.8.22\kotlin-stdlib-jdk7-1.8.22.jar;C:\Users\franb\.m2\repository\org\jetbrains\kotlin\kotlin-stdlib-common\1.8.22\kotlin-stdlib-common-1.8.22.jar;C:\Users\franb\.m2\repository\org\jetbrains\kotlin\kotlin-stdlib\1.8.22\kotlin-stdlib-1.8.22.jar;C:\Users\franb\.m2\repository\org\jetbrains\annotations\13.0\annotations-13.0.jar;C:\Users\franb\.m2\repository\io\github\openfeign\feign-jackson\12.4\feign-jackson-12.4.jar;C:\Users\franb\.m2\repository\io\github\openfeign\feign-gson\12.4\feign-gson-12.4.jar;C:\Users\franb\.m2\repository\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar;C:\Users\franb\.m2\repository\com\google\code\findbugs\jsr305\3.0.2\jsr305-3.0.2.jar;C:\Users\franb\.m2\repository\org\junit\jupiter\junit-jupiter-api\5.10.0\junit-jupiter-api-5.10.0.jar;C:\Users\franb\.m2\repository\org\opentest4j\opentest4j\1.3.0\opentest4j-1.3.0.jar;C:\Users\franb\.m2\repository\org\junit\platform\junit-platform-commons\1.9.3\junit-platform-commons-1.9.3.jar;C:\Users\franb\.m2\repository\org\apiguardian\apiguardian-api\1.1.2\apiguardian-api-1.1.2.jar;C:\Users\franb\.m2\repository\net\datafaker\datafaker\2.0.1\datafaker-2.0.1.jar;C:\Users\franb\.m2\repository\com\github\mifmif\generex\1.0.2\generex-1.0.2.jar;C:\Users\franb\.m2\repository\dk\brics\automaton\automaton\1.11-8\automaton-1.11-8.jar;C:\Users\franb\.m2\repository\org\aspectj\aspectjrt\1.9.19\aspectjrt-1.9.19.jar;C:\Users\franb\.m2\repository\org\aspectj\aspectjweaver\1.9.19\aspectjweaver-1.9.19.jar dev.pollito.springcityexplorer.SpringcityexplorerApplication
OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release.

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.7)

2024-01-24 22:45:51 INFO  o.h.validator.internal.util.Version [SessionID: ] - HV000001: Hibernate Validator 8.0.1.Final
2024-01-24 22:45:51 INFO  d.p.s.SpringcityexplorerApplication [SessionID: ] - Starting SpringcityexplorerApplication using Java 17.0.6 with PID 23812 (C:\code\pollito\springcityexplorer\springcityexplorer-backend\target\classes started by franb in C:\code\pollito\springcityexplorer\springcityexplorer-backend)
2024-01-24 22:45:51 INFO  d.p.s.SpringcityexplorerApplication [SessionID: ] - No active profile set, falling back to 1 default profile: "default"
2024-01-24 22:45:51 INFO  o.s.b.d.e.DevToolsPropertyDefaultsPostProcessor [SessionID: ] - Devtools property defaults active! Set 'spring.devtools.add-properties' to 'false' to disable
2024-01-24 22:45:51 INFO  o.s.b.d.e.DevToolsPropertyDefaultsPostProcessor [SessionID: ] - For additional web related logging consider setting the 'logging.level.web' property to 'DEBUG'
2024-01-24 22:45:52 INFO  o.s.cloud.context.scope.GenericScope [SessionID: ] - BeanFactory id=399fb941-b3a4-3786-9bf5-30bba8356a4a
2024-01-24 22:45:52 INFO  o.s.b.w.e.tomcat.TomcatWebServer [SessionID: ] - Tomcat initialized with port(s): 8080 (http)
2024-01-24 22:45:52 INFO  o.a.coyote.http11.Http11NioProtocol [SessionID: ] - Initializing ProtocolHandler ["http-nio-8080"]
2024-01-24 22:45:52 INFO  o.a.catalina.core.StandardService [SessionID: ] - Starting service [Tomcat]
2024-01-24 22:45:52 INFO  o.a.catalina.core.StandardEngine [SessionID: ] - Starting Servlet engine: [Apache Tomcat/10.1.17]
2024-01-24 22:45:52 INFO  o.a.c.c.C.[Tomcat].[localhost].[/] [SessionID: ] - Initializing Spring embedded WebApplicationContext
2024-01-24 22:45:52 INFO  o.s.b.w.s.c.ServletWebServerApplicationContext [SessionID: ] - Root WebApplicationContext: initialization completed in 1473 ms
2024-01-24 22:45:53 INFO  o.s.b.d.a.OptionalLiveReloadServer [SessionID: ] - LiveReload server is running on port 35729
2024-01-24 22:45:53 INFO  o.a.coyote.http11.Http11NioProtocol [SessionID: ] - Starting ProtocolHandler ["http-nio-8080"]
2024-01-24 22:45:53 INFO  o.s.b.w.e.tomcat.TomcatWebServer [SessionID: ] - Tomcat started on port(s): 8080 (http) with context path ''
2024-01-24 22:45:54 INFO  d.p.s.SpringcityexplorerApplication [SessionID: ] - Started SpringcityexplorerApplication in 3.086 seconds (process running for 4.001)
```

**Here's chatGPT interpretation:**

Alright, let's break down what these logs are telling us about your Spring Boot application:

1. **Java and Spring Boot Versions**: The application is running on Java 17.0.6 and Spring Boot version 3.1.7. Good choice! Java 17 is a long-term support (LTS) version, and you're on the latest Spring Boot, staying current with industry trends.

2. **Deprecated JVM Options**: The log mentions `-Xverify:none` and `-noverify` are deprecated as of JDK 13. It's a reminder to review and update JVM arguments to align with the best practices for the JDK version in use.

3. **Application Startup**: The `SpringcityexplorerApplication` is starting up successfully. It's being run by a user named `franb` and has been assigned a process ID (PID) of 23812.

4. **Profiles and DevTools**: No specific Spring profiles are active, so it defaults to the "default" profile. Spring Boot DevTools is active, which is great for local development because it provides features like automatic restarts.

5. **Logging Configuration**: It suggests considering setting `logging.level.web` to `DEBUG` for additional web-related logging. This could be useful if you need more detailed logs for debugging web components.

6. **BeanFactory and Scopes**: A `GenericScope` bean is registered, indicating custom or cloud-related scopes might be in use.

7. **Tomcat and Web Server Setup**: Tomcat is set up as the embedded server on port 8080, which is the default port for HTTP. This is pretty standard for Spring Boot web applications.

8. **Web Application Context**: The Spring `WebApplicationContext` is initialized successfully, and it took 1473 ms. This is a reasonable time for startup, indicating no major issues in the context initialization.

9. **LiveReload Server**: A LiveReload server is running on port 35729. LiveReload is handy for refreshing your browser automatically whenever you make changes to your resources.

10. **Application Ready**: The application starts in approximately 3.086 seconds, which is a decent startup time for a Spring Boot application.

Overall, the logs indicate a healthy start-up sequence of a Spring Boot application. There are no errors or warnings that suggest immediate issues. It's a smooth sail, just like Java, unlike the unpredictable tides you might face in JavaScript's asynchronous oceans! 😉

If you have more specific aspects of the log you're curious about, feel free to ask!

### Scenario 1: Normal weather request

**Here's the curl request:**

```bash
curl --location 'http://localhost:8080/weather?city=lisbon'
```

**Here are the logs:**

```log
2024-01-24 23:04:25 INFO  d.p.s.filter.LogFilter [SessionID: 9a3cbcf7-665b-4b7a-8cc9-87d9d919609c] - >>>> Method: GET; URI: /weather; QueryString: city=lisbon
2024-01-24 23:04:26 INFO  d.p.s.aspect.LoggingAspect [SessionID: 9a3cbcf7-665b-4b7a-8cc9-87d9d919609c] - [WeatherController.getWeatherByCity(..)] Args: [lisbon]
2024-01-24 23:04:26 INFO  d.p.s.aspect.LoggingAspect [SessionID: 9a3cbcf7-665b-4b7a-8cc9-87d9d919609c] - [WeatherApi.currentGet(..)] Args: [{access_key=,someValidKey, query=lisbon}]
2024-01-24 23:04:26 INFO  d.p.s.aspect.LoggingAspect [SessionID: 9a3cbcf7-665b-4b7a-8cc9-87d9d919609c] - [WeatherApi.currentGet(..)] Response: class Weather {
    request: class Request {
        type: City
        query: Lisbon, Portugal
        language: en
        unit: m
    }
    location: class Location {
        name: Lisbon
        country: Portugal
        region: Lisboa
        lat: 38.717
        lon: -9.133
        timezoneId: Europe/Lisbon
        _localtime: 2024-01-24 23:03
        localtimeEpoch: 1706137380
        utcOffset: 0.0
    }
    current: class Current {
        observationTime: 11:03 PM
        temperature: 15
        weatherCode: 113
        weatherIcons: [https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0008_clear_sky_night.png]
        weatherDescriptions: [Clear]
        windSpeed: 7
        windDegree: 350
        windDir: N
        pressure: 1034
        precip: 0.0
        humidity: 82
        cloudcover: 0
        feelslike: 15
        uvIndex: 1
        visibility: 10
    }
}
2024-01-24 23:04:26 INFO  d.p.s.aspect.LoggingAspect [SessionID: 9a3cbcf7-665b-4b7a-8cc9-87d9d919609c] - [WeatherController.getWeatherByCity(..)] Response: <200 OK OK,class Weather {
    location: class WeatherLocation {
        name: Lisbon
        country: Portugal
        region: Lisboa
        lat: 38.717
        lon: -9.133
        timezoneId: Europe/Lisbon
        _localtime: 2024-01-24 23:03
        localtimeEpoch: 1706137380
        utcOffset: 0.0
    }
    current: class WeatherCurrent {
        observationTime: 11:03 PM
        temperature: 15
        weatherCode: 113
        weatherIcons: [https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0008_clear_sky_night.png]
        weatherDescriptions: [Clear]
        windSpeed: 7
        windDegree: 350
        windDir: N
        pressure: 1034
        precip: 0.0
        humidity: 82
        cloudcover: 0
        feelslike: 15
        uvIndex: 1
        visibility: 10
    }
},[]>
2024-01-24 23:04:26 INFO  d.p.s.filter.LogFilter [SessionID: 9a3cbcf7-665b-4b7a-8cc9-87d9d919609c] - <<<< Response Status: 200
```

**Here's chatGPT interpretation:**

This log entry paints a successful picture of a request to the `/weather` endpoint in your application. Here's a breakdown of the flow and what each part of the log tells us:

1. **Initial Request**: The process starts with a GET request to `/weather` with the query string `city=lisbon`. This is logged by the `LogFilter`, indicating that your application has a filter in place for logging incoming requests.

2. **Controller Method Invocation**: The `LoggingAspect` logs the invocation of the `WeatherController.getWeatherByCity(..)` method with "lisbon" as the argument. This use of AOP for logging keeps your controller code clean and focused on its primary responsibility.

3. **External API Call**: Next, there's a call to `WeatherApi.currentGet(..)` with a valid access key and the query "lisbon". This suggests that your application integrates with an external weather service API.

4. **Successful API Response**: The `LoggingAspect` logs a successful response from the `WeatherApi.currentGet(..)` method. The response includes detailed weather information for Lisbon, Portugal, like temperature, weather code, wind speed, humidity, etc. This detailed logging is great for debugging and understanding the flow of data through your application.

5. **Controller Response**: The `WeatherController.getWeatherByCity(..)` method's response is logged as a 200 OK, with the weather data successfully transformed into your application's internal `Weather` class format. It indicates a successful processing and mapping of the external API response to your application's data model.

6. **Final Response to Client**: The `LogFilter` records the final HTTP response status as 200 OK, confirming that the request was successfully processed and the client received the expected data.

**Overall Interpretation**:

- Your application correctly handles an incoming request, processes it by fetching data from an external API, and returns the formatted response to the client.
- The use of AOP for logging method entries, exits, and responses is a good practice, helping to keep your code clean and maintainable.
- The external API integration seems to be functioning correctly, and your application is able to parse and transform the API's response successfully.

From this log, we can conclude that this part of your application is working as expected. It's always refreshing to see a 200 OK, just like sipping a well-brewed cup of Java, smooth and error-free – unlike those unpredictable Python scripts, where you never know if you're getting a coffee or a snake! 🐍☕😄

### Scenario 2: Requesting weather of a non existing city

**Here's the curl request:**

```bash
curl --location 'http://localhost:8080/weather?city=asdasd'
```

**Here are the logs:**

```log
2024-01-24 23:08:36 INFO  d.p.s.filter.LogFilter [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - >>>> Method: GET; URI: /weather; QueryString: city=asdasd
2024-01-24 23:08:36 INFO  d.p.s.aspect.LoggingAspect [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - [WeatherController.getWeatherByCity(..)] Args: [asdasd]
2024-01-24 23:08:36 INFO  d.p.s.aspect.LoggingAspect [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - [WeatherApi.currentGet(..)] Args: [{access_key=someValidKey, query=asdasd}]
2024-01-24 23:08:36 INFO  d.p.s.aspect.LoggingAspect [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - [GlobalControllerAdvice.handle(..)] Args: [feign.codec.DecodeException]
2024-01-24 23:08:36 INFO  d.p.s.aspect.LoggingAspect [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - [WeatherControllerAdvice.handle(..)] Args: [dev.pollito.springcityexplorer.exception.WeatherException]
2024-01-24 23:08:36 INFO  d.p.s.aspect.LoggingAspect [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - [WeatherControllerAdvice.handle(..)] Response: <400 BAD_REQUEST Bad Request,class Error {
    timestamp: 2024-01-24T23:08:36.645567600Z
    session: 772a57c1-441c-4f99-88a0-5abdef8166aa
    error: WeatherException
    message: Looks like we took a wrong turn and couldn't find that city! Mind checking the map (spelling) again?
    path: /weather
},[]>
2024-01-24 23:08:36 INFO  d.p.s.aspect.LoggingAspect [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - [GlobalControllerAdvice.handle(..)] Response: <400 BAD_REQUEST Bad Request,class Error {
    timestamp: 2024-01-24T23:08:36.645567600Z
    session: 772a57c1-441c-4f99-88a0-5abdef8166aa
    error: WeatherException
    message: Looks like we took a wrong turn and couldn't find that city! Mind checking the map (spelling) again?
    path: /weather
},[]>
2024-01-24 23:08:36 WARN  o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - Resolved [feign.codec.DecodeException]
2024-01-24 23:08:36 INFO  d.p.s.filter.LogFilter [SessionID: 772a57c1-441c-4f99-88a0-5abdef8166aa] - <<<< Response Status: 400
```

**Here's chatGPT interpretation:**

This log entry indicates an interesting scenario where the application handles an invalid city name in a request to the `/weather` endpoint. Here's the breakdown:

1. **Initial Request**: A GET request is made to `/weather` with an invalid city name `asdasd`. This is captured by the `LogFilter`, indicating a robust logging mechanism for incoming requests.

2. **Controller Method Invocation**: The `LoggingAspect` logs the invocation of the `WeatherController.getWeatherByCity(..)` method with "asdasd" as an argument, showing the use of AOP for clean logging.

3. **External API Call and Exception**: A call is made to `WeatherApi.currentGet(..)` with the query "asdasd". However, this leads to a `DecodeException` from Feign, suggesting that the external API response couldn't be decoded, likely because "asdasd" is not a valid city.

4. **Custom Exception Handling**: Your application's `WeatherControllerAdvice` catches this exception and transforms it into a `WeatherException`, a good practice for handling external API errors gracefully.

5. **User-Friendly Error Response**: The `WeatherControllerAdvice` constructs a 400 Bad Request response, with a user-friendly error message: "Looks like we took a wrong turn and couldn't find that city! Mind checking the map (spelling) again?" This approach is excellent for UX, as it provides a clear and friendly message to the end user.

6. **Logging of Response**: The `LoggingAspect` logs the error response details, providing complete visibility into how the error is handled and what is returned to the client.

7. **Exception Resolution**: The `ExceptionHandlerExceptionResolver` logs that the `DecodeException` was resolved, indicating that your application has a mechanism to handle such exceptions effectively.

8. **Final Client Response**: The `LogFilter` records the final response status as 400 Bad Request, confirming that the client was informed about the incorrect city name.

**Key Takeaways**:

- Your application effectively deals with invalid inputs by integrating with an external API, catching exceptions, and returning user-friendly error messages.
- The use of AOP for logging keeps the code clean and provides valuable insights into the application's behavior.
- Custom exception handling strategies in place are robust, transforming low-level exceptions into meaningful, user-friendly responses.

Overall, the application demonstrates good practices in error handling, logging, and user communication. It's always good to guide users back on track, much like Java's strong typing system nudging developers away from potential runtime surprises, unlike the wild adventures you might have with dynamically typed languages like JavaScript! 😉🗺️

### Scenario 3: Weatherstack api key is not correct

**Here's the curl request:**

```bash
curl --location 'http://localhost:8080/weather?city=lisbon'
```

To make the api key not valid, you need to change it in the environmental variables of your running configuration.

**Here are the logs:**

```log
2024-01-24 22:53:31 INFO  d.p.s.filter.LogFilter [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - >>>> Method: GET; URI: /weather; QueryString: city=lisbon
2024-01-24 22:53:31 INFO  d.p.s.aspect.LoggingAspect [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - [WeatherController.getWeatherByCity(..)] Args: [lisbon]
2024-01-24 22:53:32 INFO  d.p.s.aspect.LoggingAspect [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - [WeatherApi.currentGet(..)] Args: [{access_key=someInvalidKey, query=lisbon}]
2024-01-24 22:53:32 INFO  d.p.s.aspect.LoggingAspect [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - [GlobalControllerAdvice.handle(..)] Args: [feign.codec.DecodeException]
2024-01-24 22:53:32 INFO  d.p.s.aspect.LoggingAspect [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - [WeatherControllerAdvice.handle(..)] Args: [dev.pollito.springcityexplorer.exception.WeatherException]
2024-01-24 22:53:32 ERROR d.p.s.c.a.WeatherControllerAdvice [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - WeatherException is not caused by Bad Request. Error code: 101. Check API Error Codes in the docs https://weatherstack.com/documentation
2024-01-24 22:53:32 INFO  d.p.s.aspect.LoggingAspect [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - [WeatherControllerAdvice.handle(..)] Response: <500 INTERNAL_SERVER_ERROR Internal Server Error,class Error {
    timestamp: 2024-01-24T22:53:32.377270900Z
    session: ca6d6ef3-2054-4f28-ac1b-67b978b7a404
    error: WeatherException
    message: An unexpected error occurred. Please try again later.
    path: /weather
},[]>
2024-01-24 22:53:32 INFO  d.p.s.aspect.LoggingAspect [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - [GlobalControllerAdvice.handle(..)] Response: <500 INTERNAL_SERVER_ERROR Internal Server Error,class Error {
    timestamp: 2024-01-24T22:53:32.377270900Z
    session: ca6d6ef3-2054-4f28-ac1b-67b978b7a404
    error: WeatherException
    message: An unexpected error occurred. Please try again later.
    path: /weather
},[]>
2024-01-24 22:53:32 WARN  o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - Resolved [feign.codec.DecodeException]
2024-01-24 22:53:32 INFO  d.p.s.filter.LogFilter [SessionID: ca6d6ef3-2054-4f28-ac1b-67b978b7a404] - <<<< Response Status: 500
```

**Here's chatGPT interpretation:**

This log entry provides insight into an error scenario in your application, specifically related to a weather information feature. Here's a breakdown of what's happening:

1. **Request Handling**: A GET request is made to `/weather` with the query string `city=lisbon`. This indicates the application has an endpoint to provide weather information based on a city name.

2. **Method Invocation Logging**: The `LoggingAspect` (an aspect-oriented programming (AOP) component) logs the method invocations in your application. First, it logs the `WeatherController.getWeatherByCity(..)` method with the argument "lisbon". Then, it logs a call to `WeatherApi.currentGet(..)` with parameters including an access key and the query "lisbon".

3. **Exception Handling**: The log shows that a `DecodeException` from Feign (a declarative web service client) is caught. This exception typically occurs when Feign fails to decode an HTTP response.

4. **Custom Exception Handling**: Your application seems to have a custom exception handling mechanism. It catches the `DecodeException` and then throws a `WeatherException`. This is a good practice, as it encapsulates external library exceptions into your application's domain-specific exceptions.

5. **Error Logging**: An `ERROR` log level message from `WeatherControllerAdvice` indicates that a `WeatherException` is encountered, which is not due to a Bad Request (HTTP 400). The error code is 101, and it suggests checking the API documentation at weatherstack.com for more details.

6. **Response Formation**: Both `WeatherControllerAdvice.handle(..)` and `GlobalControllerAdvice.handle(..)` log the formation of an HTTP 500 (Internal Server Error) response. This suggests a centralized exception handling strategy in your application, which is a best practice in Spring applications.

7. **Exception Resolution**: The `ExceptionHandlerExceptionResolver` warns that a `feign.codec.DecodeException` was resolved. This is part of Spring's mechanism to handle exceptions and convert them into HTTP responses.

8. **Final Response**: The `LogFilter` logs the final HTTP response status as 500, indicating an internal server error was returned to the client.

**Interpretation & Suggestions**:

- The issue seems to be related to the interaction with an external weather API. The `DecodeException` suggests that the response from the external service might not be in the expected format or there's an issue in the Feign client configuration.
- Error code 101 might provide more specific information. It's a good practice to direct developers to API documentation for error code references, as done in the log.
- The application correctly transforms low-level exceptions into more meaningful domain-specific exceptions and handles them centrally.
- The use of AOP for logging method entries and exits is a clean way to keep the logging concern separated from the main business logic.

In short, you'll need to investigate the interaction with the weather API, especially focusing on the response format and how it's being decoded. Don't forget to check out the weather API's documentation; sometimes the answer is just a breeze away, unlike in Python, where it might feel like you're trying to catch a snake by the tail! 🐍😉

### Scenario 4: No city provided

**Here's the curl request:**

```bash
curl --location 'http://localhost:8080/weather'
```

**Here are the logs:**

```log
2024-01-24 23:12:55 INFO  d.p.s.filter.LogFilter [SessionID: c85b4d89-d076-468c-8508-0eea8dd456f2] - >>>> Method: GET; URI: /weather; QueryString: null
2024-01-24 23:12:55 INFO  d.p.s.aspect.LoggingAspect [SessionID: c85b4d89-d076-468c-8508-0eea8dd456f2] - [GlobalControllerAdvice.handle(..)] Args: [org.springframework.web.bind.MissingServletRequestParameterException: Required request parameter 'city' for method parameter type String is not present]
2024-01-24 23:12:55 INFO  d.p.s.aspect.LoggingAspect [SessionID: c85b4d89-d076-468c-8508-0eea8dd456f2] - [GlobalControllerAdvice.handle(..)] Response: <400 BAD_REQUEST Bad Request,class Error {
    timestamp: 2024-01-24T23:12:55.074388600Z
    session: c85b4d89-d076-468c-8508-0eea8dd456f2
    error: MissingServletRequestParameterException
    message: Required parameter 'city' is not present.
    path: /weather
},[]>
2024-01-24 23:12:55 WARN  o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver [SessionID: c85b4d89-d076-468c-8508-0eea8dd456f2] - Resolved [org.springframework.web.bind.MissingServletRequestParameterException: Required request parameter 'city' for method parameter type String is not present]
2024-01-24 23:12:55 INFO  d.p.s.filter.LogFilter [SessionID: c85b4d89-d076-468c-8508-0eea8dd456f2] - <<<< Response Status: 400
```

**Here's chatGPT interpretation:**
This log entry highlights how your application handles a scenario where a required query parameter is missing in a request. Let's dive into the details:

1. **Initial Request**: A GET request is made to the `/weather` endpoint without any query string. This is indicated by `QueryString: null` in the log, captured by the `LogFilter`.

2. **Missing Parameter Exception**: The `LoggingAspect` logs that a `MissingServletRequestParameterException` is thrown. This is a Spring framework exception indicating that a required request parameter (in this case, 'city') is missing. This exception is a clear indicator that the endpoint expects a 'city' parameter, which wasn't provided in the request.

3. **Exception Handling**: The `GlobalControllerAdvice` is invoked to handle this exception. The use of a global controller advice for exception handling is a best practice in Spring, as it allows for centralized handling of exceptions across controllers.

4. **Error Response**: The `GlobalControllerAdvice` logs the construction of a 400 Bad Request response. The response includes a timestamp, session ID, the type of error (`MissingServletRequestParameterException`), a message indicating the missing 'city' parameter, and the path where the error occurred. This detailed error response is helpful for API consumers to understand what went wrong.

5. **Exception Resolution**: The `ExceptionHandlerExceptionResolver` logs that the `MissingServletRequestParameterException` was resolved. This component in Spring MVC plays a crucial role in mapping exceptions to HTTP responses.

6. **Final Client Response**: The `LogFilter` records the final response status as 400 Bad Request, indicating that the request was not processed due to the missing parameter.

**Key Takeaways**:

- Your application correctly identifies and handles cases where required query parameters are missing, providing informative feedback to the client.
- The centralized exception handling using `GlobalControllerAdvice` is efficiently managing exceptions and ensuring consistent error responses.
- The detailed logging of both the request and the response is an excellent practice, providing full visibility into the application's behavior for these scenarios.

In a nutshell, the application is well-configured to guide users when they miss required information, a bit like Java's compiler nudging you about missing variables – it's always looking out for you, unlike some loosely-typed languages where you might wander off into undefined territory! 😉🗺️

## Next steps

- Add some caching to prevent exahustive calls to third party APIs: weather don't change every second. If we are requesting the weather for the same place multiple times in a very short time window, we should cache it.
- Get news articles from mediastack.
