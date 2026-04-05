# Roadmap: Orca Digital — Project Management & Client Portal

## Overview

Orca Digital is an internal project management tool for a digital marketing agency. The journey begins with secure database and authentication infrastructure (Phase 1), builds through admin client/project/task management (Phase 2), enables team member task workflows and notifications (Phase 3), and culminates in a public read-only client portal with Kanban, Calendar, and Timeline views (Phase 4). The stack is Next.js 15 App Router + Supabase (DB + Auth + Storage) hosted on Vercel, with a black-and-white brand theme using Poppins font.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation — Database, Auth, and Security** - Database schema with RLS, Supabase SSR auth infrastructure, and global design system tokens
- [x] **Phase 2: Admin Core — Client, Project, and Task Management** - Full admin CRUD for clients, projects, tasks, and team members with dashboard metrics
- [x] **Phase 3: Team Workflow — Task Dashboard and Editing** - Team member task dashboard, caption/file editing, status management, and in-app notifications
- [x] **Phase 3: Team Workflow — Task Dashboard and Editing** - Team member task dashboard, caption/file editing, status management, and in-app notifications
- [x] **Phase 4: Client Portal — Public Read-Only Views** - Slug-based portal with Kanban, Calendar, and Timeline views, task detail modal, and secure file downloads
- [x] **Phase 5: UI/UX Polish and Refinement** - Modal sizing, share link fixes, terminology changes, mobile nav, calendar view polish, task dashboard redesign, card redesign, and bug fixes (completed 2026-04-04)
- [x] **Phase 6: Comprehensive UI/UX Refinement** - Dashboard calendar improvements, sidebar Tasks tab, client color branding, view simplification, icon integration, modal redesigns, task field updates, and team management UI polish (completed 2026-04-05)

## Phase Details

### Phase 1: Foundation — Database, Auth, and Security
**Goal**: Secure database with correct RLS policies, working authentication for admin and team members, and global design system applied
**Depends on**: Nothing (first phase)
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Admin can log in with email/password, stay logged in across browser refresh, and is blocked from unauthenticated access to protected routes
  2. Team member can register via one-time invite token link, token is consumed after use, and invalid/used tokens show appropriate error
  3. All 8 database tables exist with RLS enabled, role-based access policies enforced (admin=all, team=assigned, client=slug-gated), and storage bucket is private
  4. Every page uses Poppins font, black/white color scheme, animated status dots, no shadows/gradients, and is functional at 375px width
**Plans**: 5 plans in 3 waves

Plans:
- [x] 01-01: Database schema, RLS policies, indexes, and Supabase Storage bucket (wave 1)
- [x] 01-02: Supabase SSR infrastructure — three-client pattern, middleware, cookie-based auth (wave 2)
- [x] 01-03: Admin login flow, session management, and route protection (wave 3)
- [x] 01-04: Team member invite registration flow with token consumption (wave 3)
- [x] 01-05: Global design system — Poppins, color tokens, status dots, responsive base (wave 1)

### Phase 2: Admin Core — Client, Project, and Task Management
**Goal**: Admin can create and manage clients, projects, and tasks with full CRUD, file uploads, team assignment, and dashboard metrics
**Depends on**: Phase 1
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08, ADMIN-09, ADMIN-10, ADMIN-11, ADMIN-12, ADMIN-13, ADMIN-14, UI-06
**Success Criteria** (what must be TRUE):
  1. Admin can create a client (auto-generates unique slug), view all clients with active project counts, and browse each client's project list
  2. Admin can create a project (name, month, year, status) under any client
  3. Admin can create a task with all fields (title, briefing, caption, design file, posting date, due date, deadline, status), view tasks in list and kanban views, edit all fields, and assign to team members
  4. Admin dashboard displays correct metrics: total active projects, tasks in progress, overdue tasks (posting_date < today AND status != 'done'), and tasks completed this month
  5. Admin can manage team members (view list with task counts, invite by email), copy caption text with one click, download design files, and see URLs in briefing text rendered as clickable links
**Plans**: 8 plans in 4 waves

Plans:
- [x] 02-01: Client CRUD with auto-generated slug and client list view
- [x] 02-02: Project CRUD with monthly cycles and client project list
- [x] 02-03: Task creation form with file upload, list view, and kanban view
- [x] 02-04: Task detail page with full edit, team member assignment, and briefing link rendering
- [x] 02-05: Admin dashboard with metrics, overdue detection, and notifications list
- [x] 02-06: Team member management — list, task counts, invite generation
- [x] 02-07: Supabase Storage integration for design file upload/download, caption copy button
- [x] 02-08: Inbound navigation from client project list rows to the project task management page

