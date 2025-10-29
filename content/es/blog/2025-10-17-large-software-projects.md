---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Estructurando el Frontend"
date: 2025-10-17
description: "Traduciendo bocetos UX a páginas de Next.js"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-17-large-software-projects/grpahic-design-thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [Advertencia Sobre Optimización Prematura](#advertencia-sobre-optimización-prematura)
  * [Bocetado UX](#bocetado-ux)
  * [Centralizando la Información](#centralizando-la-información)
  * [Abstracción de Layouts](#abstracción-de-layouts)
  * [El Patrón de Componente Compuesto](#el-patrón-de-componente-compuesto)
  * [El Patrón de Diseño Factory](#el-patrón-de-diseño-factory)
  * [Resultados de la Implementación](#resultados-de-la-implementación)
    * [Páginas de Autenticación](#páginas-de-autenticación)
    * [Páginas de Grilla de Áreas](#páginas-de-grilla-de-áreas)
    * [Prueba de Flexibilidad](#prueba-de-flexibilidad)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

En la [entrega anterior](/es/blog/2025-10-16-large-software-projects), cerramos el loop de *build* y *deploy*, logrando el Despliegue Continuo automatizado para el sistema **tas** (Town Admin System) en nuestro VPS con Coolify. Ahora tenemos un *pipeline* sólido y listo para producción.

Con la infraestructura resuelta, es hora de volver a poner el foco en lo que agrega valor: construir la interfaz de usuario. Una aplicación es tan buena como su arquitectura, y construir una UI consistente y a gran escala requiere planificación cuidadosa y la adopción de patrones de diseño.

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-17](https://github.com/franBec/tas/tree/feature/2025-10-17)

## Advertencia Sobre Optimización Prematura

Antes de sumergirnos, quiero aclarar un punto válido: para un proyecto de este tamaño, gran parte de la arquitectura que estoy a punto de implementar podría considerarse optimización prematura. No hay nada inherentemente malo en tener algo de código duplicado o una estructura más simple cuando un proyecto recién comienza.

Estoy tomando este enfoque más complejo por dos razones principales:
1.  **A Prueba de Futuro:** Estoy construyendo con la suposición de que este proyecto *podría* crecer significativamente. Estos patrones facilitarán la escalabilidad y el mantenimiento a largo plazo, incluso si ese futuro no está garantizado.
2.  **Fines Educativos:** Esta serie trata sobre explorar las mejores prácticas para proyectos de software grandes. Demostrar estos patrones es un objetivo central, incluso si son excesivos para el estado actual de la aplicación.

Como dijo [Donald Knuth](https://es.wikipedia.org/wiki/Donald_Knuth):

>La optimización prematura es la raíz de todos los males

{{< youtube tKbV6BpH-C8 >}}

## Bocetado UX

Antes de tirar una sola línea de código de componente, uso herramientas simples de bocetado—en mi caso, [Excalidraw](https://app.excalidraw.com/)—para visualizar las pantallas clave y los flujos de usuario. Esto traduce rápidamente requisitos abstractos en planos de interfaz concretos.

Aquí están los bocetos principales para las rutas centrales que necesitamos implementar:

- Home Page (`/`): Será el punto de entrada, presentando el sistema y ofreciendo navegación básica.
    ![home](/uploads/2025-10-17-large-software-projects/home.png)
- Índice de Áreas (`/areas`): Un *dashboard* que muestra varias secciones grandes del sistema municipal (Gobierno, Administración, Personal).
    ![areas](/uploads/2025-10-17-large-software-projects/areas.png)
- Dashboard de Área Gubernamental (`/areas/gov`): La pantalla de entrada para usuarios gubernamentales, que ofrece acceso a departamentos específicos (Finanzas, Servicios Públicos, etc.).
    ![areas-gov](/uploads/2025-10-17-large-software-projects/government_area.png)
- Páginas de Autenticación (`/sign-in` y `/sign-up`): Formularios estándar para la autenticación de usuarios, manteniendo el estilo visual consistente.
    ![sign-in](/uploads/2025-10-17-large-software-projects/sign-in.png)
    ![sign-up](/uploads/2025-10-17-large-software-projects/sign-up.png)

Estos bocetos son nuestro contrato para la UI. Ahora necesitamos una arquitectura que los soporte de manera consistente.

## Centralizando la Información

Un análisis rápido de los bocetos revela un problema estructural: **redundancia de información**.

Por ejemplo, la tarjeta en la página `/areas` que enlaza al Área Gubernamental tiene el título "Government Area" y un subtítulo "View and manage government-related areas and their information." Estos son exactamente el mismo título y subtítulo utilizados en la página `/areas/gov` en sí.

![grid page information](/uploads/2025-10-17-large-software-projects/grid_page_information.png)

Si el nombre del "Área Gubernamental" cambia, tendríamos que actualizarlo en dos archivos distintos: uno para la tarjeta y otro para el encabezado de la página. Esta es una violación clásica del [principio DRY (Don&rsquo;t Repeat Yourself)](https://www.geeksforgeeks.org/software-engineering/dont-repeat-yourselfdry-in-software-development/).

{{< youtube IGH4-ZhfVDk >}}

La solución es centralizar todos los metadatos de las páginas, íconos, títulos y relaciones jerárquicas en una única fuente de la verdad, independiente del sistema de ruteo basado en archivos de Next.js.

Este es un enfoque comúnmente utilizado en sistemas grandes para mantener la consistencia a través de cientos de páginas (fuente, créeme, he laburado con archivos `yaml` largos que hacen exactamente esto).

Introducimos `src/components/lib/routes.ts`:

```typescript
//imports

export interface RouteNode {
    uri: string;
    title?: string;
    subtitle?: string;
    icon?: React.ComponentType<{ className?: string }>;
    children?: Record<string, RouteNode>;
}

export const routes: Record<string, RouteNode> = {
    "/": {
        uri: "/",
        title: "Municipal Services",
        subtitle: "Your Digital Gateway to Local Government Services",
    },
    "/areas": {
        uri: "/areas",
        title: "Areas",
        subtitle: "Explore different areas of the municipal platform",
        icon: Building,
        children: {
            "/areas/admin": {
                uri: "/areas/admin",
                title: "Administration",
                subtitle: "Administrative tools",
                icon: Users,
            },
            "/areas/gov": {
                uri: "/areas/gov",
                title: "Government Area",
                subtitle:
                    "View and manage government-related areas and their information",
                icon: Building,
                children: {
                    // the children of "/areas/gov"
                },
            },
            "/areas/personal": {
                uri: "/areas/personal",
                title: "Personal Area",
                subtitle: "Manage your personal information and private data",
                icon: User,
                children: {
                    // the children of "/areas/personal"
                },
            },
        },
    },
    "/sign-in": {
        uri: "/sign-in",
        title: "Welcome Back",
        subtitle: "Sign in to your account to continue",
        icon: LogIn,
    },
    "/sign-up": {
        uri: "/sign-up",
        title: "Get Started",
        subtitle: "Create an account to continue",
        icon: UserPlus,
    },
};

export function getRouteNodeByUri(uri: string) {
    const parts = uri.split("/").filter((part) => part !== "");
    let currentNode: Record<string, RouteNode> | undefined = routes;
    let currentUri = "";

    if (uri === "/") {
        if (!routes["/"]) {
            throw new Error(`Route node not found for URI: ${uri}`);
        }
        return routes["/"];
    }

    for (let i = 0; i < parts.length; i++) {
        currentUri += "/" + parts[i];
        if (!currentNode || !currentNode[currentUri]) {
            throw new Error(`Route node not found for URI: ${uri}`);
        }

        if (i === parts.length - 1) {
            return currentNode[currentUri];
        }
        currentNode = currentNode[currentUri].children;
    }

    throw new Error(`Route node not found for URI: ${uri}`);
}
```

Este archivo ahora funciona como una fuente de la verdad para los metadatos de las diferentes páginas, como títulos, subtítulos e íconos. Cualquier página que los necesite para una ruta específica puede simplemente llamar a `getRouteNodeByUri`.

## Abstracción de Layouts

Mirando los *mockups* de nuevo, observamos que las páginas comparten estructuras de *layout* comunes:

*   **Encabezado (*Header*):** Todas las páginas tienen un título, subtítulo y a veces un ícono (derivado de `src/components/lib/routes.ts`).
*   **Estructura:** Muchas páginas usan una **Grilla (*Grid*)** para la selección de áreas o un *layout* de **Dos Columnas** para formularios y contenido auxiliar (como las páginas de *sign-in/sign-up*).

![common things between pages](/uploads/2025-10-17-large-software-projects/common_things_between_pages.png)

Un enfoque ingenuo sería crear un componente monolítico `PageLayout` y pasarle *props* para controlar su estructura:

```tsx
// Bad Practice
<PageLayout 
  title="My Title" 
  subtitle="My Subtitle" 
  useGrid={true} 
  gridColumns={3} 
  showImageColumn={false}
>
  {/* Content */}
</PageLayout>
```

Este patrón tradicional de pasar *props* lleva a dos problemas principales:

1.  **Infierno de Props y Props de Bandera (*Flag Props*):** El componente se llena de indicadores booleanos (`useGrid`, `showImageColumn`) y lógica condicional (`if (useGrid) { return <Grid>... }`).
2.  **Violación del SRP:** Un solo componente `PageLayout` sería responsable de renderizar muchos tipos de *layout* diferentes.

Como dice Robert C. Martin en *Clean Code*:

> [Las funciones deben hacer una cosa. Deben hacerla bien](https://dev.to/56_kode/the-golden-rule-of-clean-code-functions-should-do-one-thing-3lf7)

El mismo principio aplica a los componentes. No queremos un `PageLayout` que tenga que adivinar qué forma debe tomar.

## El Patrón de Componente Compuesto

La solución ideal para este problema es el [Patrón de Componente Compuesto](https://medium.com/@vitorbritto/react-design-patterns-compound-component-pattern-ec247f491294). En lugar de pasar *flags*, permitimos que el consumidor (la página) componga el *layout* utilizando bloques de construcción más pequeños y explícitos.

La idea central es adjuntar subcomponentes (como `Header`, `TwoColumns`, `Grid`) como propiedades estáticas al componente padre principal (`PageLayout`).

```tsx
// El patrón de uso deseado
<PageLayout>
  <PageLayout.Header title="..." subtitle="..." />
  <PageLayout.TwoColumns>
    {/* Contenido Columna 1 */}
    {/* Contenido Columna 2 */}
  </PageLayout.TwoColumns>
</PageLayout>
```

Este enfoque impone una estructura explícita y asegura que cada subcomponente solo maneje su preocupación de *layout* específica.

Si sos nuevo en este patrón y querés profundizar, te recomiendo mucho ver este video:

{{< youtube vPRdY87_SH0 >}}

Aunque el video usa [React Context API](https://react.dev/reference/react/useContext), nosotros no lo hacemos porque estos componentes son puramente estructurales; no comparten estado o datos que necesiten *prop drilling*. Simplemente son bloques de construcción.

Aquí está `src/components/layout/page-layout.tsx`, la implementación de nuestros componentes estructurales usando el patrón compuesto:

```tsx
import { cn } from "@/lib/utils";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
    return (
        <div
            className={cn("min-h-screen bg-background text-foreground", className)}
        >
            <div className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">{children}</div>
            </div>
        </div>
    );
}

interface PageHeaderProps {
    title?: string;
    subtitle?: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
}

PageLayout.Header = function PageHeader({
                                            title,
                                            subtitle,
                                            description,
                                            icon: Icon,
                                            className,
                                        }: PageHeaderProps) {
    return (
        <div className={cn("mb-12", className)}>
            {title && (
                <div className="flex items-center gap-4">
                    {Icon && <Icon className="w-12 h-12" />}
                    <h1 className="text-4xl md:text-6xl font-bold">{title}</h1>
                </div>
            )}
            {subtitle && (
                <p className="text-xl md:text-2xl text-muted-foreground mt-2 mb-4">
                    {subtitle}
                </p>
            )}
            {description && <p className="text-lg">{description}</p>}
        </div>
    );
};

interface TwoColumnProps {
    children: React.ReactNode;
    reverse?: boolean;
    className?: string;
}

PageLayout.TwoColumn = function TwoColumn({
                                              children,
                                              reverse = false,
                                              className,
                                          }: TwoColumnProps) {
    return (
        <div
            className={cn(
                "grid md:grid-cols-2 gap-12 items-center",
                reverse && "md:grid-flow-dense",
                className
            )}
        >
            {children}
        </div>
    );
};

interface ColumnProps {
    children: React.ReactNode;
    className?: string;
}

PageLayout.LeftColumn = function LeftColumn({
                                                children,
                                                className,
                                            }: ColumnProps) {
    return <div className={cn("space-y-6", className)}>{children}</div>;
};

PageLayout.RightColumn = function RightColumn({
                                                  children,
                                                  className,
                                              }: ColumnProps) {
    return (
        <div className={cn("flex justify-center md:justify-end", className)}>
            {children}
        </div>
    );
};

interface GridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

PageLayout.Grid = function Grid({
                                    children,
                                    columns = 4,
                                    className,
                                }: GridProps) {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn("grid gap-6", gridCols[columns], className)}>
            {children}
        </div>
    );
};
```

## El Patrón de Diseño Factory

Tenemos páginas de "Grilla de Áreas" (como `/areas` y `/areas/gov`).
![area grid pages](/uploads/2025-10-17-large-software-projects/area-grid-pages.png)

Y tenemos páginas de "Autenticación de Dos Columnas" (como `/sign-in` y `/sign-up`, dejo la *landing page* fuera de esto a propósito).
![two column pages](/uploads/2025-10-17-large-software-projects/two-column-pages.png)

Las páginas similares deben construirse de la misma manera.

Tenemos dos herramientas:
- Metadatos de ruta centralizados (`src/components/lib/routes.ts`).
- Componente de *layout* estructural (`src/components/layout/page-layout.tsx`).

Cuando las estructuras son casi idénticas, pero querés mantener una separación limpia de responsabilidades (por ejemplo, `src/components/lib/routes.ts` y `src/components/layout/page-layout.tsx` no se conocen y no deberían conocerse), el [Patrón de Diseño Factory](https://refactoring.guru/design-patterns/factory-method) encaja perfecto.

{{< youtube lLvYAzXO7Ek >}}

Aquí está `src/components/layout/page-factory.tsx`:

```tsx
import { getRouteNodeByUri } from "@/lib/routes";
import { AreaCard } from "./area-card";
import { PageLayout } from "./page-layout";

interface AreaWithGridPageProps {
    uri: string;
}

export function createAreaWithGridPage({ uri }: AreaWithGridPageProps) {
    return function AreaWithGridPage() {
        const routeNode = getRouteNodeByUri(uri);

        return (
            <PageLayout>
                <PageLayout.Header
                    title={routeNode.title}
                    subtitle={routeNode.subtitle}
                    icon={routeNode.icon}
                />

                {routeNode.children && (
                    <PageLayout.Grid columns={4}>
                        {Object.values(routeNode.children).map((it) => (
                            <AreaCard
                                key={it.uri}
                                title={it.title}
                                subtitle={it.subtitle}
                                uri={it.uri}
                                icon={it.icon}
                            />
                        ))}
                    </PageLayout.Grid>
                )}
            </PageLayout>
        );
    };
}

interface AuthPageProps {
    uri: string;
    imageSrc: string;
    altText: string;
    placeholderText: string;
}

export function createAuthPage({
                                   uri,
                                   imageSrc,
                                   altText,
                                   placeholderText,
                               }: AuthPageProps) {
    return function AuthPage() {
        const routeNode = getRouteNodeByUri(uri);

        return (
            <PageLayout>
                <PageLayout.TwoColumn>
                    <PageLayout.LeftColumn>
                        <PageLayout.Header
                            title={routeNode.title}
                            subtitle={routeNode.subtitle}
                            icon={routeNode.icon}
                        />
                        <div className="mt-8 p-6 bg-muted rounded-lg border">
                            <p className="text-center text-muted-foreground">
                                {placeholderText}
                            </p>
                        </div>
                    </PageLayout.LeftColumn>

                    <PageLayout.RightColumn>
                        <div className="w-full max-w-md">
                            <img src={imageSrc} alt={altText} className="w-full h-auto" />
                        </div>
                    </PageLayout.RightColumn>
                </PageLayout.TwoColumn>
            </PageLayout>
        );
    };
}
```

## Resultados de la Implementación

Con nuestros componentes y métodos *Factory* en su lugar, implementar nuestras páginas clave se vuelve trivial y altamente consistente.

### Páginas de Autenticación

Las páginas `/sign-in` y `/sign-up` solo necesitan llamar a la función *Factory* y pasar el contenido del formulario requerido.

**`/app/sign-in/page.tsx`**

```tsx
import { createAuthPage } from "@/components/layout/page-factory";

export default createAuthPage({
    uri: "/sign-in",
    imageSrc: "/undraw_login_weas.svg",
    altText: "Login",
    placeholderText:
        "Clerk sign-in component will be implemented in future iterations",
});
```
![sign-in](/uploads/2025-10-17-large-software-projects/sign-in.png)
![localhost/sign-in](/uploads/2025-10-17-large-software-projects/screencapture-localhost-3000-sign-in-2025-10-17-18_09_28.png)

**`/app/sign-up/page.tsx`**

```tsx
import { createAuthPage } from "@/components/layout/page-factory";

export default createAuthPage({
    uri: "/sign-up",
    imageSrc: "/undraw_hello_ccwj.svg",
    altText: "Welcome",
    placeholderText:
        "Clerk sign-up component will be implemented in future iterations",
});
```
![sign-up](/uploads/2025-10-17-large-software-projects/sign-up.png)
![localhost/sign-up](/uploads/2025-10-17-large-software-projects/screencapture-localhost-3000-sign-up-2025-10-17-18_10_01.png)

### Páginas de Grilla de Áreas

Las páginas de grilla son aún más sencillas, requiriendo solo una llamada a `createAreaWithGridPage`.

**`/app/areas/page.tsx`**

```tsx
import { createAreaWithGridPage } from "@/components/layout/page-factory";

export default createAreaWithGridPage({ uri: "/areas" });
```
![areas](/uploads/2025-10-17-large-software-projects/areas.png)
![localhost/areas](/uploads/2025-10-17-large-software-projects/screencapture-localhost-3000-areas-2025-10-17-18_10_25.png)

**`/app/areas/gov/page.tsx`**

```tsx
import { createAreaWithGridPage } from "@/components/layout/page-factory";

export default createAreaWithGridPage({ uri: "/areas/gov" });
```
![areas-gov](/uploads/2025-10-17-large-software-projects/government_area.png)
![loaclhost/areas/gov](/uploads/2025-10-17-large-software-projects/screencapture-localhost-3000-areas-gov-2025-10-17-18_10_48.png)

### Prueba de Flexibilidad

El patrón *Factory* es opcional. Para páginas únicas, podemos seguir usando `PageLayout` y `getRouteNodeByUri` directamente, manteniendo la consistencia de los metadatos mientras permitimos contenido no estándar.

**`/app/page.tsx` (Reescrito)**

```tsx
import Image from "next/image";
import Link from "next/link";

import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { getRouteNodeByUri } from "@/lib/routes";

export default function Home() {
    const routeNode = getRouteNodeByUri("/");

    return (
        <PageLayout>
            <PageLayout.TwoColumn>
                <PageLayout.LeftColumn>
                    <PageLayout.Header
                        title={routeNode.title}
                        subtitle={routeNode.subtitle}
                        description="Accede a servicios municipales, envía solicitudes y gestiona tus obligaciones cívicas a través de nuestra plataforma online segura."
                        className="mb-8"
                    />

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={"/sign-in"}>
                            <Button>Inicia Sesión en tu Cuenta</Button>
                        </Link>
                        <Link href={"/areas/gov"}>
                            <Button variant="outline">Continúa Sin Iniciar Sesión</Button>
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-md">
                        Nota: Algunos procesos administrativos requieren una cuenta registrada y
                        pueden no estar disponibles para invitados.
                    </p>
                </PageLayout.LeftColumn>

                <PageLayout.RightColumn>
                    <Image
                        src="/undraw_city-life_l74x.svg"
                        alt="City life illustration"
                        width={600}
                        height={400}
                        className="w-full max-w-lg"
                    />
                </PageLayout.RightColumn>
            </PageLayout.TwoColumn>
        </PageLayout>
    );
}
```
![home](/uploads/2025-10-17-large-software-projects/home.png)
![localhost](/uploads/2025-10-17-large-software-projects/screencapture-localhost-3000-2025-10-17-18_11_01.png)

## ¿Qué Sigue?

Hemos establecido una base para construir páginas altamente consistentes:
1.  **Metadatos Centralizados** garantizan la consistencia en los elementos de visualización.
2.  El **Patrón de Componente Compuesto** impone una estructura clara y robusta para los *layouts* de página.
3.  El **Patrón Factory** minimiza el código *boilerplate* (repetitivo) y acelera la creación de páginas estandarizadas.

Nuestras páginas actuales existen de forma aislada. En el próximo post, ampliaremos nuestro alcance a toda la aplicación:

1.  **El *Layout* de la Aplicación:** Implementaremos una estructura persistente (*Header*, *Sidebar*, Contenido Principal, *Footer*).
2.  **Navegación Global:** Usaremos nuestro archivo `routes.ts` centralizado para generar enlaces de navegación dinámicos para el *sidebar* y los menús principales.

**Próximo Post**: [Proyectos de Software Grandes: Navegación Moderna](/es/blog/2025-10-20-large-software-projects)