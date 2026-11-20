# AGENTS.md

## Setup

Netlify pins Hugo 0.169.0 via scripts/build.sh. Local Hugo 0.170.1 is fine. No npm, no theme submodule.

```bash
hugo version
```

## Dev server

```bash
hugo server --disableFastRender
```

## Production build

```bash
bash scripts/build.sh
```

Output goes to `public/` (gitignored).

## Architecture

Custom Hugo theme in this repo.

| Directory | Purpose |
|---|---|
| `content/en/` | English posts and pages |
| `content/es/` | Spanish posts and pages |
| `layouts/` | Theme templates and partials |
| `assets/css/` | Main stylesheet and Chroma styles |
| `assets/js/` | Search, menu, TOC, copy button |
| `assets/images/` | Site photos |
| `static/` | Static assets, uploads, favicon |
| `i18n/` | English and Spanish UI strings |
| `mockups/` | Static design references, not published |

## Content conventions

- Posts live under `content/{en,es}/blog/` with filenames: `YYYY-MM-DD-slug.md`
- Pages live under `content/{en,es}/page/`
- Frontmatter uses YAML
- Required frontmatter fields: `author`, `title`, `date`, `description`, `categories`, `thumbnail`
- Every post should have matching files in both `content/en/blog/` and `content/es/blog/`
- Keep existing filenames and category names. URLs depend on them.
- Article TOCs are generated from headings. Do not add manual TOC blocks.

## Images

- Post images live in `static/uploads/` and keep their original URLs.
- Site photos live in `assets/images/` and are processed by Hugo.
- Use `partials/responsive-image.html` for responsive WebP output.
- Learn more at `https://gohugo.io/functions/images/`.

## Deployment

Netlify builds from `github.com/franBec/pollitoDev`. Live at `https://pollito.dev/`.
`master` auto-publishes; use a branch and a deploy preview before merging.

Netlify runs `scripts/build.sh`, which downloads Hugo 0.169.0. The dashboard `HUGO_VERSION` value is ignored by the script.

## Notes

- No Decap CMS.
- No Tailwind, PostCSS, or npm build step.
- No dark mode.
- Search uses `/en/index.json` and `/es/index.json`.
- Root language is English; `/` redirects to `/en/`.
