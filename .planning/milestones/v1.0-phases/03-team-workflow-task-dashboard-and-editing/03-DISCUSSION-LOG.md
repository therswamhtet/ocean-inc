# Phase 3: Team Workflow — Task Dashboard and Editing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 03-team-workflow-task-dashboard-and-editing
**Areas discussed:** Login routing, Team task detail layout, Notify Assigner approach, Notification realtime behavior

---

## Login routing

| Option | Description | Selected |
|--------|-------------|----------|
| Role-based redirect in page + action | Check user.app_metadata.role in app/page.tsx and app/login/actions.ts — redirect team_member to /team, admin to /admin | ✓ |
| Middleware-based routing | Centralize routing in middleware after session refresh | |
| Bounce from admin layout | Redirect to /admin always, then bounce team_member to /team (causes page flash) | |

**User's choice:** Role-based redirect in page + action (Recommended)
**Notes:** Simple, two files to change. No middleware coupling.

---

## Team task detail layout

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated team task page | New page at app/team/tasks/[taskId]/page.tsx. Read-only as labeled text, editable as form inputs. Reuses CopyButton, DesignFileUploader/Downloader, StatusDot | ✓ |
| Shared component with read-only mode | Extract shared TaskDetailView with editable flag. More code reuse, harder maintenance | |
| Disabled admin form | Reuse admin form with disabled fields. Fastest but confusing admin UI for team | |

**User's choice:** Dedicated team task page (Recommended)

### Field access follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| All three editable + separate Notify button | Caption textarea + file upload + status dropdown all editable. Notify Assigner is separate button | ✓ |
| Caption + file editable, status via Notify only | Status change exclusively through Notify Assigner flow | |
| Status change auto-triggers Notify | Notification auto-creates when status changes to done | |

**User's choice:** All three editable + separate Notify button (Recommended)
**Notes:** Caption, design file, and status all independently editable. Notify Assigner is a separate explicit action.

---

## Notify Assigner approach

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit button + confirm | Button on task detail that creates notification + marks task done. Confirmation dialog before executing. Message: "[Name] marked [task title] as done." | ✓ |
| Notify without status change | Creates notification only, does not change status | |
| Auto on status→done | Notification auto-creates whenever status changes to done | |

**User's choice:** Explicit button + confirm (Recommended)

### Notification INSERT follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| Add RLS policy for team notification insert | New RLS policy allowing INSERT where team_member_id IS NULL (admin notifications) | ✓ |
| Service role bypass in action | Server action uses service role key for notification INSERT only | |
| Database function (SECURITY DEFINER) | RPC function that inserts notification, encapsulates bypass | |

**User's choice:** Add RLS policy for team notification insert (Recommended)
**Notes:** New migration adds `team_insert_notifications` policy. Keeps everything RLS-enforced.

---

## Notification realtime behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Page navigation refresh | Badge and list update on page navigation via Next.js revalidatePath. No new dependencies | ✓ |
| Supabase Realtime subscription | Subscribe to notifications table changes. Live badge updates. Needs Realtime enabled | |
| Polling interval | Poll notification count every 30-60 seconds | |

**User's choice:** Page navigation refresh (Recommended)
**Notes:** Simple, no new dependencies, works with existing revalidation pattern. Realtime deferred to future enhancement.

---

## Agent's Discretion

- Team sidebar styling (width, icon choices, active state)
- Dashboard card layout (follow admin pattern)
- Task list table columns and sorting for team view
- Confirmation dialog implementation
- Error handling patterns for caption save and file upload
- Team layout structure details

## Deferred Ideas

- Supabase Realtime for live notification updates — future enhancement
- Team member comments on tasks — v2 (CONV-03)
- Task reassignment — v2 (TEAMMGT-02)
