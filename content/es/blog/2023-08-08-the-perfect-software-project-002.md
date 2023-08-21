---
author: "Franco Becvort"
title: "[El proyecto de software perfecto #02] - Mi breve historia con Next.js"
date: 2023-08-08
description: "Next.js y como me enamoré, alejé, y re-descubrí el framework"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-08-the-perfect-software-project-002/nextjs.png
---

_"Next.js y como me enamoré, alejé, y re-descubrí el framework._

## Primer encuentro con React

Mientras tanto en Agosto 2021...

- Estaba debutando la segunda generación de Hololive English (me gustó mucho la energía caótica y el diseño de Bae).
- Estaba cansado mental y financieramente.
- Regresé a San Juan y viví con Angelita, la anciana más amable que jamás haya pisado la tierra.

Este fue el momento de mi vida en el que dije "esto de la universidad realmente no está funcionando" y decidí prepararme para conseguir un trabajo. Y entré en el infierno de los tutoriales.

Allí aprendí los conceptos básicos de javascript, la piedra angular del desarrollo web. Y eventualmente fue caí por el agujero de conejo de los marcos de JavaScript.

Ahí estaba yo, leyendo artículos sobre React vs Angular vs Vue. Ingenuo y sin ningún conocimiento sólido, basado principalmente en quien tenía la mayor cantidad de puestos de trabajo en Linkedin, decidí formar parte del equipo React.

Vi el famoso tutorial gratuito CodeCamp React de 5 horas de duración (ahora descontinuado) y construí la típica aplicación de tareas pendientes.

{{< youtube DLX62G4lc44 >}}

Pero al final, la vida tenía otros planes para mí, porque el primer trabajo que conseguí fue como desarrollador web en un monolito Grails. Eso hizo que me olvidara de React durante algunos meses.

## Theo.gg y Next.js

[Theo - T3.gg](https://www.youtube.com/@t3dotgg) es, en mi opinión, el mejor canal de YouTube para recibir noticias sobre lo que sucede en la comunidad de React. Él está realmente involucrado en esto, haciendo grandes contribuciones y promoviendo las mejores prácticas sobre cómo hacer un mejor desarrollo web.

Apareció en mis recomendaciones en algún momento cerca de marzo de 2022 más o menos. Y después de ver un par de sus videos, me interesó mucho Next.js. Lo vendió como "la forma correcta de hacer proyectos sólidos de React".

Y me enamoré. Next.js 12 fue para mí una forma realmente intuitiva de hacer las cosas.

- ¿Enrutamiento? Listo.
- ¿API? Listo.
- ¿Tipado estático? Listo.

Obviamente no era perfecto. El principal inconveniente era la falta de seguridad de tipos entre un punto final de backend y un consumidor de frontend. Theo propuso el stack t3 como solución. No me convenció mucho. Lo encontré un poco demasiado invasivo. Preferí tener los esquemas en una carpeta y usar [Zod](https://zod.dev/) para validar todo.

Incluso tuve la oportunidad de promocionar Next.js en la empresa en la que trabajaba en ese momento, formando el primer equipo allí en usar React.

Pero nuevamente, la vida tenía otros planes para mí, y [me convertí en desarrollador de Java](/es/blog/2022-11-13-so-it-seems-im-a-java-dev)

## Next.js 13 era diferente

Cuando se lanzó Next.js 13, hubo muchas noticias sobre cómo esto llamado "componentes del servidor" ahora es lo nuevo y todo lo que sabías era obsoleto.

Yo y todos los desarrolladores de monolitos no JavaScript dijimos "hermano, PHP hizo esto hace 15 años, y Rails ya lo dominó". Incluso sentí que era un paso atrás hacia una cosa parecida a Grails. Supongo que el desarrollo web estaba completando el círculo.

De todos modos, estaba demasiado comprometido con convertirme en un desarrollador backend, así que simplemente dejé de ver videos sobre Next.js por un tiempo. Quería ver cómo todo este asunto de los "componentes del servidor" se relacionaba con el siempre cambiante mundo de javascript.

## Redescubriendo Next.js

Con esta nueva idea de "el proyecto de software perfecto", pasé mi último domingo viendo algunos videos sobre Next.js 13. Ya han pasado algunos meses desde su lanzamiento, por lo que había mucha información para leer.

Mis videos favoritos fueron estos dos:

{{< youtube NgayZAuTgwM >}}
{{< youtube Sbl04kOL1dM >}}

Mi conclusión fue: sí, esto tiene sentido.

Es confuso al principio la idea de que un componente frontend pueda llamar una función de servidor sin ningún tipo de efecto explícito. Pero después de dejarlo reposar en tu cabeza por un tiempo, no es tan irrazonable. Después de todo, otros marcos que no son de JavaScript lo han estado haciendo durante años.

## Conclusión: sangrar responsablemente

Ahora me he puesto en un escenario donde tengo que escribir un monolito, y realmente tengo dos opciones en mente: Grails y Next.js. Estoy eligiendo la última. ¿Por qué? Como siempre, Theo tiene la respuesta.

{{< youtube uEx9sZvTwuI >}}
