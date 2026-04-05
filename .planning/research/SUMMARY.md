# Project Research Summary

**Project:** Orca Digital -- Project Management & Client Portal
**Domain:** Social media content workflow management for a digital marketing agency (v1.1 with existing codebase)
**Researched:** 2026-04-04 / 2026-04-05
**Confidence:** HIGH

## Executive Summary

Orca Digital is a focused project management and client portal for a digital marketing agency that produces social media content. Admins create and manage tasks (each representing a social media post with caption, design file, posting date, and briefing), assign them to team members, and give clients read-only access via magic-link slug URLs -- no login required. The agency workflow is content-in, content-out: admin defines what needs to be posted, team members produce and upload designs, clients review progress through Kanban, Calendar, and Timeline views, and approved content is posted manually by the agency to social platforms.

Research confirms this is a v1.1 project with an existing codebase that already has database schema, RLS policies (partially exercised), Server Actions, Kanban board, team layout, client portal shell, and mobile navigation (Sheet-based, 375px-compliant). The recommended approach is to extend the established architecture -- Server Components for reads, Server Actions for mutations with optimistic updates and rollback, RLS for enforcement, and shared shadcn/ui components. Three database migrations are needed (username column, client active status, client description), and zero new third-party dependencies are required. The architecture research verified every proposed integration point against existing code, confirming all 8 patterns are feasible.

The key risk is security: the magic-link client portal bypasses authentication entirely, making slug randomness, RLS correctness, and service role key isolation non-negotiable. The second risk is that the comments table and its RLS policies were designed in migration 002 but have zero references in application code -- they need testing before shipping. Both risks are well-documented with concrete mitigation strategies. All six critical pitfalls map to Phase 1 and must be resolved before feature work begins.

## Key Findings

### Recommended Stack

The stack is mature and well-verified. Next.js 15 App Router provides the foundation with Server Actions replacing API routes for mutations. Supabase (platform and SDK v2.101.1) covers database, authentication, and storage in a single service. shadcn/ui delivers the component system with Radix UI primitives guaranteeing accessibility. The supporting layer is intentionally lean: zod for validation, react-hook-form for complex forms, date-fns for date logic, sonner for notifications, and TanStack Table for data grids. The @supabase/ssr package (v0.10.0) is the correct choice for Next.js SSR auth, replacing the deprecated auth-helpers package. Three factory functions create Supabase clients: `createServerClient` for Server Components/Server Actions/Middleware, and `createBrowserClient` for Client Components.

**Core technologies:**
- **Next.js 15.x (App Router):** Framework -- Server Actions replace API routes for mutations; RSC/Client Component split maps to Supabase's server/client pattern
- **@supabase/supabase-js v2.101.1 + @supabase/ssr v0.10.0:** Supabase SDK -- three-client pattern (server, browser, middleware) is mandatory for Next.js SSR
- **Supabase (Cloud):** DB + Auth + Storage -- single service with generous free tier covers all backend needs
- **shadcn/ui (latest):** UI components -- built on Radix, owned as source code, themed via Tailwind CSS variables
- **Vercel:** Hosting -- native Next.js optimization with seamless Supabase env var integration

**Supporting libraries:**
- **react-hook-form + zod:** Form state and validation -- required for multi-field task creation forms
- **@tanstack/react-table:** Data table layer for dashboard and sortable task views
- **date-fns:** Date manipulation -- tree-shakeable, used for calendar/timeline views
- **sonner:** Toast notifications -- shadcn-recommended, used for in-app notification toasts
- **lucide-react:** Icon library -- shadcn default

### Expected Features

All features are user-specified, giving HIGH confidence in the feature set. The product has a clear MVP boundary with anti-features explicitly identified and excluded. There are three distinct roles: admin (full CRUD), team_member (assigned tasks only), and client (read-only via magic-link slug).

