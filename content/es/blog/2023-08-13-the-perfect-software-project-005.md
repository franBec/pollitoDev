---
author: "Franco Becvort"
title: "[El proyecto de software perfecto #05] - Páginas vacías y formulario de login"
date: 2023-08-13
description: "Hagamos esas páginas vacías"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-13-the-perfect-software-project-005/Screenshot-2023-08-14-224934.png
---

## Cuadrícula del menú principal

Hice una cuadrícula para el menú principal. Cada botón de la cuadrícula debe representar un trámite. Al hacer clic en un botón del menú, aparecen las tres opciones típicas de SIGEM:

![procedure options](/uploads/2023-08-13-the-perfect-software-project-005/screencapture-localhost-3000-2023-08-15-12_56_19.png)

1. Hacer un nuevo trámite:

- Redirige a /procedure/new

2. Consultar mis trámites:

- Redirige a /procedure/me

3. Requisitos para empezar un nuevo trámite:

- Redirige a /procedure

## Formulario de inicio de sesión

Aquí no quería imitar el inicio de sesión SIGEM actual, que implica una ventana modal emergente. En cambio, tenía dos inicios de sesión que quería imitar.

- Inicio de sesión del banco Galicia: es una página donde se muestra el formulario de login en media pantalla, y una "imagen del día" en la otra mitad.

- Inicio de sesión del banco Santander: muy similar, pero es más una barra lateral simple que me parece muy moderna y elegante.

![galicia](/uploads/2023-08-13-the-perfect-software-project-005/screencapture-onlinebanking-bancogalicia-ar-login-2023-08-14-23_48_20.png)
![santander](/uploads/2023-08-13-the-perfect-software-project-005/screencapture-www2-personas-santander-ar-obp-webapp-angular-2023-08-14-23_47_42.png)

Decidí seguir el enfoque de Galicia, porque también quería intentar hacer un componente de carrusel.

## Fallo del componente del carrusel

Entonces, sí, no salió bien. Probé algunas de las bibliotecas sobre las que leí en estos artículos de [alavarotrigo.com](https://alvarotrigo.com/blog/react-carousels/) y [byby.dev](https://byby.dev/react-carrusel-components) (no patrocinado, solo los encontré buscando en Google), y no pude hacer que realmente funcionara como quería.

El 99% fue mi error como desarrollador frontend sin experiencia, así que decidí dejarlo como una sola imagen en este momento y volver a intentarlo más tarde.

E incluso dejarlo como una sola imagen no fue tan simple. Next.js tiene esta etiqueta de imagen que no me parece muy intuitiva, probablemente también por mi falta de experiencia. Para acostumbrarme a esta nueva herramienta, seguí este pequeño tutorial de youtube...

{{< youtube EBSrVW5MXoo >}}

## Los formularios son diferentes a como solían ser

Siento que este es el mayor cambio entre Next.js 12 y 13. En Next.js 12, tenías que:

- useState() para tener el estado de los campos del formulario.
- crear una función de envío que...
  - valida las entradas.
  - obtiene una API.
  - procesa la respuesta api.

Podría simplificar un poco esto con [React Hook Form](https://react-hook-form.com/), pero cuando trabajaba en Runa, no estaba tan convencido de la biblioteca, así que hicimos el proceso de formulario a mano.

Ahora, con Next.js 13 + biblioteca shadcn/ui, hacer un formulario sigue estos pasos:

- Agregar 'usar cliente' en la parte superior del componente del formulario, porque los formularios son una cosa del cliente. Tiene sentido
- Copiar y pegar un formulario de [shadcn/ui](https://ui.shadcn.com/docs/components/form) y adaptarlo.
  - Este formulario usa React Hook Form por debajo, por lo que uno está "enganchado" a la biblioteca.
- Todavía se necesita una función de envío que, en lugar de llamar a una API, llame directamente a una función de back-end.
  - Podría llamrse a una API, pero eso sería perder totalmente el punto de la versión 13.

El resultado final... se ve mal jajaja. Pero decidí no perder mucho tiempo y darle un segundo intento más tarde.

## Conclusion

Entonces, por el momento, estos son los commits realizados. Puedes resvisarlos en la rama de GitHub [2023-08-10](https://github.com/franBec/sigem-monolith/tree/2023-08-10).

![commits](/uploads/2023-08-13-the-perfect-software-project-005/Screenshot-2023-08-14-230043.png)
