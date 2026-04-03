# Feature Research

**Domain:** Project management & client portal for a digital marketing agency
**Researched:** 2026-04-04
**Confidence:** HIGH (PROJECT.md requirements validated; feature landscape informed by competitor analysis of ClickUp, Asana, Monday.com, and standard agency workflow patterns; synthesis of existing research files)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete and users will abandon it.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Admin authentication (email + password)** | Without it, no security boundary exists | LOW | Single admin account per PROJECT.md. Supabase Auth with cookie-based sessions. |
| **Client CRUD** | The agency must register and manage clients in the system | LOW | Create client, generate unique slug, view client's projects. |
| **Project CRUD (monthly cycles)** | The core organizing unit -- each month is a project for a client | LOW | Projects belong to clients. Month/year labeling. |
| **Task CRUD (caption, design file, posting date, briefing)** | Core unit of work -- each task = one social media post | LOW | Admin creates tasks. Each has caption, file, posting date, briefing, status. |
| **Task assignment to team members** | Without assignment, no one owns the work | LOW | Admin assigns via dropdown. Enforced by Supabase RLS (`assigned_to = auth.uid()`). |
| **Team member registration via invite token** | Standard onboarding; admin invites, team joins | LOW | One-time token, consumed on use. No email service needed. Delivered out-of-band. |
| **Team member sees only assigned tasks** | Data isolation is non-negotiable for team workflow | MEDIUM | RLS-enforced. Team dashboard shows filtered task list. |
| **Team member task editing** | Team must be able to upload files and edit captions | LOW | Caption textarea with copy button. File upload to Supabase Storage. Status change. |
| **Kanban view (client portal)** | Universal PM expectation; users think in status columns | LOW | Client portal default. Four columns: todo, in_progress, done, overdue. |
| **Calendar view -- month + week (client portal)** | Posting dates are the primary organizing dimension for social media | MEDIUM | Two sub-views. Tasks plotted by `posting_date`. Uses `date-fns` + Radix popover. |
| **Timeline view (client portal)** | Gantt-style rendering for content calendar overview | MEDIUM | Horizontal scroll with task bars positioned by date. Month-grouped swimlanes. |
| **Task detail view** | Users need caption, file, date, and status in one place | LOW | Modal or slide-out. "Copy caption" button and "Download file" button (both mandated). |
| **Status indicators with visual feedback** | At-a-glance awareness of work state | LOW | Four statuses: todo, in_progress, done, overdue. Overdue gets animated pulsing dots. Black-and-white brand means shape/icon differentiation, not color. |
| **Briefing text with clickable links** | Briefings reference brand guidelines, mood boards, inspiration | LOW | Auto-detect URLs, render as anchor tags with `target="_blank"`. No rich text editor needed. |
| **"Copy caption" button** | Explicitly mandated in PROJECT.md | LOW | One-click clipboard copy. Toast confirmation. Essential for social media workflow. |
| **File download button** | Explicitly mandated in PROJECT.md | LOW | Signed URL generation (60s expiry) for client portal. Direct download for auth'd users. |
| **Role-based access control** | Three distinct roles with different capabilities | MEDIUM | Admin (full), team_member (assigned only), client (read-only, slug-based). RLS on every table. |
| **Overdue detection** | Deadline-aware workflow is essential for content calendars | LOW | Computed: `posting_date < today AND status != 'done'`. Shown in all views. |
| **In-app notifications (team-to-admin handoff)** | Admin needs to know when team completes work | MEDIUM | Notification bell in header + drawer (shadcn sheet). Created on task status change to `done`. |
| **Admin dashboard with metrics** | Admins need overview of all client projects and team workload | MEDIUM | Project count, task completion rate, overdue count, team utilization. Uses `@tanstack/react-table`. |

### Differentiators (Competitive Advantage)

