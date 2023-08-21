---
author: "Franco Becvort"
title: "[El proyecto de software perfecto #06] - Hora de Esquemas!"
date: 2023-08-16
description: "Esquemas sólidos para código correcto"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-16-the-perfect-software-project-006/Screenshot-2023-08-17-181619.png
---

## ¿Qué es un esquema? ¿Por qué tan importante?

Comencemos afirmando el hecho de que javascript es un lenguaje de programación de tipado dinámico, lo que significa que los tipos de variables se determinan en tiempo de ejecución y pueden cambiar durante la ejecución del programa.

Si bien esta flexibilidad puede ser ventajosa para proyectos más pequeños o creación rápida de prototipos, puede plantear desafíos importantes cuando se trata de desarrollar y mantener proyectos de software a gran escala.

Typescript se desarrolló como una solución a estos desafíos, ofreciendo una alternativa de tipado estático que proporciona una aplicación de tipo más fuerte, mejor documentación de código, refactorización más segura y soporte de herramientas mejorado.

Un esquema de typescript generalmente se refiere a una definición o estructura que describe los tipos, formas y restricciones de datos esperados.

Hay algunos contextos comunes en los que se utilizan esquemas de typescript:

- Validación de datos y seguridad de tipos: al definir un esquema, los desarrolladores pueden asegurarse de que los datos se ajusten a los tipos y formas esperados, evitando errores de tiempo de ejecución causados por una manipulación incorrecta de los datos. La verificación de tipos estáticos de typescript detecta estos errores en tiempo de compilación.

- Contratos API: al desarrollar API o interfaces entre diferentes partes de un sistema, especificar un esquema de typescript para los datos de entrada y salida ayuda a establecer una comunicación clara entre los componentes. Esto reduce las posibilidades de malentendidos y garantiza que los datos se procesen correctamente.

- Documentación y autodocumentación: un esquema de typescript bien definido actúa como autodocumentación del código. Los desarrolladores pueden comprender fácilmente la estructura de los datos y los tipos esperados consultando el esquema, lo que reduce la necesidad de comentarios o documentación adicionales.

- Capacidad de mantenimiento del código: a medida que los proyectos crecen en complejidad, el mantenimiento del código se vuelve un desafío. Un esquema de typescript ayuda a mantener el código base organizado, lo que facilita la actualización y la refactorización del código sin introducir problemas inesperados.

- Compatibilidad con IDE y autocompletado: muchos entornos de desarrollo integrados (IDE) y editores de código admiten typescript. Un esquema bien definido habilita funciones avanzadas como el autocompletado y la inferencia de tipos, que mejoran la productividad al guiar a los desarrolladores mientras escriben código.

## Zod: la biblioteca de esquemas de facto

Actualmente, en el rico ecosistema de javascript, hay muchas bibliotecas para hacer esquemas. Pero desde mi primera interacción con esquemas en 2022 hasta hoy, [Zod](https://zod.dev/) se considera la mejor opción. De vez en cuando aparece una nueva herramienta que dice ser más rápida en tiempo de ejecución, o mas liviana, pero recuerda lo que dijo Theo: _sangra responsablemente_

{{< youtube o4h8PUVy5J8 >}}
{{< youtube 9UVPk0Ulm6U >}}
{{< youtube RWWgUB9LmzQ >}}
{{< youtube 9N50YV5NHaE >}}

Las características claves de Zod incluyen:

- Enfoque Type-First: Zod aprovecha el sistema de tipos de typescript para definir esquemas. Esto significa que crea definiciones de esquema utilizando tipos de typescript, lo que conduce a una creación más natural e intuitiva.

- Validación de tiempo de ejecución: Zod proporciona validación de tiempo de ejecución para datos contra los esquemas definidos. Esto ayuda a detectar errores de manera temprana, incluso antes de que provoquen un comportamiento inesperado en el tiempo de ejecución.

- Serialización y análisis: Zod se puede usar no solo para validar datos, sino también para analizar y serializar datos. Esto lo hace útil para manejar datos provenientes de diferentes fuentes, como API o bases de datos.

- Componibilidad: los esquemas se pueden componer y combinar, lo que le permite crear reglas y estructuras de validación complejas a partir de reglas más simples.

- Informe de errores: Zod proporciona mensajes de error detallados cuando falla la validación, lo que ayuda a diagnosticar y solucionar problemas rápidamente.

- Inferencia de tipos: las definiciones de esquema de Zod permiten la inferencia de tipos, lo que facilita el trabajo con los datos validados en código typescript.

### El combo zod + react-form-hook + shadcn/ui

Ahora tenemos esta sinergia realmente interesante donde: shadcn/ui usa react-hook-form para sus formularios, y react-hook-forms usa zod para su propia validación.

Entonces, con una definición de esquema sólida, todo se construye solo, y así es como he estado creando formularios en este proyecto.

Por el momento, no tengo ningún formulario que funcione al 100% porque no hay backend. Quiero hacer una gran cantidad de UI vacía antes de conectar todo.

## Conclusion

Hay muchos commits aquí, pero principalmente porque no podía decidir dónde guardaría mis esquemas en la estructura de carpetas.

Entonces, por el momento, estos son los commits realizados. Puedes revisarlos en la rama de GitHub [2023-08-11](https://github.com/franBec/sigem-monolith/tree/2023-08-11).

![commits](/uploads/2023-08-16-the-perfect-software-project-006/Screenshot-2023-08-17-182244.png)
