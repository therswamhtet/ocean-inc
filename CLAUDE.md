<!-- GSD:project-start source:PROJECT.md -->
## Project

**Orca Digital — Project Management & Client Portal**

An internal project management tool with a read-only client-facing portal for Orca Digital, a digital marketing agency. The agency manages monthly social media content projects for clients — each month is a "project" containing "tasks" (social media posts with captions, design files, and posting dates). Three user types: Admin (full control), Team Members (assigned tasks only), and Clients (read-only portal via magic link).

**Core Value:** Admins can create and manage social media content tasks, assign them to team members, and give clients a clean read-only view of their project progress — all in one place.

### Constraints

- **Tech stack**: Next.js 15 (App Router + API Routes + Server Actions), Tailwind CSS, shadcn/ui, Supabase (DB + Auth + Storage), Vercel hosting — mandated for consistency
- **Design**: Black and white only, Poppins font, no shadows, no gradients, no decorative elements, minimal rounded corners (max 8px) — strict brand guideline
- **Mobile**: Must work on 375px width screens — agency clients access via phone
- **Auth**: Supabase Auth with RLS — security requirement for team member data isolation
- **Budget**: No paid third-party services beyond Supabase and Vercel — keep costs minimal
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
# Supabase
# UI (shadcn - adds to your project, not node_modules)
# Then add components as needed:
# Supporting libraries
# TanStack Table (for data table component)
# Dev tools
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
### shadcn/ui Component Patterns
- **Kanban view:** `card`, `badge`, `scroll-area`, `tabs` (for status columns)
- **Calendar view:** `calendar`, `popover`, `button`
- **Timeline view:** `card`, `badge`, `scroll-area`
- **Task detail:** `dialog`, `textarea`, `input`, `select`, `popover`, `label`, `field`
- **Dashboard:** `card`, `table` (with @tanstack/react-table for sortable/filterable task lists)
- **Notifications:** `toast` (sonner), `sheet` (notification drawer)
- **Navigation:** `dropdown-menu`, `sheet` (mobile nav)
### File Upload Patterns with Supabase Storage
### Server Actions for Data Mutations
- Always call `await createClient()` at the top of each Server Action (fresh client per invocation).
- Validate inputs with Zod before database operations.
- Call `revalidatePath()` after successful mutations to bust the Next.js cache.
- Return `{ error }` or `{ success, data }` objects so the client component can display results.
- Use `redirect()` for post-action navigation (e.g., after project creation).
- Never expose the Supabase service role key in Server Actions -- the server client uses the publishable key and RLS enforces access.
### RLS Policies for Multi-Tenant Data Access
- Create indexes on every column used in policy conditions (e.g., `assigned_to`, `project_id`, `client_id`).
- Wrap `auth.uid()` in parentheses `(select auth.uid())` to enable statement-level caching.
- Use `auth.jwt() -> 'app_metadata' -> 'role'` for role checks instead of joining to a roles table.
- For the client portal (no auth), bypass RLS entirely by querying from the server component with the service role key pattern: the unique slug IS the authorization. Generate signed URLs for file access.
### Authentication Patterns
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
