---
author: "Franco Becvort"
title: "Proyectos de Software Grandes: El Pipeline Caótico del Desarrollo de Software en Tiempos Modernos"
date: 2025-10-03
description: "Creo que podríamos estar haciendo las cosas mejor"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-03-large-software-projects/cinematic-chicken.png
---

<!-- TOC -->
  * [La Perspectiva de un Desarrollador](#la-perspectiva-de-un-desarrollador)
  * [Los Hechos que Definen Nuestro Pipeline Caótico](#los-hechos-que-definen-nuestro-pipeline-caótico)
    * [El Infierno del Onboarding es el Default](#el-infierno-del-onboarding-es-el-default)
    * [Sos un *Maintainer*, No un *Builder* (Y Está Bien)](#sos-un-maintainer-no-un-builder-y-está-bien)
    * [La Creatividad Humana se Mide con Story Points](#la-creatividad-humana-se-mide-con-story-points)
    * [La Arquitectura por Defecto Tiene Demasiadas Piezas Móviles](#la-arquitectura-por-defecto-tiene-demasiadas-piezas-móviles)
  * [¿Y Ahora Qué Hacemos?](#y-ahora-qué-hacemos)
<!-- TOC -->

Si tuviera que describir el estado actual del desarrollo de software a gran escala en una palabra, sería: **Caótico**.

Posta, parece que colectivamente abrazamos la complejidad como si fuera una *feature*, no un bug. Estamos armando catedrales digitales enormes con demasiadas piezas móviles, que se sostienen con cinta aisladora, archivos YAML y pura fuerza de voluntad. Y lo aceptamos como algo normal.

**Ojo, no tengo la solución para este quilombo**. No estoy por venderles un curso ni a *pitchear* mi framework revolucionario. Pero creo que listar las cosas que me preocupan es un buen primer paso.

En futuras publicaciones, definitivamente planeo compartir mi filosofía sobre cómo elegir las herramientas correctas, armar las cosas de manera eficiente y enfocarse en *shipping* (entregar valor), no solo en construir la arquitectura más compleja posible. Pero antes de llegar a eso, tenemos que hablar de la realidad desordenada.

## La Perspectiva de un Desarrollador

Soy desarrollador.

Hice mi carrera en las trincheras, principalmente con Java/Spring Boot, armando y manteniendo sistemas para el Gobierno Argentino, fintechs y bancos.

Soy el que escribe las APIs, se conecta a las bases de datos y lidia con el flujo de autenticación. Nunca fui el que dibuja los diagramas de alto nivel en las salas de reuniones diciendo "sí, necesitamos este servicio del proveedor de la nube".

Sin embargo, hice mi tarea. Llevo las [certificaciones](https://www.credly.com/users/franco-becvort/badges#credly) ([Google Cloud Architect](https://cloud.google.com/learn/certification/cloud-architect), [PSM I](https://www.scrum.org/professional-scrum-master-i-certification?utm_source=credly&utm_medium=PSMI)) no como insignias de conformidad, sino como prueba de que entiendo exactamente cómo es la complejidad.

Ahora que ya aclaramos que estuve bien metido en el barro metafórico, hablemos de los problemas específicos que hacen que los proyectos grandes se sientan tan caóticos.

## Los Hechos que Definen Nuestro Pipeline Caótico

Permítanme guiarlos a través de algunos hechos que definen el panorama actual del desarrollo de software. Algunos son problemas. Otros son simplemente la realidad, y tenemos que aceptarlos. Pero aceptar la realidad no significa que no podamos intentar mejorar.

### El Infierno del Onboarding es el Default

Seamos honestos: Cuando te sumás a un proyecto nuevo, ¿cuánto tiempo pasás hasta que subís tu primer código que aporte valor?

La respuesta es casi siempre: **Demasiado**.

El primer mes de cualquier trabajo de desarrollador en un sistema grande no se trata de construir *features*; se trata de *intentar hacer que el entorno de desarrollo funcione*.

Pasás los días luchando con herramientas internas propietarias, peleando con conflictos de dependencias, clonando 30 microservicios distintos. Es un proceso frustrante, que te deja sin energía y que desmotiva a los nuevos.

¿Y por qué? Porque el sistema está diseñado con tantas partes intrincadas que nadie puede replicar el entorno de producción fácilmente.

### Sos un *Maintainer*, No un *Builder* (Y Está Bien)

Esta sección es medio un copy-paste de este video de Shade of Code. Véanlo, es un gran canal.

{{< youtube hJI2ISRIuZw >}}

La mayoría de los trabajos de software no son sobre construir cosas desde cero. Son sobre mantener vivas las cosas que ya existen sin que exploten.

El código ya está escrito. El sistema ya se entregó. Ahora tu trabajo es evitar que colapse por su propio peso.

**Porque entregar el producto es solo el principio.**

Ya no se trata de hacer que algo funcione. Se trata de que siga funcionando, lo que significa:
- Corregir bugs que vos no causaste.
- Dar soporte a *features* que vos no construiste.
- Actualizar dependencias sin romper la aplicación.
- Reescribir lógica que ya nadie entiende (porque, ¿el desarrollador original? Se fue).

La mayoría de los sistemas viven mucho más tiempo de lo que esperan sus creadores. Lo que empezó como "solo un prototipo" ahora es el *core* de la empresa, y vos sos el que lo mantiene vivo.

No es glamoroso, pero **acá es donde sucede la ingeniería de verdad**.

Escribir código totalmente nuevo es divertido. Es creativo. Da satisfacción. ¿Pero mantenerlo? Ahí es donde aprendés de arquitectura, porque por fin ves las consecuencias de las decisiones de diseño.

Que seas un *maintainer* no significa que estés estancado. Aún podés construir, solo que de maneras más silenciosas e inteligentes. Estás resolviendo problemas.

### La Creatividad Humana se Mide con Story Points

Cuando estaba estudiando para mi certificación Professional Scrum Master (PSM I) leí el [Manifesto for Agile Software Development](https://agilemanifesto.org/).

- **Nota importante:** Agile y Scrum **no** son lo mismo. Scrum es un *framework*. Agile es una cultura.

Los principios son sólidos. Pensás: "Esto es genial. Estamos organizados. Agile nos salvará del caos, hará que el desarrollo sea más rápido y unirá a los equipos".

Después me di cuenta de que cada empresa grande que *dice* usar Agile, en realidad está usando su propia versión rota y súper personalizada. Ya no están usando Agile como se debe; están usando *Agile™*.

>Cualquier esfuerzo, tiempo o energía invertidos en hacer algo que no contribuya directamente a poner software valioso en manos del usuario, eso es un desperdicio.

{{< youtube vSnCeJEka_s >}}

Gastamos energía mental quemándonos, fingiendo que estamos concentrados en las llamadas de Teams. Se trata menos de entregar valor y más de mantener un puntaje artificial de "velocidad" que se vea bien en el dashboard de Jira.

Mientras tanto, las fechas de entrega siguen cayéndose, las *features* siguen fallando, y la vieja energía de "moverse rápido y romper cosas" fue reemplazada por "moverse en círculos y agendar otra retrospectiva".

La **mala implementación de Agile destruye a los principiantes** al convencerlos de que así se ve el desarrollo real. No construir. No resolver problemas. Sino trabajo simulado que queda lindo en un dashboard.

Que no se me malinterprete: la colaboración no es mala. La comunicación es importante. Pero la mayoría de las implementaciones de Agile convierten construir cosas copadas en una obra de teatro.

¿Y ese *story point* que pasaste veinte minutos defendiendo en la planificación? No importa. Nunca importó. Vamos a entregar tarde igual.

### La Arquitectura por Defecto Tiene Demasiadas Piezas Móviles

Imaginemos que estamos armando un Sistema de Administración Municipal ([greenfield brownfield blufield](https://medium.com/@jayakishorebayadi1/greenfield-vs-brownfield-vs-bluefield-implementations-8ead800e2e08), no importa). Imaginemos funcionalidades que cubran todo, desde:

- Registro y gestión de cuentas ciudadanas.
- Solicitudes y renovaciones de permisos online (muchos formularios, *workflows* e integraciones).
- Facturación y pagos de servicios públicos (lógica financiera compleja, integraciones de terceros).
- Acceso y solicitudes de registros públicos (seguridad de datos, búsqueda y recuperación).
- Herramientas administrativas internas para el personal municipal (diferentes roles de usuario, *dashboards*).

Ahora, imaginemos que le *pitcheamos* este proyecto a una Big Tech o una consultora que quiere parecer "lista para la empresa" (*enterprise-ready*).

La propuesta comenzaría con un diagrama precioso que muestra:

!["The chaotic landscape of a 'modern' large software project](/uploads/2025-10-03-large-software-projects/Chart-2025-10-04-013903.png)
*El diagrama es tan complejo que hasta cuesta verlo. Si querés, abrilo en una pestaña nueva y hacé zoom.*

- **Capa de Frontend**: Una aplicación web pública (probablemente [React](https://react.dev/) o [Angular](https://angular.dev/)) alojada en un [CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/).
- **[API Gateway](https://www.freecodecamp.org/news/what-are-api-gateways/)**: Gestionando todas las solicitudes entrantes, limitación de tarifas, autenticación.
- **[Microservicios](https://www.geeksforgeeks.org/system-design/microservices/)** (uy, acá vamos):
    - Servicio de Autenticación de Usuario.
    - Servicio de Perfil Ciudadano.
    - Servicio de Solicitud de Permisos.
    - Servicio de Procesamiento de Pagos.
    - Servicio de Almacenamiento de Documentos.
    - Servicio de Notificaciones (correos electrónicos, SMS, *push notifications*).
    - ...
    - ...
    - ... captan la idea.
    - Cada microservicio tendría su propio [repositorio](https://aws.amazon.com/what-is/repo/), su propio [pipeline de despliegue](https://www.geeksforgeeks.org/devops/what-is-ci-cd/), su propia documentación, y probablemente su propio equipo.
- **[Message Queue](https://www.geeksforgeeks.org/system-design/message-queues-system-design/)**: [RabbitMQ](https://www.rabbitmq.com/) o [Kafka](https://kafka.apache.org/) para la comunicación entre servicios.
- **Múltiples [Bases de Datos](https://www.geeksforgeeks.org/dbms/what-is-database/)**:
    - [PostgreSQL](https://www.postgresql.org/) para [datos relacionales](https://www.ibm.com/think/topics/relational-databases).
    - [Redis for caching](https://redis.io/solutions/caching/).
- **Almacenamiento de Archivos**: [S3](https://aws.amazon.com/es/s3/) o equivalente para la subida de documentos.
- **Integraciones de Terceros**:
    - Pasarelas de pago ([Stripe](https://stripe.dev/), [PayPal](https://developer.paypal.com/home/), proveedores locales).
    - Servicio de correo electrónico ([SendGrid](https://sendgrid.com/en-us)).
    - Proveedor de SMS ([Twilio](https://www.twilio.com/en-us)).
    - Servicios de verificación de identidad ([Metamap](https://www.metamap.com/)).
- **Infraestructura**:
    - Cluster de [Kubernetes](https://kubernetes.io/) para la orquestación de contenedores.
    - [Grupos de autoescalado](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html).
    - [Balanceadores de carga](https://www.geeksforgeeks.org/system-design/what-is-load-balancer-system-design/).
    - [Múltiples entornos (dev, staging, producción)](https://learn.microsoft.com/en-us/azure/deployment-environments/overview-what-is-azure-deployment-environments).
    - [Stack de monitoreo](https://youtu.be/1X3dV3D5EJg?si=wkcbnmb5a_K9FOC_).

Es todo muy impresionante. Suena increíblemente robusto. Y, seamos honestos, algunos de esos puntos podrían estar legítimamente justificados.

Pero, ¿no te incomoda la cantidad de links? ¿La cantidad de cosas que pueden (y van a) fallar?

Podrías pensar que esto es un "problema de *skill*" y que, como desarrollador, debería estar cómodo con este diagrama. Pero creo que **usar las herramientas correctas y simplificar no es hacer trampa, es el camino correcto**.

Normalizamos la complejidad. La convertimos en el *default*. Y ahora nos sorprendemos cuando nadie entiende realmente cómo funciona todo junto.

## ¿Y Ahora Qué Hacemos?

Primero, déjenme decir esto: **No le eches la culpa a la empresa**. Esto pasa en todos lados. Las empresas no abrazan la complejidad solo por el gusto de ser complejas (o al menos, eso espero). Están tratando de construir cosas que escalen, que sean mantenibles, que se vean bien para los inversores y los stakeholders. Están lidiando con decisiones heredadas, presión del mercado y la eterna lucha entre hacer las cosas bien y hacerlas rápido.

¿El contenido hermoso sobre programación que ves online? Eso es marketing. El desarrollo real es desordenado y frustrante. Así es la vida.

**Pero eso no significa que no puedas, al menos, soñar con un mejor enfoque.**

Es importante que formes tu propia opinión sobre el desarrollo de software. Que cuestiones los *defaults*. Que preguntes: "¿De verdad necesitamos todo esto?". Que pongas resistencia cuando se agrega complejidad sin una justificación clara.

No sos un mal desarrollador por querer soluciones más simples. No te estás quedando atrás por cuestionar si realmente necesitamos diecisiete microservicios. No estás equivocado por pensar que tal vez, solo tal vez, haya una mejor manera.

En el próximo posteo, voy a dejar de quejarme y empezaré a compartir cuál sería mi enfoque: **La filosofía, las herramientas y la mentalidad para encarar proyectos de software grandes de una manera significativamente menos caótica**. ¿Será perfecto? Absolutamente no. ¿Todos van a estar de acuerdo? Definitivamente no. Pero al menos será honesto, y estará basado en experiencia real.

Hasta entonces, seguí entregando valor. Seguí cuestionando. Y recordá: si tu entorno de desarrollo tarda tres semanas en configurarse, no es tu culpa. Es un problema de diseño del sistema.

(¿Estoy siendo muy duro? ¿No lo suficiente? Ni idea)