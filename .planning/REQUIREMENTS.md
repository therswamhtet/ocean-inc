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

- [ ] **ADMIN-06**: Admin can create a task (title, briefing, caption, design file, posting date, due date, deadline, status)
- [ ] **ADMIN-07**: Admin can view project tasks in list view and kanban view
- [ ] **ADMIN-08**: Admin can edit all task fields including title, briefing, caption, dates, status
- [ ] **ADMIN-09**: Admin can assign a task to a team member via dropdown
- [ ] **ADMIN-10**: Admin task detail page shows all fields with full edit capability
- [ ] **ADMIN-11**: Briefing text renders URLs as clickable anchor tags
- [ ] **ADMIN-12**: Design file upload uses Supabase Storage with download capability
- [ ] **ADMIN-13**: Caption field shows a "Copy" button (clipboard copy)
- [x] **ADMIN-14**: Admin can manage team members: view list, see task counts per member, invite new members by email

### Team Member: Task Workflow

- [ ] **TEAM-01**: Team member sees dashboard with cards: total assigned, due today, overdue, completed
- [ ] **TEAM-02**: Team member sees assigned tasks sorted by due date with project name, client name, title, status dot
- [ ] **TEAM-03**: Team member task detail shows read-only: title, briefing (with clickable links), posting date, due date
- [ ] **TEAM-04**: Team member can edit: caption (text area), design file upload
- [ ] **TEAM-05**: Team member can change task status
- [ ] **TEAM-06**: "Notify Assigner" button creates notification for admin and marks task status as done
- [ ] **TEAM-07**: Team member RLS ensures they can only see/edit their own assigned tasks
- [ ] **TEAM-08**: Caption field shows "Copy" button; design file shows "Download" button

### Notifications

- [ ] **NOTIF-01**: Notification records created when team member clicks "Notify Assigner"
- [ ] **NOTIF-02**: Notification message format: "[Team member name] marked [task title] as done."
- [ ] **NOTIF-03**: Admin notifications page lists all notifications, marks as read on click
- [ ] **NOTIF-04**: Unread count badge displayed on bell icon in header
- [ ] **NOTIF-05**: Notifications shown on admin dashboard (recent list)

### Client Portal

- [ ] **CLIENT-01**: Client can access portal via `/portal/[slug]` URL (no login required)
- [ ] **CLIENT-02**: Portal shows the client's active project
- [ ] **CLIENT-03**: Kanban view with four columns: todo, in_progress, done, overdue
- [ ] **CLIENT-04**: Calendar view with week and month toggle, tasks plotted by posting date
- [ ] **CLIENT-05**: Timeline view with month-grouped swimlanes, task bars by date
- [ ] **CLIENT-06**: Task card shows: title, posting date, status indicator (animated pulsing dot)
- [ ] **CLIENT-07**: Clicking a task opens modal/drawer showing: caption with copy button, design file with download button, posting date, status
- [ ] **CLIENT-08**: Portal is read-only — no mutations from client side
- [ ] **CLIENT-09**: Portal uses `force-dynamic` rendering to prevent stale cache
- [ ] **CLIENT-10**: Design file downloads use signed URLs (60s expiry)

### UI/UX

- [x] **UI-01**: Poppins font used throughout (Google Fonts import)
- [x] **UI-02**: Colors follow spec: white bg (#FFFFFF), black text (#111111), button fill (#222222), borders (#E5E5E5), muted text (#888888)
- [x] **UI-03**: Status dots: done=#22C55E, in_progress=#FACC15, overdue=#EF4444, todo=#D1D5DB with animated pulse effect
- [x] **UI-04**: No box shadows, no gradients, no rounded corners larger than 8px
- [x] **UI-05**: Mobile responsive — all pages functional at 375px width
- [x] **UI-06**: Overdue detection: `posting_date < today AND status != 'done'`

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
| ADMIN-06 | Phase 2 | Pending |
| ADMIN-07 | Phase 2 | Pending |
| ADMIN-08 | Phase 2 | Pending |
| ADMIN-09 | Phase 2 | Pending |
| ADMIN-10 | Phase 2 | Pending |
| ADMIN-11 | Phase 2 | Pending |
| ADMIN-12 | Phase 2 | Pending |
| ADMIN-13 | Phase 2 | Pending |
| ADMIN-14 | Phase 2 | Complete |
| TEAM-01 | Phase 3 | Pending |
| TEAM-02 | Phase 3 | Pending |
| TEAM-03 | Phase 3 | Pending |
| TEAM-04 | Phase 3 | Pending |
| TEAM-05 | Phase 3 | Pending |
| TEAM-06 | Phase 3 | Pending |
| TEAM-07 | Phase 3 | Pending |
| TEAM-08 | Phase 3 | Pending |
| NOTIF-01 | Phase 3 | Pending |
| NOTIF-02 | Phase 3 | Pending |
| NOTIF-03 | Phase 3 | Pending |
| NOTIF-04 | Phase 3 | Pending |
| NOTIF-05 | Phase 3 | Pending |
| CLIENT-01 | Phase 4 | Pending |
| CLIENT-02 | Phase 4 | Pending |
| CLIENT-03 | Phase 4 | Pending |
| CLIENT-04 | Phase 4 | Pending |
| CLIENT-05 | Phase 4 | Pending |
| CLIENT-06 | Phase 4 | Pending |
| CLIENT-07 | Phase 4 | Pending |
| CLIENT-08 | Phase 4 | Pending |
| CLIENT-09 | Phase 4 | Pending |
| CLIENT-10 | Phase 4 | Pending |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| UI-04 | Phase 1 | Complete |
| UI-05 | Phase 1 | Complete |
| UI-06 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 58 total
- Mapped to phases: 58
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-04 after research synthesis*
