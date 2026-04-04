---
phase: 03-team-workflow-task-dashboard-and-editing
plan: "01"
subsystem: ui
tags: [nextjs, supabase, app-router, team-dashboard, rls]
requires:
  - phase: 02-admin-core-client-project-and-task-management
    provides: admin shell patterns, dashboard card styling, task/project relational queries
provides:
  - Dedicated /team workspace shell for team members
  - Role-aware root and login redirects for admin vs team_member users
  - Server-rendered team dashboard with workload metrics and assigned task list
affects: [phase-03-task-detail, team-navigation, role-based-routing]
tech-stack:
  added: []
  patterns: [dedicated team layout, server-rendered RLS-scoped dashboard queries]
key-files:
  created: [app/team/layout.tsx, app/team/sidebar.tsx, app/team/page.tsx]
  modified: [app/page.tsx, app/login/actions.ts]
key-decisions:
  - "Kept the team workspace separate from admin files by creating a dedicated /team layout and sidebar."
  - "Sorted assigned tasks in the server component after the Supabase query so due_date stays primary with null dates last and created_at as fallback."
patterns-established:
  - "Role redirects should branch on user.app_metadata.role in both root entry and post-login server action flows."
  - "Team dashboard reads go through task_assignments and rely on RLS to scope visible tasks to auth.uid()."
requirements-completed: [TEAM-01, TEAM-02]
duration: 18min
completed: 2026-04-04
---

# Phase 03 Plan 01: Team route shell, role-aware redirects, and dashboard with summary cards/sorted task list Summary

**Dedicated /team routing with a protected team shell, role-aware redirects, and an RLS-scoped assigned-task dashboard.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-04T07:47:26Z
- **Completed:** 2026-04-04T08:05:25Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Sent team members to `/team` from both the site root and login server action while keeping admins on `/admin`.
- Added a dedicated team layout and sidebar instead of reusing the admin shell.
- Built a server-rendered dashboard with the four required workload cards and a due-date-sorted assigned task list.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the dedicated team shell and role-aware entry redirects** - `62be407` (feat)
2. **Task 2: Build the team dashboard cards and assigned-task list** - `5bf70a6` (feat)

**Plan metadata:** Pending

## Files Created/Modified
- `app/page.tsx` - Root route now redirects team members to `/team` and admins to `/admin`.
- `app/login/actions.ts` - Login action now redirects by `user.app_metadata.role`.
- `app/team/layout.tsx` - Protected team workspace shell with desktop sidebar and mobile sheet navigation.
- `app/team/sidebar.tsx` - Team-only nav with `Dashboard` and `Tasks` entries.
- `app/team/page.tsx` - Async server dashboard showing metrics and assigned tasks with `StatusDot`.

## Decisions Made
- Used a dedicated `/team` shell rather than conditional admin layout reuse to preserve the boundary required by D-02.
- Computed task ordering in the server component so `due_date` stays primary, null due dates fall last, and `created_at` remains a stable fallback.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `/team` now exists as the protected entry point for upcoming task detail work.
- Role-aware redirects are in place, so Phase 03 task-detail and notification flows can assume team members land inside the correct workspace.

## Self-Check: PASSED

---
*Phase: 03-team-workflow-task-dashboard-and-editing*
*Completed: 2026-04-04*
