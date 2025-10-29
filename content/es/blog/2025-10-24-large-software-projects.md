---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Testing Unitario"
date: 2025-10-24
description: "Implementando tests unitarios con Vitest"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-24-large-software-projects/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [Código Fuente](#código-fuente)
  * [¿Qué es el Testing y Por Qué Debería Importarnos?](#qué-es-el-testing-y-por-qué-debería-importarnos)
    * [Diferentes Tipos de Testing](#diferentes-tipos-de-testing)
  * [Eligiendo Nuestra Herramienta: ¿Por qué Vitest?](#eligiendo-nuestra-herramienta-por-qué-vitest)
  * [Configurando el Entorno de Vitest](#configurando-el-entorno-de-vitest)
    * [Paso 1: Instalar Dependencias](#paso-1-instalar-dependencias)
    * [Paso 2: Configurar Vitest](#paso-2-configurar-vitest)
    * [Paso 3: Crear el Archivo de Setup](#paso-3-crear-el-archivo-de-setup)
    * [Paso 4: Agregar Scripts de Test](#paso-4-agregar-scripts-de-test)
    * [Paso 5: Relajando las Reglas de ESLint para Archivos de Test](#paso-5-relajando-las-reglas-de-eslint-para-archivos-de-test)
  * [Guías Esenciales para el Testing Unitario](#guías-esenciales-para-el-testing-unitario)
    * [1. Seguir el Patrón AAA](#1-seguir-el-patrón-aaa)
    * [2. Testear Comportamiento, No Implementación](#2-testear-comportamiento-no-implementación)
    * [3. Asegurar Aislamiento Real](#3-asegurar-aislamiento-real)
    * [4. Escribir Tests Legibles y Centrados](#4-escribir-tests-legibles-y-centrados)
  * [Testeando un Componente Simple](#testeando-un-componente-simple)
  * [Entendiendo las Métricas de Cobertura](#entendiendo-las-métricas-de-cobertura)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

En el desarrollo a gran escala, el *testing* es la red de seguridad que nos permite iterar rápido sin miedo a romper algo que ya funcionaba.

Hoy nos metemos de lleno en la base de esa red: el **Testing Unitario**, y demostramos cómo armar un entorno de testing moderno y rapidísimo usando **Vitest** para aplicaciones React/TypeScript.

## Código Fuente

Todos los *snippets* de código que aparecen en este post están disponibles en la rama dedicada a este artículo en el repo de GitHub del proyecto:

[https://github.com/franBec/tas/tree/feature/2025-10-24](https://github.com/franBec/tas/tree/feature/2025-10-24)

## ¿Qué es el Testing y Por Qué Debería Importarnos?

El *testing*, en el contexto del desarrollo de software, es el proceso de verificar que la aplicación se comporta *de verdad* como esperamos.

### Diferentes Tipos de Testing

Si bien una estrategia de *testing* completa involucra muchas capas, las tres más comunes son:

![testing pyramid](/uploads/2025-10-24-large-software-projects/Testing-automation-pyramid-1889532600.jpg)

1.  **End-to-End (E2E):** Simula un viaje completo del usuario a través de la aplicación (por ejemplo, iniciar sesión, agregar un ítem al carrito y pagar). Herramientas como Cypress y Playwright son claves acá.
2.  **Testing de Integración:** Verifica que múltiples unidades o servicios funcionen correctamente juntos (por ejemplo, chequear si el componente de *frontend* interactúa bien con el servicio de API).
3.  **Testing Unitario:** La forma más pequeña de *testing*. Aísla las partes más chicas y testeables de una aplicación (como una sola función, método de clase o componente aislado) y las verifica por separado.

**Nuestro Foco Hoy: Testing Unitario.** Los tests unitarios son rápidos, fáciles de escribir y muy localizados, lo que los hace invaluables para obtener *feedback* inmediato durante el desarrollo y asegurar que la lógica central sea impecable.

## Eligiendo Nuestra Herramienta: ¿Por qué Vitest?

El panorama del *testing* unitario es vasto, pero la elección de la herramienta puede impactar significativamente la experiencia del desarrollador (DX) y la velocidad de ejecución de los tests en un proyecto grande.

| Framework                                 | Foco Principal   | Beneficio Clave                                                | Desventaja para Testing Unitario                |
|:------------------------------------------|:----------------|:---------------------------------------------------------------|:------------------------------------------------|
| **[Jest](https://jestjs.io/)**            | Unitario/Componente| Ecosistema maduro, sintaxis familiar                           | Puede ser lento al arrancar en proyectos grandes |
| **[Cypress](https://www.cypress.io/)**    | E2E/Integración | Excelente DX, corre en un navegador real                       | Complejidad de *setup* para tests puramente unitarios |
| **[Playwright](https://playwright.dev/)** | E2E/Integración | Soporte multidispositivo, genial para CI                        | Excesivo para tests simples de funciones aisladas |
| **[Vitest](https://vitest.dev/)**         | Unitario/Componente| Velocidad extrema (usa Vite), API compatible con Jest          | Todavía es más joven que Jest                   |

Para proyectos modernos de JavaScript/TypeScript armados con el ecosistema de Vite, **Vitest** es el claro ganador. Hereda la velocidad y la simpleza de configuración de Vite, haciendo que la ejecución de tests sea casi instantánea. Esto es clave cuando mantenés un *suite* grande de tests unitarios.

## Configurando el Entorno de Vitest

### Paso 1: Instalar Dependencias

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths @testing-library/jest-dom
```

**Desglose de Dependencias:**

*   `vitest`: El ejecutor de tests central.
*   `@vitejs/plugin-react`: Permite que Vite (y Vitest) procesen React JSX.
*   `jsdom`: Una implementación de JavaScript de la API DOM, necesaria para renderizar e interactuar con componentes React en un entorno Node.
*   `@testing-library/react` / `@testing-library/dom`: Herramientas para testear componentes UI de una manera que imite la interacción del usuario (*testing* de comportamiento).
*   `vite-tsconfig-paths`: Permite que los alias de ruta de módulos definidos en tu `tsconfig.json` funcionen correctamente dentro de los tests.
*   `@testing-library/jest-dom`: Proporciona *matchers* personalizados (como `toBeInTheDocument()`) para mejores aserciones.

### Paso 2: Configurar Vitest

Creá un archivo de configuración `vitest.config.mts` en la raíz de tu proyecto. Esta configuración establece el entorno de *testing*, define valores predeterminados globales y, crucialmente para proyectos grandes, especifica exclusiones de cobertura.

```mts
// vitest.config.mts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Required to simulate a browser environment for React components
    environment: "jsdom",
    
    // Setup file runs once before all tests
    setupFiles: ["./src/test/setup.ts"],
    
    // Exposes test functions (like 'it', 'expect') globally, avoiding imports
    globals: true,
    
    coverage: {
      exclude: [
        // Build/Generated directories
        "**/.next/**",
        "**/coverage/**",
        "**/node_modules/**",
        "**/dist/**",

        // Config files & Type declarations
        "**/*.config.*",
        "next-env.d.ts",

        // Infrastructure files
        "**/.{idea,git,cache,output,temp}/**",
        "**/public/**",

        // Files that are hard/impossible to unit test in isolation (Next.js App Router specific)
        "**/src/app/**/page.tsx", // Typically rendered by Next.js server environment
        "**/src/app/layout.tsx",
        "**/middleware.ts",

        // External/Generated Libraries (e.g., shadcn/ui components are assumed tested)
        "**/src/components/ui/**",
        "**/src/components/theme/**",
        "**/src/hooks/use-mobile.ts",
        "**/src/lib/utils.ts",
      ],
    },
  },
});
```

La lista de exclusión es **esencial** en proyectos grandes. Asegura que tus reportes de cobertura reflejen con precisión la calidad de **tu propia lógica de aplicación**, ignorando el código *boilerplate*, código generado y archivos de infraestructura del *framework*.

### Paso 3: Crear el Archivo de Setup

Necesitamos un archivo simple para importar los *matchers* DOM extendidos.

Creá `src/test/setup.ts`:

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
```

Esta importación proporciona *matchers* potentes como `expect(element).toBeVisible()`, mejorando la legibilidad y el poder de tus aserciones.

### Paso 4: Agregar Scripts de Test

Agregá *scripts* prácticos para ejecutar tus tests desde la línea de comandos:

```json
{
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
}
```

### Paso 5: Relajando las Reglas de ESLint para Archivos de Test

En proyectos grandes, la configuración que necesitamos para el código de producción (por ejemplo, optimizaciones de rendimiento, reglas de accesibilidad) puede ser un quilombo en los archivos de test. Tenemos que relajar ciertas reglas específicamente para archivos que terminan en `.test.+(ts|tsx)`.

En tu `eslint.config.mjs`, agregá el siguiente bloque:

```mjs
// eslint.config.mjs
  {
    files: ["**/*.test.+(ts|tsx)"],
    rules: {
      // Disables the Next.js rule forcing the use of the Image component. 
      // Image optimization is irrelevant in unit tests.
      "@next/next/no-img-element": "off", 
      
      // Disables the accessibility rule requiring alt text. 
      // Relaxed when focus is not full accessibility compliance.
      "jsx-a11y/alt-text": "off", 
      
      // Disables the rule enforcing React components to have a displayName. 
      // Unnecessary for test components or mocks.
      "react/display-name": "off", 
      
      // Allows variables to be declared without being used, common for mocks or test data setup.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
```

Esto asegura una separación limpia de responsabilidades: las reglas de producción aplican al código de producción, y los entornos de test tienen la flexibilidad necesaria.

## Guías Esenciales para el Testing Unitario

Configurar las herramientas es solo la mitad de la batalla; saber **qué** y **cómo** testear asegura que tu *suite* se mantenga confiable y fácil de mantener.

### 1. Seguir el Patrón AAA

Cada buen *unit test* debe seguir tres pasos:

*   **Arrange (Preparar):** Configurar el entorno de test (importar el módulo, inicializar el estado, definir entradas, *mockear* dependencias).
*   **Act (Actuar):** Ejecutar el código bajo prueba (llamar a la función, renderizar el componente, simular un *click* del usuario).
*   **Assert (Afirmar):** Verificar el resultado (chequear el valor de retorno, verificar cambios de estado, confirmar que se llamó a una función *mock*).

### 2. Testear Comportamiento, No Implementación

Al testear componentes, evitá afirmar sobre variables de estado internas o métodos específicos del ciclo de vida del componente. En su lugar, usá `@testing-library` para testear cómo interactúa el usuario con el componente.

*   **Test Bueno:** "Cuando el usuario hace *click* en el botón 'Enviar', los campos del formulario se limpian." (Testea el comportamiento visible).
*   **Test Malo:** "El *hook* `useState` para `isSubmitting` cambia de `false` a `true`." (Testea detalles de implementación interna que son propensos a romperse si el componente se refactoriza).

Consultar elementos por **rol, etiqueta o texto visible** hace que tus tests sean robustos contra cambios internos de CSS o estructurales.

### 3. Asegurar Aislamiento Real

Un *unit test* debe fallar **solo** si la unidad bajo prueba está rota. Si falla porque un servicio externo (como una API o base de datos) no está accesible, no es un *unit test*, es un *integration test*.

Usá *mocking* (con el potente `vi.mock()` de Vitest) para:

*   Llamadas a API externas (asegurate de que devuelvan datos predecibles).
*   APIs del navegador (`localStorage`, `fetch`).
*   Dependencias globales (por ejemplo, *hooks* específicos o funciones utilitarias usadas por el componente).

### 4. Escribir Tests Legibles y Centrados

Cada test (bloque `it` o `test`) debe centrarse en una pieza específica de funcionalidad.

*   Usá nombres de test claros y descriptivos que expliquen qué se está testeando y cuál es el resultado esperado (por ejemplo, `debería mostrar mensaje de error cuando el input está vacío`).
*   Mantené los archivos de test chicos. Si un archivo se vuelve demasiado grande, es posible que esté testeando demasiados componentes o funciones dispares.

## Testeando un Componente Simple

Dado `src/components/layout/area-card.tsx`:

```tsx
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

interface AreaCardProps {
  uri: string;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function AreaCard({ title, uri, subtitle, icon: Icon }: AreaCardProps) {
  return (
    <Link href={uri}>
      <Card className="hover:shadow-lg hover:bg-accent transition-shadow cursor-pointer h-full">
        <CardContent className="py-4 px-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                {Icon ? (
                  <Icon className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <div className="w-12 h-12 bg-primary/20 rounded-full" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-semibold text-lg mb-1 leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

![area card](/uploads/2025-10-24-large-software-projects/areaCard.png)

Entonces `src/components/layout/area-card.test.tsx` se vería así:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AreaCard } from "./area-card";

// Mock next/link
vi.mock("next/link", () => ({
    default: ({
                  href,
                  children,
              }: {
        href: string;
        children: React.ReactNode;
    }) => (
        <a href={href} data-testid="next-link">
            {children}
        </a>
    ),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
    Card: ({
               children,
               className,
           }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={className} data-testid="card">
            {children}
        </div>
    ),
    CardContent: ({
                      children,
                      className,
                  }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={className} data-testid="card-content">
            {children}
        </div>
    ),
}));

const MockIcon = ({ className }: { className?: string }) => (
    <svg className={className} data-testid="mock-icon" />
);

describe("AreaCard", () => {
    const defaultProps = {
        uri: "/test-uri",
        title: "Test Title",
        subtitle: "Test Subtitle",
        icon: MockIcon,
    };

    describe("Rendering & Structure", () => {
        it("should render a link wrapping the card", () => {
            render(<AreaCard {...defaultProps} />);
            const link = screen.getByTestId("next-link");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", defaultProps.uri);
            expect(screen.getByTestId("card")).toBeInTheDocument();
        });

        it("should render the card with correct content", () => {
            render(<AreaCard {...defaultProps} />);
            expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
            expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
            expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
        });
    });

    describe("Props & Variants", () => {
        it("should not render title if not provided", () => {
            const { title, ...props } = defaultProps;
            render(<AreaCard {...props} uri={props.uri} />);
            expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
        });

        it("should not render subtitle if not provided", () => {
            const { subtitle, ...props } = defaultProps;
            render(<AreaCard {...props} uri={props.uri} />);
            expect(screen.queryByText(defaultProps.subtitle)).not.toBeInTheDocument();
        });

        it("should render a placeholder if icon is not provided", () => {
            const { icon, ...props } = defaultProps;
            render(<AreaCard {...props} uri={props.uri} />);
            expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
            // Check for the placeholder div
            const cardContent = screen.getByTestId("card-content");
            const placeholder = cardContent.querySelector(".w-12.h-12");
            expect(placeholder).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have a heading for the title", () => {
            render(<AreaCard {...defaultProps} />);
            expect(
                screen.getByRole("heading", { name: defaultProps.title, level: 3 })
            ).toBeInTheDocument();
        });
    });
});
```
## Entendiendo las Métricas de Cobertura

Una vez que tus tests están corriendo, generar un reporte de cobertura es vital para identificar los huecos en tu estrategia de *testing*.

Veamos las columnas clave de un reporte de cobertura típico:

| Métrica                  | Qué Mide                                                                                                                                                                             | Objetivo Típico | Notas                                                                                                    |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------|
| **% Stmts** (Sentencias) | Porcentaje de sentencias JavaScript ejecutadas (por ejemplo, declaraciones de variables, llamadas a funciones).                                                                        | 80%+         | Objetivo general común. Menos del 80% sugiere caminos de código sin testear.                            |
| **% Lines** (Líneas)     | Porcentaje de líneas de código ejecutable cubiertas por tests. Muy correlacionado con `% Stmts`.                                                                                       | 80%+         | Indicador general: si es alto, los tests suelen ser buenos.                                               |
| **% Funcs** (Funciones)  | Porcentaje de funciones y métodos de clase definidos que fueron llamados al menos una vez durante el *testing*.                                                                        | 80%+         | Asegura que la mayoría de los puntos de entrada de la lógica estén testeados.                           |
| **% Branch** (Ramificación)| Porcentaje de ramas de lógica condicional (por ejemplo, `if`/`else`, operadores ternarios `?`/`:` o casos `switch`) que fueron completamente testeadas (cubriendo las condiciones verdaderas y falsas). | 70%+         | Más difícil de alcanzar el 100%, especialmente en código con muchas condiciones o *feature flags*. |

Aunque 100% de cobertura suene como la meta, en la práctica, a menudo es un esfuerzo malgastado. Perseguir los últimos puntos porcentuales significa escribir tests complejos para código trivial o rutas de error específicas que son difíciles de simular.

## ¿Qué Sigue?

Ahora tenés una configuración de *testing* unitario robusta y de alto rendimiento usando Vitest, configurada para una arquitectura de aplicación moderna y compleja. Los *unit tests* proporcionan el *loop* de *feedback* inmediato necesario para los desarrolladores, actuando como la primera línea de defensa contra regresiones.

Sin embargo, una vez que el código está *deployed*, los *unit tests* ya no te pueden ayudar a identificar problemas en el sistema en vivo. En proyectos de software grandes, la **Observabilidad** se convierte en la siguiente capa de defensa crucial.

Quedate atento mientras hacemos la transición de asegurar la calidad del código a garantizar la estabilidad operativa, ¡tanto localmente como en nuestro entorno VPS desplegado!

**Próximo Post**: [Proyectos de Software Grandes: Introducción al Monitoreo](/es/blog/2025-10-25-large-software-projects)
