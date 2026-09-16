---
author: "Franco Becvort"
title: "I Gave a Fruit Fly Brain Legs and Sent It Looking for Pastel de Nata"
date: 2026-09-16
description: "I wired the MaleCNS v1.0 male fly connectome into a walker on Lisbon street imagery, raced it against random and greedy baselines, and got an honest null result."
categories: ["Programming talk"]
thumbnail: /uploads/2026-09-16-flywalker/thumbnail.png
---

This post is part of my [Programming talk blog series](/en/categories/programming-talk/).

<!-- TOC -->
  * [The fly brain news, briefly](#the-fly-brain-news-briefly)
  * [Give it legs](#give-it-legs)
  * [What the fly actually sees](#what-the-fly-actually-sees)
  * [Real wiring, engineered everything else](#real-wiring-engineered-everything-else)
  * [The route was harder than the brain](#the-route-was-harder-than-the-brain)
  * [The result](#the-result)
  * [Watch it yourself](#watch-it-yourself)
  * [What I take from this](#what-i-take-from-this)
<!-- TOC -->

## The fly brain news, briefly

In September 2026, Google Research and HHMI Janelia published [MaleCNS v1.0](https://male-cns.janelia.org/), a complete connectome of an adult male fruit fly central nervous system: 166,700 neurons, 25.6 million connections, 124 million synaptic contacts, brain and ventral nerve cord included. Ten years of work, 44 person-years of manual proofreading, published in Cell.

Within days, the internet had it playing Doom, driving around Super Mario 64, and trading crypto.

So I gave it legs.

## Give it legs

[flywalker](https://github.com/franBec/flywalker) is a walker with a connectome for a controller. Three walkers, actually, moving through the same route and logging every step:

- **FLY** asks the brain at every junction. Each candidate street image goes through the mapped R1-R6 and R8 photoreceptors, and spike activity in descending neurons becomes an approach score. The fly moves to the highest scoring candidate.
- **COIN** has no brain. It picks a uniformly random neighbor each step.
- **GREEDY** has no brain. It always picks the candidate that reduces straight line distance to the goal the most.

The baselines are the point. If FLY arrives, COIN tells me whether it beat noise, and GREEDY tells me how far it is from simply knowing the way. A connectome racing nothing proves nothing.

The goal is a pastel de nata. The corridor runs from Santa Justa to Largo do Carmo in Lisbon, 125 meters crow-flies, with Mapillary street level imagery as the visual input. 400 ticks max per walker.

Progress pulses dopamine into 15 PAM11 cells. Regression pulses the two aversive PPL101 cells. There's also an experimental KC to MBON memory rule that may or may not accumulate anything useful. That's part of the experiment.

## What the fly actually sees

Every candidate is rendered as a light background 320x180 frame and fed to the photoreceptors.

The connectome's own visual salience carries no navigation signal. I measured that twice.

- The first version added a brightness veil that made goal-approaching frames brighter. Against the live brain, per-junction correlation was +0.01 and the spike rate drifted by -1.8 Hz across the full boost range. Direction-blind. I reverted it.
- The second version is a goal meter: a dark column whose height encodes how much each candidate reduces distance to the goal. I probed it against the live brain too, and it was also inert: per-junction correlation -0.07 over 32 junctions.

The decisions are still the MaleCNS connectome's, on input that is explicitly engineered rather than retinal.

![three candidate frames the fly saw during the run](/uploads/2026-09-16-flywalker/fly-eye.png)

Three candidate frames from the run. The dark column in the middle is the goal meter.

## Real wiring, engineered everything else

The wiring is real. The connectome weights come from MaleCNS v1.0 and the neural simulation is [Stonkfly](https://github.com/nftechie/stonkfly)'s event driven LIF kernel, vendored unmodified.

The loop that turns frames into spikes is engineered: the decoder is Stonkfly's DNp20 left/right differential with a DNpe017 gate, not a discovery of walk neurons. The dopamine and aversive pulses are engineered reinforcement signals, not modeled pain or pleasure.

The likely outcome was always that FLY statistically resembles COIN. Stonkfly's own validation showed no learned trading skill, and the Doom-fly authors report mostly no-op play. I went in expecting a null result, and I built the experiment so that a null result would still mean something.

## The route was harder than the brain

Finding a route the fly could actually walk was half the project. Mapillary doesn't let you ask for a whole city at once, so I downloaded the corridor in small tiles and glued them together. The photos also carry no official sense of which one comes next on the street, so I built the connections myself. Every photo got linked to its nearest neighbors, and I kept only the piece of the map that connects to the goal.

My first start point was Rossio. It looked great until I checked it. Every possible first step from there actually moved you farther from the nata, so even GREEDY, the walker that always steps toward the goal, could not leave. I moved the start to a corner with a way out (`38.716061,-9.140325`), and GREEDY walked the corridor in 23 steps. That narrowed the remaining problem to the fly's own decisions.

For compute I used an on-demand `e2-highmem-4` on GCP with 16GB of RAM, 4GB of swap, and no inbound ports. Spot VMs were 2-3x cheaper but got preempted every 30-60 minutes, so I switched to on-demand. The full 400-tick run took about 2.6 hours, with 4.6 seconds per consult on average (p95 of 6.1 seconds) and 23.3 seconds per tick. Total cost was around $2-3.

## The result

| Walker | Steps | Distance walked | Final distance to goal | Arrived? |
|--------|-------|-----------------|------------------------|----------|
| FLY | 400 | 691.1m | 106.1m | No |
| COIN | 400 | 776.7m | 117.7m | No |
| GREEDY | 23 | 151.3m | 15.9m | Yes |

GREEDY walked the answer in 23 steps. Neither FLY nor COIN arrived. The start pocket hands the fly a knot of near-equidistant captures, and both walkers burned their 400 ticks doing 690-780m of lateral walking inside it.

FLY ended 11.6m closer to the nata than COIN and was closer on net distance, but only on 117/400 ticks (29%). That's a direction-consistent but statistically weak edge, inseparable from random variation at tick resolution.

The honest read: a real connectome making real decisions on goal-tinted frames still cannot turn visual salience into navigation, on a corridor where GREEDY walks the answer in 23 steps.

![standings at tick 73, with GREEDY already done](/uploads/2026-09-16-flywalker/theater.png)

## Watch it yourself

The run renders into a replay page: a 3D stage where a low-poly fly stands on the capture point it actually walked out of, the Leaflet junction theater with all three trails, the decoded approach scores per candidate, and charts computed from the exact run logs.

{{< youtube 9-GM68zuso8 >}}

Everything is in [github.com/franBec/flywalker](https://github.com/franBec/flywalker). A fresh clone can watch the shipped sample with no oracle, no dataset and no Mapillary token:

```bash
cd sample/run/replay && python3 -m http.server 8080
# open http://localhost:8080
```

There's also a mock mode so the whole pipeline runs on a laptop with deterministic pseudo-scores instead of the real brain.

## What I take from this

A connectome is anatomy. It tells you who is wired to whom, and it says nothing about what any of it means. The moment you connect it to eyes and legs, everything that converts spikes into movement is a decision you made, and those decisions deserve their own baseline.

That's why I like this little fly. It doesn't pretend. It walks 691 meters in a 125 meter corridor, loses to a coin, and the artifact is honest about it.

Credits: [Stonkfly](https://github.com/nftechie/stonkfly) (MIT) for the neural kernel, decoder and reinforcement design; [MaleCNS v1.0](https://male-cns.janelia.org/) (CC-BY) from Google Research and HHMI Janelia for the connectome; Mapillary for the imagery. Nothing here is neuroscience research or investment advice. It's a weekend toy with unusually honest baselines.
