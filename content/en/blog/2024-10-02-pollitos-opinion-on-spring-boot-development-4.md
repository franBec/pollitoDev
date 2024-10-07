---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 4: feignClient interfaces"
date: 2024-10-02
description: "feignClient interfaces"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/kaguya-season-3-ai-hayasaka-character-visual.jpg
---

## Some context

This is the fourth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

## Roadmap

1. More dependencies.
2. Write an OAS yaml file.
3. Generate the interfaces.

## 1. More dependencies

These are:

- [Jakarta Annotations API](https://mvnrepository.com/artifact/jakarta.annotation/jakarta.annotation-api)
- [Spring Cloud Starter OpenFeign](https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-openfeign)
- [Feign OkHttp](https://mvnrepository.com/artifact/io.github.openfeign/feign-okhttp)
- [Feign Jackson](https://mvnrepository.com/artifact/io.github.openfeign/feign-jackson)
- [Feign Gson](https://mvnrepository.com/artifact/io.github.openfeign/feign-gson)
- [JUnit Jupiter API](https://mvnrepository.com/artifact/org.junit.jupiter/junit-jupiter-api)

Here I leave some ready copy-paste for you. Consider double checking the latest version.

Under the \<dependencies\> tag:

```xml
<dependency>
    <groupId>jakarta.annotation</groupId>
    <artifactId>jakarta.annotation-api</artifactId>
    <version>3.0.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>4.1.3</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
    <version>13.4</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-jackson</artifactId>
    <version>13.4</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-gson</artifactId>
    <version>13.4</version>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.11.1</version>
</dependency>
```

## 2. Write an OAS yaml file

Sometimes you'll get lucky and find that the REST endpoint you want to consume already has an available OAS. But in case it doesn't, you'll have to write a representation of what to expect from it.

For this scenario, I'm gonna be using the /users from [{JSON} Placeholder](https://jsonplaceholder.typicode.com/) to get fake data about users. I was not able to find a OAS of it, so I made my own.

resources/openapi/jsonplaceholder.yaml

```yaml
openapi: 3.0.3
info:
  version: 1.0.0
  title: JSON Placeholder API
  description: See https://jsonplaceholder.typicode.com/
servers:
  - url: "https://jsonplaceholder.typicode.com/"
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
                type: object
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

## 3. Generate the interfaces.

Add a new execution task to the [openapi-generator-maven-plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin).

Here I leave some ready copy-paste for you.

```xml
<execution>
  <id>java (client) generation - <!-- todo: replace with the name of the OAS file -->.yaml</id>
  <goals>
      <goal>generate</goal>
  </goals>
  <configuration>
      <inputSpec>${project.basedir}/src/main/resources/openapi/<!-- todo: replace with the name of the OAS file -->.yaml</inputSpec>
      <generatorName>java</generatorName>
      <library>feign</library>
      <output>${project.build.directory}/generated-sources/openapi/</output>
      <apiPackage><!--todo: apiPackage--></apiPackage>
      <modelPackage><!--todo: modelPackage--></modelPackage>
      <configOptions>
          <feignClient>true</feignClient>
          <interfaceOnly>true</interfaceOnly>
          <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
          <useJakartaEe>true</useJakartaEe>
      </configOptions>
  </configuration>
</execution>
```

- Put the name of the OAS file: is the file that represent the contract of the REST endpoint you want to consume
- Fill the value of \<apiPackage\>: should be a java-style url that ends in .api (ie: com.typicode.jsonplaceholder.api)
- Fill the value of \<modelPackage\>: should be a java-style url that ends in .model (ie: com.typicode.jsonplaceholder.model)

It should look something like this:
![Screenshot2024-10-02205518](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/Screenshot2024-10-02205518.png)

Do a maven clean and compile. You should find logs similar to this, where you can find all the excecution tasks that openapi-generator-maven-plugin does.

```log
C:\Users\franb\.jdks\openjdk-21.0.1\bin\java.exe -Dmaven.multiModuleProjectDirectory=C:\code\pollito\post "-Dmaven.home=C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3" "-Dclassworlds.conf=C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3\bin\m2.conf" "-Dmaven.ext.class.path=C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven-event-listener.jar" "-javaagent:C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\lib\idea_rt.jar=50285:C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\bin" -Dfile.encoding=UTF-8 -classpath "C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3\boot\plexus-classworlds-2.6.0.jar;C:\Program Files\JetBrains\IntelliJ IDEA 2021.3.2\plugins\maven\lib\maven3\boot\plexus-classworlds.license" org.codehaus.classworlds.Launcher -Didea.version=2021.3.2 compile
[INFO] Scanning for projects...
[INFO]
[INFO] --------------------------< dev.pollito:post >--------------------------
[INFO] Building post 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- openapi-generator-maven-plugin:7.8.0:generate (spring (server) generation - post.yaml) @ post ---
[INFO] Generating with dryRun=false
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
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator-ignore (Skipped by supportingFiles options supplied by user.)
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator\VERSION
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator\FILES
################################################################################
# Thanks for using OpenAPI Generator.                                          #
# Please consider donation to help us maintain this project ?                 #
# https://opencollective.com/openapi_generator/donate                          #
################################################################################
[INFO]
[INFO] --- openapi-generator-maven-plugin:7.8.0:generate (java (client) generation - jsonplaceholder.yaml) @ post ---
[INFO] Generating with dryRun=false
[INFO] OpenAPI Generator: java (client)
[INFO] Generator 'java' is considered stable.
[INFO] Environment variable JAVA_POST_PROCESS_FILE not defined so the Java code may not be properly formatted. To define it, try 'export JAVA_POST_PROCESS_FILE="/usr/local/bin/clang-format -i"' (Linux/Mac)
[INFO] NOTE: To enable file post-processing, 'enablePostProcessFile' must be set to `true` (--enable-post-process-file for CLI).
[INFO] Invoker Package Name, originally not set, is now derived from api package name: com.typicode.jsonplaceholder
[INFO] No serializationLibrary configured, using 'jackson' as fallback
[INFO] Processing operation getUsers
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\model\Address.java
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\src\test\java\com\typicode\jsonplaceholder\model\AddressTest.java (Test files never overwrite an existing file of the same name.)
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\model\Company.java
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\src\test\java\com\typicode\jsonplaceholder\model\CompanyTest.java (Test files never overwrite an existing file of the same name.)
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\model\Geo.java
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\src\test\java\com\typicode\jsonplaceholder\model\GeoTest.java (Test files never overwrite an existing file of the same name.)
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\model\User.java
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\src\test\java\com\typicode\jsonplaceholder\model\UserTest.java (Test files never overwrite an existing file of the same name.)
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\api\UserApi.java
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\src\test\java\com\typicode\jsonplaceholder\api\UserApiTest.java (Test files never overwrite an existing file of the same name.)
[INFO] Skipping generation of Webhooks.
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\pom.xml
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\README.md
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\build.gradle
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\build.sbt
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\settings.gradle
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\gradle.properties
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\AndroidManifest.xml
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.travis.yml
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\ApiClient.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\ServerConfiguration.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\ServerVariable.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.github\workflows\maven.yml
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\api\openapi.yaml
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\StringUtil.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\auth\HttpBasicAuth.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\auth\HttpBearerAuth.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\auth\ApiKeyAuth.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\gradlew
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\gradlew.bat
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\gradle\wrapper\gradle-wrapper.properties
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\gradle\wrapper\gradle-wrapper.jar
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\git_push.sh
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\.gitignore
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\model\ApiResponse.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\ApiResponseDecoder.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\ParamExpander.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\EncodingUtils.java
[INFO] writing file C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\RFC3339DateFormat.java
[INFO] Skipped C:\code\pollito\post\target\generated-sources\openapi\.openapi-generator-ignore (Skipped by supportingFiles options supplied by user.)
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
[INFO] Copying 2 resources from src\main\resources to target\classes
[INFO]
[INFO] --- maven-compiler-plugin:3.13.0:compile (default-compile) @ post ---
[INFO] Recompiling the module because of changed source code.
[INFO] Compiling 30 source files with javac [debug parameters release 21] to target\classes
[INFO] /C:/code/pollito/post/target/generated-sources/openapi/src/main/java/com/typicode/jsonplaceholder/ApiClient.java: C:\code\pollito\post\target\generated-sources\openapi\src\main\java\com\typicode\jsonplaceholder\ApiClient.java uses unchecked or unsafe operations.
[INFO] /C:/code/pollito/post/target/generated-sources/openapi/src/main/java/com/typicode/jsonplaceholder/ApiClient.java: Recompile with -Xlint:unchecked for details.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  7.086 s
[INFO] Finished at: 2024-10-02T21:11:00+01:00
[INFO] ------------------------------------------------------------------------

Process finished with exit code 0
```

If you check the target\generated-sources\openapi\ folder, you'll find everything that was generated by the two execution tasks.

![Screenshot2024-10-03172845](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-4/Screenshot2024-10-03172845.png)

## Next lecture

[Pollito&rsquo;s Opinion on Spring Boot Development 5: Configuration of feignClient interfaces](/en/blog/2024-10-04-pollitos-opinion-on-spring-boot-development-5)
