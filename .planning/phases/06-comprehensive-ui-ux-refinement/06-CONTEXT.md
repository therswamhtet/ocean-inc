# Phase 6: Comprehensive UI/UX Refinement - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning
**Source:** Requirements from ROADMAP.md + codebase patterns

<domain>
## Phase Boundary

This phase delivers comprehensive UI/UX improvements across the Orca Digital admin interface — covering dashboard calendar, sidebar navigation, client branding, view simplification, icons, modals, task fields, team management UI, and branding consistency. It builds on Phase 5.1 and previous phases' component foundations.

NO new database schema, no new API routes, no new authentication logic — purely UI/UX refinements of existing surfaces.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Calendar (UI-07, UI-08, UI-09, UI-10)
- Calendar widget must display properly on mobile with readable sizing
- "Upcoming" section must be removed from calendar widget
- Calendar tasks must be clickable to view task details
- Calendar responsiveness bug must be fixed (overflow/sizing issues)

### Sidebar Navigation (UI-11, UI-12, UI-13, UI-14)
- New "Tasks" tab added alongside Dashboard, Clients, Team Members
- Tasks tab shows categorized lists: today's tasks, upcoming tasks, due tasks
- Mobile sidebar position: right → left (swap sides)
- Notification bell icon removed from "Orca Digital Management Panel" header text area

### Client Branding (UI-15, UI-16, UI-17)
- Each client gets a distinct color assigned (random/generated)
- Client logo upload field added to client model (store in Supabase Storage)
- Color markers display next to client logos in client list/cards

### View Simplification (UI-18, UI-19)
- Timeline view component removed entirely from project views
- Kanban set as default/first view when entering a project
- Only Kanban and Calendar remain as project views

### Icon System (UI-20, UI-21, UI-22)
- Consistent lucide-react icons throughout admin interface
- Less text-heavy labels — replace some text with icons
- Icons added for project names, sections, navigation items

### Create Project (UI-23, UI-24)
- Visual proportions fixed (button/layout sizing)
- Changed from dropdown form to modal dialog

### Task Creation (UI-25, UI-26)
- Date fields simplified: remove "due date" field
- Keep only "posting date" and "deadline"
- Modal styling refined (sizing, proportions)

### Task Detail (UI-27)
- Empty space below assigned team members in task detail sidebar fixed
- Layout tightened to remove gaps

### Team Members (UI-28, UI-29)
- Enhanced UI/UX for edit and invite functions
- "Generate" and "Generate Invite Link" buttons consolidated into single "Generate" button with icon

### Branding (UI-30, UI-31, UI-32)
- "Orca Digital Admin" changed to "Orca Digital"
- Poppins bold font applied to branding text
- "Management Panel" text removed from header

### the agent's Discretion
- Color system: use a predefined palette of distinct colors with good contrast against white/black
- Logo storage: use existing Supabase Storage infrastructure
- Task data for sidebar: derive from existing task queries (no new API)
- Icon choices: use lucide-react (already in project)
- Modal for create project: use existing dialog component pattern

</decisions>

<canonical_refs>
## Canonical References

### Core Admin Components
- `app/admin/sidebar.tsx` — Admin sidebar with nav items (add Tasks tab)
- `app/admin/layout.tsx` — Admin layout with header
- `components/admin/dashboard-inner.tsx` — Dashboard inner component (calendar)

### Project/Task Views
- `components/admin/kanban-board.tsx` — Kanban board implementation
- `components/admin/kanban-card.tsx` — Kanban card component
- `components/admin/task-create-form.tsx` — Task creation form
- `components/admin/task-list.tsx` — Task list component

### Common UI
- `components/ui/dialog.tsx` — Modal/dialog component
- `components/ui/button.tsx` — Button component
- `components/ui/card.tsx` — Card component
- `components/ui/content-card.tsx` — Content card variant
- `components/ui/status-dot.tsx` — Status indicator dot
- `lib/utils.ts` — Utility functions (cn)

### Brand
- `app/globals.css` — Global styles (Poppins font, color tokens)

</canonical_refs>

<specifics>
## Specific Ideas

- lucide-react already used for sidebar icons (LayoutDashboard, FolderKanban, UserCircle2)
- Next.js 15 App Router, Server Components default
- Tailwind CSS 4 with CSS-based config
- Supabase Storage for file uploads (existing infrastructure for logo storage)
- Black and white brand theme with Poppins font
- Animated status dots (green/yellow/red/gray per status)
- No box shadows, no gradients, max 8px rounded corners

</specifics>

<deferred>
## Deferred Ideas

None — all Phase 6 requirements are in scope.

</deferred>

---

*Phase: 06-comprehensive-ui-ux-refinement*
*Context gathered: 2026-04-05 via Requirements Analysis*
