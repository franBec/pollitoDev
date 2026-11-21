---
author: "Franco Becvort"
title: "Acerca de mí"
date: 2022-10-29
lastmod: 2026-11-21
description: "Ingeniero de software argentino. De San Juan a San Luis, una escala en el Reino Unido, Lisboa y la vuelta. Java, cloud y seguridad de aplicaciones."
categories: ["Personal stuff"]
type: about
---

Hola, soy Franco Becvort. En internet me dicen **Pollito**.

Nací en San Juan, Argentina, y soy ingeniero backend. La mayor parte de mi carrera fue Java y Spring Boot, casi siempre alrededor de banca, identidad y pagos. Hoy trabajo en [Devsu](https://devsu.com/) en el backend de una plataforma bancaria y de fondos de inversión, y en la revisión de seguridad que vino con eso.

Esta página es la versión larga de la bio corta: de dónde vengo, en qué trabajé y los desvíos que me trajeron hasta acá.

## San Juan, 1999

Para mi primer cumpleaños mi mamá me vistió de amarillo. Mi familia decidió en el acto que parecía un pollito, y el apodo quedó. **Pollito** me sigue desde entonces.

Crecí en la ciudad de San Juan y viví ahí hasta febrero de 2017. Fui al Colegio Central Universitario "Mariano Moreno", un secundario que depende de la Universidad Nacional de San Juan, y terminé como *Bachiller en Ciencias Naturales*. Suena elegante. Es un título de secundaria.

De adolescente me interesaba más entender cómo funcionaban las cosas que seguir el camino esperado. Quería saber cómo funcionaba el cracking de software. Pasaba horas mirando máquinas de Minecraft aunque casi no jugaba Minecraft. Me encantaba Team Fortress 2 y pensaba, ingenuamente, que algún día podía trabajar en Valve. Tocaba la guitarra con Guitar Rig y me metí en un agujero de conejo de pedales y efectos. Me iba bien en matemática, así que ingeniería en informática me pareció una excusa razonable para seguir tirando de todos esos hilos.

{{< figure src="images/about/san-juan-2017.jpg" alt="Una calle vacía de San Juan al amanecer" caption="Esquina Colorada, San Juan. Navidad de 2017, 6 a.m." class="narrow" >}}

## San Luis, 2017

En febrero de 2017 me mudé a San Luis para el curso de ingreso. En 2018 empecé Ingeniería en Informática en la Universidad Nacional de San Luis.

La universidad era gratis. Vivir no. Tengo muchos recuerdos de hacer cuentas a fin de mes. En octubre de 2017 anoté mis gastos fijos en un papel: alquiler, internet, comida. Después listé todo lo que venía encima: luz, comida del fin de semana, desayuno, higiene personal, productos de limpieza. Guardé ese papel.

{{< media-grid
  "images/about/expenses-2017.jpg;;Un presupuesto escrito a mano en un papel rayado;;Mi presupuesto de octubre de 2017. Los gastos fijos están arriba, y todo lo demás es la parte que hacía interesante el mes."
  "images/about/unsl-2018.jpg;;Franco con el pelo rosa en las escaleras de la universidad;;Pelo rosa, escaleras de la UNSL, mayo de 2018.;;1400x1050 center"
>}}

Dejé la carrera en 2021. Conseguí mi primer trabajo full time en runaID, y en mi primera semana me di cuenta de que casi nada de lo que había aprendido en la facultad me servía para las tareas que tenía adelante. Sentí que empezaba de cero.

Con los años puedo decir que las bases sólidas de lógica booleana, bases de datos y algoritmos ayudaron más de lo que les di crédito. Igual no cubren la frustración que sentí en ese momento, y que a veces todavía siento. No quiero que esto sea una historia de "dejá la facultad, la universidad no sirve", porque no lo es. Es una historia de "pensá si el esfuerzo que estás poniendo vale lo que estás recibiendo". Para hacer las cosas ahí afuera, probablemente no necesites entender coordenadas polares.

No me arrepiento de haberme ido. Me arrepiento de no haberme hecho esa pregunta antes.

## Portales de gobierno y comprobantes médicos

En septiembre de 2021 conseguí mi primer trabajo formal en [runaID](https://www.runaid.com.ar/), una empresa chica de software en La Punta, San Luis. Mi primer sueldo no me parecía real. Me acuerdo de haber cocinado un plato de fideos la noche anterior a mi primer día, sonriendo de oreja a oreja, porque por primera vez en meses iba a cenar y me iba a quedar plata para el resto del mes. Lo conté en [mi primer post sobre runaID]({{< relref "blog/2022-11-06-my-time-in-runaid.md" >}}).

Arranqué con Groovy Server Pages, JavaScript, jQuery, Bootstrap, Tomcat y SQL Server. Casi todo era para clientes de gobierno en San Luis: [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/givemethatlog), el portal del municipio donde la gente hace trámites y consultas online; un sistema interno de compras y contrataciones; y DOSEP, el servicio de salud provincial.

{{< media-grid
  "images/about/sigem.jpg;;Portada del portal municipal SIGEM;;SIGEM, el portal del municipio de San Luis. Uno de los primeros productos en los que trabajé."
  "images/about/dosep.png;;Portada del servicio de salud DOSEP;;DOSEP, el servicio de salud provincial. También trabajamos en la migración de sus historias clínicas."
>}}

{{< figure src="images/about/compras.png" alt="Sistema interno de compras con un watermark de desarrollo" caption="El sistema interno de compras y contrataciones. Esta es una build de desarrollo, de ahí el watermark." >}}

Después del trabajo en Groovy me pasé a un equipo de Next.js. DOSEP necesitaba herramientas internas para procesar comprobantes médicos de FACAF a escala y encontrar inconsistencias. Hice desde cero el dashboard de auditoría: comprobantes, jobs programados, endpoints seguros para validar e insertar datos, y las pantallas que usaban los auditores todos los días. Era interno, así que le pusimos branding de Star Wars, y C-3PO terminó en la UI.

{{< figure src="images/about/facaf-audit.jpg" alt="Dashboard de auditoría de FACAF con C-3PO de fondo" caption="El dashboard de auditoría de FACAF. C-3PO vino con el branding de Star Wars." >}}

En paralelo a mis últimos años de facultad y a mis primeros meses en runaID, hice trabajo honorario en la Facultad de Ciencias Físico Matemáticas y Naturales de la UNSL. Nadie me pagó un peso; la compensación era algo para el CV y café gratis en la cocina de los profesores. Tengo sentimientos encontrados, pero hay que empezar por algún lado. Fui tutor de ingreso y mentor de estudiantes, y me sumé a un proyecto de la universidad sobre seguridad en internet. Construimos **Riesgos en la Red**, un sitio con material para estudiantes y docentes, y dimos charlas en escuelas. La facultad todavía tiene [una nota de agradecimiento de 2021 que me lista como tutor](https://web.archive.org/web/20260416102028/https://fmn.unsl.edu.ar/curso-de-ingreso-2021-agradecimiento-a-docentes-y-tutores-del-curso-comprension-de-texto/).

{{< figure src="images/about/riesgo-en-la-red.jpg" alt="Portada del sitio Riesgos en la Red" caption="Riesgos en la Red, el sitio de seguridad en internet en el que trabajé en la UNSL." >}}

## Pagos por QR

En noviembre de 2022 me sumé a Applica Mobile para trabajar en **Yacaré**, la billetera detrás del primer sistema de pagos por QR de Argentina. Estandaricé las APIs REST del backend para los flujos de pago.

Fiserv compró Yacaré después. [La Nación cubrió la adquisición](https://www.lanacion.com.ar/economia/una-compania-internacional-compro-yacare-la-primera-empresa-argentina-en-implementar-el-qr-nid05012023/) y la llamó la primera empresa argentina en implementar pagos por QR. Yo estuve en el final de esa etapa.

{{< figure src="images/about/yacare-web.png" alt="Portada del sitio de Yacaré" caption="El sitio de Yacaré, capturado mientras trabajaba ahí." >}}

{{< figure src="images/about/yacare-qr.jpg" alt="Un cartel de QR de Yacaré en un supermercado" caption="Un cartel de QR de Yacaré en un supermercado de Posadas, Misiones. Enero de 2023." crop="2500x3300 center" class="narrow" >}}

## Banca, identidad y una escala en el Reino Unido

En mayo de 2023 me sumé a Devsu. Pasé los siguientes dos años y medio en el equipo de seguridad y onboarding de clientes del banco privado más grande de Ecuador. Migramos todas las identidades de clientes de WSO2 Identity Server a Auth0, en flujos de autenticación de unas 600.000 requests por día. El trabajo era sobre todo que nada se rompiera: proveedores de identidad en un conjunto heterogéneo de servicios Java y Spring Boot, repartidos entre Google Cloud y Azure.

Devsu me deja trabajar desde donde quiera mientras el cliente esté contento. En abril de 2023 me fui seis meses al Reino Unido, y arranqué en Devsu desde un departamento en Cheltenham. Trabajé desde ahí, viajé por Inglaterra y Escocia, y escribí un [photo dump de todo el viaje]({{< relref "blog/2023-11-04-six-months-in-the-uk.md" >}}).

{{< media-grid
  "images/about/uk-selfie-2023.jpg;;Franco sacándose una selfie frente al espejo con un pato en los auriculares;;Cinco meses sin cortarme el pelo, con un pato en los auriculares. Cheltenham, 2023.;;2667x4000 center"
  "images/about/uk-pittville-2023.jpg;;Atardecer sobre Pittville Park en Cheltenham;;Pittville Park, Cheltenham. Este atardecer sigue siendo el fondo de pantalla de mi teléfono.;;1200x1800 center"
>}}

## Lisboa, Velx y un desvío por IA

En octubre de 2023 me mudé a Lisboa. Un amigo de un amigo tenía una habitación libre por un mes; así arrancó mi etapa en Lisboa. Llevo tres años ahí.

En noviembre de 2025 me pasé al equipo de IA de Devsu como applied AI engineer y me convertí en core contributor de **Velx**, una plataforma de IA que analiza, documenta y moderniza codebases grandes. Construí herramientas MCP para planificación y code review, mejoré el motor de destilación con skipping consciente del contexto y métricas de costo, hice un editor interactivo de diagramas C4/Mermaid y escribí benchmarks reproducibles de evaluación de LLMs.

{{< figure src="images/about/gartner-2026.png" alt="Gráfico de prensa del Magic Quadrant de Gartner" caption="Devsu fue reconocida en el Magic Quadrant 2026 de Gartner para herramientas de gestión de deuda técnica. Trabajé en Velx durante esa etapa." href="https://devsu.com/resources-center/velx-gartner-magic-quadrant-2026" >}}

{{< figure src="images/portrait-sunset.jpg" alt="Franco al atardecer en Lisboa" caption="Lisboa, 2026." class="narrow" >}}

## De vuelta al backend

En julio de 2026 volví al backend. Soy uno de dos backend developers en el portal web de una fiduciaria y administradora de fondos de inversión de Ecuador: un backend-for-frontend con más de 70 endpoints sobre diez microservicios core. También lideré la revisión de seguridad de la plataforma core y del portal, y después implementé los fixes: checks de ownership por recurso, flujos de OTP y biometría atados al token del usuario, endpoints de Actuator cerrados y un pipeline de pull requests con gitleaks y Trivy.

El stack es Java 25, Spring Boot 4.1, Spring Modulith, Spring Security, WebClient, OpenAPI Generator, JUnit, Caffeine, Google Cloud (GKE, Cloud Build, Secret Manager), Helm y Docker. También cambio los servicios core cuando el portal o la app mobile lo necesitan.

## De vuelta a San Juan

A principios de 2027 me vuelvo a Argentina. San Juan, donde está mi mamá, es el plan. Voy a seguir trabajando remoto; Devsu fue remote-friendly desde el principio, y no veo por qué dejar eso. No descarto un trabajo local, pero va a ser difícil competir con la comodidad que tengo ahora.

{{< figure src="images/about/san-juan-sunset-2022.jpg" alt="Atardecer sobre un parque en San Juan" caption="San Juan, diciembre de 2022." crop="1921x760 top" >}}

## Formación

**Universidad Nacional de San Luis** — 2018 a 2021

Ingeniería en Informática. Cursada completa, título sin terminar. Promedio 7.58/10. Dejé cuando conseguí trabajo full time en runaID.

**Colegio Central Universitario "Mariano Moreno" (UNSJ)** — 2011 a 2017

Bachiller en Ciencias Naturales. Un título de secundaria, no universitario, aunque suene elegante.

### Archivo de estudio

Tengo un archivo de trabajos prácticos, exámenes y guías de estudio de la UNSL en una [carpeta pública de Drive](https://drive.google.com/drive/folders/14PXKADA4z2ZqUUrwPebnmrY4MbF6RGny?usp=drive_link). La mayoría es mía. Todavía hay estudiantes que se pasan el link.

## Idiomas

- **Español** — nativo
- **Inglés** — C2 Proficient (EF SET)
- **Portugués** — conversacional

## Certificaciones

{{< certifications >}}

## Proyectos personales

**[Pollito's Opinion on Spring Boot Development](https://springboot.pollito.tech/)** — una guía práctica para construir y poner en producción servicios Spring Boot en Java, Kotlin y Groovy, desde Spring Initializr hasta CI/CD en un VPS propio con Coolify, Docker, PostgreSQL y observabilidad completa.

**[pollito.dev](https://pollito.dev/)** — este blog. Escribo sobre ingeniería de software, infraestructura cloud y cultura de desarrollo. Cada entrada existe en inglés y español.

**[nixos-dotfiles](https://github.com/franBec/nixos-dotfiles)** — mi configuración de NixOS de uso diario como código: completamente declarativa, versionada y reproducible, con Nix flakes y Home Manager.

Algunos experimentos más:

- **[lisboa-metro-depth](https://github.com/franBec/lisboa-metro-depth)** — mapeo de la profundidad de las estaciones de metro de Lisboa con un registrador barométrico y un visor 3D web.
- **[roundest_java](https://github.com/franBec/roundest_java)** — la API del "Pokémon más redondo", hecha en Java, Kotlin, Groovy y Next.js. Lo conté en [I Built the Same App Thrice]({{< relref "blog/2025-02-12-i-built-the-same-app-thrice.md" >}}).
- **[anime-poster-generator](https://github.com/franBec/anime-poster-generator-backend)** — un servicio Spring Boot que convierte fotos en pósters minimalistas de anime, con frontend en Next.js.
- **[flywalker](https://github.com/franBec/flywalker)** — un cerebro simulado de mosca de la fruta que camina por imágenes de calles de Lisboa buscando pastel de nata. Hay un [post sobre eso]({{< relref "blog/2026-09-16-flywalker.md" >}}), y [fly-mcp](https://github.com/franBec/fly-mcp) expone el cerebro como herramientas MCP.

## Fuera del trabajo

Cuando no estoy trabajando estoy tocando la configuración de NixOS, la guitarra, leyendo o caminando por la ciudad en la que esté. También tengo una máscara de pato, una frase que nunca pensé que iba a escribir.

{{< figure src="images/about/duck.jpg" alt="Franco con una máscara de pato en una tienda" caption="Fuera del trabajo." class="small" >}}

Me encontrás en [GitHub](https://github.com/franBec) y [LinkedIn](https://www.linkedin.com/in/franco-becvort/).
