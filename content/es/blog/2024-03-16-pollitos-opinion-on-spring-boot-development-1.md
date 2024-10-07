---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 1: Desarrollo impulsado por contratos"
date: 2024-03-16
description: "Desarrollo impulsado por contratos"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/miko.jpg
---

## Conocimientos previos recomendados

### Java Spring Boot

Aunque el desarrollo impulsado por contratos es agnostico al lenguaje (se originó como un concepto de Programación Orientada a Objetos), toda mi experiencia es en [Java Spring Boot](https://spring.io/projects/spring-boot), y la implementación que voy a utilizar a lo largo de los blogs será en esa tecnología.

Espero que usted, el lector, se sienta cómodo con conceptos de Java Spring Boot (específicamente, Spring Boot 3 y Java 21).

Pondré algunos enlaces útiles con lecturas adicionales de vez en cuando, pero no me detendré a explicar en profundidad.

### OpenAPI Specification (OAS)

_\(copy paste de ChatGPT\)_

La [OpenAPI Specification (OAS)](https://swagger.io/specification/) define una interfaz estándar e independiente del lenguaje para las API HTTP que permite que tanto los humanos como las computadoras descubran y comprendan las capacidades del servicio sin acceso al código fuente, la documentación o mediante la inspección del tráfico de la red.

Cuando se define correctamente, un consumidor puede comprender e interactuar con el servicio remoto con una cantidad mínima de lógica de implementación.

## Objetivos

¿Qué espero lograr con la serie de blogs _"La opinión de Pollito sobre el desarrollo de Spring Boot"_?

- Ser un punto de partida para futuros proyectos Spring Boot.
- Adoptar prácticas de desarrollo impulsado por contratos (CDD).
- Encapsular dependencias esenciales y código estándar de mejores prácticas.
- Darle al desarrollador la propiedad y el control sobre el código.

Sin más que agregar, ¡comencemos!

## Desarrollo impulsado por contratos

En el artículo de Wikipedia _[Design by contract wikipedia article](https://en.wikipedia.org/wiki/Design_by_contract)_, podemos encontrar la siguiente afirmación:

![A design by contract scheme](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/Design_by_contract.png)

> [...] software designers should define formal, precise and verifiable interface specifications for software components, which extend the ordinary definition of abstract data types with preconditions, postconditions and invariants.

A partir de ahí, hice mi propia adaptación de la filosofía de desarrollo impulsado por contratos para la arquitectura de microservicios:

> Los microservicios deben cumplir con un contrato, que define entradas, salidas y errores.

Entonces ¿qué es un contrato?

#### Contrato

Conjunto de aserciones que contienen la siguiente información:

- Valores de entrada válidos y su significado.
- Valores de retorno válidos y su significado.
- Valores de error que pueden ocurrir y su significado.

En un contrato hay dos partes:

- **Consumidor:** proporciona los valores de entrada y espera el retorno.
- **Proveedor:** espera los valores de entrada y proporciona el retorno.

No existen reglas que establezcan con cuántos contratos cumple un microservicio ni qué funciones desempeña en ellos. Pero aquí están mis recomendaciones personales mantenernos lo más cerca posible de la definición original:

1. Un microservicio cumple al menos con un contrato y desempeña el rol de proveedor.
2. Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.
3. Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.

Veamos cada uno con más detalle.

1. Un microservicio cumple al menos con un contrato, desempeñando el rol de proveedor.

![1provider1contractmanyconsumers](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/1provider1contractmanyconsumers.png)

Para un microservicio que sigue estrictamente las prácticas de desarrollo impulsado por contratos, sin cumplir con esta regla, no tiene forma de ser invocado desde fuentes externas.

Tal vez haya situaciones en las que sea necesario tener un microservicio en ejecución pero no poder invocarlo, pero al momento de escribir esto, no se me ocurre ninguna situación.

2. Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.

![1provider2contracts](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/1provider2contracts.png)

Este punto no se trata de desarrollo impulsado por contratos, sino más bien de la filosofía adecuada de los microservicios. Un microservicio está pensado para ocuparse de una sola cosa y hacerla bien. Para lograrlo, tiene sentido que el microservicio sea un proveedor solo una vez, proporcionando los puntos finales para interactuar con la única cosa que hace bien.

Puede haber excepciones totalmente válidas a esto. Un ejemplo claro es un microservicio que expone un punto final [actuator](https://github.com/spring-projects/spring-boot/tree/v3.2.3/spring-boot-project/spring-boot-actuator). Ahora tienes un microservicio que hace dos cosas, su función principal y expone una llamada de comprobación de estado. Y eso está totalmente bien.

3. Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.

![zero](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/zero.png)
![one](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/one.png)
![many](/uploads/2024-03-16-pollitos-opinion-on-spring-boot-development-1/many.png)

## TL;DR: ¿Qué sacar de este blog?

- Los microservicios deben cumplir con un contrato, que define entradas, salidas y errores.
- Un contrato es un conjunto de aserciones que contienen la siguiente información:
  - Valores de entrada válidos y su significado.
  - Valores de retorno válidos y su significado.
  - Valores de error que pueden ocurrir y su significado.
- En un contrato hay dos partes:
  - **Consumidor:** proporciona los valores de entrada y espera el retorno.
  - **Proveedor:** espera los valores de entrada y proporciona el retorno.
- Un microservicio cumple al menos con un contrato, desempeñando el rol de proveedor.
- Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.

## Inspiración (¿Por qué estoy escribiendo esta serie de blogs?)

### Solución interna del Banco Pichincha

En mi rol actual como Desarrollador Backend en Banco Pichincha como miembro del equipo de Onboarding y Seguridad, el desarrollo impulsado por contratos es obligatorio.

Para ayudar con eso, el banco compró esta librería súper secreta y poderosa a la cual dada algunos yaml + configuraciones en build.gradle, en la compilación genera muchos codigo relacionados con cosas como interfaces de controlador, interfaces de clientes, entidades de bases de datos, e incluso se le puede decir a la librería si desea el proyecto en forma MVC o Spring Reactor. Está construido sobre [OpenAPI Generator](https://openapi-generator.tech/), un proyecto de código abierto centrado en la generación de código. Lamentablemente no puedo revelar mucha más información.

Aunque esto es fantástico, este enfoque tiene dos grandes problemas:

- **Tener una librería para hacerlo todo puede no ser el camino a seguir:** Algunos compañeros de trabajo mencionan que generalmente genera más código del necesario y que tienen que lidiar con eso porque no es exactamente lo que se necesita.

- **Estás encerrado en la librería y sus requisitos:** Una librería que lo hace todo incluye muchas cosas detrás de escena sobre las que no tienes ningún control y, peor aún, a las que tienes que adaptarte. Ejemplo: hasta hace unos meses, esta biblioteca sólo permitía Java 17 + Spring Boot 2.4.x. ¿Qué pasaría si quisiera utilizar Spring Boot 3? ¿O por alguna razón es necesario cambiar a Java 11? Bueno, no podías, estabas encerrado.

Esto conduce a los cuatro objetivos mencionados sobre los que se basa este manifiesto:

- Ser un punto de partida para futuros proyectos Spring Boot.
- Adoptar prácticas de desarrollo impulsado por contratos (CDD).
- Encapsular dependencias esenciales y código estándar de mejores prácticas.
- Darle al desarrollador la propiedad y el control sobre el código.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) es una colección de componentes reutilizables que puedes copiar y pegar en tus aplicaciones. Puede utilizar cualquier marco que admita React.

¿Cómo es eso una inspiración para los proyectos Spring Boot? Está en el lado opuesto del espectro del desarrollo. La inspiración proviene de esta sección en la [preguntas frecuentes](https://ui.shadcn.com/docs):

> La idea detrás de esto es brindarle propiedad y control sobre el código, permitiéndole decidir cómo se construyen y diseñan los componentes. Comience con algunos valores predeterminados sensatos y luego personalice los componentes según sus necesidades. Uno de los inconvenientes de empaquetar los componentes en un paquete npm es que el estilo va unido a la implementación. El diseño de sus componentes debe estar separado de su implementación.

Eso se alinea perfectamente con uno de los objetivos:

- Darle al desarrollador la propiedad y el control sobre el código.

Tener un punto de partida es excelente, pero eso no debería ser un problema cuando los requisitos del negocio exigen que nos adaptemos.

### Anotar mis conocimientos

No hay mucho que explicar aquí, quiero escribir lo que sé actualmente, para que no se pierda nada. Y cuando alguien me pregunte "¿cuál es tu conocimiento de Java?", simplemente lo enviaré aquí.

## Siguiente lectura

[La opinión de Pollito acerca del desarrollo en Spring Boot 2: Mejores prácticas](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2)
