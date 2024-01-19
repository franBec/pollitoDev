---
author: "Franco Becvort"
title: "Contract-Driven Development 7: We get weather forecast!"
date: 2024-01-18
description: "First success scenario"
categories: ["Programming Stuff"]
thumbnail: /uploads/2024-01-18-contract-driven-dev7/DALL·E2024-01-19 00.47.06.png
---

_First success scenario._

## Check the github repo

Everything we'll do here, you can find in in the github repo.

[Spring City Explorer - Backend: Branch feature/cdd-7](https://github.com/franBec/springcityexplorer-backend/tree/feature/cdd-7)

## Quick reminder

Back in [Contract-Driven Development 3: Creation of contracts](/en/blog/2023-12-30-contract-driven-dev-3), we established a diagram defining the basic architecture of the system. In this blog, we finally achieve the selected white area.
![Diagram](/uploads/2024-01-18-contract-driven-dev7/Untitled-2024-01-19-0053.png)

## Generating the client

### 1. Add the generation in the plugin

For this, we add the following execution in the openapi generator maven plugin, in the pom.xml

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

### 2. Configure the generated api interface

Being WeatherApi the generated interface in com.weatherstack.api, the standard way to configure it would be as follows:

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

But when executing this that configuration, we see that some values are null on response:

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

If we compare that with the OAS in weatherstack.yaml, we see a pattern here: **all the null values corresponds with keys in the OAS that are snake_case.**

![weatherstack OAS](/uploads/2024-01-18-contract-driven-dev7/Screenshot2024-01-19153959.png)

For solving this, we have to create a custom response decoder.

### 3. Create a custom response decoder

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

A decoder consists in 3 parts:

1. Response reader.
2. Error checking.
   - If error exists, treat the error.
   - In this example, I throw a custom exception.
3. Response decoder.
   - Notice here that instead of returning a plain new GsonDecoder(), we instead return a GsonBuilder() with a policy for snake case.

Don't forget to set the custom decoder in the configuration.

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

This decoder is almost perfect. When executing we get the following values:

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

**\_localtime** still null. And a new question arises: why is **\_localtime** and not **localtime**? why the underscore?

### 4. Dealing with OpenAPI Generator reserved words

Here's the list of [reserved words in OpenAPI Generator](https://openapi-generator.tech/docs/generators/java/#reserved-words).

If any of these words are used in the components schema in your specification yaml file, then when autogenerating, the field will have a lowercase at the beginning. This is our case with the field **\_localtime**.

What are our options now?

1. Accept that \_localtime is gonna be null: Maybe even delete it from the yaml file
2. Creating a custom deserealizer: This implies manual work. State how each field in the response is gonna be desearilze and mapped into the Java object. We are going with this one for the moment.
3. OpenAPI has a [supported vendor extensions section](https://openapi-generator.tech/docs/generators/java/#supported-vendor-extensions). We can check that sometime in the future.

### 5. Create a custom deserealizer

Lots of manual work stating "this value goes here". I personally don't like it much cause is very easy to make a typo, mix properties, or forget some of them. Nevertheless, is a good exercise and example about how to do it.

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

Then, register it in the GsonBuilder, and we are good to go.

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

Now when executing, we have the proper response. First success! 🥳

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

## Misc changes

### application.yml reads secret from enviroment variables

This is pretty straight foward and common practice for simple demo repos like this one: Add the enviroment variable in the run/debug configurations, and state in the application.yml that the value is there.

![env var](/uploads/2024-01-18-contract-driven-dev7/Screenshot2024-01-19192944.png)

```yml
client:
  weather:
    baseUrl: http://api.weatherstack.com
    secrets:
      key: ${WEATHER_API_KEY}
```

### Created more tests

Some unit tests don't hurt anyone.

### Introduced faker to the tests

> I got lazy here, so read what ChatGPT produced when I asked about faker in Java. Notice that I don't use the default faker, instead I go for a fork that is also widely used in the bank.

[Faker](https://github.com/datafaker-net/datafaker) is a library commonly used in software testing, particularly for generating mock or dummy data. It's available for various programming languages, including Java, and is a valuable tool for creating realistic, yet non-real, data sets for testing purposes.

Here's why Faker is so useful:

- **Data Variety and Realism:** Faker can generate a wide range of data types, from names and addresses to emails, dates, and even lorem ipsum text. This variety allows for more thorough testing, especially in cases where the behavior of the system might depend on different formats or types of input data.

- **Automated Testing:** When writing automated tests, manually creating test data for each test case can be tedious and error-prone. Faker automates this process, ensuring a diverse range of test inputs and reducing the likelihood of hardcoded or biased data.

- **Non-Sensitive Data:** In many testing scenarios, particularly in industries dealing with sensitive user data (like finance or healthcare), it's essential not to use real user data. Faker generates realistic but fake data, which helps in maintaining privacy and compliance standards.

- **Localization Support:** Faker can generate data localized to specific regions or languages, which is crucial for testing applications designed for international use.

- **Flexibility and Customization:** You can customize the data generation according to your needs, which means you can tailor the data to fit the specific requirements of your application.

- **Time and Cost Efficiency:** By automating the generation of test data, Faker saves time and effort, which can significantly reduce the overall cost of the testing process.

It's important to note that while Faker is excellent for generating a wide range of test data, it should not be used for generating data for benchmarks or load testing where specific data patterns or sizes are required. Also, remember that the reliability of your tests is as good as the quality of your test data - so while Faker is a great tool, it's crucial to use it judiciously to ensure comprehensive testing.

## Next steps

- Try to replace the manual work done in WeatherDeserializer for something better.
- Do the same api generation for mediastack.
