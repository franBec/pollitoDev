---
author: "Franco Becvort"
title: "Anime Poster Generator 3: Starting a frontend project"
date: 2024-03-21
description: "Next.js + shadcn new project"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-21-anime-poster-generator-3/screencapture-localhost-3000-2024-03-21-15_03_51.png
---

## Checkout the github repo

This is a continuation of [Anime Poster Generator 2: Jasper old friend](/en/blog/2024-03-20-anime-poster-generator-2)

Everything we'll do here, you can find in in the github repo.

[anime-poster-generator-frontend: Branch feature/anime-poster-generator-3](https://github.com/franBec/anime-poster-generator-frontend/tree/feature/anime-poster-generator-3)

## Objectives

I'm gonna focus in starting Anime Poster Generator Frontend.

![diagram](/uploads/2024-03-21-anime-poster-generator-3/Untitled-2024-02-21-1828.png)

## I am NOT a frontend developer!

**I am NOT a frontend developer.** _I am not a frontend developer._ I do not engage in frontend developer activities in my day to day.

Having said that, I do know some frontend:

- In 2021, when I was short on money and tired of eating every other day, I wanted to get a real developer job, so I dived into tutorial hell.
  - Back there I had my first approach to React, with the infamous [5 hours freeCodeCamp tutorial](https://www.youtube.com/watch?v=DLX62G4lc44). That was my canonical event, it pushed me into the React rabbit hole.
  - Also failed interviews at [MercadoLibre](https://mercadolibre.com/), [ensolvers](https://www.ensolvers.com/), and [CAT Technologies](https://cat-technologies.com/). That made me realize I didn't know sh\*t after the tutorials, which was totally true. Please use tutorials, but escape tutorial hell.
- I have 2+ years in [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/) and Buying and Hiring projects. There were times when I was the only developer left, and I had no chance but to deal with the frontend shenanigans those projects have.
  - They are built with some old [bootstrap](https://getbootstrap.com/) admin template, javascript and jquery, all glued together in [.gsp files](https://gsp.grails.org/latest/guide/index.html).
- Back when I worked at [RunaID](https://www.runaid.com.ar/), I was given training in React.
  - Got [this certificate](https://udemy-certificate.s3.amazonaws.com/pdf/UC-47b54249-0cba-479f-8941-763197877682.pdf) and did a little admin application for [DOSEP](https://dosep.sanluis.gob.ar/).

But my biggest teachers in frontend (specially React) are: [Theo](https://www.youtube.com/@t3dotgg), [Josh](https://www.youtube.com/@joshtriedcoding), and [Midudev](https://www.youtube.com/@midulive). Here are my fav video from each one:

{{< youtube CQuTF-bkOgc >}}
{{< youtube zlX0lrX2oLA >}}
{{< youtube tepfGaIPN50 >}}

By just watching their content during these years, I've been able to keep up with the whole mess the frontend world is, and how React plays part in it.

## Let's get this started

Let's go to [shadcn/ui Next.js installation guide](https://ui.shadcn.com/docs/installation/next) and follow the instructions.

After all of that, clean all the garbage in page.tsx, put a basic h1, and check everything is working.

![blank page](/uploads/2024-03-21-anime-poster-generator-3/screencapture-localhost-3000-2024-03-21-15_03_51.png)
