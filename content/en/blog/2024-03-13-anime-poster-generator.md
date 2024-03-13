---
author: "Franco Becvort"
title: "Anime Poster Generator 1: Sketching the idea"
date: 2024-03-13
description: "A new personal project, an excuse to learn some frontend"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-13-anime-poster-generator/Screenshot2024-03-13172447.png
---

_A new personal project, an excuse to learn some frontend._

## Inspiration

A month ago or so, I decided to decorate my working space a little bit. I really like maps, so I printed two and put them on the walls.

![room](/uploads/2024-03-13-anime-poster-generator/IMG_20240313_172916.jpg)

Left one is a cropped version of [Lisbon metro](https://www.metrolisboa.pt/wp-content/uploads/2022/04/Metropolitano-de-Lisboa_Mapa-da-Cidade_abr.2022.png), right one is a [Lisbon Diagram](https://www.inat.fr/files/lisboa-mapa-rede-integrada.pdf) I found googling around.

I also have a fake cactus, a rubber ducky with a tiny hat, and a fluffy duck toy. Cookie jar all the way to the left, much important to have.

To continue finlling the wall, I was interested in some minimalist anime posters, similar to the ones in the thumbnail of this post.

![posters](/uploads/2024-03-13-anime-poster-generator/Screenshot2024-03-13172447.png)

What a surprise it was to find out that there is no page to create your own. The more logical option here would've been to just hop into canvas and create the ones I wanted. But as a developer, I decided to spend a whole week in automatize a task that otherwise would've required me only a few hours.

Here is born "Anime Poster Generator".

## User stories

**Seach animes:**

- As a user, I want to be able to search for anime titles so that I can find my desired anime.

**Select desired anime:**

- As a user, I want to select an anime from the search results so that I can create a poster for it.
- As a user, I need to see a brief summary and image of the anime upon selection, to ensure I have chosen the correct title.

**Generate poster with original anime image**

- As a user, I want to generate a poster using the anime's original imagery so that I can have a poster with the anime's original imagery.

**Attach and use custom images**

- As a user, I want to upload a custom image to use for my anime poster so that I can have a poster with the custom image.

**Download poster**

- As a user, I want to download the final version of my poster in A4 format, suitable for printing or sharing online.

## Basic architecture

After a little research looking for public apis and alternatives, I came out with this very basic diagram about how I'm gonna make this come true.

![diagram](/uploads/2024-03-13-anime-poster-generator/Untitled-2024-02-21-1828.png)

- **Anime poster generator frontend**: it is gonna be a Next.js 14 application. As a backend developer, frontend is not my cup of tea, so I'm gonna look for templates and similar tools to get things going.

  - Why Next.js? I have some little previous experience with React + I've been keeping up with React latests news and trends by following some youtubers, such as [Theo](https://www.youtube.com/@t3dotgg) and [Josh](https://www.youtube.com/@joshtriedcoding).

- **Anime poster generator backend**: it is gonna be in Java Spring Boot 3, following the same philosophy of CDD explained throughout [my posts about Contract-Driven Development](/en/categories/contract-driven-development/).

- **[Jikan API](https://docs.api.jikan.moe/)**: it is a third party api that provides info about animes. Is a friendly and free abstraction of [MyAnimeList API](https://myanimelist.net/apiconfig/references/api/v2).

## Next steps

- Creating Anime poster generator **backend**: hopefully this is quick and straightforward.
- Anime poster generator **frontend**: here I am gonna be expending most of the time, as this is totally uknown territory for me.
