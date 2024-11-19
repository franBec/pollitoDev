---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 1: Desarrollo impulsado por contratos"
date: 2024-10-02
description: "Desarrollo impulsado por contratos"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/shirogane.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [Desarrollo impulsado por contratos](#desarrollo-impulsado-por-contratos)
  * [Contrato](#contrato)
  * [TL;DR: ¿Qué sacar de este blog?](#tldr-qué-sacar-de-este-blog)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la primer parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

## Desarrollo impulsado por contratos

En el artículo de Wikipedia _[Design by contract wikipedia article](https://en.wikipedia.org/wiki/Design_by_contract)_, podemos encontrar la siguiente afirmación:

![A design by contract scheme](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/Design_by_contract.png)

> [...] software designers should define formal, precise and verifiable interface specifications for software components, which extend the ordinary definition of abstract data types with preconditions, postconditions and invariants.

A partir de ahí, hice mi propia adaptación de la filosofía de desarrollo impulsado por contratos para la arquitectura de microservicios:

> Los microservicios deben cumplir con un contrato, que define entradas, salidas y errores.

Entonces ¿qué es un contrato?

## Contrato

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

![1provider1contractmanyconsumers](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/1provider1contractmanyconsumers.png)

Para un microservicio que sigue estrictamente las prácticas de desarrollo impulsado por contratos, sin cumplir con esta regla, no tiene forma de ser invocado desde fuentes externas.

Tal vez haya situaciones en las que sea necesario tener un microservicio en ejecución pero no poder invocarlo, pero al momento de escribir esto, no se me ocurre ninguna situación.

2. Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.

![1provider2contracts](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/1provider2contracts.png)

Este punto no se trata de desarrollo impulsado por contratos, sino más bien de la filosofía adecuada de los microservicios. Un microservicio está pensado para ocuparse de una sola cosa y hacerla bien. Para lograrlo, tiene sentido que el microservicio sea un proveedor solo una vez, proporcionando los puntos finales para interactuar con la única cosa que hace bien.

Puede haber excepciones totalmente válidas a esto. Un ejemplo claro es un microservicio que expone un punto final [actuator](https://github.com/spring-projects/spring-boot/tree/v3.2.3/spring-boot-project/spring-boot-actuator). Ahora tienes un microservicio que hace dos cosas, su función principal y expone una llamada de comprobación de estado. Y eso está totalmente bien.

3. Un microservicio puede desempeñar el rol de consumidor en cero, uno o muchos contratos.

![zero](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/zero.png)
![one](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/one.png)
![many](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-1/many.png)

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

## Siguiente lectura

[La opinión de Pollito acerca del desarrollo en Spring Boot 2: Mejores prácticas](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2)
