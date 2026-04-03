# Architecture Patterns

**Domain:** Next.js 15 App Router + Supabase project management & client portal
**Researched:** 2026-04-04
**Confidence:** HIGH (verified against Supabase SSR docs, RLS documentation, Next.js App Router patterns)

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Admin App   │  │  Team Member │  │  Client Portal       │  │
│  │  (auth'd)    │  │  (auth'd)    │  │  (slug, no auth)     │  │
│  │              │  │              │  │  (public read)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
├─────────┴─────────────────┴──────────────────────┴──────────────┤
│                        Routing & Security                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌───────────────────────────────────────┐   │
│  │   Middleware │  │  Route Groups                         │   │
│  │   (cookies)  │  │  (app)/admin, (app)/team, (client)    │   │
│  └──────┬───────┘  └──────────────┬────────────────────────┘   │
│         │                         │                            │
├─────────┴─────────────────────────┴────────────────────────────┤
│                         Data Access Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Server Actions  │  │  Server Comps    │  │  Client Side │  │
│  │  (mutations)     │  │  (reads)         │  │  (interact)  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │          │
├───────────┴─────────────────────┴────────────────────┴──────────┤
│                         Supabase Backend                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │  Auth        │  │  Storage Buckets     │  │
│  │  + RLS       │  │  (cookies)   │  │  + bucket policies   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Middleware** | Token refresh, cookie forwarding, route protection | `middleware.ts` with `@supabase/ssr` cookie management |
| **Server Components** | Data fetching, rendering, authorization checks | Async page/layout components using `createClient()` from server utils |
| **Server Actions** | Database mutations (create/update/delete tasks, clients, etc.) | `'use server'` functions with revalidatePath after mutations |
| **Client Components** | Interactive UI (forms, Kanban drag, file uploads) | Marked with `'use client'`, call server actions, use Supabase browser client |
| **Route Groups** | URL-scoped feature isolation | `(admin)/`, `(team)/`, `client/` directory structure |
| **RLS Policies** | Row-level data isolation per user role | Postgres policies on every table using `auth.uid()` and role checks |
| **Storage Buckets** | Design file storage with role-scoped access | Separate buckets or bucket policies that mirror RLS logic |

## Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Route group: authentication routes
│   │   ├── login/                 # Admin login page
│   │   └── team-join/[token]/     # Team member registration via invite token
│   ├── (admin)/                   # Route group: admin-only area
│   │   ├── dashboard/             # Metrics overview
│   │   ├── clients/               # Client CRUD
│   │   ├── clients/[id]/          # Client detail + projects
│   │   ├── projects/[id]/         # Project detail + task management
│   │   ├── team/                  # Team member management
│   │   └── notifications/         # In-app notifications
│   ├── (team)/                    # Route group: team member area
│   │   ├── tasks/                 # Assigned tasks list
│   │   └── tasks/[id]/            # Task detail + edit + file upload
│   ├── client/[slug]/             # Client portal (no route group = public)
│   │   ├── page.tsx               # Kanban view (default)
│   │   ├── calendar/              # Calendar view
│   │   └── timeline/              # Timeline view
│   ├── api/                       # Route handlers (if server actions insufficient)
│   │   └── revalidate/            # On-demand ISR revalidation endpoint
│   ├── layout.tsx                 # Root layout (Poppins font, B&W theme)
│   └── page.tsx                   # Redirect to login
│
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── admin/                     # Admin-specific components
│   ├── team/                      # Team-specific components
│   ├── client/                    # Client portal components
│   └── shared/                    # Cross-role components (status badges, copy button)
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts              # createClient() for server components/actions
│   │   ├── client.ts              # createBrowserClient() for client components
│   │   └── middleware.ts          # createServerClient() for middleware
│   ├── db/
│   │   ├── queries/               # Reusable read queries (one file per table)
│   │   └── mutations/             # Reusable write queries
│   └── validations/               # Zod schemas for form validation
│
├── hooks/                         # Custom React hooks
│   └── use-project-tasks.ts       # Example: shared task-fetching hook
│
├── types/                         # Shared TypeScript types
│   └── database.ts                # Generated Supabase types
│
└── actions/                       # Server actions (mutations)
    ├── client-actions.ts
    ├── project-actions.ts
    ├── task-actions.ts
    ├── team-actions.ts
    └── notification-actions.ts
