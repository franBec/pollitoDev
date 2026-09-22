---
author: "Franco Becvort"
title: "Puse un cerebro de mosca de la fruta detrás de herramientas MCP para que mi agente le pidiera consejo bursátil"
date: 2026-09-22
description: "fly-mcp: el conectoma MaleCNS v1.0 expuesto como herramientas MCP en una VM desechable de GCP, una consulta real desde opencode, y un oráculo mayoritariamente HOLD que es honesto sobre ser un oráculo cómico."
categories: ["Programming talk"]
thumbnail: /uploads/2026-09-22-ask-the-fly/thumbnail.jpg
---

Este post es parte de mi [serie de blogs sobre Programming talk](/es/categories/programming-talk/). La semana pasada le di patas a la mosca y la mandé a buscar un pastel de nata. Esta semana le di una conexión.

<!-- TOC -->
  * [Primero, qué es MCP](#primero-qué-es-mcp)
  * [Por qué un conectoma es un objetivo divertido para enchufar ahí](#por-qué-un-conectoma-es-un-objetivo-divertido-para-enchufar-ahí)
  * [El stack](#el-stack)
  * [Ninguna mosca produjo un pensamiento](#ninguna-mosca-produjo-un-pensamiento)
  * [Desplegar el cerebro en una VM desechable](#desplegar-el-cerebro-en-una-vm-desechable)
  * [Conectar el agente](#conectar-el-agente)
  * [Preguntarle a la mosca si la IA va a reemplazar developers](#preguntarle-a-la-mosca-si-la-ia-va-a-reemplazar-developers)
  * [Destruir todo](#destruir-todo)
  * [Qué me llevo de esto](#qué-me-llevo-de-esto)
<!-- TOC -->

## Primero, qué es MCP

[MCP](https://github.com/franBec/fly-mcp) significa Model Context Protocol. Es un protocolo abierto que le permite a agentes de IA llamar herramientas externas por una interfaz estándar. Antes de MCP, cada agente tenía su propia forma de enchufar herramientas: plugins custom, schemas de function calling hechos a mano, lo que inventara el vendor de turno. Con MCP, un servidor expone tools, resources y prompts, y cualquier cliente que hable el protocolo puede descubrirlos y llamarlos. Pensalo como REST, pero el consumidor es un LLM y el discovery viene incluido.

Dos transports importan en la práctica. stdio significa que el agente arranca tu servidor como un subprocesso local y hablan por pipes. Es la opción local fácil. La otra es HTTP remoto: tu servidor corre en otro lado y el agente se conecta por red. Yo fui solo remoto, con Streamable-HTTP en un único endpoint `POST /mcp`. Nada de stdio. Si la gracia es que cualquier agente, en cualquier lado, pueda consultar a mi mosca, el cerebro tiene que tener una URL.

Así que el juego se vuelve: poner detrás de herramientas MCP algo que no tiene ningún negocio estar ahí.

## Por qué un conectoma es un objetivo divertido para enchufar ahí

En septiembre de 2026, Google Research y HHMI Janelia publicaron MaleCNS v1.0, el conectoma completo de una mosca de la fruta macho adulta: 166.700 neuronas, 25,6 millones de aristas dirigidas, 124 millones de contactos sinápticos. Diagrama de cableado anatómicamente completo, cerebro incluido.

La mayoría cablea esa cosa en juegos o demos que corren en una sola máquina. Yo quería que la mía quedara detrás de un protocolo, para que un agente de IA en una ventana de chat le pudiera hacer preguntas y recibir un veredicto. El agente no parsea spikes. Recibe una respuesta de tool limpia: BUY, SELL o HOLD, más estadísticas. La "opinión" de la mosca llega como cualquier otro resultado de tool, al lado de una lectura de archivo o un comando de shell.

La comedia se escribe sola: le pregunté a un cerebro de mosca de la fruta si la IA va a reemplazar developers, por un protocolo diseñado para integraciones de agentes empresariales, y contestó desde una VM que existió durante una hora.

## El stack

Todo está en [github.com/franBec/fly-mcp](https://github.com/franBec/fly-mcp):

- **Servidor MCP**: Java 25, Spring Boot 4.1.1, Spring AI 2.0.1. El boot starter de MCP hace la mayor parte del trabajo; las tools son métodos anotados con `@McpTool`.
- **Simulación neuronal**: [Stonkfly](https://github.com/nftechie/stonkfly) (MIT), incluido en un commit fijado. fly-mcp importa solo `stonkfly.neural`.
- **Oracle**: un sidecar en FastAPI que envuelve a Stonkfly. `FLY_BRAIN=mock` da un modo determinista de laptop sin dataset. El modo real carga el conectoma de verdad.
- **Superficie**: tools `ask_fly`, `reward_fly`, `punish_fly`, `fly_vitals`; resource `fly://vitals`; prompt `second-opinion`.

`ask_fly` renderiza tu texto como un frame de 320x180 con fondo claro (los frames oscuros apenas activan el conectoma), lo pasa por el mapeo de fotorreceptores y decodifica spikes. El veredicto es el diferencial izquierda/derecha DNp20 de Stonkfly con una compuerta DNpe017, mapeado a BUY/SELL/HOLD. Cada descripción de tool lleva la misma línea: engineered readout on spike data, comedy oracle, not intelligence.

## Ninguna mosca produjo un pensamiento

Nada de esto es cognición. Los pesos del conectoma son anatomía, no una mosca viva. El veredicto es un mapeo diseñado de tasas de spikes, no un circuito de decisión descubierto. `reward_fly` y `punish_fly` encolan pulsos de dopamina y aversivos diseñados, no placer o dolor modelado. La mosca no piensa, no sabe ni predice nada.

Lo cual también es por qué la comedia funciona. El resultado esperado de cualquier consulta es un HOLD. No es un bug, es el baseline honesto. Mi asesor de inversiones contesta HOLD a casi todo. Sinceramente, eso lo hace más calificado que la mayoría de internet financiero.

## Desplegar el cerebro en una VM desechable

El dataset y el kernel quieren 16GB de RAM y un primer boot que tarda de 10 a 30 minutos. Mi laptop no tiene ni la paciencia ni la RAM. Así que: una VM desechable de GCP, aprovisionada con Terraform en `infra/`, una `e2-highmem-4` on-demand en `europe-west4`, IP efímera, firewall que solo deja entrar al puerto 8080 desde mi CIDR. Sin autenticación a propósito, viva por minutos, destruida al final. Costo total: menos de $1.

```bash
cd infra
terraform init
terraform apply -var="allowed_source_cidr=$(curl -4 -s ifconfig.me)/32"
```

```
Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

instance_ip          = "<ephemeral-ip>"
mcp_url              = "http://<ephemeral-ip>:8080/mcp"
opencode_add_command = "opencode mcp add fly-mcp --url http://<ephemeral-ip>:8080/mcp"
```

Terraform imprime la URL de MCP como output, que es una cosita que me hizo una felicidad irrazonable.

La VM instala Docker, clona el repo público, escribe `.env` y corre compose. Cuatro servicios: `prepare` (descarga del dataset y construcción del grafo), `oracle` (el sidecar de FastAPI), `warmup` (una consulta descartable para que el conectoma y el kernel LIF se carguen), y `mcp` (depende de que el warmup salga bien). El servidor MCP no arranca hasta que termina la consulta de warmup, así que la primera request real nunca paga el costo de arranque en frío.

Después, el loop de espera. Bloquear hasta que el contenedor de warmup imprima su única línea y salga:

```bash
until gcloud compute ssh fly-mcp --zone=europe-west4-a --command='sudo docker compose -f /opt/fly-mcp/compose.yml logs warmup 2>/dev/null | grep -q "warmup ok"'; do sleep 60; done; echo READY
```

```
READY
```

Compose arrancó prepare a las 12:13:18 UTC y la consulta de warmup terminó sobre el conectoma real a las 12:15:07. Menos de dos minutos, mucho mejor que los 10 a 30 minutos para los que estaba preparado.

Antes de dejar que un agente se le acerque, una consulta pre-flight directo desde el inspector de MCP:

```bash
npx -y @modelcontextprotocol/inspector --cli http://<ephemeral-ip>:8080/mcp --method tools/call --tool-name ask_fly --tool-arg 'text=Pre-flight check'
```

```json
{
  "content": [
    {
      "type": "text",
      "text": "verdict: BUY (gate open)\nspikes: left=30.000Hz right=42.000Hz diff=+12.000Hz gate=1 approach=72.000Hz\nbrain: real | consult #2\nreadout: engineered DNp20 left/right differential on MaleCNS v1.0 spike data; comedy oracle, not intelligence."
    }
  ],
  "isError": false
}
```

Esa línea `brain: real` es todo el punto. La consulta corrió sobre el conectoma real, en una VM en Bélgica, por un protocolo construido para agentes.

## Conectar el agente

Registrar el servidor en opencode, mi cliente de agente:

```bash
opencode mcp add fly-mcp --url "http://<ephemeral-ip>:8080/mcp"
opencode mcp list
```

```
◆  MCP server "fly-mcp" added to ~/.config/opencode/opencode.jsonc
```

```
┌  MCP Servers
│
●  ✓ fly-mcp connected
│      http://<ephemeral-ip>:8080/mcp
│
└  1 server(s)
```

![diálogo de MCPs de la TUI de opencode mostrando fly-mcp conectado](/uploads/2026-09-22-ask-the-fly/01-opencode-mcps-connected.png)

Un flag, un tilde verde. Sin plugin, sin SDK, sin código de integración custom del lado del agente. El cliente descubrió solo las cuatro tools, el resource y el prompt.

## Preguntarle a la mosca si la IA va a reemplazar developers

Acá la corrida tiene una arruga que decidí dejar en la historia. La línea de tiempo:

| Hora (UTC) | Evento |
|------|-------|
| 12:13:18 | prepare arranca en la VM |
| 12:15:07 | la consulta de warmup termina sobre el conectoma real |
| 12:18:29 | la consulta pre-flight del inspector devuelve BUY y `brain: real` |
| 12:24:31 | primer intento en la TUI: opencode cancela la request, no se muestra ningún resultado |
| 12:27:25 | arranca el reintento |
| 12:27:33.473 | el oracle loguea `POST /consult 200` para la consulta #4 |
| 12:27:33.521 | opencode registra el resultado de tool completo |

El primer intento falló. opencode canceló la llamada lenta después de que el oracle ya la había terminado, así que nada apareció en la TUI. Esa es una propiedad real de este stack: consultas de varios segundos pueden terminar así, porque los agentes tienen sus propios timeouts y no les gusta esperar ocho segundos por la opinión financiera de una mosca de la fruta. El reintento funcionó. Pude haber recortado la línea de tiempo para esconderlo, pero el intento cancelado es el artefacto más honesto, y la honestidad es toda la marca de esta mosca.

La pregunta y el veredicto del reintento:

![la llamada a ask_fly y el veredicto HOLD en la TUI de opencode](/uploads/2026-09-22-ask-the-fly/02-ask-fly-verdict.png)

El registro completo tal como quedó guardado en la base de sesiones de opencode:

```json
{
  "tool": "fly-mcp_ask_fly",
  "input":  { "text": "WIll AI replace developers by the end of the month?" },
  "output": "verdict: HOLD (gate closed)\nspikes: left=40.000Hz right=46.000Hz diff=+6.000Hz gate=0 approach=86.000Hz\nbrain: real | consult #4\nreadout: engineered DNp20 left/right differential on MaleCNS v1.0 spike data; comedy oracle, not intelligence.",
  "duration_ms": 8160
}
```

Leé eso. Veredicto real: **HOLD**. Compuerta cerrada, 40.000Hz a la izquierda, 46.000Hz a la derecha, diferencial de +6.000Hz, approach de 86.000Hz, consulta #4 sobre el conectoma real, 8160ms de punta a punta. Y la línea de honestidad ahí mismo en el output de la tool, inremovible: engineered readout on spike data, comedy oracle, not intelligence.

(Sí, el typo "WIll" en el input es real. Eso escribí a las 12:27 de un martes. Lo dejo como evidencia.)

O sea que la respuesta de la mosca a "¿va la IA a reemplazar developers antes de fin de mes?" es: mantené tu posición. Ninguno de los dos lados está ganando, la compuerta está cerrada, volvé más tarde. Nunca recibí mejor consejo laboral, y vino de 166.700 neuronas que no pueden recibir consejos laborales.

Los logs de la VM prueban que la request llegó, pero la pregunta se convierte en un PNG adentro del servidor MCP y el oracle no loguea ni frames ni respuestas. La correlación de timestamps es lo que ata a los dos lados: el oracle logueó `POST /consult 200` a las 12:27:33.473, y el registro del cliente completó 48 milisegundos después, a las 12:27:33.521. Misma interacción, dos registros independientes.

## Destruir todo

Ventana de exposición cerrada, todo desaparece:

```bash
terraform destroy
```

```
Destroy complete! Resources: 2 destroyed.
```

Esa es mi línea de output favorita de todo el proyecto. Cero recursos restantes, ninguna VM colgando quemando centavos, ninguna regla de firewall huérfana. El cerebro entero existió menos de una hora y costó menos que un café.

## Qué me llevo de esto

MCP hace que "exponer una cosa rara como tool" sea casi vergonzosamente fácil. Unos métodos de Spring anotados, un sidecar de FastAPI, y un agente en una ventana de chat le está consultando el conectoma a una mosca muerta sobre el mercado laboral. La parte del protocolo me llevó una tarde; la parte honesta, decidir qué significa el veredicto y decirlo fuerte en cada descripción de tool, me llevó más.

Y los veredictos siguen en HOLD. Casi siempre. Ese es el resultado honesto de un readout diseñado sobre datos de spikes, y también es el chiste: mi asesor financiero más confiable le dice "sin señal fuerte, volvé más tarde" a todo, incluida mi propia seguridad laboral.

Todo está en [github.com/franBec/fly-mcp](https://github.com/franBec/fly-mcp). `FLY_BRAIN=mock` corre todo el stack en una laptop sin dataset y sin GCP.

Créditos: [Stonkfly](https://github.com/nftechie/stonkfly) (MIT) por el kernel neuronal, el decoder y el diseño de refuerzo, incluido en un commit fijado; [MaleCNS v1.0](https://male-cns.janelia.org/) de Google Research y HHMI Janelia por el conectoma. Nada de esto es investigación en neurociencia ni consejo de inversión. Es un oráculo cómico que dice HOLD.
