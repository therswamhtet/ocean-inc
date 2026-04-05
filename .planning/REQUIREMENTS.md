# Requirements: Orca Digital Project Management & Client Portal

**Defined:** 2026-04-04
**Core Value:** Admins can create and manage social media content tasks, assign them to team members, and give clients a clean read-only view of their project progress — all in one place.

## v1 Requirements

### Database & Security

- [x] **DB-01**: Database schema includes all 8 tables: clients, projects, tasks, task_assignments, comments, team_members, invite_tokens, notifications
- [x] **DB-02**: RLS enabled on all tables with role-aware policies (admin=all, team=assigned-only, client=slug-gated)
- [x] **DB-03**: Supabase Storage bucket created for design files (private, not public)
- [x] **DB-04**: Storage RLS policies restrict file access to authenticated users and slug-validated portal access
- [x] **DB-05**: Indexes on all columns used in RLS policies (client_id, project_id, assigned_to, team_member_id)
- [x] **DB-06**: Client slug is cryptographically random (12+ chars) and unique

### Authentication & Authorization

- [x] **AUTH-01**: Admin can log in with email + password
- [x] **AUTH-02**: Admin session persists across browser refresh (cookie-based)
- [x] **AUTH-03**: Middleware protects admin and team routes from unauthenticated access
- [x] **AUTH-04**: JWT verification uses `getUser()` (not `getSession()`) to prevent session spoofing
- [x] **AUTH-05**: Team member registers via one-time invite token from `/invite/[token]` URL
- [x] **AUTH-06**: Invite token is consumed (used=true) after successful registration
- [x] **AUTH-07**: Invite token page validates token existence and shows appropriate error if used/invalid
- [x] **AUTH-08**: Supabase SSR uses three-client pattern (server, browser, middleware) via `@supabase/ssr`

### Admin: Client & Project Management

- [x] **ADMIN-01**: Admin can create a client (name only → auto-generates unique slug)
- [x] **ADMIN-02**: Admin can view list of all clients with active project count
- [x] **ADMIN-03**: Admin can view a client's project list
- [x] **ADMIN-04**: Admin can create a project (name, month, year, status)
- [x] **ADMIN-05**: Admin dashboard shows: total active projects, tasks in progress, overdue tasks, tasks completed this month

### Admin: Task Management

- [x] **ADMIN-06**: Admin can create a task (title, briefing, caption, design file, posting date, due date, deadline, status)
- [x] **ADMIN-07**: Admin can view project tasks in list view and kanban view
- [x] **ADMIN-08**: Admin can edit all task fields including title, briefing, caption, dates, status
- [x] **ADMIN-09**: Admin can assign a task to a team member via dropdown
- [x] **ADMIN-10**: Admin task detail page shows all fields with full edit capability
- [x] **ADMIN-11**: Briefing text renders URLs as clickable anchor tags
- [x] **ADMIN-12**: Design file upload uses Supabase Storage with download capability
- [x] **ADMIN-13**: Caption field shows a "Copy" button (clipboard copy)
- [x] **ADMIN-14**: Admin can manage team members: view list, see task counts per member, invite new members by email

### Team Member: Task Workflow

- [x] **TEAM-01**: Team member sees dashboard with cards: total assigned, due today, overdue, completed
- [x] **TEAM-02**: Team member sees assigned tasks sorted by due date with project name, client name, title, status dot
- [x] **TEAM-03**: Team member task detail shows read-only: title, briefing (with clickable links), posting date, due date
- [x] **TEAM-04**: Team member can edit: caption (text area), design file upload
- [x] **TEAM-05**: Team member can change task status
- [x] **TEAM-06**: "Notify Assigner" button creates notification for admin and marks task status as done
- [x] **TEAM-07**: Team member RLS ensures they can only see/edit their own assigned tasks
- [x] **TEAM-08**: Caption field shows "Copy" button; design file shows "Download" button

### Notifications

- [x] **NOTIF-01**: Notification records created when team member clicks "Notify Assigner"
- [x] **NOTIF-02**: Notification message format: "[Team member name] marked [task title] as done."
- [x] **NOTIF-03**: Admin notifications page lists all notifications, marks as read on click
- [x] **NOTIF-04**: Unread count badge displayed on bell icon in header
- [x] **NOTIF-05**: Notifications shown on admin dashboard (recent list)

### Client Portal

