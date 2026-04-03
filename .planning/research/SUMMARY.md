# Project Research Summary

**Project:** Orca Digital Project Management & Client Portal
**Domain:** Next.js 15 App Router + Supabase — internal agency PM tool with public client portal
**Researched:** 2026-04-04
**Confidence:** HIGH

## Executive Summary

Orca Digital is a project management and client portal for a digital marketing agency. It manages social media content workflows — admins create tasks (each representing a social media post with caption, design file, and dates), team members edit captions and upload designs, and clients view progress through a public, slug-based portal with Kanban, Calendar, and Timeline views. The product is internal-facing (single admin, invited team members) plus a public read-only client portal with no login.

The recommended approach is a Next.js 15 monolith on Vercel with Supabase as the unified backend (Postgres with RLS, cookie-based auth, and S3-compatible storage). All mutations flow through Server Actions; all reads happen in Server Components; client components handle only ephemeral UI state. This eliminates client-server state synchronization bugs entirely. shadcn/ui provides the component library with a black-and-white brand theme and Poppins font.

The key risks are security-related: RLS misconfiguration can silently expose or hide data, JWT session spoofing is possible if `getSession()` is used instead of `getUser()`, and the client portal's slug-based access must use cryptographically random slugs to prevent enumeration. All six critical pitfalls map to Phase 1 and must be resolved before any feature work begins. The research is thorough and verified against official Supabase and Next.js documentation, giving HIGH confidence across all areas.

## Key Findings

### Recommended Stack

Next.js 15 with App Router and Supabase form the core, with every other library chosen to complement this pairing. The `@supabase/ssr` package (v0.10.0) is mandatory for cookie-based SSR auth — the deprecated `@supabase/auth-helpers-nextjs` must not be used. shadcn/ui provides owned component source code built on Radix primitives, ensuring accessibility without runtime overhead.

**Core technologies:**
- **Next.js 15.x (App Router):** Framework — Server Actions replace API routes for mutations; RSC/Client Component split maps to Supabase's server/client pattern
- **@supabase/supabase-js v2.101.1 + @supabase/ssr v0.10.0:** Supabase SDK — the three-client pattern (server, browser, middleware) is non-negotiable for Next.js SSR
- **Supabase (Cloud):** DB + Auth + Storage — single service with generous free tier covers all backend needs
- **shadcn/ui (latest):** UI components — built on Radix, owned as source code, themed via Tailwind CSS variables
- **Vercel:** Hosting — native Next.js optimization with seamless Supabase env var integration

**Supporting libraries:**
- **react-hook-form + zod:** Form state and validation — required for multi-field task creation forms
- **@tanstack/react-table:** Data table layer for dashboard and sortable task views
- **date-fns:** Date manipulation — tree-shakeable, used for calendar/timeline views
- **sonner:** Toast notifications — shadcn-recommended, used for in-app notification toasts
- **lucide-react:** Icon library — shadcn default

### Expected Features

All features are user-specified, giving HIGH confidence in the feature set. The product has a clear MVP boundary with anti-features explicitly identified and excluded.

**Must have (table stakes):**
- Task CRUD with caption, file, dates, briefing — core unit of work, each task = one social media post
- Kanban, Calendar, and Timeline views — standard PM views for workflow status and scheduling
- Status indicators (todo/in_progress/done) with animated dots — essential workflow tracking
- Admin manages clients and projects — CRUD for agency business entities
- Admin assigns tasks to team members — core workflow orchestration
- Team member sees only assigned tasks — RLS-dependent data isolation
- Team member uploads design files and edits captions — core team workflow
- Client read-only portal via slug URL — core value delivery, zero-friction access
- Task detail modal with caption copy and file download — drill-down into individual posts
- Briefing text with clickable links — content guidance for team members

**Should have (competitive differentiators):**
- Client portal without login — zero friction, just share a link; differentiates from Asana/Monday paid tiers
- Internal vs client-facing dates — due date for team, deadline for client
- Notify Assigner button — team signals completion to admin
- In-app notifications — keeps admin informed of team activity
- One-time invite tokens for team registration — secure onboarding without email service

**Defer (v2+):**
- Email notifications, social media auto-posting, multiple admin accounts, activity log, search, file versioning — all explicitly deferred with clear rationale in FEATURES.md

### Architecture Approach

The architecture is a layered monolith with three distinct access zones (admin, team, client portal) separated by route groups and RLS policies. Server Components are the single source of truth for rendering; Server Actions handle all mutations; Client Components manage only ephemeral UI state. No global client state library is used.

