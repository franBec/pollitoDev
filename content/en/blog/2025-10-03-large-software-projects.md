---
author: "Franco Becvort"
title: "Large Software Projects: The Chaotic Pipeline That Is Software Development in Modern Times"
date: 2025-10-03
description: "I Think We Could Be Doing Better"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-03-large-software-projects/cinematic-chicken.png
---

<!-- TOC -->
  * [A Developer&rsquo;s Perspective](#a-developers-perspective)
  * [The Facts That Shape Our Chaotic Pipeline](#the-facts-that-shape-our-chaotic-pipeline)
    * [Onboarding Hell is the Default](#onboarding-hell-is-the-default)
    * [You Are a Maintainer, Not a Builder (And That&rsquo;s Okay)](#you-are-a-maintainer-not-a-builder-and-thats-okay)
    * [Human Creativity is Measured by Story Points](#human-creativity-is-measured-by-story-points)
    * [The Default Architecture Has Too Many Moving Parts](#the-default-architecture-has-too-many-moving-parts)
  * [So What Now?](#so-what-now)
<!-- TOC -->

If I had to describe the current state of large-scale software development in one word, it would be: **Chaotic.**

It feels like we've collectively embraced complexity as a feature, not a bug. We’re building massive digital cathedrals with too many moving parts, held together by duct tape, YAML files, and sheer willpower. And we accept it as normal.

**I don't have the solution to this problem**. I'm not about to sell you a course or pitch you my revolutionary framework. But I think listing my concerns is a good first step, right?

In future posts, I definitely plan to share my philosophy on choosing the right tools, setting up things efficiently, and focusing on shipping—not just building the most complex architecture possible. But before we get there, we need to talk about the messy reality.

## A Developer&rsquo;s Perspective

I'm a developer.

My career has been spent in the trenches—mostly Java/Spring Boot—building and maintaining systems for the Argentinian Government, fintechs, and banks.

I'm the one writing the APIs, connecting to the databases, and dealing with the authentication flow. I've never been the person drawing the big picture diagrams in boardrooms saying "yes we need this cloud provider services".

Nevertheless, I’ve done my homework. I wear the [certifications](https://www.credly.com/users/franco-becvort/badges#credly) ([Google Cloud Architect](https://cloud.google.com/learn/certification/cloud-architect), [PSM I](https://www.scrum.org/professional-scrum-master-i-certification?utm_source=credly&utm_medium=PSMI)) not as badges of conformity, but as proof that I understand exactly what complexity looks like.

Now that we've established I've been deep in the metaphorical mud, let's talk about the specific problems that make large projects feel so chaotic.

## The Facts That Shape Our Chaotic Pipeline

Let me walk you through some facts that shape the current software development landscape. Some of these are problems. Some are just reality, and we have to accept them as they are. But accepting reality doesn't mean we can't try to do better.

### Onboarding Hell is the Default

Be honest: When you join a new project, how long do you spend before you push your first meaningful code?

The answer is almost always: **Too long.**

The first month of any developer job in a large system isn't about building features; it's about *trying to get the development environment to work.*

You spend your days wrestling with proprietary internal tools, fighting dependency conflicts, cloning 30 different microservices. It's a frustrating, energy-sapping process that makes new hires unmotivated.

And why? Because the system is designed with so many intricate parts that nobody can replicate the production environment easily.

### You Are a Maintainer, Not a Builder (And That&rsquo;s Okay)

This section is kinda of a copy and paste from this Shade of Code video. Check him out, great channel.

{{< youtube hJI2ISRIuZw >}}

Most software jobs aren't about building cool stuff from scratch. They're about keeping existing things alive without them exploding.

The code is already written. The system is already shipped. Now your job is to stop it from collapsing under its own weight.

**Because shipping is just the beginning.**

It's no longer about getting something working. It's about keeping it working, which means:
- Fixing bugs you didn't cause.
- Supporting features you didn't build.
- Updating dependencies without breaking the app.
- Rewriting logic that no one understands anymore (because the original developer? They're gone).

Most systems live way longer than their creators expect. What started as "just a prototype" is now the company's core, and you're the one keeping it alive.

It's not glamorous, but **this is where real engineering happens**.

Writing brand-new code is fun. It's creative. It's satisfying. But maintaining it? That's the part where you learn architecture, because you finally see the consequences of design decisions.

Just because you're maintaining doesn't mean you're stuck. You can still build, just in smaller, smarter ways. You're solving problems.

### Human Creativity is Measured by Story Points

When I was studying for my Professional Scrum Master (PSM I) certification I read the [Manifesto for Agile Software Development](https://agilemanifesto.org/).

- **Important note:** Agile and Scrum are **not** the same thing. Scrum is a framework. Agile is a culture.

The principles are solid. You think, "This is great. We’re organized. Agile will save us from chaos, make development faster, and bring teams together."

Then I realized every large company that *claims* to use Agile is actually using its own highly customized broken version of it. They are no longer using Agile as intended; they are using _Agile™_.

>Any effort time or energy being spent doing something that is not directly supporting putting valuable software in the hands of the user, that's all waste

{{< youtube vSnCeJEka_s >}}

We spend half our mental energy burned pretending to look engaged on Teams calls. It becomes less about delivering value and more about maintaining an artificial "velocity" score that looks good on the Jira dashboard.

Meanwhile, deadlines still slip, features still break, and the old "move fast and break things" energy has been replaced by "move in circles and schedule another retrospective."

**Bad Agile implementation destroys beginners** by convincing them this is what real development looks like. Not building. Not solving problems. But fake work that looks good on a dashboard.

Don't get me wrong—collaboration is not bad. Communication is important. But most Agile implementations turn building cool stuff into theater.

And that story point you spent twenty minutes defending in planning? It doesn't matter. It never mattered. We're going to ship late anyway.

### The Default Architecture Has Too Many Moving Parts

Let's imagine we're building a Town Administration System ([greenfield brownfield blufield](https://medium.com/@jayakishorebayadi1/greenfield-vs-brownfield-vs-bluefield-implementations-8ead800e2e08), doesn't matter). Imagine functionalities covering everything from:

- Citizen registration and account management.
- Online permit applications and renewals (lots of forms, workflows, and integrations).
- Utility billing and payments (complex financial logic, third-party integrations).
- Public records access and requests (data security, search, and retrieval).
- Internal administrative tools for city staff (different user roles, dashboards).

Now, let's imagine we pitch this project to a Big Tech company or a consultancy firm that wants to appear "enterprise-ready."

The proposal would start with a beautiful diagram showing:

!["The chaotic landscape of a 'modern' large software project](/uploads/2025-10-03-large-software-projects/Chart-2025-10-04-013903.png)
_The diagram is so complex that it's even difficult to see. Feel free to open the image in a new tab and zoom._

- **Frontend Layer**: A public-facing web application (probably [React](https://react.dev/) or [Angular](https://angular.dev/)) hosted on a [CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/).
- **[API Gateway](https://www.freecodecamp.org/news/what-are-api-gateways/)**: Managing all incoming requests, rate limiting, authentication.
- **[Microservices](https://www.geeksforgeeks.org/system-design/microservices/)** (oh boy, here we go):
    - User Authentication Service.
    - Citizen Profile Service.
    - Permit Application Service.
    - Payment Processing Service.
    - Document Storage Service.
    - Notification Service (emails, SMS, push notifications).
    - ...
    - ...
    - ... you get the idea.
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

It's all very impressive. It sounds incredibly robust. And, let's be honest, some of those might be legitimately justified.

But doesn't the amount of links make you feel uncomfortable? The amount of things that can (and will) go wrong?

You may think this is a skill issue and that as a developer, I should be comfortable around this diagram. But I think **using the right tools and simplifying is not cheating—it's the correct move**.

We've normalized complexity. We've made it the default. And now we act surprised when nobody really understands how everything works together.

## So What Now?

First, let me say this: **Don't blame the company**. This is everywhere. Companies don't embrace complexity just for the sake of complexity (or at least, I hope not). They're trying to build things that scale, that are maintainable, that look good to investors and stakeholders. They're dealing with legacy decisions, market pressure, and the eternal struggle between doing things right and doing things fast.

The beautiful coding content you see online? That's marketing. Real development is messy and frustrating. That's just how it is.

**But this doesn't mean you cannot at least dream of a better approach.**

It's important to form your own opinions on software development. To question the defaults. To ask, "Do we really need all of this?" To push back when complexity is being added without clear justification.

I don't think you're not a bad developer for wanting simpler solutions. I don't think You're not behind the curve for questioning whether we need seventeen microservices. You're not wrong for thinking that maybe, just maybe, there's a better way.

In the next blog post, I'll stop the complaining and start sharing what my approach would be: **The philosophy, the tooling, and the mindset for approaching large software projects in a significantly less chaotic manner.** Will it be perfect? Absolutely not. Will everyone agree with it? Definitely not. But at least it'll be honest, and it'll be based on real experience

Until then, keep shipping. Keep questioning. And remember: if your development environment takes three weeks to set up, that's not your fault. That's a system design problem.

(Am I being too harsh? Not harsh enough? IDK)