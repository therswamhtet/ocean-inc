# Roadmap: Orca Digital — Project Management & Client Portal

## Overview

Orca Digital is an internal project management tool for a digital marketing agency. The journey begins with secure database and authentication infrastructure (Phase 1), builds through admin client/project/task management (Phase 2), enables team member task workflows and notifications (Phase 3), and culminates in a public read-only client portal with Kanban, Calendar, and Timeline views (Phase 4). The stack is Next.js 15 App Router + Supabase (DB + Auth + Storage) hosted on Vercel, with a black-and-white brand theme using Poppins font.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation — Database, Auth, and Security** - Database schema with RLS, Supabase SSR auth infrastructure, and global design system tokens
- [ ] **Phase 2: Admin Core — Client, Project, and Task Management** - Full admin CRUD for clients, projects, tasks, and team members with dashboard metrics
- [ ] **Phase 3: Team Workflow — Task Dashboard and Editing** - Team member task dashboard, caption/file editing, status management, and in-app notifications
- [ ] **Phase 4: Client Portal — Public Read-Only Views** - Slug-based portal with Kanban, Calendar, and Timeline views, task detail modal, and secure file downloads

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
**Plans**: TBD

Plans:
- [ ] 02-01: Client CRUD with auto-generated slug and client list view
- [ ] 02-02: Project CRUD with monthly cycles and client project list
- [ ] 02-03: Task creation form with file upload, list view, and kanban view
- [ ] 02-04: Task detail page with full edit, team member assignment, and briefing link rendering
- [ ] 02-05: Admin dashboard with metrics, overdue detection, and notifications list
- [ ] 02-06: Team member management — list, task counts, invite generation
- [ ] 02-07: Supabase Storage integration for design file upload/download, caption copy button

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
**Plans**: TBD

Plans:
- [ ] 03-01: Team member task dashboard with summary cards and sorted task list
- [ ] 03-02: Team task detail page — read-only fields, caption edit, file upload, status change
- [ ] 03-03: Notify Assigner button — notification creation and task completion
- [ ] 03-04: Admin notifications page, unread badge, and dashboard notification list
- [ ] 03-05: Team member RLS enforcement — data isolation verification

### Phase 4: Client Portal — Public Read-Only Views
**Goal**: Clients can view their active project through a public, read-only portal with Kanban, Calendar, and Timeline views
**Depends on**: Phase 3
**Requirements**: CLIENT-01, CLIENT-02, CLIENT-03, CLIENT-04, CLIENT-05, CLIENT-06, CLIENT-07, CLIENT-08, CLIENT-09, CLIENT-10
**Success Criteria** (what must be TRUE):
  1. Client can access the portal via /portal/[slug] URL without login and see their active project
  2. Kanban view displays four columns (todo, in_progress, done, overdue) with task cards showing title, posting date, and animated pulsing status dot
  3. Calendar view with week/month toggle plots tasks by posting date; Timeline view shows month-grouped swimlanes with task bars by date
  4. Clicking a task opens a modal/drawer showing caption with copy button, design file with download (via signed URL with 60s expiry), posting date, and status
  5. Portal is fully read-only — no mutations possible — and uses force-dynamic rendering to prevent stale cache
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 04-01: Portal entry point — slug validation, project lookup, force-dynamic rendering, read-only guard
- [ ] 04-02: Kanban view with four columns, task cards, and status dots
- [ ] 04-03: Calendar view with week/month toggle, date grid, and task plotting
- [ ] 04-04: Timeline view with month-grouped swimlanes and horizontal scrolling task bars
- [ ] 04-05: Task detail modal with caption copy, signed URL file download, and posting date/status

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Database, Auth, and Security | 0/5 | Planned | - |
| 2. Admin Core — Client, Project, and Task Management | 0/7 | Not started | - |
| 3. Team Workflow — Task Dashboard and Editing | 0/5 | Not started | - |
| 4. Client Portal — Public Read-Only Views | 0/5 | Not started | - |
