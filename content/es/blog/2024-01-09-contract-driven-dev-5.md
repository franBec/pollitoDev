---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 5: Las validaciones en el controlador no están funcionando... ¿Por qué?"
date: 2024-01-09
description: "Parchando validaciones javax obsoletas en Spring Boot 3"
categories: ["Programming Stuff"]
thumbnail: /uploads/2024-01-09-contract-driven-dev5/DALL·E2024-01-0822.22.45.png
---

_Parchando validaciones javax obsoletas en Spring Boot 3._

## Consulta el repositorio de github

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-5](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-5)

## Cambios en la especificación openAPI.yaml

- getArticlesByCountry mejorado:
  - limit ahora tiene mínimo y máximo.
  - offset ahora tiene mínimo y máximo.
- getComments mejorado
  - limit ahora tiene mínimo y máximo.
  - offset ahora tiene mínimo.
  - Parámetro creado sortOrder.
  - En 500 devuelve Error.
- postComment mejorado:
  - Se cambió el nombre del esquema CommentPostBody a CommentPostRequest.
  - En 201 devuelve CommentPostResponse.
  - En 500 devuelve Error.
- Se reemplazó todo lo relacionado con la fecha y hora por solo una cadena, con un ejemplo de fecha y hora en formato ISO 8601.
  - Motivo: en la serialización para la devolución, en lugar de obtener una cadena como "2024-01-04T15:30:00Z", devolvía un objeto que representa OffsetDateTime.

```json
{
  "timestamp": {
    "offset": {
      "totalSeconds": 0,
      "id": "Z",
      "rules": {
        "fixedOffset": true,
        "transitions": [],
        "transitionRules": []
      }
    },
    "year": 2024,
    "monthValue": 1,
    "dayOfMonth": 3,
    "hour": 18,
    "minute": 31,
    "second": 48,
    "nano": 218000000,
    "dayOfWeek": "WEDNESDAY",
    "dayOfYear": 3,
    "month": "JANUARY"
  }
}
```

Esto puede causar problemas de serialización en quien consume nuestro servicio.

- Esquema de errores mejorado: ahora es un objeto que consiste en...
  - timestamp: la fecha y hora en que ocurrió el error en formato ISO 8601.
  - session: un UUID único para la instancia de sesión donde ocurrió el error, útil para fines de seguimiento y depuración.
  - error: Un breve mensaje de error o identificador.
  - message: un mensaje de error detallado.
  - method: el método que provocó el error.

## Escribamos algunas pruebas unitarias para nuestros controladores

Aquí hay un ejemplo de cómo probar ArticleController.

```java
@ExtendWith(MockitoExtension.class)
class ArticleControllerTest {
  @InjectMocks private ArticleController articleController;
  @Mock private ArticleService articleService;

  @Test
  void whenGetArticlesByCountryThenReturnsArticles() {
    ResponseEntity<Articles> expectedResponse = ResponseEntity.ok(mockArticles());
    when(articleService.getArticlesByCountry(anyString(), anyInt(), anyInt()))
        .thenReturn(expectedResponse.getBody());

    ResponseEntity<Articles> actualResponse =
        articleController.getArticlesByCountry(MOCK_STRING, 0, 0);

    assertEquals(expectedResponse.getBody(), actualResponse.getBody());
  }
}
```

Para que esto funcione, es necesario:

- Crear una interfaz ArticleService y una implementación sencilla.
- Inyectarlo en ArticleController.

```java
public interface ArticleService {
  Articles getArticlesByCountry(String country, Integer limit, Integer offset);
}
```

```java
@Service
public class ArticleServiceImpl implements ArticleService {
  @Override
  public Articles getArticlesByCountry(String country, Integer limit, Integer offset) {
    return null;
  }
}
```

```java
@RestController
@RequiredArgsConstructor
public class ArticleController implements ArticleApi {

  private final ArticleService articleService;

  @Override
  public ResponseEntity<Articles> getArticlesByCountry(
      String country, Integer limit, Integer offset) {
    return ResponseEntity.ok(articleService.getArticlesByCountry(country, limit, offset));
  }
}
```

## Genial, escribamos una prueba fallida... ¿Por qué no falla?

Cambiemos rápidamente una línea en ArticleControllerTest

```java
ResponseEntity<Articles> actualResponse =
        articleController.getArticlesByCountry(MOCK_STRING, 100, 0);
```

En nuestra especificación, indicamos que limit tiene un máximo de 10, por lo que seguramente 100 debería generar una excepción, ¿verdad?... _Prueba aprobada._

Bueno, seguro que se trata de algunas cosas de Mockito que no se ejecutan correctamente. Simplemente ejecutemos la aplicación y realicemos un cURL request.

```bash
curl --location 'http://localhost:8080/article?limit=101'
```

Recibí 200 OK. Entonces, ¿quién tiene la culpa? Respuesta corta, el plugin, porque está desactualizado para los estándares actuales. Respuesta larga y cómo solucionarlo, sigue leyendo.