**Verification**: Passed — 7/7 must-haves verified and the human approval gate is closed. See `.planning/phases/02-admin-core-client-project-and-task-management/02-VERIFICATION.md` and `02-HUMAN-UAT.md`.

### Phase 3: Team Workflow — Task Dashboard and Editing
**Goal**: Team members can view their assigned tasks, edit captions, upload design files, change status, and notify admins of completion
**Depends on**: Phase 2
**Requirements**: TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05, TEAM-06, TEAM-07, TEAM-08, NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05
**Success Criteria** (what must be TRUE):
  1. Team member sees dashboard with summary cards (total assigned, due today, overdue, completed) and a sorted list of assigned tasks showing project name, client name, title, and status dot
  2. Team member can view task detail with read-only fields (title, briefing with clickable links, posting date, due date) and editable fields (caption text area, design file upload)
  3. Team member can change task status and use "Notify Assigner" button to create a notification and mark task as done
  4. Team member can only see and edit their own assigned tasks (RLS-enforced)
  5. Admin sees notifications page listing all notifications with read-on-click, unread badge on header bell icon, and recent notifications on dashboard
**Plans**: 5 plans in 4 waves

Plans:
- [x] 03-01: Team route shell, role-aware redirects, and dashboard with summary cards/sorted task list (wave 1)
- [x] 03-02: Dedicated team task detail page with read-only context and independent caption/file/status editing (wave 2)
- [x] 03-03: Notify Assigner confirmation flow, admin-notification creation, and team notification INSERT policy (wave 3)
- [x] 03-04: Admin unread bell badge and notification-state revalidation wiring (wave 1)
- [x] 03-05: Automated team-member RLS isolation verification script (wave 4)

### Phase 4: Client Portal — Public Read-Only Views
**Goal**: Clients can view their active project through a public, read-only portal with Kanban, Calendar, and Timeline views
**Depends on**: Phase 3
**Requirements**: CLIENT-01, CLIENT-02, CLIENT-03, CLIENT-04, CLIENT-05, CLIENT-06, CLIENT-07, CLIENT-08, CLIENT-09, CLIENT-10
**Success Criteria** (what must be TRUE):
  1. Client can access the portal via /portal/[slug] URL without login and see their active project
  2. Kanban view displays three locked columns (todo, in_progress, done) with overdue shown as a visual status-dot flag on relevant cards
  3. Calendar view with week/month toggle plots tasks by posting date; Timeline view shows month-grouped swimlanes with task bars by date
  4. Clicking a task opens a modal/drawer showing caption with copy button, design file with download (via signed URL with 60s expiry), posting date, and status
  5. Portal is fully read-only — no mutations possible — and uses force-dynamic rendering to prevent stale cache
**Plans**: 5 plans in 3 waves
**UI hint**: yes

Plans:
- [x] 04-01: Portal foundation — typed data contracts, slug validation, force-dynamic route shell, read-only policy migration
- [x] 04-02: Read-only Kanban view with locked 3 columns and overdue visual flag task cards
- [x] 04-03: Calendar view with month default, week toggle, and posting-date plotting helpers
- [x] 04-04: Timeline view with month swimlanes, date-positioned bars, and horizontal scroll lanes
- [x] 04-05: Shared task detail modal wiring (caption copy + signed download) across all three views

### Phase 5: UI/UX Polish and Refinement
**Goal**: Polish UI/UX across admin, team, portal, and shared surfaces — responsive modals, consistent terminology, mobile navigation, calendar polish, redesigned dashboard and cards, accumulated bug fixes
**Depends on**: Phase 4
**Requirements:** UI/UX refin across all surfaces — no new database requirements
**Success Criteria** (what must be TRUE):
  1. All modals (task detail, confirmations, invites) render at appropriate responsive sizes across 375px to desktop
  2. Client portal share links display as copyable absolute URLs with proper feedback
  3. Terminology is consistent across admin, team, and portal surfaces (no duplicate labels for same concept)
  4. Admin and team sidebars collapse to hamburger menu on <768px; all tables convert to card layouts on mobile
  5. Calendar view has minimum 44px touch targets and horizontal scroll on narrow screens
  6. Dashboard metric cards display in responsive grid with clear visual hierarchy
  7. Card components share consistent tokens (border, padding, spacing) across all surfaces
  8. No new build errors, lint warnings, or regressions introduced
