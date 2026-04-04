# Phase 5: UI/UX Polish and Refinement - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 05 is a comprehensive UI/UX polish pass across the entire application. It addresses modal sizing issues, fixes share link behavior, standardizes terminology across the app, improves mobile navigation, polishes the calendar view, redesigns the task dashboard, refreshes card components, and resolves accumulated general bugs. This phase touches all four user-facing surfaces: admin panel, team workspace, client portal, and shared components. No new database tables or API endpoints are required — this is purely a presentation and UX layer refinement.

</domain>

<decisions>
## Implementation Decisions

### Modal Sizing
- **D-01:** All modals (task dialogs, confirmation dialogs, invite modals) get consistent responsive sizing: maxWidth with appropriate breakpoints for desktop (large), tablet (medium), and mobile (full-screen with slight inset).
- **D-02:** Modal content uses overflow-y: auto for scrollable content areas while keeping dialog actions visible.
- **D-03:** Task detail modal in client portal matches admin task patterns — same width at comparable breakpoints.

### Share Links
- **D-04:** Client portal share links use absolute URLs (`/portal/[slug]`) with proper clipboard copy feedback.
- **D-05:** Share link generation includes origin URL, works client-side without SSR concerns.
- **D-06:** Link copy button shows "Copied!" confirmation with timeout (existing CopyButton pattern).

### Terminology Standardization
- **D-07:** Consistent terminology across all surfaces: "Project", "Task", "Client", "Team Member", "Admin". Map any inconsistencies (e.g., "assigner" vs "admin", "post" vs "task").
- **D-08:** Labels match the mental model: "Posting Date" everywhere (not "Post Date" or "Publish Date"), "Due Date" consistently, "Timeline" vs "Calendar" clearly distinguished.
- **D-09:** Empty state messages use consistent tone and terminology ("No tasks yet", "No projects found", etc.).

### Mobile Navigation
- **D-10:** Admin sidebar collapses to hamburger menu on mobile (375px breakpoint).
- **D-11:** Team sidebar follows same mobile pattern as admin for consistency.
- **D-12:** Client portal uses top tabs that stack vertically on very small screens.
- **D-13:** All table views convert to card layouts on mobile for readability.

### Calendar View Polish
- **D-14:** Calendar grid is functional at 375px with horizontal scroll for overflow days.
- **D-15:** Week/month toggle button is accessible and visually clear on mobile.
- **D-16:** Task indicators in calendar cells have minimum touch targets (44px per WCAG).
- **D-17:** Calendar respects dark borders and monochrome brand constraints.

### Task Dashboard Redesign
- **D-18:** Dashboard summary cards use consistent sizing, spacing, and typography.
- **D-19:** Metric cards display: Total Projects, Tasks In Progress, Overdue Tasks, Completed This Month — with clear labels and large numbers.
- **D-20:** Notifications section on dashboard is collapsible to save space.

### Card Component Redesign
- **D-21:** Card components across admin, team, and portal surfaces use consistent border, padding, and spacing tokens.
- **D-22:** Kanban cards show: title, posting date (truncated if long), status dot, overdue flag.
- **D-23:** List view cards/rows show: title, assignee, project, due date, status dot.
- **D-24:** Dashboard metric cards show: label, large number, contextual subtext.

### The agent's Discretion
- Exact pixel values for modal breakpoints
- Specific hamburger menu animation/transition
- Calendar cell exact content when tasks overflow
- Dashboard card visual hierarchy (numbers vs labels)
- Touch target sizes within brand constraints
- Exact bug fixes prioritized during implementation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — UI-01 through UI-06 (design system, colors, status dots, shadow/radius rules, mobile, overdue detection)
- `.planning/PROJECT.md` — Tech stack constraints (Next.js 15, Supabase, Tailwind), design constraints (B&W, Poppins, no shadows, 8px max radius), mobile 375px
- `.planning/ROADMAP.md` — Roadmap context, phase ordering, prior phase summaries

