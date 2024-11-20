---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 7.5: El Devsu Lab episode"
date: 2024-10-30
description: "Desarrollo impulsado por contratos 102"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Untitled-2024-10-30-1828.png
---
<!-- TOC -->
  * [Introducción](#introducción)
  * [¡Oh, no! No estuve cuando se llevó a cabo el lab Contract Driven Development 101](#oh-no-no-estuve-cuando-se-llevó-a-cabo-el-lab-contract-driven-development-101)
  * [Estructura del proyecto](#estructura-del-proyecto)
  * [Base de datos MsSQL mockeada en memoria](#base-de-datos-mssql-mockeada-en-memoria)
  * [Endpoints](#endpoints)
  * [Observabilidad](#observabilidad)
    * [@Aspect](#aspect)
    * [Implementación de Filter](#implementación-de-filter)
    * [Micrometer](#micrometer)
  * [Normalización de errores](#normalización-de-errores)
  * [Lógica de negocio](#lógica-de-negocio)
    * [JpaRepository](#jparepository)
    * [@Service](#service)
  * [Algo de tests unitarios porque si](#algo-de-tests-unitarios-porque-si)
    * [Mutation testing](#mutation-testing)
    * [Generar un reporte](#generar-un-reporte)
  * [Deployment](#deployment)
  * [Bonus: colección de Postman](#bonus-colección-de-postman)
  * [Próxima lectura](#próxima-lectura)
<!-- TOC -->

## Introducción

Bienvenido a **"Desarrollo impulsado por contratos 102"**, la séptima y media entrega de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

**Para quienes llegan desde Devsu Lab**, soy [Pollito](/es/page/about), su anfitrión y compañero desarrollador de Java Spring Boot. Este blog en particular complementa las ideas explicadas en la sesión de lab, como contenido de apoyo de lo que exploramos juntos.

**Si no eres de Devsu Lab** Esta será una versión .zip de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/) partes 0 a 3, y luego, en lugar de usar interfaces feignClient, se usará una base de datos en memoria.

Aquí hay un poco de background:

- [Devsu](https://devsu.com/), la empresa en la que trabajo, organiza eventos al estilo de "TED talk" llamados Devsu Labs. Estas sesiones están diseñadas para compartir conocimientos y habilidades útiles con otros desarrolladores.
- Aquí, junto con [Jorge](https://www.linkedin.com/in/jorge-v%C3%A1zquez-mendoza/), estamos ampliando esa experiencia desglosando los conceptos en un formato que puedes volver a consultar en cualquier momento.

¡Empecemos!

## ¡Oh, no! No estuve cuando se llevó a cabo el lab Contract Driven Development 101

Este es el "Desarrollo impulsado por contratos 102". Si te perdiste nuestro primer laboratorio, es básicamente [La opinión de Pollito acerca del desarrollo en Spring Boot 1: Desarrollo impulsado por contratos](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-1).

En pocas palabras...

> No escribas DTOs, declara lo que el microservicio espera y devuelve.

~ Pollito 2024

## Estructura del proyecto

Para poner en práctica los conceptos, nos sumergiremos en un proyecto en el que ya se han implementado los principios del desarrollo impulsado por contratos.

Puedes encontrar el proyecto en [el siguiente repositorio de GitHub](https://github.com/franBec/user_manager_backend).

El proyecto es un microservicio Spring Boot simple con...
- Base de datos MsSQL mockeada en memoria.
- Endpoints:
  - /users: obtener una lista de todos los usuarios.
  - /users/{id}: obtener el usuario por matching ID.
- Mejores prácticas.
- Lógica de negocio.

![Untitled-2024-10-30-2236](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Untitled-2024-10-30-2236.png)

## Base de datos MsSQL mockeada en memoria
Realizar una configuración real de SQL Server es demasiado para un ejemplo simple. ¡[H2](https://www.h2database.com/html/main.html) viene al rescate! Es un motor de base de datos liviano y en memoria (cuando se detiene la aplicación, los datos desaparecen).

Así es como funciona:

1. Cree algunas [clases de entidades](https://github.com/franBec/user_manager_backend/tree/main/src/main/java/dev/pollito/user_manager_backend/entity): estas son su representación de las tablas de la base de datos en su código de negocio.
![Screenshot2024-10-31200319](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31200319.png)
2. En un archivo [data.sql](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/data.sql), escriba las consultas INSERT INTO que llenarán las tablas con datos simulados.
![Screenshot2024-10-31211225](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31211225.png)
3. Agregue properties en [application.yml](https://github.com/franBec/post/blob/feature/devsu-lab/src/main/resources/application.yml).
![Screenshot2024-10-31211757](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31211757.png)
4. Dependencias en [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml).
   - [Microsoft JDBC Driver For SQL Server](https://mvnrepository.com/artifact/com.microsoft.sqlserver/mssql-jdbc)
   - [H2 Database Engine](https://mvnrepository.com/artifact/com.h2database/h2)
![Screenshot2024-10-31214058](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31214058.png)

¿Por qué Microsoft SQL Server? Porque es la base a la que estoy más acostumbrado. Podría haber sido cualquier base de datos SQL, estoy bastante seguro de que H2 es independiente de la base de datos.

## Endpoints
1. Declarar los endpoints, inputs y outputs esperados en un [archivo yaml OAS](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/openapi/userManagerBackend.yaml).
2. En el [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml), agregue el [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin) y sus dependencias requeridas:
   - [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
   - [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
   - [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Asegúrese de que la etiqueta \<inputSpec\> apunte a su archivo yaml OAS.
![Screenshot2024-10-31221800](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31221800.png)
![Screenshot2024-10-31223703](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-31223703.png)

3. Maven clean.
4. Maven compile.
5. Cree una [clase @RestController](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/controller/UsersController.java) que implemente la interfaz spring server generada.

![Screenshot2024-11-09162725](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-09162725.png)

## Observabilidad
Sepa qué, cuándo y dónde suceden las cosas en su código.

Teniendo en cuenta que no nos importa imprimir accidentalmente información confidencial (claves, contraseñas, etc.), me resulta útil loguear:

- Todo lo que entra.
- Todo lo que sale.

### @Aspect
Una [clase @Aspect](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/aspect/LogAspect.java) que realize logs antes y después de la ejecución de métodos de controller públicos. 
  - Se necesita la dependencia [AspectJ Tools (Compiler)](https://mvnrepository.com/artifact/org.aspectj/aspectjtools)

![Screenshot2024-11-15203446](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15203446.png)
![Screenshot2024-11-15223105](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15223105.png)

### Implementación de Filter
Una [implementación de Filter](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/filter/LogFilter.java) que realice log de todo aquello que no necesariamente llegue a los controllers.
  - Necesita ser registrado con una [clase de configuración](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/config/LogFilterConfig.java)

![Screenshot2024-11-15224006](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-15224006.png)
![Screenshot2024-11-18121011](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18121011.png)
### Micrometer

- Dependencias de micrometer para tracing:
  - [Micrometer Observation](https://mvnrepository.com/artifact/io.micrometer/micrometer-observation)
  - [Micrometer Tracing Bridge OTel](https://mvnrepository.com/artifact/io.micrometer/micrometer-tracing-bridge-otel)

![Screenshot2024-11-18122150](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18122150.png)

Todos los logs tendrán un UUID asociado. Cada solicitud que ingrese a este microservicio tendrá un número diferente, de modo que podamos diferenciar lo que sucede en caso de que aparezcan varias solicitudes al mismo tiempo y los logs comiencen a mezclarse entre sí.

## Normalización de errores

Una de las cosas más molestas al consumir un microservicio es que los errores que devuelve no son consistentes. En el trabajo me encuentro con muchos escenarios como:

service.com/users/-1 returns

```json
{
  "errorDescription": "User not found",
  "cause": "BAD REQUEST"
}
```

pero service.com/product/-1 retorna

```json
{
  "message": "not found",
  "error": 404
}
```

En estos casos la consistencia son los amigos que hicimos en el camino (y peor cuando los errores están escondidos detras de 200OK).

No queremos ser ese tipo de programadores. Vamos a gestionar los errores de forma adecuada con [@RestControllerAdvice](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/controller/advice/GlobalControllerAdvice.java).

![Screenshot2024-11-18123008](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18123008.png)

A partir de ahora, todos los errores que devuelve este microservicio tienen la siguiente estructura:
![Screenshot2024-10-02130952](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-10-02130952.png)

## Lógica de negocio

Ahora viene la parte fácil, juntar todo.

Lo más difícil será el `parámetro q` en GET /users:
![Screenshot2024-11-18130040](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18130040.png)

### JpaRepository

Usualmente con [crear una interfaz que extiende JpaRepository](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/repository/UserRepository.java) es suficiente. Pero en este caso específico, tenemos que hacer una consulta interesante con el `parámetro q` en GET /users. Para ello, vamos a utilizar `@Query`.

![Screenshot2024-11-18154110](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18154110.png)

### @Service

Cree una [interfaz Service](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/service/UsersService.java) e [impleméntela](https://github.com/franBec/user_manager_backend/blob/main/src/main/java/dev/pollito/user_manager_backend/service/impl/UsersServiceImpl.java). Aquí se encuentra la lógica de negocio.

En la implementación:
- Inyecte el repositorio para poder consultar la base de datos.
- Inyecte un mapper para que todo esté listo para que el controller retorne.

![Screenshot2024-11-18163405](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18163405.png)

## Algo de tests unitarios porque si

En lo que respecta a [unit testing](https://en.wikipedia.org/wiki/Unit_testing), esta es mi recomendación:

- Realice unit testing en:
    - El controller package.
    - El service package.
    - El util package, si existe, debe estar cubierto indirectamente por las otras pruebas unitarias.
    - Todo lo demás se puede ignorar.
- El código que se está testeando, debe tener:
    - Más del 70 % de line coverage.
    - Más del 60 % de mutation coverage.

### Mutation testing

¿Qué significa "Más del 60 % de mutation coverage"? ¿Qué es la prueba de mutación? [Pitest](https://pitest.org/) la define como:

> Las pruebas de mutación son conceptualmente bastante simples. Los errores (o mutaciones) se introducen automáticamente en el código y luego se ejecutan las pruebas. Si las pruebas fallan, la mutación se elimina; si las pruebas pasan, la mutación sigue viva. La calidad de las pruebas se puede medir a partir del porcentaje de mutaciones eliminadas.

Para obtener esta métrica, utilizamos estos plugins:

- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

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
        <!--https://pitest.org/quickstart/mutators/ “STRONGER” group-->
        <mutators>
            <mutator>CONDITIONALS_BOUNDARY</mutator>
            <mutator>INCREMENTS</mutator>
            <mutator>INVERT_NEGS</mutator>
            <mutator>MATH</mutator>
            <mutator>NEGATE_CONDITIONALS</mutator>
            <mutator>VOID_METHOD_CALLS</mutator>
            <mutator>EMPTY_RETURNS</mutator>
            <mutator>FALSE_RETURNS</mutator>
            <mutator>TRUE_RETURNS</mutator>
            <mutator>NULL_RETURNS</mutator>
            <mutator>PRIMITIVE_RETURNS</mutator>
            <mutator>REMOVE_CONDITIONALS_EQUAL_ELSE</mutator>
            <mutator>EXPERIMENTAL_SWITCH</mutator>
        </mutators>
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
### Generar un reporte

Después de escribir las pruebas unitarias, es hora de ver qué tan buenas son esas pruebas. Para eso, ejecute `pitest:mutationCoverage`

Deberías encontrar en target/pit-reports un index.html, ese es el reporte.
![Screenshot2024-11-18185317](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18185317.png)

Ábrelo en tu navegador favorito y explora más a fondo cada clase si es necesario.

![Screenshot2024-11-18185643](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18185643.png)

## Deployment

Tan simple como:

1. Crear un [Dockerfile](https://github.com/franBec/user_manager_backend/blob/main/Dockerfile)
2. Deploy donde sea que un Dockerfile pueda ser deploy (Elegí [render](https://render.com/) free tier)

La parte complicada fue crear el Dockerfile. Hice el mío basándome en el blog de Ramanamuttana [&ldquo;Build a Docker Image using Maven and Spring boot&rdquo;](https://medium.com/@ramanamuttana/build-a-docker-image-using-maven-and-spring-boot-418e24c00776).

Este es el resultado final:

![screencapture-dashboard-render-web-srv-cstpigi3esus73e2i2dg-logs-2024-11-18-20_01_02](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/screencapture-dashboard-render-web-srv-cstpigi3esus73e2i2dg-logs-2024-11-18-20_01_02.png)

## Bonus: colección de Postman

Aquí tienes un buen tip: crea una colección de Postman

1. Copia todo el [archivo OAS .yaml](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/openapi/userManagerBackend.yaml) (CTRL+C).
2. Postman -> Import -> paste (CTRL+V)

![Screenshot2024-11-18200759](/uploads/2024-10-30-pollitos-opinion-on-spring-boot-development-7-5/Screenshot2024-11-18200759.png)

Reemplace la variable `baseUrl` con `https://user-manager-backend-den3.onrender.com` y ya estás listo para usar mi versión productiva.
- Puede tener un primer request muy largo (hasta un minuto o incluso más), porque estoy usando un free tier en mi implementación, por lo que es posible que la instancia se haya desactivado.

## Próxima lectura

Sí, hay más...