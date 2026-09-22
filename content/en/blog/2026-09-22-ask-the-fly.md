---
author: "Franco Becvort"
title: "I Put a Fruit Fly Brain Behind MCP Tools So My Agent Could Ask It for Trading Advice"
date: 2026-09-22
description: "fly-mcp: the MaleCNS v1.0 connectome exposed as MCP tools on a disposable GCP VM, one real consult from opencode, and a mostly-HOLD oracle that is honest about being a comedy oracle."
categories: ["Programming talk"]
thumbnail: /uploads/2026-09-22-ask-the-fly/thumbnail.jpg
---

This post is part of my [Programming talk blog series](/en/categories/programming-talk/). Last week I gave the fly legs and sent it looking for a pastel de nata. This week I gave it a phone line.

<!-- TOC -->
  * [First, what is MCP?](#first-what-is-mcp)
  * [Why a connectome is a fun thing to plug into it](#why-a-connectome-is-a-fun-thing-to-plug-into-it)
  * [The stack](#the-stack)
  * [No fly thoughts happened](#no-fly-thoughts-happened)
  * [Deploying the brain to a disposable VM](#deploying-the-brain-to-a-disposable-vm)
  * [Connecting the agent](#connecting-the-agent)
  * [Asking the fly if AI will replace developers](#asking-the-fly-if-ai-will-replace-developers)
  * [Tearing it all down](#tearing-it-all-down)
  * [What I take from this](#what-i-take-from-this)
<!-- TOC -->

## First, what is MCP?

[MCP](https://github.com/franBec/fly-mcp) stands for Model Context Protocol. It's an open protocol that lets AI agents call external tools over a standard interface. Before MCP, every agent had its own way of gluing in tools: custom plugins, hand-rolled function calling schemas, whatever the vendor of the week invented. With MCP, a server exposes tools, resources, and prompts, and any client that speaks the protocol can discover and call them. Think REST, but the consumer is an LLM and the discovery is built in.

Two transports matter in practice. stdio means the agent spawns your server as a local subprocess and talks over pipes. It's the easy local option. The other one is remote HTTP: your server runs somewhere else, the agent connects over the network. I went remote-only, with Streamable-HTTP at a single `POST /mcp` endpoint. No stdio at all. If the point is that any agent, anywhere, can consult my fly, the brain has to have a URL.

So the game becomes: put something behind MCP tools that has no business being behind MCP tools.

## Why a connectome is a fun thing to plug into it

In September 2026, Google Research and HHMI Janelia published MaleCNS v1.0, the complete connectome of an adult male fruit fly: 166,700 neurons, 25.6 million directed edges, 124 million synaptic contacts. Anatomically complete wiring diagram, brain included.

Most people wire that thing into games or demos that run on one machine. I wanted mine to sit behind a protocol so an AI agent in a chat window could ask it questions and get a verdict back. The agent doesn't parse spikes. It gets a clean tool reply: BUY, SELL, or HOLD, plus stats. The fly's "opinion" arrives like any other tool result, right next to a file read or a shell command.

The comedy writes itself: I asked a fruit fly brain whether AI will replace developers, through a protocol designed for enterprise agent integrations, and it answered from a VM that existed for about an hour.

## The stack

Everything is in [github.com/franBec/fly-mcp](https://github.com/franBec/fly-mcp):

- **MCP server**: Java 25, Spring Boot 4.1.1, Spring AI 2.0.1. The MCP server boot starter does most of the work; tools are annotated methods with `@McpTool`.
- **Neural simulation**: [Stonkfly](https://github.com/nftechie/stonkfly) (MIT), vendored at a pinned commit. fly-mcp imports only `stonkfly.neural`.
- **Oracle**: a FastAPI sidecar wrapping Stonkfly. `FLY_BRAIN=mock` gives a deterministic laptop mode with no dataset. Real mode loads the actual connectome.
- **Surface**: tools `ask_fly`, `reward_fly`, `punish_fly`, `fly_vitals`; resource `fly://vitals`; prompt `second-opinion`.

`ask_fly` renders your text as a 320x180 frame with a light background (dark frames barely activate the connectome), feeds it through the photoreceptor mapping, and decodes spikes. The verdict is Stonkfly's DNp20 left/right spike differential with a DNpe017 gate, mapped to BUY/SELL/HOLD. Every tool description carries the same line: engineered readout on spike data, comedy oracle, not intelligence.

## No fly thoughts happened

None of this is cognition. The connectome weights are anatomy, not a living fly. The verdict is an engineered mapping of spike rates, not a discovered decision circuit. `reward_fly` and `punish_fly` queue engineered dopamine and aversive pulses, not modeled pleasure or pain. The fly does not think, know, or predict anything.

Which is also why the comedy lands. The expected outcome of any consult is a HOLD. That's not a bug, that's the honest baseline. My trading advisor says HOLD to almost everything. Honestly, that makes it more qualified than most of the finance internet.

## Deploying the brain to a disposable VM

The dataset and kernel want 16GB of RAM and a first boot that takes 10 to 30 minutes. My laptop has neither the patience nor the RAM. So: a disposable GCP VM, provisioned with Terraform in `infra/`, an on-demand `e2-highmem-4` in `europe-west4`, ephemeral IP, firewall allowing port 8080 only from my source CIDR. Unauthenticated by design, alive for minutes, destroyed after. Total cost: under $1.

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

Terraform prints the MCP URL as an output, which is a small thing that made me unreasonably happy.

The VM installs Docker, clones the public repo, writes `.env`, and runs compose. Four services: `prepare` (dataset download and graph build), `oracle` (the FastAPI sidecar), `warmup` (one throwaway consult so the connectome and LIF kernel load), and `mcp` (depends on warmup success). The MCP server doesn't start until the warmup consult finishes, so the first real request never pays the cold-start cost.

Then the waiting loop. Block until the warmup container prints its one line and exits:

```bash
until gcloud compute ssh fly-mcp --zone=europe-west4-a --command='sudo docker compose -f /opt/fly-mcp/compose.yml logs warmup 2>/dev/null | grep -q "warmup ok"'; do sleep 60; done; echo READY
```

```
READY
```

Compose started prepare at 12:13:18 UTC and the warmup consult completed on the real connectome at 12:15:07. Under two minutes, much better than the 10 to 30 minutes I was braced for.

Before letting an agent anywhere near it, one pre-flight consult straight from the MCP inspector:

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

That `brain: real` line is the whole point. The consult ran on the actual connectome, on a VM in Belgium, over a protocol built for agents.

## Connecting the agent

Register the server in opencode, my agent client:

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

![opencode TUI MCPs dialog showing fly-mcp connected](/uploads/2026-09-22-ask-the-fly/01-opencode-mcps-connected.png)

One flag, one green checkmark. No plugin, no SDK, no custom integration code on the agent side. The client discovered the four tools, the resource, and the prompt on its own.

## Asking the fly if AI will replace developers

Here the run gets a wrinkle I decided to keep in the story. The timeline:

| Time (UTC) | Event |
|------|-------|
| 12:13:18 | prepare starts on the VM |
| 12:15:07 | warmup consult completes on the real connectome |
| 12:18:29 | pre-flight inspector consult returns BUY and `brain: real` |
| 12:24:31 | first TUI attempt: opencode cancels the request, no result shown |
| 12:27:25 | retry starts |
| 12:27:33.473 | oracle logs `POST /consult 200` for consult #4 |
| 12:27:33.521 | opencode records the completed tool result |

The first attempt failed. opencode cancelled the slow call after the oracle had already completed it, so nothing showed up in the TUI. That's a real property of this stack: multi-second consults can end that way, because agents have their own timeouts and don't like waiting eight seconds for a fruit fly's financial opinion. The retry worked. I could have cropped the timeline to hide it, but the cancelled attempt is the more honest artifact, and honesty is the whole brand of this fly.

The question and verdict from the retry:

![The ask_fly call and the HOLD verdict in the opencode TUI](/uploads/2026-09-22-ask-the-fly/02-ask-fly-verdict.png)

The completed record as stored in opencode's session database:

```json
{
  "tool": "fly-mcp_ask_fly",
  "input":  { "text": "WIll AI replace developers by the end of the month?" },
  "output": "verdict: HOLD (gate closed)\nspikes: left=40.000Hz right=46.000Hz diff=+6.000Hz gate=0 approach=86.000Hz\nbrain: real | consult #4\nreadout: engineered DNp20 left/right differential on MaleCNS v1.0 spike data; comedy oracle, not intelligence.",
  "duration_ms": 8160
}
```

Read that. Real verdict: **HOLD**. Gate closed, left 40.000Hz, right 46.000Hz, differential +6.000Hz, approach 86.000Hz, consult #4 on the real connectome, 8160ms end to end. And the honesty line right there in the tool output, unremovable: engineered readout on spike data, comedy oracle, not intelligence.

(Yes, the typo "WIll" in the input is real. That's what I actually typed at 12:27 on a Tuesday. I'm keeping it as evidence.)

So the fly's answer to "will AI replace developers by the end of the month?" is: hold your position. Neither side is winning, the gate is closed, come back later. I have never received better career advice, and it came from 166,700 neurons that cannot receive career advice.

The VM logs prove the request arrived, but the question becomes a PNG inside the MCP server and the oracle logs neither frames nor responses. The timestamp correlation is what ties both sides together: the oracle logged `POST /consult 200` at 12:27:33.473, and the client record completed 48 milliseconds later, at 12:27:33.521. Same interaction, two independent records.

## Tearing it all down

Exposure window closed, everything goes away:

```bash
terraform destroy
```

```
Destroy complete! Resources: 2 destroyed.
```

That's my favorite line of output in the whole project. Zero resources left, no dangling VM burning cents somewhere, no orphaned firewall rule. The entire brain existed for under an hour and cost less than a coffee.

## What I take from this

MCP makes "expose a weird thing as a tool" almost embarrassingly easy. A few annotated Spring methods, a FastAPI sidecar, and an agent in a chat window is consulting a dead fly's connectome about the job market. The protocol part took an afternoon; the honest part, deciding what the verdict means and saying so loudly in every tool description, took longer.

And the verdicts stay HOLD. Almost always. That's the honest result of an engineered readout on spike data, and it's also the joke: my most reliable financial advisor says "no strong signal, check back later" to everything, including my own job security.

Everything is in [github.com/franBec/fly-mcp](https://github.com/franBec/fly-mcp). `FLY_BRAIN=mock` runs the whole stack on a laptop with no dataset and no GCP.

Credits: [Stonkfly](https://github.com/nftechie/stonkfly) (MIT) for the neural kernel, decoder and reinforcement design, vendored at a pinned commit; [MaleCNS v1.0](https://male-cns.janelia.org/) from Google Research and HHMI Janelia for the connectome. Nothing here is neuroscience research or investment advice. It's a comedy oracle that says HOLD.
