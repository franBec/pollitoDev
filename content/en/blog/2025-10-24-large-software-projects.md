---
author: "Franco Becvort"
title: "Large Software Projects: Unit Testing"
date: 2025-10-24
description: "Implementing unit tests using Vitest"
categories: ["Large Software Projects"]
thumbnail: /uploads/2025-10-24-large-software-projects/thumbnail.png
---

This post is part of my [Large Software Projects blog series](/en/categories/large-software-projects/).

<!-- TOC -->
  * [Code Source](#code-source)
  * [What is Testing and Why Should We Care?](#what-is-testing-and-why-should-we-care)
    * [Different Kinds of Testing](#different-kinds-of-testing)
  * [Choosing Our Tool: Why Vitest?](#choosing-our-tool-why-vitest)
  * [Setting up the Vitest Environment](#setting-up-the-vitest-environment)
    * [Step 1: Install Dependencies](#step-1-install-dependencies)
    * [Step 2: Configure Vitest](#step-2-configure-vitest)
    * [Step 3: Create the Setup File](#step-3-create-the-setup-file)
    * [Step 4: Add Test Scripts](#step-4-add-test-scripts)
    * [Step 5: Relaxing ESLint Rules for Test Files](#step-5-relaxing-eslint-rules-for-test-files)
  * [Essential Unit Testing Guidelines](#essential-unit-testing-guidelines)
    * [1. Follow the AAA Pattern](#1-follow-the-aaa-pattern)
    * [2. Test Behavior, Not Implementation](#2-test-behavior-not-implementation)
    * [3. Ensure True Isolation](#3-ensure-true-isolation)
    * [4. Write Readable and Focused Tests](#4-write-readable-and-focused-tests)
  * [Testing a Simple Component](#testing-a-simple-component)
  * [Understanding Coverage Metrics](#understanding-coverage-metrics)
  * [What&rsquo;s Next](#whats-next)
<!-- TOC -->

In large-scale development, testing is the safety net that allows us to iterate quickly without fear of breaking existing functionality.

Today, we dive into the bedrock of this safety net: **Unit Testing**, and demonstrate how to set up a lightning-fast, modern testing environment using **Vitest** for React/TypeScript applications.

## Code Source

All code snippets shown in this post are available in the dedicated branch for this article on the project's GitHub repository:

[https://github.com/franBec/tas/tree/feature/2025-10-24](https://github.com/franBec/tas/tree/feature/2025-10-24)

## What is Testing and Why Should We Care?

Testing, in the context of software development, is the process of verifying that the application behaves as expected.

### Different Kinds of Testing

While a comprehensive testing strategy involves many layers, the three most common are:

![testing pyramid](/uploads/2025-10-24-large-software-projects/Testing-automation-pyramid-1889532600.jpg)

1.  **End-to-End (E2E) Testing:** Simulates a complete user journey through the application (e.g., logging in, adding an item to a cart, and checking out). Tools like Cypress and Playwright excel here.
2.  **Integration Testing:** Verifies that multiple units or services work correctly together (e.g., checking if the frontend component correctly interacts with the API service).
3.  **Unit Testing:** The smallest form of testing. It isolates the smallest testable parts of an application (like a single function, class method, or isolated component) and verifies them in isolation.

**Our Focus Today: Unit Testing.** Unit tests are fast, easy to write, and highly localized, making them invaluable for immediate feedback during development and ensuring core logic is flawless.

## Choosing Our Tool: Why Vitest?

The unit testing landscape is rich, but the choice of tool can significantly impact developer experience and test execution speed in a large project.

| Framework                                 | Primary Focus   | Key Benefit                                            | Drawback for Unit Testing                   |
|:------------------------------------------|:----------------|:-------------------------------------------------------|:--------------------------------------------|
| **[Jest](https://jestjs.io/)**            | Unit/Component  | Mature ecosystem, familiar syntax                      | Can be slow to spin up on large projects    |
| **[Cypress](https://www.cypress.io/)**    | E2E/Integration | Excellent developer experience, runs in a real browser | Setup complexity for pure unit tests        |
| **[Playwright](https://playwright.dev/)** | E2E/Integration | Multibrowser support, great for CI                     | Overkill for simple isolated function tests |
| **[Vitest](https://vitest.dev/)**         | Unit/Component  | Extreme speed (utilizes Vite), Jest-compatible API     | Still younger than Jest                     |

For modern JavaScript/TypeScript projects built using the Vite ecosystem, **Vitest** is the clear winner. It inherits the speed and configuration simplicity of Vite, making test execution nearly instantaneous, which is critical when maintaining a large suite of unit tests.

## Setting up the Vitest Environment

### Step 1: Install Dependencies

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths @testing-library/jest-dom
```

**Dependency Breakdown:**

*   `vitest`: The core test runner.
*   `@vitejs/plugin-react`: Allows Vite (and Vitest) to process React JSX.
*   `jsdom`: A JavaScript implementation of the DOM API, required to render and interact with React components in a Node environment.
*   `@testing-library/react` / `@testing-library/dom`: Tools for testing UI components in a way that mimics user interaction (behavioral testing).
*   `vite-tsconfig-paths`: Enables module path aliases defined in your `tsconfig.json` to work correctly within tests.
*   `@testing-library/jest-dom`: Provides custom matchers (like `toBeInTheDocument()`) for better assertions.

### Step 2: Configure Vitest

Create a configuration file `vitest.config.mts` at the root of your project. This configuration sets the testing environment, defines global defaults, and, crucially for large projects, specifies coverage exclusions.

```mts
// vitest.config.mts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Required to simulate a browser environment for React components
    environment: "jsdom",
    
    // Setup file runs once before all tests
    setupFiles: ["./src/test/setup.ts"],
    
    // Exposes test functions (like 'it', 'expect') globally, avoiding imports
    globals: true,
    
    coverage: {
      exclude: [
        // Build/Generated directories
        "**/.next/**",
        "**/coverage/**",
        "**/node_modules/**",
        "**/dist/**",

        // Config files & Type declarations
        "**/*.config.*",
        "next-env.d.ts",

        // Infrastructure files
        "**/.{idea,git,cache,output,temp}/**",
        "**/public/**",

        // Files that are hard/impossible to unit test in isolation (Next.js App Router specific)
        "**/src/app/**/page.tsx", // Typically rendered by Next.js server environment
        "**/src/app/layout.tsx",
        "**/middleware.ts",

        // External/Generated Libraries (e.g., shadcn/ui components are assumed tested)
        "**/src/components/ui/**",
        "**/src/components/theme/**",
        "**/src/hooks/use-mobile.ts",
        "**/src/lib/utils.ts",
      ],
    },
  },
});
```

The exclusion list is essential in large projects. It ensures your coverage reports accurately reflect the quality of **your own application logic**, ignoring boilerplate, generated code, and framework infrastructure files.

### Step 3: Create the Setup File

We need a simple file to import the extended DOM matchers.

Create `src/test/setup.ts`:

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
```

This import provides powerful matchers like `expect(element).toBeVisible()`, enhancing the readability and power of your assertions.

### Step 4: Add Test Scripts

Add convenient scripts to run your tests from the command line:

```json
{
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
}
```

### Step 5: Relaxing ESLint Rules for Test Files

In large projects, the configuration needed for production code (e.g., performance optimizations, accessibility rules) can clutter test files. We should relax certain rules specifically for files ending in `.test.+(ts|tsx)`.

In your `eslint.config.mjs`, add the following block:

```mjs
// eslint.config.mjs
  {
    files: ["**/*.test.+(ts|tsx)"],
    rules: {
      // Disables the Next.js rule forcing the use of the Image component. 
      // Image optimization is irrelevant in unit tests.
      "@next/next/no-img-element": "off", 
      
      // Disables the accessibility rule requiring alt text. 
      // Relaxed when focus is not full accessibility compliance.
      "jsx-a11y/alt-text": "off", 
      
      // Disables the rule enforcing React components to have a displayName. 
      // Unnecessary for test components or mocks.
      "react/display-name": "off", 
      
      // Allows variables to be declared without being used, common for mocks or test data setup.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
```

This ensures a clean separation of concerns: production rules apply to production code, and test environments have the necessary flexibility.

## Essential Unit Testing Guidelines

Setting up the tooling is only half the battle; knowing **what** and **how** to test ensures your suite remains reliable and maintainable.

### 1. Follow the AAA Pattern

Every good unit test should follow three steps:

*   **Arrange:** Set up the test environment (import the module, initialize state, define inputs, mock dependencies).
*   **Act:** Execute the code under test (call the function, render the component, simulate a user click).
*   **Assert:** Verify the outcome (check the return value, verify state changes, confirm a mock function was called).

### 2. Test Behavior, Not Implementation

When testing components, avoid asserting on internal state variables or specific component lifecycle methods. Instead, use `@testing-library` to test how the user interacts with the component.

*   **Good Test:** "When the user clicks the 'Submit' button, the form fields are cleared." (Tests visible behavior).
*   **Bad Test:** "The `useState` hook for `isSubmitting` changes from `false` to `true`." (Tests internal implementation details that are prone to breaking if the component is refactored).

Querying elements by **role, label, or visible text** makes your tests robust against internal CSS or structural changes.

### 3. Ensure True Isolation

A unit test should fail only if the unit under test is broken. If it fails because an external service (like an API or database) is unreachable, it's not a unit test—it's an integration test.

Use mocking (with Vitest’s powerful `vi.mock()`) for:

*   External API calls (ensure they return predictable data).
*   Browser APIs (`localStorage`, `fetch`).
*   Global dependencies (e.g., specific hooks or utility functions used by the component).

### 4. Write Readable and Focused Tests

Each test (`it` or `test` block) should focus on one specific piece of functionality.

*   Use clear, descriptive test names that explain what is being tested and what the expected outcome is (e.g., `should display error message when input is empty`).
*   Keep test files small. If a file grows too large, it might be testing too many disparate components or functions.

## Testing a Simple Component

Given `src/components/layout/area-card.tsx`:

```tsx
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

interface AreaCardProps {
  uri: string;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function AreaCard({ title, uri, subtitle, icon: Icon }: AreaCardProps) {
  return (
    <Link href={uri}>
      <Card className="hover:shadow-lg hover:bg-accent transition-shadow cursor-pointer h-full">
        <CardContent className="py-4 px-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                {Icon ? (
                  <Icon className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <div className="w-12 h-12 bg-primary/20 rounded-full" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-semibold text-lg mb-1 leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

![area card](/uploads/2025-10-24-large-software-projects/areaCard.png)

Then `src/components/layout/area-card.test.tsx` would look something like this:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AreaCard } from "./area-card";

// Mock next/link
vi.mock("next/link", () => ({
    default: ({
                  href,
                  children,
              }: {
        href: string;
        children: React.ReactNode;
    }) => (
        <a href={href} data-testid="next-link">
            {children}
        </a>
    ),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
    Card: ({
               children,
               className,
           }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={className} data-testid="card">
            {children}
        </div>
    ),
    CardContent: ({
                      children,
                      className,
                  }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={className} data-testid="card-content">
            {children}
        </div>
    ),
}));

const MockIcon = ({ className }: { className?: string }) => (
    <svg className={className} data-testid="mock-icon" />
);

describe("AreaCard", () => {
    const defaultProps = {
        uri: "/test-uri",
        title: "Test Title",
        subtitle: "Test Subtitle",
        icon: MockIcon,
    };

    describe("Rendering & Structure", () => {
        it("should render a link wrapping the card", () => {
            render(<AreaCard {...defaultProps} />);
            const link = screen.getByTestId("next-link");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", defaultProps.uri);
            expect(screen.getByTestId("card")).toBeInTheDocument();
        });

        it("should render the card with correct content", () => {
            render(<AreaCard {...defaultProps} />);
            expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
            expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
            expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
        });
    });

    describe("Props & Variants", () => {
        it("should not render title if not provided", () => {
            const { title, ...props } = defaultProps;
            render(<AreaCard {...props} uri={props.uri} />);
            expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
        });

        it("should not render subtitle if not provided", () => {
            const { subtitle, ...props } = defaultProps;
            render(<AreaCard {...props} uri={props.uri} />);
            expect(screen.queryByText(defaultProps.subtitle)).not.toBeInTheDocument();
        });

        it("should render a placeholder if icon is not provided", () => {
            const { icon, ...props } = defaultProps;
            render(<AreaCard {...props} uri={props.uri} />);
            expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
            // Check for the placeholder div
            const cardContent = screen.getByTestId("card-content");
            const placeholder = cardContent.querySelector(".w-12.h-12");
            expect(placeholder).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have a heading for the title", () => {
            render(<AreaCard {...defaultProps} />);
            expect(
                screen.getByRole("heading", { name: defaultProps.title, level: 3 })
            ).toBeInTheDocument();
        });
    });
});
```
## Understanding Coverage Metrics

Once your tests are running, generating a coverage report is vital for identifying gaps in your testing strategy.

Let's examine the key columns from a typical coverage report:

| Metric                   | What It Measures                                                                                                                                                             | Typical Goal | Notes                                                                             |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-----------------------------------------------------------------------------------|
| **% Stmts** (Statements) | Percentage of JavaScript statements executed (e.g., variable declarations, function calls).                                                                                  | 80%+         | Common overall target. Below ~80% suggests untested code paths.                   |
| **% Lines**              | Percentage of executable lines of code covered by tests. Highly correlated with `% Stmts`.                                                                                   | 80%+         | Rough overall proxy: if this is high, tests are usually good.                     |
| **% Funcs** (Functions)  | Percentage of functions and class methods defined that were called at least once during testing.                                                                             | 80%+         | Ensures most logic entry points are tested.                                       |
| **% Branch**             | Percentage of conditional logic branches (e.g., `if`/`else`, `?`/`:` ternary operators, `switch` cases) that were fully tested (hitting both the true and false conditions). | 70%+         | Harder to reach 100%, especially in code with many conditionals or feature flags. |

While 100% coverage might sound like the goal, in practice, it is often a wasted effort. Chasing the final few percentage points often means writing complex tests for trivial code  or specific error paths that are difficult to simulate.

## What&rsquo;s Next

You now have a robust, high-performance unit testing setup using Vitest, configured for a complex modern application architecture. Unit tests provide the immediate feedback loop necessary for developers, acting as the first line of defense against regressions.

However, once code is deployed, unit tests can no longer help you identify live system issues. In large software projects, **Observability** becomes the next crucial layer of defense.

Stay tuned as we transition from ensuring code quality to guaranteeing operational stability, both locally and on our deployed VPS environment!

**Next Blog**: [Large Software Projects: Introduction to Monitoring](/en/blog/2025-10-25-large-software-projects)