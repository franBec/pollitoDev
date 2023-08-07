---
author: "Franco Becvort"
title: "El proyecto de software perfecto"
date: 2023-07-26
description: "¿Es posible? Una breve charla acerca de las diferentes arquitecturas de desarrollo web"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-07-26-the-perfect-software-project/softwareDev.jpg
---
_¿Es posible? Una breve charla acerca de las diferentes arquitecturas de desarrollo web_

## Introducción

En mi reciente post [Que me destaca del resto de mis colegas](/es/blog/2023-07-19-what-separates-me-from-the-rest-of-my-colleagues), dije esto

> También el hecho de que mi reloj biológico vaya un poco más rápido que el resto, ayuda a aumentar esa ambición y soñar despierto con el proyecto de software perfecto.

Y más tarde esa noche me fui a la cama pensando _"¿Cómo sería el proyecto de software perfecto?"_

Creo que si me hicieran esta pregunta cuando comencé mi camino como desarrollador web (septiembre de 2021), hace un año (julio de 2022) y ahora (julio de 2023), obtendrías tres respuestas diferentes. Eso significa que estoy aprendiendo y cambiando la perspectiva de cómo se ve "el proyecto de software perfecto".

Estas tres respuestas son:

- Un monolito: una casa como una gran unidad, cumple con el trabajo.
- Frontend + Backend: la separación de responsabilidades tiene sentido.
- Microservicios: beneficios con desafíos.

Profundicemos en cada opción.

## Un monolito
_Una casa como una gran unidad, cumple con el trabajo_

![monolith](/uploads/2023-07-26-the-perfect-software-project/monolith.jpg)

99.9% seguro que esta es la primera arquitectura de software que todos aprendemos, porque es la más intuitiva para empezar. Además, la mayoría de los tutoriales y cursos utilizan este enfoque.

Un monolito es una caja todo en uno, y para mí la mejor manera de explicarlo es usando la famosa "analogía de la casa".

Imagina que estás construyendo una casa. En el desarrollo web monolítico tradicional, toda la casa se construye como una gran unidad, con todas las habitaciones, funcionalidades e infraestructura conectadas en una sola estructura.

En esta analogía:

1. **Casa**: el monolito en sí mismo es como la casa, que representa toda la aplicación web o el sitio web.

2. **Habitaciones**: dentro de la casa, tienes diferentes habitaciones, como la sala de estar, la cocina, los dormitorios y el baño. Estas salas representan las diversas funciones y componentes de la aplicación web, como el inicio de sesión del usuario, la lista de productos, el carrito de compras y el procesamiento de pagos.

3. **Infraestructura**: la plomería, la electricidad y otros sistemas esenciales que respaldan toda la casa son como el código subyacente, la base de datos y los recursos que hacen que la aplicación web funcione.

Algunos puntos clave sobre la arquitectura del monolito:

1. **Todo en un solo lugar**: al igual que una casa tiene todo bajo un mismo techo, una aplicación web monolítica tiene todo su código, funciones y datos dentro de una sola base de código.

2. **Simplicidad**: construir toda la casa como una sola unidad puede ser sencillo y fácil de entender ya que todo está en un solo lugar.

3. **Comunicación**: en un monolito, todas las habitaciones se pueden comunicar fácilmente entre sí ya que forman parte de la misma estructura. Del mismo modo, en el desarrollo web, diferentes características de la aplicación pueden compartir fácilmente datos y funcionalidades.

Sin embargo, aquí hay algunas desventajas:

1. **Escalabilidad**: si se desea agrandar la casa, debe expandirla por completo, lo que puede ser más desafiante y costoso. De manera similar, en el desarrollo web, a medida que la aplicación crece, se vuelve más difícil de escalar y agregar nuevas funciones puede volverse más complicado.

2. **Mantenimiento**: si hay un problema con la plomería en una habitación; podría afectar a toda la casa. De manera similar, si hay un error o problema en una parte del código del monolito, podría afectar a toda la aplicación.

3. **Velocidad de desarrollo**: en un monolito, cuando varios equipos trabajan en diferentes partes de la aplicación, coordinar sus esfuerzos puede ser un desafío. Los cambios en un área pueden requerir pruebas y validación exhaustivas en toda la aplicación.

Pero al final, cumple con el trabajo.

## Frontend + Backend
_La separación de responsabilidades tiene sentido_

![frontendBackend](/uploads/2023-07-26-the-perfect-software-project/frontendBackend.jpg)

Vamos con la analogía del restaurante para este.

Imagina que tienes un restaurante. Al principio, el restaurante era pequeño y todo sucedía en un solo lugar: la cocina, el comedor y el mostrador de pago estaban todos juntos (un monolito).

Sin embargo, a medida que su restaurante se hizo más popular, aprecieron algunos desafíos:

