# Quick Task 260405-khv: Refine Client UI/UX

**Mode:** quick
**Gathered:** 2026-04-05

## Tasks Completed

### Task 1 — Clean up Clients page heading
- **File:** `app/admin/clients/page.tsx`
- **Action:** Removed awkward "Client directory" heading and the small "Clients" uppercase label. Now uses just "Clients" as the single heading. Simplified description text.

### Task 2 — Clean up client card
- **File:** `app/admin/clients/client-card.tsx`
- **Action:** Removed unhelpful "Slug: {slug}" display. Renamed "Calendar" link to "View portal" for clarity. Reduced spacing/visual clutter.

### Task 3 — Remove portal placeholder text
- **Files:** `components/portal/task-detail-dialog.tsx`, `app/portal/[slug]/page.tsx`
- **Action:** Removed "Read-only project timeline and task progress." project subtext. Removed "Read-only task details for this project item." dialog subtext. Removed small "Client portal" uppercase label — client name stands alone.

### Task 4 — Unify Kanban and Calendar view headers
- **File:** `components/portal/kanban-view.tsx`
- **Action:** Added matching header row to Kanban view showing task count and overdue indicator (same structural pattern as Calendar view header). Also fixed broken indentation in the column markup. Both views now share the same visual rhythm: header → content body → empty state.
