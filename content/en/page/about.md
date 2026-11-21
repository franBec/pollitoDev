---
author: "Franco Becvort"
title: "About Me"
date: 2022-10-29
lastmod: 2026-11-21
description: "Argentinian software engineer. From San Juan to San Luis, a UK detour, Lisbon, and back. Java, cloud, and application security."
categories: ["Personal stuff"]
type: about
---

Hi, I'm Franco Becvort. Online I go by **Pollito**.

I was born in San Juan, Argentina, and I'm a backend engineer. Most of my career has been Java and Spring Boot, usually around banking, identity, and payments. These days I work at [Devsu](https://devsu.com/) on the backend of a banking and investment-funds platform, and on the security review that came with it.

This page is the longer version of the short bio: where I come from, what I've worked on, and the detours that got me here.

## San Juan, 1999

For my first birthday my mom dressed me in yellow. My family immediately decided I looked like a small chick, and the nickname stuck. **Pollito** has followed me ever since.

I grew up in San Juan city and lived there until February 2017. I went to Colegio Central Universitario "Mariano Moreno", a high school attached to the National University of San Juan, and finished as a *Bachiller en Ciencias Naturales*. It sounds fancy in Spanish. It is a high school diploma.

As a teenager I was more curious about how things worked than about following the expected path. I wanted to know how software cracking worked. I spent hours looking at Minecraft contraptions even though I barely played Minecraft. I loved Team Fortress 2 and thought, naively, that one day I could work at Valve. I played guitar through Guitar Rig and fell into a rabbit hole of pedals and effects. I was good at maths, so computer engineering looked like a reasonable excuse to keep pulling on all those threads.

{{< figure src="images/about/san-juan-2017.jpg" alt="An empty street in San Juan at dawn" caption="Esquina Colorada, San Juan. Christmas 2017, 6 a.m." class="narrow" >}}

## San Luis, 2017

In February 2017 I moved to San Luis for the university admission course. I started Computer Engineering at the Universidad Nacional de San Luis in 2018.

University was free. Living was not. I have a lot of memories of doing the maths at the end of the month. In October 2017 I wrote down my fixed costs on a piece of paper: rent, internet, food. Then I listed everything that came on top: electricity, weekend food, breakfast, personal hygiene, cleaning products. I kept that paper.

{{< media-grid
  "images/about/expenses-2017.jpg;;A handwritten budget on lined paper;;My October 2017 budget. The fixed costs are at the top, and everything else is the part that made the month interesting."
  "images/about/unsl-2018.jpg;;Franco with pink hair on the university stairs;;Pink hair, UNSL stairs, May 2018.;;1400x1050 center"
>}}

A friend of mine played guitar at a restaurant in Villa Mercedes and got paid with a bag of sandwich crusts. It weighed around five kilos. We ate that for a weekend with mate and coffee. It sounds sad. Looking back, it is one of my favourite stories.

I dropped out in 2021. I was already working full time at runaID, and eating and renting were still not free. The degree stayed unfinished, but the years there were not wasted: I learned the foundations I still use, and I met people who are still friends.

## Government portals and medical receipts

