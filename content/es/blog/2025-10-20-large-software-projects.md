---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Navegación Moderna"
date: 2025-10-20
description: "Integrando un layout con sidebar"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-20-large-software-projects/thumbnail.png
---

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [Buscando un Layout](#buscando-un-layout)
  * [Personalizando el Sidebar](#personalizando-el-sidebar)
    * [Reemplazando el Header del Sidebar](#reemplazando-el-header-del-sidebar)
      * [Pequeña Misión Secundaria: Favicon](#pequeña-misión-secundaria-favicon)
    * [Navegación Basada en Datos](#navegación-basada-en-datos)
      * [Lógica de Renderizado del Sidebar](#lógica-de-renderizado-del-sidebar)
  * [Componentes Header y Footer](#componentes-header-y-footer)
  * [Dark Mode](#dark-mode)
  * [Aplicando el Layout Globalmente](#aplicando-el-layout-globalmente)
  * [El Resultado](#el-resultado)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

Después de establecer nuestra estructura de proyecto y sistema de ruteo, es hora de armar una base de UI como la gente. Hoy vamos a implementar un *layout* de *sidebar* profesional, le meteremos soporte para *dark mode*, y crearemos un sistema de navegación que se pueda mantener fácilmente, basado en nuestra configuración de rutas centralizada.

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-20](https://github.com/franBec/tas/tree/feature/2025-10-17)

## Buscando un Layout

Al construir una aplicación grande, usar componentes estándar te acelera el desarrollo un montón. Yo quería un *sidebar* compacto y colapsable, algo muy común en aplicaciones tipo *dashboard*.

Una vez más, navegué los [blocks que da shadcn/ui](https://ui.shadcn.com/blocks) y me quedé con el **Sidebar 08** por el equilibrio entre utilidad y estética moderna.

![sidebar 08](/uploads/2025-10-20-large-software-projects/2025-10-20-12-58-08.png)

Para traer los archivos necesarios, ejecuté lo siguiente:

```bash
pnpm dlx shadcn@latest add sidebar-08 --overwrite
```

Este comando crea varios archivos, pero nos vamos en `app-sidebar.tsx` - el componente principal del sidebar.

Si iniciás el servidor de desarrollo ahora y visitás `/dashboard`, vas a ver el *layout* básico en acción.

## Personalizando el Sidebar

El *sidebar* que se generó viene con contenido de relleno (*placeholder*), así que vamos a dejarlo a nuestro gusto.

![sidebar content type](/uploads/2025-10-20-large-software-projects/sidebarContentType.png)

### Reemplazando el Header del Sidebar

En `app-sidebar.tsx`, el componente `SidebarMenuButton` actúa como el logo/enlace principal.

Reemplacemos la marca genérica con algo que encaje con nuestro proyecto. Quería un ícono de gobierno/organización, así que navegué [REMIX ICON](https://remixicon.com/) y encontré [government-fill](https://remixicon.com/icon/government-fill), que queda perfecto.

**Tip pro**: Asegurate que el logo sea *clickeable* y redirija a "/", eso es un comportamiento UX estándar que los usuarios esperan.

```tsx
<Sidebar variant="inset" {...props}>
    <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                    <Link href="/">
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <img
                                src="/government-fill.svg"
                                alt="Government"
                                className="size-4 invert"
                            />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Municipal Services
                  </span>
                            <span className="truncate text-xs">San Luis</span>
                        </div>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarHeader>
    //rest of the Sidebar component
</Sidebar>
```

![SidebarHeader](/uploads/2025-10-20-large-software-projects/2025-10-20-15-32-14.png)

#### Pequeña Misión Secundaria: Favicon

Ya que tenía el ícono listo, me tomé un momento para convertir el SVG `government-fill` a un archivo `.ico` y lo coloqué en `public/favicon.ico`. Es un detalle menor, pero clave para la experiencia del usuario y la consistencia de la marca.

### Navegación Basada en Datos

El *sidebar* por defecto de shadcn usa datos de *array* *hardcodeados* para sus enlaces. Para un proyecto grande, la navegación tiene que salir de nuestra fuente central de la verdad: `src/lib/routes.ts`.

Primero, extendemos la interfaz `RouteNode`:

```typescript
// src/lib/routes.ts

export enum SidebarContentType {
    NAV_MAIN_ROOT = "NAV_MAIN_ROOT",
    NAV_MAIN_ITEM = "NAV_MAIN_ITEM",
    NAV_SECONDARY_ITEM = "NAV_SECONDARY_ITEM",
}

export interface RouteNode {
    uri: string;
    title?: string;
    subtitle?: string;
    icon?: React.ComponentType<{ className?: string }>;
    children?: Record<string, RouteNode>;
    sidebarContent?: SidebarContentType;
}
```

#### Lógica de Renderizado del Sidebar

Actualizamos `app-sidebar.tsx` para que itere sobre las rutas y las renderice por sección:

1.  **Navegación Principal (`nav-main.tsx`):** Renderiza las áreas de aplicación de alto nivel (por ejemplo, Administración, Área Gubernamental, Área Personal).
2.  **Navegación Secundaria (`nav-secondary.tsx`):** Renderiza enlaces de utilidad o meta-enlaces (por ejemplo, "Acerca del Autor", "Acerca del Proyecto").

![sidebar](/uploads/2025-10-20-large-software-projects/2025-10-20-16-32-16.png)

Lamentablemente el *snippet* de código es medio largo, te invito a chequear el código del componente en el repo.

**Tip pro**: Agregá *tooltips* para rutas con nombres largos que puedan truncarse:

![tooltip](/uploads/2025-10-20-large-software-projects/2025-10-20-16-35-43.png)

## Componentes Header y Footer

Con el *sidebar* definido, necesitábamos componentes simples y utilitarios para la parte superior e inferior de la ventana principal.

- El **header** tiene que ser minimalista. Sus responsabilidades principales son:
    1.  Alojar el componente `SidebarTrigger` para alternar el estado colapsado del *sidebar*.
    2.  Integrar el interruptor de *dark mode* (lo discutimos a continuación).
- El **footer** es texto simple, generalmente reservado para información de *copyright* o un enlace persistente a la documentación. Evitamos sobrecargarlo; la simpleza acá previene distracciones.

## Dark Mode

Laburar con interfaces blanco brillante en sesiones largas de código te quema los ojos. Integrar el *dark mode* ahora es una *feature* obligatoria para cualquier aplicación moderna.

Siguiendo la [guía de dark mode de shadcn/ui](https://ui.shadcn.com/docs/dark-mode/next), coloqué el toogle en la **esquina superior derecha del Header**. Esta ubicación es la convención universalmente aceptada y requiere la menor carga cognitiva para los usuarios que buscan cambiar el tema.

## Aplicando el Layout Globalmente

Ahora que tenemos todas las piezas, vamos a componerlas en el *layout* principal `src/app/layout.tsx`.

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Municipal Services",
  description:
    "Access municipal services, submit requests, and manage your civic obligations through our secure online platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader />
              <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
              </main>
              <AppFooter />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- Sentite libre de cambiar el `metadata` por defecto a algo que encaje mejor con el proyecto.

Vas a notar que con el *sidebar*, el *header* y el *footer*, el espaciado vertical puede sentirse un poco apretado. Ajustemos el componente `src/components/layout/page-layout.tsx` que creamos en el blog anterior:

Antes:
```tsx
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
```

Ahora:
```tsx
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("bg-background text-foreground", className)}>
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
```

## El Resultado

![result](/uploads/2025-10-20-large-software-projects/screencapture-localhost-3000-2025-10-20-17_27_08.png)

Ahora tenemos:
- Un *sidebar* profesional y colapsable
- Navegación basada en rutas que escala con tu aplicación
- Soporte para *Dark Mode* 
- *Header* y *footer* consistentes
- Una única fuente de la verdad para las rutas

La base de la UI es sólida y fácil de mantener. A medida que agregues nuevas rutas, simplemente marcalas con `sidebarContent` y aparecerán automáticamente en la navegación.

## ¿Qué Sigue?

Antes de meternos de lleno a construir las *features* reales de nuestro proyecto de software grande, es un momento ideal para estabilizar el sistema a través de *testing*. Nuestra próxima fase se centrará en pruebas unitarias y de integración para asegurar que todas estas partes móviles recién creadas funcionen según lo previsto y se mantengan estables a medida que el proyecto crece.

Pero ese es tema para el próximo post. Por ahora, ¡a disfrutar el *dark mode* y el *layout* profesional! 🎨
```