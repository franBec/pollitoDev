---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 8: Mejora de la deserialización y el manejo de errores"
date: 2024-01-23
description: "Mejoras"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-01-23-contract-driven-dev8/DALL·E2024-01-2320.40.34.png
---

_Mejoras._

## Consulta el repositorio de github

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-8](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-8)

## Reemplazo del serializador por una extensión

En el último blog dije:

> OpenAPI tiene una [sección de extensiones de proveedores compatibles](https://openapi-generator.tech/docs/generators/java/#supported-vendor-extensions). Podemos chequearlo en algún momento en el futuro.

Bueno, ese día es hoy.

### 1. Eliminar WeatherDeserializer

Con esta nueva característica, ya no será necesario.

### 2. Reemplazar el uso de WeatherDeserializer en WeatherResponseDecoder

Ahora que no hay deserializador, en el decodificador no tenemos nada que registrar. En su lugar, tenemos que establecer una política de nombres de campos en minúsculas con guiones bajos.

```java
return new GsonBuilder()
    .setFieldNamingPolicy(LOWER_CASE_WITH_UNDERSCORES)
    .create()
    .fromJson(responseBody, type);
```

### 3. Agregar la extensión en el archivo yaml de la OEA

En el campo localtime, que fue el que nos dio problema la última vez porque es una palabra reservada, añadimos la extensión necesaria. Esto agregará la anotación en tiempo de compilación.

```xml
localtime:
    type: string
    description: Returns the local time of the location used for this request.
    example: 2019-09-07 08:14
    x-field-extra-annotation: "@com.google.gson.annotations.SerializedName(\"localtime\")"
```

Podemos comprobarlo en el archivo generado Location.java

```java
public static final String JSON_PROPERTY_LOCALTIME = "localtime";
@com.google.gson.annotations.SerializedName("localtime")
private String _localtime;
```

y ahora al ejecutar la aplicación, ¡todo funciona! Nice.

## Manejo de errores con Controller Advice

Ahora mismo, cuando ocurre un error, dejamos que Java decida qué devolver. Creo que no es una buena práctica y, en su lugar, deberíamos optar por un Controller Advice.

Si no conoce esta implementación del [paradigma AOP](https://www.baeldung.com/spring-aop), te sugiero leer el blog [ejemplo de @RestControllerAdvice en Spring Boot](https://www.bezkoder.com/spring-boot-restcontrolleradvice/) de bezkoder.

Estas son algunas de las razones a favor del uso de Controller Advice:

### Respuestas de error amigables

En una API bien diseñada, es fundamental considerar la experiencia del consumidor del endpoint. Cuando se produce un error, devolver todo el stack de error no sólo es abrumador sino que tampoco ayuda al consumidor que intenta comprender qué salió mal.

Controller Advice en Spring nos permite elaborar mensajes de error claros, concisos y fáciles de usar. Este enfoque respeta el principio de fallar rápido y claramente, guiando al consumidor hacia una posible rectificación del problema sin exponerlo a la complejidad innecesaria de un stack trace.

### Preocupaciones de seguridad al exponer el stack trace

El stack trace pueden revelar el funcionamiento interno de la aplicación, incluidas las estructuras de los paquetes, los nombres de las clases y, a veces, incluso las rutas de los archivos y los detalles de configuración.

Esta información puede ser una mina de oro para los usuarios malintencionados que buscan explotar vulnerabilidades. Con el Controller Advice, podemos controlar la salida, garantizando que la información confidencial permanezca dentro de los límites del servidor, adhiriéndose así a las mejores prácticas de seguridad.

### Clasificación y manejo precisos de errores

El manejo de errores predeterminado de Spring a veces puede clasificar erróneamente los errores del usuario (400 bad request) como errores del servidor (500 internal server error).

Esto no sólo es engañoso sino que también puede desencadenar procedimientos de diagnóstico incorrectos. Al implementar los consejos del controlador de errores, obtenemos un control más preciso sobre la clasificación de errores.

Esta categorización precisa de errores no solo es útil para los consumidores de API, sino también para mantener y monitorear el estado de la aplicación.

### Optimización en el manejo de errores con excepciones:

En las arquitecturas en capas tradicionales, la gestión de flujos de errores puede resultar engorrosa si pasa información de errores a través de varias capas (como del servicio al controlador) utilizando objetos personalizados o DTO.

Este enfoque a menudo conduce a un código inflado y complica la lógica, ya que cada capa necesita manejar y posiblemente transformar o aumentar la información de error.

Ahora, compare esto con la elegancia de usar excepciones combinadas con Controller Advice:

- **Simplicidad:** Cuando se produce un error en la lógica de negocio, generar una excepción personalizada es sencillo y claro. Esta excepción, que incluye detalles de error relevantes, aparece en el stack trace de forma natural. No hay necesidad de complejos bloques if-else ni de comprobar los objetos de retorno en cada capa para detectar posibles errores.

- **Manejo de errores centralizado:** Con el Controller Advice, se centraliza la lógica de manejo de errores. Esto significa que se escribe la lógica para transformar las excepciones en respuestas HTTP una vez y se aplica a todos los controladores. Es una ventanilla única para el manejo de errores, lo que hace que el código sea más limpio y fácil de mantener.

- **Separación de preocupaciones:** La lógica de negocio se centra exclusivamente en las reglas y operaciones de negocio, no en cómo se deben comunicar los errores al cliente. El Controller Advice asume la responsabilidad de traducir las excepciones de la lógica de negocio en mensajes de error fáciles de usar y estados de respuesta HTTP apropiados.

- **Facilidad de mantenimiento:** Cuando se necesitan cambios, como modificar formatos de respuesta de error o agregar nuevos tipos de excepciones, solo necesita actualizar los Controller Advice. La lógica de negocio permanece intacta, lo que supone una ventaja significativa en términos de mantenimiento y legibilidad.

- **Consistencia:** Independientemente de qué parte de la lógica de negocio genere una excepción, el Controller Advice garantiza una estructura y un nivel de información consistentes en la respuesta.

## Arquitectura de Rest Controller Advice

La siguiente arquitectura es fuertemente opninionada por mi parte. Consta de dos partes:

- **Controller Advice global para problemas comunes**

  - **Manejo uniforme de excepciones generales:** Un Controller Advice global puede manejar excepciones que son comunes en toda la aplicación.

  - **Coherencia en toda la aplicación:** Garantiza un enfoque coherente para manejar ciertos tipos de errores o procesamiento en todos los controladores, lo cual es importante para mantener una experiencia de usuario uniforme.

  - **Eficiencia:** Al manejar estas preocupaciones globalmente, evita la duplicación de código en múltiples controladores, lo que genera un código más limpio, más fácil de mantener y menos propenso a errores.

- **Controller Advice específicos para inquietudes específicas (1 Controller Advice por controlador)**

  - **Personalización específica del controlador:** Cada controlador puede tener requisitos únicos o manejar tipos específicos de solicitudes que requieren un manejo de excepciones especializado o un preprocesamiento de datos. Tener un Controller Advice dedicado a un controlador específico permite esta personalización detallada.

  - **Claridad y organización mejoradas:** Es más fácil rastrear y mantener el código cuando sabes que el manejo de excepciones u otras preocupaciones transversales para un controlador específico se manejan en su Controller Advice dedicado.

  - **Escalabilidad y flexibilidad:** a medida que su aplicación crece, puede introducir nuevos controladores con requisitos únicos. Al tener un patrón en el que cada controlador puede tener sus propios Controller Advice, el escalado y la modificación de partes de su aplicación se realiza sin afectar la estrategia global de manejo de errores.

## Manejo de excepciones extraño cuando se trata de la API Weatherstack

Me gusta que la API Weatherstack se haya convertido en un ejemplo de todo lo que puede salirse de lo común a la hora de desarrollar una solución.

¿Qué pasa ahora con el servicio Weatherstack? Bueno, mira esta solicitud/respuesta: al consultar por una ciudad que no existe uno esperaría un 400 o 404, pero mira esto:
![weatherstack wrong response](/uploads/2024-01-23-contract-driven-dev8/Screenshot2024-01-24004908.png)

200... eso está feo.

En sus [docs](https://weatherstack.com/documentation) mencionan códigos de error de API, pero nunca dicen que el estado de la respuesta será 200.

No podemos usar un decodificador de errores en WeatherApiConfig, porque Feign ve 200 y piensa que todo está bien. En lugar de eso, tenemos que lanzar una excepción personalizada en WeatherResponseDecoder.

Pero arrojar exceptiones aquí plantea otro problema: la excepción personalizada arrojada está encapsulada dentro de DecodeException, y nuestro WeatherControllerAdvice dice "oh, no conozco a este tipo, solo conozco WeatherException".

¿Cómo resolverlo? Agreguando en la funcion que maneja Exception.class una condición que verifique si tal vez la excepción sea una WeatherException envuelta en una DecodeException. Si se cumple esa condición, delegar el manejo del error al Rest Controller Advice correspondiente.

En palabras suena demasiado complicado, pero en código se ve así:

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Error> handle(Exception e) {
if (isWeatherException(e)) {
    return weatherControllerAdvice.handle((WeatherException) e.getCause());
}
return getGenericError(e);
}

private boolean isWeatherException(Exception e) {
return e instanceof DecodeException && e.getCause() instanceof WeatherException;
}
```

No olvidar que no todas las WeatherException son solicitudes incorrectas porque no existe una ciudad. Esas son solo aquellas con errores marcados con estado 615 (sí, muy específico de nuestro proveedor de API).

Finalmente, agregar una verificación para este código. Si no, devolver un error genérico.

```java
public static final int BAD_REQUEST_ERROR_CODE = 615;

@ExceptionHandler(WeatherException.class)
public ResponseEntity<Error> handle(WeatherException e) {
if (isBadRequest(e)) {
    return getWeatherBadRequestError(e);
}
return getGenericError(e);
}

private boolean isBadRequest(WeatherException e) {
return Objects.nonNull(e.getWeatherStackError().getError())
    && Objects.nonNull(e.getWeatherStackError().getError().getCode())
    && e.getWeatherStackError().getError().getCode() == BAD_REQUEST_ERROR_CODE;
}
```

## Próximos pasos

- Implementar aspecto de logging y UUID de sesión.
- Obtener noticias de mediastack.