1. **Escalabilidad**: con el aumento de la demanda, se volvió más difícil acomodar a más clientes, preparar la comida rápidamente y administrar el comedor simultáneamente. Necesitabas una forma de expandirte sin abarrotar el lugar.

2. **Especialización**: notas que el personal de su restaurante tenía diversas habilidades. Algunos son excelentes cocineros, mientras que otros son amables para atender a los clientes. Pero tener a todos haciendo todo causó ineficiencias.

Para superar estos desafíos, decidió dividir su restaurante en dos áreas distintas:

1. **Frontend**: este es el comedor, la parte del restaurante con la que los clientes interactúan directamente. Está diseñado para ser fácil de usar y visualmente atractivo. Hay menús, meseros y ambiente, todos enfocados en crear una experiencia placentera para los clientes.

2. **Backend**: esta es la cocina, la parte del restaurante oculta a la vista de los clientes. Es donde los chefs trabajan de manera eficiente para preparar la comida, se administra el inventario y se procesan los pedidos.

He aquí por qué esta separación tiene sentido:

1. **Escalabilidad mejorada**: con el frontend y el backend separados, ahora puede expandir cualquiera de ellos de forma independiente. Si desea acomodar a más clientes, puede concentrarse en expandir el área de comedor (frontend) sin afectar las operaciones de la cocina (backend).

2. **Especialización y Eficiencia**: ahora que el personal de cocina puede enfocarse únicamente en cocinar y administrar el inventario, se vuelven más eficientes en sus tareas. Los camareros pueden concentrarse en brindar un excelente servicio a los clientes sin tener que preocuparse por la preparación de la comida.

3. **Flexibilidad**: con un frontend y un backend independientes, existe la flexibilidad de actualizar o reemplazar uno sin tocar necesariamente el otro. Por ejemplo, puede renovar el menú y el comedor (frontend) sin cambiar toda la configuración de la cocina (backend).

En términos de desarrollo web:

- **Frontend**: esta es la interfaz de usuario (UI) de un sitio web o aplicación web con la que los usuarios interactúan directamente. Es responsable del diseño y la experiencia general del usuario.

- **Backend**: este es el lado del servidor de la aplicación, que maneja tareas como el almacenamiento de datos, el procesamiento y la lógica comercial.

Al separar el frontend y el backend, los desarrolladores web obtienen las mismas ventajas que nuestra analogía del restaurante:

- **Escalabilidad**: cada parte se puede escalar de forma independiente, lo que permite a los desarrolladores manejar un mayor tráfico en el frontend u optimizar el backend para un mejor rendimiento.

- **Especialización**: los desarrolladores con diferentes conjuntos de habilidades pueden concentrarse en sus respectivas áreas. Los desarrolladores de front-end se especializan en crear interfaces de usuario atractivas, mientras que los desarrolladores de back-end se enfocan en administrar datos y manejar la lógica de la aplicación.

- **Flexibilidad**: se pueden realizar cambios o actualizaciones en una parte de la aplicación sin afectar a la otra. Por ejemplo, rediseñar el frontend sin alterar la funcionalidad del backend.

En general, la división entre frontend y backend permite un proceso de desarrollo web más eficiente y flexible, lo que facilita la gestión de proyectos complejos y ofrece una mejor experiencia de usuario a los visitantes.

## Microservicios

_Beneficios con desafios_
![spongebob](/uploads/2023-07-26-the-perfect-software-project/spongebob.jpg)

Imagina que tiene una ciudad con un edificio grande, único y de usos múltiples (como un mega centro comercial) que alberga todos los diferentes negocios, servicios e instalaciones. Esto es similar a una arquitectura monolítica, donde todo está estrechamente integrado en un gran sistema.

Ahora, exploremos los pros y los contras de transformar esta ciudad en una colección de edificios independientes más pequeños, cada uno dedicado a una función específica:

**Pros:**

1. **Escalabilidad**: con el mega centro comercial, si un negocio se vuelve extremadamente popular, podría crear congestión y afectar las operaciones de otros negocios. En una ciudad de microservicios, si un servicio en particular (por ejemplo, compras, entretenimiento, transporte) experimenta una gran demanda, puede escalar de forma independiente sin afectar a los demás. De esta manera, la ciudad puede gestionar eficientemente el crecimiento y adaptarse a las necesidades cambiantes.

2. **Flexibilidad**: cada edificio en la ciudad de microservicios se puede diseñar y actualizar de forma independiente. Si un servicio necesita una nueva característica o tecnología, su edificio puede actualizarse sin afectar a los demás. Esto permite que la ciudad se mantenga actualizada con las últimas tendencias y avances.

