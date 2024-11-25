---
author: "Franco Becvort"
title: "Let's talk Java: Data persistence en Spring"
date: 2024-11-25
description: "Hibernate, JPA, Spring Data JPA, Lazy/Eager Loading"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-data-persistence-in-spring/ryou_yamada_mastering_spring.png
---

<!-- TOC -->
  * [¿Quién hace qué?](#quién-hace-qué)
  * [Spring Boot con JPA](#spring-boot-con-jpa)
  * [¿Qué pasa con Eager/Lazy loading?](#qué-pasa-con-eagerlazy-loading)
    * [¿Cuál es la diferencia?](#cuál-es-la-diferencia)
    * [¿Quién es responsable de Eager/Lazy Loading?](#quién-es-responsable-de-eagerlazy-loading)
    * [Problemas comunes y cómo solucionarlos](#problemas-comunes-y-cómo-solucionarlos)
    * [Mejores prácticas](#mejores-prácticas)
<!-- TOC -->

## ¿Quién hace qué?

**Hibernate**
- **¿Qué es?**: Hibernate es un marco de mapeo relacional de objetos (ORM) basado en Java. Simplifica las interacciones con bases de datos al permitirle mapear objetos Java a tablas de bases de datos y viceversa.
- **Función clave:** Actúa como el proveedor de ORM subyacente. Hibernate se encarga de:
  - Convertir objetos Java en consultas SQL (y viceversa).
  - Administrar relaciones, almacenamiento en caché y carga diferida.
  - Simplificar las operaciones CRUD.

**JPA**
- **¿Qué es?**: JPA (Java Persistence API) es una especificación para los marcos ORM. Define un conjunto de interfaces y anotaciones que los marcos como Hibernate deben implementar.
- **Función clave:** JPA es la capa de abstracción. Proporciona un modelo de programación unificado para que su aplicación no dependa directamente de un marco ORM específico (como Hibernate).

**Spring Data JPA**
- **¿Qué es?**: Spring Data JPA es parte del ecosistema más grande de Spring Data, que proporciona abstracciones para varias tecnologías de acceso a datos. Específicamente, se encuentra sobre JPA para simplificar la administración del repositorio.
- **Función clave:** Automatiza las partes aburridas del acceso a datos. Con Spring Data JPA, obtienes:
  - Interfaces de repositorio pre construidas como `CrudRepository`, `JpaRepository`.
  - Generación de consultas a partir de nombres de métodos (p. ej., `findByNameAndAge()`).
  - Paginación y ordenamiento listos para usar.

**Entonces... ¿Quién hace qué?**
- **Hibernate:** trabaja directamente con la base de datos, traduciendo entre objetos y SQL.
- **JPA:** proporciona un modelo de cómo debería comportarse Hibernate (o cualquier ORM).
- **Spring Data JPA:** simplifica su interacción con JPA.

## Spring Boot con JPA
La dependencia `spring-boot-starter-data-jpa` hace mucho trabajo pesado, pero hay algunas otras cosas que deberá considerar para que su proyecto Spring Boot con JPA e Hibernate funcione sin problemas.

1. **Dependencia de la base de datos:** Necesita un controlador de base de datos (H2, MySQL, PostgreSQL, etc.). Spring Boot seleccionará automáticamente el controlador y configurará Hibernate para el dialecto apropiado según su base de datos.
2. Debe **configurar su conexión de base de datos** y algunas propiedades JPA en `application.properties` (o `application.yml`).
3. **Clases de entidad.**
4. **Interfaces de repositorio:** Deberá crear una interfaz de repositorio que extienda las interfaces de Spring Data, como `JpaRepository`.

**¿Necesita algo más?**
- **Sin configuración XML:** Spring Boot maneja la configuración automáticamente.
- **Consultas avanzadas:** Use `@Query` para consultas personalizadas si es necesario.
- **Configuraciones personalizadas:** Si necesita propiedades específicas de Hibernate, puede definirlas en `spring.jpa.properties.*` en `application.properties`.

## ¿Qué pasa con Eager/Lazy loading?

### ¿Cuál es la diferencia?

| Aspecto                    | Lazy Loading                                                                                                                                                     | Eager Loading                                                                                                                                                                 |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Definición                 | Los datos asociados se cargan solo cuando se accede a ellos.                                                                                                     | Los datos asociados se cargan inmediatamente con la entidad principal.                                                                                                        |
| Ventajas                   | Ahorra memoria al no cargar datos innecesarios.                                                                                                                  | Simplifica el acceso a datos relacionados sin preocuparse por los límites de sesión/transacción.                                                                              |
| Desventajas                | - Requiere una sesión de Hibernate activa; el acceso externo a resultados en LazyInitializationException. - Puede provocar un problema N+1 si se administra mal. | - Carga datos innecesarios, lo que potencialmente desperdicia memoria y tiempo de procesamiento. - Puede generar consultas grandes y complejas que ralentizan el rendimiento. |
| Caso de uso                | Ideal para escenarios en los que no siempre se necesitan datos relacionados.                                                                                     | Ideal para escenarios en los que siempre se requieren datos relacionados.                                                                                                     |
| Hibernación predeterminada | LAZY: para `@OneToMany` y `@ManyToMany`.                                                                                                                         | EAGER: para `@ManyToOne` y `@OneToOne`.                                                                                                                                       |

### ¿Quién es responsable de Eager/Lazy Loading?

- **JPA e Hibernate:** JPA define si una relación (@OneToMany, @ManyToOne, etc.) se carga de forma diferida o ansiosa. Hibernate, como ORM predeterminado, implementa el comportamiento.
- **Usted (¡el desarrollador!):** Como desarrollador, usted decide cuándo y dónde usar la carga ansiosa o diferida en función de:
  - **El caso de uso:** ¿Necesita los datos asociados cada vez o solo ocasionalmente?
  - **El impacto en el rendimiento:** ¿Es mejor obtener todo de una vez o posponer la obtención hasta que sea necesario?

### Problemas comunes y cómo solucionarlos

**LazyInitializationException**

- **¿Qué sucede?:** Se accede a los datos cargados de forma diferida fuera de una transacción o sesión de Hibernate, lo que genera una excepción.
- **¿Cómo solucionarlo?:** Use `@Transactional` para mantener la sesión abierta

```java
@Transactional
public List<Post> getUserPosts(Long userId) {
    User user = userRepository.findById(userId).orElseThrow();
    return user.getPosts(); // Access within transaction
}
```

**Problema N+1**

- **¿Qué sucede?:** La carga diferida activa varias consultas: una para la entidad principal y otra para cada entidad asociada.
- **¿Cómo solucionarlo?:**
  - Utilice `JOIN FETCH` en las consultas.
  - Utilice `EntityGraph` para controlar lo que se busca de manera Eager.

```java
@Query("SELECT u FROM User u JOIN FETCH u.posts WHERE u.id = :id")
Optional<User> findUserWithPosts(@Param("id") Long id);
```

```java
@EntityGraph(attributePaths = {"posts"})
Optional<User> findById(Long id);
```
**Sobrecarga con Eager Loading**

- **¿Qué sucede?:** Eager Loading recupera datos innecesarios, lo que aumenta el tamaño de la consulta y el uso de memoria.
- **¿Cómo solucionarlo?:** Cambie a `FetchType.LAZY` para las relaciones que rara vez usa.

### Mejores prácticas
1. **Predeterminado en Lazy:** Use `FetchType.LAZY` a menos que esté absolutamente seguro de que los datos siempre serán necesarios.
2. **Ámbito transaccional:** Asegúrese de que se acceda a los datos cargados de forma diferida dentro de una transacción activa.
3. **Optimice las consultas:** Use `JOIN FETCH` o `EntityGraph` para casos de uso específicos que requieran datos asociados.
4. **Perfil y monitor:** Use herramientas como el registro SQL de Hibernate o el metamodelo JPA para monitorear qué consultas se están ejecutando.
5. **Evite obtener colecciones grandes:** Para relaciones `@OneToMany` o similares, pagine los resultados cuando sea posible.