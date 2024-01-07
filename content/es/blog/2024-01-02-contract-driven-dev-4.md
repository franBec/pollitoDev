---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 4: Generando interfaces para controladores"
date: 2024-01-02
description: "Uso del plugin swagger codegen maven para generar código implementable del controlador"
categories: ["Programming Stuff"]
thumbnail: /uploads/2024-01-02-contract-driven-dev4/DALL·E2024-01-0215.48.54.png
---

_Uso del plugin swagger codegen maven para generar código implementable del controlador._

## Consulta el repositorio de github

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-4](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-4)

## Pequeño fix a los archivos OpenAPI.yaml antes de continuar

En los archivos OAS, cuando mencionamos los elementos de una enumeración, es útil enumerar cada elemento entre comillas.

En nuestro proyecto actual, esto es importante porque tenemos algunas enumeraciones que tienen el elemento NO sin las comillas, y la generación automática de código interpretará NO como FALSE. Esto podría causar algunos problemas en el futuro.

Antes del fix:

```yaml
enum: [published_desc, published_asc, popularity]
```

Después del fix:

```yaml
enum: ["published_desc", "published_asc", "popularity"]
```

## ¿Qué buscamos lograr?

La idea es que en el momento de la compilación, de alguna manera mágica pero configurable, aparezca código generado automáticamente en la carpeta de destino de nuestro proyecto, que represente el comportamiento que queremos que tengan nuestros controladores.

![diagram](/uploads/2024-01-02-contract-driven-dev4/Untitled-2024-01-02-1642.png)

## Agregando el plugin swagger codegen maven a nuestra base de código

Para esto, usaré el conocimiento proporcionado por [Ammar Siddiqui](https://github.com/muhammadammarsohail) en su repositorio de github [increment-service](https://github.com/muhammadammarsohail/increment-service) y su video de youtube _Swagger Codegen en 20 minutos!_.

No seguiré el vídeo exactamente paso a paso, sino las ideas principales que expone.

{{< youtube uNQ_rSVWYGI >}}

## Agregando dependencias y complementos a pom.xml

_Recuerda que puedes consultar el archivo pom.xml final en el repositorio de github del proyecto._

Aquí hay una breve descripción de las dependencias agregadas:

- **javax.validation (validation-api):** Proporciona la API para la validación de Java Bean, lo que permite declaraciones de restricciones y validación de objetos Java.
- **io.springfox (springfox-boot-starter):** Integra SpringFox con las aplicaciones Spring Boot, lo que permite la documentación de Swagger 2 para servicios RESTful.
- **javax.annotation (javax.annotation-api):** Proporciona tipos de anotaciones comunes para Java, como @Generated y @Resource.
- **org.slf4j (slf4j-api):** Sirve como una fachada simple para varios marcos de registro.
- **ch.qos.logback (logback-classic):** Módulo Logback Classic, un marco de registro confiable, rápido y flexible, pensado como sucesor del popular proyecto log4j.
- **org.threeten (threeten):** Backport de la API java.time de Java 8 (JSR-310) para Java 6 y 7, que proporciona una API de fecha y hora mejorada.

Finalmente, el complemento que hará el trabajo pesado, **io.swagger.codegen.v3 (swagger-codegen-maven-plugin)**

- Genera stubs de servidor y SDK de cliente a partir de una especificación OpenAPI (OAS).
- Está configurado para generar interfaces de controlador Spring MVC a partir de un archivo YAML específico, colocándolos en el directorio de salida definido.
- La configuración está diseñada para generar solo las interfaces, sin archivos de soporte adicionales.

## maven compile -> ¡Código generado!

Ahora, cada vez que se realice la tarea "maven compile", encontrarás código generado en target/generated-sources/swagger/controllerinterfaces.

Si exploras estos archivos .java, inmediatamente notarás que son bastante complejos, con muchas anotaciones, comentarios y, obviamente, material generado automáticamente. Y esta es la afirmación principal que quiero dejar en tu cabeza después de leer este blog:

> Los complejos procesos descritos en la especificación OpenAPI deben automatizarse, permitiendo a los desarrolladores centrarse en sus responsabilidades de negocio principales.

_Pollito, en su propio blog_

## Creando controladores

Ahora creamos los controladores dentro de un paquete de controladores en nuestra carpeta src/main/java. Para cada controlador:

- Agregar la anotación @RestController.
- Implementar la interfaz correspondiente.

Debería verse así:

### Estructura de carpetas

![folder structure](/uploads/2024-01-02-contract-driven-dev4/Screenshot2024-01-02182433.png)

### ArticleController

```java
package dev.pollito.springcityexplorer.controller;

import dev.pollito.springcityexplorer.api.ArticleApi;
import dev.pollito.springcityexplorer.models.Articles;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ArticleController implements ArticleApi {
    @Override
    public ResponseEntity<Articles> getArticlesByCountry(String country, Integer limit, Integer offset) {
        return null;
    }
}

```

### CommentController

```java
package dev.pollito.springcityexplorer.controller;

import dev.pollito.springcityexplorer.api.CommentApi;
import dev.pollito.springcityexplorer.models.CommentPostBody;
import dev.pollito.springcityexplorer.models.Comments;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CommentController implements CommentApi {
    @Override
    public ResponseEntity<Comments> getComments(Integer limit, Integer offset) {
        return null;
    }

    @Override
    public ResponseEntity<Void> postComment(CommentPostBody body) {
        return null;
    }
}

```

### WeatherController

```java
package dev.pollito.springcityexplorer.controller;

import dev.pollito.springcityexplorer.api.WeatherApi;
import dev.pollito.springcityexplorer.models.Weather;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WeatherController implements WeatherApi {
    @Override
    public ResponseEntity<Weather> getWeatherByCity(String city) {
        return null;
    }
}
```

Si todo salió bien, ahora podrás ver en la sección Spring -> MVC de tu IDE los endpoints generados por la implementación de las interfaces, con todas las anotaciones adecuadas (RequestMapping, RequestParam, NotNull, Valid, etc.). Éste es un trabajo que nos ahorramos de hacer.

![endpoints](/uploads/2024-01-02-contract-driven-dev4/Screenshot2024-01-02185624.png)

## Ejecutando la aplicación actual

### Ejemplo 200 OK

Todas las implementaciones actuales devuelven nulo, por lo que no hay cuerpo en la respuesta, pero obtenemos el estado OK.

![200 OK](/uploads/2024-01-02-contract-driven-dev4/Screenshot2024-01-02190700.png)

### Ejemplo 400 Bad request

![Bad params](/uploads/2024-01-02-contract-driven-dev4/Screenshot2024-01-02190341.png)

## Próximos pasos

- Creación de algunas pruebas unitarias para el poco código que tenemos... wow pruebas unitarias.
- Generación de código de feign-client.
