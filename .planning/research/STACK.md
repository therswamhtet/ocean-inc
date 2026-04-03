# Stack Research

**Domain:** Next.js 15 + Supabase project management & client portal
**Researched:** 2026-04-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (App Router) | Framework | Mandated. Server Actions replace API routes for mutations. App Router's server/client component split maps cleanly to Supabase's server/client client pattern. |
| @supabase/supabase-js | 2.101.1 | Supabase SDK | The official Supabase client. v2 is stable, supports typed queries, realtime subscriptions, and Storage. This is the only Supabase SDK you need. |
| @supabase/ssr | 0.10.0 | SSR Auth helpers | Official Supabase package for Next.js SSR. Provides `createServerClient` and `createBrowserClient` that handle cookie-based session management. Replaces the deprecated `@supabase/auth-helpers-nextjs`. |
| shadcn/ui | latest | UI component system | Mandated. Not a package you install as a dependency -- you own the component source code. Built on Radix UI primitives, which guarantees accessibility. Composable and themeable via Tailwind CSS tokens. |
| Supabase (Platform) | Cloud | DB + Auth + Storage | Mandated. Postgres with RLS, cookie-based auth, and S3-compatible storage. Single service covers all backend needs with a generous free tier. |
| Vercel | Cloud | Hosting | Mandated. Native Next.js optimization, edge middleware support, seamless Supabase integration via environment variables. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | (via shadcn) | Modal/dialog primitives | Always -- shadcn's Dialog, Sheet, and AlertDialog components are built on these. No manual install needed; shadcn pulls them in. |
| @radix-ui/react-dropdown-menu | (via shadcn) | Dropdown menu primitives | Always -- used for action menus on tasks, project headers, and user menus. |
| @radix-ui/react-popover | (via shadcn) | Popover primitives | When building the date picker for posting dates and the calendar view. |
| @radix-ui/react-select | (via shadcn) | Select primitives | When building status dropdowns (todo/in_progress/done/overdue) and assignee selectors. |
| @tanstack/react-table | (via shadcn) | Data table / Kanban data layer | When building the task table view and dashboard. Provides sorting, filtering, and pagination. Not needed for the pure Kanban view. |
| sonner | (via shadcn) | Toast notifications | When the project needs in-app notifications (task completion notifications per requirements). Ships with shadcn's toast component. |
| zod | latest | Schema validation | When validating Server Action inputs (task creation, assignment, etc.). Use with `zod` for both form validation and Server Action argument validation. |
| date-fns | latest | Date manipulation | When formatting posting dates, computing overdue status, and building calendar/timeline views. Smaller and more tree-shakeable than moment.js or dayjs for this use case. |
| lucide-react | latest | Icon library | shadcn's default icon library. Use for UI icons (copy, download, status dots, navigation). |
| react-hook-form | latest | Form state management | When building multi-field forms (task creation with caption, date, file, assignee). Integrates with shadcn's form components and Zod for validation. Prefer over uncontrolled forms for complex inputs. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | Type safety | Next.js 15 defaults to TS. Use with Supabase's generated types. Run `npx supabase gen types typescript --project-id <ref>` to generate database types. |
| Supabase CLI | Local development, type generation | Install globally. Run local Supabase for development: `npx supabase start`. Generate types after schema changes. |
| ESLint + Prettier | Code quality | Included in Next.js 15 default setup. Use `@next/eslint-plugin-next` for App Router-specific linting rules. |
| Tailwind CSS | Utility-first styling | Mandated. Use CSS variables for theming (supports the black-and-white brand constraint). Configure `tailwind.config.ts` with the Poppins font family and max `rounded-sm` (2px/4px) to match the brand. |
| Vercel Postgres/Edge Config | (optional) | Skip for this project. Supabase already provides Postgres. Edge Config adds cost without benefit for this scale. |

## Installation

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI (shadcn - adds to your project, not node_modules)
npx shadcn@latest init -t next
# Then add components as needed:
npx shadcn@latest add button card dialog dropdown-menu table select calendar textarea input checkbox badge toast popover sheet tabs
npx shadcn@latest add field input label form

# Supporting libraries
npm install zod date-fns lucide-react react-hook-form @hookform/resolvers

# TanStack Table (for data table component)
npm install @tanstack/react-table

