---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 9: Next.js?"
date: 2024-11-26
description: "Creación de una app Next.js que consume el Spring Boot backend"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-11-26-pollitos-opinion-on-spring-boot-development-10/9090734.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [Sé algo de frontend](#sé-algo-de-frontend)
  * [¿Cómo encaré este desafío?](#cómo-encaré-este-desafío)
  * [Desarrollo impulsado por contratos en una app Next.js](#desarrollo-impulsado-por-contratos-en-una-app-nextjs)
    * [1. Orval configuration](#1-orval-configuration)
    * [2. prebuild script en package.json](#2-prebuild-script-en-packagejson)
    * [3. Ejemplo de uso](#3-ejemplo-de-uso)
  * [Despliegue](#despliegue)
  * [Y eso es todo](#y-eso-es-todo)
<!-- TOC -->

## Un poco de contexto

Esta es la décima parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta serie es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, hemos creado un microservicio Java Spring Boot que maneje información sobre los usuarios.
    - Puedes encontrar el resultado final de la serie en el [repo de GitHub](https://github.com/franBec/user_manager_backend/).
- En este blog vamos a crear una aplicación Next.js que consuma el microservicio Java Spring Boot. 
  - Puedes encontrar el código [en este otro repo de GitHub](https://github.com/franBec/user_manager_frontend)

¡Comencemos!

## Sé algo de frontend

No soy un desarrollador frontend, no participo en actividades de desarrollo frontend en mi día a día.

Dicho eso, **sí sé algo de frontend**:

- En 2021, cuando tenía poco dinero, quería conseguir un verdadero trabajo de desarrollador, así que me sumergí en el infierno de los tutoriales.
  - Tuve mi primer acercamiento a React con el infame [5 hours freeCodeCamp tutorial](https://www.youtube.com/watch?v=DLX62G4lc44). Ese fue mi evento canónico, me empujó hacia el rabbit hole de React.
  - No pasé entrevistas en [MercadoLibre](https://mercadolibre.com/), [ensolvers](https://www.ensolvers.com/) y [CAT Technologies](https://cat-technologies.com/). Eso me hizo darme cuenta de que no sabía nada después de los tutoriales, lo cual era totalmente cierto. Utilicen tutoriales, pero escapen del infierno de los tutoriales.
- Durante mi paso por [RunaID](https://www.runaid.com.ar/)
  - En el proyecto [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/) hubo un momento en el que yo era el único desarrollador que quedaba y no tenía otra opción que ocuparme de los detalles del frontend.
    - El frontend consistía en algunas plantillas de admin de [Bootstrap](https://getbootstrap.com/), Javascript y Jquery, todo unido en archivos [.gsp](https://gsp.grails.org/latest/guide/index.html).
  - Fui capacitado en React.
      - Obtuve [este certificado](https://udemy-certificate.s3.amazonaws.com/pdf/UC-47b54249-0cba-479f-8941-763197877682.pdf)
      - Hice una pequeña admin app para [DOSEP](https://dosep.sanluis.gob.ar/) usando Next.js, ¿Creo que versiòn 12? No recuerdo.

Pero mis mayores maestros en frontend (especialmente React) son: [Theo](https://www.youtube.com/@t3dotgg), [Josh](https://www.youtube.com/@joshtriedcoding), and [Midudev](https://www.youtube.com/@midulive).

## ¿Cómo encaré este desafío?

Como mi gusto y conocimiento sobre UI/UX no son muy buenos, elegí soluciones prefabricadas.

- Seguí la guía [schadcn/ui Next.js: Install and configure Next.js](https://ui.shadcn.com/docs/installation/next)
- Usé [v0](https://v0.dev/) para crear componentes.
- Usé [TanStack Table](https://tanstack.com/table/latest) para la tabla de usuarios.
- Seguí el video de Dave Gray [Next.js Modal with Parallel and Intercepting Routes, shadcn/ui Dialog](https://www.youtube.com/watch?v=Ft2qs7tOW1k) para crear el modal de los detalles del usuario.

Pero la librería más importante que usé fue [Orval RESTful client generator](https://orval.dev/)

## Desarrollo impulsado por contratos en una app Next.js

En la página [Orval Overview](https://orval.dev/overview) encontramos lo siguiente:

> Orval is able to generate client with appropriate type-signatures (TypeScript) from any valid OpenAPI v3 or Swagger v2 specification

Y en la página [OpenAPI Generator Overview](https://github.com/OpenAPITools/openapi-generator/tree/master?tab=readme-ov-file#overview), la herramienta que usamos en el microservicio Java Spring Boot para crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract), encontramos lo siguiente:

> OpenAPI Generator allows generation of API client libraries (SDK generation), server stubs, documentation and configuration automatically given an OpenAPI Spec (both 2.0 and 3.0 are supported)

Pareciera que es posible implementar Desarrollo impulsado por contratos en una app Next.js. Veamos cómo se hizo.

### 1. Orval configuration

En [orval.config.ts](https://github.com/franBec/user_manager_frontend/blob/main/orval.config.ts):

- Indica la ubicación de la OpenAPI specification que consumirá la aplicación Next.js.
- Indica la carpeta donde se guardarán las API y modelos generados.
  - Recomendado: agregar dicha carpeta al .gitignore.

```typescript
import { defineConfig } from "orval";

export default defineConfig({
  users: {
    output: {
      mode: "split",
      target: "src/__generated__/api/users/usersApi.ts",
      schemas: "src/__generated__/api/users/model",
      client: "react-query",
    },
    input: {
      target: "src/openapi/userManagerBackend.yaml",
    },
  },
});
```
### 2. prebuild script en package.json

```json
"prebuild": "npm run orval-build",
```

### 3. Ejemplo de uso

En la [OpenAPI Specification](https://github.com/franBec/user_manager_frontend/blob/main/src/openapi/userManagerBackend.yaml), existe una operación llamada `findById`.

```yaml
/users/{id}:
  get:
    tags:
      - User
    summary: Get user by identifier
    operationId: findById
    parameters:
      - description: User identifier
        in: path
        name: id
        required: true
        schema:
          format: int64
          type: integer
    responses:
      '200':
        description: A user
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      default:
        description: Error
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
```
Durante pre-build, Orval generó una función `useFindById`. Aquí tienes un ejemplo de cómo utilizarlo:

_src/app/users/[id]/page.tsx_

```typescript
"use client";
import { useParams } from "next/navigation";
import { getId } from "./_utils/params-utils";
import Loading from "@/components/v0/loading";
import AxiosErrorAlert from "@/components/v0/axios-error-alert";
import UserCard from "./_components/user-card";
import RedirectButton from "@/components/v0/redirect-button";
import { useFindById } from "@/__generated__/api/users/usersApi";

const UserDetails = () => {
  const id = getId(useParams<{ id: string }>());
  const {
    isPending,
    isError,
    data: response,
    error,
  } = useFindById(id, {
    axios: { baseURL: process.env.NEXT_PUBLIC_API_USERS_BASE_URL },
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <AxiosErrorAlert axiosError={error} />;
  }

  return (
    <div className="flex flex-col items-center pt-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <UserCard user={response.data} />
        <div className="w-full flex justify-end">
          <RedirectButton href="/users" label="See Users" />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
```

## Despliegue

No se complique demasiado y simplemente despliegue en un plan gratuito de [Vercel](https://vercel.com/home). No olvide agregar los secretos de ENV para apuntar al backend y el tamaño de paginación (prefiero tenerlo como algo global).

_.env.example_

```dotenv
NEXT_PUBLIC_API_USERS_BASE_URL=https://user-manager-backend-den3.onrender.com
NEXT_PUBLIC_API_USERS_PAGE_SIZE=5
```
## Y eso es todo

Fue un largo viaje, que comenzó en diciembre de 2023 con blogs antiguos (ahora eliminados), que trataban los mismos conceptos que traté en esta serie, Principios del Desarrollo impulsado por contratos.

![Screenshot2024-11-26195802](/uploads/2024-11-26-pollitos-opinion-on-spring-boot-development-10/Screenshot2024-11-26195802.png)

Hay algunos pequeños problemas que solucionar aquí y allá:
- En la aplicación frontend, por alguna razón la paginación se inserta dos veces en el historial del navegador.
- En la aplicación backend:
  - La versión H2 podría beneficiarse con el uso de Eager Loading.
  - La versión feignClient mapea cada elemento antes de filtrarlos. Con 10 elementos no es un gran problema, pero no es el enfoque correcto.

De todas formas, estoy contento con el resultado tal como está ahora.

Te invito a que leas más cosas en mi blog, ya que mi pasión por el desarrollo web me mantendrá escribiendo blogs con seguridad.

Saludos! Pollito <🐤/>.