Features that set this product apart. Not required for launch, but create real value and reduce friction for this specific workflow.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Client portal via magic-link slug (no login)** | Zero-friction client access. Clients bookmark their URL and see everything. No password resets, no forgotten credentials. Most competitor portals require guest accounts or login. | LOW | Already mandated. The slug is the auth token. Differentiator is the deliberate choice of this as primary access, not a fallback. |
| **Three client portal views (Kanban + Calendar + Timeline)** | Clients get the exact perspective they prefer without asking the agency to reformat data. Most agency portals offer only one view. | MEDIUM | Timeline is the hardest. Kanban and Calendar are expected; Timeline differentiates. |
| **Team-to-admin handoff notification in one action** | Team member marks done and notifies admin simultaneously. No separate "notify" step. Closes the feedback loop and prevents work from sitting idle. | LOW | Single button: "Mark as done & notify admin". Server Action creates notification + updates status in one transaction. |
| **Content review/approval workflow** | Formal approval status (pending_review, approved, needs_revision) with revision notes gives clients agency and creates a lightweight audit trail. | MEDIUM | Add `review_state` dimension to tasks: `none | pending | approved | needs_revision`. Client clicks "Request revision" with optional notes. Admin sees flagged items. This replaces building a full comment system with a focused approval loop. See anti-features for why comments are deferred. |
| **Internal vs. client-facing dates** | Due date for team (earlier) and posting deadline for client (later) -- allows the agency buffer time without the client seeing internal deadlines. | LOW | Two date fields per task: `internal_due_date` and `posting_date`. Internal date drives overdue for team; posting date drives client timeline. |
| **Notify Assigner button** | Team member signals completion to the admin who created the task. This is the primary notification trigger. | LOW | Creates notification record linked to task and admin. Simple but essential for the team-to-admin handoff pattern. |
| **One-time invite tokens for team** | Secure registration without email service dependency. | LOW | Token table with used flag + expiry. Already in PROJECT.md scope. |
| **Overdue detection with animated indicators** | Visual urgency without being aggressive. Pulsing dots create natural awareness of deadlines that keeps both team and clients informed. | LOW | CSS animation on overdue badge. Works in Kanban, Calendar, and Timeline views. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Explicitly documented to prevent scope creep.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Email notifications** | "Everyone expects email" | Requires third-party email service (Resend, SendGrid, SES). Adds cost, complexity, deliverability monitoring, and template management. For a single-agency internal tool, in-app notifications are sufficient. | In-app notification bell + drawer. Admin and team members visit the app regularly. Add email later only if validated as needed. |
| **Direct social media publishing** | "Post directly to Instagram/Facebook" | Requires OAuth per platform, token refresh management, API rate limits, platform-specific formatting, and ongoing maintenance as APIs change. This is content management, not publishing. | Explicitly out of scope per PROJECT.md. Design file + caption output is the deliverable. Agency posts manually. |
| **Full audit trail / activity log** | "I want to see who did what and when" | Requires tracking every mutation on every table, building a dedicated audit table or event stream, and a UI to display it. For a 3-role, single-agency tool, this is over-engineering. | Add `created_at`, `updated_at`, `updated_by` columns to core tables. Answers 95% of "who changed this" questions at 5% of the cost. |
| **Multiple admin accounts** | "What if the admin is unavailable?" | Adds role management complexity, admin-to-admin permissions, and potential conflicts. The agency has one decision-maker. | Document admin recovery process (Supabase Auth Admin API can reset password). If needed later, single database row change. |
| **Real-time collaboration (live cursors, multiplayer editing)** | "Like Google Docs but for tasks" | Requires WebSocket infrastructure, conflict resolution (OT/CRDT), and significant frontend complexity. Team members work asynchronously on different tasks -- simultaneous editing of the same task is vanishingly rare. | Standard server action mutations with optimistic UI updates. Server-side state is the single source of truth. |
| **Payment system / invoicing** | "Clients should see bills" | Adds PCI concerns, webhook handling, receipt generation, tax compliance. This is a content management tool, not an accounting system. | Link to external invoicing tool if needed. Keep this product focused on content workflow. |
| **File versioning** | "What if we need the old design?" | Requires maintaining multiple file versions per task, a version selector UI, and storage cost growth. The agency workflow is iterative -- the latest file is what matters. | Single file per task per PROJECT.md. If previous version needed, admin re-uploads. Rare enough to not warrant system-level versioning. |
| **Search functionality** | "I want to find things fast" | Full-text search adds indexing complexity, UI for search results, and maintenance. At agency scale (< 500 tasks total), browsing by client/project is faster. | Filter by client, project, status, team member. Add search when task count exceeds ~1000. |
| **Client comments on tasks** | "Clients should be able to give feedback" | Comment systems require threading, notifications, spam prevention, moderation, and UI complexity. For a read-only client portal, comments blur the line between viewing and editing. | Use the content review/approval workflow with revision notes instead. Client says "needs revision" with a note -- focused, actionable feedback without building a full comment system. |
| **Recurring task templates** | "Same tasks every month" | Template management requires a template data model, instantiation logic, and UI. Monthly cycles are predictable enough to duplicate the previous month's tasks. | "Copy from previous month" button on project creation. Simpler than a full template system, covers 95% of use cases. |
| **Activity log / audit trail** | "Transparency requirement" | Write-heavy, storage cost, UI complexity. Not needed for MVP scale. | Deferred per PROJECT.md. Revisit when agency has enough history to demand it. |