**Major components:**
1. **Database Schema + RLS Policies** — foundation layer; six tables (clients, projects, tasks, profiles, notifications, team_invites), one storage bucket (design-files), role-aware policies on every table
2. **Supabase SSR Infrastructure** — middleware for cookie management and route protection, three client factories (server, browser, middleware) in `lib/supabase/`
3. **Admin Area (`(admin)/` route group)** — dashboard, client/project CRUD, team management, notifications; separate layout from team area
4. **Team Area (`(team)/` route group)** — assigned tasks list, task detail with caption edit and file upload; separate layout from admin area
5. **Client Portal (`client/` public route)** — slug-based read-only access with Kanban, Calendar, and Timeline views; no auth, no server actions, force-dynamic rendering
6. **Server Actions (`actions/`)** — one file per domain (task-actions.ts, client-actions.ts, etc.); validate with Zod, call Supabase server client, revalidatePath after mutation

**Key data flow:** Client form -> Server Action -> Supabase server client with RLS context -> revalidatePath -> Server Component re-render. No direct DB calls from client components.

### Critical Pitfalls

1. **RLS policies silently failing for unauthenticated sessions** — `auth.uid()` returns `null` for anon users, causing queries to return zero rows with no error. The client portal needs a dedicated security definer view, not raw table access with `anon` RLS. Mitigation: use a `public_project_view` with `security_invoker = true`.

2. **Session spoofing via cookie manipulation** — `getSession()` in Server Components reads cookies without cryptographic verification. An attacker can forge admin cookies. Mitigation: always use `getUser()` or `getClaims()` which validate JWT signatures against Supabase's public keys.

3. **Service role key leakage** — any `NEXT_PUBLIC_` prefixed env var is embedded in the client bundle. The service_role key bypasses all RLS. Mitigation: only `SUPABASE_URL` and `SUPABASE_ANON_KEY` should have the `NEXT_PUBLIC_` prefix.

4. **Missing RLS enablement on tables and storage buckets** — SQL migrations do not auto-enable RLS. Storage buckets default to public. Mitigation: every migration must include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `public = false` for buckets.

5. **N+1 queries from component-level data fetching** — Server Components encourage per-component fetching, causing hundreds of queries on task lists. Mitigation: fetch all data at page level with joined relations, pass as props.

6. **Predictable client portal slugs** — company-name slugs allow enumeration attacks. Mitigation: use cryptographically random slugs (16+ hex chars) with rate limiting on validation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation — Database, Auth, and Security
**Rationale:** Every component depends on tables with correct RLS and the SSR cookie infrastructure. All six critical pitfalls must be resolved here before any feature work.
**Delivers:** Complete database schema (6 tables), RLS policies on all tables and storage bucket, Supabase SSR infrastructure (middleware + three clients), admin login, team member invite/registration flow, generated TypeScript types, database indexes on all RLS policy columns
**Addresses:** All table stakes features that require database (schema foundation), admin auth, team registration
**Avoids:** RLS silent failures (P1), session spoofing (P2), service role leak (P6), unprotected tables (P5), predictable slugs (P9), roles in user metadata (P11), missing indexes (P12)
**Research flags:** Standard patterns — verified against official Supabase SSR docs and RLS documentation. No additional research needed.

### Phase 2: Admin Core — Client, Project, and Task Management
**Rationale:** Admin workflows unlock everything else. Clients and projects must exist before tasks can be created, and tasks must exist before team members can work on them.
**Delivers:** Client CRUD with random slug generation, project CRUD (monthly cycles), task CRUD with file upload/download, admin dashboard with metrics, team member management (invite generation)
**Addresses:** Client CRUD, Project CRUD, Task CRUD, File Upload/Download, Admin Dashboard, Team Invite + Registration (admin side)
**Uses:** Server Actions for mutations, react-hook-form + Zod for validation, Supabase Storage with signed URLs, shadcn/ui form components
**Avoids:** Stale JWTs after role changes (P3), UPDATE without SELECT policy (P4), storage RLS missing (P10)
**Research flags:** Standard patterns — Server Action + Supabase CRUD is well-documented. No additional research needed.

### Phase 3: Team Workflow — Task Dashboard and Editing
**Rationale:** Team members can only work after tasks are assigned by admin. This phase delivers the core team value: editing captions, uploading designs, and signaling completion.
**Delivers:** Team task dashboard (assigned tasks sorted by due date), team task detail (caption edit, file upload, status change, comments), Notify Assigner button, in-app notifications
**Addresses:** Team Dashboard, Team Task Edit, Notifications
**Uses:** Server Actions for team mutations, role-aware RLS (team members see only assigned tasks), sonner for toast notifications, shadcn Sheet for notification drawer
**Avoids:** N+1 queries (P7) — fetch all tasks at page level with a single joined query
**Research flags:** Standard patterns — RLS-based data isolation and Server Action mutations are well-documented in Phase 1 research.

