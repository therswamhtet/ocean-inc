# Phase 4: Client Portal — Public Read-Only Views - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Clients view their active project through a public, read-only portal accessible via `/portal/[slug]` URL. The portal provides Kanban, Calendar, and Timeline views for task visualization, with a task detail modal for viewing caption, design file download, posting date, and status. No authentication required — access is gated by client slug. Portal is fully read-only with force-dynamic rendering to prevent stale cache.

</domain>

<decisions>
## Implementation Decisions

### Kanban View
- **D-01:** Three columns: todo, in_progress, done. Overdue is a **visual flag** (red pulsing StatusDot on cards) — not a separate column. Matches admin Kanban pattern from Phase 2.
- **D-02:** Task cards display: title, posting date, animated status dot. Reads caption and design_file_path for modal view.

### Active Project Logic
- **D-03:** Each client has at most one active project. Query: `SELECT * FROM projects WHERE client_id = ? AND status = 'active' LIMIT 1`.
- **D-04:** Active project is the single project with `status = 'active'`. No complex determination logic needed.

### View Navigation
- **D-05:** Tabs at top of page matching admin task toggle pattern: Kanban | Calendar | Timeline. Same inline toggle button styling.
- **D-06:** Default view is Kanban (most visual, matches client mental model for content status).

### Task Detail Display
- **D-07:** Modal dialog (shadcn Dialog component) on task card click. Shows: caption with CopyButton, design file with DesignFileDownloader, posting date, status with StatusDot.
- **D-08:** No edit capability — read-only display. Briefing and other admin-only fields not shown.

### Calendar View
- **D-09:** Default to month view with toggle to week view. Tasks plotted by posting_date.
- **D-10:** Week view shows 7-day grid with tasks grouped by day. Month view shows full month calendar with task counts or task list per day.

### Timeline View
- **D-11:** Month-grouped horizontal swimlanes. Each month is a row. Tasks appear as horizontal bars positioned by posting_date within the month row.
- **D-12:** Horizontal scrolling for timeline content. Fixed month labels on left.

### Empty State
- **D-13:** When client has no active project, show friendly message: "No active project yet. Contact your account manager to get started."
- **D-14:** No navigation to archived/completed projects — out of scope for MVP.

### Portal Entry
- **D-15:** `/portal/[slug]` route validates slug against clients table, returns 404 for invalid slugs.
- **D-16:** `force-dynamic` rendering directive on portal page to prevent stale cache.
- **D-17:** No authentication middleware check — portal is public. RLS policies allow slug-based read access.

### the agent's Discretion
- Exact Calendar component implementation (library vs custom)
- Exact Timeline component visual styling (bar height, colors, spacing)
- Modal width and layout details
- Month/week toggle button placement and styling
- Task card hover/interaction states
- Mobile responsive behavior for Calendar and Timeline views

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — CLIENT-01 to CLIENT-10 (portal access, active project, Kanban, Calendar, Timeline, task card, task modal, read-only, force-dynamic, signed URLs)
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 15, Supabase, Tailwind, shadcn/ui), design constraints (B&W, Poppins, no shadows, 8px max radius), mobile 375px

### Prior Phase Decisions (Locked)
- `.planning/phases/01-foundation-database-auth-and-security/01-CONTEXT.md` — Client slug generation (16-char hex), storage path `{project_id}/{task_id}/{filename}`, RLS policy patterns
- `.planning/phases/02-admin-core-client-project-and-task-management/02-CONTEXT.md` — Kanban 3-column pattern with overdue visual flag, StatusDot component, design file patterns
- `.planning/phases/03-team-workflow-task-dashboard-and-editing/03-CONTEXT.md` — CopyButton, DesignFileDownloader, linkify for URLs

### Database Schema
- `supabase/migrations/001_initial_schema.sql` — clients table (id, name, slug), projects table (client_id, month, year, status), tasks table (project_id, title, caption, design_file_path, posting_date, status, etc.)
- `supabase/migrations/002_rls_policies.sql` — Existing RLS policies for admin, team_member roles. Client portal needs new slug-gated policies.

### Reusable Components
- `components/ui/status-dot.tsx` — StatusDot with todo/in_progress/done/overdue + animated pulse
- `components/admin/copy-button.tsx` — CopyButton for clipboard with visual feedback
- `components/admin/design-file-downloader.tsx` — Signed URL download (60s expiry), opens in new tab
- `components/admin/kanban-board.tsx` — KanbanBoard with 3 columns + drag-and-drop (reference for client version)
- `components/admin/kanban-card.tsx` — KanbanCard component styling reference
- `lib/utils.ts` — cn() for className merging, linkify() for URL rendering

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/status-dot.tsx` — StatusDot with animated pulse. Use in Kanban cards, Calendar cells, Timeline bars, and modal.
- `components/admin/copy-button.tsx` — CopyButton for caption field in task modal.
- `components/admin/design-file-downloader.tsx` — Signed URL download (60s expiry). Reuse directly in task modal.
- `components/admin/kanban-board.tsx` — Reference for client Kanban (remove drag-and-drop mutation logic).
- `components/admin/kanban-card.tsx` — Reference for client Kanban card styling.
- `lib/utils.ts` — cn() and linkify() utilities. Use for className merging and briefing URL rendering.
- `components/ui/dialog.tsx` — shadcn Dialog component (used in admin task creation). Reuse for task detail modal.

### Established Patterns
- **Server components:** Portal page is RSC → direct Supabase query → pass data to client components.
- **Slug validation:** Query clients table by slug, return notFound() for invalid.
- **force-dynamic:** Add `export const dynamic = 'force-dynamic'` to portal page.
- **Signed URLs:** `supabase.storage.from('design-files').createSignedUrl(filePath, 60)` opens in new tab.
- **Overdue calculation:** `posting_date < today AND status != 'done'` computed at render, passed as `overdue` status to StatusDot.

### Integration Points
- New route: `app/portal/[slug]/page.tsx` — main portal page
- New route: `app/portal/[slug]/layout.tsx` — optional layout for portal shell
- New RLS policy migration: Allow SELECT on clients, projects, tasks WHERE slug matches from URL param
- Calendar and Timeline components: New client components under `components/portal/` or shared `components/ui/`

</code_context>

<specifics>
## Specific Ideas

- Kanban columns match admin pattern — clients see same 3-column view with overdue flag, not a separate visualization.
- Timeline swimlanes by month match project monthly cycles — intuitive for content calendar.
- Modal pattern consistent with admin task creation dialog — same shadcn Dialog component.

</specifics>

<deferred>
## Deferred Ideas

- Project history/archived project viewing — future enhancement, not MVP scope.
- Client login/accounts — explicitly out of scope (magic link slug only).
- Real-time updates — no Supabase Realtime for MVP, revalidate on page navigation.

</deferred>

---

*Phase: 04-client-portal-public-read-only-views*
*Context gathered: 2026-04-04*