## Feature Dependencies

```
Database Schema + RLS Policies (foundation)
    └──requires──> (none -- this is the root)
        └──enables──> Admin Authentication
        └──enables──> Supabase Storage (design-files bucket)

Admin Authentication
    └──requires──> Database Schema + RLS Policies
    └──requires──> Supabase Auth setup
    └──enables──> Client CRUD
    └──enables──> Project CRUD
    └──enables──> Team invite generation
    └──enables──> Admin dashboard

Client Management (CRUD)
    └──requires──> Admin Authentication
    └──enables──> Project creation (projects belong to clients)

Project Creation (monthly cycles)
    └──requires──> Client Management
    └──enables──> Task management (tasks belong to projects)
    └──enables──> "Copy from previous month" (needs prior project data)

Task Management (CRUD)
    └──requires──> Project Creation
    └──requires──> Supabase Storage (for design files)
    └──requires──> Admin Authentication
    └──enables──> Task assignment
    └──enables──> Client portal views
    └──enables──> Content review/approval workflow
    └──enables──> Notifications

Task Assignment to Team Members
    └──requires──> Task Management
    └──requires──> Team Member Registration (assignees must exist)
    └──enables──> Team task dashboard

Team Member Registration (invite token flow)
    └──requires──> Admin Authentication (admin creates invites)
    └──requires──> Invite token table + generation logic
    └──requires──> Supabase Auth setup
    └──enables──> Team task dashboard
    └──enables──> Task editing by team

Team Task Dashboard (assigned tasks list)
    └──requires──> Team Member Registration
    └──requires──> Task Assignment
    └──requires──> RLS for team scope
    └──enables──> Task editing by team

Team Task Editing (caption, file upload, status)
    └──requires──> Team Task Dashboard
    └──requires──> Supabase Storage (file uploads)
    └──requires──> RLS UPDATE policies for team
    └──enables──> Team-to-admin handoff notifications

File Upload / Download
    └──requires──> Task Management
    └──requires──> Supabase Storage bucket + policies
    └──enables──> Signed URL generation (client portal downloads)

Team-to-Admin Handoff Notifications
    └──requires──> Team Task Editing (task completion event)
    └──requires──> Notification table + in-app UI
    └──enhances──> Task completion flow
    └──enhances──> Admin dashboard (notification count)

Content Review / Approval Workflow
    └──requires──> Task Management
    └──requires──> Client Portal (client interaction point)
    └──requires──> Notification system (revision requests notify admin)
    └──enhances──> Client portal (adds interaction beyond read-only)

Client Portal (Kanban view -- default)
    └──requires──> Task Management (needs tasks to display)
    └──requires──> Client lookup by slug
    └──requires──> Public data access pattern (service_role or public view)
    └──enables──> Calendar view
    └──enables──> Timeline view

Client Portal (Calendar view -- week + month)
    └──requires──> Client Portal (Kanban view)
    └──requires──> Date formatting utilities (date-fns)
    └──shares──> Data fetching with Kanban view

Client Portal (Timeline view)
    └──requires──> Client Portal (Kanban view)
    └──requires──> Calendar view (shares date-based rendering logic)
    └──enhances──> Client portal (third viewing mode)

Admin Dashboard (metrics overview)
    └──requires──> Task Management
    └──requires──> Client Management
    └──requires──> Team Member Registration
    └──enhances──> Admin experience (aggregates existing data)

Briefing with Clickable Links
    └──requires──> Task Management (briefing field)
    └──enhances──> Task detail view (both admin and client)
```

