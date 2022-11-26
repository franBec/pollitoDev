---
author: "Franco Becvort"
title: "Funciona una vez, ahora hazlo funcionar n veces"
date: 2022-11-26
description: "Mi primer aporte en Yacaré (en proceso...)"
categories: ["The weekly update"]
thumbnail: /uploads/csv.png
---
## ¿De qué trata?

Actualmente existe un sistema de transferencias que funciona. La idea es que existen escenarios donde se quieren hacer muchas transferencias a la vez \(¿una liquidación de sueldos quizás?\). Así que junto con un chico de Yacaré estamos creando eso: a partir de un csv de cbus y montos, realizar múltiples transferencias una detrás de otra

## ¿Por qué aún no está listo?

Uno de los puntos a cumplir es devolverle a quien consuma esta api una url de un reporte donde se informa cuáles transferencias fueron exitosas, cuáles no, y un motivo

Mi compañero \(Nicolás Britos, un tipazo\) supo crear un reporte excel rapidísimo. Sin embargo de momento no sabemos que mierda hacer con ese reporte. Guardarlo como blob en la base de datos es opción \(se está haciendo eso de momento\)

Sin embargo nuestros superiores han sugerido subirlo a una nube, guardarlo, y proporcionar una url de descarga. Obtener permisos de un bucket de una nube para subir las cosas ha frenado todo el desarrollo, así que un bajón de momento. Espero este inconveniente burocrático se resuelva rápido