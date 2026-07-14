# AGENTS.md

## Execution Environment

- The environment is running **BusyBox**, which provides a lightweight version of common Unix tools.
- The `pgrep` command is a "stripped down" version and **does not support the `-g` flag**.

## Setup

```bash
git submodule update --init --recursive
npm install
```

Hugo must be installed separately (check `hugo version`). The theme lives in `themes/blist/` as a git submodule.

## Dev server

```bash
npm start
# equivalent to: hugo server --disableFastRender
```

## Production build

```bash
npm run build
# equivalent to: NODE_ENV=production hugo --gc
```

Output goes to `public/` (gitignored).

## Architecture

**Multi-language Hugo blog** using the [Blist](https://github.com/apvarun/blist-hugo-theme) theme.

| Directory | Purpose |
|---|---|
| `content/en/` | English posts and pages |
| `content/es/` | Spanish posts and pages |
| `static/` | Static assets (images, uploads, favicon) |
| `layouts/` | Theme overrides (`index.html` customizes the homepage) |
| `themes/blist/` | Theme submodule — do NOT edit here, override in `layouts/` |
| `archetypes/` | Hugo content templates for `hugo new` |

## Content conventions

- Posts live under `content/{en,es}/blog/` with filenames: `YYYY-MM-DD-slug.md`
- Pages live under `content/{en,es}/page/`
- Frontmatter uses **YAML** (`config.toml` sets `metaDataFormat = "yaml"`)
- Required frontmatter fields for blog posts: `author`, `title`, `date`, `description`, `categories`, `thumbnail`
- Every post should have matching files in both `content/en/blog/` and `content/es/blog/`

## Netlify CMS

A Netlify CMS (Decap) admin panel is configured at `static/admin/config.yml`.
- Backend: `git-gateway`, branch: `master`
- Media uploads go to `static/uploads/`
- CMS collections: `blogEN` (content/en/blog) and `blogES` (content/es/blog)

## Build dependencies

The `npm start`/`npm run build` scripts trigger Hugo directly. Tailwind CSS and PostCSS are installed as devDependencies but **no CSS build step is required at dev time** — the Blist theme handles its own CSS pipeline.

## Deployment

Deployed on **Netlify** from `github.com/franBec/pollitoDev` with Hugo. Live at **https://pollito.dev/**. Auto publishing is enabled — every push to `master` triggers a deploy automatically. No CI/CD pipeline is configured within this repo; Netlify handles the build and deploy.

## Notes

- `--disableFastRender` is used because the homepage relies on `.Site.RegularPages` ordering, which fast render does not pick up on rebuild.
- No tests, linters, or type checking are set up (content-only site).
- **Hugo version compatibility:** The Blist theme's `pagination.html` partial uses the `_internal/pagination.html` template, which was removed in Hugo v0.120+. Production builds target Hugo v0.105.0. If the dev hugo is v0.120+, you'll need to override `layouts/partials/pagination.html` with a custom pagination that doesn't rely on the removed internal template.
