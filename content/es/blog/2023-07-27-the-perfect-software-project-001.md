---
author: "Franco Becvort"
title: "[El proyecto de software perfecto #01] - Disparador inicial"
date: 2023-07-27
description: "Creación de un escenario inicial"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-07-26-the-perfect-software-project/softwareDev.jpg
---

## Plan principal

La idea de esta serie de publicaciones es hacer un desarrollo web siguiendo las arquitecturas discutidas [aquí](/es/blog/2023-07-26-the-perfect-software-project).

Esto va a ser improvisado ya que no se cuantas publicaciones van a ser. El plan es:

1. Crear algún escenario.
2. Lograrlo usando un monolito.
     - ¿Qué marco monolítico? no sé todavía, en la próxima publicación discutiré las opciones.
3. Lograrlo usando frontend + backend.
     - ¿Qué interfaz? tampoco sé todavía. Probablemente Next.js (React). Pero voy a considerar Angular (ya tengo un curso comprado) o Svelte (parece estar ganando popularidad).
     - ¿Qué back-end? Spring Boot. Voy a intentar usar la versión 3.
4. Lograrlo usando microservicios.
     - Microservicios Spring seguro.

Espero que este sea un proyecto personal largo, que llevará mucho tiempo, meses, con suerte no años, aunque no me importaría.

Para cada enfoque, planeo crear un repositorio, de modo que todo el proceso de pensamiento se mantenga archivado. Y voy a aprovechar que este es un proyecto personal que no tiene una fecha límite, por lo que probablemente volveré sobre mis propios pasos y cambiaré muchas cosas si eso significa un mejor código.

## Características esperadas en su proyecto de software típico

Le pedí a ChatGPT que "enumerara algunas características que se esperan de un proyecto web de software", y me dio una larga lista de 20 elementos.

Las características específicas requeridas pueden variar según la naturaleza y el propósito del proyecto, pero aquí están mis 5 características personales principales que comúnmente se esperan de un proyecto web de software:

1. **Diseño receptivo**: no soy desarrollador de frontend ni diseñador. Entonces, para mí, con que se vea bien en la PC y no esté tan roto en el teléfono, es una victoria para mí.

2. **Autenticación y autorización del usuario**: registro de usuario, inicio de sesión y control de acceso seguro para restringir ciertas partes del sitio web según las funciones y los permisos del usuario.

3. **Integración de base de datos**: almacenamiento y recuperación de datos de una base de datos para administrar la información del usuario, el contenido, la configuración, etc.

4. **Perfiles de usuario**: permita a los usuarios crear y administrar sus perfiles, incluidas las imágenes de perfil, la información personal y la configuración de la cuenta.

5. **Carga y descarga de archivos**: permite a los usuarios cargar y descargar archivos, como documentos, imágenes o videos. Esto va a ser complicado, ya que es posible que deba configurar un depósito en la nube para esto.

## Escenario base: un pequeño clon SIGEM

Sí, lo sé, un clon, qué básico. Pero quiero ser básico y poco original y no pensar en algo que no sé con certeza si va funcionar al final.

Entonces, ¿qué es [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/)? Es el primer proyecto del que formé parte, del que soy parte desde hace casi 2 años. Soy el desarrollador más viejo que queda, y SIGEM tiene un lugar especial en mi corazón.

SIGEM en pocas palabras es una página donde los ciudadanos de la ciudad de San Luis tienen que iniciar sesión para hacer algunos trámites aburridos de vez en cuando. Hace muchas cosas, pero tiene dos caras.

- Cuando un ciudadano inicia sesión con éxito, le permitimos ver un menú de diferentes operaciones que puede realizar. Y dependiendo de la operación específica, el ciudadano debe llenar algún formulario y luego esperar una respuesta sobre el estado de la operación (generalmente una notificación por sms). Además, pueden consultar el estado de la operación en la página web.

- Cuando un funcionario / trabajador público inicia sesión con éxito, le permitimos ver un menú diferente, de acuerdo con sus permisos. Son responsables de verificar, aprobar y denegar los formularios llenados por los ciudadanos.

Estas son las cosas que se espera que haga nuestra página de clonación

### Cosas básicas de administración del perfil

- Como cualquiera, quiero poder ver una página de bienvenida al acceder a la url base.
- Como cualquiera, quiero poder solicitar una nueva cuenta, así me convierto en un ciudadano registrado.
- Como administrador de ciudadanos, quiero poder revisar, aprobar o denegar la solicitud de una cuenta, así me aseguro de que solo personas reales y válidas estén registradas como ciudadano.
- Como ciudadano registrado, quiero poder ver y actualizar mi perfil, para que mi información personal esté actualizada.

### Permisos comerciales

- Como ciudadano registrado, quiero solicitar un permiso comercial para mi negocio, para así cumplir con la normativa vigente.
- Como ciudadano registrado, quiero verificar el estado actual de mi solicitud de permiso comercial.
- Como administrador comercial nivel 1, quiero revisar, aprobar o denegar la solicitud de inicio de un permiso comercial, así el permiso pasa a la siguiente etapa de revisión.
- Como administrador comercial nivel 2, quiero poder dar la aprobación final de una solicitud de un permiso comercial, o negarlo, para que el permiso sea válido.

## Conclusión

Así que sí, este va a ser un viaje largo.