```

### Structure Rationale

- **Route groups `(admin)`, `(team)`:** Separate URL namespaces that share no layout concerns. Admin and team areas have different layouts, navigation, and auth requirements. Route groups prevent URL path collision without adding path segments.
- **`client/` is NOT in a route group:** The client portal is public (no auth). It must be a top-level route so its pages are not accidentally wrapped in admin auth layout or protected by middleware.
- **`actions/` separate from `lib/db/mutations/`:** Server actions are the public API for client components. The `actions/` directory contains the `'use server'` entry points; `lib/db/mutations/` contains lower-level database functions that can also be called from server components during initial render.
- **`lib/supabase/` three-client pattern:** Next.js needs three Supabase client factories (server, browser, middleware). Colocating them prevents import confusion -- a documented Supabase SSR requirement.

## Architectural Patterns

### Pattern 1: Three-Client Supabase SSR

**What:** Create three distinct Supabase client factories, each bound to its execution context.

**When to use:** Always with Next.js App Router + Supabase. This is not optional -- it is the official SSR pattern from `@supabase/ssr`.

**Trade-offs:** Slightly more boilerplate than a single client, but prevents token leakage between requests and enables RLS to function correctly in server components.

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          // Must handle in middleware for server components
          // setAll is called but cookies written here are discarded
          // The middleware proxy handles the actual cookie writing
        },
      },
    }
  )
}

// Usage in a server component:
export default async function DashboardPage() {
  const supabase = await createClient()

  // This query runs with RLS based on the authenticated user's role
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, projects(*), assigned_to:user_id(*)')
```

### Pattern 2: Server Actions for All Mutations

**What:** Use `'use server'` functions for all database mutations instead of API route handlers.

**When to use:** Always in Next.js 15 App Router for CRUD operations. Server actions eliminate the need for API routes for standard mutations, reduce client-server round trips, and integrate with form `action` props.

**Trade-offs:** Server actions cannot be called from outside your app (no external API consumers). If third-party integrations are needed later, add route handlers in `app/api/`.

```typescript
// actions/task-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTaskCaption(taskId: string, caption: string) {
  const supabase = await createClient()

  // RLS policy ensures only the authenticated user can update
  // their assigned tasks (or admin can update any)
  const { error } = await supabase
    .from('tasks')
    .update({ caption })
    .eq('id', taskId)

  if (error) throw error

  revalidatePath('/(team)/tasks')
  revalidatePath('/(admin)/projects/[id]')
}
```

### Pattern 3: Middleware-Based Cookie Auth with Route Groups

**What:** A Next.js middleware refreshes Supabase auth tokens and forwards them via cookies to all server components. Route groups (`(admin)`, `(team)`) segment the app, while `client/` routes remain public.

**When to use:** Always. This is the official Supabase SSR pattern for Next.js.

**Trade-offs:** Middleware runs on every matched request. Keep the matcher narrow (only auth'd routes) to avoid unnecessary token refresh on static/public pages.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => response.cookies.set(name, value))
        },
      },
    }
  )

  // Refresh the session -- this validates and updates the token
  const { data: { session } } = await supabase.auth.getSession()

  // Route protection logic
  const { pathname } = request.nextUrl

  // Protect admin and team routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/team')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|client/).*)'],
}
```

### Pattern 4: Role-Aware RLS Policies

**What:** Every table has RLS enabled. Policies check the user's role (stored in `auth.users.raw_user_meta_data` or a `profiles` table) to determine access level. Admin bypasses all restrictions; team members see only assigned data; the client portal bypasses RLS entirely via public policies on a `public_project_data` view.

**When to use:** Always. This is the core security model. No exceptions.

**Trade-offs:** RLS policies add query complexity and require indexes on policy-checked columns. Poorly written policies cause N+1 subqueries on every row.

**Critical insight from Supabase docs:** Use subqueries like `(select auth.uid())` instead of calling `auth.uid()` directly in policy expressions -- the subquery form is faster because the database can optimize it.

```sql
-- Example RLS policies for tasks table

