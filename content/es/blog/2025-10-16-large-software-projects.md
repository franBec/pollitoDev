---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: Armado de CI/CD y Deployment"
date: 2025-10-16
draft: true
description: "Conectamos nuestro proyecto Next.js a un pipeline CI/CD usando Coolify en un VPS"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-16-large-software-projects/low-poly-isometric-ci-cd-chicken.png
---

Este post es parte de mi [serie de blogs sobre Proyectos de Software Grandes](/es/categories/large-software-projects/).

<!-- TOC -->
  * [VPS Sobre Cloud-Native](#vps-sobre-cloud-native)
  * [Coolify](#coolify)
  * [Configuración de CI/CD Paso a Paso](#configuración-de-cicd-paso-a-paso)
    * [Paso 1: Pushear el Proyecto a GitHub](#paso-1-pushear-el-proyecto-a-github)
    * [Paso 2: Configurar la GitHub App de Coolify](#paso-2-configurar-la-github-app-de-coolify)
    * [Paso 3: Crear el Proyecto y el Recurso](#paso-3-crear-el-proyecto-y-el-recurso)
    * [Paso 4: Configurar Dominio y Desplegar](#paso-4-configurar-dominio-y-desplegar)
  * [El Loop CI/CD](#el-loop-cicd)
    * [Lo que Logramos](#lo-que-logramos)
    * [Lo que Aún Falta](#lo-que-aún-falta)
  * [¿Qué Sigue?](#qué-sigue)
<!-- TOC -->

En el [post anterior](/en/blog/2025-10-12-large-software-projects), armamos un entorno de desarrollo local super sólido. Tenemos un proyecto Next.js con tipado estricto, componentes de shadcn/ui, y reglas de calidad de código estrictas manejadas por ESLint y Prettier.

El siguiente paso clave es el deployment. Un proyecto en local es solo una prueba de concepto; un proyecto real es el que se puede entregar de forma confiable y constante. Necesitamos cerrar el ciclo entre escribir código y verlo en vivo.

Este post detalla cómo movemos nuestro sistema **tas** (Town Admin System) de nuestra máquina local a un entorno de producción, utilizando una solución PaaS (Platform-as-a-Service) *self-hosted*. Así establecemos un pipeline CI/CD simple, pero altamente efectivo.

¡Pongamos ese código a volar! 🚀

## VPS Sobre Cloud-Native

Cuando hoy hablamos de deployment, lo que se asume por defecto es "*cloud-native*": [funciones serverless](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview), [bases de datos administradas](https://www.oracle.com/autonomous-database/what-is-managed-database/) y herramientas de orquestación complejas como [Kubernetes](https://kubernetes.io/) en [AWS](https://aws.amazon.com/), [Azure](https://portal.azure.com/) o [GCP](https://console.cloud.google.com/).

Para el Town Admin System, estamos eligiendo intencionalmente un camino diferente: un [Virtual Private Server (VPS)](https://www.ibm.com/think/topics/vps) dedicado, administrado por la plataforma *open-source* [Coolify](https://coolify.io/).

He aquí por qué el enfoque VPS/Coolify tiene más sentido para nuestro proyecto que una configuración *cloud-native* compleja:

1.  **Simplicidad vs. Complejidad:** Un único VPS corriendo la aplicación es dramáticamente más simple de configurar, mantener y debugear que administrar arquitecturas distribuidas complejas en la nube. Evitamos la sobrecarga de herramientas de orquestación innecesarias, lo que nos permite construir software útil sin la carga de la complejidad de la infraestructura.
2.  **Control Predictivo de Costos:** Un VPS ofrece costos mensuales fijos y predecibles. Esto contrasta fuertemente con los gastos variables de los servicios *cloud* administrados, asegurando que optimicemos para un modelo económico en lugar de prepararnos para una escala teórica y masiva.
3.  **Foco en la Velocidad del Desarrollador:** Usar una herramienta como Coolify nos abstrae de gran parte del laburo pesado de DevOps tradicional. Se encarga de la contenerización, la gestión de SSL y el deployment automatizado, permitiendo que el equipo se enfoque al 100% en escribir *features* de la aplicación.

## Coolify

Coolify funciona como una alternativa *self-hosted* a plataformas como [Netlify](https://www.netlify.com/) o [Heroku](https://www.heroku.com/), corriendo completamente en nuestro propio hardware. Utiliza [Docker](https://www.docker.com/) por debajo para gestionar aplicaciones, bases de datos y servicios, ofreciendo un *dashboard* limpio y unificado para las operaciones.

Yo ya tengo un VPS corriendo una instancia de Coolify y he asociado el dominio `pollito.tech` a esa instancia. Si te interesa ver cómo armar tu propio VPS y desplegar Coolify, lo cubro en detalle en mi [serie de posts sobre VPS](/en/categories/vps/). Date una vuelta. Para este post, asumo que Coolify ya está listo y funcionando.

## Configuración de CI/CD Paso a Paso

Nuestro objetivo es simple: cada vez que pusheamos cambios a la rama `main` de nuestro repositorio de GitHub, Coolify debería automáticamente traer el código, *buildear* la aplicación de Next.js y desplegar la nueva versión en nuestro dominio asignado.

### Paso 1: Pushear el Proyecto a GitHub

Primero, tenemos que asegurarnos de que nuestro proyecto local **tas** esté disponible en un repositorio de GitHub. El repositorio puede ser privado: la integración de la GitHub App de Coolify maneja la autenticación de forma segura.

### Paso 2: Configurar la GitHub App de Coolify

Para permitir que Coolify acceda a nuestro código y reciba *webhooks* cuando hagamos cambios, necesitamos integrarlo con GitHub.

1.  Navegá a tus Sources de Coolify y encontrá tu integración de GitHub App existente (o creá una nueva).
    ![Coolify Sources](/uploads/2025-10-16-large-software-projects/screencapture-coolify-pollito-tech-sources-2025-10-16-12_05_44.png)
2.  Editá la configuración de la aplicación para incluir el repositorio `tas` recién creado en la lista de repositorios accesibles.
    ![Coolify GitHUb App](/uploads/2025-10-16-large-software-projects/screencapture-coolify-pollito-tech-source-github-g4kkkgssgcggg4804wwkwgs4-2025-10-16-12_08_03.png)
    ![GitHub](/uploads/2025-10-16-large-software-projects/screencapture-github-settings-installations-62867320-2025-10-16-12_10_04.png)

Esto asegura que Coolify tenga los permisos necesarios para traer el código fuente y escuchar los *triggers* de deployment.

### Paso 3: Crear el Proyecto y el Recurso

En Coolify, usamos **Projects** (Proyectos) para agrupar aplicaciones relacionadas.

1.  **Crear un Nuevo Proyecto:** Yo lo llamé **"Town Admin Sys."**
2.  **Añadir un Nuevo Recurso:** Dentro del proyecto, hacé clic en "Add Resource" y seleccioná el tipo **Application** (Aplicación).
3.  **Selección de Fuente:** Seleccioná **"Private Repository with GitHub App"**. Elegí la GitHub App que configuraste en el Paso 2.
4.  **Configuración del Repositorio:** Seleccioná el repositorio `tas` y hacé clic en **"Load Repository."**

![Coolify Project Create New Application](/uploads/2025-10-16-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-new-2025-10-16-12_14_26.png)

Coolify es lo suficientemente inteligente como para detectar un proyecto Next.js. Podemos aceptar todas las opciones de configuración predeterminadas aquí.

### Paso 4: Configurar Dominio y Desplegar

Después de aceptar la configuración básica, se te redirige a la página de ajustes detallados.

1.  **Configuración del Dominio:** Desplazate hasta la sección de red y especificá el dominio donde debe vivir la aplicación. Elegí el subdominio simple y descriptivo: [tas.pollito.tech](https://tas.pollito.tech/).
2.  **Deployment:** Hacé clic en el botón **"Deploy"**.

![Coolify Detailed Project Configuration](/uploads/2025-10-16-large-software-projects/screencapture-coolify-pollito-tech-project-ok040g8c4w8kkscgsook4k48-environment-kwgo4w4gwk0gog4gos8sggwc-application-bsoswcgg44o8g0cogsk8c44o-2025-10-16-12_24_48.jpg)

Coolify toma el control. Trae el código, *buildea* la aplicación dentro de un contenedor, genera automáticamente un certificado SSL para `tas.pollito.tech` e inicia el servidor. Este proceso toma unos minutos, después de los cuales tu aplicación estará en vivo.

![live app](/uploads/2025-10-16-large-software-projects/screenshot-from-2025-10-16-12-27-55.png)

## El Loop CI/CD

El objetivo de la [Integración Continua (CI) y la Entrega Continua (CD)](https://www.redhat.com/en/topics/devops/what-is-ci-cd) es establecer un *pipeline* automatizado que mueva los cambios de código a producción de manera rápida y confiable.

Un sistema CI/CD exitoso típicamente sigue un loop infinito: Planificar → Codificar → Buildear → Testear → Liberar → Desplegar → Operar → Monitorear, y de vuelta a la Planificación.

![CI/CD Loop Diagram](/uploads/2025-10-16-large-software-projects/1-2683077548.png)

### Lo que Logramos

Al integrar GitHub con Coolify, hemos establecido con éxito la columna vertebral esencial de nuestro *pipeline*: el ciclo de entrega automatizado.

El loop que cerramos es: **Codificar → Buildear → Desplegar.**

1.  **Trigger:** Se *mergea* un cambio en la rama `main` de GitHub.
2.  **Webhooks:** GitHub notifica instantáneamente a Coolify.
3.  **Automatización:** Coolify trae el código más reciente, ejecuta los comandos de *build* (`pnpm install`, `pnpm run build`), y despliega instantáneamente la nueva imagen del contenedor.

A los pocos minutos de *mergear* código, los cambios están en vivo en `tas.pollito.tech`, sin requerir ningún esfuerzo manual por parte del desarrollador. Este loop de feedback rápido es clave para la moral y la velocidad del dev, asegurándonos de que podemos "movernos rápido" y validar nuestras *features* al toque.

### Lo que Aún Falta

Si bien logramos el Despliegue Continuo (Continuous Deployment), nuestra configuración actual es intencionalmente simple y le falta trabajo en la calidad del código:

*   **[Testing Automatizado](https://www.geeksforgeeks.org/software-testing/automation-testing-software-testing/):** Actualmente no tenemos tests automatizados (aún no tenemos nada que valga la pena testear). Una parte crucial de CI es correr un set de pruebas antes del deployment. Si nuestra aplicación se rompe durante el proceso de *build*, Coolify lo detectará, pero si la aplicación *buildeará* bien pero tiene un *bug* de *runtime*, lo va a subir igual.
*   **[Security and Quality Gates](https://www.sonarsource.com/resources/library/quality-gate/):** No hay pasos formales para verificar vulnerabilidades de seguridad (por ejemplo, escaneo de dependencias) o análisis profundo del código más allá de lo que proporciona ESLint en local.

A medida que el proyecto crezca, integrar estos *checks* de calidad en el proceso de *build* de Coolify será una prioridad para prevenir regresiones y solidificar la integridad de la base de código.

Por ahora, tenemos un camino rapidísimo a producción.

## ¿Qué Sigue?

Pasamos de una carpeta vacía a una aplicación completamente armada, estilizada y desplegada automáticamente. El trabajo de base ya está hecho.

En el próximo post, cambiaremos de sombrero y volveremos al desarrollo *front-end*:

1.  **Bocetado UX:** Voy a usar [Excalidraw](https://excalidraw.com/) (porque nunca aprendí Figma) para bocetar los flujos de usuario clave y los conceptos de interfaz para el sistema, centrándome en las rutas principales como Sign-in/Sign-up y la grilla de *dashboard* del "Área Gubernamental".
2.  **Implementación:** Implementaremos estas rutas centrales, aprovechando nuestra base de shadcn/ui para crear una experiencia de usuario profesional y navegable.

**Próximo Post**: [Proyectos de Software Grandes: Estructurando el Frontend](/es/blog/2025-10-17-large-software-projects)