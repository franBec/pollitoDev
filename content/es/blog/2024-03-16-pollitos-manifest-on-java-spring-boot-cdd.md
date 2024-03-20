---
author: "Franco Becvort"
title: "Manifiesto de Pollito sobre el desarrollo basado en contratos de Java Spring Boot para microservicios 1"
date: 2024-03-16
description: "Objetivos y Definiciones"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/miko.jpeg
---

## Objetivos

- Ser un punto de partida para futuros proyectos Spring Boot.
- Adoptar prácticas de desarrollo impulsado por componentes (CDD).
- Encapsular dependencias esenciales y estándares de mejores prácticas.
- Otorgar al desarrollador propiedad y control sobre el código.

## Definiciones

- Los microservicios deben cumplir con un contrato, que define entradas, salidas y errores.
- Un contrato es un conjunto de afirmaciones que contienen la siguiente información:
  - Valores de entrada válidos y su significado.
  - Valores de retorno válidos y su significado.
  - Valores de error que pueden producirse y su significado.
- En un Contrato existen dos partes:
  - **Consumidor:** Proporciona los valores de entrada y espera la devolución.
  - **Proveedor:** Espera los valores de entrada y proporciona la devolución.
- Un microservicio cumple al menos con un contrato, desempeñando el papel de proveedor.
- Un microservicio puede desempeñar el papel de consumidor en cero, uno o muchos contratos.

## Conocimiento previo recomendado

### Java Spring Boot

