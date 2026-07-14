---
name: writing-style
description: Guidelines for creating blog posts and pages with a personal, conversational developer tone. Covers Hugo frontmatter, multi-language content synchronization, shortcode usage, heading capitalization, and writing patterns to avoid.
license: MIT
compatibility: opencode
metadata:
  type: conventions
---

## What I do

- Enforce a personal, conversational, first-person tone across all blog posts and pages
- Enforce Hugo Markdown conventions for frontmatter, shortcodes, and content structure
- Enforce bilingual content parity between `content/en/` and `content/es/`
- Flag and rewrite AI-sounding writing patterns to keep content human and approachable
- Enforce heading capitalization rules (sentence case, not title case)
- Guide code block and image reference conventions

## When to use me

- When creating or editing `.md` files in `content/en/blog/`, `content/es/blog/`, `content/en/page/`, or `content/es/page/`
- When reviewing draft blog posts for tone, voice, or formatting issues
- When converting rough notes or AI-generated drafts into polished blog content
- When ensuring English and Spanish posts stay synchronized

## Instructions

### Tone and Voice

Write like a developer sharing their experience at a meetup or over coffee, not like a technical manual:

- **First-person and personal.** Use "I" and "my." This is a personal blog. The author is Franco, a developer sharing his perspective and experiences.
- **Conversational and approachable.** Write like you're talking to another developer. Contractions ("can't," "don't," "I'm") are fine. Relaxed phrasing is welcome.
- **Opinionated but fair.** State what you think and why. When there are trade-offs, name them. Be honest about disappointments and celebrate what works.
- **Assume a developer audience.** Readers know programming concepts. Don't explain what a variable or a function is. Do explain domain-specific things (frameworks, tools, approaches) when they're not obvious.
- **Show, don't just tell.** Back up opinions with examples, code snippets, metrics, screenshots, or personal experience. Don't write a paragraph praising a tool when a concrete example of using it will do.

### Hugo Frontmatter

Every blog post must include these fields in YAML frontmatter:

```yaml
---
author: "Franco Becvort"
title: "Post Title Goes Here"
date: YYYY-MM-DD
description: "Brief post summary for SEO and cards"
categories: ["Category Name"]
thumbnail: /uploads/YYYY-MM-DD-slug/image-name.jpg
---
```