### Dependency Notes

- **Database Schema + RLS is the root dependency.** Nothing works without tables, policies, and Supabase setup. This is Phase 1.
- **Admin Authentication unlocks everything admin-side.** Client CRUD, project creation, task creation, and team invites all require an authenticated admin.
- **Task Management is the trunk dependency.** Projects exist to contain tasks; clients exist to own projects; team members exist to be assigned tasks; the client portal exists to display tasks; notifications exist to track task state changes.
- **Team features are sequential.** Registration must precede assignment, which must precede the team dashboard, which must precede task editing, which must precede handoff notifications.
- **Client portal views are layered.** Kanban is the base; Calendar builds on the same data with different rendering; Timeline builds on Calendar's date logic. Build sequentially for shared code reuse.
- **Content review/approval is a post-MVP enhancement.** It requires both the client portal AND the notification system to be useful. Defer to v1.x.
- **Notifications enhance but do not block core flows.** The product works without notifications (admin can see completed tasks on dashboard). But notifications close the feedback loop and should ship in v1.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate the concept.

- [ ] **Database schema + RLS policies** -- Foundation for everything. Tables: clients, projects, tasks, profiles, team_invites, notifications. RLS on every table. Indexes on all policy columns.
- [ ] **Admin authentication** -- Email + password. Single admin account. Supabase Auth with cookie sessions. Middleware route protection.
- [ ] **Client CRUD** -- Create client, generate random slug, view client's projects. Slug is unguessable (random hex, not company name).
- [ ] **Project creation (monthly cycles)** -- Projects belong to clients. Month/year labeling. "Copy from previous month" can wait for v1.x.
- [ ] **Task CRUD** -- Caption, design file, posting date, briefing, status. Admin creates, team edits, client reads.
- [ ] **Task assignment to team members** -- Admin assigns via dropdown. RLS enforces team sees only assigned tasks.
- [ ] **Team member registration via invite token** -- One-time token, consumed on use. Admin generates and shares link out-of-band.
- [ ] **Team task dashboard** -- Assigned tasks list, sorted by posting date. Team sees only their tasks.
- [ ] **Team task editing** -- Edit caption, upload design file, mark task done. Status change triggers notification to admin.
- [ ] **Client portal (Kanban view)** -- Default client view. Four status columns. Read-only. Animated overdue dots.
- [ ] **Client portal (Calendar view)** -- Month + week toggle. Tasks plotted by posting date.
- [ ] **Client portal (Timeline view)** -- Horizontal scroll, month-grouped swimlanes. Task bars positioned by date.
- [ ] **Client portal task detail** -- Modal with caption (copy button), design file (download button), posting date, status.
- [ ] **In-app notifications** -- Bell icon in admin header. Notification drawer. Team-to-admin handoff on task completion.
- [ ] **Admin dashboard with metrics** -- Project count, task completion rate, overdue tasks, team utilization.
- [ ] **Briefing with clickable links** -- URL auto-detection in briefing text.
- [ ] **Supabase Storage + signed URLs** -- Private bucket for design files. Signed URLs for client portal (60s expiry).
- [ ] **Overdue detection** -- `posting_date < today AND status != 'done'`. Shown in all views with animated indicator.

### Add After Validation (v1.x)

Features to add once core is working and the agency has used it for 1-2 monthly cycles.

