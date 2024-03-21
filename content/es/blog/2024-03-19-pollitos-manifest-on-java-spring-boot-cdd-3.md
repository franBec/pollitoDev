---
author: "Franco Becvort"
title: "Manifiesto de Pollito sobre el desarrollo basado en contratos de Java Spring Boot para microservicios 3"
date: 2024-03-19
description: "Consumer generation"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/miko.jpeg
---

Esta es una continuación de [Manifiesto de Pollito sobre el desarrollo basado en contratos de Java Spring Boot para microservicios 2](/es/blog/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2).

## springBootStarterTemplate -> feature/consumer-gen-example

[springBootStarterTemplate](https://github.com/franBec/springBootStarterTemplate) tiene tres ramas:

- [main](https://github.com/franBec/springBootStarterTemplate/tree/main): Satisface
  - _“Un microservicio cumple al menos con un contrato, desempeñando el rol de proveedor.”_
  - El escenario cero de "_Un microservicio puede desempeñar el papel de consumidor en cero, uno o muchos contratos_".
- [feature/provider-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/provider-gen-example): Un ejemplo de implementación de main
- [feature/consumer-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/consumer-gen-example): Una extensión de feature/provider-gen-example, que satisface todo lo indicado en main y además
  - Uno o varios escenarios de "_Un microservicio puede desempeñar el papel de consumidor en cero, uno o muchos contratos_".

Aquí explicaré los pasos que seguí para crear un ejemplo de feature/consumer-gen-example, para que puedas crear tu propio microservicio de proveedor + consumidor.

## Pasos para convertir tu microservicio en proveedor + consumidor

0. Primero, siga todos los pasos para convertir el microservicio en un proveedor.
1. Agregue dependencias específicas de generación de proveedores.

Luego, para cada contrato en el que el microservicio desempeñará el papel de consumidor, haga lo siguiente:

2. Agregue el archivo OAS en resources/openapi.
3. Agregue un bloque de ejecución en openapi-generator-maven-plugin.
4. Cree una nueva excepción.
5. Manejar la nueva excepción creada.
6. Cree un decodificador de errores que generará la excepción.
7. Cree el valor de URL correspondiente en application.yml.
8. Cree una clase @Configuration @ConfigurationProperties para leer el valor de application.yml.
9. Configure un cliente Feign para interactuar con la interfaz API del consumidor generada.
10. Cree un pointcut en LoggingAspect.

Creemos un ejemplo. Puede encontrarlo terminado en feature/consumer-gen-example

### 0. Primero, siga todos los pasos para convertir el microservicio en un proveedor

Para esto, comenzaré desde feature/provider-gen y seguiré los pasos para crear un microservicio de proveedor con este OAS simple llamado _animeinfo.yaml_.

### 1. Agregue dependencias específicas de generación de proveedores

- [javax.annotation » javax.annotation-api » 1.3.2](https://mvnrepository.com/artifact/javax.annotation/javax.annotation-api/1.3.2): Resuelve error package javax.annotation does not exist.
- [io.github.openfeign » feign-okhttp » 13.2.1](https://mvnrepository.com/artifact/io.github.openfeign/feign-okhttp/13.2.1): Resuelve error package feign.okhttp does not exist.
- [org.springframework.cloud » spring-cloud-starter-openfeign » 4.1.0](https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-openfeign/4.1.0): Solves error package feign.form does not exist.
- [io.github.openfeign » feign-jackson » 13.2.1](https://mvnrepository.com/artifact/io.github.openfeign/feign-jackson/13.2.1): Resuelve error package feign.jackson does not exist.
- [com.google.code.findbugs » jsr305 » 3.0.2](https://mvnrepository.com/artifact/com.google.code.findbugs/jsr305/3.0.2): Resuelve error cannot find symbol @javax.annotation.Nullable.
- [org.junit.jupiter » junit-jupiter-api » 5.10.2](https://mvnrepository.com/artifact/org.junit.jupiter/junit-jupiter-api/5.10.2): Resuelve error package org.junit.jupiter.api does not exist.

Además, deberá crear configuraciones para las interfaces de consumidor generadas. Eso se suele hacer con Gson:

- [io.github.openfeign » feign-gson » 13.2.1](https://mvnrepository.com/artifact/io.github.openfeign/feign-gson/13.2.1): Resuelve error Cannot resolve symbol 'GsonEncoder'.

Aquí está el fragmento pom.xml para que pueda copiarlo y pegarlo en la etiqueta de dependencias:

```xml
<dependency>
    <groupId>javax.annotation</groupId>
    <artifactId>javax.annotation-api</artifactId>
    <version>1.3.2</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
    <version>13.2.1</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>4.1.0</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-jackson</artifactId>
    <version>13.2.1</version>
</dependency>
<dependency>
    <groupId>com.google.code.findbugs</groupId>
    <artifactId>jsr305</artifactId>
    <version>3.0.2</version>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.10.2</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-gson</artifactId>
    <version>13.2.1</version>
</dependency>
```

### 2. Agregue el archivo OAS en resources/openapi

Aquí agregaré [jikan API](https://raw.githubusercontent.com/jikan-me/jikan-rest/master/storage/api-docs/api-docs.json), una API no oficial de [MyAnimeList](https://myanimelist.net/) .

### 3. Agregue un bloque de ejecución en openapi-generator-maven-plugin

Aquí está el bloque de ejecución listo para que lo copie y pegue.

```xml
<execution>
  <id>consumer generation - jikan</id>
  <goals>
    <goal>generate</goal>
  </goals>
  <configuration>
    <inputSpec>${project.basedir}/src/main/resources/openapi/jikan.json</inputSpec>
    <generatorName>java</generatorName>
    <library>feign</library>
    <output>${project.build.directory}/generated-sources/openapi/</output>
    <apiPackage>moe.jikan.api</apiPackage>
    <modelPackage>moe.jikan.models</modelPackage>
    <configOptions>
      <feignClient>true</feignClient>
      <interfaceOnly>true</interfaceOnly>
      <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
    </configOptions>
  </configuration>
</execution>
```

¿Cuáles son las diferencias entre una ejecución de generación de proveedor y una ejecución de generación de consumidor?

|                                | Provider Generation                                | Consumer Generation                                       |
| ------------------------------ | -------------------------------------------------- | --------------------------------------------------------- |
| **Propósito**                  | Generar server-side code.                          | Generar client-side code para interactuar con la API.     |
| **Nombre del generador**       | **spring** (optimizado para Spring Boot)           | **java** (generacion de código Java genérico)             |
| **Librería**                   | N/A (no especificada, Spring por defecto)          | **feign** (usa Feign library para HTTP requests)          |
| **Configuraciones especiales** | **useSpringBoot3**: Optimizado para Spring Boot 3. | **feignClient**: Genera interfaces que son Feign clients. |

Ejecutar y compilar.

En este ejemplo, se produce un error en la generación del consumidor: jikan. Aquí está el fragmento importante del mismo.

```
[INFO] --- openapi-generator-maven-plugin:7.2.0:generate (consumer generation - jikan) @ springBootStarterTemplate ---
[WARNING] C:\code\pollito\springBootStarterTemplate\src\main\resources\openapi\jikan.json [0:0]: unexpected error in Open-API generation
C:\code\pollito\springBootStarterTemplate\src\main\resources\openapi\jikan.json [0:0]: unexpected error in Open-API generation


org.openapitools.codegen.SpecValidationException: There were issues with the specification. The option can be disabled via validateSpec (Maven/Gradle) or --skip-validate-spec (CLI).
 | Error count: 3, Warning count: 7
Errors:
	-paths.'/anime'(get).parameters. There are duplicate parameter values
	-paths.'/manga'(get).parameters. There are duplicate parameter values
	-paths.'/schedules'(get).parameters. There are duplicate parameter values
Warnings:
	-paths.'/anime'(get).parameters. There are duplicate parameter values
	-paths.'/manga'(get).parameters. There are duplicate parameter values
	-paths.'/schedules'(get).parameters. There are duplicate parameter values

```

Por suerte es un error muy fácil de solucionar. Tenemos que eliminar esos valores de parámetros duplicados. Para eso importaré el archivo a [Swagger Editor](https://editor.swagger.io/) y lo editaré yo mismo.

Por alguna razón, la página solicita convertir a yaml, lo cual acepto. Podemos trabajar con cualquiera de esos formatos, al plugin no le importa.

![convert](/uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/Screenshot2024-03-19211441.png)

Además, mientras solucionaba el error, noté que hay documentación sobre cómo se ve un error, pero no hay un esquema de error, así que creo uno.

Reemplace el archivo e inténtelo nuevamente. Ahora deberíamos estar listos para comenzar.

### 4. Cree una nueva excepción

Si chequeamos la carpeta target/generated-sources/openapi, encontraremos dentro del paquete moe.jikan todas las diferentes API generadas.

![generated api clients](/uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/Screenshot2024-03-19212226.png)

Por suerte para nosotros, todas esas API producen el mismo error, por lo que podemos crear solo una excepción.

La excepción puede tener tantos campos como desee, pero como mínimo, debe tener el Error generado por la OAS correspondiente.

```java
@RequiredArgsConstructor
@Getter
public class JikanException extends RuntimeException {
  private final transient Error error;
}
```

Siempre verifique desde dónde se importa el error. Aquí lo queremos de _moe.jikan.models_

![import the correct error](/uploads/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3/Screenshot2024-03-19214453.png)

### 5. Manejar la nueva excepción creada

Puede utilizar el **GlobalControllerAdvice** ya existente o crear uno nuevo específicamente para el controlador que eventualmente invoca la interfaz del cliente API que puede generar un error.

Aquí crearé un nuevo @RestControllerAdvice como ejercicio.

Aquí puede manejar sus errores según sea necesario. Este es un ejemplo de cómo lo hago en este escenario. Voy a retornar:

- 404 NO ENCONTRADO cuando no se encuentra anime
- ERROR DEL SERVIDOR INTERNO 500 bajo cualquier otra circunstancia.

Siempre verifique desde dónde se importa el error. Aquí lo queremos de _dev.pollito.springbootstartertemplate.models_

```java
@RestControllerAdvice(assignableTypes = AnimeController.class)
public class AnimeControllerAdvice {

  @ExceptionHandler(JikanException.class)
  public static ResponseEntity<Error> handle(JikanException e) {
    if (isNotFound(e)) {
      return buildErrorResponse(HttpStatus.NOT_FOUND, e, e.getError().getMessage());
    }

    return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e, e.getError().getMessage());
  }

  private static boolean isNotFound(JikanException e) {
    return Objects.nonNull(e.getError().getStatus())
        && e.getError().getStatus() == HttpStatus.NOT_FOUND.value();
  }
}
```

### 6. Cree un decodificador de errores que generará la excepción

Este es un decodificador de errores muy básico y estándar, no sucede nada especial aquí.

Siempre verifique desde dónde se importa el error. Aquí lo queremos de _moe.jikan.models_

```java
public class JikanErrorDecoder implements ErrorDecoder {
  @Override
  public Exception decode(String s, Response response) {
    try (InputStream body = response.body().asInputStream()) {
      return new JikanException(new ObjectMapper().readValue(body, Error.class));
    } catch (IOException e) {
      return new Default().decode(s, response);
    }
  }
}
```

### 7. Cree el valor de URL correspondiente en application.yml

De forma predeterminada, la interfaz generada utilizará la URL en la sección del servidor de la OAS. Por lo general, en muchos escenarios, ese valor no existe, es una URL simulada o funciona pero apunta a un entorno de desarrollo o prueba.

Definir una URL de cliente en application.yml (o cualquier archivo de configuración externo) en lugar de codificarla como una constante en su código es una práctica recomendada común por varias razones:

- **Flexibilidad del entorno:** En las aplicaciones del mundo real, a menudo hay diferentes entornos, como desarrollo, pruebas, preparación y producción. Cada uno de estos entornos puede requerir configuraciones diferentes, incluidas diferentes URL de cliente. La externalización de estos valores a un archivo de configuración como application.yml facilita cambiarlos por entorno sin cambiar el código base.
- **Facilidad de mantenimiento:** Cuando es probable que un valor cambie con el tiempo, mantenerlo en un archivo de configuración significa que puede actualizarlo sin tener que volver a compilar su código. Esto es especialmente útil para las URL, que pueden cambiar debido a nuevas implementaciones, migraciones de servicios o cambios de dominio.
- **Seguridad:** Codificar información confidencial, como URL de sistemas o servicios internos, en el código fuente puede representar un riesgo de seguridad, especialmente si el código se almacena en un repositorio público o compartido. Mantener dicha información en archivos de configuración externos ayuda a proteger los datos confidenciales, especialmente cuando se combina con herramientas de administración de configuración que admiten el cifrado de dichas propiedades.
- **Separación de preocupaciones:** Al mantener la configuración separada del código, mantiene una clara separación de preocupaciones. El código define el comportamiento, mientras que la configuración especifica los parámetros específicos del entorno. Esto se adhiere a los principios [Twelve-Factor](https://12factor.net/), mejorando la modularidad y la mantenibilidad.
- **Configuración dinámica:** El uso de configuraciones externas permite realizar cambios dinámicos sin la necesidad de una nueva implementación. Algunos marcos y plataformas admiten la actualización de propiedades de configuración sobre la marcha, lo que puede ser increíblemente útil para alternar funciones, ajustar niveles de registro o actualizar URL sin tiempo de inactividad.
- **Colaboración y accesibilidad:** Los desarrolladores, los equipos de operaciones y, a veces, incluso las herramientas de implementación automatizadas pueden necesitar acceso a estas configuraciones para ajustar el comportamiento de las aplicaciones en diferentes entornos. Tenerlos externalizados en application.yml hace que este proceso sea más accesible y colaborativo.

Para este ejemplo, la definición de URL de application.yml se vería así:

```yaml
jikan:
  baseUrl: https://api.jikan.moe/v4
```

### 8. Cree una clase @Configuration @ConfigurationProperties para leer el valor de application.yml

Esta clase lee valores de application.yml. A continuación se muestra un ejemplo de implementación.

```java
@Configuration
@ConfigurationProperties(prefix = "jikan")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JikanProperties {
  String baseUrl;
}
```

### 9. Configure un cliente Feign para interactuar con la interfaz API del consumidor generada

Esta clase configura un cliente Feign para interactuar con la interfaz API del consumidor generada, completa con serialización personalizada, deserialización, registro y manejo de errores.

A continuación se muestra un ejemplo de implementación:

```java
@Configuration
@ComponentScans(
        value = {
                @ComponentScan(
                        basePackages = {
                                "moe.jikan.api",
                        })
        })
@RequiredArgsConstructor
public class AnimeApiConfig {

  private final JikanProperties jikanProperties;

  @Bean
  public AnimeApi jikanApi() {
    return Feign.builder()
            .client(new OkHttpClient())
            .encoder(new GsonEncoder())
            .decoder(new GsonDecoder())
            .errorDecoder(new JikanErrorDecoder())
            .logger(new Slf4jLogger(AnimeApi.class))
            .logLevel(Logger.Level.FULL)
            .target(AnimeApi.class, jikanProperties.getBaseUrl());
  }
}
```

### 10. Cree un pointcut en LoggingAspect

Es una buena práctica registrar todo lo que entra y sale de una llamada API. Tenga cuidado, puede registrar accidentalmente información sensible.

Aquí creo jikanApiMethodsPointcut() y lo agrego a los métodos logBefore() y logAfterReturning().

```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {

  @Pointcut("execution(public * dev.pollito.springbootstartertemplate.controller..*.*(..))")
  public void controllerPublicMethodsPointcut() {}

  @Pointcut("execution(public * moe.jikan.api.*.*(..))")
  public void jikanApiMethodsPointcut() {}

  @Before("controllerPublicMethodsPointcut() || jikanApiMethodsPointcut()")
  public void logBefore(JoinPoint joinPoint) {
    log.info(
        "["
            + joinPoint.getSignature().toShortString()
            + "] Args: "
            + Arrays.toString(joinPoint.getArgs()));
  }

  @AfterReturning(
      pointcut = "controllerPublicMethodsPointcut() || jikanApiMethodsPointcut()",
      returning = "result")
  public void logAfterReturning(JoinPoint joinPoint, Object result) {
    log.info("[" + joinPoint.getSignature().toShortString() + "] Response: " + result);
  }
}
```

## Terminemos el ejemplo juntando todo con lógica de negocios.

1. Cree una interfaz de mapeador.
2. Cree una interfaz de servicio.
3. Implementar la interfaz.
4. Inyecte la interfaz en el controlador.

### 1. Cree una interfaz de mapeador

```java
@Mapper(componentModel = "spring")
public interface AnimeInfoMapper {

  @Mapping(source = "response.data.completed", target = "viewers")
  AnimeStatisticsViewers map(AnimeStatistics response);
}
```

### 2. Cree una interfaz de servicio

```java
public interface AnimeInfoService {
    AnimeStatisticsViewers getAnimeInfo(Integer id);
}
```

### 3. Implementar la interfaz

```java
@Service
@RequiredArgsConstructor
public class AnimeInfoServiceImpl implements AnimeInfoService {
    private final AnimeApi animeApi;
    private final AnimeInfoMapper animeInfoMapper;

    @Override
    public AnimeStatisticsViewers getAnimeInfo(Integer id) {
        return animeInfoMapper.map(animeApi.getAnimeStatistics(id));
    }
}
```

### 4. Inyecte la interfaz en el controlador

```java
@RestController
@RequiredArgsConstructor
public class AnimeInfoController implements AnimeApi {
  private final AnimeInfoService animeInfoService;

  @Override
  public ResponseEntity<AnimeStatisticsViewers> getAnimeStatisticsViewers(Integer id) {
    return ResponseEntity.ok(animeInfoService.getAnimeStatisticsViewers(id));
  }
}
```

### Pruébalo

```shell
curl --location 'http://localhost:8080/anime?id=846'
```

Response:

```json
{
  "viewers": 119259
}
```

Obtenemos esto en los registros.

```
2024-03-21 09:29:44 INFO  o.a.c.c.C.[Tomcat].[localhost].[/] [SessionID: ] - Initializing Spring DispatcherServlet 'dispatcherServlet'
2024-03-21 09:29:44 INFO  o.s.web.servlet.DispatcherServlet [SessionID: ] - Initializing Servlet 'dispatcherServlet'
2024-03-21 09:29:44 INFO  o.s.web.servlet.DispatcherServlet [SessionID: ] - Completed initialization in 1 ms
2024-03-21 09:29:44 INFO  d.p.s.filter.LogFilter [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - >>>> Method: GET; URI: /anime; QueryString: id=846; Headers: {user-agent: PostmanRuntime/7.37.0, accept: */*, cache-control: no-cache, postman-token: 4dbf0736-7574-4c38-b034-e8411d6928ad, host: localhost:8080, accept-encoding: gzip, deflate, br, connection: keep-alive}
2024-03-21 09:29:44 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeController.getAnimeStatisticsViewers(..)] Args: [846]
2024-03-21 09:29:44 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeApi.getAnimeStatistics(..)] Args: [846]
2024-03-21 09:29:46 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeApi.getAnimeStatistics(..)] Response: class AnimeStatistics {
    data: class AnimeStatisticsData {
        watching: 5048
        completed: 119259
        onHold: null
        dropped: 3390
        planToWatch: null
        total: 161889
        scores: [class AnimeStatisticsDataScoresInner {
            score: 1
            votes: 287
            percentage: 0.3
        }, class AnimeStatisticsDataScoresInner {
            score: 2
            votes: 158
            percentage: 0.2
        }, class AnimeStatisticsDataScoresInner {
            score: 3
            votes: 323
            percentage: 0.4
        }, class AnimeStatisticsDataScoresInner {
            score: 4
            votes: 854
            percentage: 0.9
        }, class AnimeStatisticsDataScoresInner {
            score: 5
            votes: 2631
            percentage: 2.9
        }, class AnimeStatisticsDataScoresInner {
            score: 6
            votes: 6871
            percentage: 7.5
        }, class AnimeStatisticsDataScoresInner {
            score: 7
            votes: 19052
            percentage: 20.8
        }, class AnimeStatisticsDataScoresInner {
            score: 8
            votes: 28533
            percentage: 31.1
        }, class AnimeStatisticsDataScoresInner {
            score: 9
            votes: 20183
            percentage: 22.0
        }, class AnimeStatisticsDataScoresInner {
            score: 10
            votes: 12904
            percentage: 14.1
        }]
    }
}
2024-03-21 09:29:46 INFO  d.p.s.aspect.LoggingAspect [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - [AnimeController.getAnimeStatisticsViewers(..)] Response: <200 OK OK,class AnimeStatisticsViewers {
    viewers: 119259
},[]>
2024-03-21 09:29:46 INFO  d.p.s.filter.LogFilter [SessionID: 2669c0a9-0f1e-45c9-8b60-517ec190d4c8] - <<<< Response Status: 200
```