-- Admin: full access
CREATE POLICY "Admins have full access on tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- Team members: read/update only assigned tasks
CREATE POLICY "Team members see own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
  );

CREATE POLICY "Team members update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Client portal: public read via view (not direct table access)
-- The client_slug determines which projects are visible
CREATE POLICY "Public can view task data for client portal"
  ON tasks FOR SELECT
  TO anon
  USING (true);  -- gated by application-level slug validation, not table-level RLS
```

**Important security note on the client portal:** Since client access is slug-based (no auth), the tasks table must allow `anon` SELECT. Security comes from the application layer: the server component validates the slug against the `clients` table, then queries only tasks belonging to that client's projects. The RLS `TO anon USING (true)` is intentional -- the slug is the auth token. If the slug is long and unguessable (e.g., UUID or nanoid), this is secure.

**Better approach for client portal security:** Create a dedicated view that joins only the columns needed for the client portal, and enable RLS on that view with `security_invoker = true`. This limits what a compromised slug can expose.

```sql
-- Dedicated read-only view for client portal
CREATE VIEW public_project_view WITH (security_invoker = true) AS
SELECT
  t.id,
  t.title,
  t.caption,
  t.design_file_url,
  t.posting_date,
  t.status,
  p.month_label,
  c.name AS client_name
FROM tasks t
JOIN projects p ON p.id = t.project_id
JOIN clients c ON c.id = p.client_id
WHERE c.is_active = true;

-- Public can select from this view (RLS on base tables still applies)
GRANT SELECT ON public_project_view TO anon;
```

### Pattern 5: Invite Token Registration Flow

**What:** Team members register via a one-time use token embedded in a URL. The token is stored in a `team_invites` table and consumed during registration.

**When to use:** Team member onboarding without email service.

**Trade-offs:** Token must be delivered out-of-band (manually shared by admin). No email means no automated delivery, but eliminates email service dependency.

```
Admin creates invite → Token generated → Admin copies link
     ↓
Team member visits /team-join/[token] → Token validated → Registration form
     ↓
Supabase Auth signs up user → Token marked used → Role set to 'team_member'
     ↓
Redirect to /team/tasks
```

```sql
-- Team invite tokens
CREATE TABLE team_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by uuid REFERENCES auth.users(id),
  used_by uuid REFERENCES auth.users(id),
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- After team member signs up, an Edge Function or server action:
-- 1. Validates the token exists and is unused/unexpired
-- 2. Creates the auth user
-- 3. Inserts into profiles table with role = 'team_member'
-- 4. Marks the invite as used
```

## Data Flow

### Request Flow (Admin creates a task)

```
Admin clicks "Create Task"
    ↓
Client Component form submits to Server Action (task-actions.ts)
    ↓
Server Action calls createClient() → Supabase server client
    ↓
Supabase executes INSERT with RLS check (user is authenticated as 'admin')
    ↓
RLS policy grants: admin role has full access
    ↓
revalidatePath('/(admin)/projects/[id]')
    ↓
Admin page re-renders with new task
```

### Request Flow (Client views portal)

```
Client visits /client/acme-corp
    ↓
Server Component (page.tsx) receives slug as param
    ↓
Server Component queries clients table: "WHERE slug = 'acme-corp' AND is_active = true"
    ↓
If no match → 404 page
    ↓
If match → queries public_project_view for this client's projects
    ↓
RLS: anon user, public policy allows SELECT (gated by join conditions)
    ↓
Server Component renders Kanban/Calendar/Timeline with fetched data
```

### Request Flow (Team member updates task)

```
Team member edits caption, uploads file
    ↓
Client Component calls updateTaskCaption() server action
    ↓