- [ ] **Content review/approval workflow** -- Add after observing how clients currently give feedback. The review/approval pattern should match actual client behavior, not assumed behavior. Add `review_state` field and revision notes.
- [ ] **"Copy from previous month" for projects** -- Add once the agency has created 2+ months of content and the duplication pattern is clear.
- [ ] **Team member management** -- Revoke access, reassign tasks from one member to another. MVP covers invite-only; add management once team size justifies it.
- [ ] **Team task comments** -- Add if team members need to discuss task details within the app rather than externally (Slack, WhatsApp, etc.).
- [ ] **Admin notification preferences** -- Mute certain notification types (e.g., don't notify when the same team member completes 5 tasks in a row).
- [ ] **Internal vs. client-facing dates** -- Add once the agency workflow confirms the need for a buffer between internal due date and client posting deadline.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Email notifications** -- Only if in-app notifications prove insufficient (team members miss them).
- [ ] **Search across tasks/projects/clients** -- Only when task count exceeds ~1000.
- [ ] **Multiple admin accounts** -- Only if agency grows beyond a single decision-maker.
- [ ] **Audit trail / activity log** -- Only if compliance or dispute resolution demands it.
- [ ] **File versioning** -- Only if the agency frequently needs to revert to previous designs.
- [ ] **Direct social media publishing integration** -- Only if the agency explicitly requests this (currently out of scope by design).
- [ ] **Payment/invoicing integration** -- Only if the agency wants to consolidate billing into this tool.
- [ ] **Realtime Supabase subscriptions for live notifications** -- Currently, notifications are fetched on page load. Add realtime only if admin complains about missing notifications between page visits.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Database Schema + RLS | HIGH | MEDIUM | P1 |
| Admin Authentication | HIGH | LOW | P1 |
| Client CRUD | HIGH | LOW | P1 |
| Project Creation | HIGH | LOW | P1 |
| Task CRUD | HIGH | LOW | P1 |
| Task Assignment | HIGH | LOW | P1 |
| Team Registration | HIGH | LOW | P1 |
| Team Task Dashboard | HIGH | LOW | P1 |
| Team Task Editing | HIGH | LOW | P1 |
| Client Portal Kanban | HIGH | LOW | P1 |
| Client Portal Calendar | HIGH | MEDIUM | P1 |
| Client Portal Timeline | HIGH | MEDIUM | P2 |
| Client Task Detail | HIGH | LOW | P1 |
| Team-to-Admin Notifications | HIGH | LOW | P1 |
| Admin Dashboard Metrics | MEDIUM | MEDIUM | P1 |
| Overdue Detection | HIGH | LOW | P1 |
| Briefing with Clickable Links | MEDIUM | LOW | P1 |
| Supabase Storage + Signed URLs | HIGH | LOW | P1 |
| Content Review/Approval | HIGH | MEDIUM | P2 |
| Copy from Previous Month | MEDIUM | LOW | P2 |
| Team Member Management | MEDIUM | LOW | P2 |
| Team Task Comments | MEDIUM | MEDIUM | P2 |
| Internal vs. Client Dates | MEDIUM | LOW | P2 |
| Email Notifications | MEDIUM | MEDIUM | P3 |
| Search | LOW | MEDIUM | P3 |
| Multiple Admin Accounts | LOW | LOW | P3 |
| Audit Trail | LOW | HIGH | P3 |
| File Versioning | LOW | MEDIUM | P3 |
| Social Media Publishing | LOW | HIGH | P3 |
| Payment/Invoicing | LOW | HIGH | P3 |
| Realtime Subscriptions | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible (within first 1-2 monthly cycles)
- P3: Nice to have, future consideration

## Competitor Feature Analysis

How established project management and agency tools approach these features, and what Orca Digital should do differently.

| Feature | ClickUp | Asana | Monday.com | Our Approach |
|---------|---------|-------|------------|--------------|
| **Task management** | Rich tasks with 15+ field types, subtasks, checklists, dependencies | Tasks with custom fields, subtasks, dependencies | Items with customizable columns, automations | Focused tasks: caption, design file, posting date, briefing, status. No subtasks, no custom fields. Scope is social media content, not general PM. |
| **Kanban view** | Board view with drag-and-drop, swimlanes, multiple groupings | Board view with grouping options, automation rules | Kanban with automations, custom columns | Four-column Kanban (todo, in_progress, done, overdue). No swimlanes. Drag optional. Simpler is better for client comprehension. |
| **Calendar view** | Calendar with drag-to-reschedule, week/month toggle, time blocking | Calendar with date-range filtering, team calendar overlay | Calendar with timeline grouping, color coding | Month + week views. Tasks plotted by posting_date. Read-only for clients. No drag (clients do not edit). |
| **Timeline/Gantt** | Gantt chart with dependencies, critical path, resource management | Timeline view with dependencies, milestones, workload | Gantt with dependencies, baselines, resource view | Simplified timeline (no dependencies). Month-grouped swimlanes. Read-only for clients. Differentiator: month grouping matches agency's mental model. |
| **Client access** | Guest accounts with limited permissions, paid tier required | Guest access with controlled visibility, paid tier required | Client portals with branded views, paid feature | Magic-link slug (no login). Read-only. No paid tier, no guest account setup. Simpler than any competitor -- this is the primary differentiator. |
| **Approvals** | Dedicated approval workflow with review stages, annotations | Proofing and approval with annotations, version comparison | Approvals with automated status changes, custom review flows | Lightweight review state (pending/approved/needs_revision) with notes. No dedicated approval UI. Defer to v1.x. |
| **Notifications** | Inbox with customizable alerts, email, mobile push, digest | Inbox with email and push options, smart rules | Notifications with email digest, automations | In-app only. Notification bell + drawer. No email, no push. Matches agency workflow per PROJECT.md. |
| **File management** | Attachments, proofs, version history, real-time collaboration | Attachments, proofs with annotations, version history | File column with versioning, preview | Single file per task. Upload to Supabase Storage. Signed URL downloads. No versioning. Per PROJECT.md, single file is sufficient. |
| **Team assignment** | Multiple assignees, workload balancing, capacity planning | Single assignee + collaborators, workload management | People column with workload view, capacity tracking | Single assignee per task. Admin assigns. Team sees only their tasks. No workload view in v1. |
| **Reporting** | Dashboards with 50+ widgets, custom charts, portfolio rollup | Portfolio dashboards, workload reports, custom reporting | Dashboard with 10+ widget types, automations | Basic metrics: project count, completion rate, overdue count, team utilization. No custom dashboards. |
| **Integrations** | 200+ integrations (Slack, Google, GitHub, etc.) | 200+ integrations (Slack, Zoom, etc.) | 40+ native integrations | None in v1. Standalone tool. No integrations planned. |
| **Mobile** | Full mobile app (iOS + Android) | Full mobile app (iOS + Android) | Full mobile app (iOS + Android) | Responsive web only. Must work at 375px width. No native app. |

## Sources

- [ClickUp Features Documentation](https://clickup.com/features) -- MEDIUM confidence (verified via WebFetch)
- [Orca Digital PROJECT.md](/Users/MSIModern14/ocean-inc/.planning/PROJECT.md) -- HIGH confidence (project requirements document)
- [ARCHITECTURE.md](/Users/MSIModern14/ocean-inc/.planning/research/ARCHITECTURE.md) -- HIGH confidence (existing research)
- [STACK.md](/Users/MSIModern14/ocean-inc/.planning/research/STACK.md) -- HIGH confidence (existing research)
- [PITFALLS.md](/Users/MSIModern14/ocean-inc/.planning/research/PITFALLS.md) -- HIGH confidence (existing research)
- Industry knowledge of Asana, Monday.com feature sets -- MEDIUM confidence (training data, not independently verified for 2026)
- Supabase RLS and Storage documentation -- HIGH confidence (official docs, verified in ARCHITECTURE.md and PITFALLS.md research)

---
*Feature research for: Orca Digital project management & client portal*
*Researched: 2026-04-04*
