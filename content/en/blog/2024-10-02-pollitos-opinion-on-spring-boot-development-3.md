---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 3: Auto-Generated interfaces for Controller implementation"
date: 2024-10-02
description: "Auto-Generated interfaces for Controller implementation"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/5a2c3eb9e5652bdecea44c54f8f55f22.jpg
---

## Some context

This is the third part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

## Roadmap

1. More dependencies.
2. Write an OAS yaml file.
3. Generate the interfaces.
4. Implement the interfaces.

Let's start!

## 1. More dependencies

These are:

- [Swagger Core Jakarta](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta)
- [JsonNullable Jackson Module](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable)
- [Spring Boot Starter Validation](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation)

Here I leave some ready copy-paste for you. Consider double checking the latest version.

Under the \<dependencies\> tag:

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

## 2. Write an OAS yaml file

Here's the example I'm gonna be using for this blog series.

resources/openapi/post.yaml

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

## 3. Generate the interfaces

Add the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin) plugin.

Here I leave some ready copy-paste for you. Consider double checking the latest version.

Under the \<plugins\> tag:

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

Don't forget to put the name of the OAS file. It should look something like this
![Screenshot2024-10-02163218](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02163218.png)

Do a maven clean + compile. You should find logs similar to these:

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

If you check the target\generated-sources\openapi\ folder, you'll find everything that was generated. Those files represent the OAS we fed the plugin with.

![Screenshot2024-10-02165641](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02165641.png)

## 4. Implement the interfaces

Make the simple RestController located in the controller package implement the desired interface that was generated in the previous step.

Then in IntelliJ, if you press Ctrl+O while standing in the line that has the _implements_ statement, a pop up window will appear asking you which methods you'd like to override:

![Screenshot2024-10-02175532](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02175532.png)

Select the one that we are interested in, getUsers() that returns a ResponseEntity\<List\<User\>\>. IntelliJ will autofill the class. Now it looks something like this:

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

For now this is good enough, you'll replace the generated code with business code anyways later in development.

Now try [http://localhost:8080/user](http://localhost:8080/user). You should get the default response from the generated code, which is 501 NOT IMPLEMENTED

![Screenshot2024-10-02180748](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-3/Screenshot2024-10-02180748.png)

## Next lecture

If your microservice is not gonna consume a REST endpoint, then this is all you need.

But don't you have curiosity how to do that while following Contract-Driven Development best practices? I know you do. Follow this next lecture: [Pollito&rsquo;s Opinion on Spring Boot Development 4: Auto-Generated feignClient interfaces](/en/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-4)
