---
author: "Franco Becvort"
title: "Construí la misma aplicación tres veces"
date: 2025-02-11
description: "Groovy, Java, Kotlin"
categories: ["Programing talk"]
thumbnail: /uploads/2025-02-11-i-built-the-same-app-thrice/thrice.jpg
---
<!-- TOC -->
  * [Inspiración](#inspiración)
  * [Entendiendo la aplicación](#entendiendo-la-aplicación)
  * [No existe un Lo Bueno, Lo Malo y lo Feo](#no-existe-un-lo-bueno-lo-malo-y-lo-feo)
  * [Lo Bueno: Java](#lo-bueno-java)
  * [El Primer Amor: Groovy](#el-primer-amor-groovy)
    * [Groovy relaxed typing](#groovy-relaxed-typing)
    * [Writing tests with Spock](#writing-tests-with-spock)
    * [Volvería a utilizar Groovy si tuviera la oportunidad](#volvería-a-utilizar-groovy-si-tuviera-la-oportunidad)
  * [La Decepción: Kotlin](#la-decepción-kotlin)
    * [El generador OpenAPI no funcionó de inmediato](#el-generador-openapi-no-funcionó-de-inmediato)
    * [Manejo de java time en las pruebas](#manejo-de-java-time-en-las-pruebas)
    * [No estuvo mal](#no-estuvo-mal)
  * [Conclusión](#conclusión)
<!-- TOC -->

## Inspiración
Este blog está fuertemente inspirado en el video de Theo _"I built the same app with 5 different stacks"_.

{{< youtube O-EWIlZW0mM >}}

Así que decidí hacer mi propia versión, pero con dos lenguajes que ya conozco bien ([Java](https://www.java.com/) y [Groovy](http://www.groovy-lang.org/)) más un lenguaje nuevo que quería probar desde hace mucho tiempo: [Kotlin](https://kotlinlang.org/).

Aquí está el código para los repositorios:
- [Java version](https://github.com/franBec/roundest_java)
- [Groovy version](https://github.com/franBec/roundest_groovy)
- [Kotlin version](https://github.com/franBec/roundest_kotlin)

## Entendiendo la aplicación

Hice el típico ejercicio de programación de "Roundest Pokémon":
- Visita el resultado final en [roundest-pokemon.pollito.tech](https://roundest-pokemon.pollito.tech/)
- No planeo ejecutar el proyecto por siempre, ya que podría necesitar la potencia computacional del VPS en el que se ejecuta para otros proyectos personales. Entonces, si el enlace no te lleva a ninguna parte, llegaste tarde.

Le agregué un giro:

- En la parte superior de la página, puedes elegir qué sistema backend procesa tu voto (Next.js + _).
![backend-selector.gif](/uploads/2025-02-03-vps-5/backend-selector.gif)
- No importa qué backend elijas, todos los votos terminan en el mismo lugar.
![vote-flow.gif](/uploads/2025-02-03-vps-5/vote-flow.gif)
- La aplicación frontend (lo que interactúa con el navegador) está hecha en **Next.js**.
    - Sí, puedo hacer frontend.
    - Soy un fanático de [Next.js](https://nextjs.org/) y [Tailwind](https://tailwindcss.com/).
    - Creo que [react-query](https://tanstack.com/query/latest/docs/framework/react/overview) es el mejor paquete jamás creado (mención honorífica [swr](https://swr.vercel.app/)).
    - Veo todos los [videos de Theo](https://www.youtube.com/@t3dotgg).
    - Me gusta reir de [JQuery](https://jquery.com/) a pesar de que [la mitad de Internet está hecha con eso](https://www.reddit.com/r/webdev/comments/r7nz99/jquery_is_still_used_on_80_of_websites/)... (los recuerdos de las páginas web del gobierno argentino hechas con JQuery + Bootstrap todavía me persiguen mientras duermo).
![jquery.jpg](/uploads/2025-02-11-i-built-the-same-app-thrice/jquery.jpg)

Aquí está el [código del frontend de Next.js](https://github.com/franBec/roundest_nextjs).

## No existe un Lo Bueno, Lo Malo y lo Feo
Las tres opciones son totalmente válidas para un gran proyecto serio y se englobarían en "Lo Bueno".

Yo diría que una frase más acertada sería "Lo Bueno, el Primer Amor y la Decepción". Vayamos una por una.

## Lo Bueno: Java
Comencemos insertando aquí la broma `public static void String main args`.
{{< youtube m4-HM_sCvtQ >}}

Dato curioso: `public static void String main args` [ya no es necesario desde Java 21](https://medium.com/@shwetha.narayan/java-21-no-more-public-static-void-main-c90334d6d95e).

En una palabra, Java es **confiable**:
- Es reconfortante saber que cuenta con el respaldo de una gran comunidad y una gran cantidad de documentación y prácticas recomendadas.
- Sería extraño que encuentres un error que nadie más haya tenido antes.

Todo funcionó, probablemente porque Java es lo que he estado haciendo durante 8 horas al día, 5 días a la semana, durante más de 2 años.

Java no es glamuroso, pero sí cómodo.

![honest-work-meme-c7034f8bd7b11467e1bfbe14b87a5f6a14a5274b.jpg](/uploads/2025-02-11-i-built-the-same-app-thrice/honest-work-meme-c7034f8bd7b11467e1bfbe14b87a5f6a14a5274b.jpg)

## El Primer Amor: Groovy
Mi viaje con Groovy comenzó en 2021. Recuerdo que en la entrevista de trabajo solo me preguntaron dos cosas:

- ¿Sabes Java?
- ¿Sabes SQL?

_Era una época más sencilla._

Sin darme cuenta, era parte de un proyecto [Grails](https://grails.org/), un marco monolítico bien raro que usa Groovy como su lenguaje principal.

Rápidamente, me enamoré de su sintaxis expresiva y su forma de mejorar Java reduciendo el código repetitivo y adoptando un estilo más dinámico.

- **¿Punto y coma?** Opcional.
- **¿Checked Exceptions?** Manejadas.
- **¿Verbosidad de Java?** Neutralizada con closures y el operador `?.`.

Sin embargo, Groovy sigue siendo el artista independiente de los lenguajes JVM: amado por los escritores de scripts de Gradle y algunos desarrolladores de Grails, pero nunca alcanzó el prestigio académico de Scala ni la fama de Kotlin respaldada por JetBrains.

### Groovy relaxed typing

La escritura relajada en Groovy es un arma de doble filo.

Durante la redacción de la versión de Groovy, tuve un problema con CORS. Mi primera sospecha inmediata fue una configuración incorrecta de `application.yml` (ya que leo los orígenes permitidos de ese archivo), pero la solución fue la siguiente:

![Screenshot2025-02-11190416.png](/uploads/2025-02-11-i-built-the-same-app-thrice/Screenshot2025-02-11190416.png)

Tenía "as String", probablemente como una sugerencia de IntelliJ o un copia y pega de ChatGPT, pero eso fue suficiente para romper CORS en la aplicación. Este tipo de errores simplemente no ocurren en Java.

### Writing tests with Spock

Puedes usar [JUnit](https://junit.org/junit5/) en un proyecto basado en Groovy, pero sería un desperdicio no usar [Spock](https://spockframework.org/) (es como ir a Madrid y no comer una tortilla).

Siempre me pareció más legible la sintaxis de Spock, aunque es una preferencia personal. Aquí tienes un fragmento de código en Java Junit y Groovy Spock, ambos probando la función de buscar Pokémon por ID

**Java JUnit**
```java
@Test
void whenFindByIdThenReturnPokemon() {
    when(pokemonRepository.findById(anyLong())).thenReturn(Optional.of(mock(Pokemon.class)));
    assertNotNull(pokemonService.findById(1L));
}
```
**Groovy Spock**
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
### Volvería a utilizar Groovy si tuviera la oportunidad

No porque sea objetivamente superior, sino porque mantener el código debería ser como volver a casa, incluso si en casa hay fugas de type checking y misteriosos NoSuchMethodError fantasmas en el armario. Supongo que echo de menos ser parte de un proyecto que realmente me importa, y Groovy me recuerda a esos días.

## La Decepción: Kotlin

**Disclaimer**: Esta fue mi primera vez iniciando un proyecto Kotlin solo, por lo que tal vez mi mala experiencia se deba a skill issue.
![skill-issue-skill-3427506110.gif](/uploads/2025-02-11-i-built-the-same-app-thrice/skill-issue-skill-3427506110.gif)

### El generador OpenAPI no funcionó de inmediato

Soy un gran fan de OpenAPI Generator y no quiero volver a escribir nunca más un DTO. Usar el [complemento de Gradle de OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-gradle-plugin) fue muy simple en Java y Groovy, pero en Kotlin tuve un gran problema: los campos DTO se declaraban como inmutables usando `val`, pero necesitaba que fueran mutables con `var`.

- No encontré ninguna bandera, documento o issue que hablara sobre esto. Esta sensación de "¿soy el primero con este problema o no estoy buscando correctamente?", nunca sucede en Java.
- Terminé teniendo que crear una tarea de solución personalizada que escaneara las clases generadas e intercambiara val por var. Este paso adicional se sintió como un paso atrás en términos de eficiencia.

```gradle
val replaceValWithVar by
    tasks.register<DefaultTask>("replaceValWithVar") {
      group = "custom"
      description = "Replaces all occurrences of 'val' with 'var' in generated models."

      doLast {
        val sourceDir =
            file(
                "build/generated/sources/openapi/src/main/kotlin/dev/pollito/roundest_kotlin/model")
        if (sourceDir.exists()) {
          sourceDir
              .walkTopDown()
              .filter { it.isFile && it.extension == "kt" }
              .forEach { file ->
                val originalContent = file.readText(Charsets.UTF_8)
                val updatedContent = originalContent.replace("val ", "var ")

                if (originalContent != updatedContent) {
                  file.writeText(updatedContent, Charsets.UTF_8)
                  logger.lifecycle("Modified: ${file.absolutePath}")
                } else {
                  logger.lifecycle("Unchanged: ${file.absolutePath}")
                }
              }
        } else {
          logger.lifecycle("Source directory does not exist: $sourceDir")
        }
      }
    }

tasks.named("openApiGenerate") { finalizedBy("replaceValWithVar") }
```
### Manejo de java time en las pruebas

También puedes usar JUnit en un proyecto basado en Kotlin, pero sería un desperdicio no probar [MockK](https://mockk.io/). Es bastante similar a la sintaxis de JUnit.

El problema llegó cuando no pudo simular `java.time.Instant` y `java.time.format.DateTimeFormatter`.

- MockK simplemente no pudo, o al menos yo no pude encontrar una manera de hacerlo.
- Tuve que introducir una interfaz solo para abstraer la funcionalidad de `java.time`.
  - Si bien esta capa adicional hizo que las pruebas pasaran, también agregó una complejidad que no había previsto y ensució un poco la claridad del diseño.

Si tienes curiosidad sobre cómo se ve MockK, aquí tienes una prueba de la función de buscar Pokémon por ID:

```kt
@Test
fun `when findById then return Pokemon`() {
    val pokemon = Pokemon(name = "Bulbasaur", spriteUrl = "url")
    every { pokemonRepository.findById(any<Long>()) } returns Optional.of(pokemon)
    
    assertNotNull(pokemonService.findById(1L))
}
```

### No estuvo mal

Pero fueron los pequeños detalles los que no me convencieron. Tal vez mis expectativas sobre Kotlin eran demasiado altas, o tal vez simplemente tomé algunos caminos equivocados en el camino. A pesar de estas frustraciones, no le cierro la puerta a Kotlin por completo.

## Conclusión
- Con una base sólida en Java, puedes explorar Groovy, Kotlin y otros lenguajes en el ecosistema JVM.
- Me hubiera gustado probar [Scala](https://www.scala-lang.org/), incluso hice una investigación inicial sobre [Play Framework](https://www.playframework.com/), pero me distraje al adquirir un VPS y el resto es historia.