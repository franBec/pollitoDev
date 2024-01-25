---
author: "Franco Becvort"
title: "Desarrollo basado en contratos 7: Tenemos el clima!"
date: 2024-01-18
description: "Primer caso de éxito"
categories: ["Contract-Driven Development"]
thumbnail: /uploads/2024-01-18-contract-driven-dev7/DALL·E2024-01-19 00.47.06.png
---

_Primer caso de éxito._

## Consulta el repositorio de github

Todo lo que haremos aquí, lo puedes encontrar en el repositorio de github.

[Spring City Explorer - Backend: Branch feature/cdd-7](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-7)

## Recordatorio rápido

En [Desarrollo basado en contratos 3: Creación de contratos](/es/blog/2023-12-30-contract-driven-dev-3), Establecimos un diagrama que define la arquitectura básica del sistema. En este blog, finalmente logramos el área blanca seleccionada.
![Diagram](/uploads/2024-01-18-contract-driven-dev7/Untitled-2024-01-19-0053.png)

## Generando el cliente

### 1. Agrega la generación en el complemento.

Para esto, agregamos la siguiente ejecución en el complemento maven del generador openapi, en el pom.xml

```xml
<execution>
    <id>generation for weatherstack</id>
    <goals>
        <goal>generate</goal>
    </goals>
    <configuration>
        <inputSpec>${project.basedir}/src/main/resources/openapi/feignclient/weatherstack.yaml</inputSpec>
        <generatorName>java</generatorName>
        <library>feign</library>
        <output>${project.build.directory}/generated-sources/openapi/</output>
        <apiPackage>com.weatherstack.api</apiPackage>
        <modelPackage>com.weatherstack.models</modelPackage>
        <configOptions>
            <feignClient>true</feignClient>
            <interfaceOnly>true</interfaceOnly>
            <useEnumCaseInsensitive>true</useEnumCaseInsensitive>
        </configOptions>
    </configuration>
</execution>
```

### 2. Configurar la interfaz API generada

Siendo WeatherApi la interfaz generada en com.weatherstack.api, la forma estándar de configurarlo sería la siguiente:

```java
@Configuration
@ComponentScans(
    value = {
      @ComponentScan(
          basePackages = {
            "com.weatherstack.api",
          })
    })
@RequiredArgsConstructor
public class WeatherApiConfig {

  private final WeatherProperties weatherProperties;

  @Bean
  public WeatherApi weatherApi() {
    return Feign.builder()
       .client(new OkHttpClient())
        .encoder(new GsonEncoder())
        .decoder(new GsonDecoder())
        .logger(new Slf4jLogger(WeatherApi.class))
        .logLevel(Logger.Level.FULL)
        .target(WeatherApi.class, weatherProperties.getBaseUrl());
  }
}
```

Pero al ejecutar esta configuración, vemos que algunos valores son nulos en la respuesta:

```
class Weather {
    request: class Request {
        type: City
        query: Lisbon, Portugal
        language: en
        unit: m
    }
    location: class Location {
        name: Lisbon
        country: Portugal
        region: Lisboa
        lat: 38.717
        lon: -9.133
        timezoneId: null
        _localtime: null
        localtimeEpoch: null
        utcOffset: null
    }
    current: class Current {
        observationTime: null
        temperature: 18
        weatherCode: null
        weatherIcons: null
        weatherDescriptions: null
        windSpeed: null
        windDegree: null
        windDir: null
        pressure: 1005
        precip: 0.2
        humidity: 77
        cloudcover: 75
        feelslike: 18
        uvIndex: null
        visibility: 10
    }
}
```

Si comparamos eso con la OAS en Weatherstack.yaml, vemos un patrón aquí: **todos los valores nulos corresponden con claves en OAS que son snake_case.**
![weatherstack OAS](/uploads/2024-01-18-contract-driven-dev7/Screenshot2024-01-19153959.png)

Para resolver esto, tenemos que crear un decodificador de respuesta personalizado.

### 3. Crear un decodificador de respuesta personalizado

