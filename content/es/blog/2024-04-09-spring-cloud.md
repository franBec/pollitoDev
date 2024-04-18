---
author: "Franco Becvort"
title: "Spring Cloud: api-gateway y naming-server"
date: 2024-04-09
description: "Spring Cloud Starter Gateway + Netflix Eureka combo"
categories: ["Spring Cloud"]
thumbnail: /uploads/2024-04-09-spring-cloud/DALL·E2024-04-0911.15.07.jpg
---

## Inspiración

Al final de mi previo blog [Anime Poster Generator 4: Cómo un backend intenta hacer frontend](/es/blog/2024-03-24-anime-poster-generator-4), dije:

> Las personas muy importantes que deciden mi salario no se sentarán conmigo para una revisión anual hasta que complete algunos cursos en una plataforma educativa de su elección, a la que debo pagar de mi dinero o utilizar el bono educativo que me dan (que al final del día, es mi dinero) [...] No puedo evitar pensar que es estúpido que quieras que te demuestre que conozco Java después de **un año codificando en Java**. Pero bueno, lo que sea, seguiré sus reglas (aunque qué pérdida de tiempo).

La plataforma educativa en cuestión es [pluralsight](https://www.pluralsight.com/). Simplemente hice speedrun del conocimiento requerido que tenía que demostrar, saltándome los cursos por completo y pasando directamente a las evaluaciones de habilidades.

Cuando llegó el momento de mostrar mis conocimientos de Spring Cloud, recordé que tenía algunas notas sobre el curso de Udemy [Master Microservices with Spring Boot y Spring Cloud](https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/). Es un curso muy completo que terminé allá por abril de 2023.

Curiosamente, el cuestionario de evaluación de habilidades se centró más en [sleuth](https://spring.io/projects/spring-cloud-sleuth) y [ribbon](https://cloud.spring.io/spring-cloud-netflix/multi/multi_spring-cloud-ribbon.html), en ambos no tengo experiencia ni los uso en mi trabajo. De todos modos, salí con una buena calificación. Este es un ejemplo perfecto del hecho casi inútil que es evaluar a los desarrolladores.

Aqui el resultado: [mi perfil en pluralsight](https://app.pluralsight.com/profile/francoexequiel-becvo) + mi score de DEVSU (99%, nice).

![skills](/uploads/2024-04-09-spring-cloud/devsuProfile.png)

Después de leer mis notas sobre Spring Cloud, decidí volver a visitar el curso para mejorarlas y tal vez escribir un blog. Qué agradable sorpresa fue ver que el chico que hizo el curso todavía lo está actualizando a la última versión de Spring Boot. Otra razón más para que vayas a gastar el dinero en el curso. El hombre es un educador natural.

Pero bueno, ahorita les presento ~~lamento boliviano~~ mis notas sobre Spring Cloud.

DESCARGO DE RESPONSABILIDAD: esto no es un copiar y pegar del curso de Udemy [Master Microservices with Spring Boot and Spring Cloud](https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/). Recomiendo ampliamente comprar ese curso. Todo el código que se muestra a continuación fue escrito por mí. Disfrute.

## Check el código!

Puede chequear el código en los siguientes repositorios (en todos ellos, siga la de feature/docker-compose. Puede encontrar otras ramas, soy yo experimentando otras soluciones).

- [microservice-a](https://github.com/franBec/spring-cloud-v2-microservice-a/tree/feature/docker-compose)
- [microservice-b](https://github.com/franBec/spring-cloud-v2-microservice-b/tree/feature/docker-compose)
- [api-gateway](https://github.com/franBec/spring-cloud-v2-api-gateway/tree/feature/docker-compose)
- [naming-server](https://github.com/franBec/spring-cloud-v2-naming-server/tree/feature/docker-compose)
- [docker-compose](https://github.com/franBec/spring-cloud-v2-docker-compose)

## ¿Qué es un api-gateway?

Analicemos este diagrama:

![diagram](/uploads/2024-04-09-spring-cloud/Untitled-2024-02-21-1828.png)

Tenemos:

- **Un end user:** alguien que necesita algo de microservice-a.
- **microservice-a:** retorna "Hello world from microservice A" + lo que sea que microservice-b diga. Depende de microservice-b.
- **microservice-b:** retorna "Hello world from microservice B".

Todo bien hasta acá. Entonces... **Qué es "api-gateway"?**

Un API Gateway es la puerta de entrada a la aplicación, lo que garantiza que cada solicitud se dirija al destino correcto. Esta puerta de enlace cumple varias funciones críticas y se puede aprovechar en varios casos de uso:

- **Enrutamiento:** El API Gateway dirige las solicitudes API entrantes al microservicio apropiado, lo que permite que una aplicación del lado del cliente realice solicitudes utilizando un único endpoint en lugar de tener que administrar las URL para cada servicio.
- **Equilibrio de carga:** Distribuye las solicitudes entrantes de manera uniforme entre instancias de un microservicio, mejorando la escalabilidad y confiabilidad del sistema.
- **Autenticación y autorización:** El API Gateway puede autenticar las solicitudes entrantes, asegurándose de que provengan de una fuente válida y, opcionalmente, aplicar controles de acceso, decidiendo a qué servicios puede acceder o no una solicitud válida.
- **Limitación de velocidad:** Para evitar que un solo servicio se vea abrumado, el API Gateway puede limitar la cantidad de solicitudes a un servicio durante un período.
- **Preocupaciones transversales:** Puede manejar otras preocupaciones, como el registro, el monitoreo y la seguridad en todos los servicios sin requerir duplicación de esfuerzos en cada microservicio.
- **Agregación:** El API Gateway puede agregar resultados de múltiples microservicios y devolver una respuesta consolidada al cliente, lo que reduce la cantidad de viajes de ida y vuelta entre el cliente y el servidor.

Casos de uso:

- **Aplicaciones de e-commerce:** En un sistema de e-commerce, el API Gateway puede enrutar las solicitudes de búsqueda de productos al servicio del producto, la gestión del carrito al servicio del carrito y el procesamiento de pedidos al servicio de pedidos, proporcionando una experiencia de compra perfecta.
- **Aplicaciones de IoT:** Para las plataformas de Internet de las cosas (IoT), el API Gateway puede administrar solicitudes de millones de dispositivos, enrutarlas a los servicios apropiados para el procesamiento de datos, la administración de dispositivos y el análisis.
- **Aplicaciones móviles:** Los backends móviles pueden aprovechar API Gateways para simplificar la comunicación del lado del cliente, manejar diferentes versiones de backend y agregar datos de múltiples fuentes.

Al actuar como punto central para gestionar y dirigir el tráfico, un microservicio de API Gateway mejora la mantenibilidad, la escalabilidad y la seguridad de las aplicaciones basadas en la nube.

## Ejemplo

Analicemos el diagrama, nuevamente, centrándonos más en el paso a paso:

![diagram](/uploads/2024-04-09-spring-cloud/Untitled-2024-02-21-1828.png)

1. Alguien llama api-gateway/microservice-a. api-gateway recibe esta solicitud y hace todo lo que está codificado para hacer con dicha solicitud (tal vez podría agregar un encabezado, verificar la autenticación, codificar/decodificar información o simplemente ser transparente y no hacer nada).
2. api-gateway sabe dónde está el microservice-a y pasa la solicitud.
3. microservice-a recibe la solicitud. Necesita algo del microservice-b, por lo que realiza una nueva solicitud que pasa por api-gateway.
4. Nuevamente, api-gateway hace todo lo que está codificado para hacer con esta nueva solicitud al microservice-b. Sabe dónde está el microservice-b y pasa la solicitud.
5. microservice-b recibe una solicitud, la procesa y la devuelve.
6. retorno de api-gateway.
7. microservice-a hace lo que hay que hacer con la respuesta del microservicio-b y retorna.
8. Respuesta final.

¿Podría haber ahorrado algunas peticiones de request/response pasando directamente del microservice-a al microservice-b? Sí totalmente. Sólo como ejemplo, decidí hacerlo de esta manera. Tal vez su realidad necesite evitar esas solicitudes adicionales, o tal vez necesite pasar siempre por el API Gateway. Cada realidad es diferente.

## Revisión al código de api-gateway

Cuando miras el código de api-gateway te das cuenta de que, está bastante vacío.

![api-gateway code](/uploads/2024-04-09-spring-cloud/Screenshot2024-04-09120810.png)

- LoggingFilter es un filtro que imprime cualquier cosa que ingresa. En este ejemplo, no modifico nada de la solicitud entrante ni hago ninguna verificación basada en de dónde viene o hacia dónde va. Aquí es donde puedes ser creativo.
- El archivo principal de la aplicación es solo un main de Spring Boot vacío y predeterminado.

¿Cómo sabe el API-gateway dónde enviar las solicitudes? La respuesta está en pom.xml.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

La dependencia **spring-cloud-starter-gateway** le da al microservicio todas las características de API Gateway comentadas.

Aquí la estrella del espectáculo es **spring-cloud-starter-netflix-eureka-client**. Registra el API Gateway como cliente con Eureka Server (un registro de servicios). Esto permite que el API Gateway descubra y realice un seguimiento de las instancias de microservicios disponibles en el ecosistema.

Cuando llega una solicitud a API Gateway, se producen los siguientes pasos:

1. El API Gateway identifica la ruta y el microservicio al que se debe reenviar la solicitud según las reglas de enrutamiento configuradas.
2. El API Gateway consulta el servidor Eureka para obtener las instancias actuales del microservicio de destino, incluidas sus ubicaciones de red.
3. El Servidor Eureka responde con la información sobre las instancias disponibles. Podría devolver varias instancias si el microservicio de destino se escala horizontalmente para lograr alta disponibilidad.
4. El API Gateway aplica cualquier estrategia de equilibrio de carga configurada para seleccionar una instancia si hay varias disponibles.
5. La solicitud se envía a la instancia de microservicio elegida para su procesamiento.

Esta combinación de Spring Cloud Gateway y Eureka Client permite el enrutamiento dinámico basado en el descubrimiento de servicios, lo que hace que el sistema sea más resistente y escalable.

No es necesario configurar API Gateway de forma estática con las ubicaciones de los microservicios. En cambio, los resuelve dinámicamente, acomodando cambios en tiempo real en el panorama de los microservicios, como eventos de escala o servicios que caen por mantenimiento.

## naming-server

Eureka Client registra microservicios en un registro de servicios. Ahora necesitamos eso, un registro de servicios. Yo lo llamo **naming-server**.

Cuando miras su código, notas algo... ¡Está literalmente vacío! Solo la clase principal de Spring Boot con una anotación.

```java
@SpringBootApplication
@EnableEurekaServer
public class NamingServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(NamingServerApplication.class, args);
    }

}
```

Nuevamente, toda la magia se hace mediante una dependencia en el archivo pom.xml.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

## Algunas consideraciones

### Registrarse en el naming-server

Cada microservicio que quiera registrarse en el servidor de nombres para que otros microservicios lo encuentren, necesita:

- dependencias actuator + eureka client:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
    <version>3.2.4</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <version>4.1.1</version>
</dependency>
```

- Este fragmento de código en su application.yml

```yml
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka #or wherever eureka server is
  instance:
    prefer-ip-address: true
```

### ¿Qué son esas dependencias de micrometer y zipkin?

El curso de Udem [Master Microservices with Spring Boot and Spring Cloud](https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/) viene con contenido acerca de logging y tracing, asi que decidí implementarlo aquí también.

Sin entrar en aspectos técnicos, esas dependencias ayudan con:

- Dar identificaciones únicas a los registros.
- Pasar ID a través de microservicios, para que podamos rastrear dónde fue la solicitud inicial.
- Mostrar en un tablero los traces y métricas.

Lo único que tuvo que cambiar en el código comercial adecuado para que estas dependencias funcionaran fue:

- Agregar algunas capacidades al crear el cliente Feign. Aquí hay un ejemplo tomado del microservice-a:

```java
@Configuration
@ComponentScans(
    value = {
      @ComponentScan(
          basePackages = {
            "dev.pollito.microserviceb.api",
          })
    })
@RequiredArgsConstructor
public class MicroserviceBApiConfig {
  private final MicroserviceBProperties microserviceBProperties;
  private final MeterRegistry meterRegistry;
  private final ObservationRegistry observationRegistry;

  @Bean
  public HelloWorldApi microServiceBApi() {
    return Feign.builder()
        .client(new OkHttpClient())
        .encoder(new GsonEncoder())
        .decoder(new GsonDecoder())
        .errorDecoder(new MicroserviceBErrorDecoder())
        .logger(new Slf4jLogger(HelloWorldApi.class))
        .logLevel(Logger.Level.FULL)
        .addCapability(new MicrometerObservationCapability(observationRegistry))    // <-- THIS IS NEW
        .addCapability(new MicrometerCapability(meterRegistry))                     // <-- THIS IS NEW
        .target(HelloWorldApi.class, microserviceBProperties.getBaseUrl());
  }
}
```

- Agregar algunas configuraciones en application.yml:

```yml
logging:
  pattern:
    level: "%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"
management:
  tracing:
    sampling:
      probability: 1.0
```

## Hagamos que esto funcione

Utilice el archivo [docker-compose](https://github.com/franBec/spring-cloud-v2-docker-compose) para comenzar. No entraré en detalles sobre cómo funciona Docker Compose. Este es un blog de Spring Cloud, no de Docker.

Personalmente, me gusta usar docker desktop para estas cosas, pero puedes usar el CMD.

![docker desktop](/uploads/2024-04-09-spring-cloud/Screenshot2024-04-09134851.png)

Si marca [localhost:8761](http://localhost:8761/), encontrará el servidor Eureka con todos los servicios que se registraron.

![Eureka Server](/uploads/2024-04-09-spring-cloud/screencapture-localhost-8761-2024-04-09-13_50_52.png)

La ejecución de este curl hará que todo el proceso pase por api-gateway, microservice-a, microservice-b y viceversa.

```bash
curl --location 'http://172.22.224.1:8765/microservice-a'
```

![postman](/uploads/2024-04-09-spring-cloud/Screenshot2024-04-09135520.png)

Podemos ver toda la solicitud viajar a través de los micoservicios gracias a zipkin. Vaya a [http://localhost:9411/zipkin/](http://localhost:9411/zipkin/).

![zipking](/uploads/2024-04-09-spring-cloud/screencapture-localhost-9411-zipkin-2024-04-09-13_57_47.png)

Haga clic en "RUN QUERY" y encontrará su solicitud.

![run query](/uploads/2024-04-09-spring-cloud/screencapture-localhost-9411-zipkin-2024-04-09-13_58_37.png)

Haga clic en "SHOW" para ver más detalles.

![show](/uploads/2024-04-09-spring-cloud/screencapture-localhost-9411-zipkin-traces-cdf928c51f86a7b8ebd4119cb04e32be-2024-04-09-13_59_42.png)

## Próximos pasos

Implementar esta misma idea en Google Cloud GKE.
