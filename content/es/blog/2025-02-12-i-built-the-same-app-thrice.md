---
author: "Franco Becvort"
title: "Construí la misma app tres veces"
date: 2025-02-12
description: "Groovy, Java, Kotlin"
categories: ["Programing talk"]
thumbnail: /uploads/2025-02-12-i-built-the-same-app-thrice/thrice.jpg
---
<!-- TOC -->
  * [Inspiración](#inspiración)
  * [Entendiendo la aplicación](#entendiendo-la-aplicación)
  * [Métricas rápidas](#métricas-rápidas)
  * [No hay lo bueno, lo malo y lo feo](#no-hay-lo-bueno-lo-malo-y-lo-feo)
  * [Lo bueno: Java](#lo-bueno-java)
  * [El primer amor: Groovy](#el-primer-amor-groovy)
    * [El tipado relajado de Groovy](#el-tipado-relajado-de-groovy)
    * [Escribiendo tests con Spock](#escribiendo-tests-con-spock)
    * [Volvería a usar Groovy si tuviera la chance](#volvería-a-usar-groovy-si-tuviera-la-chance)
  * [La decepción: Kotlin](#la-decepción-kotlin)
    * [OpenAPI Generator no funcionó de inmediato](#openapi-generator-no-funcionó-de-inmediato)
    * [Manejando Java Time en tests](#manejando-java-time-en-tests)
    * [No estuvo mal](#no-estuvo-mal)
  * [Conclusión](#conclusión)
<!-- TOC -->

## Inspiración

Este blog está fuertemente inspirado en el video de Theo _"I built the same app with 5 different stacks"_.

{{< youtube O-EWIlZW0mM >}}

Así que decidí hacer mi versión, pero usando dos lenguajes que ya conozco bien ([Java](https://www.java.com/) y [Groovy](http://www.groovy-lang.org/)) más un lenguaje nuevo que quería probar desde hace tiempo: [Kotlin](https://kotlinlang.org/).

Acá tenés el código de los repositorios:

- [Versión Java](https://github.com/franBec/roundest_java)
- [Versión Groovy](https://github.com/franBec/roundest_groovy)
- [Versión Kotlin](https://github.com/franBec/roundest_kotlin)

## Entendiendo la aplicación

Hice el típico ejercicio de programación "Roundest Pokémon":

- Visitá el resultado final en [roundest-pokemon.pollito.tech](https://roundest-pokemon.pollito.tech/)
- No tengo planeado mantener el proyecto corriendo para siempre, ya que quizás necesite la potencia del VPS en el que está para otros proyectos personales. Así que, si el enlace no te lleva a nada, lo siento, llegaste tarde.

Agregué un giro:

- En la parte superior de la página, podés elegir qué sistema backend procesa tu voto (Next.js + _).
  ![backend-selector.gif](/uploads/2025-02-03-vps-5/backend-selector.gif)
- No importa qué backend elijas, todos los votos terminan en el mismo lugar.
  ![vote-flow.gif](/uploads/2025-02-03-vps-5/vote-flow.gif)
- La aplicación frontend (la que usás para interactuar en el navegador) está hecha en **Next.js**.
    - Sí, sé hacer frontend.
    - Soy fanático de [Next.js](https://nextjs.org/) y [Tailwind](https://tailwindcss.com/).
    - Creo que [react-query](https://tanstack.com/query/latest/docs/framework/react/overview) es el mejor paquete que jamás se haya creado (mención honorífica a [swr](https://swr.vercel.app/)).
    - Vi todos los videos de Theo.
    - Me gusta burlarme de [JQuery](https://jquery.com/) a pesar de que [la mitad de internet está hecha con él](https://www.reddit.com/r/webdev/comments/r7nz99/jquery_is_still_used_on_80_of_websites/)... (aún me persiguen en sueños los flashbacks de las páginas web del gobierno argentino hechas con JQuery + Bootstrap).
      ![jquery.jpg](/uploads/2025-02-12-i-built-the-same-app-thrice/jquery.jpg)

Acá tenés el [código del frontend en Next.js](https://github.com/franBec/roundest_nextjs).

## Métricas rápidas

Este blog es, sobre todo, una comparación de backends. Spoiler: en términos de rendimiento en este pequeño proyecto, son iguales.

Hagamos una comparación de las bases de código:
- En general, los tres backends no son tan diferentes.
- El frontend es algo distinto, no tiene mucho sentido compararlo con las aplicaciones backend.

Las siguientes tablas fueron generadas usando [cloc](https://github.com/AlDanial/cloc).

Aplicación de backend **Groovy**

| Language        | files | blank | comment | code |
|-----------------|-------|-------|---------|------|
| Groovy          | 22    | 174   | 1       | 727  |
| YAML            | 3     | 0     | 0       | 296  |
| SQL             | 1     | 1     | 2       | 157  |
| Bourne Shell    | 1     | 28    | 118     | 106  |
| Gradle          | 2     | 12    | 0       | 96   |
| DOS Batch       | 1     | 21    | 2       | 71   |
| Markdown        | 1     | 10    | 0       | 47   |
| Dockerfile      | 1     | 1     | 2       | 7    |
| Properties      | 1     | 0     | 0       | 7    |
| **SUM:**        | **33**| **247**| **125**| **1514** |

Aplicación backend **Java**

| Language        | files | blank | comment | code |
|-----------------|-------|-------|---------|------|
| Java            | 22    | 131   | 2       | 660  |
| YAML            | 3     | 0     | 0       | 296  |
| SQL             | 1     | 1     | 2       | 157  |
| Gradle          | 2     | 12    | 0       | 108  |
| Bourne Shell    | 1     | 28    | 118     | 106  |
| DOS Batch       | 1     | 21    | 2       | 71   |
| Markdown        | 1     | 9     | 0       | 45   |
| Dockerfile      | 1     | 1     | 2       | 7    |
| Properties      | 1     | 0     | 0       | 7    |
| **SUM:**        | **33**| **203**| **126**| **1457** |

Aplicación backend **Kotlin**

| Language        | files | blank | comment | code |
|-----------------|-------|-------|---------|------|
| Kotlin          | 24    | 134   | 4       | 589  |
| YAML            | 3     | 0     | 0       | 301  |
| Gradle          | 2     | 25    | 0       | 167  |
| SQL             | 1     | 1     | 2       | 157  |
| Bourne Shell    | 1     | 28    | 118     | 106  |
| DOS Batch       | 1     | 21    | 2       | 71   |
| Markdown        | 1     | 9     | 0       | 44   |
| Dockerfile      | 1     | 1     | 2       | 8    |
| Properties      | 1     | 0     | 0       | 7    |
| **SUM:**        | **35**| **219**| **128**| **1450** |

En cuanto a los tiempos de despliegue, tampoco hay nada destacable:

- Si es un redepliegue sin compilación, toma alrededor de 1 minuto y medio.
- Si el despliegue implica compilación, toma alrededor de 4 minutos y medio.

Tengo todos los backends con los mismos límites de recursos muy conservadores:

![resource-limits.png](/uploads/2025-02-12-i-built-the-same-app-thrice/resource-limits.png)

En estado inactivo, tienen un uso aceptable de CPU y memoria. Todos muestran:

- CPU% = 0,2
- MEM = 270M

## No hay lo bueno, lo malo y lo feo

Las tres opciones son totalmente válidas para un proyecto grande y serio, y entrarían en la categoría de "Lo bueno".

Diría que una frase mejor sería _"Lo bueno, el primer amor y la decepción"_. Vamos uno por uno.

## Lo bueno: Java

Empecemos intercalando el obvio chiste de `public static void String main args` acá.

{{< youtube m4-HM_sCvtQ >}}

Dato curioso, `public static void String main args` [ya no es necesario desde Java 21](https://medium.com/@shwetha.narayan/java-21-no-more-public-static-void-main-c90334d6d95e).

En una palabra, Java es **confiable**:

- Hay una cierta comodidad en saber que contás con una vasta comunidad y una gran cantidad de documentación y buenas prácticas.
- Resultaría raro que te apareciera un error que nadie más hubiera visto antes.

Todo funcionó a la perfección, probablemente porque Java es lo que he estado haciendo 8 horas por día, 5 días a la semana, por más de 2 años a estas alturas.

Java no es glamoroso, pero es cómodo.

![honest-work-meme-c7034f8bd7b11467e1bfbe14b87a5f6a14a5274b.jpg](/uploads/2025-02-12-i-built-the-same-app-thrice/honest-work-meme-c7034f8bd7b11467e1bfbe14b87a5f6a14a5274b.jpg)

## El primer amor: Groovy

Mi viaje con Groovy empezó allá por 2021. Recordé que en la entrevista de laburo solo me preguntaron dos cosas:

- ¿Conocés Java?
- ¿Conocés SQL?

_Era tiempos más simples._

Sin darme cuenta, me sumé a un proyecto construido con [Grails](https://grails.org/), un framework monolítico muy de nicho que usa Groovy como lenguaje principal.

- **Dato curioso**: [MercadoLibre usó intensivamente Groovy y Grails antes de pasarse a Go](https://go.dev/solutions/mercadolibre).
    - Sospecho que la razón de que estos proyectos en particular usaran Grails fue porque alguien de MercadoLibre los inició. Aunque no tengo pruebas de eso.

Me enamoré rápidamente de su sintaxis expresiva y de cómo buscaba mejorar Java reduciendo el código innecesario y adoptando un estilo más dinámico.

- **¿Puntos y coma?** Opcionales.
- **¿Excepciones revisadas?** Resueltas.
- **¿Verbosidad de Java?** Neutralizada por closures y el operador de navegación segura `?.`.

Aun así, Groovy sigue siendo el artista indie de los lenguajes JVM: querido por quienes escriben scripts para Gradle y por los pocos desarrolladores de Grails que existen, sin alcanzar el prestigio académico de Scala ni la fama respaldada por JetBrains de Kotlin.

### El tipado relajado de Groovy

El tipado relajado de Groovy es un arma de doble filo.

Durante la escritura de la versión en Groovy, tuve un problema con CORS. Mi primer sospechoso fue una mala configuración en el `application.yml` (ya que leía los orígenes permitidos desde ese archivo), pero la solución fue esta:

![Screenshot2025-02-11190416.png](/uploads/2025-02-12-i-built-the-same-app-thrice/Screenshot2025-02-11190416.png)

Tenía `as String`, probablemente por una sugerencia de IntelliJ o un copy-paste de ChatGPT, pero eso fue suficiente para romper CORS en la aplicación. Este tipo de errores simplemente no ocurren en Java.

### Escribiendo tests con Spock

Podés usar [JUnit](https://junit.org/junit5/) en un proyecto basado en Groovy, pero sería un desperdicio no utilizar [Spock](https://spockframework.org/) (es como ir a Madrid y no comerse una tortilla).

Siempre me pareció que la sintaxis de Spock era más legible, por preferencia personal. Acá tenés un fragmento de código en Java JUnit y en Groovy Spock, ambos probando la funcionalidad de buscar un Pokémon por ID.

**Java JUnit**:

```java
@Test
void whenFindByIdThenReturnPokemon() {
    when(pokemonRepository.findById(anyLong())).thenReturn(Optional.of(mock(Pokemon.class)));
    assertNotNull(pokemonService.findById(1L));
}
```

**Groovy Spock**:

```groovy
def "when findById then return Pokemon"(){
    given: "a mocked repository behaviour"
    pokemonRepository.findById(_ as Long) >> Optional.of(new Pokemon())

    when: "finding a pokemon"
    def result = pokemonService.findById(1L)

    then: "result is not null"
    result != null
}
```

### Volvería a usar Groovy si tuviera la chance

No es porque sea objetivamente superior, sino porque mantener código debería sentirse como volver a casa. Aunque en esa casa haya un chequeo de tipos flojo y fantasmas misteriosos de `NoSuchMethodError` en el clóset. Supongo que extraño formar parte de un proyecto que realmente me importe, y Groovy me recuerda esos días.

## La decepción: Kotlin

**Descargo de responsabilidad**: Esta fue la primera vez que emprendí un proyecto en Kotlin por mi cuenta, así que quizás mi mala experiencia se deba a cuestiones de habilidad.

![skill-issue-skill-3427506110.gif](/uploads/2025-02-12-i-built-the-same-app-thrice/skill-issue-skill-3427506110.gif)

### OpenAPI Generator no funcionó de inmediato

Soy un gran fan de OpenAPI Generator, y no quiero volver a escribir un DTO nunca más. Usar el [OpenAPI Generator Gradle Plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-gradle-plugin) era básico en Java y Groovy, pero en Kotlin tuve dos problemas:

- Los campos de DTO se declaraban como inmutables usando `val`, pero necesitaba que fueran mutables con `var`.
    - Terminé teniendo que crear una tarea personalizada que recorría las clases generadas y cambiaba `val` por `var`.
- Un parámetro que debía ser nullable (`List<String>?`), no lo era (le faltaba el `?`).
    - La misma solución requirió otra tarea personalizada que hiciera el reemplazo.

Esos pasos adicionales se sintieron como un retroceso en términos de eficiencia. Podés decir _"Bro, simplemente escribí los DTOs vos mismo"_, a lo que yo le respondo _"No tuve que hacerlo en Java y Groovy, ¿por qué tengo que escribirlos acá?"_

### Manejando Java Time en tests

También podés usar JUnit en un proyecto basado en Kotlin, pero sería un desperdicio no probar [MockK](https://mockk.io/). Es bastante cercano a la sintaxis de JUnit.

El problema surgió cuando no pude simular `java.time.Instant` y `java.time.format.DateTimeFormatter`.

- MockK simplemente no pudo, o al menos yo no encontré la forma de hacerlo.
- Tuve que introducir una interfaz solo para abstraer la funcionalidad de `java.time`.
    - Mientras que esta capa extra hizo que los tests pasaran, también agregó una complejidad que no esperaba y empañó un poco la claridad del diseño.

Si tenés curiosidad de cómo es MockK, acá te dejo un test sobre la funcionalidad de buscar un Pokémon por ID:

```kt
@Test
fun `when findById then return Pokemon`() {
    val pokemon = Pokemon(name = "Bulbasaur", spriteUrl = "url")
    every { pokemonRepository.findById(any<Long>()) } returns Optional.of(pokemon)
    
    assertNotNull(pokemonService.findById(1L))
}
```

### No estuvo mal

Pero fueron los pequeños detalles los que no me convencieron. Quizás mis expectativas sobre Kotlin eran un poco demasiado altas, o tal vez simplemente tomé algunos desvíos equivocados en el camino. A pesar de estas frustraciones, no estoy cerrando la puerta a Kotlin por completo.

## Conclusión

- Con una base sólida en Java, podés explorar Groovy, Kotlin y otros lenguajes en el ecosistema JVM.
- La carga de imágenes en la app frontend podría mejorarse si tuviera las imágenes de los Pokémon en la carpeta `public` del proyecto, en lugar de depender de una API de GitHub. Aun así, el tiempo de carga no resulta tan doloroso.
- Me habría gustado probar [Scala](https://www.scala-lang.org/), incluso hice una investigación inicial sobre el [Play Framework](https://www.playframework.com/), pero me distraje adquiriendo un VPS y el resto es historia.