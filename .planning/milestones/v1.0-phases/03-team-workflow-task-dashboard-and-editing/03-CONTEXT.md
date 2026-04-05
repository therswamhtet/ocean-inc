# Phase 3: Team Workflow — Task Dashboard and Editing - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Team members can view their assigned tasks via a dashboard with summary cards, edit captions and design files on task detail, change task status, notify admins of completion, and see their own notifications. Admin notification system includes unread badge and full notification list. All team data access is RLS-enforced (assigned tasks only). This phase delivers TEAM-01 through TEAM-08 and NOTIF-01 through NOTIF-05.

</domain>

<decisions>
## Implementation Decisions

### Login routing
- **D-01:** Role-based redirect in `app/page.tsx` and `app/login/actions.ts` — `team_member` → `/team`, `admin` → `/admin`. Check `user.app_metadata.role` in both locations.

### Team task detail page
- **D-02:** Dedicated team task page at `app/team/tasks/[taskId]/page.tsx`. Not a shared component with admin — new page built from scratch for team-focused UX.
- **D-03:** Read-only fields displayed as labeled text (title, briefing with clickable links via `linkify()`, posting date, due date, deadline).
- **D-04:** Editable fields: caption (textarea with CopyButton), design file (DesignFileUploader/Downloader), status (dropdown select). All three editable independently.
- **D-05:** "Notify Assigner" button is separate from status change — explicit button with confirmation dialog that creates notification AND marks task status as done in one action.

### Notify Assigner implementation
- **D-06:** Server action creates notification with `team_member_id = NULL` (admin recipient) and message format: `"[Member name] marked [task title] as done."`. Also updates task status to `done`.
- **D-07:** New RLS policy `team_insert_notifications` allowing team members to INSERT notifications where `team_member_id IS NULL`. Added via new migration.
- **D-08:** Confirmation dialog before executing Notify Assigner — prevents accidental completion notifications.

### Notification realtime behavior
- **D-09:** No Supabase Realtime subscription for MVP. Notification badge and list update on page navigation via Next.js `revalidatePath()`. Keeps complexity minimal.

### Agent's Discretion
- Team sidebar styling (width, icon choices, active state)
- Dashboard card layout (border, padding, exact typography — follow admin pattern)
- Task list table columns and sorting for team view
- Confirmation dialog implementation (shadcn Dialog)
- Error handling patterns for caption save and file upload failures
- Team layout structure details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — TEAM-01 to TEAM-08 (task dashboard, detail, editing, status, notify assigner, RLS), NOTIF-01 to NOTIF-05 (notification creation, message format, admin list, unread badge, dashboard list)
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 15, Supabase, Tailwind, shadcn/ui), design constraints (B&W, Poppins, no shadows, 8px max radius), mobile 375px

### Prior Phase Decisions (Locked)
- `.planning/phases/01-foundation-database-auth-and-security/01-CONTEXT.md` — Hard delete, UUIDs, timestamps, storage bucket config (10MB, images only, path `{project_id}/{task_id}/{filename}`), invite token lifecycle (7-day expiry, 32-char random), RLS policy patterns
- `.planning/phases/02-admin-core-client-project-and-task-management/02-CONTEXT.md` — Admin sidebar pattern, dashboard metrics cards, task views (list + kanban), file upload pattern (XHR + drag-drop), notification actions, StatusDot usage

### Database Schema
- `supabase/migrations/001_initial_schema.sql` — All 8 table definitions (tasks, notifications, task_assignments, team_members, etc.)
- `supabase/migrations/002_rls_policies.sql` — Existing team_member RLS policies (SELECT assigned tasks, UPDATE tasks, SELECT+UPDATE own notifications, SELECT+INSERT comments)
- `supabase/migrations/003_storage.sql` — Storage policies for team_member design file upload
- `supabase/migrations/004_indexes.sql` — Performance indexes

### Stack & Patterns
- `.planning/research/STACK.md` — Supabase three-client pattern, server actions pattern, RLS policy patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/status-dot.tsx` — StatusDot with todo/in_progress/done/overdue + animated pulse. Use in task list and dashboard.
- `components/admin/copy-button.tsx` — Clipboard copy with visual feedback. Reuse for team caption field.
- `components/admin/design-file-uploader.tsx` — XHR upload with progress, drag-drop, 10MB limit. Already supports team_member RLS.
- `components/admin/design-file-downloader.tsx` — Signed URL download. Reuse for team task detail.
- `lib/utils.ts` — `cn()` and `linkify()` utilities. Use for briefing display.
- `components/ui/card.tsx` — Card components for dashboard summary cards.
- `components/ui/badge.tsx` — Badge with destructive variant for unread notification count.
- `components/ui/select.tsx` — Select for status dropdown on task detail.

### Established Patterns
- **Server actions:** `'use server'` → `createClient()` → mutate → `revalidatePath()` → `redirect()`. Error via `?error=` query param.
- **RSC pages:** Async server components, `createClient()` → `getUser()` → direct queries. RLS handles data isolation.
- **Dashboard metrics:** `Promise.all` batch queries returning counts. Pattern from `app/admin/page.tsx`.
- **Notification list:** `app/admin/notifications/page.tsx` — unread indicator (border-l-2), mark-as-read per item, mark-all-as-read.
- **Admin task detail form:** `app/admin/.../task-edit-form.tsx` — Reference for field layout. Team version simplifies to read-only + editable split.
- **Auth guard:** Layout re-checks auth server-side, redirects to `/login` if unauthenticated.

### Integration Points
- `app/page.tsx` — Root redirect needs role-based routing (team_member → /team)
- `app/login/actions.ts` — Login redirect needs same role check
- `app/admin/layout.tsx` — Admin sidebar pattern reference for team sidebar
- `app/admin/page.tsx` — Dashboard metrics pattern reference for team dashboard
- `app/admin/notifications/` — Notification actions and page pattern for team version
- New routes under `app/team/` — layout, dashboard (page), tasks list, task detail, notifications
- New migration for `team_insert_notifications` RLS policy

</code_context>

<specifics>
## Specific Ideas

- Notify Assigner notification message format: `"[Team member name] marked [task title] as done."` (per REQUIREMENTS.md NOTIF-02)
- Team dashboard summary cards: Total Assigned, Due Today, Overdue, Completed (per REQUIREMENTS.md TEAM-01)
- Task list sorted by due date, showing project name, client name, title, status dot (per REQUIREMENTS.md TEAM-02)

</specifics>

<deferred>
## Deferred Ideas

- Supabase Realtime for live notification updates — future enhancement, not needed for MVP
- Team member comments on tasks — scoped to v2 requirements (CONV-03)
- Task reassignment between team members — scoped to v2 (TEAMMGT-02)

</deferred>

---

*Phase: 03-team-workflow-task-dashboard-and-editing*
*Context gathered: 2026-04-04*