```java
public class WeatherResponseDecoder implements Decoder {

  @Override
  public Object decode(Response response, Type type) throws IOException, FeignException {
    try (BufferedReader reader =
        new BufferedReader(
            new InputStreamReader(response.body().asInputStream(), StandardCharsets.UTF_8))) {

      String responseBody = reader.lines().collect(Collectors.joining());

      WeatherStackError error = new Gson().fromJson(responseBody, WeatherStackError.class);
      if (error != null && Boolean.FALSE.equals(error.getSuccess())) {
        throw new WeatherException(error);
      }

      return new GsonBuilder()
          .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
          .create()
          .fromJson(responseBody.toString(), type);
    }
  }
}
```

Un decodificador consta de 3 partes:

1. Lector de respuesta.
2. Comprobación de errores.
   - Si existe un error, trátelo.
   - En este ejemplo, lanzo una excepción personalizada.
3. Decodificador de respuesta.
   - Observe aquí que en lugar de devolver un GsonDecoder() nuevo y simple, devolvemos un GsonBuilder() con una política para casos de snake_case.

No olvide configurar el decodificador personalizado en la configuración.

```java
@Configuration
@ComponentScans(
    value = {
      @ComponentScan(
          basePackages = {
            "com.weatherstack.api",
          })
    })
@RequiredArgsConstructor
public class WeatherApiConfig {

  private final WeatherProperties weatherProperties;

  @Bean
  public WeatherApi weatherApi() {
    return Feign.builder()
        .client(new OkHttpClient())
        .encoder(new GsonEncoder())
        .decoder(new WeatherResponseDecoder()) // <-- HERE
        .logger(new Slf4jLogger(WeatherApi.class))
        .logLevel(Logger.Level.FULL)
        .target(WeatherApi.class, weatherProperties.getBaseUrl());
  }
}
```

Este decodificador es casi perfecto. Al ejecutar obtenemos los siguientes valores:

```
class Weather {
    request: class Request {
        type: City
        query: Lisbon, Portugal
        language: en
        unit: m
    }
    location: class Location {
        name: Lisbon
        country: Portugal
        region: Lisboa
        lat: 38.717
        lon: -9.133
        timezoneId: Europe/Lisbon
        _localtime: null
        localtimeEpoch: 1705679640
        utcOffset: 0.0
    }
    current: class Current {
        observationTime: 03:54 PM
        temperature: 18
        weatherCode: 116
        weatherIcons: [
            https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png
        ]
        weatherDescriptions: [
            Partly cloudy
        ]
        windSpeed: 22
        windDegree: 330
        windDir: NNW
        pressure: 1005
        precip: 0.2
        humidity: 77
        cloudcover: 75
        feelslike: 18
        uvIndex: 3
        visibility: 10
    }
}
```

**\_localtime** sigue siendo nulo. Y surge una nueva pregunta: ¿por qué es **\_localtime** y no **localtime**? ¿Por qué el guión bajo?

### 4. Manejo de palabras reservadas de OpenAPI Generator

