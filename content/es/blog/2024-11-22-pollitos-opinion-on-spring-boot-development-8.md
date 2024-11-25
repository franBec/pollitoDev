---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 8: JpaRepository y H2"
date: 2024-11-22
description: "Obteniendo información desde una base de datos mockeada"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-11-22-pollitos-opinion-on-spring-boot-development-8/c513441f650434b8d4a54d56162d97c6.png
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [¿Y si tuviéramos los datos en nuestra propia base de datos?](#y-si-tuviéramos-los-datos-en-nuestra-propia-base-de-datos)
  * [1. Crear entidades](#1-crear-entidades)
  * [2. Mock data](#2-mock-data)
  * [3. H2](#3-h2)
  * [3.1. Dependencias](#31-dependencias)
    * [3.2. Properties](#32-properties)
  * [4. JpaRepository](#4-jparepository)
  * [5. Adapte la lógica del service](#5-adapte-la-lógica-del-service)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la octava parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta serie es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, estamos creando un microservicio Java Spring Boot que maneje información sobre los usuarios.

## ¿Y si tuviéramos los datos en nuestra propia base de datos?

Hasta ahora, hemos obtenido la data de usuarios desde una API externa mediante feignClient. Pero, ¿qué sucedería si tuviéramos los datos en nuestra propia base de datos? Ese es el objetivo de este blog.

- A la izquierda, en la [rama principal del repositorio](https://github.com/franBec/user_manager_backend), los usuarios se obtienen de una base de datos simulada.
- A la derecha, en la [rama feature/feignClient del repositorio](https://github.com/franBec/user_manager_backend/tree/feature/feignClient), los usuarios se obtienen de una API externa.

![Untitled-2024-11-22-2023.jpg](/uploads/2024-11-22-pollitos-opinion-on-spring-boot-development-8/Untitled-2024-11-22-2023.jpg)

Si te interesan todos los cambios, te recomiendo que consultes [este commit](https://github.com/franBec/user_manager_backend/commit/a298cfd5ce06829bca6b9090367918858ec43dba). Hay muchos cambios en las dependencias y la configuración, ya que no se necesita feignClient en main.

En este blog:
- Me centraré en los cambios principales para que funcione la base de datos simulada.
- No entraré en detalles sobre la limpieza de feignClient.

¡Comencemos!

## 1. Crear entidades

Estas son la representación de las tablas de la base de datos en el código de negocio.

_entity/Address.java_
```java
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Address implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  Long id;

  @Column(name = "street")
  String street;

  @Column(name = "suite")
  String suite;

  @Column(name = "city")
  String city;

  @Column(name = "zipcode")
  String zipcode;

  @OneToOne(cascade = CascadeType.ALL)
  @JoinColumn(name = "geo_id", referencedColumnName = "id")
  Geo geo;
}
```
_entity/Company.java_
```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Company implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  Long id;

  @Column(name = "name")
  String name;

  @Column(name = "catch_phrase")
  String catchPhrase;

  @Column(name = "bs")
  String bs;
}
```
_entity/Geo.java_
```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "geolocalizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Geo implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  Long id;

  @Column(name = "lat")
  String lat;

  @Column(name = "lng")
  String lng;
}
```
_entity/User.java_
```java
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User implements Serializable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  Long id;

  @Column(name = "creation_time", nullable = false, updatable = false)
  final LocalDateTime creationTime = LocalDateTime.now();

  @Column(name = "name", nullable = false)
  String name;

  @Column(name = "username", nullable = false)
  String username;

  @Column(name = "email", nullable = false)
  String email;

  @Column(name = "phone")
  String phone;

  @Column(name = "website")
  String website;

  @OneToOne(cascade = CascadeType.ALL)
  @JoinColumn(name = "address_id", referencedColumnName = "id")
  Address address;

  @OneToOne(cascade = CascadeType.ALL)
  @JoinColumn(name = "company_id", referencedColumnName = "id")
  Company company;
}
```

Aquí cometí el error de que Company solo puede aparecer una vez.

## 2. Mock data

En un archivo [data.sql](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/data.sql), escriba las queries INSERT INTO que llenarán las tablas con datos simulados.

_resources/data.sql_
```sql
-- Inserting into the geolocalizations table
INSERT INTO geolocalizations (lat, lng) VALUES ('-37.3159', '81.1496');
INSERT INTO geolocalizations (lat, lng) VALUES ('-43.9509', '-34.4618');
INSERT INTO geolocalizations (lat, lng) VALUES ('-68.6102', '-47.0653');
INSERT INTO geolocalizations (lat, lng) VALUES ('29.4572', '-164.2990');
INSERT INTO geolocalizations (lat, lng) VALUES ('-31.8129', '62.5342');
INSERT INTO geolocalizations (lat, lng) VALUES ('-71.4197', '71.7478');
INSERT INTO geolocalizations (lat, lng) VALUES ('24.8918', '21.8984');
INSERT INTO geolocalizations (lat, lng) VALUES ('-14.3990', '-120.7677');
INSERT INTO geolocalizations (lat, lng) VALUES ('24.6463', '-168.8889');
INSERT INTO geolocalizations (lat, lng) VALUES ('-38.2386', '57.2232');

-- Inserting into the company table
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Romaguera-Crona', 'Multi-layered client-server neural-net', 'harness real-time e-markets');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Deckow-Crist', 'Proactive didactic contingency', 'synergize scalable supply-chains');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Romaguera-Jacobson', 'Face to face bifurcated interface', 'e-enable strategic applications');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Robel-Corkery', 'Multi-tiered zero tolerance productivity', 'transition cutting-edge web services');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Keebler LLC', 'User-centric fault-tolerant solution', 'revolutionize end-to-end systems');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Considine-Lockman', 'Synchronised bottom-line interface', 'e-enable innovative applications');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Johns Group', 'Configurable multimedia task-force', 'generate enterprise e-tailers');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Abernathy Group', 'Implemented secondary concept', 'e-enable extensible e-tailers');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Yost and Sons', 'Switchable contextually-based project', 'aggregate real-time technologies');
INSERT INTO companies (name, catch_phrase, bs) VALUES ('Hoeger LLC', 'Centralized empowering task-force', 'target end-to-end models');

-- Inserting into the address table
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Kulas Light', 'Apt. 556', 'Gwenborough', '92998-3874', 1);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Victor Plains', 'Suite 879', 'Wisokyburgh', '90566-7771', 2);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Douglas Extension', 'Suite 847', 'McKenziehaven', '59590-4157', 3);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Hoeger Mall', 'Apt. 692', 'South Elvis', '53919-4257', 4);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Skiles Walks', 'Suite 351', 'Roscoeview', '33263', 5);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Norberto Crossing', 'Apt. 950', 'South Christy', '23505-1337', 6);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Rex Trail', 'Suite 280', 'Howemouth', '58804-1099', 7);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Ellsworth Summit', 'Suite 729', 'Aliyaview', '45169', 8);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Dayna Park', 'Suite 449', 'Bartholomebury', '76495-3109', 9);
INSERT INTO addresses (street, suite, city, zipcode, geo_id) VALUES ('Kattie Turnpike', 'Suite 198', 'Lebsackbury', '31428-2261', 10);

-- Inserting into the user table
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Leanne Graham', '2023-11-01T08:30:00', 'Bret', 'Sincere@april.biz', '1-770-736-8031 x56442', 'hildegard.org', 1, 1);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Ervin Howell', '2023-11-02T10:15:00', 'Antonette', 'Shanna@melissa.tv', '010-692-6593 x09125', 'anastasia.net', 2, 2);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Clementine Bauch', '2023-11-03T12:00:00', 'Samantha', 'Nathan@yesenia.net', '1-463-123-4447', 'ramiro.info', 3, 3);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Patricia Lebsack', '2023-11-04T14:30:00', 'Karianne', 'Julianne.OConner@kory.org', '493-170-9623 x156', 'kale.biz', 4, 4);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Chelsey Dietrich', '2023-11-05T16:45:00', 'Kamren', 'Lucio_Hettinger@annie.ca', '(254)954-1289', 'demarco.info', 5, 5);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Mrs. Dennis Schulist', '2023-11-06T18:10:00', 'Leopoldo_Corkery', 'Karley_Dach@jasper.info', '1-477-935-8478 x6430', 'ola.org', 6,6 );
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Kurtis Weissnat', '2023-11-07T09:00:00', 'Elwyn.Skiles', 'Telly.Hoeger@billy.biz', '210.067.6132', 'elvis.io', 7, 7);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Nicholas Runolfsdottir V', '2023-11-08T13:20:00', 'Maxime_Nienow', 'Sherwood@rosamond.me', '586.493.6943 x140', 'jacynthe.com', 8, 8);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Glenna Reichert', '2023-11-09T11:05:00', 'Delphine', 'Chaim_McDermott@dana.io', '(775)976-6794 x41206', 'conrad.com', 9, 9);
INSERT INTO users (name, creation_time, username, email, phone, website, address_id, company_id) VALUES ('Clementina DuBuque', '2023-11-10T08:45:00', 'Moriah.Stanton', 'Rey.Padberg@karina.biz', '024-648-3804', 'ambrose.net', 10, 10);
```

## 3. H2
Realizar una configuración real de SQL Server es demasiado para un ejemplo simple. ¡[H2](https://www.h2database.com/html/main.html) llega al rescate! Es un motor de base de datos liviano y en memoria (cuando detiene la aplicación, los datos desaparecen).

## 3.1. Dependencias

Agregue las dependencias en [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dentro del tag \<dependencies\>:
```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>12.4.2.jre11</version>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.3.232</version>
    <scope>runtime</scope>
</dependency>
```

**¿Por qué Microsoft SQL Server?**
- Es al que estoy más acostumbrado. Podría haber sido cualquier base de datos SQL.
- H2 es independiente de la base de datos. Creo que no es necesario un controlador JDBC para este escenario simulado.

### 3.2. Properties

Agregue las propiedades que h2 necesita en [application.yml](https://github.com/franBec/post/blob/feature/devsu-lab/src/main/resources/application.yml). Debería verse así:

_resources/application-dev.yml_
```yml
cors:
  allowed-origins: http://localhost:3000
  allowed-methods: GET, POST, PUT, DELETE, PATCH
  allowed-headers: "*"
  allow-credentials: true
logging:
  level:
    org.hibernate.SQL: DEBUG
spring:
  application:
    name: user_manager_backend
  datasource:
    url: jdbc:h2:mem:testdb;MODE=MSSQLServer;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE;INIT=CREATE SCHEMA IF NOT EXISTS DBO
    username: sa
    password: password
    driverClassName: org.h2.Driver
  h2:
    console.enabled: true
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    defer-datasource-initialization: true
```

## 4. JpaRepository

Por lo general, basta con crear una interfaz que extienda [JpaRepository](https://www.geeksforgeeks.org/spring-boot-jparepository-with-example/). Contiene una API para operaciones CRUD básicas y también una API para paginación y ordenación.

- Pero en este caso específico, tenemos que hacer una consulta interesante con el parámetro q en GET /users.
  ![Screenshot2024-11-18154110](/uploads/2024-11-22-pollitos-opinion-on-spring-boot-development-8/Screenshot2024-11-18154110.png)
- Vamos a utilizar [@Query](https://www.baeldung.com/spring-data-jpa-query).

_repository/UserRepository.java_
```java
import dev.pollito.user_manager_backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
  @Query(
      "SELECT u FROM User u "
          + "WHERE (:q IS NULL OR "
          + "LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) OR "
          + "LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')) OR "
          + "LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))")
  Page<User> findAllByQueryContainingIgnoreCase(PageRequest pageRequest, @Param("q") String q);
}
```

## 5. Adapte la lógica del service

En comparación con la versión feignClient, en esta la implementación del servicio es mucho más limpia, ya que toda la paginación y el ordenamiento ahora son responsabilidad del Repositorio.

_service/impl/UsersServiceImpl.java_
```java
import dev.pollito.user_manager_backend.mapper.UserModelMapper;
import dev.pollito.user_manager_backend.model.User;
import dev.pollito.user_manager_backend.model.Users;
import dev.pollito.user_manager_backend.repository.UserRepository;
import dev.pollito.user_manager_backend.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersServiceImpl implements UsersService {
  private final UserRepository userRepository;
  private final UserModelMapper userModelMapper;

  @Override
  public User findById(Long id) {
    return userModelMapper.map(userRepository.findById(id).orElseThrow());
  }

  @Override
  public Users findAll(PageRequest pageRequest, String q) {
    return userModelMapper.map(userRepository.findAllByQueryContainingIgnoreCase(pageRequest, q));
  }
}
```

## Siguiente lectura

Trabajo en progreso...
