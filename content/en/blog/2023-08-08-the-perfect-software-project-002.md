---
author: "Franco Becvort"
title: "[The perfect software project #02] - My short story with Next.js"
date: 2023-08-08
description: "The fall in love, fall out of love, and re-discovering of Next.js"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-08-the-perfect-software-project-002/nextjs.png
---

_The fall in love, fall out of love, and re-discovering of Next.js._

## First encounter with React

This goes back to August 2021...

- The 2nd Hololive English generation was debutting (I really liked Bae's chaotic energy and design).
- I was broke mentally and financially.
- I moved back to San Juan and lived with Angelita, the nicest old lady to ever walked the earth.

Here was the point in my life when I said "ok this university thing is not really working out" and decided to prepare myself for getting a job. And I entered tutorial hell.

There I learnt the basics of javascript, the foundation stone of web development. And eventually got sucked into the rabbit hole of javascripts frameworks.

So there I was, reading articles about React vs Angular vs Vue. Naive and without any solid knowledge, based mainly in which had the biggest amount of linkedin job posts, I decided to be team React.

I watched the famous 5 hours long freeCodeCamp React tutorial (now discontinued), and built the typical to-do app.

{{< youtube DLX62G4lc44 >}}

But at the end, life had other plans for me, cause the first job I got was as a web dev in a Grails monolith. That made me forget about React for some months.

## Theo.gg and Next.js

[Theo - T3.gg](https://www.youtube.com/@t3dotgg) is in my opinion th best youtube channel to get news about what's going on in the React community. He is really involved in it, making big contributions and promoting best practices about how to make better web development.

He popped out in my recomendations sometime near March 2022 or so. And after watching a couple of his videos, I was very interested in Next.js. It was sold like "the correct way of making solid React projects".

And I fell in love. Next.js 12 was for me a really intuitive way of getting things done.

- Routing? Done.
- APIs? Done.
- Typescript? Done.

Obviously it wasn't perfect. The main drawback was the lack of type-safety between a backend endpoint and a frontend consumer. Theo proposed t3 stack as a solution. I was not really convinced by it. I found it a little bit too invasive. I prefered to have the schemas in a folder, and use Zod to validate everything.

I even got the chance to promote Next.js in the company I was working at the time, making the first team there to ever use React.

But again, life had other plans for me, and [I became a Java developer](/en/blog/2022-11-13-so-it-seems-im-a-java-dev)

## Next.js 13 was different

When Next.js 13 dropped, there were a lot of news about how this thing called "Server components" are now the new thing and eveything you knew was obsolete.

Me and all the non-javascript monolith developers were like "bro, PHP did this like 15 years ago, and Rails already mastered it". I even felt like it was a step backwards to a Grails like thing. I guess web development was going full circle.

I was too commited of becoming a backend developer anyways, so, I simply stopped watching videos about Next.js for a while. I wanted to spectate how all this "Server components" thing envolved in the always changing javascript world.

## Re-discovering Next.js

With this new idea of "the perfect software project", I spent my last Sunday watching some videos about Next.js 13. It's already been some months since its release, so, there were plenty of information to read.

My conclusion was: yes, this makes sense.

Is confunsing at first the idea that a frontend component can call a server function without any kind of explicit fecth. But after you let it rest in your head for a while, it's not that unreasonable. After all, other non-javascript framworks have been doing it for years.

## Conclusion: bleed responsibly

Now I've put myself in a scenario where I have to write a monolith, and I really have two choices in mind: Grails and Next.js. I'm choosing the latter. Why? As always, Theo has the answer.

{{< youtube uEx9sZvTwuI >}}
