# Architecture

**Analysis Date:** 2026-04-07

## Pattern Overview

**Overall:** Next.js 16 App Router monolith (full-stack web application) — "Orca Digital"

**Key Characteristics:**
- Feature-based vertical segmentation within `app/` directory
- Server components as default, client components opt-in via `'use client'`
- Server actions (`'use server'`) colocated with their consuming pages
- Supabase dual-client pattern (RLS-aware + service role)
- No REST API layer beyond single upload route — all mutations via server actions

## Layers

### Layer 1: Next.js App Router (Routes + Server Components)

- **Purpose:** Page rendering, auth routing, layout shells
- **Location:** `app/*.tsx` — pages, layouts
- **Key files:** `app/page.tsx` (root auth redirect), `app/layout.tsx` (root layout)
- **Depends on:** Supabase server client for data queries
- **Used by:** Browser requests through middleware

### Layer 2: Next.js Middleware (Auth Guard)

- **Purpose:** Supabase session refresh on every request, redirect unauthenticated users
- **Location:** `middleware.ts`
- **Session helper:** `lib/supabase/middleware.ts` — `updateSession()`
- **Protected routes:** `/admin`, `/team`
- **Public routes:** `/login`, `/invite`, `/portal`

### Layer 3: Server Actions (Mutations + Queries)

- **Purpose:** Database mutations, cache revalidation, redirects
- **Location:** `app/**/actions.ts` files, colocated with pages
- **Pattern:** Return discriminated union `{ success: true, data } | { success: false, error: string }` for queries; `redirect()` for mutations
- **Key files:**
  - `app/admin/clients/actions.ts` — Client CRUD, team member queries
  - `app/login/actions.ts` — `login()`, `logout()`
  - `app/team/tasks/actions.ts` — Team task update actions
  - `app/invite/[token]/actions.ts` — Invite redemption
  - `app/portal/[slug]/page.tsx` — Portal data aggregation (uses service role client)

### Layer 4: Supabase Data Access

- **Purpose:** Client factories for database access
- **Location:** `lib/supabase/`
- **Key files:**
  - `lib/supabase/server.ts` — `createClient()` (RLS-aware, user-scoped), `createServiceRoleClient()` (bypasses RLS, admin)
  - `lib/supabase/client.ts` — Browser client (`createBrowserClient`)
  - `lib/supabase/middleware.ts` — Session helpers

### Layer 5: Domain Logic

- **Purpose:** Business logic, utilities, type definitions
- **Location:** `lib/{feature}/`
- **Key files:**
  - `lib/portal/types.ts` — Domain types: `PortalTask`, `PortalProject`, `PortalClient`, `PortalData`
  - `lib/portal/queries.ts` — `getPortalDataBySlug()` — aggregates client, projects, tasks
  - `lib/portal/calendar-utils.ts` — `buildWeekGrid()`, `buildMonthGrid()`, `groupTasksByPostingDate()`
  - `lib/portal/timeline-utils.ts` — `groupTasksByMonth()`, `calculateTimelineOffset()`
  - `lib/labels.ts` — Centralized UI label strings (`LABELS` constant with `as const`)
  - `lib/utils.ts` — `cn()` (tailwind-merge utility), `linkify()` (URL → HTML links)
  - `lib/invite/validate.ts` — `validateToken()` — invite token validation

### Layer 6: UI Components

- **Primitive components:** `components/ui/` — shadcn/ui components (Button, Dialog, Sheet, Table, Input, etc.)
- **Feature components:** `components/{admin,portal,team}/` — domain-specific UI
- **Pattern:** Components use CVA (`class-variance-authority`) for typed variants

### Layer 7: API Route Handlers

- **Purpose:** File upload (only REST endpoint)
- **Location:** `app/api/admin/upload/route.ts` — POST only, multipart form data, images <= 10MB

## Data Flow

### Server Component Page Load
```
Browser Request → middleware.ts (session refresh + auth guard)
  → Route matches app/(path)/page.tsx (Server Component)
  → Server Component calls createClient() or createServiceRoleClient()
  → Supabase query → data returned → HTML rendered → sent to browser
```

### Form Submission / Mutation
```
User interaction → React Server Action (app/**/actions.ts)
  → Server Action calls createServiceRoleClient()
  → Supabase mutation (DB write / delete / update)
  → revalidatePath() invalidates cached routes
  → redirect() navigates user to new page
```

### File Upload
```
User uploads file → POST /api/admin/upload/route.ts
  → Route Handler calls createServiceRoleClient()
  → Supabase Storage upload to 'design-files' bucket
  → Returns JSON response with file path
```

### Client Portal (Public)
```
Browser → /portal/[slug] page.tsx (Server Component, force-dynamic)
  → getPortalDataBySlug(slug) from lib/portal/queries.ts
  → Uses serviceRoleClient to bypass RLS (public portal access)
  → Returns PortalData → renders PortalShell with Kanban/Timeline/Calendar views
```

### Auth Flow
```
/login POST → login() server action → supabase.auth.signInWithPassword()
  → On success: redirect based on user.app_metadata.role
    ('team_member' → /team, else → /admin)
```

**State Management:** Stateless server components + Next.js route caching. No client-side state management library.

## Key Abstractions

### Supabase Client Factory Pattern
Dual-client pattern provides two access modes:
- `createClient()` — RLS-aware, user-scoped, for authenticated user flows
- `createServiceRoleClient()` — Bypasses RLS, for admin data access and public portal
- Examples: `lib/supabase/server.ts`

### Server Actions as Data Access Layer
All mutations go through `'use server'` functions in `actions.ts` files:
- Query actions return discriminated unions for error handling
- Mutation actions use `redirect()` with error query params for navigation
- Examples: `app/admin/clients/actions.ts`

### shadcn/ui + CVA Pattern
Component variant system with typed combinations:
- Examples: `components/ui/button.tsx` — uses `cva()` for variant + size
- Configuration: `components.json` — shadcn config (default style, CSS variables, no prefix)

### Centralized Labels
Single source of truth for all UI text:
- Examples: `lib/labels.ts` — `LABELS` constant organized by domain
- Separates copy from code

## Error Handling

**Strategy:** Server actions return error results or redirect with error query params. API routes return JSON errors with status codes.

**Patterns:**
- Supabase `{ error, data }` pattern propagates through all layers
- Server actions: `redirect()` with URL query params (`/admin/clients?error=...`) — errors `encodeURIComponent`'d
- API routes: `NextResponse.json({ error: message }, { status: code })`
- Portal page: Returns `notFound()` when client slug is invalid
- Non-null assertions on env vars: `process.env.NEXT_PUBLIC_SUPABASE_URL!`

## Cross-Cutting Concerns

**Authentication/Authorization:** Supabase Auth with role-based routing (admin, team_member). RLS policies enforce data isolation. Middleware protects `/admin` and `/team` routes.

**Caching:** `revalidatePath()` called after mutations to invalidate Next.js route cache.

**Responsive design:** Tailwind breakpoints (`lg:`, `sm:`), mobile-specific nav components (`MobileNav`, `TeamMobileNav`), collapsed sidebar on mobile.

**Role-based access:** `user.app_metadata.role` checked at root page, admin layout, and team layout level.

---

*Architecture analysis: 2026-04-07*
*Update when major patterns change*