- `date` does not use quotes (it's a YAML date, not a string)
- `categories` is a YAML list with at least one item
- `thumbnail` points to an image under `/uploads/YYYY-MM-DD-slug/`
- Page frontmatter (under `content/{en,es}/page/`) may omit `date`, `categories`, and `thumbnail` if not applicable

### Multi-Language Synchronization

Every blog post should have matching files in both `content/en/blog/` and `content/es/blog/` with the same filename (`YYYY-MM-DD-slug.md`).

- **Frontmatter**: `author`, `date`, `categories`, and `thumbnail` stay the same across languages. `title` and `description` should be translated.
- **Body content**: Fully translated. Tone and personality carry over. Idiomatic expressions should be adapted, not translated literally.
- **Spanish tone**: Uses "vos" (rioplatense/Argentine Spanish) instead of "tú." The blog's Spanish is informal and personal, matching the English tone.
- **Code blocks, technical terms, and file paths**: Remain in English. Do not translate code snippets, variable names, API names, or terminal output.
- **Images and shortcodes**: Keep all asset paths and shortcode markup identical. Only translate the surrounding prose.
- **Links**: External links stay the same. Internal links to other posts should use the correct language path (`/es/` vs `/en/`).

### Content Structure

Blog posts don't need rigid templates, but effective posts tend to follow these patterns:

- **Open with a hook.** A personal anecdote, a question, or a statement that draws the reader in. Don't start with "In this post I will discuss..." — just jump into it.
- **Use headings to guide flow.** Break content into scannable sections. The first heading after the frontmatter should match the post's topic.
- **Table of contents is optional.** Some posts use a `<!-- TOC -->` HTML comment block for a table of contents. This is author preference, not a requirement.
- **End with a conclusion or takeaway.** Wrap up with a personal reflection, a summary of lessons learned, or a call to action. Don't trail off after a code block or image.
- **Avoid generic wrap-up phrases.** Don't use "In conclusion, we have seen that..." or "To summarize, this post explored..." — just state the takeaway naturally.

### Images and Media

- Images live under `/uploads/YYYY-MM-DD-slug/` matching the post's filename
- Use standard Markdown image syntax: `![alt text](/uploads/YYYY-MM-DD-slug/image-name.png)`
- YouTube videos use Hugo shortcodes: `{{</* youtube VIDEO_ID */>}}`
- GIFs and screenshots are welcome — the blog has a casual, visual style

### Code Blocks

- Use fenced code blocks with language identifiers: ` ```java `, ` ```groovy `, ` ```kt `, ` ```yaml `, ` ```bash `
- Terminal output uses ` ``` ` without a language or with ` ```log `
- Inline code uses single backticks for class names, annotations, commands: `` `@RestController` ``
- Code examples should be concise — show the relevant snippet, not entire files
- When comparing across languages (e.g., Java vs Groovy vs Kotlin), show code blocks side by side with clear labels

### Heading Capitalization

Use **sentence case** for all headings:

```markdown
## From quick e-book idea to something more

### Writing tests with Spock

## Why hexagonal architecture matters
```

Only the first word and proper nouns (Spring Boot, Java, Kotlin, Groovy, H2, PostgreSQL, Next.js, GitHub) are capitalized.

Do not use title case:

| Title case (avoid)          | Sentence case (use)         |
| --------------------------- | --------------------------- |
| Writing Tests With Spock    | Writing tests with Spock    |
| Understanding The Application | Understanding the application |

Frontmatter `title` should use the author's preferred capitalization — blog post titles often have their own style (full title case is acceptable here).

### Writing Patterns to Avoid

These patterns are adapted from research on AI-generated writing. Train yourself to spot and eliminate them. When one or two appear, rewrite.

#### AI vocabulary overload

LLMs overuse certain words that signal "machine wrote this." If you catch yourself reaching for any of the following, pick a plainer word or cut the phrase entirely:

- **2023–mid 2024 era (still common in output):** additionally, boasts, bolstered, crucial, delve, emphasizing, enduring, garner, intricate/intricacies, interplay, key (as adjective), landscape (as abstract noun), meticulous/meticulously, pivotal, showcase, tapestry, testament, underscore, valuable, vibrant
- **Mid 2024–mid 2025 era:** align with, bolstered, crucial, emphasizing, enhance, enduring, fostering, highlighting, pivotal, showcasing, underscore, vibrant
- **Mid 2025 onward:** emphasizing, enhance, highlighting, showcasing (plus notability/significance language)

| Avoid                                                    | Use                                                  |
| -------------------------------------------------------- | ---------------------------------------------------- |
| "Spring Boot underscores the importance of configuration" | "Spring Boot forces you to be explicit about config" |
| "This section delves into dependency injection"          | "This section covers dependency injection"           |
| "Showcasing its robust error handling"                   | "Showing how error handling works"                   |

#### Avoiding "is"/"are" (copula avoidance)

LLMs swap simple "is"/"are" for inflated phrases. Prefer the plain form.

| Avoid                                              | Use                                         |
| -------------------------------------------------- | ------------------------------------------- |
| "The framework serves as a foundation"             | "The framework is a foundation"             |
| "This approach represents the best option"         | "This approach is the best option"          |
| "The application boasts auto-configuration"        | "The application has auto-configuration"    |

#### Negative parallelisms

LLMs love "Not just X, but also Y" and "It is not X, it is Y." They sound dramatic but add no information.

| Avoid                                                    | Use                                             |
| -------------------------------------------------------- | ----------------------------------------------- |
| "Groovy is not just a language, but a different mindset" | "Groovy is a more expressive way to write Java" |
| "It's not about speed — it's about reliability"          | "Java prioritizes reliability over speed"       |

#### Rule of three

LLMs default to listing exactly three items. If three items genuinely belong, keep them. If padding, cut.

| Avoid                                                              | Use                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| "The guide is practical, opinionated, and accessible"              | "The guide is practical and opinionated"                            |
| "We'll cover configuration, dependency injection, and error handling" | "We'll cover configuration and dependency injection"            |

#### Elegant variation

LLMs avoid repeating a word by cycling through synonyms. In technical posts, consistency beats variety. If you called it a "controller" on line 1, call it a "controller" on line 20 — not "endpoint handler," "request mapper," or "API gateway."

#### Puffery and significance language

Don't tell the reader something is important, crucial, pivotal, or a game-changer. Show why it matters with a concrete fact or personal experience instead.

| Avoid                                                    | Use                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| "Dependency injection plays a crucial role in Spring"    | "Spring uses dependency injection to wire your beans — here is how" |
| "This powerful feature empowers developers"              | "This feature lets you skip boilerplate"                           |

Avoid: _is a testament to_, _underscores the importance of_, _reflects broader trends in_, _setting the stage for_, _marks a shift toward_.

#### Promotional and travel-guide language

Don't write like a sales page or tourism brochure:

| Avoid                                              | Use                                     |
| -------------------------------------------------- | --------------------------------------- |
| "A vibrant community of developers"                | "An active community"                   |
| "Spring Boot boasts auto-configuration"            | "Spring Boot has auto-configuration"    |
| "A rich tapestry of features"                      | "A set of features"                     |

#### Overuse of em dashes

Em dashes (—) have a place, but LLMs use them far more than humans do, often where a comma, colon, or period would be clearer. Prefer commas, colons, or separate sentences. If you use more than one em dash per paragraph, rewrite.

| Avoid                                                                                      | Use                                                                           |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| "Spring Boot auto-configures your app — meaning you write less code — and still lets you override" | "Spring Boot auto-configures your app so you write less code, and you can still override" |

#### Overuse of boldface

Bold a term **once** when you introduce or emphasize it. Don't bold every occurrence, and don't bold routine "key takeaways" in running prose.

#### Outline-like conclusions

LLMs tend to close with summary paragraphs listing challenges and future prospects: "While X presents challenges, it also offers opportunities. As the landscape evolves, Y will remain essential." End sections at the last useful fact or example. For post-ending conclusions, use the author's voice — a personal takeaway, a question, or a candid reflection.

#### Superficial analysis with present participles

LLMs attach "-ing" phrases that sound analytical but say nothing: "highlighting the importance of," "emphasizing the need for," "reflecting broader trends in." Delete these clauses or replace them with a concrete statement.

| Avoid                                                                                             | Use                                                              |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| "Auto-configuration reduces boilerplate, highlighting Spring Boot's focus on developer productivity" | "Auto-configuration reduces boilerplate"                         |
| "The annotation scans your packages, ensuring all components are registered"                      | "The annotation scans your packages and registers all components" |

### Quick Self-Check

Before finalizing any post, re-read it and ask:

1. **Does this sound like something Franco would actually say?** If it sounds like a press release or textbook, rewrite it.
2. **Can I cut any word from this sentence without losing meaning?** If yes, cut it.
3. **Am I telling the reader something is important, or showing them?** Show, don't tell.
4. **Do I see any words from the AI vocabulary list?** Replace or remove them.
5. **Does the post open with a personal hook?** If it starts with "In this post I will...", rework it.
6. **Does the post get to the point quickly?** Readers should know what the post is about within the first few sentences.
7. **If this is a bilingual post, do both language versions have matching filenames and frontmatter?**
8. **Are code blocks using fenced syntax with language identifiers?**
9. **Are images referenced from `/uploads/` with the correct slug path?**