### Prior Phase Decisions (Locked)
- `.planning/phases/01-foundation-database-auth-and-security/01-CONTEXT.md` — Auth patterns, design system tokens, StatusDot component
- `.planning/phases/02-admin-core-client-project-and-task-management/02-CONTEXT.md` — Admin CRUD patterns, dashboard metrics, Kanban/TaskViewToggle, CopyButton, DesignFileDownloader
- `.planning/phases/03-team-workflow-task-dashboard-and-editing/03-CONTEXT.md` — Team sidebar, dashboard cards, notification patterns, task detail split
- `.planning/phases/04-client-portal-public-read-only-views/04-CONTEXT.md` — Portal shell, Kanban/Calendar/Timeline tabs, task detail modal, force-dynamic rendering

### Database Schema
- `supabase/migrations/001_initial_schema.sql` — All 8 table definitions
- `supabase/migrations/002_rls_policies.sql` — RLS policies
- `supabase/migrations/003_storage.sql` — Storage policies
- `supabase/migrations/004_indexes.sql` — Performance indexes

### Stack & Patterns
- `.planning/research/STACK.md` — Next.js 15 + Supabase patterns
- `.planning/research/ARCHITECTURE.md` — Application architecture overview

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/status-dot.tsx` — StatusDot with animated pulse. Use across all surfaces.
- `components/admin/copy-button.tsx` — CopyButton for clipboard. Standardized across admin, team, portal.
- `components/admin/design-file-downloader.tsx` — Signed URL download component.
- `components/admin/kanban-board.tsx` — Admin KanbanBoard reference.
- `components/admin/kanban-card.tsx` — Admin KanbanCard reference.
- `components/ui/dialog.tsx` — shadcn Dialog. Sizing to be addressed in this phase.
- `components/ui/card.tsx` — Card component for dashboard metrics.

### Established Patterns
- **Server components:** RSC → `createClient()` → direct queries → pass data to client components.
- **Dashboard metrics:** `Promise.all` batch queries returning counts. Pattern from `app/admin/page.tsx`.
- **Mobile constraints:** 375px minimum width, Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`).
- **Brand constraints:** B&W (#FFFFFF, #111111, #222222, #E5E5E5, #888888), Poppins font, no shadows, no gradients, max 8px radius.
- **View toggles:** Inline toggle button pattern (Kanban | Calendar | Timeline).
- **Notification revalidation:** `revalidatePath()` with 'layout' option for header badge updates.

### Integration Points
- Mobile nav: Modify admin and team layout components to include hamburger toggle.
- Modal sizing: Update Dialog component usage across admin, team, and portal.
- Calendar: Polish existing portal calendar component for mobile usability.
- Dashboard: Redesign admin `app/admin/page.tsx` and team dashboard.
- Terminology: Audit labels across all `.tsx` files for consistency.
- Share links: Audit client portal slug URL generation and copy behavior.
- Cards: Update kanban-card, list view rows, and metric cards across surfaces.

</code_context>

<specifics>
## Specific Ideas

- Modal sizing should be responsive: full-width with inset on mobile, constrained width on desktop.
- Share link on client portal should be prominent and easily copyable by admin.
- Terminology map: create a single source of truth for labels (could be constants in lib/).
- Mobile nav should match admin/team patterns for cognitive consistency.
- Calendar view needs better touch targets and horizontal scroll for cramped days.
- Task dashboard cards should show the same 4 metrics but with improved visual hierarchy.
- Card redesign focuses on consistent spacing, borders, and content truncation.
- Bug fixes: address any issues discovered during Phase 4 validation + new issues found during polish.

</specifics>

<deferred>
## Deferred Ideas

- Supabase Realtime for live data updates — remains v2, not in scope.
- Animations beyond status dot pulse — brand constraints limit decorative animation.
- Dashboard chart/graph visualization — not in scope for MVP.
- Advanced filtering and search — deferred to when scale demands it.

</deferred>

---

*Phase: 05-ui-ux-polish-and-refinement*
*Context gathered: 2026-04-04*