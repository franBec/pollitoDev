---
author: "Franco Becvort"
title: "Construyamos un Proyecto Grande de Software: Setup Inicial"
date: 2025-10-12
description: "De una carpeta vacía a un proyecto Next.js configurado"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-12-large-software-projects/stylized-chicken.png
---

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [Paso 1: Armado Inicial del Proyecto (Scaffolding)](#paso-1-armado-inicial-del-proyecto-scaffolding)
    * [Entendiendo la Estructura del Proyecto](#entendiendo-la-estructura-del-proyecto)
    * [Configurando Preferencias de IA](#configurando-preferencias-de-ia)
    * [Agregando una Licencia](#agregando-una-licencia)
  * [Paso 2: Asegurando la Calidad de Código con ESLint y Prettier](#paso-2-asegurando-la-calidad-de-código-con-eslint-y-prettier)
  * [Paso 3: Una Base de UI Moderna con shadcn/ui](#paso-3-una-base-de-ui-moderna-con-shadcnui)
    * [Personalizando el Tema](#personalizando-el-tema)
  * [Paso 4: Creando Nuestra Landing Page](#paso-4-creando-nuestra-landing-page)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

En el [post anterior](/es/blog/2025-10-10-large-software-projects), hablamos de filosofía e hicimos nuestra gran decisión: vamos a construir este proyecto con React y Next.js. Ahora, es momento de dejar de hablar y empezar a construir.

Este post va todo sobre el trabajo fundacional. Vamos a ir de un directorio vacío a una aplicación Next.js completamente configurada, con herramientas de calidad de código, un sistema UI flexible, y nuestra landing page inicial.

¡Empecemos!

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-12](https://github.com/franBec/tas/tree/feature/2025-10-12)

## Paso 1: Armado Inicial del Proyecto (Scaffolding)

Primero, necesitamos elegir un manejador de paquetes. En el ecosistema JavaScript, tenés tres opciones principales:

![npm vs pnpm vs yarn](/uploads/2025-10-12-large-software-projects/1_Ylw-2QlJwst-houRAGGQ4w-878584098.png)

- **[npm](https://www.npmjs.com/)**: El que viene por defecto con Node.js. Confiable, pero más lento.
- **[yarn](https://yarnpkg.com/)**: Más rápido que npm, introdujo primero los *workspaces* y los *lockfiles*.
- **[pnpm](https://pnpm.io/)**: El más rápido y eficiente en disco. Usa *symlinks* (enlaces simbólicos) para evitar duplicar dependencias.

Yo elijo **pnpm** porque es rápido, eficiente, y maneja bien las cosas. Las diferencias son mínimas en proyectos chicos, sí, pero los buenos hábitos se adquieren desde el principio.

Ahora, creemos nuestro proyecto:

```bash
pnpm dlx create-next-app@latest tas
```

**tas** significa "Town Admin System". No muy creativo, lo sé, pero nombrar cosas es genuinamente uno de los problemas más difíciles en desarrollo de software. A veces "descriptivo y aburrido" le gana a "ingenioso y confuso".

Durante la instalación, vas a ver estas preguntas:

```txt
What is your project named? tas
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like your code inside a `src/` directory? Yes
Would you like to use App Router? (recommended) Yes
Would you like to use Turbopack? (recommended) Yes
Would you like to customize the import alias (`@/*` by default)? No
```

Aceptá todos los valores por defecto. Son elecciones sensatas que se alinean con las convenciones modernas de Next.js.

### Entendiendo la Estructura del Proyecto

Estamos usando **Next.js 15**, que viene con el App Router, un sistema de ruteo mucho más potente que el viejo Pages Router. Así es como se ve la estructura generada:

```
tas/
├── src/
│   └── app/
│       ├── layout.tsx      # Layout raíz (envuelve todas las páginas)
│       ├── page.tsx         # Página de inicio (ruta: /)
│       └── globals.css      # Estilos globales
├── public/                  # Assets estáticos (imágenes, fuentes, etc.)
├── next.config.ts           # Configuración de Next.js
├── tailwind.config.ts       # Configuración de Tailwind CSS
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias y scripts
```

Convenciones clave que tenés que saber:

- **`src/app/`**: Cada carpeta dentro de acá se convierte en una ruta. `src/app/about/page.tsx` → `/about`
- **`layout.tsx`**: UI compartida que envuelve las páginas. Ideal para barras de navegación, *footers*, proveedores de autenticación.
- **`page.tsx`**: El contenido real de la página para una ruta.

Esto no pretende ser un tutorial profundo de Next.js. Para eso, chequeá la guía oficial de [Project Structure and Organization](https://nextjs.org/docs/app/getting-started/project-structure).

Lo importante: **estamos siguiendo las convenciones del framework**.

### Configurando Preferencias de IA

El desarrollo moderno suele incluir asistencia de IA, ya sea a través de GitHub Copilot, Cursor u otras herramientas. Diferentes modelos de IA funcionan mejor con distintos estilos de *prompting*.

Tuve buenos resultados con [Qwen Code](https://github.com/QwenLM/qwen-code) en el pasado, así que voy a incluir un archivo `QWEN.md` en la raíz del proyecto (aclaro que no es canje/sponsor). Este archivo documenta las convenciones del proyecto, patrones de organización de archivos y preferencias de estilo para que los asistentes de IA puedan consultarlas.

### Agregando una Licencia

Dado que este proyecto podría servir eventualmente como plantilla para otras organizaciones, elijo la **Licencia MIT**, una de las licencias de código abierto más permisivas que existen.

Una comparación rápida de licencias comunes:

| Licencia                                                           | Característica Clave                                               |
|--------------------------------------------------------------------|--------------------------------------------------------------------|
| **[MIT](https://mit-license.org/)**                                | Hacé lo que quieras, solo mantené el aviso de derechos de autor.   |
| **[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)** | Similar a MIT, pero con concesiones explícitas de patentes.        |
| **[GPL](https://www.gnu.org/licenses/gpl-3.0.en.html)**            | Las modificaciones deben ser también de código abierto (Copyleft). |
| **Unlicense**                                                      | Dominio público (sin restricciones de ningún tipo).                |

Para un template de sistema municipal, MIT tiene sentido: es lo suficientemente permisivo como para que cualquier municipio pueda adaptarlo sin complejidad legal, pero mantiene la atribución.

## Paso 2: Asegurando la Calidad de Código con ESLint y Prettier

Un *codebase* consistente es un *codebase* feliz. Para lograr esto, usaremos dos herramientas esenciales:

![Prettier + ESLint](/uploads/2025-10-12-large-software-projects/1_YvqvekgbQeEquRfo17XfuA-4230300076.jpeg)

- **[ESLint](https://eslint.org/) (Linter)**: Analiza el código para encontrar y arreglar problemas basándose en reglas configurables. Atrapa bugs y asegura buenas prácticas.
- **[Prettier](https://prettier.io/) (Formatter)**: Un formateador de código dogmático que fuerza un estilo consistente. Termina con los debates sin sentido sobre tabs vs. espacios o dónde poner una llave.

Para configurarlos en un proyecto moderno de Next.js 15, estoy usando un script útil de la comunidad: [eslint-prettier-next-15](https://github.com/danielalves96/eslint-prettier-next-15).

```bash
pnpm dlx eslint-prettier-next-15
```

Esto automatiza la instalación y el proceso de configuración. Hice dos pequeños ajustes a la configuración por defecto:

1.  En `.prettierrc.json`, establecí `"printWidth": 80`. Es lo suficientemente angosto como para ver dos archivos cómodamente lado a lado, y ha sido un estándar implícito en la industria durante décadas.
2.  En `eslint.config.mjs`, agregué un array `ignores` para evitar que ESLint intente analizar archivos y directorios que no debería, como salidas de *build*, módulos de node y archivos de configuración.

Acá está mi array `ignores`:

```mjs
ignores: [
  // Build/Generated directories
  ".next/**",
  "coverage/**",
  "node_modules/**",
  "dist/**",
  "out/**",
  "build/**",

  // Config files
  "**/*.config.*",
  "next-env.d.ts",

  // Infrastructure
  ".{idea,git,cache,output,temp}/**",
  "public/**",
],
```

## Paso 3: Una Base de UI Moderna con shadcn/ui

¡Ahora sí, la parte divertida: los componentes! Para este proyecto, voy a usar [shadcn/ui](https://ui.shadcn.com/).

![shadcn/ui](/uploads/2025-10-12-large-software-projects/559314a0-c97f-4ac1-b82c-b456ce626bd0-cover-3732757206.png)

Al momento de escribir esto, parece que shadcn/ui ganó la guerra de las librerías de componentes, y con justa razón.

Las librerías de componentes tradicionales operan como cajas negras: instalás un paquete, importás componentes y esperás que las opciones de personalización que ofrecen cumplan con tus requisitos.

**shadcn/ui da vuelta el modelo por completo.** De hecho, no es realmente una librería de componentes, sino un sistema de distribución de código que coloca el código fuente completo del componente directamente en tu proyecto. Este modelo de propiedad elimina por completo el "vendor lock-in". Vos sos el dueño del código, así que podés cambiar lo que se te antoje.

Vamos a configurarlo siguiendo la [guía de instalación oficial](https://ui.shadcn.com/docs/installation/next):

```bash
pnpm dlx shadcn-ui@latest init
```

Aceptá todos los *prompts* por defecto. Este comando configurará las dependencias necesarias y creará un directorio `components`.

Dado que shadcn/ui genera código directamente en nuestro proyecto, debemos indicarle a nuestras herramientas de calidad que lo ignoren:

- Agregá los archivos generados por shadcn (`"src/components/ui/**"` y `"src/lib/utils.ts"`) al array `ignores` en `eslint.config.mjs`.
    ```mjs
    // Generated by shadcn/ui
    "src/components/ui/**",
    "src/components/theme/**",
    "src/hooks/use-mobile.ts",
    "src/lib/utils.ts",
    ```
- También agregá los archivos de shadcn a `.prettierignore`.
    ```.ignore
    # shadcn components
    /src/components/theme
    /src/components/ui
    /src/hooks/use-mobile.ts
    /src/lib/utils.ts
    ```

### Personalizando el Tema

shadcn usa variables CSS para el *theming*. Podrías editarlas a mano, pero hay una forma mejor: [tweakcn.com](https://tweakcn.com/).

Voy a usar el *preset* **"Modern Minimal"** porque es limpio y profesional, perfecto para una plataforma de servicios gubernamentales.

![tweakcn modern minimal](/uploads/2025-10-12-large-software-projects/tweakcn.png)

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/modern-minimal.json
```

Así de simple, nuestra app tiene un sistema de diseño hermoso y consistente.

## Paso 4: Creando Nuestra Landing Page

Con nuestra base en su lugar, por fin podemos construir algo visible. Personalicemos la *landing page* por defecto en `src/app/page.tsx`.

```tsx
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                    Municipal Services
                                </h1>
                                <p className="text-xl md:text-2xl text-muted-foreground mb-6">
                                    Your Digital Gateway to Local Government Services
                                </p>
                                <p className="text-lg mb-8">
                                    Access municipal services, submit requests, and manage your
                                    civic obligations through our secure online platform.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={"/sign-in"}>
                                    <Button>Sign In to Your Account</Button>
                                </Link>
                                <Link href={"/areas/gov"}>
                                    <Button variant="outline">Continue Without Signing In</Button>
                                </Link>
                            </div>

                            <p className="text-sm text-muted-foreground max-w-md">
                                Note: Some administrative processes require a registered account
                                and may not be available to guests.
                            </p>
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <Image
                                src="/undraw_city-life_l74x.svg"
                                alt="City life illustration"
                                width={600}
                                height={400}
                                className="w-full max-w-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

![screencapture localhost 3000](/uploads/2025-10-12-large-software-projects/screencapture-localhost-3000-2025-10-12-21_52_19.png)

Le pedí a mi asistente de IA que resumiera el propósito de nuestra nueva *landing page*. Esto es lo que dijo:

>✦ El archivo @/src/app/page.tsx es la página de inicio de lo que parece ser un sitio web de servicios municipales. Utiliza Next.js con Tailwind CSS para el estilo e incluye los siguientes elementos clave:
>
>1. Diseño y estilo: La página utiliza clases de Tailwind CSS para crear un diseño adaptable con una sección de encabezado que incluye un título, una descripción y dos botones.
    También incluye una imagen en pantallas más grandes, ubicada a la derecha o debajo del texto, según el tamaño de la pantalla (usando grid-cols-2 para pantallas medianas y superiores).
>
>2. Contenido del texto:
>- Un encabezado principal: "Servicios municipales".
>- Un subtítulo: "Su portal digital a los servicios del gobierno local".
>- Un párrafo que describe el propósito del sitio: "Acceda a los servicios municipales, envíe solicitudes y gestione sus obligaciones cívicas a través de nuestra plataforma en línea segura".
>
>3. Botones de navegación:
>- Un botón principal con el texto "Iniciar sesión en su cuenta" que enlaza a /sign-in.
>- Un botón con el texto "Continuar sin iniciar sesión" que enlaza a /areas/gov.
>
>4. Información adicional:
>- Una nota que indica que algunas funciones requieren una cuenta registrada. Esta nota tiene un color de primer plano apagado.
>
>5. Imagen:
>- Se incluye una imagen usando next/image que muestra un archivo SVG (/undraw_city-life_l74x.svg). Esta imagen parece decorativa, posiblemente relacionada con el tema "vida urbana" de la aplicación.
>
>En general, la página sirve como punto de entrada a la aplicación, ofreciendo una breve introducción y dirigiendo a los usuarios a iniciar sesión o explorar el sitio sin una cuenta.

Esto capta perfectamente el objetivo: crear una puerta de entrada acogedora para nuestra aplicación.

## What&rsquo;s Next?

([No pun intended](https://youtube.com/shorts/fLmW1URQdLs?si=Or_1CR4GZkFUH980))
![inaff](/uploads/2025-10-10-large-software-projects/ninomae-inanis-hololive-vtuber-2088695325.jpg)

Hemos establecido una base local sólida: un proyecto Next.js con tipado, componentes de UI espectaculares y reglas estrictas de calidad de código. Pero un proyecto no está verdaderamente "armado" hasta que está desplegado. Establecer un *pipeline* de despliegue confiable desde el principio es clave para validar nuestro stack y evitar el temido síndrome del "en mi máquina funciona".

En el próximo post, vamos a configurar un *pipeline* CI/CD muy simple, pero altamente efectivo:

1.  **Destino del Despliegue**: Utilizaremos un VPS que ya tengo.
2.  **Orquestación CI/CD**: Usaremos [Coolify](https://coolify.io/), una plataforma *self-hosted* y de código abierto para gestionar y desplegar nuestros contenedores de aplicación.
3.  **Integración Continua**: Enlazaremos nuestro repositorio de GitHub a Coolify para permitir el despliegue automático cada vez que *mergemos* código a la rama *main*.

Hacer que este ciclo básico de despliegue funcione asegura que nuestra aplicación pueda *shippear* código antes de que introduzcamos complejidad.

¡A subir código! 🚀
