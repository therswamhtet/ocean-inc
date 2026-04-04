# Phase 2: Admin Core — Client, Project, and Task Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 02-admin-core-client-project-and-task-management
**Areas discussed:** Navigation structure, Task views, Team member invite, Dashboard layout, File upload UX

---

## Navigation Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar (Recommended) | Persistent left sidebar with icon + label links. Always visible, collapses on mobile to hamburger. | ✓ |
| Top tabs | Horizontal tabs across the top. Simpler, more mobile-friendly, but limited space. | |
| Responsive sidebar | Sidebar on desktop, hamburger drawer on mobile. | |

**User's choice:** Sidebar (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| 3 top-level items (Recommended) | Dashboard, Clients, Team Members — Projects and Tasks are sub-pages within Clients. | ✓ |
| 5 top-level items | Dashboard, Clients, Projects, Tasks, Team Members — everything flat at top level. | |
| 3 + Settings | Dashboard, Clients, Team Members + Settings page. | |

**User's choice:** 3 top-level items (Recommended)

**Notes:** Projects and Tasks nest under Clients as sub-pages. Clean hierarchy.

---

## Task Views

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle buttons (Recommended) | Toggle buttons (List | Kanban) at top of task list. Remembers last choice per session. | ✓ |
| Dropdown | Dropdown selector to switch views. | |

**User's choice:** Toggle buttons (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Compact columns (Recommended) | Title, status dot, posting date, assigned-to name, due date. | ✓ |
| Minimal rows | Title + status + date only. Expand for details. | |

**User's choice:** Compact columns (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| 3 columns + overdue flag (Recommended) | todo, in_progress, done. Overdue is a visual flag (red dot) on tasks past posting_date. | ✓ |
| 4 columns (including overdue) | todo, in_progress, done, overdue — matching client portal exactly. | |

**User's choice:** 3 columns + overdue flag (Recommended)

**Notes:** Overdue is computed at render time, not a separate status/column.

---

## Team Member Invite

| Option | Description | Selected |
|--------|-------------|----------|
| Inline with copy button (Recommended) | Admin enters email on team page → token generated → link shown inline → admin copies and sends manually. | ✓ |
| Modal popup | Separate invite modal/dialog that opens from team page. | |

**User's choice:** Inline with copy button (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Name + email + task count (Recommended) | Name, email, task count (assigned tasks), joined date. Clean and scannable. | ✓ |
| Full details | Name, email, task count, last active date. More detail. | |

**User's choice:** Name + email + task count (Recommended)

**Notes:** No email service — admin shares invite link manually via WhatsApp, Slack, etc.

---

## Dashboard Layout

| Option | Description | Selected |
|--------|-------------|----------|
| 4 metric cards (Recommended) | 4 cards in a row: Active Projects, In Progress, Overdue, Completed This Month. Simple numbers. | ✓ |
| Grouped cards | Same 4 metrics grouped: Projects (1 card) + Tasks (3 cards). | |

**User's choice:** 4 metric cards (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Recent list (Recommended) | Recent 5 notifications below metric cards. Click to mark read, 'View all' link. | ✓ |
| Badge only, no list | Separate notifications page only, badge on sidebar shows count. | |

**User's choice:** Recent list (Recommended)

**Notes:** Dashboard has two sections: metric cards row + recent notifications list.

---

## File Upload UX

| Option | Description | Selected |
|--------|-------------|----------|
| Click + drag-and-drop (Recommended) | Click-to-upload button + drag-and-drop zone. Shows file name and size after selection. | ✓ |
| Click-only button | Simple file input button only. | |

**User's choice:** Click + drag-and-drop (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate upload (Recommended) | File uploads immediately when selected/dropped. Shows progress bar. URL stored on task after form submit. | ✓ |
| Upload on submit | File selected but not uploaded until form submit. | |

**User's choice:** Immediate upload (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Show current + replace (Recommended) | Show current file name + download link + 'Replace' button. | ✓ |
| Upload zone always | Always show upload zone. No indication of existing file. | |

**User's choice:** Show current + replace (Recommended)

**Notes:** Progress bar during upload. Mobile falls back to click-to-upload (drag-and-drop not reliable on touch).

---

## Agent's Discretion

Areas deferred to the agent:
- Exact sidebar styling (width, icon choices, active state)
- Kanban card layout (which fields on card face)
- Mobile behavior for drag-and-drop zone
- Form layout patterns
- Dashboard card styling
- Error handling patterns for upload failures