**Must have (table stakes, v1):**
- Admin auth, Client CRUD with random slug -- security boundary and business entities
- Project CRUD (monthly cycles) -- core organizing unit
- Task CRUD with caption, design file, posting date, briefing, status -- core unit of work
- Task assignment to team members with RLS-enforced data isolation -- nobody owns orphaned work
- Team member registration via invite token -- standard onboarding
- Team task dashboard and editing (caption, file upload, status change) -- core team workflow
- Client portal with Kanban (default), Calendar (month + week), and Timeline views -- client visibility
- Task detail modal with "copy caption" button and file download via signed URL -- mandated workflow tools
- In-app notifications (team-to-admin handoff on task completion) -- feedback loop
- Admin dashboard with metrics -- operational overview
- Overdue detection with animated indicators -- deadline awareness
- Briefing with clickable links -- content guidance

**Should have (competitive differentiators, v1.x):**
- Content review/approval workflow with revision notes -- focused client feedback
- "Copy from previous month" for projects -- agency efficiency
- Team member management (revoke, reassign) -- team growth
- Internal vs. client-facing dates -- internal deadline buffer

**Defer (v2+):**
- Email notifications, social media auto-posting, multiple admin accounts, activity log, search, file versioning, payment/invoicing -- all explicitly deferred with clear rationale

### Architecture Approach

The existing architecture is sound and requires no layer replacement. The v1.1 integration analysis identifies 8 architectural patterns that all integrate into the established Server Component / Server Action / RLS / shadcn/ui stack. Three patterns require database migrations (username column, client active flag, client description); five are application-level changes (comments, calendar, inline editing, mobile polish, brand redesign). Component boundaries are clear, with new components (`ProjectCalendar`, `CommentSection`, `ImagePreviewDialog`, `InlineTaskEditor`) alongside existing ones. Shared utilities (calendar-utils, useSignedUrl hook) should be extracted rather than duplicated. The build order is determined by dependency analysis: migrations and refactoring first, then three independent features in parallel, then visual polish last.

**Major components:**
1. **Admin/Team Layouts** -- Auth gate, sidebar navigation, notification bell, mobile Sheet navigation (already works at 375px)
2. **TaskViewToggle** -- View switching between list, kanban, and calendar tabs (add calendar as third option)
3. **KanbanBoard + KanbanCard** -- Optimistic drag-drop with rollback; inline editing via separate click handler with `stopPropagation`
4. **ProjectCalendar** (new) -- Admin calendar sharing grid logic with portal calendar; extract `calendar-utils.ts` from `lib/portal/` to shared `lib/`
5. **CommentSection** (new) -- Task-level comments inserting into existing DB table; Server Action also inserts notification
6. **PortalShell** -- Client portal with three views (Kanban/Calendar/Timeline); read-only, service-role queries, signed URL downloads
7. **ImagePreviewDialog** (new) -- Full-screen preview with shared `useSignedUrl` hook deduplicating two existing implementations
8. **MobileNav** -- Sheet-based mobile nav (admin + team); structurally sound, only visual theme updates needed

### Critical Pitfalls

1. **RLS silently failing for unauthenticated client portal sessions** -- `auth.uid()` returns null for anon requests, causing queries to return empty results with no error. Mitigation: use `createServiceRoleClient()` in Server Actions with application-level slug validation (is_active check), not RLS-based access control for the portal.

2. **Session spoofing via forged cookies** -- `getSession()` in server code provides no cryptographic verification. Browser cookies can be modified to impersonate roles. Mitigation: always use `getUser()` or `getClaims()` for server-side auth decisions.

3. **Comments RLS table and policies exist but never exercised in application code** -- The `team_insert_comments` policy uses an EXISTS subquery joining `task_assignments` that may reject valid inserts. Mitigation: test with real team_member_id and assigned task before shipping.

4. **Service role key exposure** -- Any `NEXT_PUBLIC_` prefixed service_role key bypasses all RLS. Only `SUPABASE_URL` and `SUPABASE_ANON_KEY` should have the prefix. Mitigation: audit env vars, use `createServiceRoleClient()` only in Server Actions.

5. **Stale cache after mutations** -- Next.js 15 caches Server Component responses by default; missing `revalidatePath()` causes stale data. Mitigation: every Server Action with mutations must call `revalidatePath()`; client portal pages use `export const dynamic = 'force-dynamic'`.

## Implications for Roadmap

Based on combined research, the build order follows dependency analysis: infrastructure and refactoring first (minimal risk, unblock all features), then independent feature work in parallel, then cross-cutting visual changes last.