Server action calls createClient() → Supabase with auth cookies
    ↓
Supabase checks RLS: is this user the assigned_to on this task?
    ↓
If yes → UPDATE succeeds → revalidatePath
    ↓
If no → RLS rejects → error returned to user
```

### State Management Strategy

```
Server Components (default) → Server Actions (mutations) → Revalidation → Server Components

     ↑                                                         ↓
     └── Client Components (interactive UI only, minimal state) ──┘
```

**Opinionated rule:** All application state lives in the Supabase database. Server components are the single source of truth for rendering. Client components maintain only ephemeral UI state (form inputs, drag position, loading spinners). No Zustand, no Redux, no global client state library. After every mutation, `revalidatePath` or `revalidateTag` triggers a fresh server-side fetch.

This pattern works because:
1. Next.js 15 server components handle async data fetching natively
2. RLS ensures each user sees only their data on every render
3. `revalidatePath` is fast for this data volume (single Supabase project, modest row counts)
4. Eliminates client-server state synchronization bugs entirely

## Build Order Implications

The architecture dictates this build sequence (dependencies flow downward):

```
1. Database Schema + RLS Policies (foundation -- everything depends on this)
    ├── Tables: clients, projects, tasks, profiles, notifications, team_invites
    ├── Storage buckets: design-files
    ├── RLS policies for all tables
    └── Generated TypeScript types

2. Supabase SSR Infrastructure (middleware, three clients)
    ├── middleware.ts (cookie management + route protection)
    ├── lib/supabase/server.ts
    ├── lib/supabase/client.ts
    └── lib/supabase/middleware.ts

3. Admin Authentication + Team Member Registration
    ├── (auth)/login page
    ├── (auth)/team-join/[token] flow
    ├── Root layout with B&W theme + Poppins font
    └── Admin dashboard skeleton

4. Admin CRUD (clients, projects, team)
    ├── Client management (create, view)
    ├── Project creation (monthly cycles)
    ├── Team member management (invite generation)
    └── Admin layout with navigation

5. Task Management (admin creates, team edits)
    ├── Task CRUD in admin view
    ├── Task assignment to team members
    ├── File upload to Supabase Storage
    ├── Server actions for all mutations

6. Team Member Dashboard
    ├── My tasks list
    ├── Task editing (caption, file upload, status)
    ├── Task comments
    └── Notifications

7. Client Portal (public, slug-based)
    ├── Public client lookup by slug
    ├── Kanban view
    ├── Calendar view (week + month)
    ├── Timeline view
    └── Task detail modal (caption copy, file download)
