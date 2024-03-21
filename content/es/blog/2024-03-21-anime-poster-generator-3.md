---
author: "Franco Becvort"
title: "Anime Poster Generator 3: Empezando el proyecto frontend"
date: 2024-03-21
description: "Proyecto Next.js + shadcn"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-21-anime-poster-generator-3/screencapture-localhost-3000-2024-03-21-15_03_51.png
---

## Checkout the github repo

Esta es una continuación de [Anime Poster Generator 2: Jasper](/es/blog/2024-03-20-anime-poster-generator-2)

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[anime-poster-generator-frontend: Branch feature/anime-poster-generator-3](https://github.com/franBec/anime-poster-generator-frontend/tree/feature/anime-poster-generator-3)

## Objetivos

Me voy a concentrar en empezar Anime Poster Generator Frontend.

![diagram](/uploads/2024-03-21-anime-poster-generator-3/Untitled-2024-02-21-1828.png)

## ¡NO soy un desarrollador frontend!

**NO soy un desarrollador frontend.** _No soy un desarrollador frontend._ No realizo actividades de desarrollador frontend en mi día a día.

Dicho esto, conozco algunas interfaces:

- En 2021, cuando tenía poco dinero y estaba cansado de comer cada dos días, quería conseguir un trabajo de desarrollador real, así que me sumergí en el infierno de los tutoriales.
  - Allí tuve mi primer acercamiento a React, con el infame [5 hours freeCodeCamp tutorial](https://www.youtube.com/watch?v=DLX62G4lc44). Ese fue mi evento canónico, me empujó a la rabbit hole de React.
  - También tuve entrevistas fallidas en [MercadoLibre](https://mercadolibre.com/), [ensolvers](https://www.ensolvers.com/), y [CAT Technologies](https://cat-technologies.com/). Eso me hizo darme cuenta de que no sabía una m\*rda después de los tutoriales, lo cual era totalmente cierto. Usa tutoriales, pero escapa del infierno de los tutoriales.
- Tengo 2+ años en los proyectos [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/) y Compras. Hubo momentos en los que yo era el único desarrollador que quedaba y no tenía más remedio que lidiar con el desorden del frontend que tienen esos proyectos.
  - Están construidos con una antigua plantilla de administración [bootstrap](https://getbootstrap.com/), javascript y jquery, todos atado con alambre en [archivos.gsp](https://gsp.grails.org/latest/guide/index.html).
- Cuando trabajaba en [RunaID](https://www.runaid.com.ar/), me capacitaron en React.
  - Obtuve [este certificado](https://udemy-certificate.s3.amazonaws.com/pdf/UC-47b54249-0cba-479f-8941-763197877682.pdf) e hice una simple aplicación para [DOSEP](https://dosep.sanluis.gob.ar/).

BPero mis mayores maestros en frontend (especialmente React) son: [Theo](https://www.youtube.com/@t3dotgg), [Josh](https://www.youtube.com/@joshtriedcoding), y [Midudev](https://www.youtube.com/@midulive). Aquí está mi vídeo favorito de cada uno:

{{< youtube CQuTF-bkOgc >}}
{{< youtube zlX0lrX2oLA >}}
{{< youtube tepfGaIPN50 >}}

Con solo mirar su contenido durante estos años, he podido mantenerme al día con todo el caos que es el mundo frontend y cómo React juega un papel en él.

## Comencemos con esto

Vayamos a la [guía de instalación de shadcn/ui Next.js](https://ui.shadcn.com/docs/installation/next) y sigamos las instrucciones.

Después de todo eso, limpie toda la basura en page.tsx, coloque un h1 básico y verifique que todo esté funcionando.

![blank page](/uploads/2024-03-21-anime-poster-generator-3/screencapture-localhost-3000-2024-03-21-15_03_51.png)
