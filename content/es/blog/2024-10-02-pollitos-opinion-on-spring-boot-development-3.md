---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 3: Interfaces Spring server"
date: 2024-10-02
description: "Interfaces Spring server"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/5a2c3eb9e5652bdecea44c54f8f55f22.jpg
---

## Un poco de contexto

Esta es la tercera parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

## Roadmap

1. Más dependencias.
2. Escribir un archivo OAS yaml.
3. Generar las interfaces.
4. Implementar las interfaces.

¡Comencemos!

## 1. Más dependencias

Estas son:

- [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
- [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
- [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dento del tag \<dependencies\>:

```xml
<dependency>
    <groupId>io.swagger.core.v3</groupId>
    <artifactId>swagger-core-jakarta</artifactId>
    <version>2.2.22</version>
</dependency>
<dependency>
    <groupId>org.openapitools</groupId>
    <artifactId>jackson-databind-nullable</artifactId>
    <version>0.2.6</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## 2. Escribir un archivo OAS yaml

Este es el ejemplo que usaré para esta serie de blogs.

_resources/openapi/post.yaml_

```yaml
openapi: 3.0.3
info:
  title: post - Pollito Opinionated Spring-Boot Template
  description: Example of a Spring Boot 3 project with various practices that Pollito thinks are good
  version: 1.0.0
  contact:
    name: Pollito
    url: https://pollitodev.netlify.app/
servers:
  - url: "http://localhost:8080"
paths:
  /user:
    get:
      tags:
        - User
      operationId: getUsers
      summary: Get list of all users
      responses:
        "200":
          description: List of all users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/User"
        default:
          description: Error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    Address:
      description: User address
      properties:
        city:
          description: Address city
          example: "Gwenborough"
          type: string
        geo:
          $ref: "#/components/schemas/Geo"
        street:
          description: Address street
          example: "Kulas Light"
          type: string
        suite:
          description: Address suit
          example: "Apt. 556"
          type: string
        zipcode:
          description: Adress zipcode
          example: "92998-3874"
          type: string
      type: object
    Company:
      description: User company
      properties:
        bs:
          description: Company business
          example: "harness real-time e-markets"
          type: string
        catchPhrase:
          description: Company catch phrase
          example: "Multi-layered client-server neural-net"
          type: string
        name:
          description: Company name
          example: "Romaguera-Crona"
          type: string
      type: object
    Error:
      properties:
        detail:
          description: Description of the problem.
          example: No value present
          type: string
        instance:
          description: The endpoint where the problem was encountered.
          example: "/generate"
          type: string
        status:
          description: http status code
          example: 500
          type: integer
        title:
          description: A short headline of the problem.
          example: "NoSuchElementException"
          type: string
        timestamp:
          description: ISO 8601 Date.
          example: "2024-01-04T15:30:00Z"
          type: string
        trace:
          description: opentelemetry TraceID, a unique identifier.
          example: "0c6a41e22fe6478cc391908406ca9b8d"
          type: string
        type:
          description: used to point the client to documentation where it is explained clearly what happened and why.
          example: "about:blank"
          type: string
      type: object
    Geo:
      description: Address geolocalization
      properties:
        lat:
          description: Geolocalization latitude
          example: "-37.3159"
          type: string
        lng:
          description: Geolocalization longitude
          example: "81.1496"
          type: string
      type: object
    User:
      properties:
        address:
          $ref: "#/components/schemas/Address"
        company:
          $ref: "#/components/schemas/Company"
        email:
          description: User email
          example: "Sincere@april.biz"
          type: string
        id:
          description: User id
          example: 1
          type: integer
        name:
          description: User name
          example: "Leanne Graham"
          type: string
        phone:
          description: User phone
          example: "1-770-736-8031 x56442"
          type: string
        username:
          description: User username
          example: "Bret"
          type: string
        website:
          description: User website
          example: "hildegard.org"
          type: string
      type: object
```

## 3. Generar las interfaces

Agregue el plugin [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dento del tag \<plugins\>:

```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>7.8.0</version>
    <executions>
        <execution>
            <id>spring (server) generation - <!-- todo: replace with the name of the OAS file -->.yaml</id>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <inputSpec>${project.basedir}/src/main/resources/openapi/<!-- todo: replace with the name of the OAS file -->.yaml</inputSpec>
                <generatorName>spring</generatorName>
                <output>${project.build.directory}/generated-sources/openapi/</output>
                <apiPackage>${project.groupId}.${project.artifactId}.api</apiPackage>
                <modelPackage>${project.groupId}.${project.artifactId}.model</modelPackage>
                <configOptions>
                    <interfaceOnly>true</interfaceOnly>
                    <skipOperationExample>true</skipOperationExample>
                    <useSpringBoot3>true</useSpringBoot3>
                    <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
                </configOptions>
            </configuration>
        </execution>
    </executions>
</plugin>
```

No olvides poner el nombre del archivo OAS. Debería verse así:
![Screenshot2024-10-02163218](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02163218.png)

Haga una maven clean and compile. Debería encontrar logs similares a estos:

```log
C:\Users\franb\.jdks\openjdk-21.0.1\bin\java.exe -Dmaven.multiModuleProjectDirectory=C:\code\pollito\post "-Dmaven.home=C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3" "-Dclassworlds.conf=C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3\bin\m2.conf" "-Dmaven.ext.class.path=C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven-event-listener.jar" "-javaagent:C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\lib\idea_rt.jar=58471:C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\bin" -Dfile.encoding=UTF-8 -classpath "C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3\boot\plexus-classworlds-2.6.0.jar;C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3\boot\plexus-classworlds.license" org.codehaus.classworlds.Launcher -Didea.version=2021.3.2 compile
[INFO] Scanning for projects...
[INFO]
[INFO] --------------------------< dev.pollito:post >--------------------------
[INFO] Building post 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- openapi-generator-maven-plugin:7.8.0:generate (spring (server) generation - post.yaml) @ post ---
[INFO] Generating with dryRun=false
[INFO] Output directory (C:\code\pollito\post\target\generated-sources\openapi) does not exist, or is inaccessible. No file (.openapi-generator-ignore) will be evaluated.
[INFO] OpenAPI Generator: spring (server)
[INFO] Generator 'spring' is considered stable.
[INFO] ----------------------------------
[INFO] Environment variable JAVA_POST_PROCESS_FILE not defined so the Java code may not be properly formatted. To define it, try 'export JAVA_POST_PROCESS_FILE="/usr/local/bin/clang-format -i"' (Linux/Mac)
[INFO] NOTE: To enable file post-processing, 'enablePostProcessFile' must be set to `true` (--enable-post-process-file for CLI).
[INFO] Invoker Package Name, originally not set, is now derived from api package name: dev.pollito.post
[INFO] Processing operation getUsers
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\model\Address.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\model\Company.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\model\Error.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\model\Geo.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\model\User.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\api\UserApi.java
[INFO] Skipping generation of Webhooks.
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\pom.xml
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\README.md
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\dev\pollito\post\api\ApiUtil.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator-ignore
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator\VERSION
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator\FILES
################################################################################
# Thanks for using OpenAPI Generator.                                          #
# Please consider donation to help us maintain this project ?                 #
# https://opencollective.com/openapi_generator/donate                          #
################################################################################
[INFO]
[INFO] --- fmt-maven-plugin:2.24:format (default) @ post ---
[info] Processed 7 files (0 reformatted).
[INFO]
[INFO] --- maven-resources-plugin:3.3.1:resources (default-resources) @ post ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO]
[INFO] --- maven-compiler-plugin:3.13.0:compile (default-compile) @ post ---
[INFO] Recompiling the module because of changed source code.
[INFO] Compiling 13 source files with javac [debug parameters release 21] to target\classes
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  8.754 s
[INFO] Finished at: 2024-10-02T16:44:05+01:00
[INFO] ------------------------------------------------------------------------

Process finished with exit code 0
```

Si revisas la carpeta target\generated-sources\openapi\, encontrarás todo lo que se generó. Esos archivos representan el OAS con el que alimentamos el plugin.
![Screenshot2024-10-02165641](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02165641.png)

## 4. Implementar las interfaces

Haga que el @RestController simple ubicado en el paquete del controlador implemente la interfaz deseada que se generó en el paso anterior.

Luego, en IntelliJ, si presiona Ctrl+O mientras se encuentra en la línea que tiene la declaración _implements_, aparecerá una ventana emergente que le preguntará qué métodos desea sobreescribir:

![Screenshot2024-10-02175532](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02175532.png)

Seleccionamos el que nos interesa, getUsers() que devuelve una ResponseEntity\<List\<User\>\>. IntelliJ completará automáticamente la clase. Ahora se ve algo así:

_controller/UserController.java_

```java
import dev.pollito.post.api.UserApi;
import dev.pollito.post.model.User;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController implements UserApi {
  @Override
  public ResponseEntity<List<User>> getUsers() {
    return UserApi.super.getUsers();
  }
}
```

Ahora pruebe [http://localhost:8080/user](http://localhost:8080/user). Deberías obtener la respuesta predeterminada del código generado, que es 501 NO IMPLEMENTED:

![Screenshot2024-10-02180748](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02180748.png)

## Siguiente lectura

Si su microservicio no va a consumir un endpoint REST, esto es todo lo que necesita.

Pero ¿no tienes curiosidad por saber cómo hacerlo siguiendo las mejores prácticas de desarrollo basado en contratos? Sé que sí. Sigue esta próxima lección: [La opinión de Pollito acerca del desarrollo en Spring Boot 3: Interfaces feignClient](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-4)
