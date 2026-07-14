---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Eligiendo las Herramientas Correctas"
date: 2025-10-10
draft: true
description: "Cómo Elegir un Framework Cuando No Estás Seguro"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-10-large-software-projects/3d_low_poly_chicken.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Introducción](#introducción)
  * [¿Qué Estamos Construyendo Exactamente?](#qué-estamos-construyendo-exactamente)
  * [Plan de Juego General](#plan-de-juego-general)
  * [Cómo Elegir un Framework Cuando No Estás Seguro](#cómo-elegir-un-framework-cuando-no-estás-seguro)
  * [¿Por Qué Elijo React?](#por-qué-elijo-react)
  * [¿Por Qué Elijo Next.js?](#por-qué-elijo-nextjs)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

## Introducción

En el [post anterior](/es/blog/2025-10-09-large-software-projects), compartí mi filosofía sobre cómo encarar proyectos grandes de software. ¡Ahora toca poner esos principios en práctica!

## ¿Qué Estamos Construyendo Exactamente?

Dejame que te ponga un poco en contexto sobre [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/) – el sistema original que inspiró este proyecto.

**SIGEM** (Sistema de Gestión Municipal) era una plataforma de gestión municipal súper completa en la que laburé para la ciudad de San Luis, Argentina. Imaginátelo como la columna vertebral digital para manejar una ciudad chica:

-   **Portal ciudadano**: Donde los vecinos pueden crear cuentas, solicitar permisos, pagar impuestos y acceder a servicios públicos.
-   **Backend administrativo**: Donde los empleados municipales procesan solicitudes, gestionan registros y manejan las operaciones del día a día.
-   **Módulos financieros**: Facturación de servicios, procesamiento de pagos, seguimiento de ingresos.
-   **Gestión documental**: Almacenamiento y recuperación de permisos, solicitudes y registros oficiales.
-   **Dashboards de reportes**: Analíticas e insights para la gestión de la ciudad.

El original está hecho con [Groovy Server Pages](https://gsp.grails.org/latest/guide/index.html), [jQuery](https://jquery.com/) y [Bootstrap](https://getbootstrap.com/) – ¡que, la verdad, para su época era una elección re sólida! Pero la tecnología evolucionó, y con ella, mi forma de pensar el software.

**Una aclaración rápida antes de seguir:** Este proyecto no es para bardear ni criticar al SIGEM original. La pasé increíble laburando ahí, aprendí una banda, y todavía tengo contacto con el equipo de desarrollo actual. Ese proyecto ocupa un lugar re especial en mi corazón y me formó como el developer que soy hoy. Años después, todavía lo recuerdo con cariño. Lo que hacemos acá es explorar cómo encararía un desafío similar *hoy*, con otras herramientas y las lecciones aprendidas, sin desmerecer lo que vino antes.

Nuestro objetivo no es recrear SIGEM exacto, sino reimplementar esa funcionalidad con las herramientas de hoy, sin caer de nuevo en la complejidad de ayer.

## Plan de Juego General

1.  **Primero un monolito**  
    Un solo repo, un solo pipeline de CI, un solo objetivo de deploy.

2.  **Slices verticales > capas**  
    Cada feature (por ejemplo, "Renovar Licencia de Conducir") se entrega de principio a fin: esquema de DB, handler de API, UI. Menos ida y vuelta entre equipos.

3.  **Una única base de datos relacional como fuente de la verdad**  
    Nada de persistencia políglota hasta que sea *realmente* necesario.

4.  **Frontend y backend hablan el mismo idioma**  
    Menos cambio de contexto; más reuso. O sea, TypeScript por todos lados.

5.  **Optimizar para el 80% de los casos de uso**  
    El tráfico más alto registrado en el SIGEM real fue de poco más de 100 sesiones concurrentes (el día que abrieron las inscripciones para el boleto estudiantil). En un día normal, se registran unos 2.000 inicio de sesión. ¿Fines de semana? Prácticamente vacío. No estamos construyendo para el tráfico de Netflix, estamos construyendo para las cargas de trabajo municipales del mundo real. Eso significa que podemos saltarnos la complejidad de los sistemas distribuidos, la infraestructura con auto-scaling y las micro-optimizaciones que solo importan a una escala masiva. Empezar simple, escalar cuando (y si) realmente haga falta.

Con eso en mente, elijamos el stack tecnológico que nos permita avanzar más rápido hoy y envejecer con dignidad mañana.

## Cómo Elegir un Framework Cuando No Estás Seguro

> Elegí lo que es popular, y si no te gusta lo popular, elegí lo que te gusta.

{{< youtube hkFCBCoJiAU >}}

Elegir un stack tecnológico puede ser paralizante. Hay tantas opciones, tantas opiniones, y parece que todos tienen sentimientos fuertes sobre su framework favorito.

Los frameworks populares no se hicieron populares por casualidad. Tienen:

-   **Fiabilidad probada:** Sobrevivieron la prueba del tiempo y un montón de deployments en producción.
-   **Soporte de la comunidad:** Cuando te quedes trabado (y te vas a quedar), hay una respuesta en StackOverflow, un issue en GitHub o un hilo en Discord esperándote, o una IA ya fue entrenada con lo que necesitás.
-   **Mejores herramientas:** Los frameworks populares tienen mejor soporte de IDE, más plugins, más integraciones de terceros.
-   **Contratar es más fácil:** Si alguna vez necesitás expandir el equipo, encontrar developers es una papa.

Si *realmente* no te copa la opción popular, elegí lo que personalmente preferís. Un framework con el que disfrutás laburar te va a hacer más productivo que obligarte a usar algo que odiás solo porque es popular.

Lo que importa es:

-   Empezar.
-   Construir algo.
-   Aprender de problemas reales.
-   Llegar a usuarios de verdad.

No te quedes clavado tratando de encontrar el framework "perfecto"—no existe. Todos los frameworks tienen sus pros y contras. Elegí uno que esté "bien" y dale para adelante.

## ¿Por Qué Elijo React?

Ya laburé con él, entiendo sus patrones, y puedo ser productivo desde el día uno. Pero el comfort solo no es una razón suficiente para elegir un framework. Así que veamos las razones más objetivas por las que [React](https://react.dev/) tiene sentido acá:

| Heurística                   | ¿Por qué es importante?                                                       | Chequeo de Realidad                                                                                          |
|------------------------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| Familiaridad de la Comunidad | ¿Qué tan fácil es encontrar ayuda, recursos y, potencialmente, colaboradores? | Pateas una piedra y salen 3 React devs, con sus To-Do app conectadas a una MongoDB por alguna extraña razón. |
| Viabilidad a Largo Plazo     | ¿Seguirá compilando en 2030?                                                  | Meta paga a ingenieros para que React siga vivo.                                                             |
| Escalabilidad del Código     | ¿Puede esta herramienta manejar un "proyecto de software grande"?             | El modelo de componentes + hooks escala *bien*.                                                              |
| Techo de Performance         | ¿La interfaz se va a trabar en notebooks lentas?                              | React no es el rey del bare-metal, pero es más que rápido para CRUD y dashboards.                            |
| Estándares / Accesibilidad   | ¿Pueden usarlo lectores de pantalla y teléfonos de gama baja?                 | React labura con el DOM del navegador; buenos defaults.                                                      |

*Pollito 2025-10-30 aquí, acabo de enterarme de que [Meta trasladará React a la Fundación Linux](https://www.msn.com/en-us/news/technology/meta-will-move-react-to-linux-foundation-to-address-vendor-dominance-fears/ar-AA1O9Q7C?ocid=socialshare)*

React no es perfecto, pero es *predecible*. Cuando algo falla, hay un issue de GitHub al respecto. Cuando necesitás una librería, hay tres opciones probadas y reprobadas. Cuando contratás a alguien (o le pedís ayuda a una IA), sabe de React. Esa predictibilidad vale más que ganancias marginales de performance o una sintaxis un poco más limpia.

## ¿Por Qué Elijo Next.js?

Porque conozco Next.js... más o menos.

Allá por 2022, me pasé cuatro meses laburando en un proyecto bastante tranqui hecho con Next.js 12. Era un sistema de admin para auditar recibos de medicamentos: unas pocas rutas, algunas tablas de datos, paginación, filtros y la opción de marcar entradas sospechosas. Nada del otro mundo, pero funcionaba de 10. El frontend consumía APIs expuestas por el mismo proyecto de Next.js, manteniendo todo juntito.

Desde entonces, mi camino profesional no se cruzó más con Next.js, pero lo seguí de cerca desde la tribuna: las actualizaciones, las controversias, el ecosistema creciente, todo el drama de la migración a React Server Components. Lo vi madurar desde una distancia cómoda.

Hoy por hoy, hay tres formas principales de armar una aplicación con React:

-   **[Next.js](https://nextjs.org/)**: El framework de React de Vercel. Opinionado, con todas las funciones, y listo para producción.
-   **[Vite](https://vite.dev/) + [React Router](https://reactrouter.com/)**: Un entorno de desarrollo mínimo y súper rápido, con routing del lado del cliente. Ideal para SPAs.
-   **[TanStack Start](https://tanstack.com/start/latest)**: Un framework más nuevo construido alrededor de [TanStack Router](https://tanstack.com/router/latest). Todavía está muy verde, pero promete un montón.

Para este proyecto, Next.js es la elección obvia: bien documentado, y pensado para páginas tanto estáticas como dinámicas. Nos permite enfocarnos en construir el sistema de administración municipal en vez de andar reinventando la rueda.

## What&rsquo;s Next?

([No pun intended](https://youtube.com/shorts/fLmW1URQdLs?si=Or_1CR4GZkFUH980))
![inaff](/uploads/2025-10-10-large-software-projects/ninomae-inanis-hololive-vtuber-2088695325.jpg)

Ahora que ya definimos nuestro stack tecnológico fundamental —React con Next.js— es hora de armar nuestro entorno de desarrollo como corresponde. En el próximo post, vamos a ver:

-   **Configuración inicial del proyecto Next.js** usando la convención de carpeta `src/`.
-   **Herramientas de calidad de código**: configurando ESLint y Prettier para mantener nuestro código consistente.
-   **Base de componentes UI**: armando [shadcn/ui](https://ui.shadcn.com/) para componentes lindos y accesibles.
-   **Construyendo nuestra landing page**: creando la cara visible de nuestro sistema de administración municipal.

Esto no es solo correr `npx create-next-app` y darlo por terminado. Vamos a establecer los patrones y convenciones que nos van a acompañar durante todo el proyecto — ese tipo de setup que hace que el desarrollo futuro sea más fácil, no más complicado.

¡Manos a la obra! 🚀

**Próximo Post**: [Proyectos de Software Grandes: Setup Inicial](/es/blog/2025-10-12-large-software-projects)