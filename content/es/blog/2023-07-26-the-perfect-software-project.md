---
author: "Franco Becvort"
title: "El proyecto de software perfecto"
date: 2023-07-26
description: "¿Es siquiera posible? Una charla corta sobre diferentes arquitecturas de desarrollo web"
categories: ["Programing talk"]
thumbnail: /uploads/2023-07-26-the-perfect-software-project/softwareDev.jpg
---

<!-- TOC -->
  * [Introducción](#introducción)
  * [Un monolito](#un-monolito)
  * [Frontend + Backend](#frontend--backend)
  * [Microservicios](#microservicios)
  * [No existe un enfoque perfecto para un proyecto de software, ¿verdad?](#no-existe-un-enfoque-perfecto-para-un-proyecto-de-software-verdad)
<!-- TOC -->

## Introducción

_¿Cómo se vería el proyecto de software perfecto?_

Creo que si me hubieran hecho esta pregunta cuando empecé mi camino como desarrollador web (septiembre 2021), hace un año (julio 2022) y ahora (julio 2023), hubieras recibido tres respuestas distintas. Eso significa que estoy aprendiendo y cambiando la perspectiva sobre cómo es “el proyecto de software perfecto”.

Estas tres respuestas son:

- Un monolito: una casa como una unidad única, que cumple con la tarea.
- Frontend y Backend: la separación simplemente tiene sentido.
- Microservicios: beneficios con desafíos.

Vamos a profundizar en cada opción.

## Un monolito

_Una casa como una unidad única, que cumple con la tarea_

![monolith](/uploads/2023-07-26-the-perfect-software-project/monolith.jpg)

Estoy 99.9% seguro de que esta es la primera arquitectura de software que aprendés, porque es la más intuitiva para arrancar. Además, la mayoría de los tutoriales y cursos optan por este enfoque.

Un monolito es como una caja todoterreno, y para mí la mejor forma de explicarlo es usando la famosa “analogía de la casa”.

Imaginá que estás construyendo una casa. En el desarrollo web monolítico tradicional, la casa entera se construye como una unidad única, con todas las habitaciones, funcionalidades e infraestructura conectadas en una sola estructura.

En esta analogía:

1. **Casa**: El monolito en sí es como la casa, que representa toda la aplicación web o sitio web.
2. **Habitaciones**: Dentro de la casa, tenés distintas habitaciones, como la sala, cocina, dormitorios y baño. Estas habitaciones representan las diversas características y componentes de la aplicación, como el login de usuario, listado de productos, carrito de compras y procesamiento de pagos.
3. **Infraestructura**: La plomería, electricidad y otros sistemas esenciales que sustentan la casa son como el código subyacente, la base de datos y los recursos que hacen funcionar la aplicación web.

Algunos puntos clave sobre la arquitectura monolítica:

1. **Todo en un solo lugar**: Igual que en una casa tenés todo bajo un mismo techo, una aplicación monolítica concentra su código, funciones y datos dentro de una sola base de código.
2. **Simplicidad**: Construir la casa entera como una sola unidad puede ser directo y fácil de entender, ya que todo está en un mismo lugar.
3. **Comunicación**: En un monolito, todas las “habitaciones” pueden comunicarse fácilmente entre sí, ya que forman parte de la misma estructura. De forma similar, en el desarrollo web, las distintas características de la aplicación pueden compartir datos y funcionalidades sin problemas.

Sin embargo, acá algunos inconvenientes:

1. **Escalabilidad**: Si querés agrandar la casa, tenés que expandir todo el conjunto, lo cual puede ser más complicado y costoso. De forma similar, en el desarrollo web, a medida que la aplicación crece, se vuelve más difícil escalarla y agregar nuevas funcionalidades puede complicarse.
2. **Mantenimiento**: Imaginá que hay un problema en la plomería de una habitación; eso puede afectar a toda la casa. De la misma forma, si surge un bug o problema en una parte del código monolítico, puede impactar a toda la aplicación.
3. **Velocidad de desarrollo**: En un monolito, cuando varios equipos laburan en diferentes partes de la aplicación, coordinar sus esfuerzos puede ser un desafío. Un cambio en una área puede requerir pruebas exhaustivas en toda la aplicación.

Pero, al final, cumple con lo que se necesita.

## Frontend + Backend

_La separación simplemente tiene sentido_

![frontendBackend](/uploads/2023-07-26-the-perfect-software-project/frontendBackend.jpg)

Para esta opción usémos la analogía de un restaurante.

Imaginá que tenés un restaurante. Al principio, tu restaurante era chico y todo sucedía en un mismo lugar: la cocina, el comedor y el área de pagos estaban juntos (como en un monolito).

Sin embargo, a medida que tu restaurante se volvió más popular, te encontraste con algunos desafíos:

1. **Escalabilidad**: Con el aumento de la demanda, se volvió más difícil acomodar a más clientes, preparar la comida rápido y gestionar el comedor al mismo tiempo. Necesitabas una forma de expandir sin saturar el lugar.
2. **Especialización**: Te diste cuenta de que el personal de tu restaurante tenía habilidades diversas. Algunos eran re buenos cocineros, mientras que otros destacaban en atender a los clientes. Pero hacer que todos hagan de todo generaba ineficiencias.

Para superar estos desafíos, decidiste dividir tu restaurante en dos áreas diferenciadas:

1. **Frontend**: Esta es el comedor – la parte del restaurante con la que los clientes interactúan directamente. Está diseñado para ser amigable y visualmente atractivo. Tenés los menús, el personal de atención y la ambientación, todo enfocado en brindar una experiencia agradable a los clientes.
2. **Backend**: Esta es la cocina – la parte del restaurante que queda oculta a la vista de los clientes. Es donde los chefs trabajan eficientemente para preparar la comida, se maneja el inventario y se procesan los pedidos.

Acá te dejo algunas razones por las que esta separación tiene sentido:

1. **Mejor escalabilidad**: Con el frontend y backend separados, podés expandir cada uno de forma independiente. Si querés acomodar a más clientes, te podés enfocar en ampliar el comedor (frontend) sin que ello impacte las operaciones de la cocina (backend).
2. **Especialización y eficiencia**: Ahora que el personal de la cocina se puede concentrar únicamente en cocinar y gestionar el inventario, se vuelven más eficientes en sus tareas. Los meseros, a su vez, pueden enfocarse en brindar un servicio excelente sin tener que preocuparse por la preparación de los platos.
3. **Flexibilidad**: Con un frontend y backend independientes, tenés la flexibilidad de actualizar o reemplazar uno sin necesariamente tocar el otro. Por ejemplo, podés renovar el menú y el espacio del comedor (frontend) sin cambiar la configuración completa de la cocina (backend).

En términos de desarrollo web:

- **Frontend**: Es la interfaz de usuario (UI) de un sitio o aplicación web con la que los usuarios interactúan directamente. Se encarga del diseño y de la experiencia de usuario en general.
- **Backend**: Es el lado del servidor de la aplicación, encargado de manejar tareas como almacenamiento de datos, procesamiento y lógica de negocio.

Al separar el frontend y el backend, los desarrolladores obtienen las mismas ventajas que menciona la analogía del restaurante:

- **Escalabilidad**: Cada parte se puede escalar de forma independiente, permitiendo manejar un mayor tráfico en el frontend o optimizar el backend para un mejor desempeño.
- **Especialización**: Desarrolladores con distintas habilidades pueden enfocarse en sus áreas específicas. Los de frontend se encargan de crear interfaces visualmente atractivas, mientras que los de backend se concentran en manejar datos y la lógica de la aplicación.
- **Flexibilidad**: Los cambios o actualizaciones en una parte de la aplicación se pueden hacer sin afectar a la otra. Por ejemplo, rediseñar el frontend sin alterar la funcionalidad del backend.

En general, la división entre frontend y backend permite un proceso de desarrollo web más eficiente y flexible, facilitando la gestión de proyectos complejos y ofreciendo una mejor experiencia de usuario.

## Microservicios

_Beneficios con desafíos_

![spongebob](/uploads/2023-07-26-the-perfect-software-project/spongebob.jpg)

Imaginate que tenés una ciudad con un gran edificio multipropósito (como un mega-centro comercial) que agrupa todos los negocios, servicios y facilidades. Esto es similar a la arquitectura monolítica, donde todo está fuertemente integrado en un solo sistema.

Ahora, exploremos los pros y los contras de transformar esa ciudad en una colección de edificios más pequeños e independientes, cada uno dedicado a una función específica:

**Pros:**

1. **Escalabilidad**: Con el mega-centro comercial, si un negocio se vuelve muy popular, podría generar congestión y afectar las operaciones de los otros. En una ciudad basada en microservicios, si un servicio en particular (por ejemplo, compras, entretenimiento o transporte) experimenta alta demanda, puede escalarse de forma independiente sin afectar a los demás. De esta forma, la ciudad puede crecer y adaptarse de manera eficiente a las necesidades cambiantes.
2. **Flexibilidad**: Cada edificio en la ciudad de microservicios se puede diseñar y actualizar de forma independiente. Si un servicio necesita una nueva funcionalidad o tecnología, su edificio puede renovarse sin afectar a los demás. Esto permite que la ciudad se mantenga al día con las últimas tendencias y avances.
3. **Aislamiento de fallos**: En un mega-centro comercial, si ocurre un incendio o una brecha de seguridad, podría impactar todo el edificio y a todos los negocios en él. En una ciudad basada en microservicios, si surge un problema en un edificio, se puede contener en esa área específica, reduciendo el riesgo de una interrupción generalizada.
4. **Especialización**: Cada edificio puede especializarse en lo que hace mejor. Por ejemplo, un edificio se podría dedicar exclusivamente a las compras, otro a la salud y otro al entretenimiento. Esta especialización permite que cada servicio sobresalga y ofrezca experiencias de alta calidad.
5. **Velocidad de desarrollo**: Equipos independientes pueden trabajar en distintos edificios de forma simultánea, acelerando el proceso de desarrollo. Los cambios y actualizaciones se pueden implementar más rápido, ya que se limitarían a un edificio específico sin coordinación global.

**Contras:**

1. **Complejidad**: Manejar una ciudad con muchos edificios independientes requiere coordinación y comunicación entre servicios. De manera similar, los microservicios añaden complejidad en términos de comunicación entre servicios, despliegue y monitoreo.
2. **Sobrecarga de infraestructura**: Cada edificio necesita su propia infraestructura y recursos, lo que puede traducirse en mayores costos de mantenimiento y operación en comparación con un único mega-centro comercial.
3. **Desafíos de integración**: Con tantos servicios independientes, asegurar una integración fluida entre ellos puede ser más complicado que en un monolito. Los desarrolladores deben implementar protocolos de comunicación robustos y lidiar con posibles problemas en las interacciones entre servicios.
4. **Complejidad en el despliegue**: Desplegar cambios a través de múltiples edificios (servicios) requiere un planeamiento y coordinación cuidadosos para evitar interrupciones en el servicio.
5. **Curva de aprendizaje**: La transición de un monolito a una arquitectura de microservicios puede ser un cambio significativo para el equipo de desarrollo, requiriendo que aprendan nuevos conceptos y mejores prácticas.

En resumen, una arquitectura de microservicios ofrece beneficios como escalabilidad, flexibilidad, aislamiento de fallos, especialización y un desarrollo más rápido. Sin embargo, también enfrenta desafíos relacionados con la complejidad, la sobrecarga de infraestructura, la integración, el despliegue y la curva de aprendizaje.

## No existe un enfoque perfecto para un proyecto de software, ¿verdad?

Exactamente. Es más bien una cuestión de "qué se espera que haga el producto". Acá te dejo algunas frases que te pueden ayudar a elegir un enfoque:

- Monolito

  - "Es solo una app de muestra para un proyecto de curso".
  - "Necesito algo rápido".
  - "No va a crecer en complejidad".

- Frontend + Backend

  - "Quiero una separación clara entre la interfaz de usuario y la lógica del servidor".
  - "La aplicación puede crecer con el tiempo, y quiero la flexibilidad de expandir o actualizar componentes específicos de forma independiente".
  - "Tengo un equipo con diferentes habilidades y quiero que se enfoquen en sus áreas de expertise".

- Microservicios
  - "Espero que la aplicación tenga un tráfico muy alto y necesite escalar componentes de forma independiente".
  - "Cada parte de la aplicación tiene requerimientos únicos, y quiero elegir la mejor tecnología para cada una".
  - "La tolerancia a fallos y el aislamiento son cruciales, y quiero minimizar el impacto de un fallo en una parte sobre el resto de la aplicación".