---
author: "Franco Becvort"
title: "Let's Build a Large Software Project: How to Approach a Large Software Project"
date: 2025-10-03
description: "Pollito's Opinion on Project Architecture"
categories: ["Building a Large Software Project"]
thumbnail: /uploads/2025-10-03-lets-build-a-large-software-project/how-to-approach-large-software-projects.jpg
---

## Motivation: "The Ideal Project"

A little bit of personal lore: I started this blog page "to document my journey as a developer" and to fill space on my CV in those early days when I was still figuring things out.

During these last 5 years I've changed jobs thrice, dealt with various projects, and witnessed different approaches to building software—some brilliant, some... less so.

At therapy (yes, developers go to therapy too), I was venting about the good, the bad, and the ugly of my job, and my therapist asked:

> Then how would your ideal project look?

I guess this series of blogs will be the long, elaborated answer to that question.

## My Inspirations

My main inspiration for this series is **[Theo (@t3dotgg)](https://www.youtube.com/@t3dotgg)**.
*   Discovered him through his "Do you REALLY need a backend?" video back in 2022.
    {{< youtube 2cB5Fh46Vi4 >}}
*   You may not agree with all his takes or like his upfront character, but you cannot deny he has solid knowledge and a genuine talent for creating "nerd" content that's both entertaining and educational. He reminds me that **serious tech discussions don't have to be dry**.

But the one that really pushed me from "idea" to "let's actually *do* this" was [Eskil Steenberg](https://www.youtube.com/@eskilsteenberg)'s video, "Architecting LARGE software" (the thumbnail for *this* post is a direct homage!).
    {{< youtube sSpULGNHyoI >}}
*   The video itself is dead simple: just a dude, a screen, and C code. No fancy PowerPoints, no slick graphics – just raw, unadulterated wisdom. There's something incredibly inspiring about that no-frills, straight-to-the-point approach. Sometimes the best technical content doesn't need polish; it just needs substance.

## What Are We Going to Build

**A town administration system.**

My direct experience developing and maintaining digital solutions for the San Luis city government, including the original **[SIGEM platform](https://sigem.sanluislaciudad.gob.ar/)**, left me daydreaming. I kept thinking, _"If I had the chance, how would I make it again?"_ This is that chance.

I genuinely believe this qualifies as a "large software project" for a few key reasons:

*   **It's large:** Imagine functionalities covering everything from:
    *   Citizen registration and account management (think user profiles on steroids).
    *   Online permit applications and renewals (lots of forms, workflows, and integrations).
    *   Utility billing and payments (complex financial logic, third-party integrations).
    *   Public records access and requests (data security, search, and retrieval).
    *   Internal administrative tools for city staff (different user roles, dashboards).
*   **It's software:** More specifically, a comprehensive web application.
*   **And it's a project** (obviously lol).

## How *Not* to Approach It: The Big Tech Blueprint

Let's imagine we pitch this project to a Big Tech company or a consultancy firm that wants to appear "enterprise-ready."

The proposal would start with a beautiful diagram showing:

- **Frontend Layer**: A public-facing web application (probably [React](https://react.dev/) or [Angular](https://angular.dev/)) hosted on a [CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/).
- **[API Gateway](https://www.freecodecamp.org/news/what-are-api-gateways/)**: Managing all incoming requests, rate limiting, authentication.
- **[Microservices](https://www.geeksforgeeks.org/system-design/microservices/)** (oh boy, here we go):
    - User Authentication Service.
    - Citizen Profile Service.
    - Permit Application Service.
    - Payment Processing Service.
    - Document Storage Service.
    - Notification Service (emails, SMS, push notifications).
    - Audit Log Service.
    - Search Service.
    - Analytics Service.
    - ...and probably 10 more services I'm forgetting.
    - Each microservice would have its own [repository](https://aws.amazon.com/what-is/repo/), its own [deployment pipeline](https://www.geeksforgeeks.org/devops/what-is-ci-cd/), its own documentation, and probably its own team.
- **[Message Queue](https://www.geeksforgeeks.org/system-design/message-queues-system-design/)**: [RabbitMQ](https://www.rabbitmq.com/) or [Kafka](https://kafka.apache.org/) for inter-service communication.
- **Multiple [Databases](https://www.geeksforgeeks.org/dbms/what-is-database/)**:
    - [PostgreSQL](https://www.postgresql.org/) for [relational data](https://www.ibm.com/think/topics/relational-databases).
    - [Redis for caching](https://redis.io/solutions/caching/).
- **File Storage**: [S3](https://aws.amazon.com/es/s3/) or equivalent for document uploads.
- **Third-Party Integrations**:
    - Payment gateways ([Stripe](https://stripe.dev/), [PayPal](https://developer.paypal.com/home/), local providers).
    - Email service ([SendGrid](https://sendgrid.com/en-us)).
    - SMS provider ([Twilio](https://www.twilio.com/en-us)).
    - Identity verification services ([Metamap](https://www.metamap.com/)).
- **Infrastructure**:
    - [Kubernetes](https://kubernetes.io/) cluster for container orchestration.
    - [Auto-scaling groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html).
    - [Load balancers](https://www.geeksforgeeks.org/system-design/what-is-load-balancer-system-design/).
    - [Multiple environments (dev, staging, production)](https://learn.microsoft.com/en-us/azure/deployment-environments/overview-what-is-azure-deployment-environments).
    - [Monitoring stack](https://youtu.be/1X3dV3D5EJg?si=wkcbnmb5a_K9FOC_).

![diagram](/uploads/2025-10-03-lets-build-a-large-software-project/Chart-2025-10-04-013903.png)
_The diagram is so complex that is even difficult to see. Feel free to open image in a new tab and zoom._

It's all very impressive, sounds incredibly robust, and, let's be honest, some of those might be legit justified. But doesn't make you feel uncomfortable the amount of links? The amount of moving parts? The amount of things that can (and will) go wrong?

### The Reality Check: You Don't Need All of That

Now, don't get me wrong, this "big tech" approach is absolutely genius for companies like Netflix, Uber, or Amazon. They operate at scales most of us can barely comprehend, serving billions of requests per second. For them, every millisecond of downtime is millions lost.

But for *most* apps, for indie developers, or for small businesses (or even a town administration system that might serve thousands, not billions, of users), aiming for that level of infrastructure from the get-go is like buying a Formula 1 race car for your daily commute to the grocery store. It's overkill, incredibly expensive to maintain, and you'll never even get close to its full potential.

**The hidden costs of over-engineering:**

| Aspect                    | Big Tech Approach                | Reality for Most Projects |
|---------------------------|----------------------------------|---------------------------|
| **Setup Time**            | Weeks to months                  | Should be days            |
| **Team Size Needed**      | 100+ developers                  | 1-3 developers            |
| **Monthly Cloud Bill**    | $5,000 - $50,000+                | $50 - $500                |
| **Deployment Complexity** | Multiple services, orchestration | Single deployment         |
| **Onboarding Time**       | Weeks for new devs               | Days for new devs         |
| **Debugging Difficulty**  | Distributed tracing required     | Stack trace in logs       |

Start simple. Add complexity when you have concrete evidence you need it, not because a consultant told you it's "best practice."

## Pollito's Opinion on Project Architecture

So, going back to my therapist's question – "how would your ideal project look?" – I don't have a perfect, one-size-fits-all answer (does anyone, really?). But after some years in the software trenches, I've developed some strong takes. These are the principles that guide my ideal project:

### Good Code Has Two Requirements

1. **It solves the problem.**
2. **It doesn't suck to read.**

That's it. I don't care if it uses the latest framework or follows every [SOLID principle](https://www.geeksforgeeks.org/system-design/solid-principle-in-programming-understand-with-real-life-examples/) religiously. If it works reliably and the next developer (including future you) can understand what's happening, it's good code.

### Not Everything That Can Be Done Should Be Done

Just because you *can* split your application into 47 microservices doesn't mean you *should*.

- You probably don't need a microservices approach (seriously, you probably don't).
- Don't over-engineer—at least not without a really good reason.
- That fancy new technology stack? It's cool, but does it solve an actual problem you have, or does it just look good on your LinkedIn?

Think of architecture decisions like seasoning food. A little bit enhances the dish; too much ruins it. The goal is a tasty meal, not to use every spice in your cabinet.

### Software Doesn't Need to Be Overly Complicated to Be Effective

I've noticed technical leaders, architects, and whoever makes the infrastructure decisions often have a fascination with complex designs. Maybe it's to feed their egos, maybe to justify their salaries—honestly, I don't know.

Many of them were probably great developers in the past and worked their way hard to reach their current roles. But **the more time they spend not coding, the more disconnected they seem from reality**.

I've literally seen architects who don't have an IDE installed anymore (a flag as red as the USSR's). They design systems they'll never have to maintain, using tools they've never personally debugged in production. 

**The consequences of over-complexity:**

- **Fragmented codebases lead to high developer frustration:** Imagine playing a game of telephone in a crowded, noisy room. That's what a hyper-fragmented system can feel like. You're never 100% sure if your changes in "Service A" will unintentionally ripple through "Service B" on the other side of the organization, even if they shouldn't have anything in common.
- A simple change can quickly escalate into:
    - Multiple PRs across multiple repositories.
    - Multiple code reviews with different teams.
    - Multiple meetings with QA teams.
    - Multiple deployment pipelines.
    - Multiple points of failure.
    - Multiple days of waiting.

Most of the time, if that code lived in a monolith, the change would've literally been 10 lines across 2 or 3 files, reviewed in 10 minutes, and deployed before lunch break.

### Project Size ≠ Team Size

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

These aren't exceptions—they're proof that small, focused teams can build incredible things when they're not spending half their time in coordination meetings.

> Adding manpower to a late software project makes it later.

~Frederick P. Brooks, Jr

{{< youtube Xsd7rJMmZHg >}}

### Sometimes Rewriting Is Worth It

Sometimes it's worth considering rewriting something rather than continuing to maintain it—**especially when there's nobody left from the original team that wrote it**.

If you spend more time trying to understand what the code is doing than actually building new features, if the tech stack is so outdated that you can't find documentation anymore, if every change feels like defusing a bomb... maybe it's time for a fresh start.

Obviously, this isn't always the right call. [Joel Spolsky&rsquo;s famous article about Netscape](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/) is required reading here. But the decision shouldn't be "never rewrite" or "always rewrite"—it should be based on honest evaluation:

- Can new developers become productive in a reasonable timeframe?
- Is the current codebase preventing you from meeting business needs?
- Do you understand the problem domain better now than when the original was written?
- Can you rewrite it *without* falling into the same traps?

Sometimes the answer is yes, and that's okay.

## How to Approach It: My Approach

ringing it all back to "my ideal project," my approach is rooted in practicality, maintainability, and sustainable growth. It's about making informed choices based on the actual needs of the project, not just following the latest hype.

Now, if you knew me you might be thinking

> "Pollito, you've been living and breathing [Java Spring Boot microservices](https://www.geeksforgeeks.org/springboot/java-spring-boot-microservices-example-step-by-step-guide/) for almost three years, and you even have a special place in your heart for the [Groovy Server Pages](https://gsp.grails.org/latest/guide/index.html) + [jQuery](https://jquery.com/) combo where you started your professional journey—why not stick with what you know?"

And you'd be right to ask! Those technologies have served me well, and I have immense respect for their robustness and the lessons they taught me. But for *this* project, with its specific context and my current vision for speed, developer experience, and long-term maintainability, I'm conscious that those approaches, while powerful, simply won't be the sharpest tools in the shed.

Enter [Next.js](https://nextjs.org/). Ever since Theo put it on my radar, I've been following the Next.js world like a hawk. I've watched its evolution alongside React, observed all the surrounding "drama", and stayed immersed in the incredible pace of innovation there. It's a testament to how far web development has come.

So, for our town administration system, I'm going with a **Next.js monolith**.
*   This gives us the power of a modern full-stack framework, a fantastic developer experience, and the flexibility to deploy it as a traditional server or leverage serverless functions for specific parts when and if needed – without the complexity overhead of a distributed system from day one.
*   I'll organize the code following a **modular, hexagonal architecture**. This keeps concerns cleanly separated, makes the business logic independent of external frameworks, and promotes testability without prematurely fragmenting the codebase.
*   Crucially, though, I'll be **prioritizing Next.js and other libraries' default file hierarchies and standards first.** No need to fight the framework; we'll embrace its conventions to keep things clean and understandable, while still getting the benefits of a robust architectural pattern underneath.

This isn't just about building software; it's about building it smart, building it maintainable, and building it in a way that truly solves problems without inventing new ones along the way. Let's get started!