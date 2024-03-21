---
author: "Franco Becvort"
title: "Desarrollo impulsado por contratos: Creación de microservicios desde cero"
date: 2023-12-28
description: "Profundizando en Java Spring Boot: una guía práctica para crear microservicios con desarrollo basado en contratos"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2023-12-28-contract-driven-dev/DALL·E2024-01-2510.41.32.png
---

_Profundizando en Java Spring Boot: una guía práctica para crear microservicios con desarrollo basado en contratos._

## Introducción

Esta será la primera parte de muchas que hablarán sobre el desarrollo impulsado por contratos. Me voy a centrar en...

- Cómo lo aplican algunos equipos de desarrollo del banco Pichincha.
- Cómo mi equipo actual no puede, debido a limitaciones.
- Cómo abordaría esta práctica de desarrollo.

## Desarrollo impulsado por contratos en pocas palabras, por ChatGPT

Esta es la parte en la que explico qué es el desarrollo basado en contratos, pero chatGPT 4 puede hacerlo mejor.

> explica el desarrollo basado en contratos en pocas palabras

_yo preguntando a ChatGPT_

Y aquí está la respuesta que obtuve...

El desarrollo impulsado por contratos (CDD) es un enfoque de desarrollo de software en el que el diseño de interfaces de software (o contratos) es el enfoque principal antes de implementar la funcionalidad real. Esta metodología es especialmente relevante en sistemas donde varios servicios o componentes necesitan interactuar entre sí, como en las arquitecturas de microservicios. Aquí hay una explicación concisa:

1. **Definición de Contratos**: El proceso comienza con la definición de los contratos. Estos son acuerdos formales sobre cómo interactúan los componentes de software. Especifican los formatos de datos de entrada y salida esperados, los métodos de manejo de errores y otras reglas de interacción. Por lo general, esto se hace de forma independiente del idioma utilizando especificaciones como OpenAPI para servicios web.

2. **Colaboración y comunicación**: dado que los contratos se acuerdan desde el principio, diferentes equipos pueden trabajar en paralelo en diferentes componentes. Tienen una comprensión clara de qué esperar de los servicios de cada uno. Este enfoque mejora la comunicación y la colaboración entre equipos.

3. **Burlas y pruebas**: con los contratos vigentes, los desarrolladores pueden crear implementaciones simuladas de servicios o API. Esto permite probar los puntos de integración sin la necesidad de que se complete la implementación real.

4. **Implementación**: Una vez definidos y acordados los contratos, comienza el desarrollo real de los componentes del software. Los desarrolladores implementan la funcionalidad siguiendo las especificaciones establecidas en los contratos.

5. **Verificación continua**: a medida que avanza el desarrollo, las pruebas continuas garantizan que las implementaciones sigan cumpliendo con los contratos. Si un servicio cambia, aún debe cumplir su contrato, o el contrato debe renegociarse y todas las partes afectadas deben estar de acuerdo.

6. **Mantenimiento y evolución**: los contratos pueden evolucionar, pero los cambios se gestionan cuidadosamente para garantizar la compatibilidad. Este método proporciona un camino claro para actualizar y mantener los sistemas a lo largo del tiempo.

CDD es particularmente útil para reducir malentendidos y errores en la integración del sistema, asegurando que diferentes componentes puedan trabajar juntos sin problemas. También ayuda a crear sistemas más escalables y mantenibles, ya que los cambios en un componente tienen un impacto mínimo en los demás, siempre que se cumpla el contrato.

No sé ustedes, pero para mí, eso suena como una definición sólida. Bien, seguimos.

## ¿Cómo aplica el Banco Pichincha el desarrollo impulsado por contratos?

![spongebob gif](/uploads/2023-12-28-contract-driven-dev/spongebob.gif)

El backend del banco Pichincha es un enorme infierno de microservicios, causado principalmente por su filosofía similar a la de Spotify de organizar el equipo de desarrollo en tribus, capítulos y gremios.

Si bien esto promueve la autonomía y velocidad del equipo (cosa muy cuestionable esto último), también genera esta situación donde no hay control alguno en la cantidad de microservicios, y cada uno puede fácilmente tener prácticas de programación diferentes.

