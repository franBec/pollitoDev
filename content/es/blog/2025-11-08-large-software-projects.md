---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Manejo de Errores"
date: 2025-11-08
description: "Next.js Error Boundaries y Página de No Encontrado"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-11-08-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blog Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [Por Qué es Clave Manejar Errores](#por-qué-es-clave-manejar-errores)
  * [Barrera de Errores por Segmento](#barrera-de-errores-por-segmento)
  * [Barrera de Errores Global](#barrera-de-errores-global)
    * [Una Nota sobre la Navegación](#una-nota-sobre-la-navegación)
    * [Testeando la Barrera Global](#testeando-la-barrera-global)
  * [Página de No Encontrado](#página-de-no-encontrado)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-11-08](https://github.com/franBec/tas/tree/feature/2025-11-08)

## Por Qué es Clave Manejar Errores

Un proyecto de software grande tiene que permitir que el usuario se recupere cuando algo inevitablemente sale mal.

Next.js nos da patrones basados en componentes para manejar tanto los errores inesperados en tiempo de ejecución como los fallos de página 404.

## Barrera de Errores por Segmento

En el *App Router*, el archivo `error.tsx` define una React Error Boundary específica para un segmento de ruta y sus hijos anidados.

*   **Aislamiento:** Los errores que se tiran dentro de un segmento (en un componente o una llamada API dentro de una página) quedan aislados a ese segmento, dejando los *layouts* padres, componentes hermanos y el *shell* de la aplicación funcional.
*   **Jerarquía:** Los errores siempre suben buscando el `error.tsx` padre más cercano. Podés definir UIs de error personalizadas en distintos niveles de la jerarquía de archivos.
*   **Recuperación:** El componente `error.tsx` recibe una función `reset`, que, cuando la llamamos, intenta *re-renderizar* el contenido del *boundary*.

Acá tenés una implementación para la barrera de errores de la aplicación de alto nivel:

```tsx
"use client";

import { startTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NextJsError extends Error {
  digest?: string;
}

const ErrorBoundary = ({
  error,
  reset,
}: {
  error: NextJsError;
  reset: () => void;
}) => {
  const router = useRouter();
  
  // Use startTransition to keep the UI responsive during the refresh operation
  const reload = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };
  return (
    <PageLayout>
      <PageLayout.TwoColumn>
        <PageLayout.LeftColumn>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle />
                Something went wrong
              </CardTitle>
              <CardDescription>
                We are sorry, but something unexpected happened.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                {/* The digest is useful for looking up the error in server logs */}
                {error.digest ? `Error Reference: ${error.digest}` : null}
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={reload}>Try Again</Button>
            </CardFooter>
          </Card>
        </PageLayout.LeftColumn>
        <PageLayout.RightColumn>
          <Image
            src="/undraw_connection-lost_am29.svg"
            alt="Connection lost illustration"
            width={600}
            height={400}
            className="w-full max-w-lg"
          />
        </PageLayout.RightColumn>
      </PageLayout.TwoColumn>
    </PageLayout>
  );
};
export default ErrorBoundary;
```

![Error boundary](/uploads/2025-11-08-large-software-projects/screencapture-localhost-3000-route-with-error-2025-11-08-15_20_26.png)

## Barrera de Errores Global

Si bien `error.tsx` agarra los errores dentro de un segmento, no puede atrapar los errores que se tiran en el archivo `layout.tsx` padre de ese mismo segmento. Esto pasa porque el componente *layout* está más arriba en el árbol de componentes de React que la *boundary* en sí.

Para atrapar errores críticos lanzados en el `src/app/layout.tsx` raíz, Next.js nos da el archivo especial `src/app/global-error.tsx`.

*   **Comportamiento:** Este archivo actúa como la barrera de errores final. Cuando se atrapa un error acá, reemplaza el *shell* completo de la aplicación.
*   **La Simplicidad es la Clave:** Es recomendable mantener este componente lo más simple posible. Como esta es la última línea de defensa, si algo se rompe **dentro** de `global-error.tsx`, no hay un mecanismo de respaldo. Evitá lógica compleja o *custom hooks*.
*   **Requerimientos/Advertencias:** Como reemplaza el documento entero, **tiene** que renderizar las etiquetas raíz `<html>` y `<body>`. Cualquier estilo o contexto (como *theme providers* o lógica de *dark mode*) definido en el *layout* raíz se pierde, lo que significa que funcionalidades complejas como el **modo oscuro van a explotar.**
*   **Alcance:** La barrera de error global solo funciona en modo producción, ya que el modo desarrollo te da *overlays* de error detalladas.

Acá tenés una implementación:

```tsx
"use client";

import Image from "next/image";
import { AlertTriangle } from "lucide-react";

import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NextJsError extends Error {
  digest?: string;
}

const GlobalError = ({ error }: { error: NextJsError }) => {
  return (
    <html>
      <body>
        <PageLayout>
          <PageLayout.Header
            title="Municipal Services"
            subtitle="Your Digital Gateway to Local Government Services"
          />
          <PageLayout.TwoColumn>
            <PageLayout.LeftColumn>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle />
                    Something went wrong
                  </CardTitle>
                  <CardDescription>
                    We are sorry, but something unexpected happened.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive">
                    {error.digest ? `Error Reference: ${error.digest}` : null}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button variant="secondary" asChild>
                    <a href="/">Go to Home</a>
                  </Button>
                </CardFooter>
              </Card>
            </PageLayout.LeftColumn>
            <PageLayout.RightColumn>
              <Image
                src="/undraw_connection-lost_am29.svg"
                alt="Connection lost illustration"
                width={600}
                height={400}
                className="w-full max-w-lg"
              />
            </PageLayout.RightColumn>
          </PageLayout.TwoColumn>
        </PageLayout>
      </body>
    </html>
  );
};
export default GlobalError;
```

### Una Nota sobre la Navegación

Como el estado de la aplicación raíz está completamente roto en un escenario de error global, intentar una navegación suave (usando el `<Link>` de Next.js) no es confiable. Usamos un enlace de actualización dura estándar (`<a href="/">`) para forzar un reinicio total de la aplicación.

Dado que este uso de `<a>` en lugar de `<Link>` puede generar quilombo con las reglas de *linting* estándar, debemos agregar `src/app/global-error.test.tsx` a la lista de `ignores` en `eslint.config.mjs`.

### Testeando la Barrera Global

Debido a las diferencias fundamentales entre las React Error Boundaries en desarrollo y producción, `global-error.tsx` solo se activa cuando estás corriendo un *build* de producción (`next build` y `next start`).

Para verificar tu implementación, podrías introducir temporalmente un botón simple que lance un error explícitamente dentro de `src/app/layout.tsx`, crear un *build* de producción y ejecutar la aplicación *buildeada*.

![button that throws error](/uploads/2025-11-08-large-software-projects/screencapture-localhost-3000-2025-11-08-15_51_57.png)

![global boundary screen](/uploads/2025-11-08-large-software-projects/screencapture-localhost-3000-2025-11-08-15_52_13.png)

## Página de No Encontrado

El archivo `not-found.tsx` maneja los errores 404 cuando un usuario navega a una URL que no matchea ninguna ruta definida. Esta página se dispara automáticamente por Next.js cuando ninguna ruta coincide con la URL, o explícitamente al llamar a la función de utilidad `notFound()` dentro de los componentes de servidor.

Acá está nuestro `src/app/not-found.tsx` custom:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NotFound = () => {
  return (
    <PageLayout>
      <PageLayout.TwoColumn>
        <PageLayout.LeftColumn>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchX />
                Page Not Found
              </CardTitle>
              <CardDescription>
                We are sorry, but the page you are looking for does not exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The link you followed may be broken, or the page may have been
                removed.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            </CardFooter>
          </Card>
        </PageLayout.LeftColumn>
        <PageLayout.RightColumn>
          <Image
            src="/undraw_void_wez2.svg"
            alt="Page not found illustration"
            width={600}
            height={400}
            className="w-full max-w-lg"
          />
        </PageLayout.RightColumn>
      </PageLayout.TwoColumn>
    </PageLayout>
  );
};

export default NotFound;
```

![Not Found Page](/uploads/2025-11-08-large-software-projects/screencapture-localhost-3000-asdasd-2025-11-08-15_22_36.png)

## ¿Qué Sigue?

Nos tomamos un momento para blindar la experiencia del usuario antes de meternos de lleno en funcionalidades complejas. Ahora sí, podemos encarar el próximo desafío arquitectónico, que es crucial y complicado a la vez: **Autenticación y Autorización**.
