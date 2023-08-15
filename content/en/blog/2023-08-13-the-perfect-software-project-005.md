---
author: "Franco Becvort"
title: "[The perfect software project #05] - Samples pages and login form"
date: 2023-08-13
description: "Let's make those empty pages"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-08-13-the-perfect-software-project-005/Screenshot-2023-08-14-224934.png
---

## Main menu grid

I made a grid for the main menu. Each button of the grid should represent a procedure. When clicking a button of the menu, the three typical SIGEM options appear:

![procedure options](/uploads/2023-08-13-the-perfect-software-project-005/screencapture-localhost-3000-2023-08-15-12_56_19.png)

1. Do a new procedure:

- It redirects to /procedure/new

2. Check my current procedures:

- It redirects to /procedure/me

3. Requisites to start a new procedure:

- It redirects to /procedure

## Login form

Here I didn't want to imitate current SIGEM login, which involves a pop up modal window. Instead I had two logins I wanted to imitate.

- Galicia bank login: is a page where it displays the login form half screen, and a "image of the day" the other half.

- Santander bank login: very similar, but is more of a simple sidebar that I find very modern and elegant.

![galicia](/uploads/2023-08-13-the-perfect-software-project-005/screencapture-onlinebanking-bancogalicia-ar-login-2023-08-14-23_48_20.png)
![santander](/uploads/2023-08-13-the-perfect-software-project-005/screencapture-www2-personas-santander-ar-obp-webapp-angular-2023-08-14-23_47_42.png)

I decided to go with the Galicia approach, because I also wanted to try to make a carrousel component.

## Carrousel component fail

So, yeah it didn't go well. I tried some of the libraries I read about in these articles from [alavarotrigo.com](https://alvarotrigo.com/blog/react-carousels/) and [byby.dev](https://byby.dev/react-carousel-components) (not sponsored, I just found them googling), and I couldn't make it really work as I wanted.

99% it was my bad as an unexpierenced frontend dev, so I decided to leave it as a single image at the moment, and retry later.

And even leaving it as a single image wasn't that simple. Next.js has this Image tag that I don't find it very intuitive, also probably cause of my unexperience. For getting used to this new tool, I followed this little youtube tutorial...

{{< youtube EBSrVW5MXoo >}}

## Forms are different as it used to be

I feel this as the biggest change between Next.js 12 and 13. Back in Next.js 12 you had to:

- useState() to had the state of the form fields.
- create a submit function that...
  - validates inputs.
  - fetchs a api.
  - processes api response.

You could kinda simplify this with [React Hook Form](https://react-hook-form.com/), but back when I worked at Runa, I wasn't that convinced of the library, so we did the form process manually.

Now, with Next.js 13 + shadcn/ui library, making a form follows these steps:

- Add 'use client' at tope of form component, cause forms are a client thing. Makes sense
- Copy-paste a form from [shadcn/ui](https://ui.shadcn.com/docs/components/form) and adapt it to your necesities.
  - This form uses React Hook Form under the hood, so you are "hooked" to the library (no pun intended).
- Still need a submit function that instead of calling an api, calls a backend function directly.
  - You could fetch to an api but, that would be totally missing the point of version 13.

The end result.. looks bad lol. But I decided to not waste much time and give it a second try later.

## Conclusion

So at the moment, these are the commits done. This can be checked in the GitHub branch [2023-08-10](https://github.com/franBec/sigem-monolith/tree/2023-08-10).

![commits](/uploads/2023-08-13-the-perfect-software-project-005/Screenshot-2023-08-14-230043.png)
