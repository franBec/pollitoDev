---
author: "Franco Becvort"
title: "[The perfect software project #03] - Let's begin"
date: 2023-08-09
description: "Watch a backend dev trying to do frontend"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-09-the-perfect-software-project-003/screencapture-localhost-3000-2023-08-08-17_13_23.png
---

_Watch a backend dev trying to do frontend._

## Introduction

This is not gonna be a step-by-step of how Node or React works. There are plenty of great resources that can explain it better than me. So don't expect this and the following articles to be begginer friendly. I will just write down the steps, thoughts, and inconveniences I find down the road creating this project.

## 0. Have Node installed

Pretty self-explanatory.

## 1. create-next-app

Open a cmd window wherever you want to have your project in your pc, and do...

```bash
npx create-next-app@latest
```

And say yes to all.

![nextjs-installation](/uploads/2023-08-09-the-perfect-software-project-003/Screenshot-2023-08-08-153732.png)

At the moment of writing these article, Next.js is in version 13.4.13. This is gonna be a problem a little bit down the road.

Then open the newly created folder in your favourite IDE. For react-related projects, mine is Visual Studio Code.

![nextjs-default-project-structure](/uploads/2023-08-09-the-perfect-software-project-003/Screenshot-2023-08-08-154207.png)

Btw, the background theme is thanks to the [Doki Theme extension](https://github.com/doki-theme/doki-theme-vscode). Yukino is a nice theme, and an ok girl in the series. But my fav from Oregairu is Iroha.

{{< youtube U9wKkDLC6nU >}}

## 2. Pick your own CSS poison

Here's a good Theo video about the mess that are UI libraries.

{{< youtube CQuTF-bkOgc >}}

Me, as a backend developer with barely any knowledge about CSS good practices, I want something that do a lot for me, and prevent me for thinking in solutions I don't even know how to write.

And that's how I found out [shadcn/ui](https://ui.shadcn.com/). It's a out of the box ready to use components heaven that works well with tailwind.

So, I followed this tutorial...

{{< youtube URpcaFga8rY >}}

And... error.

![shadcn-error](/uploads/2023-08-09-the-perfect-software-project-003/screencapture-localhost-3000-2023-08-08-16_46_35.png)

After a few minutes googling about what could be happening, I came across this [Next.js Github issues post](https://github.com/vercel/next.js/issues/53605). And the fix is... downgrading Next.js to its 13.4.12 version.

So I did that and, yay we have a page.

![initial-page](/uploads/2023-08-09-the-perfect-software-project-003/screencapture-localhost-3000-2023-08-08-17_13_23.png)

At the moment only displays a text and have a button to toggle between light/dark mode. But is good enough for me as a starting point.

## 3. Configure your linter and add prettier

A good linter configuration will help you preventing you shooting your own foot while writing typescript, something that can happen from time to time.

A good prettier configuration will help you have readable and consistent code, even if you are the only developer (like my current scenario).

I followed these tutorials...

https://dev.to/azadshukor/setting-up-nextjs-13-with-typescript-eslint-47an
https://dev-yakuza.posstree.com/en/react/nextjs/prettier/

## Conlusion

So at the moments, these are the commits done.

![commits](/uploads/2023-08-09-the-perfect-software-project-003/Screenshot-2023-08-08-21-921.png)

You can checkout this project [in this github repo](https://github.com/franBec/sigem-monolith).
