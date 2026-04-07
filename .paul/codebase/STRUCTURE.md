# Codebase Structure

**Analysis Date:** 2026-04-07

## Directory Layout

```
ocean-inc/
├── app/                      # Next.js App Router — pages, layouts, route handlers
│   ├── layout.tsx            # Root layout (Poppins font, metadata, global structure)
│   ├── page.tsx              # Root redirect (auth-gated to /admin, /team, /login)
│   ├── globals.css           # Global styles + Tailwind directives
│   ├── middleware.ts         # Next.js middleware (Supabase session + auth guard)
│   ├── admin/                # Admin workspace
│   ├── team/                 # Team workspace
│   ├── portal/[slug]/        # Client-facing public portal
│   ├── login/                # Login form
│   ├── invite/[token]/       # Invite redemption
│   └── api/admin/upload/     # File upload API endpoint
├── components/               # UI components
│   ├── ui/                   # shadcn/ui primitives
│   ├── admin/                # Admin-specific UI
│   ├── portal/               # Portal-specific UI
│   └── team/                 # Team-specific UI
├── lib/                      # Shared domain logic and utilities
│   ├── supabase/             # Supabase client factories
│   ├── portal/               # Portal domain logic and types
│   ├── invite/               # Invite validation
│   ├── labels.ts             # Centralized UI labels
│   └── utils.ts              # cn() + linkify() utilities
├── __tests__/                # Vitest test files (flat structure)
├── supabase/migrations/      # SQL migration files (001–014)
├── scripts/                  # Utility scripts
│   └── verify-team-rls.ts    # RLS verification script
├── public/                   # Static assets
└── .paul/                    # PAUL project management (generated)
```

## Directory Purposes

**app/** — Next.js App Router. Each subdirectory is a route. Pages (`page.tsx`), layouts (`layout.tsx`), server actions (`actions.ts`), and API routes (`route.ts`) are colocated.

**app/admin/** — Admin workspace. Clients CRUD, team management, dashboard, tasks, settings, notifications.

**app/team/** — Team member workspace. Dashboard, task assignments, notifications.

**app/portal/[slug]/** — Client-facing public portal. Single page with Kanban, Calendar, and Timeline views.

**components/ui/** — shadcn/ui primitive components: Button, Dialog, Sheet, Dropdown Menu, Select, Popover, Table, Input, Textarea, Label, Badge, Card, Switch, Field, StatusDot, ContentCard.

**components/{admin,portal,team}/** — Feature-specific composite UI that is only used within that workspace.

**lib/supabase/** — Supabase client factories. Server (`createClient()` + `createServiceRoleClient()`), browser (`createBrowserClient()`), and middleware (`updateSession()`).

**lib/portal/** — Portal domain logic. Types (`types.ts`), data aggregation (`queries.ts`), calendar utils (`calendar-utils.ts`), timeline utils (`timeline-utils.ts`).

**__tests__/** — All test files. Flat structure (not co-located with source). Two categories: `polish-*` (static file analysis tests) and behavioral unit tests.

**supabase/migrations/** — 14 SQL migration files defining schema, RLS policies, storage buckets, and fixes.

## Key File Locations

**Entry Points:**
- `app/page.tsx` — Root auth redirect (to `/admin`, `/team`, or `/login` based on role)
- `middleware.ts` — Session refresh + auth guard on every request

**Configuration:**
- `package.json` — Project metadata, dependencies, npm scripts
- `tsconfig.json` — TypeScript config (strict mode, `@/*` path alias)
- `next.config.ts` — Minimal, default config
- `vitest.config.mts` — Vitest config (jsdom, globals, vite-tsconfig-paths)
- `eslint.config.mjs` — ESLint (Next.js core-web-vitals preset)
- `components.json` — shadcn/ui configuration
- `postcss.config.mjs` — PostCSS (Tailwind v4 plugin)

**Core Logic:**
- `lib/supabase/server.ts` — Supabase server client factories (dual-client pattern)
- `lib/portal/queries.ts` — Portal data aggregation (`getPortalDataBySlug()`)
- `lib/labels.ts` — Centralized label strings
- `app/admin/clients/actions.ts` — Client CRUD + team member queries
- `app/login/actions.ts` — `login()`, `logout()`

**Testing:**
- `__tests__/` — 16 test files (Vitest)
- `vitest.config.mts` — Test runner configuration

**Database:**
- `supabase/migrations/` — 14 migration files (001 through 014)

## Naming Conventions

**Files:**
- kebab-case for all source files: `kanban-board.tsx`, `calendar-utils.ts`
- `page.tsx` — Route pages
- `layout.tsx` — Layout shells
- `actions.ts` — Server actions (colocated)
- `route.ts` — API route handlers
- `*.test.ts` / `*.test.tsx` — Test files (in `__tests__/`)

**Directories:**
- Feature-based plural names in `app/`: `admin/`, `team/`, `portal/`
- kebab-case for component subdirectories

**Component naming:** PascalCase for React component functions, file name is kebab-case: `kanban-board.tsx` exports `KanbanBoard`.

**Server action naming:** `{verb}{Noun}Action` — `createClientAction()`, `deleteClientAction()`, `getClientsAction()`.

**Type naming:** PascalCase for TypeScript types (`PortalTask`, `KanbanColumn`, `ClientRow`).

**Database types:** Separate `*Row` types (`ClientRow`, `ProjectRow`, `TaskRow` in `lib/portal/queries.ts`).

**Migration files:** Numbered `NNN_description.sql` — `001_initial_schema.sql`.

## Where to Add New Code

**New Feature Route:**
- Primary code: `app/{feature-name}/page.tsx` + `app/{feature-name}/layout.tsx`
- Server actions: `app/{feature-name}/actions.ts`
- Tests: `__tests__/{feature-name}-test.ts`

**New UI Component:**
- Primitive (reusable): `components/ui/{component-name}.tsx`
- Feature-specific: `components/{admin|portal|team}/{component-name}.tsx`
- Shared across features: `components/{component-name}.tsx`

**New Domain Logic:**
- Supabase: `lib/supabase/`
- Feature domain: `lib/{feature-name}/`
- Utility: `lib/utils.ts` (if general-purpose)

**New Migration:**
- Next numbered file: `supabase/migrations/NNN_description.sql`

## Special Directories

**.paul/** — PAUL project management (generated by `/paul:init`). Not committed to git.

**.next/** — Next.js build output. Gitignored.

**node_modules/** — Dependencies. Gitignored.

---

*Structure analysis: 2026-04-07*
*Update when directory structure changes*