### Phase 1: Infrastructure & Database Migrations
**Rationale:** Three migrations (username column, client active status, client description) and the shared useSignedUrl hook refactoring must complete before feature work. These are backward-compatible, low-risk changes that unblock every subsequent phase.
**Delivers:** Migration for `team_members.username`, `clients.is_active` + `clients.description`; extracted `lib/use-signed-url.ts` replacing duplicate implementations; verification that all existing RLS policies have matching indexes.
**Addresses:** Admin authentication, team member registration, client management, file upload/download (table stakes foundation).
**Avoids:** Pitfall 6 (service role key exposure -- audit during migration), Pitfall 5 (unprotected tables -- verify RLS on new columns), Pitfall 12 (missing indexes -- add during migration).
**Research flags:** Standard patterns. Database migrations with backward-compatible nullable columns are well-documented and low-risk.

### Phase 2: Core Feature Development (Parallel Tracks)
**Rationale:** Three independent features that build on Phase 1 infrastructure but have no interdependencies. These can be developed in parallel by different developers to accelerate delivery.

- **Track A -- Task Comments:** CommentSection component, createCommentAction, notification integration, embedded in TaskEditForm.
- **Track B -- Admin Calendar View:** Extract shared calendar-utils to `lib/calendar-utils.ts`, create ProjectCalendar component, add calendar tab to TaskViewToggle.
- **Track C -- Kanban Inline Editing:** Add click handler to KanbanCard with `stopPropagation`, create InlineTaskEditor component, wire to existing updateTaskAction.

**Delivers:** Task commenting system, admin calendar view, inline kanban card editing -- three features that significantly improve the team workflow.
**Addresses:** Team task editing (table stakes), task detail with comments, admin calendar (differentiator).
**Uses:** Existing Server Actions (updateTaskAction, createCommentAction), shared calendar-utils, optimistic update + rollback pattern from KanbanBoard.
**Avoids:** Pitfall 4 (UPDATE without SELECT policy -- verify both clauses on comment insert), Pitfall 8 (stale cache -- revalidatePath on every mutation), Anti-Pattern 4 (inline editing without optimistic updates -- reuse KanbanBoard pattern).
**Research flags:** Needs deeper research for Track B -- calendar type adaptation between `PortalTask` and `TaskRow` types. Track A needs testing of comments RLS policy (designed but never exercised). Track C is standard pattern, no additional research needed.

### Phase 3: Client Portal Enhancements & Admin Dashboard
**Rationale:** Enhancements to the client portal and admin workflow that build on Phase 1-2 foundations. The client block/unblock feature requires the Phase 1 migration. Username display requires the Phase 1 migration.
**Delivers:**
- **Client block/unblock** -- Update portal query with is_active check, admin UI toggle.
- **Username display across the app** -- Update invite registration form, create /team/choose-username for existing members, update all components showing member names.
- **Notification wiring** -- Comment activity and task completion trigger admin notification bell and drawer.
**Addresses:** Client portal Kanban/Calendar/Timeline views (table stakes), role-based access (table stakes), in-app notifications (table stakes).
**Avoids:** Pitfall 1 (RLS silent failures for portal -- use application-level is_active check, not RLS), Pitfall 9 (slug predictability -- verify cryptographically random slugs), Pitfall 10 (storage RLS -- verify file access tied to task ownership).

### Phase 4: Mobile Polish & Brand Redesign
**Rationale:** Cross-cutting visual changes that touch every component. Must be done last to avoid merge conflicts with feature work in Phases 2-3. Mobile navigation is already structurally sound (Sheet pattern, 375px compliant, correct z-indexing) -- only theme updates needed.
**Delivers:** Cream/beige brand theme across all components, mobile sidebar visual polish, Sheet title accessibility parity for team layout.
**Addresses:** Status indicators with visual feedback (table stakes), responsive web at 375px width (mandated).
**Avoids:** Anti-Pattern 5 (modifying components without extraction -- create separate theme files, not inline changes to components).

### Phase Ordering Rationale

