---
author: "Franco Becvort"
title: "Hablemos de Java: Data persistence en Spring"
date: 2024-11-25
description: "Hibernate, JPA, Spring Data JPA, Lazy/Eager Loading"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-data-persistence-in-spring/ryou_yamada_mastering_spring.png
---

<!-- TOC -->
  * [¿Quién hace qué?](#quién-hace-qué)
    * [Hibernate](#hibernate)
    * [JPA](#jpa)
    * [Spring Data JPA](#spring-data-jpa)
    * [Entonces&hellip; ¿Quién hace qué?](#entonces-quién-hace-qué)
  * [Spring Boot con JPA](#spring-boot-con-jpa)
  * [¿Cuál es el tema con eager/lazy loading?](#cuál-es-el-tema-con-eagerlazy-loading)
    * [¿Cuál es la diferencia?](#cuál-es-la-diferencia)
    * [¿Quién se encarga del lazy/eager loading?](#quién-se-encarga-del-lazyeager-loading)
    * [Problemas comunes y cómo solucionarlos](#problemas-comunes-y-cómo-solucionarlos)
    * [Buenas prácticas](#buenas-prácticas)
<!-- TOC -->

## ¿Quién hace qué?

### Hibernate

- **¿Qué es?**: Hibernate es un framework de ORM (Object-Relational Mapping) basado en Java. Facilita las interacciones con la base de datos al permitir mapear objetos Java a tablas de base de datos y viceversa.
- **Papel clave**: Actúa como el proveedor subyacente de ORM. Hibernate se encarga de:
    - Convertir objetos Java en consultas SQL (y viceversa).
    - Gestionar relaciones, caching y lazy loading.
    - Simplificar las operaciones CRUD.

### JPA

- **¿Qué es?**: JPA (Java Persistence API) es una especificación para frameworks de ORM. Define un conjunto de interfaces y anotaciones que frameworks como Hibernate deben implementar.
- **Papel clave**: JPA es la capa de abstracción. Ofrece un modelo de programación unificado para que tu aplicación no dependa directamente de un framework ORM específico (como Hibernate).

### Spring Data JPA

- **¿Qué es?**: Spring Data JPA es parte del ecosistema de Spring Data, que provee abstracciones para diversas tecnologías de acceso a datos. Específicamente, se asienta encima de JPA para simplificar la gestión de repositorios.
- **Papel clave**: Automatiza las partes aburridas del acceso a datos. Con Spring Data JPA, obtenés:
    - Interfaces de repositorio predefinidas, como `CrudRepository` y `JpaRepository`.
    - Generación de consultas a partir de los nombres de los métodos (por ejemplo, `findByNameAndAge()`).
    - Paginación y ordenamiento incorporados.

### Entonces&hellip; ¿Quién hace qué?

- **Hibernate**: Se encarga directamente de la base de datos, traduciendo entre objetos y SQL.
- **JPA**: Provee el plano o blueprint de cómo debe comportarse Hibernate (o cualquier ORM).
- **Spring Data JPA**: Simplifica la interacción con JPA.

## Spring Boot con JPA

La dependencia `spring-boot-starter-data-jpa` hace mucho del trabajo pesado por vos, pero hay algunas cositas que vas a tener que considerar para que tu proyecto Spring Boot con JPA y Hibernate funcione sin problemas.

1. **Dependencia a la base de datos**: Necesitás un driver de base de datos (H2, MySQL, PostgreSQL, etc.). Spring Boot detecta automáticamente el driver y configura Hibernate con el dialecto apropiado según la base de datos.
2. Vas a tener que **configurar la conexión a la base de datos** y algunas propiedades de JPA en `application.properties` (o `application.yml`).
3. Clases **Entity**.
4. Interfaces de **Repositorio**: Vas a necesitar crear una interfaz de repositorio que extienda las interfaces de Spring Data, como `JpaRepository`.

**¿Necesitás algo más?**
- **Sin configuración XML**: Spring Boot se encarga de la configuración automáticamente.
- **Consultas avanzadas**: Usá `@Query` para consultas personalizadas si hace falta.
- **Configuraciones personalizadas**: Si necesitás propiedades específicas de Hibernate, podés definirlas bajo `spring.jpa.properties.*` en el `application.properties`.

## ¿Cuál es el tema con eager/lazy loading?

### ¿Cuál es la diferencia?

| Aspecto                  | Lazy Loading                                                                                                                                              | Eager Loading                                                                                                                                                      |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Definición               | Los datos asociados se cargan solo cuando se acceden                                                                                                      | Los datos asociados se cargan inmediatamente junto con la entidad principal                                                                                        |
| Ventajas                 | Ahorra memoria al no cargar datos innecesarios                                                                                                            | Simplifica el acceso a datos relacionados sin preocuparse por los límites de la sesión/transacción                                                                 |
| Desventajas              | - Requiere que la sesión de Hibernate esté activa; acceder fuera de ella causa LazyInitializationException. - Puede generar el problema N+1 si se usa mal | - Carga datos innecesarios, lo que puede gastar memoria y tiempo de procesamiento. - Puede resultar en consultas grandes y complejas que ralenticen el rendimiento |
| Caso de uso              | Ideal para escenarios donde los datos relacionados no se necesitan siempre                                                                                | Ideal para escenarios donde los datos relacionados se requieren siempre                                                                                            |
| Por defecto en Hibernate | LAZY: Para `@OneToMany` y `@ManyToMany`                                                                                                                   | EAGER: Para `@ManyToOne` y `@OneToOne`                                                                                                                             |

### ¿Quién se encarga del lazy/eager loading?

- **JPA y Hibernate**: JPA define si una relación (`@OneToMany`, `@ManyToOne`, etc.) se carga de forma perezosa o ansiosa. Hibernate, como ORM por defecto, implementa ese comportamiento.
- **Vos, el desarrollador**: Vos decidís cuándo y dónde usar eager o lazy loading basándote en:
    - **El caso de uso**: ¿Necesitás los datos asociados siempre o solo ocasionalmente?
    - **El impacto en el rendimiento**: ¿Es mejor traer todo de una vez o diferir la carga hasta que sea necesario?

### Problemas comunes y cómo solucionarlos

**LazyInitializationException**.

- **¿Qué pasa?**: Se intenta acceder a datos cargados de forma lazy fuera de una transacción o sesión de Hibernate, lo que provoca una excepción.
- **¿Cómo solucionarlo?**: Usá `@Transactional` para mantener la sesión abierta.

```java
@Transactional
public List<Post> getUserPosts(Long userId) {
    User user = userRepository.findById(userId).orElseThrow();
    return user.getPosts(); // Acceso dentro de la transacción
}
```

**Problema N+1**.

- **¿Qué pasa?**: El lazy loading dispara múltiples consultas: una para la entidad principal y una para cada entidad relacionada.
- **¿Cómo solucionarlo?**:
    - Usá `JOIN FETCH` en las consultas.
    - Utilizá `EntityGraph` para controlar de forma dinámica qué se carga de manera eager.

```java
@Query("SELECT u FROM User u JOIN FETCH u.posts WHERE u.id = :id")
Optional<User> findUserWithPosts(@Param("id") Long id);
```

```java
@EntityGraph(attributePaths = {"posts"})
Optional<User> findById(Long id);
```

**Overfetching con eager loading**.

- **¿Qué pasa?**: El eager loading trae datos innecesarios, aumentando el tamaño de la consulta y el uso de memoria.
- **¿Cómo solucionarlo?**: Cambiá a `FetchType.LAZY` para las relaciones que rara vez usás.

### Buenas prácticas

1. **Por defecto, usá lazy**: Usá `FetchType.LAZY` a menos que estés 100% seguro de que necesitás los datos siempre.
2. **Ámbito transaccional**: Asegurate de acceder a datos lazy dentro de una transacción activa.
3. **Optimizá las consultas**: Empleá `JOIN FETCH` o `EntityGraph` para casos específicos que requieran datos asociados.
4. **Perfilar y monitorear**: Usá herramientas como el logueo SQL de Hibernate o el metamodelo de JPA para monitorear qué consultas se están ejecutando.
5. **Evitá cargar colecciones grandes**: Para relaciones de tipo `@OneToMany` u otras similares, paginá los resultados siempre que sea posible.