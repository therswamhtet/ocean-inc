# Feature Research

**Domain:** Project Management & Client Portal for Digital Marketing Agency
**Researched:** 2026-04-04
**Confidence:** HIGH (features defined by user specification)

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Task creation with caption, file, dates | Core unit of work — each task = one social media post | LOW | Must support file upload/download |
| Kanban view | Standard PM view for workflow status | MEDIUM | Drag-and-drop state changes |
| Calendar view (week + month) | Clients need to see posting schedule visually | MEDIUM | Date grid with task placement |
| Timeline view | Gantt-style view of content calendar | MEDIUM | Linear date-based layout |
| Status indicators (todo/in_progress/done) | Essential workflow tracking | LOW | Animated pulsing dots with colors |
| Admin manages clients & projects | Core admin workflow | LOW | CRUD for clients, projects |
| Admin assigns tasks to team members | Core team workflow | LOW | Dropdown assignment |
| Team member sees only assigned tasks | Data isolation | MEDIUM | RLS-dependent |
| Team member uploads design files | Core team workflow | MEDIUM | Supabase Storage upload |
| Team member edits caption | Core team workflow | LOW | Text area with copy button |
| Client read-only portal | Core value delivery | MEDIUM | Slug-based access, no auth |
| Task detail modal/drawer | Drill-down into individual posts | LOW | Caption copy + file download |
| Copy button for captions | Workflow requirement — captions need to be copied for posting | LOW | Clipboard API |
| Download button for design files | Workflow requirement | LOW | Signed URL generation |
| Briefing text with clickable links | Content guidance for team members | LOW | URL-to-anchor rendering |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Client portal without login | Zero friction for clients — just share a link | LOW | Slug-based access, stored in DB |
| Three view types (Kanban/Calendar/Timeline) | Clients can view data their preferred way | MEDIUM | Each view is non-trivial |
| Internal vs client-facing dates | Due date for team, deadline for client | LOW | Two date fields per task |
| Notify Assigner button | Team member signals completion to admin | LOW | Creates notification record |
| In-app notifications | Keeps admin informed of team activity | MEDIUM | Real-time or polling |
| One-time invite tokens for team | Secure registration without email service | LOW | Token table with used flag |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Email notifications | Seems more reliable | Requires email service, adds complexity/cost | In-app notifications only for MVP |
| Direct social media posting | Would automate the workflow | Requires OAuth per platform, API rate limits, ongoing maintenance | Manual posting by client; this is content management, not publishing |
| Multiple admin accounts | Seems more flexible | Adds RBAC complexity, permission conflicts | Single admin is sufficient for MVP |
| Activity log / audit trail | Transparency requirement | Write-heavy, storage cost, UI complexity | Not needed for MVP scale |
| File versioning | Design iterations | Storage cost, complexity | Single file per task is the workflow |

## Feature Dependencies

```
Database Schema + RLS
    ├──requires──> (foundation — no deps)

Admin Authentication
    ├──requires──> Database Schema

Client Management
    ├──requires──> Admin Authentication
    └──requires──> Database Schema

Project Management
    ├──requires──> Client Management

Task Management (CRUD)
    ├──requires──> Project Management
    ├──requires──> Supabase Storage
    └──enhances──> File upload/download

Team Member Invite & Registration
    ├──requires──> Admin Authentication
    └──requires──> Supabase Auth

Team Task Dashboard
    ├──requires──> Team Member Registration
    ├──requires──> Task Assignment
    └──requires──> RLS for team scope

Task Detail (Team Edit)
    ├──requires──> Team Task Dashboard
    ├──requires──> File upload/download
    └──enhances──> Notifications

Notifications
    ├──requires──> Task Management
    └──requires──> Admin Authentication

Client Portal
    ├──requires──> Task Management
    ├──requires──> Client Management
    └──requires──> Public API routes
```

### Dependency Notes

- **Database Schema + RLS** must come first — everything depends on it
- **Admin Authentication** unlocks all admin features
- **Task Management** must exist before team members or clients can interact with tasks
- **Team features** require Supabase Auth + RLS
- **Client portal** is last — needs all data populated by admin workflows first

## MVP Definition

### Launch With (v1)

- [x] Database schema with all tables + RLS — foundation for everything
- [x] Admin auth (email + password) — single admin account
- [x] Client CRUD (name, slug generation) — manage agency clients
- [x] Project CRUD (per client, month/year) — monthly content cycles
- [x] Task CRUD (caption, file, dates, briefing, status) — core workflow
- [x] File upload/download via Supabase Storage — design file handling
- [x] Team member invite + registration flow — one-time tokens
- [x] Team task dashboard — assigned tasks, sorted by due date
- [x] Team task detail (edit caption, upload file, comment) — team workflow
- [x] Notify Assigner button — team signals completion
- [x] Admin dashboard with metrics — overview cards
- [x] Admin task detail (full edit, assign, comment) — admin workflow
- [x] Client portal (Kanban, Calendar, Timeline) — read-only client view
- [x] In-app notifications — admin sees team activity

### Add After Validation (v1.x)

- [ ] Admin notification preferences — mute certain notification types
- [ ] Bulk task operations — assign multiple tasks at once
- [ ] Client feedback on portal — comment/approval from client side

### Future Consideration (v2+)

- [ ] Email notifications — replace in-app with email delivery
- [ ] Social media auto-posting — direct publishing integrations
- [ ] Multiple admin accounts — team management
- [ ] Activity log — audit trail
- [ ] Search across projects/tasks
- [ ] File versioning for design iterations

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Database Schema + RLS | HIGH | MEDIUM | P1 |
| Admin Auth | HIGH | LOW | P1 |
| Client CRUD | HIGH | LOW | P2 |
| Project CRUD | HIGH | LOW | P2 |
| Task CRUD | HIGH | MEDIUM | P2 |
| File Upload/Download | HIGH | MEDIUM | P2 |
| Team Invite + Registration | HIGH | MEDIUM | P3 |
| Team Dashboard | HIGH | MEDIUM | P3 |
| Team Task Edit | HIGH | MEDIUM | P3 |
| Admin Dashboard | MEDIUM | LOW | P2 |
| Admin Task Detail | HIGH | MEDIUM | P3 |
| Notifications | MEDIUM | LOW | P3 |
| Client Portal | HIGH | HIGH | P4 |

## Competitor Feature Analysis

| Feature | Asana/Monday | Agency-specific tools | Our Approach |
|---------|-------------|----------------------|--------------|
| Client portal | Guest view (paid tier) | Branded portal | Simple slug URL, no auth — free alternative |
| Task assignment | Full assignee system | Team assignments | Same, simplified |
| Calendar view | Built-in | Content calendar | Calendar view with week/month toggle |
| File management | Attachments | File uploads | Supabase Storage with signed URLs |
| Content approval | Custom workflows | Approval gates | Status-based (todo → in_progress → done) |

## Sources

- User specification (comprehensive feature list provided)
- Competitor analysis: Asana, Monday.com, ClickUp, ContentCal
- Agency pain points: client communication, content review cycles
- Supabase documentation for feature feasibility assessment

---
*Feature research for: Orca Digital Project Management & Client Portal*
*Researched: 2026-04-04*