Esto hace que la comunicación entre servicios propios de diferentes equipos suele generar grandes fricciones.

![spotify model](/uploads/2023-12-28-contract-driven-dev/spotifymodel.png)

{{< youtube FeENMTL4xBo >}}

Para tratar de resolver el problema de la fricción, el desarrollo impulsado por contratos se volvió obligatorio en todos los proyectos de compilación con gradle de Java, que son un número enorme, podría suponer que alrededor del 60% de todos los microservicios backend.

Para promover eso, el banco compró esta biblioteca súper secreta y poderosa que proporciona algunas configuraciones de yaml + en build.gradle, en la compilación genera muchos textos repetitivos, relacionados con cosas como interfaces de controlador, interfaces de feign clients, entidades de bases de datos e incluso puede indicarle a la biblioteca si desea el proyecto en formato MVC o Spring Reactor. Intenta hacer muchas cosas y en su mayor parte lo hace bien.

No lo he usado mucho, pero he escuchado opiniones encontradas de mis compañeros desarrolladores.

## Entonces, si es tan buena, ¿por qué estoy escribiendo esto?

Bueno dos cosas...

- Tener una biblioteca para hacerlo todo puede no ser el camino a seguir: algunos compañeros de trabajo mencionan que generalmente genera más código boilerplate del necesario y que tienen que jugar con el boilerplate generado porque no es exactamente lo que se necesita. Creo que esto se debe principalmente a la curva de aprendizaje.

Pero mi razón principal es...

- La biblioteca es exclusiva para proyectos Spring Boot creados con Java 17 + Spring Boot 2.x.x (creo que puede llegar hasta 2.4.x, necesitaría volver a verificar esto) + **gradle**.

¿Y por qué el énfasis con el gradle? Bueno, actualmente en el equipo en el que estoy trabajando, debido a la infraestructura y la magia negra de Devops, el pipeline solo puede ejecutar proyectos Maven con Java 11... Lo sé, un poco triste. Y parece que esto es algo heredado, porque está relacionado con todos los repositorios backend de seguridad y nadie quiere meterse mucho con ellos.

Por esas razones, yo y el resto del equipo de seguridad estamos excluidos momentáneamente de las prácticas de CDD. Todos sabemos que, momentáneamente, lo más probable es que las cosas se vuelvan permanentes.

## Voy a crear mi propio proyecto Java Spring Boot CDD, con maven y bibliotecas y públicas

{{< youtube ubPWaDWcOLU >}}

Al momento de escribir esto estoy en PTO, un poco obligado. La empresa me dijo _"hermano, no te has tomado ningún día libre en 8 meses, sal a tocar un poco de pasto"_. Entonces me fui a Madrid. Bonita ciudad, me encanta la tortilla y que donde pides coca-cola te la dan con una rodaja de limón.

![madrid](/uploads/2023-12-28-contract-driven-dev/IMG_20231226_174932.jpg)

Puede sacar al programador del trabajo, pero no la programación del programador. Entonces, como proyecto personal paralelo para estos días aburridos, decidí abordar el problema y crear el equivalente de esta biblioteca privada súper secreta, pero con cosas que puedo encontrar en Internet y que cualquier desarrollador puede usar. Mis dos objetivos son:

- El proyecto debe ser un proyecto maven, utilizando el último Spring Boot y Java disponibles en este momento. Soy flexible con esto, porque sé que probablemente tendré que bajar a Java 17. Pero intentaré permanecer en Spring Boot 3.

- Dadas las definiciones + configuraciones de API abierta yaml, en la compilación debe poder generar interfaces que el controlador pueda implementar y las interfaces de los feign clients puedan extenderse.
  - Para mí, esta es sólo la cantidad de texto estándar necesario para iniciar el desarrollo, aunque es una preferencia personal. No voy a jugar con entidades y bases de datos en esta etapa.

Como nota al margen pero muy importante, no sé cómo crear bibliotecas y ese no es el objetivo en este momento. Por el momento, estoy más que satisfecho con tener un pom.xml que funciona sin muchas cosas obsoletas.
