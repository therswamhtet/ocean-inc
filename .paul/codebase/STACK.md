# Technology Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**
- TypeScript 5.x — All application code (`tsconfig.json` strict mode, ES2017 target, `jsx: "react-jsx"`)
- TSX — React components throughout `app/` and `components/`

## Runtime

**Environment:**
- Node.js (LTS) — runs Next.js 16.2.2 server
- React 19.2.4 — `package.json`
- No `.nvmrc` or `.node-version` file detected for explicit pinning

**Package Manager:**
- npm — Lockfile: `package-lock.json` (338KB)

## Frameworks

**Core:**
- Next.js 16.2.2 (App Router) — Full-stack framework, server components, server actions
- Tailwind CSS v4 — Styling via `@tailwindcss/postcss` integration
- Radix UI primitives — Accessible component foundations (`@radix-ui/react-dialog`, `dropdown-menu`, `select`, `popover`, `toast`, `slot`, `label`)
- shadcn/ui — UI component library (`components.json`: default style, RSC enabled, CSS variables, no prefix)

**Forms & Validation:**
- react-hook-form 7.x — Form state management
- Zod 4.3.6 — Schema validation
- @hookform/resolvers 5.x — Zod + react-hook-form integration

**Data & Utilities:**
- date-fns 4.x — Calendar date manipulation (`lib/portal/calendar-utils.ts`)
- @dnd-kit/core 6.x + @dnd-kit/sortable 10.x — Kanban drag-and-drop
- Lucide React 1.7.0 — Icon library
- class-variance-authority 0.7.x — Component variant system (`components/ui/*.tsx`)
- clsx + tailwind-merge — Conditional className merging (`lib/utils.ts` `cn()` utility)

**Testing:**
- Vitest 4.1.2 — Test runner (`vitest.config.mts`)
- @testing-library/react 16.x + @testing-library/dom 10.x — Component testing with jsdom

**Linting:**
- ESLint 9 — `eslint.config.mjs` with `eslint-config-next/core-web-vitals`

## Configuration

**Environment:**
- `.env.local` — Local environment variables (gitignored, no `.env.example` template)
- Key vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `VERCEL_API_KEY`

**Build:**
- `tsconfig.json` — TypeScript (strict mode, `@/*` path alias)
- `next.config.ts` — Minimal, default config
- `postcss.config.mjs` — Tailwind v4 plugin
- `components.json` — shadcn/ui configuration

## Platform Requirements

**Development:**
- npm + Node.js — Any platform
- No external services beyond Supabase project

**Production:**
- Vercel — Next.js hosting (inferred from `.vercel/` directory, `VERCEL_API_KEY` env var)
- Supabase — PostgreSQL database, auth, storage
