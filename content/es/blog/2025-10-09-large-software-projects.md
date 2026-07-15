---
author: "Franco Becvort"
title: "Cómo abordar un proyecto de software grande"
date: 2025-10-09
description: "La opinión de Pollito sobre proyectos de software"
categories: ["Programming talk"]
thumbnail: /uploads/2025-10-09-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Programming talk](/es/categories/programming-talk/).

<!-- TOC -->
  * [Mi Mentalidad para Proyectos de Software](#mi-mentalidad-para-proyectos-de-software)
    * [El buen código tiene dos requisitos](#el-buen-código-tiene-dos-requisitos)
    * [No todo lo que se puede hacer, se debe hacer](#no-todo-lo-que-se-puede-hacer-se-debe-hacer)
    * [El software no necesita ser excesivamente complicado para ser efectivo](#el-software-no-necesita-ser-excesivamente-complicado-para-ser-efectivo)
    * [No necesitás ser un experto para hacer un gran software](#no-necesitás-ser-un-experto-para-hacer-un-gran-software)
    * [Tamaño del proyecto ≠ Tamaño del equipo](#tamaño-del-proyecto--tamaño-del-equipo)
    * [A veces, reescribir vale la pena](#a-veces-reescribir-vale-la-pena)
  * [Gente Que Me Inspira](#gente-que-me-inspira)
    * [Theo](#theo)
    * [Dreams of Code](#dreams-of-code)
    * [carykh](#carykh)
    * [Eskil Steenberg](#eskil-steenberg)
<!-- TOC -->

En el [post anterior](/es/blog/2025-10-03-large-software-projects), ya establecimos la cruda realidad: el default para el desarrollo de software a gran escala es la **complejidad**. Normalizamos arquitecturas diseñadas para impresionar consultores en lugar de ser mantenidas por humanos. Pagamos el "impuesto a la complejidad" todos los días con onboardings lentos, debugging doloroso, y reuniones de coordinación que no terminan más.

Pero, ¿y si pasa lo contrario? ¿Qué onda si la elección de diseño más sofisticada que podés hacer es, justamente, optar por la **simplicidad**?

La filosofía que planteamos acá no es que sea revolucionaria. Es volver a los principios fundamentales. Se trata de construir cosas que duren haciéndolas fáciles de entender, fáciles de cambiar y fáciles de deployar.

Antes de que elijamos la primera herramienta, te comparto mi enfoque personal para armar proyectos de software grandes.

## Mi Mentalidad para Proyectos de Software

### El buen código tiene dos requisitos

1.  **Resuelve el problema.**
2.  **No da asco leerlo.**

Así de simple. No me importa si usa el último framework o sigue cada [principio SOLID](https://www.geeksforgeeks.org/system-design/solid-principle-in-programming-understand-with-real-life-examples/) religiosamente. Si funciona de forma fiable y el próximo desarrollador (incluyéndote a vos mismo en el futuro) puede entender qué está pasando, es buen código.

### No todo lo que se puede hacer, se debe hacer

Que puedas dividir tu aplicación en 47 microservicios no significa que *debas* hacerlo.

-   Probablemente no necesites un enfoque de microservicios (en serio, posta que no).
-   No hagas sobre-ingeniería—al menos no sin una razón *realmente* buena.
-   ¿Ese stack tecnológico nuevo y fancy? Está bueno, pero ¿resuelve un problema real que tenés, o solo queda bien en tu LinkedIn?

**Los costos ocultos de la sobre-ingeniería:**

| Aspecto                         | Enfoque Big Tech                  | Realidad para la mayoría de los proyectos |
|---------------------------------|-----------------------------------|-------------------------------------------|
| **Tiempo de Configuración**     | Semanas o meses                   | Debería ser días                          |
| **Tamaño del Equipo Necesario** | 100+ desarrolladores              | 1-3 desarrolladores                       |
| **Factura Mensual de Cloud**    | $5,000 - $50,000+                 | $50 - $500                                |
| **Complejidad de Despliegue**   | Múltiples servicios, orquestación | Despliegue único                          |
| **Tiempo de Onboarding**        | Semanas para nuevos devs          | Días para nuevos devs                     |
| **Dificultad para Debuggear**   | Se requiere rastreo distribuido   | Stack trace en logs                       |

Pensá las decisiones de arquitectura como condimentar la comida. Un poquito realza el plato; demasiado lo arruina. El objetivo es una comida rica, no usar todas las especias de tu alacena.

### El software no necesita ser excesivamente complicado para ser efectivo

He notado que los líderes técnicos, arquitectos y quienes toman las decisiones de infraestructura a menudo tienen una fascinación por los diseños complejos. Quizás es para alimentar sus egos, quizás para justificar sus salarios—sinceramente, no sé.

Muchos de ellos probablemente fueron grandes desarrolladores en el pasado y se esforzaron mucho para llegar a sus roles actuales. Pero **cuanto más tiempo pasan sin codear, más desconectados de la realidad parecen estar**.

**Las consecuencias de la sobre-complejidad:**

-   **Las bases de código fragmentadas llevan a una gran frustración en los desarrolladores:** Imaginá jugar al "teléfono descompuesto" en una habitación llena de gente y ruidosa. Así se siente un sistema hiper-fragmentado. Nunca estás 100% seguro si tus cambios en el "Servicio A" van a repercutir sin querer en el "Servicio B" al otro lado de la organización, incluso si no deberían tener nada en común.
-   Un cambio simple puede escalar rápidamente a:
    -   Múltiples PRs en múltiples repositorios.
    -   Múltiples code reviews con diferentes equipos.
    -   Múltiples reuniones con equipos de QA.
    -   Múltiples pipelines de despliegue.
    -   Múltiples puntos de fallo.
    -   Múltiples días de espera.

La mayoría de las veces, si ese código viviera en un monolito, el cambio sería literalmente de 10 líneas en 2 o 3 archivos, revisado en 10 minutos y desplegado antes de la pausa para el almuerzo.

![usá un monolito](/uploads/2025-10-09-large-software-projects/a8migg.jpg)

### No necesitás ser un experto para hacer un gran software

Como dijo [Rui Torres](https://es.wikipedia.org/wiki/Rui_Torres):

> No necesitas ser un experto para ser un gran artista

![no necesitas ser un experto](/uploads/2025-10-09-large-software-projects/no-necesitas-ser-un-experto.jpg)

Lo mismo aplica al software.

La mayor parte del software que usás todos los días no fue construido por personas que conocen cada lenguaje, framework y proveedor de la nube. Fue construido por personas que supieron elegir una herramienta que entendían (o podían aprender rápido), hacer tradeoffs y *salir a producción*.

La verdadera maestría no está en conocer cada detalle, sino en entender cómo usar y combinar abstracciones de manera efectiva para resolver problemas del mundo real. Enfocate en construir y aprender; la etiqueta de "experto" seguirá, no precederá, tus logros.

### Tamaño del proyecto ≠ Tamaño del equipo

Como dijo [Frederick P. Brooks, Jr](https://es.wikipedia.org/wiki/Fred_Brooks):

> Añadir personal a un proyecto de software atrasado lo atrasa aún más.

{{< youtube Xsd7rJMmZHg >}}

**El tamaño de un proyecto NO debería ser proporcional al equipo tech que lo respalda.**

Agregar más gente a la mezcla solo genera más ruido, más reuniones, más sobrecarga de coordinación y más oportunidades de mala comunicación.

Algunos de mis ejemplos favoritos de proyectos enormes con equipos chicos:

| Proyecto                                                                                                                                                                  | Tamaño del Equipo                                                                                                                                                                       | Impacto                                |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| **[Telegram](https://telegram.org/)**                                                                                                                                     | [~30 empleados](https://economictimes.indiatimes.com/news/new-updates/30-billion-telegram-has-only-30-employees-no-hr-harsh-goenka-shares-pavel-durovs-video/articleshow/112839523.cms) | Cientos de millones de usuarios        |
| **[Yacaré (ahora Fiserv)](https://www.lanacion.com.ar/economia/una-compania-internacional-compro-yacare-la-primera-empresa-argentina-en-implementar-el-qr-nid05012023/)** | ~15 empleados, Yo estuve ahí :D                                                                                                                                                         | Primer sistema de pago QR de Argentina |
| **[Hollow Knight](https://www.hollowknight.com/)**                                                                                                                        | [3 personas](https://cyberpost.co/was-hollow-knight-made-by-3-people/)                                                                                                                  | Videojuego aclamado universalmente     |
| **[Roller Coaster Tycoon](https://atari.com/pages/rollercoaster-tycoon)**                                                                                                 | [1 persona (Chris Sawyer)](https://youtu.be/ESGHKtrlMzs?si=Rbkg-2lWdXgalYG_)                                                                                                            | Juego de simulación legendario         |
| **[Stardew Valley](https://www.stardewvalley.net/)**                                                                                                                      | [1 persona (ConcernedApe)](https://youtu.be/4-k6j9g5Hzk?si=VYp3ZzhGl5bLowsJ)                                                                                                            | Más de 20 millones de copias vendidas  |
| **[Lichess](https://lichess.org/)**                                                                                                                                       | [Mayormente 1 persona (Thibault Duplessis)](https://youtu.be/7VSVfQcaxFY?si=Yeo9igZQmyCYy1A5)                                                                                           | Plataforma de ajedrez online #1        |

Equipos chicos y enfocados pueden construir cosas increíbles cuando no están dedicando la mitad de su tiempo a reuniones de coordinación.

### A veces, reescribir vale la pena

A veces, vale la pena considerar reescribir algo en lugar de seguir manteniéndolo—**especialmente cuando no queda nadie del equipo original que lo escribió**.

Si pasás más tiempo intentando entender qué hace el código que realmente construyendo nuevas funcionalidades, si el stack tech está tan obsoleto que ya no encontrás documentación, si cada cambio se siente como desactivar una bomba... quizás sea hora de un nuevo comienzo.

Obviamente, esta no siempre es la decisión correcta. El famoso artículo de [Joel Spolsky sobre Netscape](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/) es lectura obligada acá. Pero la decisión no debería ser "nunca reescribir" o "siempre reescribir"—debería basarse en una evaluación honesta:

-   ¿Pueden los nuevos desarrolladores volverse productivos en un plazo razonable?
-   ¿La base de código actual te impide satisfacer las necesidades del negocio?
-   ¿Entendés el dominio del problema mejor ahora que cuando se escribió el original?
-   ¿Podés reescribirlo *sin* caer en las mismas trampas?

A veces la respuesta es sí, y está bien.

## Gente Que Me Inspira

Antes de que nos metamos de lleno a construir, quiero destacar las voces que moldearon mi forma de pensar. No son solo YouTubers random que miro—son personas que encarnan los principios que estuve defendiendo. Prueban que un gran software nace de un pensamiento claro, no de la complejidad por la complejidad misma.

### Theo

Descubrí a **[Theo (@t3dotgg)](https://www.youtube.com/@t3dotgg)** a través de su video 'Do you REALLY need a backend?' allá por 2022.

{{< youtube 2cB5Fh46Vi4 >}}

Puede que no estés de acuerdo con todas sus opiniones o que no te guste su personalidad tan directa, pero no se puede negar que tiene un conocimiento sólido y un talento genuino para crear contenido "nerd" que es a la vez entretenido y educativo.

Su disposición a desafiar las suposiciones comunes resuena profundamente con la filosofía que estoy defendiendo acá. Me recuerda que **las discusiones tech serias no tienen por qué ser aburridas**, y que a veces la mejor solución es la más simple que pasaste por alto.

### Dreams of Code

**[Dreams of Code](https://www.youtube.com/@dreamsofcode)** crea contenido que se enfoca en herramientas y conceptos prácticos de desarrollo, en lugar de perseguir tendencias.

{{< youtube F-9KWQByeU0 >}}

Si bien trabaja principalmente con Go (un lenguaje que no usé), sus videos trascienden la sintaxis específica del lenguaje. Lo que importa es cómo explica conceptos fundamentales de maneras que aplican sin importar tu stack.

Su enfoque refuerza mi creencia de que **entender los principios fundamentales es más valioso que estar casado con tecnologías específicas.**

### carykh

**[carykh (Cary Huang)](https://www.youtube.com/@carykh)** ya exploraba IA, algoritmos genéticos y simulaciones evolutivas allá por 2018—mucho antes de que la IA se convirtiera en la palabra de moda que es hoy.

{{< youtube y3B8YqeLCpY >}}

Lo que más me inspira no es solo su visión técnica, sino su enfoque: construir proyectos como desarrollador solo, explicar conceptos complejos a través de visuales atractivos, y hacerlo todo con un entusiasmo genuino.

Su trabajo prueba que no necesitás un laboratorio de investigación o un equipo enorme para explorar ideas de vanguardia. **A veces solo necesitás curiosidad, dedicación y ganas de experimentar.**

### Eskil Steenberg

El que realmente me impulsó de 'idea' a 'che, vamos a *hacer* esto posta' es el video de **[Eskil Steenberg](https://www.youtube.com/@eskilsteenberg)**, 'Architecting LARGE software' (¡la miniatura de *este* post es un homenaje directo!).

{{< youtube sSpULGNHyoI >}}

El video en sí es recontra simple: solo un chabón, una pantalla y código C. Nada de PowerPoints fancy, ni gráficos pulcros—solo sabiduría pura y dura. Lo que lo hace poderoso es cómo Eskil demuestra que **software grande no tiene por qué significar software complicado**.

