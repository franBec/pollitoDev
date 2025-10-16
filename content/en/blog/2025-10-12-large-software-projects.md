---
author: "Franco Becvort"
title: "Large Software Projects: Initial Setup"
date: 2025-10-12
description: "From a blank folder to a configured Next.js project"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-12-large-software-projects/stylized-chicken.png
---

<!-- TOC -->
  * [Step 1: Scaffolding the Project](#step-1-scaffolding-the-project)
    * [Understanding the Project Structure](#understanding-the-project-structure)
    * [Setting Up AI Preferences](#setting-up-ai-preferences)
    * [Adding a License](#adding-a-license)
  * [Step 2: Enforcing Code Quality with ESLint and Prettier](#step-2-enforcing-code-quality-with-eslint-and-prettier)
  * [Step 3: A Modern UI Foundation with shadcn/ui](#step-3-a-modern-ui-foundation-with-shadcnui)
    * [Customizing the Theme](#customizing-the-theme)
  * [Step 4: Building Our Landing Page](#step-4-building-our-landing-page)
  * [What&rsquo;s Next?](#whats-next)
<!-- TOC -->

In the [previous post](/en/blog/2025-10-10-large-software-projects), we talked philosophy and made our big decision: we're building this project with React and Next.js. Now, it's time to stop talking and start building.

This post is all about the foundational work. We'll go from an empty directory to a fully configured Next.js application, complete with code quality tools, a flexible UI system, and our initial landing page.

Let's get started.

## Step 1: Scaffolding the Project

First, we need to choose a package manager. In the JavaScript ecosystem, you have three main options:

![npm vs pnpm vs yarn](/uploads/2025-10-12-large-software-projects/1_Ylw-2QlJwst-houRAGGQ4w-878584098.png)

- **[npm](https://www.npmjs.com/)**: The default that ships with Node.js. Reliable but slower.
- **[yarn](https://yarnpkg.com/)**: Faster than npm, introduced workspaces and lockfiles first.
- **[pnpm](https://pnpm.io/)**: The fastest and most disk-efficient. Uses symlinks to avoid duplicating dependencies.

I'm choosing **pnpm** because it's fast, efficient, and handles things well. The differences are minor for small projects, but good habits start early.

Now let's create our project:

```bash
pnpm dlx create-next-app@latest tas
```

**tas** stands for "Town Admin System." Not very creative, I know, but naming is genuinely one of the hardest problems in software development. Sometimes "descriptive and boring" beats "clever and confusing."

During installation, you'll see these prompts:

```txt
What is your project named? tas
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like your code inside a `src/` directory? Yes
Would you like to use App Router? (recommended) Yes
Would you like to use Turbopack? (recommended) Yes
Would you like to customize the import alias (`@/*` by default)? No
```

Accept all the defaults. These are sensible choices that align with modern Next.js conventions.

### Understanding the Project Structure

We're using **Next.js 15**, which comes with the App Router—a more powerful routing system than the old Pages Router. Here's what the generated structure looks like:

```
tas/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout (wraps all pages)
│       ├── page.tsx         # Homepage (route: /)
│       └── globals.css      # Global styles
├── public/                  # Static assets (images, fonts, etc.)
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

Key conventions to know:

- **`src/app/`**: Every folder in here becomes a route. `src/app/about/page.tsx` → `/about`
- **`layout.tsx`**: Shared UI that wraps pages. Great for navigation bars, footers, auth providers.
- **`page.tsx`**: The actual page content for a route.

This isn't meant to be an in-depth Next.js tutorial. For that, check out the official [Project Structure and Organization](https://nextjs.org/docs/app/getting-started/project-structure) guide.

The important thing: **we're following framework conventions**.

### Setting Up AI Preferences

Modern development often involves AI assistance—whether through GitHub Copilot, Cursor, or other tools. Different AI models work better with different prompt styles.

I've had good results with [Qwen Code](https://github.com/QwenLM/qwen-code) in the past, so I'm including a `QWEN.md` file in the project root (not sponsored). This file documents project conventions, file organization patterns, and coding style preferences that AI assistants can reference.

### Adding a License

Since this project might eventually serve as a template for other organizations, I'm choosing the **MIT License**—one of the most permissive open-source licenses available.

Quick comparison of common licenses:

| License                                                            | Key Characteristic                                   |
|--------------------------------------------------------------------|------------------------------------------------------|
| **[MIT](https://mit-license.org/)**                                | Do whatever you want, just keep the copyright notice |
| **[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)** | Like MIT, but with explicit patent grants            |
| **[GPL](https://www.gnu.org/licenses/gpl-3.0.en.html)**            | Modifications must also be open-sourced              |
| **Unlicense**                                                      | Public domain (no restrictions at all)               |

For a municipal system template, MIT makes sense: it's permissive enough that any town can adapt it without legal complexity, but maintains attribution.

## Step 2: Enforcing Code Quality with ESLint and Prettier

A consistent codebase is a happy codebase. To achieve this, we'll use two essential tools:

![Prettier + ESLint](/uploads/2025-10-12-large-software-projects/1_YvqvekgbQeEquRfo17XfuA-4230300076.jpeg)

- **[ESLint](https://eslint.org/) (Linter)**: Analyzes code to find and fix problems based on a set of configurable rules. It catches bugs and enforces best practices.
- **[Prettier](https://prettier.io/) (Formatter)**: An opinionated code formatter that enforces a consistent style. It ends the pointless debates about tabs vs. spaces or where to put a curly brace.

To set them up for a modern Next.js 15 project, I'm using a handy script from the community: [eslint-prettier-next-15](https://github.com/danielalves96/eslint-prettier-next-15).

```bash
pnpm dlx eslint-prettier-next-15
```

This automates the installation and configuration process. I made two small tweaks to the default configuration:

1.  In `.prettierrc.json`, I set `"printWidth": 80`. It's narrow enough to comfortably view two files side-by-side, and it's been a soft standard in the industry for decades.
2.  In `eslint.config.mjs`, I added an `ignores` array to prevent ESLint from trying to analyze files and directories it shouldn't, like build outputs, node modules, and configuration files.

Here’s my `ignores` array :

```mjs
ignores: [
  // Build/Generated directories
  ".next/**",
  "coverage/**",
  "node_modules/**",
  "dist/**",
  "out/**",
  "build/**",

  // Config files
  "**/*.config.*",
  "next-env.d.ts",

  // Infrastructure
  ".{idea,git,cache,output,temp}/**",
  "public/**",
],
```

## Step 3: A Modern UI Foundation with shadcn/ui

Now for the fun part: components! For this project, I'm using [shadcn/ui](https://ui.shadcn.com/).

![shadcn/ui](/uploads/2025-10-12-large-software-projects/559314a0-c97f-4ac1-b82c-b456ce626bd0-cover-3732757206.png)

At the time of writing, it feels like shadcn/ui has won the component library war, and for good reason.

Traditional component libraries operate like black boxes—you install a package, import components, and hope the provided customization options meet your needs.

**shadcn/ui flips this model entirely.** It’s not actually a component library, but rather a code distribution system that places complete component source code directly into your project. This ownership model eliminates vendor lock-in entirely. You own the code, so you can change anything you want.

Let's set it up by following the [official installation guide](https://ui.shadcn.com/docs/installation/next):

```bash
pnpm dlx shadcn-ui@latest init
```

Accept all the default prompts. This command will set up the necessary dependencies and create a `components` directory.

Since shadcn/ui generates code directly into our project, we should tell our quality tools to ignore it:

- Add the shadcn generated files (`"src/components/ui/**"` and `"src/lib/utils.ts"`) to the `ignores` array in `eslint.config.mjs`
    ```mjs
    // Generated by shadcn/ui
    "src/components/ui/**",
    "src/components/theme/**",
    "src/hooks/use-mobile.ts",
    "src/lib/utils.ts",
    ```
- Also add shadcn files to `.prettierignore`
    ```.ignore
    # shadcn components
    /src/components/theme
    /src/components/ui
    /src/hooks/use-mobile.ts
    /src/lib/utils.ts
    ```

### Customizing the Theme

shadcn uses CSS variables for theming. You *could* edit these by hand, but there's a better way: [tweakcn.com](https://tweakcn.com/).

I'm using the **"Modern Minimal"** preset because it's clean and professional—perfect for a government services platform.

![tweakcn modern minimal](/uploads/2025-10-12-large-software-projects/tweakcn.png)

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/modern-minimal.json
```

Just like that, our app has a beautiful, consistent design system.

## Step 4: Building Our Landing Page

With our foundation in place, we can finally build something visible. Let's customize the default landing page at `src/app/page.tsx`.

```tsx
import Image from "next/image";
import Link from "next/link";
import {
  Accessibility,
  Check,
  Clock,
  Eye,
  Shield,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border border-border">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <Icon className="text-primary" size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

interface ServiceOfferCheckProps {
  text: string;
}

const ServiceOfferCheck = ({ text }: ServiceOfferCheckProps) => {
  return (
    <li className="flex items-center">
      <div className="bg-primary rounded-full p-1 mr-3 flex-shrink-0">
        <Check className="text-primary-foreground" size={16} />
      </div>
      <span>{text}</span>
    </li>
  );
};

export default function Home() {
  const features: FeatureCardProps[] = [
    {
      icon: Smartphone,
      title: "Convenience",
      description: "24/7 access to municipal services from anywhere",
    },
    {
      icon: Clock,
      title: "Efficiency",
      description: "Streamline administrative processes and reduce wait times",
    },
    {
      icon: Eye,
      title: "Transparency",
      description:
        "Easily track the progress of requests and access information",
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      description: "A user-friendly interface designed for all citizens",
    },
    {
      icon: Shield,
      title: "Security",
      description:
        "Secure handling of personal information and government data",
    },
  ];

  const serviceOffers = [
    "Citizen registration and account management",
    "Online permit applications and renewals",
    "Utility billing and payments",
    "Public records access and requests",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Municipal Services
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Your Digital Gateway to Local Government Services
          </p>
          <p className="text-lg mb-12">
            Access municipal services, submit requests, and manage your civic
            obligations through our secure online platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={"/sign-in"}>
              <Button>Sign In to Your Account</Button>
            </Link>
            <Link href={"/areas/gov"}>
              <Button variant="outline">Continue Without Signing In</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6 max-w-md">
            Note: Some administrative processes require a registered account and
            may not be available to guests.
          </p>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <Image
              src="/undraw_city-life_l74x.svg"
              alt="City life illustration"
              width={1200}
              height={600}
              className="w-full max-w-4xl"
            />
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Our Digital Services?
          </h2>
          <p className="text-lg text-muted-foreground">
            Improving access to government services for all residents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      <div className="py-16">
        <div className="flex flex-col lg:flex-row items-center justify-center max-w-6xl mx-auto gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              About Our Digital Services
            </h2>
            <div className="space-y-6">
              <p className="text-lg">
                Our digital platform provides a modern, user-friendly solution
                designed to streamline interactions between citizens and local
                government services.
              </p>
              <p className="text-lg">
                We aim to empower residents to manage their municipal
                obligations and requests entirely online, eliminating the need
                for physical visits and significantly reducing administrative
                overhead.
              </p>
              <p className="text-lg">
                Our long-term vision is to provide a robust, customizable
                platform that serves the needs of our community and other
                municipalities.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-semibold mb-4 text-center">
                Service Offerings
              </h3>
              <ul className="space-y-3">
                {serviceOffers.map((offer, index) => (
                  <ServiceOfferCheck key={index} text={offer} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

![screencapture localhost 3000](/uploads/2025-10-12-large-software-projects/screencapture-localhost-3000-2025-10-12-21_52_19.png)

I asked my AI assistant to summarize the purpose of our new landing page. Here's what it said:

> This is the main landing page for a municipal services platform built with Next.js. It's a public-facing page that serves as the entry point to a digital government services application.
>
> Here's what it does:
>
> 1.  **Page Structure**:
      >     -   Hero section with a call-to-action (sign in or continue without signing in)
>     -   Feature highlights showing benefits like convenience, efficiency, transparency, accessibility, and security
>     -   About section explaining the platform's purpose and vision
>     -   Service offerings list highlighting key features
> 2.  **Authentication Flow**: It provides two paths:
      >     -   Sign in for registered users
>     -   Guest access with a warning that some features require registration
> 3.  **Design**: Uses shadcn/ui components (Button) and Tailwind for responsive styling, with Lucide React icons for visual elements
>
> The component is straightforward - it's a marketing/landing page that explains the platform and provides entry points to the actual services located at `/sign-in` and `/areas/gov`. It doesn't handle any complex state or data fetching, just presents static content with Next.js Image optimization for the hero image.

This perfectly captures the goal: creating a welcoming front door for our application.

## What&rsquo;s Next?

([No pun intended](https://youtube.com/shorts/fLmW1URQdLs?si=Or_1CR4GZkFUH980))
![inaff](/uploads/2025-10-10-large-software-projects/ninomae-inanis-hololive-vtuber-2088695325.jpg)


We've established a solid local foundation: a type-safe Next.js project, beautiful UI components, and strict code quality rules. But a project isn't truly "built" until it's deployed. Establishing a reliable deployment pipeline early is critical to validate our stack and prevent the dreaded "it works on my machine" syndrome.

In the next post, we will set up a very simple, yet highly effective, CI/CD pipeline:

1.  **Deployment Target**: We will utilize a VPS I already own.
2.  **CI/CD Orchestration**: We will use [Coolify](https://coolify.io/)—a self-hosted, open-source platform to manage and deploy our application containers.
3.  **Continuous Integration**: We will link our GitHub repository to Coolify to enable automatic deployment every time we merge code to the main branch.

Getting this basic deployment loop working ensures our application can ship before we introduce complexity.

Let's ship some code. 🚀