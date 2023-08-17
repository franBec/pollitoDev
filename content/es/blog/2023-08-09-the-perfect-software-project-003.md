---
author: "Franco Becvort"
title: "[El proyecto de software perfecto #03] - Empecemos"
date: 2023-08-09
description: "Observa a un backend intentando hacer frontend"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-09-the-perfect-software-project-003/screencapture-localhost-3000-2023-08-08-17_13_23.png
---

_Observa a un backend intentando hacer frontend._

## Introducción

Esto no va a ser un paso a paso de cómo funciona Node o React. Hay muchos recursos excelentes que pueden explicarlo mejor que yo. Así que no espere que este y los siguientes artículos sean amigables para principiantes. Solo escribiré los pasos, pensamientos e inconvenientes que encuentre en el camino creando este proyecto.

## 0. Tener Node instalado

Bastante autoexplicativo.

## 1. create-next-app

Abre una ventana cmd donde quieras tener tu proyecto en tu pc, y escribe...

```bash
npx create-next-app@latest
```

Y si a todo.

![nextjs-installation](/uploads/2023-08-09-the-perfect-software-project-003/Screenshot-2023-08-08-153732.png)

Al momento de escribir este artículo, Next.js se encuentra en la versión 13.4.13. Esto va a ser un problema un poco más adelante.

Luego abra la carpeta recién creada en su IDE favorito. Para proyectos relacionados con reacciones, el mío es Visual Studio Code.

![nextjs-default-project-structure](/uploads/2023-08-09-the-perfect-software-project-003/Screenshot-2023-08-08-154207.png)

Por cierto, el tema de fondo es gracias a [la extensión Doki Theme](https://github.com/doki-theme/doki-theme-vscode). Yukino es un buen tema y una buena chica en la serie. Pero mi favorita de Oregairu es Iroha.

{{< youtube U9wKkDLC6nU >}}

## 2. Elige tu propio veneno CSS

Aquí hay un buen video de Theo sobre el lío que son las bibliotecas de interfaz de usuario

{{< youtube CQuTF-bkOgc >}}

Yo, como desarrollador backend sin apenas conocimiento sobre las buenas prácticas de CSS, quiero algo que haga mucho por mí y me impida pensar en soluciones que ni siquiera sé cómo escribir.

Y así fue como me enteré de [shadcn/ui](https://ui.shadcn.com/). Es un paraíso de componentes listo para usar que funciona bien con tailwind.

Así que seguí este tutorial...

{{< youtube URpcaFga8rY >}}

Y... error.

![shadcn-error](/uploads/2023-08-09-the-perfect-software-project-003/screencapture-localhost-3000-2023-08-08-16_46_35.png)

Después de unos minutos de buscar en Google lo que podría estar sucediendo, encontré esta [publicación de Github acerca de problemas de Next.js](https://github.com/vercel/next.js/issues/53605). Y la solución es... degradar Netx.js a su versión 13.4.12.

Así que hice eso y, sí, tenemos una página.

![initial-page](/uploads/2023-08-09-the-perfect-software-project-003/screencapture-localhost-3000-2023-08-08-17_13_23.png)

De momento solo muestra un texto y tiene un botón para alternar entre modo claro/oscuro. Pero es lo suficientemente bueno para mí como punto de partida.

## 3. Configura tu linter y prettier

Una buena configuración de linter te ayudará a evitar que te dispares tu propio pie mientras escribes typescript, algo que puede ocurrir de vez en cuando.

Una buena configuración de prettier te ayudará a tener un código legible y consistente, incluso si es el único desarrollador (como mi escenario actual).

Seguí estos tutoriales.

https://dev.to/azadshukor/setting-up-nextjs-13-with-typescript-eslint-47an
https://dev-yakuza.posstree.com/en/react/nextjs/prettier/

## Conclusión

Por el momento, estos son los commits realizados.

![commits](/uploads/2023-08-09-the-perfect-software-project-003/Screenshot-2023-08-08-21-921.png)

Puede consultar este proyecto [en este repositorio de github](https://github.com/franBec/sigem-monolith).
