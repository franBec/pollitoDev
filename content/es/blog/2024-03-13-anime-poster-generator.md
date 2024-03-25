---
author: "Franco Becvort"
title: "Anime Poster Generator 1: Bocetando la idea"
date: 2024-03-13
description: "Un nuevo proyecto personal, una excusa para aprender algo de frontend"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-13-anime-poster-generator/Screenshot2024-03-13172447.png
---

_Un nuevo proyecto personal, una excusa para aprender algo de frontend._

## Inspiración

Hace aproximadamente un mes decidí decorar un poco mi espacio de trabajo. Me gustan mucho los mapas, así que imprimí un par y los colgué en la pared.

![room](/uploads/2024-03-13-anime-poster-generator/IMG_20240313_172916.jpg)

El de la izquierda es una versión recortada de [metro de Lisboa](https://www.metrolisboa.pt/wp-content/uploads/2022/04/Metropolitano-de-Lisboa_Mapa-da-Cidade_abr.2022.png), el de la derecha es un [Diagrama de Lisboa](https://www.inat.fr/files/lisboa-mapa-rede-integrada.pdf) que encontré googleando.

También tengo un cactus falso, un patito de goma con un sombrero diminuto y un pato de juguete esponjoso. El tarro de galletas que está completamente a la izquierda, es también mucho muy importante.

Para seguir llenando la pared, me interesaron algunos carteles de anime minimalistas, similares a los de la miniatura de este post.

![posters](/uploads/2024-03-13-anime-poster-generator/Screenshot2024-03-13172447.png)

Que sorpresa fue descubrir que no existe una página para crear tu propio poster. La opción más lógica aquí hubiera sido simplemente ir a canvas y crear los que quería. Pero como desarrollador, decidí pasar una semana entera automatizando una tarea que de otro modo me habría requerido solo unas pocas horas.

Aquí nace "Anime Poster Generator".

## Historias de usuarios

**Buscar animes:**

- Como usuario, quiero poder buscar títulos de anime, para poder encontrar el anime que deseo.

**Seleccione el anime deseado:**

- Como usuario, quiero seleccionar un anime de los resultados de búsqueda, para poder crear un póster para él.
- Como usuario, necesito ver un breve resumen y una imagen del anime al seleccionarlo, para asegurarme de haber elegido el título correcto.

**Generar póster con imagen anime original**

- Como usuario, quiero generar un póster utilizando las imágenes originales del anime, para poder tener un póster con las imágenes originales del anime.

**Adjunte y use imágenes personalizadas**

- Como usuario, quiero cargar una imagen personalizada, para usarla en mi póster de anime para poder tener un póster con la imagen personalizada.

**Descargar cartel**

- Como usuario, quiero descargar la versión final de mi póster en formato A4, apto para imprimir o compartir online.

## Arquitectura básica

Después de investigar un poco buscando API públicas y alternativas, realicé este diagrama muy básico sobre cómo haré que esto se haga realidad.

![diagram](/uploads/2024-03-13-anime-poster-generator/Untitled-2024-02-21-1828.png)

- **Anime poster generator frontend**: Será una aplicación Next.js 14. Como desarrollador backend, el frontend no es lo mío, así que buscaré plantillas y herramientas similares para poner las cosas en marcha.

  - ¿Por qué Next.js? Tengo un poco de experiencia previa con React + me he mantenido al tanto de las últimas noticias y tendencias de React siguiendo a algunos youtubers, como [Theo](https://www.youtube.com/@t3dotgg) y [Josh](https://www.youtube.com/@joshtriedcoding).

- **Anime poster generator backend**: Estará en Java Spring Boot 3, siguiendo la misma filosofía de CDD explicada a lo largo de [mis blogs sobre desarrollo impulsado por contactos](/en/categories/contract-driven-development/).

- **[Jikan API](https://docs.api.jikan.moe/)**: Es una API de terceros que proporciona información sobre animes. Es una abstracción amigable y gratuita de [MyAnimeList API](https://myanimelist.net/apiconfig/references/api/v2).

## Próximos pasos

- Creación de un generador de carteles de anime **backend**: espero que sea rápido y sencillo.
- Generador de carteles de anime **frontend**: aquí voy a pasar la mayor parte del tiempo, ya que este es un territorio totalmente desconocido para mí.

## Siguiente lectura

[Anime Poster Generator 2: Jasper](/es/blog/2024-03-20-anime-poster-generator-2)
