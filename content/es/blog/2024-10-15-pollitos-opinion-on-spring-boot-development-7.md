---
author: "Franco Becvort"
title: "La opinión de Pollito acerca del desarrollo en Spring Boot 7: Unit tests"
date: 2024-10-15
description: "¿A qué hacer test? Mutation testing y reportes"
categories: ["Spring Boot Development"]
thumbnail: /uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/GFvuurOXgAAiYC1.jpg
---

<!-- TOC -->
  * [Un poco de contexto](#un-poco-de-contexto)
  * [1. ¿A qué hacer test?](#1-a-qué-hacer-test)
  * [2. Mutation testing](#2-mutation-testing)
  * [3. Generar un reporte](#3-generar-un-reporte)
  * [Siguiente lectura](#siguiente-lectura)
<!-- TOC -->

## Un poco de contexto

Esta es la séptima parte de la serie de blogs [Spring Boot Development](/es/categories/spring-boot-development/).

- El objetivo de esta seria es ser una demostración de cómo consumir y crear una API siguiendo los principios del [Desarrollo impulsado por contratos](https://en.wikipedia.org/wiki/Design_by_contract).
- Para lograrlo, estamos creando un microservicio Java Spring Boot que maneje información sobre los usuarios.
  - Puedes encontrar el resultado final de la serie en el [repo de GitHub - branch feature/feignClient](https://github.com/franBec/user_manager_backend/tree/feature/feignClient).
  - A continuación se muestra un diagrama de componentes. Para una explicación más detallada, visite [Entendiendo el proyecto](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2/#1-entendiendo-el-proyecto)
    ![diagram](/uploads/2024-10-02-pollitos-opinion-on-spring-boot-development-2/diagram.jpg)

Ya hemos creado todos los componentes. En este blog nos enfocaremos en Unit tests. ¡Comencemos!

## 1. ¿A qué hacer test?

En lo que respecta a [unit testing](https://en.wikipedia.org/wiki/Unit_testing), esta es mi recomendación:

- Realice unit testing en:
  - El controller package.
  - El service package.
  - El util package, si existe, debe estar cubierto indirectamente por las otras pruebas unitarias.
  - Todo lo demás se puede ignorar.
- El código que se está testeando, debe tener:
  - Más del 70 % de line coverage.
  - Más del 60 % de mutation coverage.

## 2. Mutation testing

¿Qué significa "Más del 60 % de mutation coverage"? ¿Qué es la prueba de mutación? [Pitest](https://pitest.org/) la define como:

> Las pruebas de mutación son conceptualmente bastante simples. Los errores (o mutaciones) se introducen automáticamente en el código y luego se ejecutan las pruebas. Si las pruebas fallan, la mutación se elimina; si las pruebas pasan, la mutación sigue viva. La calidad de las pruebas se puede medir a partir del porcentaje de mutaciones eliminadas.

Para obtener esta métrica, utilizamos estos plugins que ya deberíamos tener desde la [parte 2](/es/blog/2024-10-02-pollitos-opinion-on-spring-boot-development-2)

- [Pitest Maven](https://mvnrepository.com/artifact/org.pitest/pitest-maven)
- [Pitest JUnit 5 Plugin](https://mvnrepository.com/artifact/org.pitest/pitest-junit5-plugin)

Aquí te dejo un copy-paste listo para usar. Considera revisar la última versión.

Dentro del tag \<plugins\>:

```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.17.0</version>
  <executions>
      <execution>
          <id>pit-report</id>
          <phase>test</phase>
          <goals>
              <goal>mutationCoverage</goal>
          </goals>
      </execution>
  </executions>
  <dependencies>
      <dependency>
          <groupId>org.pitest</groupId>
          <artifactId>pitest-junit5-plugin</artifactId>
          <version>1.2.1</version>
      </dependency>
  </dependencies>
  <configuration>
      <targetClasses>
          <param>${project.groupId}.${project.artifactId}.controller.*</param>
          <param>${project.groupId}.${project.artifactId}.service.*</param>
          <param>${project.groupId}.${project.artifactId}.util.*</param>
      </targetClasses>
      <targetTests>
          <param>${project.groupId}.${project.artifactId}.*</param>
      </targetTests>
  </configuration>
</plugin>
```

## 3. Generar un reporte

Luego de crear sus unit tests y asegurarse que funcionan, ejecute `pitest:mutationCoverage`

![Screenshot2024-10-15162331](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-6/Screenshot2024-10-15162331.png)

Deberías encontrar en target/pit-reports un index.html, ese es el informe.
![Screenshot2024-10-15173646](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/Screenshot2024-10-15173646.png)

Ábrelo en tu navegador favorito y explora más a fondo cada clase si es necesario.
![screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48](/uploads/2024-10-15-pollitos-opinion-on-spring-boot-development-7/screencapture-localhost-63342-post-target-pit-reports-index-html-2024-10-15-17_54_48.png)

## Siguiente lectura

[La opinión de Pollito acerca del desarrollo en Spring Boot 8: JpaRepository y H2](/es/blog/2024-11-22-pollitos-opinion-on-spring-boot-development-8)

