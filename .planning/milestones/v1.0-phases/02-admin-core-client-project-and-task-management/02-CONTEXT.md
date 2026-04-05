# Phase 2: Admin Core — Client, Project, and Task Management - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Full admin CRUD interface for managing clients, projects, tasks, and team members with dashboard metrics and file uploads. Admin can create clients (auto-generated slug), create projects under clients, create/manage tasks with all fields (title, briefing, caption, design file, dates, status), assign tasks to team members, view tasks in list and kanban views, manage team members with invite generation, and see dashboard metrics. This phase delivers ADMIN-01 through ADMIN-14 and UI-06.

</domain>

<decisions>
## Implementation Decisions

### Navigation
- **D-01:** Persistent sidebar navigation (not top tabs). Always visible on desktop, collapses to hamburger on mobile.
- **D-02:** Three top-level nav items: Dashboard, Clients, Team Members. Projects and Tasks are sub-pages accessed within Clients (client → project list → task list/detail).

### Task Views
- **D-03:** Toggle buttons (List | Kanban) at top of task list within a project. Default to list view.
- **D-04:** List view shows compact columns: title, status dot, posting date, assigned-to name, due date.
- **D-05:** Kanban view uses 3 columns (todo, in_progress, done). Overdue is a visual flag — red pulsing status dot on tasks where `posting_date < today AND status != 'done'`. Not a separate column.

### Team Member Management
- **D-06:** Team list shows per member: name, email, task count (assigned tasks), joined date.
- **D-07:** Invite flow is inline on the team page: admin enters email → token generated → invite link shown with a copy button. Admin shares link manually (WhatsApp, Slack, etc.). No email service.

### Dashboard
- **D-08:** 4 metric cards in a row: Active Projects, In Progress, Overdue, Completed This Month. Simple numbers, no charts.
- **D-09:** Recent 5 notifications list below the metric cards. Click a notification to mark as read. "View all" link to full notifications page.

### File Upload
- **D-10:** Click-to-upload button + drag-and-drop zone. Shows file name and size after selection.
- **D-11:** File uploads immediately when selected/dropped (not on form submit). Shows progress bar during upload. File path stored on task after form submit.
- **D-12:** When editing a task with an existing file, show current file name + download link + "Replace" button.

### Overdue Detection
- **D-13:** `posting_date < today AND status != 'done'` — computed at render time, not stored in DB. Dashboard overdue count uses same logic.

### Agent's Discretion
- Exact sidebar styling (width, icon choices from lucide-react, active state styling)
- Kanban card layout (what fields on the card face)
- Mobile behavior for drag-and-drop upload zone (falls back to click-to-upload)
- Form layout patterns (which fields are inline vs full-width, section grouping)
- Dashboard card styling (border, padding, exact typography)
- Error handling patterns for file upload failures

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Constraints
- `.planning/REQUIREMENTS.md` — ADMIN-01 to ADMIN-14 (client, project, task CRUD, dashboard, team management), UI-06 (overdue detection), NOTIF-05 (dashboard notifications)
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 15, Supabase, Tailwind, shadcn/ui), design constraints (B&W, Poppins, no shadows, 8px max radius), mobile 375px

### Prior Phase Decisions (Locked)
- `.planning/phases/01-foundation-database-auth-and-security/01-CONTEXT.md` — Hard delete, UUIDs, timestamps, storage bucket config (10MB, images only, path `{project_id}/{task_id}/{filename}`), invite token lifecycle (7-day expiry, 32-char random)

### Stack & Patterns
- `.planning/research/STACK.md` — Supabase three-client pattern, server actions pattern, RLS policy patterns, file upload patterns

### Database Schema (from Phase 1 migrations)
- `supabase/migrations/001_initial_schema.sql` — All 8 table definitions with columns, FKs, constraints
- `supabase/migrations/002_rls_policies.sql` — Admin full access, team member assigned-only policies
- `supabase/migrations/003_storage.sql` — `design-files` bucket config and policies
- `supabase/migrations/004_indexes.sql` — Performance indexes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/status-dot.tsx` — StatusDot component accepting `status: "todo" | "in_progress" | "done" | "overdue"` with animated pulse. Use in task list rows and kanban cards.
- `lib/utils.ts` — `cn()` utility for className merging. Use everywhere.
- `lib/supabase/server.ts` — `createClient()` for RSC and server actions. All data operations use this.
- `lib/supabase/client.ts` — `createClient()` for client components (file upload progress needs this).
- `lib/invite/validate.ts` — `validateToken()` pattern. Reuse for invite generation flow.

### Established Patterns
- **Server actions:** `'use server'` → import `createClient` from `@/lib/supabase/server` → mutate → `revalidatePath()` → `redirect()`. Error handling via `?error=` query param.
- **RSC pages:** Async server components, `createClient()` → `getUser()` for auth → direct supabase queries.
- **Forms:** Plain HTML `<form action={serverAction}>`, `formData.get()` for fields, manual validation.
- **Auth guard:** Admin layout re-checks auth server-side, redirects to `/login` if unauthenticated.

### Available but Unused
- `react-hook-form` + `@hookform/resolvers` — Available for complex forms (task creation has 8+ fields)
- `zod` — Available for schema validation
- `lucide-react` — Icons for sidebar, buttons, status indicators
- `date-fns` — Date formatting, relative dates, overdue calculation
- `class-variance-authority` — Variant-based component styling
- shadcn/ui — Configured, no components installed. Can install: button, input, form, card, dialog, dropdown-menu, table, badge, toast, select

### Integration Points
- `app/admin/layout.tsx` — Existing admin shell with auth guard. Sidebar goes here.
- `app/admin/page.tsx` — Current placeholder dashboard. Replace with metrics.
- Tasks CRUD routes under `app/admin/clients/[clientId]/projects/[projectId]/tasks/`
- File upload connects to `design-files` storage bucket

</code_context>

<specifics>
## Specific Ideas

No specific references or "I want it like X" moments. User preferred standard, clean admin patterns.

</specifics>

<deferred>
## Deferred Ideas

- v2 task sorting/filtering — mentioned during task views discussion, belongs in a future enhancement phase
- v2 features already in REQUIREMENTS.md (content review, team member comments, reassign tasks) — not deferred, already scoped to v2

None captured during discussion that belong in other phases.

</deferred>

---

*Phase: 02-admin-core-client-project-and-task-management*
*Context gathered: 2026-04-04*