3. **Aislamiento de fallas**: en un mega centro comercial, si hay un incendio o una brecha de seguridad, podría afectar todo el edificio y todos los negocios dentro de él. En una ciudad de microservicios, si surge un problema en un edificio, puede limitarse a esa área específica, lo que reduce el riesgo de una interrupción generalizada.

4. **Especialización**: diferentes empresas y servicios pueden especializarse en lo que mejor saben hacer. Por ejemplo, un edificio podría centrarse en compras, otro en atención médica y otro en entretenimiento. Esta especialización permite que cada servicio sobresalga y brinde experiencias de alta calidad.

5. **Velocidad de desarrollo**: los equipos independientes pueden trabajar en diferentes edificios simultáneamente, acelerando el proceso de desarrollo. Los cambios y las actualizaciones se pueden implementar más rápido, ya que se limitan a edificios específicos y no requieren coordinación en toda la ciudad.

**Contras:**

1. **Complejidad**: gestionar una ciudad con numerosos edificios independientes requiere coordinación y comunicación entre servicios. De manera similar, los microservicios agregan complejidad en términos de comunicación, implementación y monitoreo entre servicios.

2. **Gastos generales de infraestructura**: cada edificio necesita su propia infraestructura y recursos, lo que puede resultar en costos operativos y de mantenimiento más altos en comparación con un solo mega centro comercial.

3. **Desafíos de integración**: con numerosos servicios independientes, garantizar una integración perfecta entre ellos puede ser más desafiante que un monolito. Los desarrolladores deben implementar protocolos de comunicación sólidos y manejar los posibles problemas que surjan de las interacciones del servicio.

4. **Complejidad de implementación**: la implementación de cambios en múltiples edificios (servicios) requiere una planificación y coordinación cuidadosas para evitar interrupciones en el servicio.

5. **Curva de aprendizaje**: la transición de una arquitectura monolítica a una de microservicios puede ser un cambio significativo para el equipo de desarrollo, que requiere que aprendan nuevos conceptos y mejores prácticas.

En resumen, una arquitectura de microservicios ofrece beneficios como escalabilidad, flexibilidad, aislamiento de fallas, especialización y un desarrollo más rápido. Sin embargo, presenta desafíos relacionados con la complejidad, los gastos generales de la infraestructura, la integración, la implementación y la curva de aprendizaje.

## Entonces, no existe un enfoque de proyecto de software perfecto, ¿no es así?

Exactamente. Es más una situación de "lo que se espera que haga el producto". Así que aquí hay algunas frases que pueden ayudarte cuando tengas que elegir un enfoque.

- Monolito
     - "Es solo una aplicación de prueba para un proyecto de curso".
     - "Solo necesito algo rápido".
     - "No va a aumentar en complejidad".

- Frontend + Backend
     - "Quiero una separación clara entre la interfaz de usuario y la lógica del lado del servidor".
     - "La aplicación puede crecer con el tiempo, y quiero la flexibilidad para expandir o actualizar componentes específicos de forma independiente".
     - "Tengo un equipo con diferentes habilidades y quiero que se centren en sus respectivas áreas de especialización".

- Microservicios
     - "Espero que la aplicación tenga mucho tráfico y necesite escalar los componentes de forma independiente".
     - "Cada parte de la aplicación tiene requisitos únicos y quiero elegir la mejor tecnología para cada uno".
     - "La tolerancia a fallas y el aislamiento son cruciales, y quiero minimizar el impacto de las fallas en un área en el resto de la aplicación".

## Conclusión: un poco de charla personal

![pitvillePark](/uploads/2023-07-26-the-perfect-software-project/pitvillePark.jpg)

Esta última parte del artículo trata sobre cómo esta puede ser mi motivación para comenzar a escribir sobre desarrollo web con un enfoque más educativo, así que siéntete libre de seguir con tu día y gracias por leer.

Entonces, hace unos viernes atrás en terapia, surgió el tema de la "motivación" (especialmente porque duermo desde las 2 am hasta pasado el mediodia, y parece que eso no es tan saludable. Quién lo hubiera dicho).

Me gustaría probar dos cosas: hacer música y escribir algunos artículos de programación, orientados a tutorial/cómo hacer cosas.

Mi tiempo como investigador académico y tutor en 2020 - 2022 me hace confiar en que puedo crear algunas cosas de buena calidad. Solía escribir resúmenes de cursos largos y bien explicados cuando era un estudiante universitario pobre y hambriento, y estoy muy orgulloso de la mayoría de ellos. Sin embargo, tanto conocimiento muerto, no puedo evitar sentir tristeza por el tiempo perdido allí.

Entonces, esta puede ser la parte 0 de la serie "el proyecto de software perfecto". Necesito pensar en algunos buenos casos de uso, para poder crear algunas historias de usuario y abordarlas con las tres arquitecturas discutidas aquí.

Necesito hablarlo con la almohada un poco más...