# Dev tools
npm install -D typescript @types/node
npx supabase login  # install Supabase CLI
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @supabase/ssr | @supabase/auth-helpers-nextjs (deprecated) | Never. The auth-helpers package is officially deprecated and replaced by @supabase/ssr. |
| Server Actions | API Routes (Next.js 15 route handlers) | Only if you need streaming responses, WebSocket-like realtime, or webhook endpoints. Server Actions are superior for standard CRUD mutations. |
| shadcn/ui (Radix) | shadcn/ui (Base UI variant) | Only if you have a strong preference for Base UI over Radix. Radix has broader ecosystem support and more mature components. |
| react-hook-form + Zod | Uncontrolled forms + manual validation | Only for trivial single-field forms. Task creation forms have 4+ fields with file upload -- use react-hook-form. |
| date-fns | dayjs | Only if bundle size is critical and you need the plugin architecture. date-fns has better tree-shaking for most use cases. |
| sonner | next-safe-action toast + custom | Only if you want zero extra dependencies. sonner has better DX and is the shadcn-recommended toast. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers-nextjs | Officially deprecated. Replaced by @supabase/ssr. Will not receive updates. | @supabase/ssr |
| @supabase/supabase-js v1 | v1 is EOL. Lacks typed queries, improved realtime, and modern API. v2 is 10x more popular. | @supabase/supabase-js v2.101.1 |
| Client-side Supabase mutations without RLS | Exposes your service role key or bypasses RLS, leaking data across tenants. | Server Actions with server-side Supabase client (which inherits RLS context from the authenticated session). |
| `supabase.auth.getSession()` in server code | Does not validate JWT signatures. Session cookies can be forged by clients. | `supabase.auth.getClaims()` which cryptographically verifies the JWT against Supabase's published public keys. |
| Next.js caching for authenticated Supabase data | Next.js will cache server component responses and leak data across users. | Call `cookies()` before any Supabase data fetch in server components. This takes the request out of Next.js's data cache. |
| Global Supabase client singleton in server code | Next.js server components re-execute per request. A stale client will use stale headers/session. | Create a fresh server client per request via `createServerClient` in `lib/supabase/server.ts`. |
| Moment.js | 313KB bundle, no longer actively developed, superseded by date-fns and dayjs. | date-fns (tree-shakeable, ~3KB for common functions) |
| Global CSS approach for shadcn | shadcn uses CSS variables for theming. Using utility-only Tailwind without variable tokens defeats the theming system. | Define CSS variables in `app/globals.css` for colors, border-radius, etc. Reference them in `tailwind.config.ts`. |

## Stack Patterns by Variant

### Supabase Client Setup in Next.js 15 App Router

**Server Components, Server Actions, and Route Handlers** use `createServerClient` from `@supabase/ssr`:

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll may throw if called from a Server Component
            // (where headers/cookies cannot be modified)
          }
        },
      },
    }
  );
}
```

**Client Components** use `createBrowserClient`:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

**Middleware** handles session refresh on every request:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Refresh the session if expired (no DB query needed)
  await supabase.auth.getClaims();

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

**Key rule:** Always create the Supabase client via these factory functions. Never instantiate `new SupabaseClient()` directly. The `@supabase/ssr` wrappers handle cookie serialization, which is mandatory for Next.js server component auth.

### shadcn/ui Component Patterns

For a black-and-white brand with Poppins font:

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --border: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.375rem; /* 6px -- within the 8px max constraint */
}
```

Components to add for this project:
- **Kanban view:** `card`, `badge`, `scroll-area`, `tabs` (for status columns)
- **Calendar view:** `calendar`, `popover`, `button`
- **Timeline view:** `card`, `badge`, `scroll-area`
- **Task detail:** `dialog`, `textarea`, `input`, `select`, `popover`, `label`, `field`
- **Dashboard:** `card`, `table` (with @tanstack/react-table for sortable/filterable task lists)
- **Notifications:** `toast` (sonner), `sheet` (notification drawer)
- **Navigation:** `dropdown-menu`, `sheet` (mobile nav)

### File Upload Patterns with Supabase Storage

**Client-side upload** (preferred for large files -- avoids server round-trip):

```typescript
// In a client component with react-hook-form
const { data, error } = await supabase
  .storage
  .from('design-files')
  .upload(`${projectId}/${taskId}/${file.name}`, file, {
    upsert: true,
    contentType: file.type,
  });
```

**Server-side upload** (when you need to validate or transform files):

```typescript
// In a Server Action
const supabase = await createClient();
const { data, error } = await supabase.storage
  .from('design-files')
  .upload(path, fileBuffer, { upsert: true });
```

**Storage bucket RLS policies** for this project:

```sql
-- Design files: only authenticated team members can upload/download
create policy "Team members can upload design files"
  on storage.objects for insert
  with check (bucket_id = 'design-files' and auth.role() = 'authenticated');

create policy "Team members can download design files"
  on storage.objects for select
  using (bucket_id = 'design-files' and auth.role() = 'authenticated');

-- Client portal: signed URLs only (no direct public access)
-- Generate via: supabase.storage.from('design-files').createSignedUrl(path, 60)
```

Use **private buckets** with **signed URLs** for the client portal downloads. Clients access via the unique slug URL, not through Supabase auth -- so the app server generates short-lived signed URLs (60-second expiry) when rendering the client portal page.

