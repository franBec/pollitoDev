---
author: "Franco Becvort"
title: "Pollito's Opinion on Spring Boot Development 8: JpaRepository and H2"
date: 2024-11-22
description: "Getting information from a mocked database"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-11-22-pollitos-opinion-on-spring-boot-development-8/DALL·E2025-01-22212141.jpg
---

<!-- TOC -->
  * [Some context](#some-context)
  * [But what if we had the data in our own database?](#but-what-if-we-had-the-data-in-our-own-database)
  * [1. Create entities](#1-create-entities)
  * [2. Mock data](#2-mock-data)
  * [3. H2](#3-h2)
    * [3.1. Dependencies](#31-dependencies)
    * [3.2. Properties](#32-properties)
  * [4. JpaRepository](#4-jparepository)
  * [5. Adapt the service logic](#5-adapt-the-service-logic)
  * [Next lecture](#next-lecture)
<!-- TOC -->

## Some context

This is the eighth part of the [Spring Boot Development](/en/categories/spring-boot-development/) blog series.

- The objective of the series is to be a demonstration of how to consume and create an API following [Design by Contract principles](https://en.wikipedia.org/wiki/Design_by_contract).
- To achieve that, we are creating a Java Spring Boot Microservice that handles information about users.

## But what if we had the data in our own database?

Up until now, we have been getting the users data from an external API using feignClient. But what if we had the data in our own database? That's the objective of this blog.

- To the left, in the [main branch of the repo](https://github.com/franBec/user_manager_backend), users are obtained from a mocked database.
- To the right, in the [feature/feignClient branch of the repo](https://github.com/franBec/user_manager_backend/tree/feature/feignClient), users are obtained from an external API.

![Untitled-2024-11-22-2023.jpg](/uploads/2024-11-22-pollitos-opinion-on-spring-boot-development-8/Untitled-2024-11-22-2023.jpg)

If you are interested in all the differences, I recommend you checking [this commit](https://github.com/franBec/user_manager_backend/commit/a298cfd5ce06829bca6b9090367918858ec43dba). There are lots of changes in dependencies and configuration, cause feignClient is not needed in main.

In this blog:
- I'll focus on the main changes for getting the mocked database working.
- I won't get into details on the feignClient cleaning of.

Let's get started!

## 1. Create entities

These are the representation of the database tables in the business code.

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

Here I made the mistake that a Company can only appear once.

## 2. Mock data

In a [data.sql file](https://github.com/franBec/user_manager_backend/blob/main/src/main/resources/data.sql), write the INSERT INTO queries that will fill the tables with mock data.

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
Doing an actual SQL Server setup is too much for a simple example. [H2](https://www.h2database.com/html/main.html) comes to the rescue! It is a lightweight, in-memory database engine (When you stop the app, the data is gone).

### 3.1. Dependencies

Add these dependencies in [pom.xml](https://github.com/franBec/user_manager_backend/blob/main/pom.xml)

- [Microsoft JDBC Driver For SQL Server](https://mvnrepository.com/artifact/com.microsoft.sqlserver/mssql-jdbc)
- [H2 Database Engine](https://mvnrepository.com/artifact/com.h2database/h2)

Here I leave some ready copy-paste for you. Consider double-checking the latest version.

Under the \<dependencies\> tag:
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

**Why Microsoft SQL Server?**
- It is the one I'm more used to. Could've been any SQL database.
- H2 is database agnostic. I think there's no need of a JDBC Driver for this mock scenario.

### 3.2. Properties

Add the properties h2 needs in [application.yml](https://github.com/franBec/post/blob/feature/devsu-lab/src/main/resources/application.yml). It should look something like this:

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

Usually with creating an interface that extends [JpaRepository](https://www.geeksforgeeks.org/spring-boot-jparepository-with-example/) is enough. It contains API for basic CRUD operations and also API for pagination and sorting.

- But in this specific case, we have to do an interesting query with the `q parameter` in GET /users.
  ![Screenshot2024-11-18154110](/uploads/2024-11-22-pollitos-opinion-on-spring-boot-development-8/Screenshot2024-11-18154110.png)
- We are going to use [@Query](https://www.baeldung.com/spring-data-jpa-query).

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

## 5. Adapt the service logic

Compared to the feignClient version, in this one the service implementation is much cleaner, cause all the pagination and sorting are now the Repository responsibility.

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

## Next lecture
[Pollito&rsquo;s Opinion on Spring Boot Development 9: Deployment](/en/blog/2024-11-23-pollitos-opinion-on-spring-boot-development-9)