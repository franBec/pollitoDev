---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 10: Next.js?"
date: 2024-11-26
description: "Creating a Next.js app that consumes the Spring Boot backend"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-11-26-pollitos-opinion-on-spring-boot-development-10/9090734.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [I do know some frontend](#i-do-know-some-frontend)
  * [How did I approach this challenge?](#how-did-i-approach-this-challenge)
  * [Design by Contract principles in a Next.js application](#design-by-contract-principles-in-a-nextjs-application)
    * [1. Orval configuration](#1-orval-configuration)
    * [2. prebuild script in package.json](#2-prebuild-script-in-packagejson)
    * [3. Use example](#3-use-example)
  * [Deployment](#deployment)
  * [That&rsquo;s all](#thats-all)
<!-- TOC -->

## Some context

This is the tenth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we created a Java Spring Boot Microservice that handles information about users.
  - You can find the code at [this GitHub repo](https://github.com/franBec/user_manager_backend)
- In this blog we are going to create a frontend application that uses the Java Spring Boot Microservice. 
  - You can find the code at [this other GitHub repo](https://github.com/franBec/user_manager_frontend)

Let's start!

## I do know some frontend

I am not a frontend developer, I do not engage in frontend developer activities in my day to day.

Having said that, **I do know some frontend**:

- In 2021, when I was short on money and tired of eating every other day, I wanted to get a real developer job, so I dived into tutorial hell.
  I had my first approach to React, with the infamous [5 hours freeCodeCamp tutorial](https://www.youtube.com/watch?v=DLX62G4lc44). That was my canonical event, it pushed me into the React rabbit hole.
  - I failed interviews at [MercadoLibre](https://mercadolibre.com/), [ensolvers](https://www.ensolvers.com/), and [CAT Technologies](https://cat-technologies.com/). That made me realize I didn't know sh\*t after the tutorials, which was totally true. Please use tutorials, but escape tutorial hell.
- During my time at [RunaID](https://www.runaid.com.ar/)
  - In the [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/) project there was a time when I was the only developer left, and I had no chance but to deal with the frontend shenanigans.
    - The frontend consisted on some old [Bootstrap](https://getbootstrap.com/) admin template, Javascript and Jquery, all glued together in [.gsp files](https://gsp.grails.org/latest/guide/index.html).
  - I was given training in React.
    - Got [this certificate](https://udemy-certificate.s3.amazonaws.com/pdf/UC-47b54249-0cba-479f-8941-763197877682.pdf)
    - Did a little admin application for [DOSEP](https://dosep.sanluis.gob.ar/) using Next.js, I think 12? I don't remember.

But my biggest teachers in frontend (specially React) are: [Theo](https://www.youtube.com/@t3dotgg), [Josh](https://www.youtube.com/@joshtriedcoding), and [Midudev](https://www.youtube.com/@midulive).

## How did I approach this challenge?

Because my taste and knowledge on UI/UX is not that great, I choose pre-made solutions out there.

- Followed [schadcn/ui Next.js: Install and configure Next.j guide](https://ui.shadcn.com/docs/installation/next)
- Used [v0](https://v0.dev/) for creating components.
- Used [TanStack Table](https://tanstack.com/table/latest) for the Users' table.
- Followed Dave Gray's [Next.js Modal with Parallel and Intercepting Routes, shadcn/ui Dialog video](https://www.youtube.com/watch?v=Ft2qs7tOW1k) for creating the User's detail modal and page.

But the most important library I used was [Orval RESTful client generator](https://orval.dev/)


## Design by Contract principles in a Next.js application

In [Orval Overview page](https://orval.dev/overview) you can find the following:

> Orval is able to generate client with appropriate type-signatures (TypeScript) from any valid OpenAPI v3 or Swagger v2 specification

And in the [OpenAPI Generator Overview](https://github.com/OpenAPITools/openapi-generator/tree/master?tab=readme-ov-file#overview), the tool we used in our backend Spring Boot microservice to create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract), you can find the following:

> OpenAPI Generator allows generation of API client libraries (SDK generation), server stubs, documentation and configuration automatically given an OpenAPI Spec (both 2.0 and 3.0 are supported)

It seems that is possible to implement Design by Contract principles in a Next.js project. Let's check how it was made.

### 1. Orval configuration

In [orval.config.ts](https://github.com/franBec/user_manager_frontend/blob/main/orval.config.ts):

- Point to the OpenAPI specification that the Next.js app will consume.
- Point to the folder were the generated apis and models will be saved.
  - Recommended: add said folder to the .gitignore.

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
### 2. prebuild script in package.json

```json
"prebuild": "npm run orval-build",
```

### 3. Use example

In the [OpenAPI Specification](https://github.com/franBec/user_manager_frontend/blob/main/src/openapi/userManagerBackend.yaml), we have an operation named `findById`.

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
On pre-build, Orval generated a function `useFindById`. Here's an example on how to use it:

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

## Deployment

Don't overcomplicate, and just deploy in a [Vercel](https://vercel.com/home) free plan. Don't forget to add the ENV secrets to point to the backend, and the pagination size (personal preference to have it as a global thing).

_.env.example_

```dotenv
NEXT_PUBLIC_API_USERS_BASE_URL=https://user-manager-backend-den3.onrender.com
NEXT_PUBLIC_API_USERS_PAGE_SIZE=5
```
## That&rsquo;s all

It was a long journey, that started all the way back in December 2023 with old blogs (now deleted), treating the same concepts I did in this series, Design by Contract Principles.

![Screenshot2024-11-26195802](/uploads/2024-11-26-pollitos-opinion-on-spring-boot-development-10/Screenshot2024-11-26195802.png)

There are some minor rough edges to fix here and there:
- In the frontend app, the pagination for some reason inserts twice in the browser history.
- In the backend app:
  - the H2 version could benefit in using Eager Loading.
  - the feignClient version maps every element before even filtering them. On 10 elements is not big deal, but it is not the correct approach.

Nonetheless, I'm happy with the result as it is right now.

I invite you to check other stuff in my blog, as my passion for web development will keep me writing blogs for sure.

Cheers! Pollito <🐤/>.