```

**Why this order:** The database schema is built first because every server action and server component depends on tables existing with correct RLS. The Supabase SSR infrastructure comes next because all authenticated routes require middleware. Authentication gates everything. Admin CRUD unlocks task creation, which unlocks team member workflows, which finally enables the client portal to display meaningful data.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users (MVP) | Monolith is fine. Single Supabase project, no CDN config beyond defaults, no query optimization beyond basic indexes. |
| 100-10K users | Add database indexes on RLS policy columns (`assigned_to`, `client_id`, `project_id`). Consider Supabase read replicas if dashboard queries get slow. Implement pagination on task lists. |
| 10K+ users | This is an internal agency tool -- unlikely to reach this scale. If it does, consider splitting client portal into a separate Next.js app to isolate public traffic from admin load. |

### What Breaks First

1. **Unpaginated task lists** -- A project with 200+ tasks will render slowly on the Kanban view. Add pagination or virtual scrolling early (Phase 5).
2. **File storage without cleanup** -- Design files accumulate. Add a storage bucket size monitoring or lifecycle policy if the free tier is approached.
3. **RLS policy performance** -- Policies that join multiple tables on every query slow down as row counts grow. Index `assigned_to`, `project_id`, `client_id` columns from day one.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Data Fetching for Authenticated Data

**What people do:** Use `useEffect` + Supabase browser client to fetch data in client components.

**Why it's wrong:** Data is not available during initial render (flash of loading state). Every user interaction causes a visible loading cycle. Browser client bypasses server-side RLS optimizations.

**Do this instead:** Fetch in server components, pass data as props to client components. Only use the browser client for real-time subscriptions (e.g., live notifications) or when server components cannot be used.

### Anti-Pattern 2: getSession() in Server Components

**What people do:** Call `supabase.auth.getSession()` in server components to check if user is authenticated.

**Why it's wrong:** `getSession()` does not validate the JWT token -- it reads from the cookie store, which can be spoofed. An attacker with a crafted cookie can bypass auth.

**Do this instead:** Use `supabase.auth.getClaims()` in server code. It validates the JWT signature against Supabase's public keys. This is the official Supabase recommendation for server-side auth validation.

### Anti-Pattern 3: Overly Broad RLS Policies

**What people do:** Write `USING (true)` on authenticated tables to "get it working" and plan to tighten later.

**Why it's wrong:** Every query returns every row to every authenticated user. The `client_id` or `project_id` filtering then happens in application code, meaning data is already in memory. A compromised team member account sees everything.

**Do this instead:** Write restrictive policies from day one. Start with the most restrictive policy (team members see only assigned tasks), then add admin bypass policies. Test policies with `EXPLAIN ANALYZE` to verify they execute as expected.

### Anti-Pattern 4: Mixing Admin and Team Layouts

**What people do:** Use a single layout with conditional rendering based on user role (`if (user.role === 'admin') show admin nav`).

**Why it's wrong:** Layouts are cached in Next.js App Router. A team member visiting an admin URL might briefly see admin UI before the route guard catches it. Conditional layouts also make it harder to enforce route-level access control.

**Do this instead:** Use route groups (`(admin)/` and `(team)/`) with separate layouts. Each layout assumes the user has the correct role -- the middleware and server components in that group are responsible for verifying. No conditional rendering between role areas.

### Anti-Pattern 5: Forgetting to Revalidate After Mutations

**What people do:** Server action mutates data but doesn't call `revalidatePath` or `revalidateTag`.

**Why it's wrong:** Next.js 15 caches aggressively. The mutated data will not appear on screen until the cache expires (which may never happen for static data). Users think the mutation failed.

**Do this instead:** Every server action that writes data calls `revalidatePath` for all affected routes immediately after the mutation succeeds.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Supabase Database** | `@supabase/ssr` server client in server components/actions | One project, use `anon` key for all queries; RLS enforces access control |
| **Supabase Auth** | Email/password for admin; email + invite token for team members | Store role in `raw_user_meta_data` or a `profiles` table linked to `auth.users` |
| **Supabase Storage** | `@supabase/supabase-js` browser client for uploads, server client for reads | One bucket (`design-files`) with RLS-style bucket policies mirroring table policies |
| **Vercel** | Deployment target; environment variables for Supabase credentials | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as project env vars |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Admin ↔ Database** | Server components (read) + Server actions (write) | RLS policies enforce admin role has full access |
| **Team ↔ Database** | Server components (read assigned) + Server actions (write assigned) | RLS policies enforce `assigned_to = auth.uid()` |
| **Client Portal ↔ Database** | Server components (read public view) | No server actions; slug validates access, no auth required |
| **Client Component ↔ Server Action** | Form `action` prop or imperative `startTransition` call | All mutations flow through server actions, never direct DB calls from client |
| **Storage ↔ Database** | Upload returns URL, stored in task `design_file_url` column | File upload happens in client component (browser client), URL stored via server action |

## Sources

- [Supabase SSR Guide for Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- HIGH confidence (official docs)
- [Supabase Role-Based Access Control](https://supabase.com/docs/guides/auth/role-based-access-control) -- HIGH confidence (official docs)
- [Next.js App Router Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) -- HIGH confidence (official docs)
- Supabase Storage documentation -- HIGH confidence (official docs)
- Next.js Server Actions documentation -- MEDIUM confidence (training data + Next.js patterns, URL was not accessible via WebFetch)

---
*Architecture research for: Orca Digital project management & client portal*
*Researched: 2026-04-04*
