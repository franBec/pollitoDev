---
author: "Franco Becvort"
title: "Manifiesto de Pollito sobre el desarrollo basado en contratos de Java Spring Boot para microservicios 2"
date: 2024-03-18
description: "Provider generation"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/miko.jpeg
---

Esta es una continuación de [Manifiesto de Pollito sobre el desarrollo basado en contratos de Java Spring Boot para microservicios 1](/es/blog/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd).

## openapi-generator-maven-plugin

Antes de entrar en la charla técnica, permítanme presentarles el componente principal que ayudará a adoptar las prácticas de desarrollo impulsado por componentes: la dependencia [org.openapitools » openapi-generator-maven-plugin » 7.4.0](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0).

![openapi-generator-maven-plugin.png](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/openapi-generator-maven-plugin.png)

Es un potente complemento de Maven para proyectos Java que automatiza la generación de clientes API, modelos, y documentación a partir de archivos OAS.

## springBootStarterTemplate

[springBootStarterTemplate](https://github.com/franBec/springBootStarterTemplate) es un punto de partida para proyectos futuros, diseñado para adoptar prácticas de desarrollo impulsado por componentes (CDD). Encapsula dependencias esenciales y estándares de mejores prácticas.

Tiene tres ramas:

- [main](https://github.com/franBec/springBootStarterTemplate/tree/main): Satisface
  - _“Un microservicio cumple al menos con un contrato, desempeñando el rol de proveedor.”_
  - El escenario cero de "_Un microservicio puede desempeñar el papel de consumidor en cero, uno o muchos contratos_".
- [feature/provider-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/provider-gen-example): Un ejemplo de implementación de main
- [feature/consumer-gen-example](https://github.com/franBec/springBootStarterTemplate/tree/feature/consumer-gen-example): Una extensión de feature/provider-gen-example, que satisface todo lo indicado en main y además
  - Uno o varios escenarios de "_Un microservicio puede desempeñar el papel de consumidor en cero, uno o muchos contratos_".

## springBootStarterTemplate -> feature/provider-gen

Hagamos una revisión del contenido de cada archivo relevante.

![filetree](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-18200516.png)

### aspect.LoggingAspect

Lógica de registro centralizada de toda la aplicación, particularmente para los métodos del controlador.

### config.LogFilterConfig

Clase de configuración en una aplicación Spring Boot, dedicada a configurar un filtro personalizado, específicamente filter.**LogFilter**.

De forma predeterminada, garantiza que LogFilter se aplique globalmente a todas las solicitudes.

### config.WebConfig

Clase de configuración enfocada en [Cross-Origin Resource Sharing (CORS) settings](https://www.baeldung.com/spring-cors).

De forma predeterminada, permite solicitudes de origen cruzado desde cualquier fuente, lo cual es bueno para fines de desarrollo. Sin embargo, es posible que esto no sea adecuado para un entorno de producción.

### controller.advice.GlobalControllerAdvice

[Manejador de excepciones globales](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) diseñado para detectar y manejar diversas excepciones que pueden ocurrir durante el procesamiento de solicitudes web.

De forma predeterminada, maneja:

- **MissingServletRequestParameterException:** Se detecta cuando faltan los parámetros de solicitud requeridos.
- **ConstraintViolationException:** Se maneja cuando se producen violaciones de las restricciones de la API de validación de Bean.
- **MethodArgumentTypeMismatchException:** Se detecta cuando el argumento de un método no es del tipo esperado.
- **MethodArgumentNotValidException:** Se maneja cuando un argumento anotado con @Valid falla en la validación.
- **Excepción:** Un comodín genérico para cualquier otra excepción no manejada explícitamente por los otros métodos.

Cada método de controlador devuelve ResponseEntity\<Error\>, donde Error debe ser un esquema en el archivo OAS donde se hace el rol de proveedor.

De forma predeterminada, también contiene la anotación [@Order()](https://www.baeldung.com/spring-order) vacía sin argumentos. Esto significa que el manejador se ejecuta al final en relación con otros componentes de @ControllerAdvice.

### filter.LogFilter

Implementa un [filtro de servlet](https://www.geeksforgeeks.org/spring-boot-servlet-filter/) para registrar los detalles de la solicitud y la respuesta.

- Inicializa el [Contexto de diagnóstico asignado (MDC)](https://www.baeldung.com/mdc-in-log4j-2-logback) con una ID de sesión única para cada solicitud, lo que facilita el seguimiento de los registros.
- Registra detalles sobre la solicitud entrante, incluido su método, URI, cadena de consulta y encabezados.
- Una vez procesada la solicitud, también registra el estado de la respuesta.

### util.Constants

Contenedor para constantes de toda la aplicación.

De forma predeterminada, solo contiene la constante SLF4J_MDC_SESSION_ID_KEY, utilizada en **LogFilter** como clave en el contexto de diagnóstico asignado (MDC) SLF4J para almacenar y recuperar un identificador de sesión único.

Siéntase libre de agregar aquí todas las constantes necesarias.

### util.ErrorResponseBuilder

Utilidad para construir entidades de respuesta a errores, de modo que todas las respuestas a errores tengan la misma estructura.

### SpringBootStarterTemplateApplication

Punto de entrada predeterminado a una aplicación Spring Boot.

### resources > openapi files

Esta es una carpeta totalmente arbitraria dentro de los recursos donde decidí que es lo suficientemente buena para colocar todos los archivos OAS.

Es importante recordar que en la definición de contrato que hice, debemos cumplir con entradas, salidas y errores.

> Los microservicios deben cumplir con un contrato, que define entradas, salidas y errores.

Por lo tanto, cada contrato debe tener un esquema similar a Error (no es necesario que se llame Error), que, después de las tarea de generate, se utilizará para construir respuestas de error estandarizadas.

Aquí está mi esquema de error recomendado:

```yaml
Error:
  type: object
  properties:
    timestamp:
      type: string
      description: The date and time when the error occurred in ISO 8601 format.
      format: date-time
      example: "2024-01-04T15:30:00Z"
    session:
      type: string
      format: uuid
      description: A unique UUID for the session instance where the error happened, useful for tracking and debugging purposes.
    error:
      type: string
      description: A brief error message or identifier.
    message:
      type: string
      description: A detailed error message.
    path:
      type: string
      description: The path that resulted in the error.
```

No dudes en organizar archivos en subcarpetas si es necesario. No olvide mantener la coherencia en pom.xml (más sobre esto más adelante).

### resources > logback.xml

Configuración para registrar información en la consola, con un patrón personalizado que incluye un ID de sesión para una mejor trazabilidad de las entradas del registro.

### pom.xml

- Esta plantilla utiliza [Spring Boot 3.2.3](https://github.com/spring-projects/spring-boot/releases/tag/v3.2.3) y [Java 21](https://www.geeksforgeeks.org/java-jdk-21-new-features-of-java-21/)

- Dependencias básicas: las encontrará en casi todas las aplicaciones Spring Boot 3 que existen:

  - [org.springframework.boot » spring-boot-starter-web » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web/3.2.3): Esencial para crear aplicaciones web usando Spring Boot.
  - [org.springframework.boot » spring-boot-devtools » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-devtools/3.2.3): Conjunto de herramientas que hacen más eficiente el proceso de desarrollo con Spring Boot.
  - [org.springframework.boot » spring-boot-configuration-processor » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-configuration-processor/3.2.3): Genera metadatos para las propiedades de configuración, lo que facilita el trabajo con ellas en IDE.
  - [org.projectlombok » lombok » 1.18.30](https://mvnrepository.com/artifact/org.projectlombok/lombok/1.18.30): Reduce el código repetitivo como captadores, definidores y constructores mediante anotaciones.
  - [org.springframework.boot » spring-boot-starter-test » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-test/3.2.3): Incluye soporte para JUnit, Spring Test y Spring Boot Test, AssertJ, Hamcrest y muchas otras bibliotecas necesarias para realizar pruebas exhaustivas.

- AOP:

  - [org.aspectj » aspectjweaver » 1.9.21.2](https://mvnrepository.com/artifact/org.aspectj/aspectjweaver/1.9.21.2): Modifica las clases de Java para entrelazar los aspectos.

- Mapping:

  - [org.mapstruct » mapstruct » 1.5.5.Final](https://mvnrepository.com/artifact/org.mapstruct/mapstruct/1.5.5.Final): Mapeos entre tipos de beans Java basados en un enfoque de convención sobre configuración. [Hay muchos mapeadores por ahí](https://www.baeldung.com/java-performance-mapping-frameworks), es una situación de elige tu propio veneno.

- Dependencias requeridas por [org.openapitools » openapi-generator-maven-plugin » 7.4.0](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0) al generar código de proveedor:

  - [io.swagger.core.v3 » swagger-core-jakarta » 2.2.20](https://mvnrepository.com/artifact/io.swagger.core.v3/swagger-core-jakarta/2.2.20): Resuelve error package io.swagger.v3.oas.annotations does not exist.
  - [org.openapitools » jackson-databind-nullable » 0.2.6](https://mvnrepository.com/artifact/org.openapitools/jackson-databind-nullable/0.2.6): Resuelve error package org.openapitools.jackson.nullable does not exist.
  - [org.springframework.boot » spring-boot-starter-validation » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation/3.2.3): Resuelve validaciones siendo ignoradas.

- Plugins:

  - [org.springframework.boot » spring-boot-maven-plugin » 3.2.3](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-maven-plugin/3.2.3): Se utiliza para excluir explícitamente lombok de la aplicación empaquetada final, ya que Lombok es una herramienta solo en tiempo de compilación que ayuda a reducir el código repetitivo.
  - [org.apache.maven.plugins » maven-compiler-plugin » 3.12.1](https://mvnrepository.com/artifact/org.apache.maven.plugins/maven-compiler-plugin/3.12.1): Compila el proyecto.
  - [org.mapstruct » mapstruct-processor » 1.5.5.Final](https://mvnrepository.com/artifact/org.mapstruct/mapstruct-processor/1.5.5.Final): Necesario para que mapstruct y lombok coexistan.
  - [org.projectlombok » lombok-mapstruct-binding » 0.2.0](https://mvnrepository.com/artifact/org.projectlombok/lombok-mapstruct-binding/0.2.0): Necesario para que mapstruct y lombok coexistan.
  - [com.spotify.fmt » fmt-maven-plugin » 2.23](https://mvnrepository.com/artifact/com.spotify.fmt/fmt-maven-plugin/2.23): Formatea su código fuente Java para cumplir con [Formato Java de Google](https://google.github.io/styleguide/javaguide.html).
  - [org.openapitools » openapi-generator-maven-plugin » 7.4.0](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0): Generador de código que adopta prácticas de CDD.

Este es un ejemplo de cómo configurarlo para la generación de proveedores:

```xml
<plugin>
  <groupId>org.openapitools</groupId>
  <artifactId>openapi-generator-maven-plugin</artifactId>
  <version>7.2.0</version>
  <executions>
      <execution>
          <id>provider generation - your OAS file</id>
          <goals>
              <goal>generate</goal>
          </goals>
          <configuration>
              <inputSpec>${project.basedir}/src/main/resources/openapi/your OAS file</inputSpec>
              <generatorName>spring</generatorName>
              <output>${project.build.directory}/generated-sources/openapi/</output>
              <apiPackage>dev.pollito.springbootstartertemplate.api</apiPackage>
              <modelPackage>dev.pollito.springbootstartertemplate.models</modelPackage>
              <configOptions>
                  <interfaceOnly>true</interfaceOnly>
                  <useSpringBoot3>true</useSpringBoot3>
                  <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
              </configOptions>
          </configuration>
      </execution>
  </executions>
</plugin>
```

Veamos qué está pasando aquí.

- **ID de grupo e ID de artefacto:** Identifica el plugin OpenAPI Generator.
- **Versión:** Especifica la versión del complemento OpenAPI Generator.
- **Bloque de ejecución:** Define cuándo y cómo se deben ejecutar los objetivos del plugin dentro del ciclo de vida de la compilación.
  - **ID:** Un identificador único para esta instancia de ejecución.
  - **Objetivos:** Especifica el objetivo de generación, que le indica al plugin que realice la generación de código.
  - **Bloque de configuración:** Proporciona instrucciones detalladas sobre cómo se debe realizar la generación de código.
    - **inputSpec:** Apunta a la ubicación del archivo de especificaciones de OpenAPI que cumple la función de ser el contrato del proveedor.
    - **generatorName:** Especifica el generador de Spring, lo que indica que el código debe generarse teniendo en cuenta Spring, adaptando la salida para proyectos basados en Spring.
    - **salida:** El directorio donde se debe colocar el código generado. Personalmente, creo que el directorio target/generated-sources/openapi/ es un buen lugar.
    - **apiPackage y modelPackage:** Defina los nombres de los paquetes Java para las interfaces API generadas y las clases de modelo, respectivamente. Estos valores dependen de usted. Personalmente, me gusta utilizar la URL del servidor de la OAS en notación de URL inversa. En caso de que esa información no esté disponible, usar el ID de grupo del proyecto + ID de artefacto es una práctica común.
    - **configOptions:** Un conjunto de opciones de configuración adicionales.
      - **interfaceOnly:** Se establece en verdadero.
      - **useSpringBoot3:** Garantiza la compatibilidad con Spring Boot 3.
      - **useEnumCaseInsensitive:** Si se generan enumeraciones, se configura para que no distinga entre mayúsculas y minúsculas, lo que agrega flexibilidad a la forma en que se deserializan sus valores.

### Diagrama UML

![uml](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/uml-provider.jpg)

## Cómo utilizar esta plantilla

0. Clonar el repositorio y eliminar su relación con el repositorio original.

- **Opcional pero recomendado** dale tu propia identidad al repositorio.

1. Agregue un archivo OAS en recursos/openapi.

- Asegúrese de que su OAS tenga el esquema de error recomendado.
- Si el esquema tiene un nombre diferente a Error, el código no se compilará y necesitarás cambiar algunas importaciones según lo indique el compilador. No es gran cosa.

2. En pom.xml, descomente el código de bloque relacionado con openapi-generator-maven-plugin.
3. Edite el código de bloque para que apunte a su archivo OAS agregado recientemente en resources/api.

- Aquí también puedes editar las etiquetas apiPackage y modelPackage. Nuevamente, el código no se compilará y necesitarás cambiar algunas importaciones según lo indicado por el compilador. No es gran cosa x2.

4. maven clean + maven compile.
5. Cree un @RestController e implemente la interfaz generada.
6. Ejecute la aplicación.

## Ejemplo de implementación

Puede encontrar este código en feature/provider-gen-example

### 0. Clonar el repositorio y eliminar su relación con el repositorio original

Sigue estos pasos

```bash
git clone https://github.com/franBec/springBootStarterTemplate.git
```

```bash
cd springBootStarterTemplate
```

```bash
rm -rf .git
git init
```

Ahora tienes un repositorio limpio totalmente nuevo.

**Opcional pero recomendado** dale tu propia identidad al repositorio. Para esto:

- Modificar el ID de grupo y el ID de artefacto en pom.xml.
- Refactorice la estructura de su paquete para que coincida con el nuevo ID de grupo: esto generalmente se puede hacer fácilmente dentro de un IDE como IntelliJ IDEA o Eclipse haciendo clic derecho en el paquete y seleccionando Refactor -> Cambiar nombre.

### Agregue un archivo OAS en recursos/openapi

Para esto, uniré el [ejemplo de tienda de mascotas](https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml) de [The OpenAPI Specification github](https://github.com/OAI/OpenAPI-Specification).

No olvide agregar (o en este caso reemplazar el esquema de error ya existente) en la OEA con el esquema de error recomendado en este blog.

### 2. En pom.xml, descomente el código de bloque relacionado con openapi-generator-maven-plugin

Esto es fácil, simplemente elimine el <--- ---> que rodea el bloque de código.

### 3. Edite el código de bloque para que apunte a su archivo OAS agregado recientemente en resources/api

Aquí está cómo se ve después de editar:

```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>7.2.0</version>
    <executions>
        <execution>
            <id>provider generation - petstore.yaml</id>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <inputSpec>${project.basedir}/src/main/resources/openapi/petstore.yaml</inputSpec>
                <generatorName>spring</generatorName>
                <output>${project.build.directory}/generated-sources/openapi/</output>
                <apiPackage>io.swagger.petstore.api</apiPackage>
                <modelPackage>io.swagger.petstore.models</modelPackage>
                <configOptions>
                    <interfaceOnly>true</interfaceOnly>
                    <useSpringBoot3>true</useSpringBoot3>
                    <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
                </configOptions>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Edité los valores de las etiquetas apiPackage y modelPackage, para que aparezca el error de compilación y mostrar cómo solucionarlo.

### 4. maven clean + maven compile

Como se dijo, obtenemos _package dev.pollito.springbootstartertemplate.models does not exist_
![compile errors](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19115632.png)

Arreglemos esto. En cada archivo, cambie la importación rota. Asegúrese de importar el que generó el complemento. Error es un nombre muy común, podrías importar el incorrecto.

En este caso el que necesitamos es el segundo, de io.swagger.petstore.models

![compile errors](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19115917.png)

Después de corregir las importaciones, intente compilar nuevamente. Deberíamos estar listos para partir.

### 5. Cree un @RestController e implemente la interfaz generada.

Me gusta mantener una cohesión entre el nombre que se le dio a la interfaz cuando se generó y el nombre de mi clase de controlador. Entonces, veamos en las fuentes generadas qué nombre se le dio a la interfaz en la generación.

![generated interface](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19120409.png)

Allí podemos ver que se llamaba _PetsApi_, así que creemos _PetsController_:

- Créelo en el paquete del controlador (tenga cuidado de no colocarlo dentro del paquete de controller.advice por accidente).
- Dale la anotación @RestController
- Haz que implemente _PetsApi_.

```java
@RestController
public class PetsController implements PetsApi {
}
```

En intelliJ IDEA, si presiona Ctrl+O dentro de una clase que implementa algo, aparecerá una ventana emergente que le preguntará qué métodos de interfaz desea implementar.

Aquí selecciona todo lo que necesitas. Por lo general, no necesitará nada de java.lang.Object y tampoco necesitará el método que devuelve Optional NativeWebRequest.

![ctrl+O](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/Screenshot2024-03-19120950.png)

Ahora tenemos todo este código:

```java
@RestController
public class PetsController implements PetsApi {
    @Override
    public ResponseEntity<Void> createPets(Pet pet) {
        return PetsApi.super.createPets(pet);
    }

    @Override
    public ResponseEntity<List<Pet>> listPets(Integer limit) {
        return PetsApi.super.listPets(limit);
    }

    @Override
    public ResponseEntity<Pet> showPetById(String petId) {
        return PetsApi.super.showPetById(petId);
    }
}
```

### 6. Ejecute la aplicación

Pruebe esta solicitud:

```
curl --location 'http://localhost:8080/pets'
```

Recibirá un cuerpo vacío con un estado 501 Not Implemented.

Y los registros muestran la siguiente información:

```
2024-03-19 12:20:04 INFO  d.p.s.filter.LogFilter [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - >>>> Method: GET; URI: /pets; QueryString: null; Headers: {user-agent: PostmanRuntime/7.37.0, accept: */*, cache-control: no-cache, postman-token: 3c483439-921c-48d5-ab28-a85d76fce2e8, host: localhost:8080, accept-encoding: gzip, deflate, br, connection: keep-alive}
2024-03-19 12:20:04 INFO  d.p.s.aspect.LoggingAspect [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - [PetsController.listPets(..)] Args: [null]
2024-03-19 12:20:05 INFO  d.p.s.aspect.LoggingAspect [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - [PetsController.listPets(..)] Response: <501 NOT_IMPLEMENTED Not Implemented,[]>
2024-03-19 12:20:05 INFO  d.p.s.filter.LogFilter [SessionID: 433cd727-56f4-4236-9cf7-04434f54c7c4] - <<<< Response Status: 501
```

## Siguiente lectura

[Pollito&rsquo;s Manifest on Java Spring Boot Contract-Driven Development for microservices 3](/es/blog/2024-03-19-pollitos-manifest-on-java-spring-boot-cdd-3)