- **Phase 1 first** because every Server Action and Server Component depends on the new columns existing. The username migration unblocks comment author display. The useSignedUrl refactor is clean isolation with no behavioral changes.
- **Phase 2 parallel** because Calendar, Comments, and Kanban Inline Editing are independent -- they touch different components, use different Server Actions, and share no code. Three tracks accelerate delivery by 3x.
- **Phase 3 follows** because it connects features from Phases 1-2 (client portal uses is_active, comments use usernames, notifications depend on comment actions).
- **Phase 4 last** because the brand redesign is cross-cutting. Touching every component's CSS while feature work is in progress creates constant merge conflicts. The existing black-and-white theme is fully functional.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 -- Task Comments:** The comments table and RLS policies in migration 002 have zero references in application code. The `team_insert_comments` EXISTS subquery joining task_assignments needs validation with real data before implementation commits to this approach.
- **Phase 2 -- Calendar utils extraction:** `calendar-utils.ts` currently uses `PortalTask` type. Extracting to work with `TaskRow` type requires a type adapter or generic interface accepting `{ id, postingDate, title, status }`. The pure math functions are proven; the type boundary needs design.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Backward-compatible migrations with nullable columns -- standard Supabase pattern, well-documented.
- **Phase 3:** Application-level is_active check, username form, notification wiring -- all use established patterns from existing codebase.
- **Phase 4:** CSS-only theme updates to structurally-sound components -- no architecture changes, only visual polish.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All items verified against official Supabase docs, npm registry for versions, and shadcn/ui documentation. Clear deprecation guidance (ssr replaces auth-helpers). |
| Features | HIGH | Defined by PROJECT.md requirements with clear MVP boundaries. Competitor analysis (ClickUp, Asana, Monday.com) confirms positioning. Anti-features well-justified. |
| Architecture | HIGH | Every integration point verified against existing codebase -- 20+ files checked including KanbanBoard, TaskEditForm, sidebar, mobile nav, portal components, migrations, and Server Actions. |
| Pitfalls | HIGH | 12 critical pitfalls documented with concrete code examples, warning signs, and phase-specific mitigation. Recovery strategies included. |

**Overall confidence:** HIGH

### Gaps to Address

- **Comments RLS validation:** The `team_insert_comments` policy in migration 002 was designed but never tested with application code. Must verify with real team_member_id assigned to target task before Phase 2 implementation begins.
- **Calendar type boundary:** Extracting `calendar-utils.ts` from `lib/portal/` to shared `lib/` requires type adaptation between `PortalTask` and `TaskRow`. Grid math is proven pure, but the type interface needs design during Planning.
- **Invite token security:** Pitfalls research recommends hashing tokens and adding 48-hour expiry. The existing invite implementation's token handling needs verification against this standard.
- **Scalability threshold:** At ~50 tasks/project (current scale), all patterns work. Research flags that 500+ tasks may need Kanban virtualization, and 2000+ may need server-rendered calendar pages. Monitor task growth rate during planning.

## Sources

### Primary (HIGH confidence)
- Supabase + Next.js Quickstart (supabase.com/docs) -- Stack architecture, client patterns
- Supabase Auth + Next.js Guide (supabase.com/docs/guides/auth/server-side/nextjs) -- Cookie patterns, middleware, getUser() vs getSession()
- Supabase RLS Documentation (supabase.com/docs/guides/database/postgres/row-level-security) -- Policy patterns, role-based access
- shadcn/ui Documentation (ui.shadcn.com/docs) -- Installation, component list, Radix primitives
- PROJECT.md (/Users/MSIModern14/ocean-inc/.planning/PROJECT.md) -- Project requirements, v1 scope
- Existing codebase -- 20+ files verified against ARCHITECTURE.md claims (KanbanBoard, TaskEditForm, sidebar, mobile nav, portal components, migrations, actions)
- npm registry -- Version verification for @supabase/supabase-js v2.101.1, @supabase/ssr v0.10.0

### Secondary (MEDIUM confidence)
- ClickUp/Monday.com/Asana feature documentation -- Competitor feature comparison
- Industry knowledge of agency workflow patterns -- Feature prioritization context
- Supabase Storage Documentation -- Storage RLS patterns (limited specific detail)

### Tertiary (LOW confidence)
- Scalability projections at 500+ and 2000+ tasks -- Reasonable estimates based on Supabase and Next.js patterns, not tested at that scale

---
*Research completed: 2026-04-05*
*Ready for roadmap: yes*
