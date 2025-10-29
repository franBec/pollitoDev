---
author: "Franco Becvort"
title: "Large Software Projects: Choosing the Right Tools"
date: 2025-10-10
description: "How to Pick a Framework When You're Unsure"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-10-large-software-projects/3d_low_poly_chicken.png
---

This post is part of my [Large Software Projects blog series](/en/categories/large-software-projects/).

<!-- TOC -->
  * [What Exactly Are We Building?](#what-exactly-are-we-building)
  * [High-Level Game-Plan](#high-level-game-plan)
  * [How to Pick a Framework When You&rsquo;re Unsure](#how-to-pick-a-framework-when-youre-unsure)
  * [Why Am I Picking React?](#why-am-i-picking-react)
  * [Why Am I Picking Next.js?](#why-am-i-picking-nextjs)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

In the [previous post](/en/blog/2025-10-09-large-software-projects), I shared my philosophy on building large software projects. Now it's time to put those principles into practice.

## What Exactly Are We Building?

Let me give you some context about [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/) - the original system that inspired this project.

**SIGEM** (Sistema de Gestión Municipal) was a comprehensive municipal management platform I worked on for the city of San Luis - Argentina. Think of it as the digital backbone for running a small city:

- **Citizen portal**: Where residents can create accounts, apply for permits, pay bills, and access public services
- **Administrative backend**: Where city employees process applications, manage records, and handle day-to-day operations
- **Financial modules**: Utility billing, payment processing, revenue tracking
- **Document management**: Storage and retrieval of permits, applications, and official records
- **Reporting dashboards**: Analytics and insights for city management

The original is built with [Groovy Server Pages](https://gsp.grails.org/latest/guide/index.html), [jQuery](https://jquery.com/), and [Bootstrap](https://getbootstrap.com/) - which was actually a solid choice back in its day! But technology has evolved, and so has my thinking about software.

**A quick note before we continue:** This project isn't a roast or criticism of the original SIGEM. Far from it. I had an incredible time working there, learned an immense amount, and I'm still in touch with the current development team. That project holds a special place in my heart—it shaped me into the developer I am today. Years later, I still think about it fondly. What we're doing here is exploring how I'd approach a similar challenge *today*, with different tools and lessons learned, not diminishing what came before.

Our goal isn't to recreate SIGEM exactly, but to rebuild that functionality with today's tooling without re-creating yesterday's complexity.

## High-Level Game-Plan

1. **Monolith-first**  
   One repo, one CI pipeline, one deploy target.

2. **Vertical slices > onions > layers**  
   Each feature (e.g. "Renew a Driver Licence") ships start-to-finish: DB schema, API handler, UI. Less cross-team ping-pong.

3. **A single relational database as source of truth**  
   No polyglot persistence until there's a need.

4. **Frontend & backend share language**  
   Less context-switch; more reuse. That means TypeScript everywhere.

5. **Optimise for the 80% use-case**  
   The real SIGEM's highest recorded traffic was just over 100 concurrent sessions (the day student bus pass applications opened). On a typical day, around 2,000 login events are registered. Weekends? Practically empty. We're not building for Netflix-scale traffic—we're building for real-world municipal workloads. That means we can skip the complexity of distributed systems, auto-scaling infrastructure, and micro-optimizations that only matter at massive scale. Start simple, scale when (and if) you actually need to.

With that in mind, let's choose the tech stack that lets us move fastest today and age gracefully tomorrow.

## How to Pick a Framework When You&rsquo;re Unsure

> Pick what is popular, and if you don't like what is popular, pick what you like

{{< youtube hkFCBCoJiAU >}}

Choosing a tech stack can feel paralyzing. There are so many options, so many opinions, and everyone seems to have strong feelings about their favorite framework.

Popular frameworks didn't become popular by accident. They have:

- **Proven reliability:** They've survived the test of time and countless production deployments.
- **Community support:** When you get stuck (and you will), there's a StackOverflow answer, a GitHub issue, or a Discord thread waiting for you, or an AI was already trained with what you need.
- **Better tooling:** Popular frameworks get better IDE support, more plugins, more third-party integrations.
- **Easier hiring:** If you ever need to expand the team, finding developers is easy.

If you *really* dislike the popular option, choose what you personally prefer. A framework you enjoy working with will make you more productive than forcing yourself to use something you hate just because it's popular.

What matters is:

- Getting started.
- Building something.
- Learning from real-world problems.
- Shipping to actual users.

Don't get stuck trying to find the "perfect" framework—it doesn't exist. Every framework has tradeoffs. Pick one that's good enough and move forward.

## Why Am I Picking React?

I've worked with it, I understand its patterns, and I can be productive with it from day one. But comfort alone isn't a good enough reason to choose a framework. So let's look at the more objective reasons why [React](https://react.dev/) makes sense here:

| Heuristic                 | Why it matters                                                         | Reality Check                                                                |
|---------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Community Familiarity     | How easy it is to find help, resources, and potentially collaborators? | Everyone and their mother have at least heard of React                       |
| Long-Term Viability       | Will it still compile in 2030?                                         | Meta pays engineers to keep React alive                                      |
| Codebase Scalability      | Can this tool handle a "large software project"?                       | Component model + hooks scales *fine*                                        |
| Performance Ceiling       | Will the UI choke on slow laptops?                                     | React isn't the bare-metal king, but ships fast enough for CRUD & dashboards |
| Standards / Accessibility | Can screen-readers and low-end phones use it?                          | React works with the browser's DOM; good defaults                            |

React isn't perfect, but it is *predictable*. When something breaks, there's a GitHub issue about it. When you need a library, there are three battle-tested options. When you hire someone (or ask AI for help), they know React. That predictability is worth more than marginal performance gains or slightly cleaner syntax.

## Why Am I Picking Next.js?

Because I know Next.js—well, sort of.

Back in 2022, I spent four months working on a straightforward project built with Next.js 12. It was an admin system for auditing medicine receipts: a few routes, some data tables, pagination, filtering, and the ability to bookmark suspicious entries. Nothing fancy, but it worked well. The frontend consumed APIs exposed by the same Next.js project, keeping everything in one place.

Since then, my career path hasn't crossed with Next.js again, but I've been following its evolution from the sidelines—the updates, the controversies, the growing ecosystem, the drama about the React Server Components migration. I've watched it mature from a comfortable distance.

As of now, there are three main ways to build a React application:

- **[Next.js](https://nextjs.org/)**: The React framework by Vercel. Opinionated, full-featured, and production-ready.
- **[Vite](https://vite.dev/) + [React Router](https://reactrouter.com/)**: A minimal, fast dev environment with client-side routing. Great for SPAs.
- **[TanStack Start](https://tanstack.com/start/latest)**: A newer framework built around [TanStack Router](https://tanstack.com/router/latest). Still very early but promising.

For this project, Next.js is the clear choice: well-documented, and designed for both static and dynamic pages. It lets us focus on building the town administration system instead of reinventing the wheel.

## What&rsquo;s Next?

([No pun intended](https://youtube.com/shorts/fLmW1URQdLs?si=Or_1CR4GZkFUH980))
![inaff](/uploads/2025-10-10-large-software-projects/ninomae-inanis-hololive-vtuber-2088695325.jpg)

Now that we've established our foundational tech stack—React with Next.js—it's time to set up our development environment properly. In the next post, we'll walk through:

- **Initial Next.js project setup** using the `src/` folder convention.
- **Code quality tooling**: Configuring ESLint and Prettier to keep our code consistent.
- **UI component foundation**: Setting up [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components.
- **Building our landing page**: Creating the public face of our town administration system.

This isn't just about running `npx create-next-app` and calling it done. We'll establish the patterns and conventions that will carry us through the entire project—the kind of setup that makes future development easier, not harder.

Let's get our hands dirty. 🚀

**Next Blog**: [Large Software Projects: Initial Setup](/en/blog/2025-10-12-large-software-projects)