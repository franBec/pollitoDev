---
author: "Franco Becvort"
title: "Le di patas a un cerebro de mosca de la fruta y lo mandé a buscar pastel de nata"
date: 2026-09-16
description: "Conecté el conectoma MaleCNS v1.0 de una mosca macho a un walker sobre imágenes de calles de Lisboa, lo corrí contra baselines aleatorio y greedy, y obtuve un resultado nulo honesto."
categories: ["Programming talk"]
thumbnail: /uploads/2026-09-16-flywalker/thumbnail.png
---

Este post es parte de mi [serie de blogs sobre Programming talk](/es/categories/programming-talk/).

<!-- TOC -->
  * [Las noticias del cerebro de mosca, en breve](#las-noticias-del-cerebro-de-mosca-en-breve)
  * [Dale patas](#dale-patas)
  * [Lo que la mosca realmente ve](#lo-que-la-mosca-realmente-ve)
  * [El cableado es real, todo lo demás lo armé yo](#el-cableado-es-real-todo-lo-demás-lo-armé-yo)
  * [La ruta fue más difícil que el cerebro](#la-ruta-fue-más-difícil-que-el-cerebro)
  * [El resultado](#el-resultado)
  * [Miralo vos mismo](#miralo-vos-mismo)
  * [Qué me llevo de esto](#qué-me-llevo-de-esto)
<!-- TOC -->

## Las noticias del cerebro de mosca, en breve

En septiembre de 2026, Google Research y HHMI Janelia publicaron [MaleCNS v1.0](https://male-cns.janelia.org/), el conectoma completo del sistema nervioso central de una mosca de la fruta macho: 166.700 neuronas, 25,6 millones de conexiones, 124 millones de contactos sinápticos, cerebro y cordón nervioso ventral incluidos. Diez años de trabajo, 44 años-persona de corrección manual, publicado en Cell.

En pocos días, internet ya la tenía jugando al Doom, manejando en Super Mario 64 y operando en cripto.

Así que le di patas.

## Dale patas

[flywalker](https://github.com/franBec/flywalker) es un walker con un conectoma como controlador. En realidad son tres walkers, moviéndose por la misma ruta y registrando cada paso:

- **FLY** le pregunta al cerebro en cada cruce. Cada foto candidata de la calle pasa por los fotorreceptores R1-R6 y R8 mapeados, y la actividad de spikes en las neuronas descendentes se convierte en un puntaje de aproximación. La mosca se mueve a la candidata con mejor puntaje.
- **COIN** no tiene cerebro. Elige un vecino al azar en cada paso.
- **GREEDY** no tiene cerebro. Siempre elige la candidata que más reduce la distancia en línea recta al objetivo.

Los baselines son el punto. Si FLY llega, COIN me dice si le ganó al ruido, y GREEDY me dice qué tan lejos está de simplemente saber el camino. Un conectoma corriendo contra nada no prueba nada.

El objetivo es un pastel de nata. El corredor va de Santa Justa a Largo do Carmo, en Lisboa, 125 metros en línea recta, con imágenes a nivel de calle de Mapillary como entrada visual. Máximo 400 ticks por walker.

El progreso dispara dopamina en 15 células PAM11. El retroceso dispara las dos células aversivas PPL101. También hay una regla de memoria experimental KC a MBON que puede o no acumular algo útil. Eso es parte del experimento.

## Lo que la mosca realmente ve

Cada candidata se renderiza como un frame de 320x180 con fondo claro y se le da a los fotorreceptores.

La saliencia visual del propio conectoma no trae ninguna señal de navegación. Lo medí dos veces.

- La primera versión agregaba un velo de brillo que hacía más brillantes los frames que se acercaban al objetivo. Contra el cerebro real, la correlación por cruce fue +0,01 y la tasa de spikes derivó -1,8 Hz en todo el rango de refuerzo. Ciega a la dirección. La revertí.
- La segunda versión es un medidor de objetivo: una columna oscura cuya altura codifica cuánto reduce cada candidata la distancia al objetivo. También lo probé contra el cerebro real y resultó igual de inerte: correlación por cruce -0,07 en 32 cruces.

Las decisiones siguen siendo del conectoma MaleCNS, sobre una entrada que es explícitamente diseñada y no retinal.

![tres frames candidatos que la mosca vio durante la ejecución](/uploads/2026-09-16-flywalker/fly-eye.png)

Tres frames candidatos de la ejecución. La columna oscura del medio es el medidor de objetivo.

## El cableado es real, todo lo demás lo armé yo

El cableado es real. Los pesos del conectoma vienen de MaleCNS v1.0 y la simulación neuronal es el kernel LIF orientado a eventos de [Stonkfly](https://github.com/nftechie/stonkfly), incluido sin modificar.

El loop que convierte frames en spikes es ingeniería mía: el decoder es el diferencial izquierda/derecha DNp20 de Stonkfly con una compuerta DNpe017, no el descubrimiento de neuronas de caminata. La dopamina y los pulsos aversivos son señales de refuerzo diseñadas, no dolor o placer modelado.

El resultado probable siempre fue que FLY se pareciera estadísticamente a COIN. La validación de Stonkfly no mostró ninguna habilidad aprendida para tradear, y los autores del Doom-fly reportan que mayormente no hace nada. Fui esperando un resultado nulo, y armé el experimento para que un resultado nulo igual significara algo.

## La ruta fue más difícil que el cerebro

Encontrar una ruta que la mosca pudiera caminar fue la mitad del proyecto. Mapillary no te deja pedir una ciudad entera de una, así que descargué el corredor en tiles chicos y los pegué. Las fotos tampoco traen ninguna noción oficial de cuál sigue en la calle, así que armé las conexiones yo. Cada foto quedó enlazada con sus vecinas más cercanas, y me quedé solo con la parte del mapa que se conecta con el objetivo.

Mi primer punto de partida fue Rossio. Parecía genial hasta que lo revisé. Cualquier primer paso posible desde ahí en realidad te alejaba del pastel, así que ni siquiera GREEDY, el walker que siempre va hacia el objetivo, podía salir. Moví el inicio a una esquina con salida (`38.716061,-9.140325`), y GREEDY caminó el corredor en 23 pasos. Eso redujo el problema restante a las decisiones de la propia mosca.

Para el cómputo usé una `e2-highmem-4` on-demand en GCP con 16GB de RAM, 4GB de swap y sin puertos de entrada. Las spot VMs eran 2-3x más baratas pero las preemptaban cada 30-60 minutos, así que me pasé a on-demand. La ejecución completa de 400 ticks tardó unas 2,6 horas, con 4,6 segundos por consulta en promedio (p95 de 6,1 segundos) y 23,3 segundos por tick. El costo total fue de unos $2-3.

## El resultado

| Walker | Pasos | Distancia caminada | Distancia final al objetivo | ¿Llegó? |
|--------|-------|--------------------|-----------------------------|---------|
| FLY | 400 | 691,1m | 106,1m | No |
| COIN | 400 | 776,7m | 117,7m | No |
| GREEDY | 23 | 151,3m | 15,9m | Sí |

GREEDY caminó la respuesta en 23 pasos. Ni FLY ni COIN llegaron. El bolsillo inicial le entrega a la mosca un nudo de capturas casi equidistantes, y ambos walkers quemaron sus 400 ticks haciendo 690-780m de caminata lateral adentro.

FLY terminó 11,6m más cerca del pastel que COIN y quedó más cerca en distancia neta, pero solo en 117/400 ticks (29%). Es una ventaja consistente en dirección pero estadísticamente débil, inseparable de la variación aleatoria a resolución de tick.

La lectura honesta: un conectoma real tomando decisiones reales sobre frames con tinte de objetivo sigue sin poder convertir saliencia visual en navegación, en un corredor donde GREEDY camina la respuesta en 23 pasos.

![posiciones en el tick 73, con GREEDY ya terminado](/uploads/2026-09-16-flywalker/theater.png)

## Miralo vos mismo

La ejecución se renderiza en una página de replay: un escenario 3D donde una mosca low-poly se para en el punto de captura del que realmente salió, el teatro de cruces con Leaflet y los tres recorridos, los puntajes de aproximación decodificados por candidata, y gráficos calculados a partir de los logs exactos de la ejecución.

{{< youtube 9-GM68zuso8 >}}

Todo está en [github.com/franBec/flywalker](https://github.com/franBec/flywalker). Un clone fresco puede mirar la muestra incluida sin oracle, sin dataset y sin token de Mapillary:

```bash
cd sample/run/replay && python3 -m http.server 8080
# open http://localhost:8080
```

También hay un modo mock para que todo el pipeline corra en una laptop con pseudo-puntajes deterministas en lugar del cerebro real.

## Qué me llevo de esto

Un conectoma es anatomía. Te dice quién está cableado con quién, y no dice nada sobre qué significa. En el momento en que lo conectás a ojos y patas, todo lo que convierte spikes en movimiento es una decisión tuya, y esas decisiones merecen su propio baseline.

Por eso me gusta esta mosquita. No finge. Camina 691 metros en un corredor de 125 metros, pierde contra una moneda, y el artefacto es honesto al respecto.

Créditos: [Stonkfly](https://github.com/nftechie/stonkfly) (MIT) por el kernel neuronal, el decoder y el diseño de refuerzo; [MaleCNS v1.0](https://male-cns.janelia.org/) (CC-BY) de Google Research y HHMI Janelia por el conectoma; Mapillary por las imágenes. Nada de esto es investigación en neurociencia ni consejo de inversión. Es un juguete de fin de semana con baselines inusualmente honestos.