Aquí está la lista de [palabras reservadas en OpenAPI Generator](https://openapi-generator.tech/docs/generators/java/#reserved-words).

Si alguna de estas palabras se utiliza en el esquema de componentes del archivo.yaml de especificación, al momento de generación, el campo tendrá minúsculas al principio. Este es nuestro caso con el campo **\_localtime**.

¿Cuáles son nuestras opciones ahora?

1. Aceptar que \_localtime será nulo: tal vez incluso eliminarlo del archivo yaml
2. Crear un deserealizador personalizado: Esto implica trabajo manual. Indicar cómo se de-serializará y asignará cada campo de la respuesta al objeto Java. Vamos con esta opción por el momento.
3. OpenAPI tiene una [sección de extensiones de proveedores compatibles](https://openapi-generator.tech/docs/generators/java/#supported-vendor-extensions). Podemos chequearlo en algún momento en el futuro.

### 5. Crear un deserealizador personalizado

Mucho trabajo manual indicando "este valor va aquí". A mí personalmente no me gusta mucho porque es muy fácil cometer un error tipográfico, mezclar propiedades, u olvidar algunas de ellas. Sin embargo, es un buen ejercicio y ejemplo de cómo hacerlo.

```java
public class WeatherDeserializer implements JsonDeserializer<Weather> {
  @Override
  public Weather deserialize(
      JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext)
      throws JsonParseException {
    JsonObject jsonObject = jsonElement.getAsJsonObject();
    JsonObject requestObj = jsonObject.getAsJsonObject("request");
    JsonObject locationObj = jsonObject.getAsJsonObject("location");
    JsonObject currentObj = jsonObject.getAsJsonObject("current");

    return new Weather()
        .request(
            new Request()
                .type(LocationTypeEnum.fromValue(requestObj.get("type").getAsString()))
                .query(requestObj.get("query").getAsString())
                .language(requestObj.get("language").getAsString())
                .unit(UnitEnum.fromValue(requestObj.get("unit").getAsString())))
        .location(
            new Location()
                .name(locationObj.get("name").getAsString())
                .country(locationObj.get("country").getAsString())
                .region(locationObj.get("region").getAsString())
                .lat(locationObj.get("lat").getAsString())
                .lon(locationObj.get("lon").getAsString())
                .timezoneId(locationObj.get("timezone_id").getAsString())
                ._localtime(locationObj.get("localtime").getAsString())
                .localtimeEpoch(locationObj.get("localtime_epoch").getAsInt())
                .utcOffset(locationObj.get("utc_offset").getAsString()))
        .current(
            new Current()
                .observationTime(currentObj.get("observation_time").getAsString())
                .temperature(currentObj.get("temperature").getAsInt())
                .weatherCode(currentObj.get("weather_code").getAsInt())
                .weatherIcons(
                    Arrays.asList(
                        jsonDeserializationContext.deserialize(
                            currentObj.get("weather_icons"), String[].class)))
                .weatherDescriptions(
                    Arrays.asList(
                        jsonDeserializationContext.deserialize(
                            currentObj.get("weather_descriptions"), String[].class)))
                .windSpeed(currentObj.get("wind_speed").getAsInt())
                .windDegree(currentObj.get("wind_degree").getAsInt())
                .windDir(currentObj.get("wind_dir").getAsString())
                .pressure(currentObj.get("pressure").getAsInt())
                .precip(currentObj.get("precip").getAsFloat())
                .humidity(currentObj.get("humidity").getAsInt())
                .cloudcover(currentObj.get("cloudcover").getAsInt())
                .feelslike(currentObj.get("feelslike").getAsInt())
                .uvIndex(currentObj.get("uv_index").getAsInt())
                .visibility(currentObj.get("visibility").getAsInt()));
  }
}
```

Luego, regístrelo en GsonBuilder y listo.

```java
public class WeatherResponseDecoder implements Decoder {

  @Override
  public Object decode(Response response, Type type) throws IOException, FeignException {
    try (BufferedReader reader =
        new BufferedReader(
            new InputStreamReader(response.body().asInputStream(), StandardCharsets.UTF_8))) {

      String responseBody = reader.lines().collect(Collectors.joining());

      WeatherStackError error = new Gson().fromJson(responseBody, WeatherStackError.class);
      if (error != null && Boolean.FALSE.equals(error.getSuccess())) {
        throw new WeatherException(error);
      }

      return new GsonBuilder()
          .registerTypeAdapter(Weather.class, new WeatherDeserializer())
          .create()
          .fromJson(responseBody, type);
    }
  }
}
```

Ahora al ejecutar, tenemos la respuesta adecuada. ¡Primer éxito! 🥳

```
class Weather {
    request: class Request {
        type: City
        query: Lisbon, Portugal
        language: en
        unit: m
    }
    location: class Location {
        name: Lisbon
        country: Portugal
        region: Lisboa
        lat: 38.717
        lon: -9.133
        timezoneId: Europe/Lisbon
        _localtime: 2024-11-28 13:01
        localtimeEpoch: 1705679640
        utcOffset: 0.0
    }
    current: class Current {
        observationTime: 03:54 PM
        temperature: 18
        weatherCode: 116
        weatherIcons: [
            https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png
        ]
        weatherDescriptions: [
            Partly cloudy
        ]
        windSpeed: 22
        windDegree: 330
        windDir: NNW
        pressure: 1005
        precip: 0.2
        humidity: 77
        cloudcover: 75
        feelslike: 18
        uvIndex: 3
        visibility: 10
    }
}
```

## Cambios varios

### application.yml lee secretos de las variables de entorno

Esta es una práctica bastante sencilla y común para repositorios de demostración simples como este: agregue la variable de entorno en las configuraciones de ejecución/depuración e indique en application.yml que el valor está allí.

![env var](/uploads/2024-01-18-contract-driven-dev7/Screenshot2024-01-19192944.png)

```yml
client:
  weather:
    baseUrl: http://api.weatherstack.com
    secrets:
      key: ${WEATHER_API_KEY}
```

### Crear más pruebas

Algunas pruebas unitarias no hacen daño a nadie.

### Introducción a faker a las pruebas.

> Me volví flojo aquí, así que esto es lo que produjo ChatGPT cuando pregunté sobre faker en Java. Tenga en cuenta que no uso el falsificador predeterminado, sino que elijo una bifurcación que también se usa ampliamente en el banco.

[Faker](https://github.com/datafaker-net/datafaker) es una biblioteca comúnmente utilizada en pruebas de software, particularmente para generar datos simulados o ficticios. Está disponible para varios lenguajes de programación, incluido Java, y es una herramienta valiosa para crear conjuntos de datos realistas, pero no reales, con fines de prueba.

He aquí por qué Faker es tan útil:

- **Variedad de datos y realismo:** Faker puede generar una amplia gama de tipos de datos, desde nombres y direcciones hasta correos electrónicos, fechas e incluso texto lorem ipsum. Esta variedad permite realizar pruebas más exhaustivas, especialmente en los casos en los que el comportamiento del sistema puede depender de diferentes formatos o tipos de datos de entrada.

- **Pruebas automatizadas:** Al escribir pruebas automatizadas, crear manualmente datos de prueba para cada caso de prueba puede resultar tedioso y propenso a errores. Faker automatiza este proceso, garantizando una amplia gama de entradas de prueba y reduciendo la probabilidad de datos codificados o sesgados.

- **Datos no confidenciales:** En muchos escenarios de prueba, particularmente en industrias que manejan datos confidenciales de los usuarios (como finanzas o atención médica), es esencial no utilizar datos reales de los usuarios. Faker genera datos realistas pero falsos, lo que ayuda a mantener los estándares de privacidad y cumplimiento.

- **Soporte de localización:** Faker puede generar datos localizados en regiones o idiomas específicos, lo cual es crucial para probar aplicaciones diseñadas para uso internacional.

- **Flexibilidad y personalización:** Puede personalizar la generación de datos según sus necesidades, lo que significa que puede adaptar los datos para que se ajusten a los requisitos específicos de su aplicación.

- **Eficiencia de tiempo y costos:** Al automatizar la generación de datos de prueba, Faker ahorra tiempo y esfuerzo, lo que puede reducir significativamente el costo general del proceso de prueba.

Es importante tener en cuenta que, si bien Faker es excelente para generar una amplia gama de datos de prueba, no debe usarse para generar datos para puntos de referencia o pruebas de carga donde se requieren patrones o tamaños de datos específicos. Además, recuerde que la confiabilidad de sus pruebas es tan buena como la calidad de los datos de sus pruebas; por lo tanto, si bien Faker es una gran herramienta, es fundamental utilizarla con prudencia para garantizar pruebas exhaustivas.

## Próximos pasos

- Intentar reemplazar el trabajo manual realizado en WeatherDeserializer por algo mejor.
- Haz la misma generación de API para mediastack.
