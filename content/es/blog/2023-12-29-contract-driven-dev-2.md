---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 2: Elaboración de un escenario de práctica"
date: 2023-12-29
description: "Creemos una aplicación sencilla para poner en práctica algunas ideas"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2023-12-29-contract-driven-dev2/DALL·E2024-01-2510.33.51.png
---

_Creemos una aplicación sencilla para poner en práctica algunas ideas._

## Consulta el repositorio de github

Esta es una continuación de [Desarrollo impulsado por contratos: Creación de microservicios desde cero](/es/blog/2023-12-28-contract-driven-dev).

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-2](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-2)

## Bocetando la aplicación

Después de un vistazo muy rápido a [AnyAPI](https://any-api.com/), elegí las APIs [weatherstack](https://weatherstack.com/) y [mediastack](https://mediastack.com/) para consumir en la aplicación de prueba. Crear una cuenta gratuita en ambos es bastante sencillo y más que suficiente para nuestro propósito.

Entonces, ¿qué hará la aplicación?

- Dado el nombre de una ciudad, mostraremos el clima actual y algunas noticias aleatorias relacionadas con el país en el que se encuentra la ciudad.
- También tendrá una sección de comentarios falsos, solo para justificar la creación de un punto final POST en el backend.

![architecture](/uploads/2023-12-29-contract-driven-dev2/Untitled-2023-04-13-2132.png)
Perdón por que la imagen parezca tan pequeña. No dudes en hacer clic derecho -> abrir imagen en una pestaña nueva.

Observaciones:

- El endpoint de noticias espera el país, pero en el frontend solo tengo ciudad. Para resolver eso, podría haber usado alguna API de Google Maps que me permita f(ciudad)=país. Pero eso implica dinero que no quiero gastar en un proyecto de muestra. En su lugar, usaré la propiedad location.country en la respuesta exitosa 200 de la API meteorológica. Esta no es una solución ideal porque ahora las noticias dependen del clima, pero nuevamente, esto es solo un proyecto de muestra. En una situación ideal, cada funcionalidad debería apuntar a un microservicio por sí sola.
- No me molestaré en funciones como autocompletar o en distinguir entre ciudades con el mismo nombre. En caso de que estés buscando entre dos ciudades con el mismo nombre, dejaré que la API meteorológica decida lo que quiera devolver.

## Comencemos: Creando el backend Java Spring Boot

Aquí está la parte más difícil: encontrar un nombre. Después de pedirle ideas a chatGPT, una se destacó: _SpringCityExplorer_. Así que sí, ahora esto es oficialmente **El Proyecto Pollito Spring City Explorer**.

Ahora vamos a [Spring Initializr](https://start.spring.io/), y:

- Project: Maven.
- Language: Java.
- Spring Boot: 3.2.1.
- Completar los metadatos del proyecto como desee.
- Packaging: Jar.
- Java: 17.
  - ¿Por qué no 21? Dos razones...
    - Al intentar ejecutar un proyecto Maven con Java 21 aparece [java: error: release version 5 not supported](https://stackoverflow.com/questions/59601077/intellij-errorjava-error-release-version-5-not-supported). Y la solución implica lidiar con pom.xml, algo que se supone que no debemos hacer en esta etapa inicial de creación de un proyecto.
    - Sin embargo, la razón principal es que ya sé que tendremos que cambiar a Java 17 debido a algunas dependencias en el futuro. Así que será mejor que me ahorre el problema ahora que estamos en una fase temprana del desarrollo.
- Algunas dependencias para comenzar: Lombok, Spring Web y Spring Boot Dev Tools.

Con todo eso, estamos listos, haga clic en Generar, guarde el zip, extraiga donde quiera, ábralo con su IDE favorito. El mío es IntelliJ IDEA 2021.3.2 (Ultimate Edition).

![Spring Initializr](/uploads/2023-12-29-contract-driven-dev2/screencapture-start-spring-io-2023-12-29-14_39_14.png)

Después de abrir el proyecto, realice una limpieza y compilación rápidas de Maven. Cualquier problema que aparezca aquí probablemente se deba a algún conflicto relacionado con Java en su PC, IDE y/o una combinación de ambos. Google es tu mejor amigo aquí.

Si todo está bien, vaya a la clase principal (anotada con @SpringBootApplication), ejecútela y estaremos listos para comenzar.

- Si en algún momento aparece un mensaje de Lombok solicitando algo, simplemente di que sí.

Después de unos segundos, vaya a [localhost](http://localhost:8080/) y debería ver un mensaje de error.

![Spring default error](/uploads/2023-12-29-contract-driven-dev2/screencapture-localhost-8080-2023-12-29-15_57_47.png)

Ahora es un buen momento para iniciar un git y terminar aquí. La siguiente parte crearemos las especificaciones de OpenAPI para que las implementen los controladores y para que los feign-clients extienda.
