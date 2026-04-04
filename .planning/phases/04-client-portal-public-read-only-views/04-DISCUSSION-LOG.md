# Phase 4: Client Portal — Public Read-Only Views - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 04-client-portal-public-read-only-views
**Areas discussed:** Kanban columns, Active project logic, View toggle, Task detail, Calendar default, Timeline design, Empty state

---

## Kanban Columns

| Option | Description | Selected |
|--------|-------------|----------|
| 3 columns + overdue flag | Match admin Kanban — overdue is a red pulsing dot on tasks in any column. Consistent with existing pattern. | ✓ |
| 4 columns (add overdue) | Follow ROADMAP literal — separate overdue column. Clients see overdue tasks grouped together. | |

**User's choice:** 3 columns + overdue flag
**Notes:** Matches established Phase 2 pattern. Overdue is visual, not a column.

---

## Active Project Logic

| Option | Description | Selected |
|--------|-------------|----------|
| Single active project | Each client has at most one active project. Query `WHERE status = 'active'`. Simple, unambiguous. | ✓ |
| Most recent project | Show the most recent project by created_at or month/year. Handles multiple active projects case. | |

**User's choice:** Single active project
**Notes:** Query is straightforward. No complex determination logic needed.

---

## View Toggle

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs at top | Match admin task view toggle — inline toggle buttons (Kanban \| Calendar \| Timeline). Consistent with existing pattern. | ✓ |
| Sidebar navigation | Separate pages with sidebar links to each view. More navigation surface. | |

**User's choice:** Tabs at top
**Notes:** Consistent with admin pattern from Phase 2. Default view is Kanban.

---

## Task Detail Display

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Use shadcn Dialog component (already used in admin for task creation). Consistent pattern, overlays content. | ✓ |
| Drawer/slide-over | Slide-in panel from the right. More screen space for content, but new pattern to implement. | |

**User's choice:** Modal dialog
**Notes:** Reuse existing shadcn Dialog pattern. Shows: caption + CopyButton, design file + DesignFileDownloader, posting date, status + StatusDot.

---

## Calendar Default

| Option | Description | Selected |
|--------|-------------|----------|
| Month default + week toggle | Default to month, toggle to week. Works well for content planning where tasks have single posting dates. | ✓ |
| Week default + month toggle | Default to week view, toggle to month. Better for dense calendar view with more detail per day. | |

**User's choice:** Month default + week toggle
**Notes:** Month view matches project monthly cycle. Tasks plotted by posting_date.

---

## Timeline Design

| Option | Description | Selected |
|--------|-------------|----------|
| Month swimlanes + task bars | Each month is a horizontal swimlane. Tasks appear as horizontal bars positioned by posting_date. Simple, matches content monthly cycle. | ✓ |
| Gantt-style with date ranges | Act like a Gantt chart with task bars spanning due_date to deadline. More complex, but shows duration. | |

**User's choice:** Month swimlanes + task bars
**Notes:** Horizontal bars by posting_date within month swimlanes. Fixed month labels on left, horizontal scroll for content.

---

## Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state message | Show friendly message: "No active project yet. Contact your account manager to get started." | ✓ |
| Show project history | Display a list of completed/archived projects with dates, allowing browsing. More navigation. | |

**User's choice:** Empty state message
**Notes:** No project history for MVP. Simple friendly message.

---

## the agent's Discretion

- Exact Calendar component implementation (library vs custom)
- Exact Timeline component visual styling (bar height, colors, spacing)
- Modal width and layout details
- Month/week toggle button placement and styling
- Task card hover/interaction states
- Mobile responsive behavior for Calendar and Timeline views

---

## Deferred Ideas

None — discussion stayed within phase scope. No new capabilities suggested.