---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 0: Introducción"
date: 2024-10-02
description: "Objetivos e Inspiración"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-0/5a2c3eb9e5652bdecea44c54f8f55f22.jpg
---

<!-- TOC -->
  * [Conocimientos previos recomendados](#conocimientos-previos-recomendados)
  * [Objetivos](#objetivos)
  * [Inspiración (¿Por qué estoy escribiendo esta serie de blogs?)](#inspiración-por-qué-estoy-escribiendo-esta-serie-de-blogs)
    * [Solución interna del Banco Pichincha](#solución-interna-del-banco-pichincha)
    * [shadcn/ui](#shadcnui)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Conocimientos previos recomendados

Espero que usted, el lector, se sienta cómodo con conceptos de [Java Spring Boot](https://spring.io/projects/spring-boot) (específicamente, Spring Boot 3 y Java 21).

Pondré algunos enlaces útiles con lecturas adicionales de vez en cuando, pero no me detendré a explicar en profundidad.

Puede que estés pensando:

> Pero Spring Boot es enorme, no hay forma de que necesite saberlo todo

A lo que yo digo, sí, tienes razón :D

A continuación, una lista de conceptos que considero importantes para al menos reconocer su existencia:

| Concepto                              | Definición simple                                                                                                                                 | Lectura recomendada                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @AspectJ                              | Framework AOP basado en anotaciones utilizado para definir responsabilidades transversales como el registro o la gestión de transacciones.        | [Intro to AspectJ](https://www.baeldung.com/aspectj)                                                                                                                                                         |
| @ConfigurationProperties              | Vincula propiedades de configuración externas (por ejemplo, de application.properties) a objetos Java en Spring Boot.                             | [Guide to @ConfigurationProperties in Spring Boot](https://www.baeldung.com/configuration-properties-in-spring-boot)                                                                                         |
| @FeignClient                          | Crea de forma declarativa clientes REST en Spring, simplificando las llamadas de servicio a servicio.                                             | [Navigating Client-Server Communication with Spring’s @FeignClient Annotation](https://medium.com/@AlexanderObregon/navigating-client-server-communication-with-springs-feignclient-annotation-70376157cefd) |
| @RestController                       | Combina @Controller y @ResponseBody, simplificando la creación de servicios web RESTful en Spring.                                                | [The Spring @Controller and @RestController Annotations](https://www.baeldung.com/spring-controller-vs-restcontroller)                                                                                       |
| @RestControllerAdvice                 | Un @ControllerAdvice especializado para manejar excepciones en todos los @RestControllers.                                                        | [@RestControllerAdvice example in Spring Boot](https://www.bezkoder.com/spring-boot-restcontrolleradvice/)                                                                                                   |
| Declarative vs Imperative programming | Declarativo expresa lo que el programa debe hacer, mientras que imperativo describe cómo hacerlo paso a paso.                                     | [Declarative vs imperative](https://dev.to/ruizb/declarative-vs-imperative-4a7l)                                                                                                                             |
| Design by contract                    | Un método de diseño de software donde las funciones declaran precondiciones, poscondiciones e invariantes.                                        | [Design by contract](https://en.wikipedia.org/wiki/Design_by_contract)                                                                                                                                       |
| DTO classes                           | Los objetos de transferencia de datos son clases simples que se utilizan para transportar datos entre procesos sin lógica empresarial.            | [The DTO Pattern (Data Transfer Object)](https://www.baeldung.com/java-dto-pattern)                                                                                                                          |
| ErrorDecoder                          | Permite el manejo personalizado de errores HTTP en clientes Feign al decodificar las respuestas de error en excepciones significativas.           | [Handling Exceptions in Feign Client with ErrorDecoder](https://medium.com/@mtl98/handling-exceptions-in-feign-client-with-errordecoder-28a7a17f81a6)                                                        |
| Fast fail exception handling          | Una técnica en la que los sistemas detienen la ejecución inmediatamente al encontrar un error, impidiendo así el procesamiento posterior.         | [Fast fail exception handling](https://medium.com/@qbyteconsulting/fast-fail-exception-handling-9bba83f7cce7)                                                                                                |
| Filter                                | Intercepta y procesa solicitudes y respuestas HTTP en una aplicación Spring Boot.                                                                 | [Spring Boot – Servlet Filter](https://www.geeksforgeeks.org/spring-boot-servlet-filter/)                                                                                                                    |
| Lombok                                | Una biblioteca que reduce el código repetitivo en Java, proporcionando anotaciones para generar código automáticamente.                           | [Introduction to Project Lombok](https://www.baeldung.com/intro-to-project-lombok)                                                                                                                           |
| MapStruct                             | Un generador de código que simplifica el proceso de mapeo entre modelos de objetos Java.                                                          | [Quick Guide to MapStruct](https://www.baeldung.com/mapstruct)                                                                                                                                               |
| Monitoring and Observability          | Herramientas y prácticas que ayudan a realizar un seguimiento del estado y el rendimiento del sistema y a detectar problemas en las aplicaciones. | [Monitoring and Observability with Spring Boot 3](https://medium.com/@minadev/monitoring-and-observability-with-spring-boot-3-2cb9cdb74a85)                                                                  |
| OpenAPI Generator                     | Una herramienta que genera código cliente/servidor basado en una especificación OpenAPI.                                                          | [OpenAPI Generator](https://openapi-generator.tech/)                                                                                                                                                         |
| OpenAPI Specification (OAS)           | Un estándar para definir API RESTful, que proporciona un contrato de API legible por máquina para documentación y generación de clientes.         | [OpenAPI Specification](https://swagger.io/specification/)                                                                                                                                                   |
| PIT Mutation Testing                  | Un enfoque de prueba en el que se realizan pequeñas mutaciones en el código para garantizar que las pruebas puedan detectar cambios y errores.    | [PIT Mutation Testing](https://pitest.org/)                                                                                                                                                                  |
| ProblemDetail                         | Formato estandarizado para devolver información de errores detallada en las API REST.                                                             | [Spring Rest - Exception Handling - Problem Details](https://dev.to/noelopez/spring-rest-exception-handling-problem-details-2hkj)                                                                            |
| Spring Boot - Actuator                | Proporciona endpoints para monitorear y administrar una aplicación Spring Boot en producción.                                                     | [A Comprehensive Guide to Spring Boot Actuator](https://medium.com/@pratik.941/a-comprehensive-guide-to-spring-boot-actuator-c2bd63a32ede)                                                                   |
| Spring Initialzr                      | Una herramienta web que ayuda a generar plantillas de proyectos Spring Boot con las dependencias deseadas.                                        | [Create Spring Boot application using initializr in 5 minutes](https://medium.com/railsfactory/create-spring-boot-application-using-initializr-in-5-mins-c70fc62fd7b0)                                       |
| Spring Web                            | El módulo de Spring Boot para crear aplicaciones web, incluidas API REST y aplicaciones basadas en MVC.                                           | [Exploring the Spring Web Dependency — A Beginner’s Overview](https://medium.com/@AlexanderObregon/exploring-the-spring-web-dependency-a-beginners-overview-f19e4620ef5e)                                    |

Si hay cosas de las que no estás seguro o que nunca has puesto en práctica, no te preocupes demasiado. Aprenderás sobre la marcha (pero no esperes de mí una explicación detallada).

## Objetivos

¿Qué espero lograr con la serie de blogs _"La opinión de Pollito sobre el desarrollo de Spring Boot"_?

- Ser una demostración de cómo consumir y crear una API siguiendo los principios del Desarrollo impulsado por contratos.
- Dar al desarrollador la propiedad y el control sobre el código.

## Inspiración (¿Por qué estoy escribiendo esta serie de blogs?)

### Solución interna del Banco Pichincha

En mi rol actual, el desarrollo impulsado por contratos es obligatorio.

Para ayudar con eso, el banco compró esta librería súper secreta y poderosa a la cual dada algunos yaml + configuraciones en build.gradle, en la compilación genera mucho código relacionado con cosas como interfaces de controlador, interfaces de clientes, entidades de bases de datos, e incluso se le puede decir a la librería si desea el proyecto en forma MVC o Spring Reactor.

No tengo pruebas definitivas sobre la siguiente afirmación, pero creo que la biblioteca súper secreta y poderosa está construida sobre un fork de [OpenAPI Generator](https://openapi-generator.tech/), un proyecto de código abierto centrado en la generación de código.

Este enfoque tiene dos grandes problemas:

- **Tener una librería para hacerlo todo puede no ser el camino a seguir:** Algunos compañeros de trabajo mencionan que generalmente genera más código del necesario y que tienen que lidiar con eso porque no es exactamente lo que se necesita.

- **Estás encerrado en la librería y sus requisitos:** Una librería que lo hace todo incluye muchas cosas detrás de escena sobre las que no tienes ningún control y, peor aún, a las que tienes que adaptarte. Ejemplo: hasta hace unos meses, esta biblioteca sólo permitía Java 17 + Spring Boot 2.4.x. ¿Qué pasaría si quisiera utilizar Spring Boot 3? ¿O por alguna razón es necesario cambiar a Java 11? Bueno, no podías, estabas encerrado.

Pero incluso con esos problemas, no estoy en contra de la idea. Soy el tipo de desarrollador que prefiere la programación declarativa a la programación imperativa.

¿Qué preferirías?

- Escribir [clases DTO](https://www.baeldung.com/java-dto-pattern)
- Declarar en un archivo yaml la estructura de lo que espero y retorno

El tutorial típico de Youtube y Udemy preferiría lo primero, yo prefiero lo segundo.

**La idea de Banco Pichincha es buena, la ejecución salió mal.** ¡Sé qué se puede hacer mejor! Eso llevó a la creación de esta serie de blogs.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) es una colección de componentes reutilizables que puedes copiar y pegar en tus aplicaciones. Puede utilizar cualquier marco que admita React.

¿Cómo es eso una inspiración para los proyectos Spring Boot? Está en el lado opuesto del espectro del desarrollo. La inspiración proviene de esta sección en [preguntas frecuentes](https://ui.shadcn.com/docs):

> La idea detrás de esto es brindarle propiedad y control sobre el código, permitiéndole decidir cómo se construyen y diseñan los componentes. Comience con algunos valores predeterminados sensatos y luego personalice los componentes según sus necesidades. Uno de los inconvenientes de empaquetar los componentes en un paquete npm es que el estilo va unido a la implementación. El diseño de sus componentes debe estar separado de su implementación.

Eso se alinea perfectamente con uno de los objetivos:

- Dar al desarrollador la propiedad y el control sobre el código.

Tener un punto de partida es excelente, pero eso no debería ser un problema cuando los requisitos del negocio exigen que nos adaptemos.

## Siguiente lectura

[La opinión de Pollito acerca del desarrollo en Spring Boot 1: Desarrollo impulsado por contratos](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-1)