**Plans:** 4/5 plans executed

Plans:
- [x] 05-01: Shared component audit — modal sizing, terminology constants, share link fixes (wave 1)
- [x] 05-02: Mobile navigation + responsive tables — hamburger menus, card-layout conversion (wave 2)
- [x] 05-03: Calendar polish + dashboard redesign — touch targets, scroll, responsive metric grid (wave 2)
- [ ] 05-04: Card redesign unification — shared tokens, kanban/list/metric variants across surfaces (wave 2)
- [x] 05-05: Bug fixes + regression sweep — address accumulated issues, full build verification (wave 3)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Database, Auth, and Security | 5/5 | Complete | 2006-04-04 |
| 2. Admin Core — Client, Project, and Task Management | 8/8 | Complete | 2006-04-04 |
| 3. Team Workflow — Task Dashboard and Editing | 5/5 | Complete | 2006-04-04 |
| 4. Client Portal — Public Read-Only Views | 5/5 | Complete | 2006-04-04 |
| 5. UI/UX Polish and Refinement | 4/5 | In Progress|  |

### Phase 05.1: UI/UX Polish phase for urgent refinement work discovered mid-milestone (INSERTED)

**Goal:** Fix 12 specific UI/UX issues across admin, team, and portal surfaces — client card improvements, modal/form polish, share/invite fixes, mobile nav repositioning, dashboard enhancements, terminology consistency
**Requirements**: User-provided (12 requirements from /gsd-plan-phase 05.1)
**Depends on:** Phase 5
**Plans:** 5/5 plans complete

Plans:
- [x] 05.1-01: Mobile navigation repositioning (hamburger to right) + terminology cleanup (wave 1)
- [x] 05.1-02: Client card improvements (click target, links, visual polish) (wave 1)
- [x] 05.1-03: Task modal/form polish (sizing, assignee field, button sizing) (wave 2)
- [x] 05.1-04: Share/invite functionality fixes (wave 2)
- [x] 05.1-05: Dashboard enhancements (calendar widget, task sections, notification cleanup) (wave 2)

### Phase 6: Comprehensive UI/UX Refinement

**Goal:** Deliver comprehensive UI/UX improvements across dashboard, sidebar, client branding, views, icons, modals, task fields, and team management — making the interface more intuitive, visually consistent, and mobile-friendly
**Requirements:** UI-07 through UI-26 (user-provided comprehensive refinements)
**Depends on:** Phase 05.1
**Success Criteria** (what must be TRUE):
  1. Dashboard calendar view displays properly on mobile with clickable tasks, no "upcoming" section, and fixed responsiveness
  2. Sidebar includes new "Tasks" tab with categorized task lists (today, upcoming, due) and mobile sidebar positioned on left
  3. Clients display with color differentiation and logo uploads; color markers visible next to logos in client view
  4. Project views reduced to Kanban and Calendar only; Kanban is default view when entering a project
  5. Interface uses consistent icons throughout navigation, projects, and sections (less text-heavy)
  6. Create Project uses modal (not dropdown) with fixed visual proportions
  7. Task creation shows only "posting date" and "deadline" fields; modal styling refined
  8. Task detail sidebar displays properly without empty space below assigned team members
  9. Team member management has enhanced UI/UX for edit/invite with consolidated "Generate" button
  10. Branding updated to "Orca Digital" with Poppins bold font; "Management Panel" text removed
**Plans:** 6/6 plans complete
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 05.1 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Database, Auth, and Security | 5/5 | Complete | 2006-04-04 |
| 2. Admin Core — Client, Project, and Task Management | 8/8 | Complete | 2006-04-04 |
| 3. Team Workflow — Task Dashboard and Editing | 5/5 | Complete | 2006-04-04 |
| 4. Client Portal — Public Read-Only Views | 5/5 | Complete | 2006-04-04 |
| 5. UI/UX Polish and Refinement | 4/5 | In Progress |  |
| 05.1. UI/UX Polish phase for urgent refinement | 5/5 | Complete |  |
| 6. Comprehensive UI/UX Refinement | 6/6 | Complete   | 2026-04-05 |
