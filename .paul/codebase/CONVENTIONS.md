# Coding Conventions

**Analysis Date:** 2026-04-07

## Naming Patterns

**Files:**
- kebab-case for all source files: `kanban-board.tsx`, `calendar-utils.ts`, `task-create-form.tsx`
- `page.tsx` — Route pages in App Router
- `layout.tsx` — Layout shells
- `actions.ts` — Server actions (colocated with routes)
- `route.ts` — API route handlers
- `*.test.ts` / `*.test.tsx` — Test files (in `__tests__/`, not co-located)
- `*.tsx` — React components
- `*.ts` — Non-React modules (types, utilities, actions)

**Functions:**
- camelCase for all functions
- Server actions: `{verb}{Noun}Action` — `createClientAction()`, `getClientsAction()`, `deleteClientAction()`
- Event handlers: `handleEventName` — `handleDragEnd`
- No special prefix for async functions

**Variables:**
- camelCase for variables
- UPPER_SNAKE_CASE for module-level constants (`URL_REGEX`, `MIN_CLIENT_NAME_LENGTH`, `SLUG_BYTES`)

**Types:**
- PascalCase for all TypeScript types (`PortalTask`, `KanbanColumn`, `ClientRow`)
- No `I` prefix for interfaces
- Separate `*Row` types mirror DB columns in snake_case (`ClientRow`, `TaskRow`)

## Code Style

**Formatting:**
- 2-space indentation
- No Prettier config found — ESLint handles formatting via `eslint-config-next/core-web-vitals`
- Inconsistent semicolons — some files (`lib/supabase/server.ts`, `next.config.ts`) use them; others (`lib/utils.ts`, `lib/portal/calendar-utils.ts`) omit them
- Dominant quote style: double quotes for imports and JSX attributes

**Linting:**
- ESLint 9 — `eslint.config.mjs` with `eslint-config-next/core-web-vitals` and TypeScript rules

## Import Organization

**Path Aliases:**
- `@/*` maps to project root (`tsconfig.json` `compilerOptions.paths`)

**Order:**
1. External packages (`next/navigation`, `@supabase/supabase-js`)
2. Internal `@/` imports (`@/lib/supabase/server`, `@/components/ui/button`)
3. Relative imports (`.`, `..`)

**Grouping:**
- Blank line between groups (internal vs external)
- `import type` syntax used for TypeScript-only imports (e.g., `import type { PortalTask } from '@/lib/portal/types'`)

## Error Handling

**Patterns:**
- Server actions return discriminated unions: `{ success: true, data } | { success: false, error: string }`
- Mutation actions: `redirect()` with error query params (`/path?error=...`)
- Supabase `{ error, data }` pattern propagates through all layers
- API routes: `NextResponse.json({ error: message }, { status: code })`

**Environment:**
- Non-null assertions on env vars: `process.env.NEXT_PUBLIC_SUPABASE_URL!`
- No runtime validation of env var presence

## Logging

- `console.log` for basic output (no dedicated logging framework)
- No structured logging library detected

## Comments

- Minimal inline comments throughout codebase
- JSDoc used sparingly — `lib/labels.ts` has a top comment: "Centralized UI labels -- single source of truth"
- Test files have structured headers with phase references: `Phase 05 -- Labels Usage Test (05-01-02)`
- No CONTRIBUTING.md, README is default Next.js bootstrap

## Function Design

**Server Actions:**
- Authenticate user → call Supabase → `revalidatePath()` → `redirect()` (for mutations)
- Query actions return typed result objects

**Components:**
- Server components by default, opt-in via `'use client'` directive
- Components use CVA pattern via `class-variance-authority` for typed variants

## Module Design

**Exports:**
- Named exports throughout codebase
- `export default` for React components (Next.js convention for page.tsx)

**Centralized Labels:**
- `lib/labels.ts` — Single `LABELS` constant with `as const`, organized by domain (`task`, `project`, `client`, `dashboard`, `common`)

---

*Convention analysis: 2026-04-07*
*Update when patterns change*