### Server Actions for Data Mutations

Server Actions are the primary mutation mechanism. The pattern:

```typescript
// app/_actions/tasks.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const taskSchema = z.object({
  projectId: z.string().uuid(),
  caption: z.string().min(1),
  postingDate: z.string(),
  briefing: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
});

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = taskSchema.parse(rawData);

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...parsed, created_by: user.id })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${parsed.projectId}`);
  return { success: true, data };
}
```

**Key rules:**
- Always call `await createClient()` at the top of each Server Action (fresh client per invocation).
- Validate inputs with Zod before database operations.
- Call `revalidatePath()` after successful mutations to bust the Next.js cache.
- Return `{ error }` or `{ success, data }` objects so the client component can display results.
- Use `redirect()` for post-action navigation (e.g., after project creation).
- Never expose the Supabase service role key in Server Actions -- the server client uses the publishable key and RLS enforces access.

### RLS Policies for Multi-Tenant Data Access

The project has three user roles: admin, team_member, and client (slug-based, no auth). RLS patterns:

**Pattern 1: Ownership-based access** (team members see only assigned tasks):

```sql
-- Team members can view tasks assigned to them
create policy "Team members view own tasks"
  on tasks for select
  using (assigned_to = auth.uid());

-- Team members can update tasks assigned to them (caption, design file, status)
create policy "Team members update own tasks"
  on tasks for update
  using (assigned_to = auth.uid())
  with check (assigned_to = auth.uid());
```

**Pattern 2: Role-based admin access** (admin sees all data):

```sql
-- Admins can do everything on all tables
create policy "Admins full access to tasks"
  on tasks for all
  using (auth.jwt() ->> 'role' = 'admin');
```

**Pattern 3: User profile isolation**:

```sql
-- Users can only view and update their own profile
create policy "Users view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

**Performance rules for RLS:**
- Create indexes on every column used in policy conditions (e.g., `assigned_to`, `project_id`, `client_id`).
- Wrap `auth.uid()` in parentheses `(select auth.uid())` to enable statement-level caching.
- Use `auth.jwt() -> 'app_metadata' -> 'role'` for role checks instead of joining to a roles table.
- For the client portal (no auth), bypass RLS entirely by querying from the server component with the service role key pattern: the unique slug IS the authorization. Generate signed URLs for file access.

### Authentication Patterns

**Admin:** Email + password via Supabase Auth. Use Server Actions for sign-in/sign-out:

```typescript
// app/_actions/auth.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
```

**Team members:** One-time invite token registration. Generate a unique token stored in the `invitations` table. When the user visits the invite URL, they create their account and the token is consumed:

```sql
-- Invitations table
create table invitations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  email text not null,
  role text not null default 'team_member',
  used boolean not null default false,
  created_at timestamptz not null default now()
);
```

**Client portal:** No auth. Access via unique slug URL (`/client/[slug]`). The server component validates the slug against the `clients` table and renders the read-only view. No Supabase auth session is involved -- the slug acts as the access token.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @supabase/supabase-js@2.101.1 | @supabase/ssr@0.10.0 | The @supabase/ssr package wraps supabase-js. These versions are known to work together. |
| @supabase/ssr@0.10.0 | Next.js 15.x | Uses `next/headers` cookies() API which is async in Next.js 15 (was sync in 14). Ensure you await `cookies()`. |
| shadcn/ui (latest) | Next.js 15 + Tailwind CSS 4 | shadcn's init command detects Next.js 15 and Tailwind 4 automatically. |
| react-hook-form@7.x | Next.js 15 (RSC) | react-hook-form is client-side only. Import it in 'use client' components. |
| @tanstack/react-table@8.x | React 19 (Next.js 15) | Fully compatible with React 19. |

## Sources

- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- Verified: package names, client architecture, file structure
- [Supabase Auth + Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) -- Verified: cookie patterns, middleware, getClaims() vs getSession()
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) -- Verified: policy patterns, role-based access
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) -- Verified: installation, component list, Radix primitives
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) -- Verified: init command, config
- [Supabase Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart) -- Verified: upload patterns, storage RLS
- [@supabase/supabase-js npm](https://registry.npmjs.org/@supabase/supabase-js/latest) -- Version 2.101.1 (verified from npm registry, 2026-04-04)
- [@supabase/ssr npm](https://registry.npmjs.org/@supabase/ssr/latest) -- Version 0.10.0 (verified from npm registry, 2026-04-04)
- [Supabase Server Actions Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) -- Verified: server action patterns, database schema
- Confidence level: HIGH for all items above (verified against official Supabase and shadcn/ui documentation, plus npm registry for versions)

---
*Stack research for: Orca Digital project management & client portal*
*Researched: 2026-04-04*