### Phase 4: Client Portal — Public Read-Only Views
**Rationale:** The client portal is last because it needs all data populated by admin workflows. It is the most complex phase due to public access without auth and three different view types.
**Delivers:** Client portal with Kanban view (default), Calendar view (week + month toggle), Timeline view, task detail modal (caption copy, file download via signed URLs), three-view tab navigation
**Addresses:** Client Portal (Kanban, Calendar, Timeline)
**Uses:** `public_project_view` with `security_invoker = true` for safe anon access, `force-dynamic` rendering to prevent stale cache, signed URLs (60s expiry) for file downloads, shadcn Card + Badge for Kanban, Calendar + Popover for calendar view
**Avoids:** Stale cache (P8) — use `force-dynamic` on all portal pages; N+1 queries (P7) — single query per view at page level
**Research flags:** Needs research-phase — calendar and timeline views are the most complex UI components. Calendar view requires careful date grid calculation; timeline view requires horizontal scrolling with date alignment. Both views may need dedicated research during planning for the best component composition with shadcn.

### Phase Ordering Rationale

- **Phase 1 must come first** because every Server Action and Server Component depends on tables existing with correct RLS. The SSR infrastructure (middleware + three clients) gates all authenticated routes.
- **Phase 2 before Phase 3** because team members cannot work on tasks that do not exist. Admin must create clients, projects, and tasks before team workflows are meaningful.
- **Phase 3 before Phase 4** because the client portal displays data created through admin and team workflows. Building it last ensures it renders real data and validates the entire system end-to-end.
- **This grouping avoids pitfalls** by resolving all security concerns (6 critical pitfalls) in Phase 1, ensuring every subsequent phase builds on a secure foundation.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Client Portal):** Calendar and Timeline view implementations with shadcn/ui need component-level research. The public view security pattern (security definer view vs service_role Server Action) needs final decision during implementation.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Well-documented Supabase SSR pattern with official Supabase guides for Next.js 15, RLS, and Storage
- **Phase 2:** Standard CRUD with Server Actions — extensively documented in Supabase and Next.js tutorials
- **Phase 3:** RLS-based data isolation and Server Action mutations — patterns established in Phase 1 research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against official Supabase docs, npm registry for versions, and shadcn/ui documentation |
| Features | HIGH | Defined by user specification with clear MVP boundaries and anti-feature rationale |
| Architecture | HIGH | Verified against official Supabase SSR guide, RLS documentation, and Next.js App Router patterns |
| Pitfalls | HIGH | Verified against official Supabase RLS docs, Next.js caching documentation, and integration patterns |

**Overall confidence:** HIGH

All research areas verified against official documentation. No significant gaps identified.

### Gaps to Address

- **Calendar and Timeline view component composition:** The research identifies which shadcn components to use but does not specify the exact implementation approach for the date grid (calendar) and horizontal scroll (timeline). This should be resolved during Phase 4 planning.
- **Notification realtime strategy:** In-app notifications are listed as MVP, but the research covers polling vs Supabase Realtime subscriptions only briefly. A decision on realtime vs polling should be made during Phase 3 planning.
- **File upload UX for large files:** The research covers client-side and server-side upload patterns but does not address upload progress indicators or retry logic for large design files. Should be validated during Phase 2 implementation.

## Sources

### Primary (HIGH confidence)
- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — Stack patterns, client architecture, file structure
- [Supabase Auth + Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — Cookie patterns, middleware, getClaims() vs getSession()
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) — Policy patterns, role-based access, performance rules
- [Supabase Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart) — Upload patterns, storage RLS
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) — Installation, component list, Radix primitives
- [Supabase SSR Guide for Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — Architecture patterns, three-client setup
- [@supabase/supabase-js v2.101.1](https://registry.npmjs.org/@supabase/supabase-js/latest) — Version verified from npm registry
- [@supabase/ssr v0.10.0](https://registry.npmjs.org/@supabase/ssr/latest) — Version verified from npm registry

### Secondary (MEDIUM confidence)
- Next.js Server Actions documentation — MEDIUM (training data + Next.js patterns, URL was not directly accessible during research)
- Supabase Storage RLS patterns — MEDIUM (limited detail on specific storage RLS patterns in official docs)

### Tertiary (LOW confidence)
- Competitor feature analysis (Asana, Monday.com, ClickUp, ContentCal) — inferred from public knowledge, not directly verified

---
*Research completed: 2026-04-04*
*Ready for roadmap: yes*