In September 2021 I got my first formal job at [runaID](https://www.runaid.com.ar/), a small software company in La Punta, San Luis. My first salary felt unreal. I remember cooking a plate of noodles the night before my first day, smiling from ear to ear, because for the first time in months I was going to have dinner and still have money for the rest of the month. I wrote about that in [my first post about runaID]({{< relref "blog/2022-11-06-my-time-in-runaid.md" >}}).

I started with Groovy Server Pages, JavaScript, jQuery, Bootstrap, Tomcat, and SQL Server. Most of the work was for government clients in San Luis: SIGEM, the city government portal where people can run procedures and queries online; an internal purchasing and contracting system; and DOSEP, the provincial health service.

{{< media-grid
  "images/about/sigem.jpg;;SIGEM municipal portal homepage;;SIGEM, the San Luis city government portal. One of the first products I worked on."
  "images/about/dosep.png;;DOSEP health service homepage;;DOSEP, the provincial health service. We also worked on the migration of its health records."
>}}

{{< figure src="images/about/compras.png" alt="Internal purchasing system with a development watermark" caption="The internal purchasing and contracting system. This is a development build, hence the watermark." >}}

After the Groovy work I moved to a Next.js team and built an auditing dashboard from scratch to process and verify large volumes of medical receipts. It was an internal tool for FACAF, so we gave it Star Wars branding because we could. It processed receipts, ran scheduled jobs, exposed secure endpoints for validation and insertion, and had the interfaces the auditors used every day.

Alongside my last years at university and my first months at runaID, I also worked at the Faculty of Physical, Mathematical and Natural Sciences at UNSL. I was an admission tutor and student mentor, and I joined a university project about internet safety. We built **Riesgos en la Red**, a site with material for students and teachers, and gave talks at schools. The faculty still has [a 2021 thank-you note that lists me as a tutor](https://web.archive.org/web/20260416102028/https://fmn.unsl.edu.ar/curso-de-ingreso-2021-agradecimiento-a-docentes-y-tutores-del-curso-comprension-de-texto/).

{{< figure src="images/about/riesgo-en-la-red.jpg" alt="Riesgos en la Red website homepage" caption="Riesgos en la Red, the internet-safety site I worked on at UNSL." >}}

## QR payments

In November 2022 I joined Applica Mobile to work on **Yacaré**, the wallet behind Argentina's first QR-based payment system. I standardized the backend REST APIs for the payment flows.

Yacaré was later acquired by Fiserv. [La Nación covered the acquisition](https://www.lanacion.com.ar/economia/una-compania-internacional-compro-yacare-la-primera-empresa-argentina-en-implementar-el-qr-nid05012023/) and called it the first Argentine company to implement QR payments. I was there for the tail end of that run.

{{< figure src="images/about/yacare-web.png" alt="Yacaré website homepage" caption="The Yacaré site, captured while I was working on it." >}}

{{< figure src="images/about/yacare-qr.jpg" alt="A Yacaré QR sign in a supermarket" caption="A Yacaré QR sign in a supermarket in Posadas, Misiones. January 2023." crop="2500x3300 center" class="narrow" >}}

## Banking, identity, and a UK detour

In May 2023 I joined Devsu. I spent the next two and a half years on the customer security and onboarding team of Ecuador's largest private bank. We migrated every customer identity from WSO2 Identity Server to Auth0, on authentication flows serving roughly 600,000 requests per day. The job was mostly making sure nothing broke: identity providers across a heterogeneous set of Java and Spring Boot services, spread over Google Cloud and Azure.

Devsu lets me work from wherever I want as long as the client is happy. In April 2023 I went to the UK for six months, and I started at Devsu from a flat in Cheltenham. I worked from there, traveled around England and Scotland, and wrote a [photo dump about the whole trip]({{< relref "blog/2023-11-04-six-months-in-the-uk.md" >}}).

{{< media-grid
  "images/about/uk-selfie-2023.jpg;;Franco taking a mirror selfie with a duck on his headphones;;Five months without a haircut, with a duck on my headphones. Cheltenham, 2023.;;2667x4000 center"
  "images/about/uk-pittville-2023.jpg;;Sunset over Pittville Park in Cheltenham;;Pittville Park, Cheltenham. This sunset was my phone wallpaper for a long time.;;1200x1800 center"
>}}

## Lisbon, Velx, and a detour into AI

In October 2023 I moved to Lisbon. A friend of a friend had a spare room for a month; that became the start of my Lisbon era. I've been there for three years.

In November 2025 I moved to Devsu's AI team as an applied AI engineer and became a core contributor to **Velx**, an AI platform that analyzes, documents, and modernizes large codebases. I built MCP tools for planning and code review, improved the distillation engine with context-aware skipping and cost metrics, built an interactive C4/Mermaid diagram editor, and wrote reproducible LLM evaluation benchmarks.

{{< figure src="images/about/gartner-2026.png" alt="Gartner Magic Quadrant press graphic" caption="Devsu was recognized in Gartner's 2026 Magic Quadrant for Technical Debt Management Tools. I worked on Velx during that run." href="https://devsu.com/resources-center/velx-gartner-magic-quadrant-2026" >}}

{{< figure src="images/portrait-sunset.jpg" alt="Franco at sunset in Lisbon" caption="Lisbon, 2026." class="narrow" >}}

## Back to banking

In July 2026 I moved back to the backend side. I'm one of two backend developers on the web portal of an Ecuadorian fiduciary and investment-funds firm: a backend-for-frontend with more than 70 endpoints over ten core microservices. I also led the security review of the core platform and the portal, then shipped the fixes: per-resource ownership checks, OTP and biometric flows bound to the caller's token, locked-down Actuator endpoints, and a pull-request pipeline with gitleaks and Trivy.

The stack is Java 25, Spring Boot 4.1, Spring Modulith, Spring Security, WebClient, OpenAPI Generator, JUnit, Caffeine, Google Cloud (GKE, Cloud Build, Secret Manager), Helm, and Docker. I also change the core services when the portal or the mobile app needs it.

## Back to San Juan

At the start of 2027 I'm moving back to Argentina. San Juan, my mom's town, is the plan. I'll keep working remotely; Devsu has been remote-friendly from the beginning, and I don't see a reason to give that up. I'm not ruling out a local job, but it will be hard to beat the comfort I have now.

{{< figure src="images/about/san-juan-sunset-2022.jpg" alt="Sunset over a park in San Juan" caption="San Juan, December 2022." crop="1921x760 top" >}}

## Education

**Universidad Nacional de San Luis** — 2018 to 2021

Computer Engineering. Coursework completed, degree not finished. GPA 7.58/10. I dropped out when I got a full-time job at runaID.

**Colegio Central Universitario "Mariano Moreno" (UNSJ)** — 2011 to 2017

Bachiller en Ciencias Naturales. A high school diploma, not a university degree, even if the name sounds fancy.

## Languages

- **Spanish** — native
- **English** — C2 Proficient (EF SET)
- **Portuguese** — conversational

## Certifications

{{< certifications >}}

## Side projects

**[Pollito's Opinion on Spring Boot Development](https://springboot.pollito.tech/)** — a hands-on guide to shipping Spring Boot services in Java, Kotlin, and Groovy, from Spring Initializr to CI/CD on a self-hosted VPS with Coolify, Docker, PostgreSQL, and full observability.

**[pollito.dev](https://pollito.dev/)** — this blog. I write about software engineering, cloud infrastructure, and developer culture. Every post exists in English and Spanish.

**[nixos-dotfiles](https://github.com/franBec/nixos-dotfiles)** — my daily-driver NixOS setup as code: fully declarative, version-controlled, and reproducible, built with Nix flakes and Home Manager.

## Off the clock

When I'm not working I'm usually tinkering with my NixOS setup, playing guitar, reading, or walking around whatever city I'm in. I also own a duck mask, which is a sentence I never expected to write.

{{< figure src="images/about/duck.jpg" alt="Franco wearing a duck mask in a shop" caption="Off the clock." class="small" >}}

You can find me on [GitHub](https://github.com/franBec) and [LinkedIn](https://www.linkedin.com/in/franco-becvort/).
