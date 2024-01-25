---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 9: El arte de los logs"
date: 2024-01-24
description: "Logs requests, responses, y errores"
categories: ["Programming Stuff"]
thumbnail: /uploads/2024-01-24-contract-driven-dev9/DALL·E2024-01-2419.49.17.png
---

_Logs requests, responses, y errores._

## Consulta el repositorio de github

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-9](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-9)

## Creando un filtro de logs

Si no conoces con los filtros, consulte este [artículo de Baeldung](https://www.baeldung.com/spring-boot-add-filter).

Este filtro tendrá la particularidad de utilizar [el contexto de diagnóstico mapeado de sl4j](https://www.baeldung.com/mdc-in-log4j-2-logback) para guardar una identificación de sesión única, que puede usarse en toda la aplicación, no solo para fines de registro, sino también para devolver los errores a nuestros consumidores de API.

Finalmente podemos hacer uso de esta clase para agregar algunos registros útiles sobre solicitudes entrantes y respuestas salientes.

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

Para que esto funcione, tenemos que registrar el filtro. En esta configuración puedes personalizar si quieres que tu filtro afecte a todas las rutas o a rutas específicas.

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

## Imprimir la identificación de la sesión en los registros

Ahora que tenemos una identificación de sesión en el MDC de sl4j, podemos usarla en cualquier lugar... ¡incluso en los registros! Esto es extremadamente útil para rastrear cuando algo sale mal.

Necesitamos crear un logback.xml. Aquí hay muy sencillo. Siéntete libre de personalizarlo a tu gusto.

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

## Devolver la identificación de la sesión en objetos de error

Como dije antes, ahora que tenemos una ID de sesión en el MDC de sl4j, podemos usarla en cualquier lugar... ¡incluso en clases de utilidad!

Aquí hay un ejemplo de cómo crear una instancia de error.

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

## Creando aspectos de registro

Tenemos logs con identificación de sesión en request, en response, y la retornamos a nuestros consumidores de API en caso de errores.

Por experiencia personal, hay tres lugares más donde necesitamos agregar registros:

1. Antes y después de retornar en cualquier función pública en el paquete del controlador (esto también incluye controllers advice, que se encuentran en el paquete del controlador).
2. Antes y después de devolver cualquier llamada a una API de terceros
3. Cuando está a punto de devolverse una excepción no controlada
   - **Opinión muy personal:** Este es el único lugar donde se debe registrar un nivel de ERROR. Todos los demás registros deben ser de nivel INFO o WARN.

Podríamos agregar logs manualmente. Pero en lugar de eso, adoptaré el enfoque orientado a aspectos.

## Aspectos

### Agregar dependencias

Necesitamos agregar estas dependencias en pom.xml

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

### Creando un aspecto de logs

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

En el futuro, cuando agreguemos más apis de terceros, necesitaremos crear un pointcut y agregarlo a los métodos logBefore() y logAfterReturning().

Esto cubre los puntos 1 y 2 sobre dónde agregar registros. Ahora vamos con el punto 3.

## Logs manuales

### Cuando se está a punto de devolverse una excepción no controlada

Caer en el manejador de excepciones general podría significar dos cosas:

- No se está gestionando un error que debería gestionarse.
- Un error que ni siquiera sabíamos que podía ocurrir, simplemente sucedió.

En ambos escenarios, es importante log en el nivel de ERROR.

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

### Siempre que veas tiene sentido

El hecho de que la API Weatherstack tenga varios comportamientos no estándar vuelve a resultar útil con fines educativos.

Como acabas de leer arriba, tenemos que hacer una fea verificación en el controlador de excepciones para verificar si la excepción puede ser una WeatherException envuelta en una DecodeException. Después de eso deleamos la responsabilidad al Controller Advice que tiene WeatherException. Pero no todo termina ahí.

En el Controller Advice de WeatherException, existe la posibilidad de que el error no sea causado por una mala solicitud del usuario. En este escenario tan rebuscado, un log podría resultar útil.

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

## Ejercicio de práctica: lectura de algunos logs

Hagamos algunas peticiones, enviamos los logs a chatgpt y preguntaremos qué interpreta. Si nuestros registros son lo suficientemente descriptivos, entonces la IA debe ser capaz de dar una buena explicación.

Usaré el plugin de chatGPT [Java & Spring Mentor](https://gptstore.ai/gpts/rvT63m587b-java-spring-mentor). Es gracioso como el plugin hace bromas con javascript y python.

### Posible problema de seguridad

Los registros pueden y revelarán información secreta.

Algunas empresas dirían que debemos evitar esto a toda costa, en caso de que se filtren los logs. Veo sus preocupaciones de seguridad y estoy un poco de acuerdo. Pero ha habido múltiples ocasiones en las que tener algún token o credencial impreso en los registros me ayudó a recrear y corregir errores de manera muy rápida y eficiente.

Específicamente en el caso de este repositorio, la clave de acceso de la API de Weatherstack está comprometida. A mí no me importa. Pero puede que te importe y eso está bien. Mejore este repositorio según sea necesario.

En los siguientes registros, editaré manualmente la clave de acceso, porque no quiero exponerla aquí.

### Escenario 0: Iniciar la aplicación

El siguiente registro siempre se imprime al comienzo de la aplicación Spring Boot. Es posible configurarlo para que no se muestre. Veamos qué tiene que decir chatgpt al respecto.

**Logs:**

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

**Interpretación de chatGPT:**

Muy bien, analicemos lo que nos dicen estos registros sobre su aplicación Spring Boot:

1. **Versiones de Java y Spring Boot**: la aplicación se ejecuta en Java 17.0.6 y Spring Boot versión 3.1.7. ¡Buena elección! Java 17 es una versión de soporte a largo plazo (LTS) y usted está en la última versión de Spring Boot y se mantiene actualizado con las tendencias de la industria.

2. **Opciones de JVM en desuso**: el registro menciona que `-Xverify:none` y `-noverify` están en desuso a partir de JDK 13. Es un recordatorio para revisar y actualizar los argumentos de JVM para alinearse con las mejores prácticas para la versión de JDK. en uso.

3. **Inicio de la aplicación**: `SpringcityexplorerApplication` se está iniciando exitosamente. Lo ejecuta un usuario llamado "franb" y se le ha asignado un ID de proceso (PID) de 23812.

4. **Perfiles y DevTools**: No hay perfiles Spring específicos activos, por lo que el valor predeterminado es el perfil "predeterminado". Spring Boot DevTools está activo, lo cual es excelente para el desarrollo local porque proporciona funciones como reinicios automáticos.

5. **Configuración de registro**: sugiere considerar configurar `logging.level.web` en `DEBUG` para registros adicionales relacionados con la web. Esto podría resultar útil si necesita registros más detallados para depurar componentes web.

6. **BeanFactory y ámbitos**: se registra un bean `GenericScope`, lo que indica que es posible que se estén utilizando ámbitos personalizados o relacionados con la nube.

7. **Configuración de Tomcat y servidor web**: Tomcat está configurado como servidor integrado en el puerto 8080, que es el puerto predeterminado para HTTP. Esto es bastante estándar para las aplicaciones web Spring Boot.

8. **Contexto de la aplicación web**: Spring `WebApplicationContext` se inicializó correctamente y tardó 1473 ms. Este es un tiempo razonable para el inicio, lo que indica que no hay problemas importantes en la inicialización del contexto.

9. **Servidor LiveReload**: se ejecuta un servidor LiveReload en el puerto 35729. LiveReload es útil para actualizar su navegador automáticamente cada vez que realiza cambios en sus recursos.

10. **Aplicación lista**: la aplicación se inicia en aproximadamente 3,086 segundos, que es un tiempo de inicio decente para una aplicación Spring Boot.

En general, los registros indican una secuencia de inicio saludable de una aplicación Spring Boot. No hay errores ni advertencias que sugieran problemas inmediatos. ¡Es una navegación suave, al igual que Java, a diferencia de las mareas impredecibles que podrías enfrentar en los océanos asincrónicos de JavaScript! 😉

Si tiene aspectos más específicos del registro que le interesan, ¡no dude en preguntar!

### Escenario 1: Solicitud de clima normal

**curl request:**

```bash
curl --location 'http://localhost:8080/weather?city=lisbon'
```

**Logs:**

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

**Interpretación de chatGPT:**

Esta entrada de registro muestra una imagen exitosa de una solicitud al punto final `/weather` en su aplicación. A continuación se muestra un desglose del flujo y lo que nos dice cada parte del registro:

1. **Solicitud inicial**: El proceso comienza con una solicitud GET a `/weather` con la cadena de consulta `city=lisbon`. Esto lo registra "LogFilter", lo que indica que su aplicación tiene un filtro para registrar las solicitudes entrantes.

2. **Invocación del método del controlador**: `LoggingAspect` registra la invocación del método `WeatherController.getWeatherByCity(..)` con "lisboa" como argumento. Este uso de AOP para el registro mantiene el código de su controlador limpio y enfocado en su responsabilidad principal.

3. **Llamada API externa**: A continuación, hay una llamada a `WeatherApi.currentGet(..)` con una clave de acceso válida y la consulta "lisboa". Esto sugiere que su aplicación se integra con una API de servicio meteorológico externo.

4. **Respuesta API exitosa**: `LoggingAspect` registra una respuesta exitosa del método `WeatherApi.currentGet(..)`. La respuesta incluye información meteorológica detallada para Lisboa, Portugal, como temperatura, código meteorológico, velocidad del viento, humedad, etc. Este registro detallado es excelente para depurar y comprender el flujo de datos a través de su aplicación.

5. **Respuesta del controlador**: La respuesta del método `WeatherController.getWeatherByCity(..)` se registra como 200 OK, y los datos meteorológicos se transforman exitosamente al formato de clase `Weather` interno de su aplicación. Indica un procesamiento y mapeo exitosos de la respuesta de la API externa al modelo de datos de su aplicación.

6. **Respuesta final al cliente**: `LogFilter` registra el estado de la respuesta HTTP final como 200 OK, lo que confirma que la solicitud se procesó exitosamente y que el cliente recibió los datos esperados.

**Interpretación general**:

- Su aplicación maneja correctamente una solicitud entrante, la procesa obteniendo datos de una API externa y devuelve la respuesta formateada al cliente.
- El uso de AOP para registrar entradas, salidas y respuestas de métodos es una buena práctica que ayuda a mantener el código limpio y fácil de mantener.
- La integración de la API externa parece funcionar correctamente y su aplicación puede analizar y transformar la respuesta de la API correctamente.

A partir de este registro, podemos concluir que esta parte de su aplicación funciona como se esperaba. Siempre es reconfortante ver un 200 OK, como beber una taza de Java bien preparada, suave y sin errores, a diferencia de esos scripts de Python impredecibles, donde nunca sabes si estás tomando un café o una serpiente. 🐍☕😄

### Escenario 2: Solicitar el clima de una ciudad no existente

**curl request:**

```bash
curl --location 'http://localhost:8080/weather?city=asdasd'
```

**Logs:**

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

**Aquí está la interpretación de chatGPT:**

Esta entrada de registro indica un escenario interesante en el que la aplicación maneja un nombre de ciudad no válido en una solicitud al punto final `/weather`. Aquí está el desglose:

1. **Solicitud inicial**: Se realiza una solicitud GET a `/weather` con un nombre de ciudad no válido `asdasd`. Esto es capturado por "LogFilter", lo que indica un mecanismo de registro sólido para las solicitudes entrantes.

2. **Invocación del método del controlador**: `LoggingAspect` registra la invocación del método `WeatherController.getWeatherByCity(..)` con "asdasd" como argumento, mostrando el uso de AOP para un registro limpio.

3. **Llamada API externa y excepción**: Se realiza una llamada a `WeatherApi.currentGet(..)` con la consulta "asdasd". Sin embargo, esto genera una `DecodeException` de Feign, lo que sugiere que la respuesta de la API externa no se pudo decodificar, probablemente porque "asdasd" no es una ciudad válida.

4. **Manejo de excepciones personalizado**: `WeatherControllerAdvice` de su aplicación detecta esta excepción y la transforma en una `WeatherException`, una buena práctica para manejar errores de API externos con elegancia.

5. **Respuesta de error fácil de usar**: `WeatherControllerAdvice` construye una respuesta de solicitud incorrecta 400, con un mensaje de error fácil de usar: "¡Parece que tomamos un giro equivocado y no pudimos encontrar esa ciudad! ¡Te importa revisar el mapa (ortografía) otra vez?" Este enfoque es excelente para UX, ya que proporciona un mensaje claro y amigable al usuario final.

6. **Registro de respuesta**: `LoggingAspect` registra los detalles de la respuesta al error, proporcionando visibilidad completa de cómo se maneja el error y qué se devuelve al cliente.

7. **Resolución de excepciones**: `ExceptionHandlerExceptionResolver` registra que se resolvió `DecodeException`, lo que indica que su aplicación tiene un mecanismo para manejar dichas excepciones de manera efectiva.

8. **Respuesta final del cliente**: `LogFilter` registra el estado de la respuesta final como 400 Solicitud incorrecta, lo que confirma que se informó al cliente sobre el nombre de ciudad incorrecto.

**Conclusiones clave**:

- Su aplicación trata eficazmente las entradas no válidas al integrarse con una API externa, detectar excepciones y devolver mensajes de error fáciles de usar.
- El uso de AOP para el registro mantiene el código limpio y proporciona información valiosa sobre el comportamiento de la aplicación.
- Las estrategias personalizadas de manejo de excepciones implementadas son sólidas y transforman las excepciones de bajo nivel en respuestas significativas y fáciles de usar.

En general, la aplicación demuestra buenas prácticas en el manejo de errores, el registro y la comunicación con el usuario. Siempre es bueno guiar a los usuarios para que vuelvan a encaminarse, al igual que el sólido sistema de escritura de Java que aleja a los desarrolladores de posibles sorpresas en tiempo de ejecución, ¡a diferencia de las aventuras locas que podría tener con lenguajes de escritura dinámica como JavaScript! 😉🗺️

### Escenario 3: la clave API de Weatherstack no es correcta

**curl request:**

```bash
curl --location 'http://localhost:8080/weather?city=lisbon'
```

Para que la clave de API no sea válida, debe cambiarla en las variables ambientales de su configuración en ejecución.

**logs:**

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

**Interpretación de chatGPT:**

Esta entrada de registro proporciona información sobre un escenario de error en su aplicación, específicamente relacionado con una función de información meteorológica. Aquí hay un desglose de lo que está sucediendo:

1. **Manejo de solicitudes**: Se realiza una solicitud GET a `/weather` con la cadena de consulta `city=lisbon`. Esto indica que la aplicación tiene un punto final para proporcionar información meteorológica basada en el nombre de una ciudad.

2. **Registro de invocación de método**: `LoggingAspect` (un componente de programación orientada a aspectos (AOP)) registra las invocaciones de método en su aplicación. Primero, registra el método `WeatherController.getWeatherByCity(..)` con el argumento "lisboa". Luego, registra una llamada a `WeatherApi.currentGet(..)` con parámetros que incluyen una clave de acceso y la consulta "lisboa".

3. **Manejo de excepciones**: el registro muestra que se detectó una `DecodeException` de Feign (un cliente de servicio web declarativo). Esta excepción suele ocurrir cuando Feign no logra decodificar una respuesta HTTP.

4. **Manejo de excepciones personalizado**: Su aplicación parece tener un mecanismo de manejo de excepciones personalizado. Detecta la `DecodeException` y luego genera una `WeatherException`. Esta es una buena práctica, ya que encapsula las excepciones de la biblioteca externa en las excepciones específicas del dominio de su aplicación.

5. **Registro de errores**: Un mensaje de nivel de registro `ERROR` de `WeatherControllerAdvice` indica que se encontró una `WeatherException`, que no se debe a una solicitud incorrecta (HTTP 400). El código de error es 101 y sugiere consultar la documentación de la API en Weatherstack.com para obtener más detalles.

6. **Formación de respuesta**: Tanto `WeatherControllerAdvice.handle(..)` como `GlobalControllerAdvice.handle(..)` registran la formación de una respuesta HTTP 500 (Error interno del servidor). Esto sugiere una estrategia de manejo de excepciones centralizada en su aplicación, que es una práctica recomendada en las aplicaciones Spring.

7. **Resolución de excepciones**: `ExceptionHandlerExceptionResolver` advierte que se resolvió una `feign.codec.DecodeException`. Esto es parte del mecanismo de Spring para manejar excepciones y convertirlas en respuestas HTTP.

8. **Respuesta final**: `LogFilter` registra el estado de la respuesta HTTP final como 500, lo que indica que se devolvió al cliente un error interno del servidor.

**Interpretación y sugerencias**:

- El problema parece estar relacionado con la interacción con una API meteorológica externa. La `DecodeException` sugiere que la respuesta del servicio externo podría no estar en el formato esperado o que hay un problema en la configuración del cliente Feign.
- El código de error 101 puede proporcionar información más específica. Es una buena práctica dirigir a los desarrolladores a la documentación de la API para obtener referencias de códigos de error, como se hace en el registro.
- La aplicación transforma correctamente las excepciones de bajo nivel en excepciones específicas de dominio más significativas y las maneja de forma centralizada.
- El uso de AOP para registrar entradas y salidas de métodos es una forma limpia de mantener la preocupación por el registro separada de la lógica empresarial principal.

En resumen, deberá investigar la interacción con la API meteorológica, centrándose especialmente en el formato de respuesta y cómo se decodifica. No olvide consultar la documentación de la API meteorológica; a veces la respuesta está a un paso de distancia, a diferencia de Python, donde puedes sentirte como si estuvieras tratando de atrapar una serpiente por la cola. 🐍😉

### Escenario 4: No se proporciona ninguna ciudad

**curl request:**

```bash
curl --location 'http://localhost:8080/weather'
```

**Logs:**

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

**Interpretación de chatGPT:**
Esta entrada de registro resalta cómo su aplicación maneja un escenario en el que falta un parámetro de consulta requerido en una solicitud. Profundicemos en los detalles:

1. **Solicitud inicial**: se realiza una solicitud GET al punto final `/weather` sin ninguna cadena de consulta. Esto se indica mediante `QueryString: null` en el registro, capturado por `LogFilter`.

2. **Excepción de parámetro faltante**: `LoggingAspect` registra que se genera una `MissingServletRequestParameterException`. Esta es una excepción del marco Spring que indica que falta un parámetro de solicitud requerido (en este caso, 'ciudad'). Esta excepción es un indicador claro de que el punto final espera un parámetro de "ciudad", que no se proporcionó en la solicitud.

3. **Manejo de excepciones**: se invoca `GlobalControllerAdvice` para manejar esta excepción. El uso de un consejo de controlador global para el manejo de excepciones es una práctica recomendada en Spring, ya que permite el manejo centralizado de excepciones entre controladores.

4. **Respuesta de error**: `GlobalControllerAdvice` registra la construcción de una respuesta 400 Bad Request. La respuesta incluye una marca de tiempo, ID de sesión, el tipo de error ("MissingServletRequestParameterException"), un mensaje que indica el parámetro "ciudad" que falta y la ruta donde ocurrió el error. Esta respuesta de error detallada es útil para que los consumidores de API comprendan qué salió mal.

5. **Resolución de excepciones**: `ExceptionHandlerExceptionResolver` registra que se resolvió `MissingServletRequestParameterException`. Este componente en Spring MVC juega un papel crucial en el mapeo de excepciones a respuestas HTTP.

6. **Respuesta final del cliente**: `LogFilter` registra el estado de la respuesta final como 400 Solicitud incorrecta, lo que indica que la solicitud no se procesó debido a que faltaba un parámetro.

**Conclusiones clave**:

- Su aplicación identifica y maneja correctamente los casos en los que faltan los parámetros de consulta requeridos, proporcionando comentarios informativos al cliente.
- El manejo centralizado de excepciones mediante `GlobalControllerAdvice` gestiona eficientemente las excepciones y garantiza respuestas de error consistentes.
- El registro detallado tanto de la solicitud como de la respuesta es una práctica excelente, que proporciona visibilidad completa del comportamiento de la aplicación en estos escenarios.

En pocas palabras, la aplicación está bien configurada para guiar a los usuarios cuando pierden información requerida, un poco como el compilador de Java que lo empuja sobre variables faltantes: siempre está pendiente de usted, a diferencia de algunos lenguajes de tipo flexible en los que puede perderse en indefinidos. ¡territorio! 😉🗺️

## Próximos pasos

- Agregar algo de almacenamiento en caché para evitar llamadas exhaustivas a API de terceros: el clima no cambia cada segundo. Si solicitamos el clima para el mismo lugar varias veces en un período de tiempo muy corto, debemos almacenarlo en caché.
- Obtener artículos de noticias de mediastack.
