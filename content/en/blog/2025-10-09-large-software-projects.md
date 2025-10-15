---
author: "Franco Becvort"
title: "Large Software Projects: How to Approach a Large Software Project"
date: 2025-10-09
description: "Pollito's Opinion on Software Projects"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-09-large-software-projects/how-to-approach-large-software-projects.jpg
---

<!-- TOC -->
  * [My Mindset For Software Projects](#my-mindset-for-software-projects)
    * [Good Code Has Two Requirements](#good-code-has-two-requirements)
    * [Not Everything That Can Be Done Should Be Done](#not-everything-that-can-be-done-should-be-done)
    * [Fragmented Codebases Lead to High Developer Frustration](#fragmented-codebases-lead-to-high-developer-frustration)
    * [You Don&rsquo;t Need to Be an Expert to Make Great Software](#you-dont-need-to-be-an-expert-to-make-great-software)
    * [Project Size ≠ Team Size](#project-size--team-size)
    * [Sometimes Rewriting Is Worth It](#sometimes-rewriting-is-worth-it)
  * [People That Inspire Me](#people-that-inspire-me)
    * [Theo](#theo)
    * [Dreams of Code](#dreams-of-code)
    * [carykh](#carykh)
    * [Eskil Steenberg](#eskil-steenberg)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

In the [previous post](/en/blog/2025-10-03-large-software-projects), we established the grim reality: the default setting for large-scale software development is complexity. We’ve collectively normalized architectures that are designed to impress consultants rather than to be maintained by humans. We pay the "complexity tax" daily through slow onboarding, painful debugging, and endless coordination meetings.

But what if the opposite is true? What if the single most sophisticated design choice you can make is to choose simplicity?

The philosophy outlined here is not revolutionary. It’s a return to first principles. It’s about building things that last by making them easy to understand, easy to change, and easy to deploy.

Before we pick a single tool, let me share my approach to building large software projects.

##  My Mindset For Software Projects

### Good Code Has Two Requirements

1. **It solves the problem.**
2. **It doesn't suck to read.**

That's it. I don't care if it uses the latest framework or follows every [SOLID principle](https://www.geeksforgeeks.org/system-design/solid-principle-in-programming-understand-with-real-life-examples/) religiously. If it works reliably and the next developer (including future you) can understand what's happening, it's good code.

### Not Everything That Can Be Done Should Be Done

Just because you *can* split your application into 47 microservices doesn't mean you *should*.

- You probably don't need a microservices approach (seriously, you probably don't).
- Don't over-engineer—at least not without a really good reason.
- That fancy new technology stack? It's cool, but does it solve an actual problem you have, or does it just look good on your LinkedIn?

**The hidden costs of over-engineering:**

| Aspect                    | Big Tech Approach                | Reality for Most Projects |
|---------------------------|----------------------------------|---------------------------|
| **Setup Time**            | Weeks to months                  | Should be days            |
| **Team Size Needed**      | 100+ developers                  | 1-3 developers            |
| **Monthly Cloud Bill**    | $5,000 - $50,000+                | $50 - $500                |
| **Deployment Complexity** | Multiple services, orchestration | Single deployment         |
| **Onboarding Time**       | Weeks for new devs               | Days for new devs         |
| **Debugging Difficulty**  | Distributed tracing required     | Stack trace in logs       |

Think of architecture decisions like seasoning food. A little bit enhances the dish; too much ruins it. The goal is a tasty meal, not to use every spice in your cabinet.

### Fragmented Codebases Lead to High Developer Frustration

Imagine playing a game of telephone in a crowded, noisy room. That's what a hyper-fragmented system can feel like. You're never 100% sure if your changes in "Service A" will unintentionally ripple through "Service B" on the other side of the organization, even if they shouldn't have anything in common.

A simple change can quickly escalate into:
- Multiple PRs across multiple repositories.
- Multiple code reviews with different teams.
- Multiple meetings with QA teams.
- Multiple deployment pipelines.
- Multiple points of failure.
- Multiple days of waiting.

Most of the time, if that code lived in a monolith, the change would've literally been 10 lines across 2 or 3 files, reviewed in 10 minutes, and deployed before lunch break.

![use a monolith](/uploads/2025-10-09-large-software-projects/a8migg.jpg)

### You Don&rsquo;t Need to Be an Expert to Make Great Software

As [Rui Torres](https://en.wikipedia.org/wiki/Rui_Torres) said:

> You don't need to be an expert to be a great artist

![you don't need to be an expert](/uploads/2025-10-09-large-software-projects/no-necesitas-ser-un-experto.jpg)

The same applies to software.

Most of the software you touch every day wasn’t built by people who know every language, framework, and cloud provider. It was built by people who knew how to pick a tool they understood (or could learn quickly), make tradeoffs, and ship.

The true mastery isn't in knowing every single detail, but understanding how to effectively use and combine abstractions to solve real-world problems. Focus on building and learning; the "expert" label will follow, not precede, your accomplishments.

### Project Size ≠ Team Size

> Adding manpower to a late software project makes it later.

~Frederick P. Brooks, Jr

{{< youtube Xsd7rJMmZHg >}}

**The size of a project should NOT be proportional to the tech team behind it.**

Adding more people to the mix only creates more noise, more meetings, more coordination overhead, and more opportunities for miscommunication.

Some of my favorite examples of huge projects with small teams:

| Project                                                                                                                                                                 | Team Size                                                                                                                                                                               | Impact                                    |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| **[Telegram](https://telegram.org/)**                                                                                                                                   | [~30 employees](https://economictimes.indiatimes.com/news/new-updates/30-billion-telegram-has-only-30-employees-no-hr-harsh-goenka-shares-pavel-durovs-video/articleshow/112839523.cms) | Hundreds of millions of users             |
| **[Yacaré (now Fiserv)](https://www.lanacion.com.ar/economia/una-compania-internacional-compro-yacare-la-primera-empresa-argentina-en-implementar-el-qr-nid05012023/)** | ~15 employees, I was there :D                                                                                                                                                           | Argentina’s first QR-based payment system |
| **[Hollow Knight](https://www.hollowknight.com/)**                                                                                                                      | [3 people](https://cyberpost.co/was-hollow-knight-made-by-3-people/)                                                                                                                    | Universally acclaimed video game          |
| **[Roller Coaster Tycoon](https://atari.com/pages/rollercoaster-tycoon)**                                                                                               | [1 person (Chris Sawyer)](https://youtu.be/ESGHKtrlMzs?si=Rbkg-2lWdXgalYG_)                                                                                                             | Legendary simulation game                 |
| **[Stardew Valley](https://www.stardewvalley.net/)**                                                                                                                    | [1 person (ConcernedApe)](https://youtu.be/4-k6j9g5Hzk?si=VYp3ZzhGl5bLowsJ)                                                                                                             | 20+ million copies sold                   |
| **[Lichess](https://lichess.org/)**                                                                                                                                     | [Mostly 1 person (Thibault Duplessis)](https://youtu.be/7VSVfQcaxFY?si=Yeo9igZQmyCYy1A5)                                                                                                | #1 online chess platform                  |

Small, focused teams can build incredible things when they're not spending half their time in coordination meetings.

### Sometimes Rewriting Is Worth It

If you spend more time trying to understand what the code is doing than actually building new features, if the tech stack is so outdated that you can't find documentation anymore, if every change feels like defusing a bomb... maybe it's time for a fresh start.

Obviously, this isn't always the right call. [Joel Spolsky&rsquo;s famous article about Netscape](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/) is required reading here. But the decision shouldn't be "never rewrite" or "always rewrite"—it should be based on honest evaluation:

- Can new developers become productive in a reasonable timeframe?
- Is the current codebase preventing you from meeting business needs?
- Do you understand the problem domain better now than when the original was written?
- Can you rewrite it *without* falling into the same traps?

Sometimes the answer is yes, and that's okay.

## People That Inspire Me

Before we dive into building, I want to highlight the voices that shaped my thinking. These aren't just random YouTubers I watch—they're people who embody the principles I've been advocating for. They prove that great software comes from clear thinking, not from complexity for complexity's sake.

### Theo

I discovered **[Theo (@t3dotgg)](https://www.youtube.com/@t3dotgg)** through his "Do you REALLY need a backend?" video back in 2022.

{{< youtube 2cB5Fh46Vi4 >}}

You may not agree with all his takes or like his upfront character, but you cannot deny he has solid knowledge and a genuine talent for creating "nerd" content that's both entertaining and educational.

His willingness to challenge common assumptions resonates deeply with the philosophy I'm advocating here. He reminds me that **serious tech discussions don't have to be dry**, and that sometimes the best solution is the simpler one you overlooked.

### Dreams of Code

**[Dreams of Code](https://www.youtube.com/@dreamsofcode)** creates content that focuses on practical development tools and concepts rather than chasing trends.

{{< youtube F-9KWQByeU0 >}}

While he primarily works with Go (a language I haven't used), his videos transcend language-specific syntax. What matters is ow he explains fundamental concepts in ways that apply regardless of your stack.

His approach reinforces my belief that **understanding core principles is more valuable than being married to specific technologies.**

### carykh

**[carykh (Cary Huang)](https://www.youtube.com/@carykh)** was exploring AI, genetic algorithms, and evolutionary simulations back in 2018—long before AI became the buzzword it is today.

{{< youtube y3B8YqeLCpY >}}

What inspires me most isn't just his technical foresight, but his approach: building projects as a solo developer, explaining complex concepts through engaging visuals, and doing it all with genuine enthusiasm.

His work proves you don't need a research lab or a huge team to explore cutting-edge ideas. **Sometimes you just need curiosity, dedication, and a willingness to experiment.**

### Eskil Steenberg

The one that really pushed me from "idea" to "let's actually *do* this" is **[Eskil Steenberg](https://www.youtube.com/@eskilsteenberg)**'s video, "Architecting LARGE software" (the thumbnail for *this* post is a direct homage!).

{{< youtube sSpULGNHyoI >}}

The video itself is dead simple: just a dude, a screen, and C code. No fancy PowerPoints, no slick graphics—just raw, unadulterated wisdom. What makes it powerful is how Eskil demonstrates that **large software doesn't have to mean complicated software**.

## What&rsquo;s Next?

**In the next posts, we'll stop philosophizing and start building.** I'll walk through the decisions, explaining the tradeoffs, and keeping it simple.

Let's build something great. 🚀