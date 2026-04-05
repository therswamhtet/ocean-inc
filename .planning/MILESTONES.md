# Milestones

## v1.1 Frontend Redesign & New Features (Shipped: 2026-04-05)

**Phases completed:** 5 phases, 11 plans, 25 tasks

**Key accomplishments:**

- Inline Kanban card editing via Dialog overlay, expanded task row dropdown hit area, and posting_time support with database column and form pickers
- TaskDetailDialog component with all task fields, image preview fixed with proper sizing, and Kanban card integration with view-then-edit flow
- Plan:
- Plan:
- Cream/beige (#FAF8F0) brand aesthetic applied application-wide with warm gradient metric cards and modern sidebar navigation

---

## v1.0 MVP (Shipped: 2026-04-05)

**Phases completed:** 7 phases, 40 plans, 72 tasks

**Key accomplishments:**

- 8-table PostgreSQL schema with 20+ RLS policies, private storage bucket, and 11 performance indexes — full data layer for the Orca Digital project management platform
- Three-client @supabase/ssr pattern with Next.js 15 middleware for session refresh and route protection — auth foundation for all authenticated features
- Admin email/password login with session management, protected /admin layout, and sign-out — first user-facing feature validating the complete auth stack
- Team member invite registration flow with token validation, auth user creation with team_member role, and token consumption — team onboarding foundation
- Tailwind CSS 4 design tokens with Poppins font, black-and-white brand palette, and animated status dots — visual foundation for all UI components
- Persistent admin navigation with a mobile sheet menu, plus a client directory that creates cryptographic slugs and shows active project counts.
- Nested client project page with monthly project table, inline creation dialog, and validated Supabase project mutations
- Project task management now ships with immediate image uploads, a validated creation form, compact list rows, and an optimistic three-column kanban board.
- Admin task detail editing now supports full field updates, assignment changes, linkified briefing previews, and direct design file replacement/download.
- Admin dashboard metrics and notification management with shared Supabase server actions and overdue task detection.
- Admin team roster with assigned-task counts and inline invite-link generation backed by a reusable server action.
- Reusable caption copy and private signed-file download controls wired into the admin task detail editor.
- Client project rows now link directly into each project's task management page via the existing name cell.
- Dedicated /team routing with a protected team shell, role-aware redirects, and an RLS-scoped assigned-task dashboard.
- Team task detail page with read-only context display and independently editable caption, design file, and status fields
- One-liner:
- Public slug-based portal entry now resolves typed client/project/task data with force-dynamic rendering and read-only RLS coverage for downstream portal views.
- Client portal Kanban now renders as a read-only 3-column board with overdue visual dots, date-aware task cards, and shell integration using shared portal contracts.
- Portal calendar now includes tested month/week date-grid helpers and a month-first, read-only calendar component that plots tasks by posting date with status indicators.
- Portal timeline now renders month-grouped read-only swimlanes with deterministic date offsets and horizontal scrolling tracks that keep month labels readable.
- Client portal task interactions now open one shared read-only detail modal from Kanban, Calendar, and Timeline with caption copy and signed design-file download controls.
- 1. [Rule 3 - Blocking] Server/client component boundary fix
- One-liner:
- One-liner:
- Phase:
- Phase:
- Phase:
- Phase:
- Phase:
- Updated admin header to minimal "Orca Digital" branding, added Tasks sidebar navigation with icon, and created categorized tasks overview page
- Fixed dashboard calendar mobile responsiveness, made task dots clickable with expandable day cells, removed Upcoming section from dashboard
- Simplified task creation to 2 date fields, set Kanban as default project view, added client color branding and logo upload support with database migration
- Converted Create Project to proper Dialog modal, integrated client color/logo branding, consolidated team invite to single Generate button
- Established consistent icon system with lucide-react across admin sidebar, view toggles, team page, and fixed task detail sidebar spacing
- Fixed dashboard calendar clipping by adding min-h-0, created dedicated task detail route at /admin/tasks/[taskId]
- Task 1 — Calendar Task Links:

---