## Un poco de historia: javax, jakarta y Spring Boot 3

Le pregunté a chatGPT:

> explica sin muchos detalles técnicos cuál es el problema con los paquetes javax y jakarta, centrándose en lo que hacen las bibliotecas y por qué pasar de javax a jakarta

Y obtuve esto:

### Paquetes javax

- Origen: el espacio de nombres javax ha sido parte de Java durante muchos años. Se originó como parte de la plataforma Java 2, Enterprise Edition (J2EE), que luego pasó a llamarse Java EE (Enterprise Edition).
- Propósito: Estos paquetes contienen clases e interfaces para las funciones empresariales de Java, como servicios web, servlets y JavaServer Pages (JSP). Son esenciales para crear aplicaciones de nivel empresarial.
- Uso: se utilizan ampliamente en muchas aplicaciones para funciones como acceso a bases de datos, mensajería, aplicaciones web y seguridad.

### Transición a Jakarta

- Cambio de propiedad: la propiedad de Java EE se transfirió de Oracle a la Fundación Eclipse, una destacada organización de código abierto. Esta transferencia requirió un cambio en el espacio de nombres de javax a jakarta.
- ¿Por qué Jakarta?: La Fundación Eclipse no pudo utilizar el espacio de nombres javax por motivos legales y de marca registrada. Por lo tanto, introdujeron el espacio de nombres jakarta.
- Implicaciones: este cambio significa que el desarrollo y las actualizaciones futuras para Java empresarial se realizarán bajo el espacio de nombres de jakarta.

### Paquetes de Jakarta

- Continuación: Jakarta EE es esencialmente una continuación de Java EE bajo un nuevo espacio de nombres. Representa el futuro de Java empresarial.
- Compatibilidad y cambios: si bien existen problemas de compatibilidad entre javax y jakarta, las funcionalidades fundamentales siguen siendo similares. El cambio se produce principalmente en los nombres y espacios de nombres de los paquetes.
- Impulsado por la comunidad: al estar bajo la Fundación Eclipse, Jakarta EE ahora está más impulsado por la comunidad, lo que potencialmente acelera la innovación y las actualizaciones en Java empresarial.

### Spring Boot 3 elimina javax a favor de jakarta

Este cambio fue impulsado por el traslado de Java EE a Jakarta EE bajo la Fundación Eclipse, lo que llevó al cambio de nombre de los paquetes de javax a jakarta.

Para Spring Boot 3, estos son los puntos clave relacionados con la compatibilidad con los paquetes javax:

- Transición a Jakarta EE 9+: Spring Framework 6 y Spring Boot 3 están diseñados para funcionar con Jakarta EE 9 y versiones posteriores. Esto significa que se espera que utilicen espacios de nombres de Yakarta en lugar de Javax.

- No hay soporte directo para paquetes javax: dado el cambio a Jakarta EE, es probable que Spring Boot 3 no admita directamente los paquetes javax más antiguos. Es posible que las aplicaciones que dependen de espacios de nombres javax deban migrarse a los espacios de nombres de jakarta para garantizar la compatibilidad con Spring Boot 3.

- Compatibilidad con versiones anteriores: si bien Spring Boot 3 tiene visión de futuro con su soporte para Jakarta EE, podría plantear desafíos para la compatibilidad con aplicaciones creadas en versiones anteriores de Spring Boot que usan paquetes javax.

## ¿Qué tiene eso que ver con que las validaciones del controlador no funcionan entonces?

Bueno, lamentablemente el complemento solo puede generar código en la forma anterior a Spring Boot 3, usando javax. Podemos verificar que ingresando a la interfaz que nuestro controlador extiende y leyendo las importaciones. Encontraremos:

```java
import javax.validation.Valid;
import javax.validation.constraints.*;
```

Entonces, lo que está sucediendo es que nuestra aplicación Spring Boot 3 simplemente ignora la validación javax, lo que resulta en nuestro comportamiento actual.

¿Entonces, cuales son nuestras opciones?

- Cambiar a Spring Boot 2.7: va en contra de nuestro objetivo de seguir siendo compatibles con las versiones recientes de Spring Boot y Java.
- Busque un complemento mejor: sí, lo veremos en el próximo blog. En este momento quiero tener una rama con este complemento actual funcionando, incluso si tiene un feo parche.
- Copiar y pegar el código generado en nuestro código fuente, reemplazando cada javax por jakarta: Esto no es tan malo, pero ahora el código no es autogenerado, es tuyo. Incluso si se copia y pega, ahora la responsabilidad de probar y asegurarse de que el código funcione según lo previsto ahora es tuya. Y en el desarrollo impulsado por contratos, si podemos evadir esa responsabilidad, mejor.
- Validar entradas a la vieja escuela, con ifs elses: esto puede parecer viable ahora y no es tan malo. Pero si nuestra realidad es complicada y da como resultado una especificación openAPI compleja, entonces la capa ifs-elses también crece en complejidad. Esta solución no es tan escalable.
- Hacer que el servicio inyectado sea compatible con la validación de Jakarta y replicar allí la validación del controlador que no funciona: vamos con este.