- [x] **CLIENT-01**: Client can access portal via `/portal/[slug]` URL (no login required)
- [x] **CLIENT-02**: Portal shows the client's active project
- [ ] **CLIENT-03**: Kanban view with four columns: todo, in_progress, done, overdue
- [ ] **CLIENT-04**: Calendar view with week and month toggle, tasks plotted by posting date
- [ ] **CLIENT-05**: Timeline view with month-grouped swimlanes, task bars by date
- [ ] **CLIENT-06**: Task card shows: title, posting date, status indicator (animated pulsing dot)
- [ ] **CLIENT-07**: Clicking a task opens modal/drawer showing: caption with copy button, design file with download button, posting date, status
- [x] **CLIENT-08**: Portal is read-only — no mutations from client side
- [x] **CLIENT-09**: Portal uses `force-dynamic` rendering to prevent stale cache
- [ ] **CLIENT-10**: Design file downloads use signed URLs (60s expiry)

### UI/UX

- [x] **UI-01**: Poppins font used throughout (Google Fonts import)
- [x] **UI-02**: Colors follow spec: white bg (#FFFFFF), black text (#111111), button fill (#222222), borders (#E5E5E5), muted text (#888888)
- [x] **UI-03**: Status dots: done=#22C55E, in_progress=#FACC15, overdue=#EF4444, todo=#D1D5DB with animated pulse effect
- [x] **UI-04**: No box shadows, no gradients, no rounded corners larger than 8px
- [x] **UI-05**: Mobile responsive — all pages functional at 375px width
- [x] **UI-06**: Overdue detection: `posting_date < today AND status != 'done'`

### UI/UX Refinement (Phase 6)

**Dashboard Calendar View:**
- [x] **UI-07**: Dashboard calendar displays properly on mobile with readable sizing
- [x] **UI-08**: Dashboard calendar "upcoming" section removed
- [x] **UI-09**: Dashboard calendar tasks are clickable to view details
- [x] **UI-10**: Dashboard calendar responsiveness bug fixed

**Sidebar:**
- [x] **UI-11**: New "Tasks" tab added to sidebar alongside Dashboard, Client, Team Member
- [x] **UI-12**: Tasks tab shows today's tasks, upcoming tasks, and due tasks (categorized)
- [x] **UI-13**: Mobile sidebar moved from right to left side
- [x] **UI-14**: Notification icon removed from "Orca Digital Management Panel" header

**Client Section:**
- [x] **UI-15**: Client color differentiation system implemented
- [x] **UI-16**: Client logo upload functionality enabled
- [x] **UI-17**: Color markers display next to client logos in client view

**Views:**
- [x] **UI-18**: Timeline view removed entirely (only Kanban and Calendar remain)
- [x] **UI-19**: Kanban set as default view when entering a project

**Icons:**
- [x] **UI-20**: Appropriate icons added throughout interface (less text-heavy)
- [x] **UI-21**: Icons added for project names, sections, and navigation
- [x] **UI-22**: Consistent icon usage across all surfaces

**Create Project:**
- [x] **UI-23**: Create Project button visual bug fixed (proportions corrected)
- [x] **UI-24**: Create Project changed from dropdown to modal

**Task Creation:**
- [x] **UI-25**: Task creation date fields simplified: remove "due date", keep only "posting date" and "deadline"
- [x] **UI-26**: Task creation modal styling refined

**Task Detail:**
- [x] **UI-27**: Task detail sidebar empty space below assigned team members fixed

**Team Members:**
- [x] **UI-28**: Team member UI/UX enhanced for edit and invite functions
- [x] **UI-29**: "Generate" and "Generate Invite Link" buttons consolidated into single "Generate" button with icon

**Branding:**
- [x] **UI-30**: "Orca Digital Admin" changed to "Orca Digital"
- [x] **UI-31**: Poppins bold font applied to branding
- [x] **UI-32**: "Management Panel" text removed from header

## v2 Requirements

### Content Review/Approval

- **REVIEW-01**: `review_state` field on tasks: none | pending | approved | needs_revision
- **REVIEW-02**: Client can request revision with notes from portal
- **REVIEW-03**: Admin sees flagged items needing revision

### Team Management

- **TEAMMGT-01**: Admin can revoke team member access
- **TEAMMGT-02**: Admin can reassign tasks between team members

### Convenience Features

- **CONV-01**: "Copy from previous month" when creating new project
- **CONV-02**: Internal vs. client-facing date separation (due_date for team, deadline for client)
- **CONV-03**: Team member comments on tasks

## Out of Scope

| Feature | Reason |
|---------|--------|
| Email notifications | In-app notifications sufficient for MVP; no email service dependency |
| Direct social media publishing | OAuth complexity, API rate limits, ongoing maintenance — this is content management, not publishing |
| Payment system | Not part of agency workflow |
| Client login/accounts | Magic link via unique slug eliminates need |
| Multiple admin accounts | Single admin sufficient; adds RBAC complexity |
| Activity log / audit trail | Not needed at MVP scale |
| Search functionality | Browse by client/project is faster at agency scale (<1000 tasks) |
| File versioning | Single file per task is the workflow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| DB-03 | Phase 1 | Complete |
| DB-04 | Phase 1 | Complete |
| DB-05 | Phase 1 | Complete |
| DB-06 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| AUTH-08 | Phase 1 | Complete |
| ADMIN-01 | Phase 2 | Complete |
| ADMIN-02 | Phase 2 | Complete |
| ADMIN-03 | Phase 2 | Complete |
| ADMIN-04 | Phase 2 | Complete |
| ADMIN-05 | Phase 2 | Complete |
| ADMIN-06 | Phase 2 | Complete |
| ADMIN-07 | Phase 2 | Complete |
| ADMIN-08 | Phase 2 | Complete |
| ADMIN-09 | Phase 2 | Complete |
| ADMIN-10 | Phase 2 | Complete |
| ADMIN-11 | Phase 2 | Complete |
| ADMIN-12 | Phase 2 | Complete |
| ADMIN-13 | Phase 2 | Complete |
| ADMIN-14 | Phase 2 | Complete |
| TEAM-01 | Phase 3 | Complete |
| TEAM-02 | Phase 3 | Complete |
| TEAM-03 | Phase 3 | Complete |
| TEAM-04 | Phase 3 | Complete |
| TEAM-05 | Phase 3 | Complete |
| TEAM-06 | Phase 3 | Complete |
| TEAM-07 | Phase 3 | Complete |
| TEAM-08 | Phase 3 | Complete |
| NOTIF-01 | Phase 3 | Complete |
| NOTIF-02 | Phase 3 | Complete |
| NOTIF-03 | Phase 3 | Complete |
| NOTIF-04 | Phase 3 | Complete |
| NOTIF-05 | Phase 3 | Complete |
| CLIENT-01 | Phase 4 | Complete |
| CLIENT-02 | Phase 4 | Complete |
| CLIENT-03 | Phase 4 | Pending |
| CLIENT-04 | Phase 4 | Pending |
| CLIENT-05 | Phase 4 | Pending |
| CLIENT-06 | Phase 4 | Pending |
| CLIENT-07 | Phase 4 | Pending |
| CLIENT-08 | Phase 4 | Complete |
| CLIENT-09 | Phase 4 | Complete |
| CLIENT-10 | Phase 4 | Pending |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| UI-04 | Phase 1 | Complete |
| UI-05 | Phase 1 | Complete |
| UI-06 | Phase 2 | Complete |
| UI-07 | Phase 6 | Complete |
| UI-08 | Phase 6 | Complete |
| UI-09 | Phase 6 | Complete |
| UI-10 | Phase 6 | Complete |
| UI-11 | Phase 6 | Complete |
| UI-12 | Phase 6 | Complete |
| UI-13 | Phase 6 | Complete |
| UI-14 | Phase 6 | Complete |
| UI-15 | Phase 6 | Complete |
| UI-16 | Phase 6 | Complete |
| UI-17 | Phase 6 | Complete |
| UI-18 | Phase 6 | Complete |
| UI-19 | Phase 6 | Complete |
| UI-20 | Phase 6 | Complete |
| UI-21 | Phase 6 | Complete |
| UI-22 | Phase 6 | Complete |
| UI-23 | Phase 6 | Complete |
| UI-24 | Phase 6 | Complete |
| UI-25 | Phase 6 | Complete |
| UI-26 | Phase 6 | Complete |
| UI-27 | Phase 6 | Complete |
| UI-28 | Phase 6 | Complete |
| UI-29 | Phase 6 | Complete |
| UI-30 | Phase 6 | Complete |
| UI-31 | Phase 6 | Complete |
| UI-32 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 90 total
- Mapped to phases: 90
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-05 after Phase 6 addition*