Aunque el desarrollo basado en contratos es independiente del lenguaje (se originó como un concepto de programación orientada a objetos), toda mi experiencia está en [Java Spring Boot](https://spring.io/projects/spring-boot), y la implementación en este blog utilizará esa tecnología.

Por lo que se recomienda sentirse cómodo con los conceptos de Java Spring Boot. Pondré algunos enlaces útiles con lecturas adicionales de vez en cuando, pero no me detendré en explicar.

### Desarrollo impulsado por contratos

En el _[artículo de wikipedia Diseño por contrato](https://en.wikipedia.org/wiki/Design_by_contract)_, podemos encontrar la siguiente afirmación:

![A design by contract scheme](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/Design_by_contract.png)

> [...] los diseñadores de software deberían definir especificaciones de interfaz formales, precisas y verificables para los componentes de software, que amplíen la definición ordinaria de tipos de datos abstractos con precondiciones, postcondiciones e invariantes.

A partir de ahí, hice mi propia adaptación de la filosofía de desarrollo basado en contratos para la arquitectura de microservicios:

> Los microservicios deben cumplir con un contrato, que define entradas, salidas y errores.

Definamos qué es un contrato.

#### Contrato

Conjunto de aserciones que contienen la siguiente información:

- Valores de entrada válidos y su significado.
- Valores de retorno válidos y su significado.
- Valores de error que pueden producirse y su significado.

En un Contrato hay dos partes:

- **Consumidor:** Proporciona los valores de entrada y espera la devolución.
- **Proveedor:** Espera los valores de entrada y proporciona la devolución.

No existen reglas que indiquen cuántos contratos cumple un microservicio ni qué roles desempeña en ellos. Pero aquí van algunas de mis recomendaciones personales:

- **Un microservicio cumple al menos con un contrato, desempeñando el rol de proveedor.**

![1provider1contractmanyconsumers](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/1provider1contractmanyconsumers.png)

Para un microservicio que sigue estrictamente las prácticas de desarrollo basado en contratos, sin cumplir con esta regla, no tiene forma de ser invocado desde fuentes externas.

Tal vez haya escenarios en los que sea necesario tener un microservicio ejecutándose pero no poder invocarlo, pero al momento de escribir esto, no se me ocurre ningún escenario.

- **Un microservicio desempeña el rol de proveedor en uno y sólo uno de sus contratos.**

![1provider2contracts](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/1provider2contracts.png)

En realidad, esto no es propio del desarrollo impulsado por contratos, sino más bien una filosofía de los microservicios. Un microservicio está destinado a ocuparse de una sola cosa y hacerlo bien. Para lograr eso, tiene sentido que el microservicio sea solo un proveedor una vez, proporcionando los endpoints para interactuar con lo único que hace bien.

Puede haber excepciones totalmente válidas a esto. Un ejemplo claro es un microservicio que expone un endpoint [actuator](https://github.com/spring-projects/spring-boot/tree/v3.2.3/spring-boot-project/spring-boot-actuator). Ahora tiene un microservicio que hace dos cosas: su función principal y exponer un health check. Y eso está totalmente bien.

- **Un microservicio puede desempeñar el papel de consumidor en cero, uno o muchos contratos.**

![zero](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/zero.png)
![one](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/one.png)
![many](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/many.png)

### OpenAPI Specification (OAS)

La [OpenAPI Specification (OAS)](https://swagger.io/specification/) define una interfaz estándar independiente del lenguaje para las API HTTP que permite que tanto los humanos como las computadoras descubran y comprendan las capacidades del servicio sin acceso a la fuente. código, documentación o mediante inspección del tráfico de red. Cuando se define correctamente, un consumidor puede comprender e interactuar con el servicio remoto con una cantidad mínima de lógica de implementación.

En el desarrollo impulsado por contratos, una OpenAPI Specification (OAS) es, de hecho, un contrato.

### Programación Orientada a Aspectos

La programación orientada a aspectos (AOP) le permite separar las preocupaciones transversales (como el registro, la seguridad o las transacciones) de la lógica empresarial principal de su aplicación. En mi caso, lo usaré para fines de registro.

Puede obtener más información en [Introducción de baeldung a Spring AOP](https://www.baeldung.com/spring-aop).

## Inspiración

### Solución interna del Banco Pichincha

En mi rol actual como Desarrollador Backend en Banco Pichincha como miembro del equipo de Onboarding y Seguridad, el Desarrollo Basado en Contratos es obligatorio.

Para ayudar con eso, el banco compró esta librería súper secreta y poderosa a la cual dada algunos yaml + configuraciones en build.gradle, en la compilación genera muchos codigo relacionados con cosas como interfaces de controlador, interfaces de clientes, entidades de bases de datos, e incluso se le puede decir a la librería si desea el proyecto en forma MVC o Spring Reactor. Está construido sobre [OpenAPI Generator](https://openapi-generator.tech/), un proyecto de código abierto centrado en la generación de código. Lamentablemente no puedo revelar mucha más información.

Aunque esto es fantástico, este enfoque tiene dos grandes problemas:

- **Tener una librería para hacerlo todo puede no ser el camino a seguir:** Algunos compañeros de trabajo mencionan que generalmente genera más código del necesario y que tienen que lidiar con eso porque no es exactamente lo que se necesita.

- **Estás encerrado en la librería y sus requisitos:** Una librería que lo hace todo incluye muchas cosas detrás de escena sobre las que no tienes ningún control y, peor aún, a las que tienes que adaptarte. Ejemplo: hasta hace unos meses, esta biblioteca sólo permitía Java 17 + Spring Boot 2.4.x. ¿Qué pasaría si quisiera utilizar Spring Boot 3? ¿O por alguna razón es necesario cambiar a Java 11? Bueno, no podías, estabas encerrado.

Esto conduce a los cuatro objetivos mencionados sobre los que se basa este manifiesto:

- Ser un punto de partida para futuros proyectos Spring Boot.
- Adoptar prácticas de desarrollo impulsado por componentes (CDD).
- Encapsular dependencias esenciales y estándares de mejores prácticas.
- Otorgar al desarrollador propiedad y control sobre el código.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com/) es una colección de componentes reutilizables que puedes copiar y pegar en tus aplicaciones. Puede utilizar cualquier marco que admita React.

¿Cómo es eso una inspiración para los proyectos Spring Boot? Está en el lado opuesto del espectro del desarrollo. La inspiración proviene de esta sección en la [preguntas frecuentes](https://ui.shadcn.com/docs):

> La idea detrás de esto es brindarle propiedad y control sobre el código, permitiéndole decidir cómo se construyen y diseñan los componentes. Comience con algunos valores predeterminados sensatos y luego personalice los componentes según sus necesidades. Uno de los inconvenientes de empaquetar los componentes en un paquete npm es que el estilo va unido a la implementación. El diseño de sus componentes debe estar separado de su implementación.

Eso se alinea perfectamente con uno de los objetivos:

- Otorgar al desarrollador propiedad y control sobre el código.

Tener un punto de partida es excelente, pero eso no debería ser un problema cuando los requisitos del negocio exigen que nos adaptemos.

## Who's the Anime Girl at the blog thumbnail?

Conoce a [Miko Iino](https://kaguyasama-wa-kokurasetai.fandom.com/wiki/Miko_Iino) (spoilers en el enlace al artículo de la wiki, lee a tu propia discreción), un personaje de la serie de manga y anime " Kaguya-sama: Love is War."

![Miko Iino](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/miko-iino-slapping.gif)

Conocida por su estricto cumplimiento de las reglas y un fuerte sentido de la justicia, su rigor y rigidez al seguir las regulaciones escolares sirven como base para sus acciones y decisiones.

A medida que avanza la serie, el personaje de Miko experimenta un desarrollo significativo. A través de sus interacciones y experiencias, aprende la importancia de la flexibilidad, la comprensión y la empatía. Si bien nunca abandona sus principios fundamentales, Miko se vuelve más adaptable y reconoce que un estricto cumplimiento de las reglas no siempre conduce a los mejores resultados.

Este viaje de Miko Iino refleja la esencia de lo que pretendo lograr aquí. Este blog describe una serie de pasos y mejores prácticas derivadas de la experiencia personal, con el objetivo de proporcionar un punto de partida para proyectos futuros que adopten prácticas de desarrollo impulsado por componentes (CDD).

Al igual que la evolución de Miko, las pautas presentadas no están escritas en piedra. El mensaje subyacente aquí es de equilibrio: si bien es crucial tener un enfoque estructurado y un conjunto de estándares para impulsar proyectos de manera efectiva, el dinamismo del desarrollo requiere una mentalidad abierta a la adaptación.

Así como Miko aprende a equilibrar su rigor con la flexibilidad, se alienta a los desarrolladores a ver estas pautas como una base, un punto de partida desde el cual el proyecto puede evolucionar según lo dicten los desafíos y requisitos únicos que enfrenta.

Citando [manupadev&rsquo;s blog](https://manupa.dev/blog/anatomy-of-shadcn-ui)

> La idea detrás de esto es brindarle propiedad y control sobre el código, permitiéndole decidir cómo se construyen y diseñan los componentes. Comience con algunos valores predeterminados sensatos y luego personalice los componentes según sus necesidades.

Al adoptar este enfoque, es importante reconocer que si bien las reglas y los marcos proporcionan la estructura necesaria, el arte del desarrollo radica en saber cuándo adherirse estrictamente a estas pautas y cuándo doblarlas para servir al bien mayor del proyecto.

![Miko Iino](/uploads/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd/miko-iino-love-is-war.gif)

## Siguiente lectura

[Manifiesto de Pollito sobre el desarrollo basado en contratos de Java Spring Boot para microservicios 2](/es/blog/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2)
