---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 3: Creación de contratos"
date: 2023-12-30
description: "Definición de contratos antes de ensuciarnos las manos"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2023-12-30-contract-driven-dev3/DALL·E2024-01-2510.25.18.png
---

_Definición de contratos antes de ensuciarnos las manos._

## Consulta el repositorio de github

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-3](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-3)

## Pequeños cambios en la denominación de las cosas.

Cambiaremos el nombre de todo lo relacionado con "News" a "Article". Eso es porque news es una palabra rara que es plural y singular por sí sola, y cuando hablamos de entidades, generalmente hablamos de una sola entidad, en singular. Entonces, para facilitar la comprensión futura, estamos haciendo ese pequeño cambio.

![diagram](/uploads/2023-12-30-contract-driven-dev3/Untitled-2023-04-13-2132.png)

## ¿Qué contratos estamos creando?

Nosotros necesitamos:

- 1 contrato que define los endpoints que ofrecerá nuestro backend.
  - Lo estoy guardando en main/resources/openapi/controller
- Un contrato por cada servicio de terceros que consume nuestro backend.
  - Los estoy guardando en main/resources/openapi/feignclient

Siéntase libre de guardar sus contratos en cualquier lugar, siempre que esté dentro de main/resources/

Por el momento, serían un total de tres archivos.

![contracts](/uploads/2023-12-30-contract-driven-dev3/Untitled-2023-12-30-1241.png)

No voy a entrar en detalles sobre cómo crear una especificación OpenApi (lo que llamo contrato, de ahora en mas lo llamaré OAS). Hay muchos recursos disponibles para aprender + chatGPT es decente en eso, pero generalmente se queda un poco corto.

### Creando weatherstack.yaml y mediastack.yaml

Se trata de leer sus respectivas documentaciones y realizar el trabajo manual de escribir la especificación para que represente el comportamiento deseado. Tal vez tengan sus archivos especificación.yaml en algún lugar, pero no pude encontrarlos.

### Creando springcityexplorer.yaml

Se dividió en dos pasos:

- Para /weather y /article, se trataba más de pensar en qué estoy permitiendo que hagan mis consumidores de API. Las respuestas de mis aplicaciones de terceros parecen estar bien, por lo que principalmente las copio y pego para que el consumidor final también pueda tener mucha información y elegir qué hacer con ella.
- Para /comment
  - Al realizar el POST, decidí que el consumidor final enviará un cuerpo con un texto breve.
  - Al realizar GET, decidí que el usuario final tendrá la versatilidad de paginación proporcionada por la biblioteca Spring Data que planeo usar para trabajar con la base de datos falsa en memoria.

## Chequeando el resultado final

Por el momento, nuestro proyecto se ve así.
![file tree](/uploads/2023-12-30-contract-driven-dev3/Screenshot2023-12-30131549.png)

No dudes en revisar cada archivo yaml en tu editor OpenAPI favorito. Estoy usando [OpenAPI ​(Swagger)​ Editor](https://plugins.jetbrains.com/plugin/14837-openapi-swagger-editor), un complemento de Jetbrains. Pero la opción más popular hoy en día es [Swagger Editor](https://editor.swagger.io/).
