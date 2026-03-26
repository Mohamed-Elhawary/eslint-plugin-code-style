<div align="center">

<img src="src/app/icon.svg" alt="eslint-plugin-code-style" width="64" height="64" />

# eslint-plugin-code-style — Documentation Website

The official documentation website for [eslint-plugin-code-style](https://www.npmjs.com/package/eslint-plugin-code-style).

**[www.eslint-plugin-code-style.org](https://www.eslint-plugin-code-style.org)**

</div>

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Next.js](https://nextjs.org) | 15 | React framework with App Router, SSR, and static generation |
| [React](https://react.dev) | 19 | UI library |
| [TypeScript](https://typescriptlang.org) | 5.8 | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first CSS framework |
| [pnpm](https://pnpm.io) | 10 | Fast, disk-efficient package manager |
| [Turbopack](https://turbo.build/pack) | — | Next.js dev server bundler |
| [Vercel](https://vercel.com) | — | Hosting and deployment |

## Features

- Server-side rendered with per-page SEO metadata (title, description, OpenGraph, Twitter cards)
- Dark/light mode with system preference detection and zero flash (inline theme script)
- Responsive layout with collapsible sidebar navigation
- All 81 rules documented across 17 category pages with good/bad code examples
- Polished code blocks with copy-to-clipboard and syntax display
- Full ESLint compliance — linted with the plugin's own `react-ts-tw` recommended config (0 errors)
- All user-facing strings centralized in data files
- Plugin version sourced from a single constant (`src/data/config.ts`)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20.0.0
- [pnpm](https://pnpm.io) >= 10.0.0

### Install

```bash
cd docs/website
pnpm install
```

### Development

```bash
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000) with Turbopack for fast refresh.

### Build

```bash
pnpm build
```

Generates a production build with static pages for all routes.

### Lint

```bash
pnpm lint        # Check for errors
pnpm lint:fix    # Auto-fix errors
```

Uses the exact `react-ts-tw` recommended ESLint config from the plugin itself.

## Project Structure

```
docs/website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with metadata and theme
│   │   ├── page.tsx            # Landing page
│   │   └── docs/               # Documentation pages
│   │       ├── getting-started/
│   │       ├── configuration/
│   │       ├── rules/
│   │       │   └── [category]/ # Dynamic rule category pages
│   │       ├── philosophy/
│   │       └── contributing/
│   ├── components/             # Reusable UI components
│   ├── data/                   # Rules data, strings, config, enums
│   ├── interfaces/             # TypeScript interfaces
│   ├── types/                  # TypeScript type aliases
│   └── lib/                    # Utility functions
├── eslint.config.js            # ESLint config (react-ts-tw recommended)
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Deployment

The website is deployed to [Vercel](https://vercel.com) with the custom domain [www.eslint-plugin-code-style.org](https://www.eslint-plugin-code-style.org).

To deploy: push to the `main` branch. Vercel automatically builds and deploys from the `docs/website/` directory.

## Keeping in Sync

The website must stay 100% in sync with the plugin. See the [AGENTS.md](../../AGENTS.md) sync checklist for the complete list of data that must be updated when the plugin changes.

Key files:
- `src/data/config.ts` — Plugin version (single source of truth)
- `src/data/rules.ts` — All 81 rules with metadata and examples
- `src/data/strings.ts` — All user-facing text content
- `src/data/navigation.ts` — Sidebar navigation structure

## License

MIT — see [LICENSE](../../LICENSE) for details.