## Pros y contras de la solución parche elegida

### Ventaja: Ahora que estamos escribiendo nuestras propias validaciones, podemos incluso mejorar cosas en las que la OAS se queda corta

Si bien la OAS proporciona un marco sólido para validaciones de API estándar, a veces puede fallar en el manejo de escenarios de validación complejos o únicos que son específicos de cierta lógica de negocios o formatos de datos. Al escribir nuestras propias validaciones, podemos introducir un nivel de especificidad y flexibilidad que la OAS quizás no apoye inherentemente.

Este enfoque permite un control más granular sobre la integridad de los datos y el comportamiento de la API, asegurando que se alinee con mayor precisión con los requisitos de la aplicación y las expectativas del usuario. Además, las validaciones personalizadas también pueden servir como un medio para introducir controles de seguridad adicionales o hacer cumplir ciertas mejores prácticas que están más allá del alcance de la OAS, mejorando así la solidez y confiabilidad general de la API.

### Pro: Es el menos perjudicial para la situación actual

La opción de implementar validaciones personalizadas a menudo surge como una solución altamente eficiente y mínimamente disruptiva, especialmente en comparación con medidas más drásticas como alterar las bibliotecas existentes.

### Desventaja: Estamos haciendo un trabajo manual que es propenso a caer en obsolescencia

Imagine que los requisitos cambian y el arquitecto o usted crea yourServiceOAS_V2.yaml. Ahora no se trata solo de reemplazar, construir y probar. Ahora tienes que implementar cambios manualmente.

Hacer las cosas manualmente implica que existe la posibilidad de perder algo en el camino. Los desarrolladores podemos y cometeremos errores. Si algo se puede automatizar para evitar errores humanos evitables, es bueno pensar un poco en ello.

### Desventaja: cuanto más lejos se produce el error, más difícil es mapear su estado de respuesta HTTP

Darle al servicio la responsabilidad de validar las entradas de las solicitudes no sigue el "principio de validación de entradas tempranas". Si hay un error en la solicitud, se debe lanzar lo antes posible. En este caso, debería estar en el controlador.

Además esto plantea un nuevo problema: ahora que el error está en el servicio, ¿a qué estado lo asigno? Uno pensaría _"fácil 400-algo"_. ¿Pero cómo puedes estar tan seguro?

- Una ConstraintViolationException en un controlador normalmente implica que algo está mal en la solicitud.
- Una ConstraintViolationException en un servicio, sería por diferentes razones: tal vez estoy usando una biblioteca de terceros que no permite números negativos... esa es una violación de restricción que debería asignarse a un estado 500.

Creo que esta es la mayor desventaja de todas. Lo dejaré pasar por el momento, pero la solución ideal es no tener ningún problema para empezar, por lo que buscaremos un plugin mejor en el futuro.

## Implementando la solución

### Agregar jakarta en pom.xml

```xml
<!--
  It integrates the Hibernate Validator and the Validation API, providing a seamless experience for adding validation capabilities to Spring Boot applications.
  The specified version ensures compatibility with other Spring Boot 3.x components
-->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
  <version>3.1.2</version>
  <scope>compile</scope>
</dependency>
```

### Agregar anotaciones de jakarta a la interfaz de servicio.

```java
import dev.pollito.springcityexplorer.annotation.ValidArticleCountry;
import dev.pollito.springcityexplorer.models.Articles;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;

@Validated
public interface ArticleService {
  Articles getArticlesByCountry(
      @ValidArticleCountry String country,
      @Min(1) @Max(10) Integer limit,
      @Min(0) @Max(10000) Integer offset);
}

```

Nótese que:

- Las importaciones son de jakarta.
- ¡Podemos crear nuestras anotaciones personalizadas! Hay muchos tutoriales sobre cómo esto funciona.

### Ejecute y vea cómo funciona.

Request

```bash
curl --location 'http://localhost:8080/article?country=asd'
```

Respuesta: en este momento se está asignando a 500, como lo haría cualquier ConstraintViolationException en un servicio. No me preocuparé mucho por esto ahora.

```json
{
  "timestamp": "2024-01-09T12:34:31.755+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "trace": "all the trace exception long long text",
  "message": "getArticlesByCountry.country: Invalid country code",
  "path": "/article"
}
```

Baila y repite para el resto de los puntos finales. En POST /comment, tiene una clase como cuerpo de solicitud. Necesitará replicar esa clase en su código src con anotaciones de jakarta.

## Otros cambios menores en pom xml

- Se agregó [mapstruct] (https://mapstruct.org/).
- Se agregó [complemento maven de formato de código java de Spotify](https://github.com/spotify/fmt-maven-plugin).

## Próximos pasos

- Búsqueda de una biblioteca de generación de código mejorada para resolver los problemas presentados aquí.
