---
phase: 02-admin-core-client-project-and-task-management
plan: "05"
subsystem: ui
tags: [nextjs, supabase, server-actions, date-fns, admin-dashboard, notifications]
requires:
  - phase: 01-foundation-database-auth-and-security
    provides: Supabase SSR auth, admin route protection, base design tokens
  - phase: 02-admin-core-client-project-and-task-management
    provides: client and project CRUD routes feeding dashboard metrics
provides:
  - Admin dashboard with four live metric cards from parallel Supabase count queries
  - Recent notifications list on the dashboard with click-to-mark-read behavior
  - Full admin notifications page with mark-one and mark-all read actions
affects: [phase-03-team-workflow, notifications, admin-ui]
tech-stack:
  added: []
  patterns: [RSC dashboard reads with Promise.all, auth-checked server actions with revalidatePath]
key-files:
  created: [app/admin/notifications/page.tsx]
  modified: [app/admin/page.tsx, app/admin/notifications/actions.ts]
key-decisions:
  - "Kept the dashboard as a Server Component and ran the four metric counts in one Promise.all batch."
  - "Shared notification mutations in a dedicated 'use server' file so both dashboard and full notifications page reuse the same revalidation flow."
patterns-established:
  - "Admin notification interactions use server actions that revalidate both /admin and /admin/notifications."
  - "Dashboard summary cards use simple border-only panels to stay within the black-and-white brand rules."
requirements-completed: [ADMIN-05, UI-06]
duration: 1 min
completed: 2026-04-04
---

# Phase 2 Plan 05: Admin dashboard with metrics, overdue detection, and notifications list Summary

**Admin dashboard metrics and notification management with shared Supabase server actions and overdue task detection.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-04T12:22:00+06:30
- **Completed:** 2026-04-04T05:53:07Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced the admin dashboard placeholder with four live metric cards for active projects, tasks in progress, overdue tasks, and tasks completed this month.
- Added a recent notifications panel on the dashboard with click-to-mark-read behavior and a link to the full notifications screen.
- Built `/admin/notifications` with full notification history plus mark-one and mark-all read actions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace admin dashboard placeholder with metric cards** - `898f2fd` (feat)
2. **Task 2: Create notifications list page and mark-as-read action** - `479b1e5` (feat)

**Plan metadata:** Pending

## Files Created/Modified
- `app/admin/page.tsx` - Dashboard metrics and recent notifications UI using parallel count queries.
- `app/admin/notifications/page.tsx` - Full notifications list page with mark-all and mark-read forms.
- `app/admin/notifications/actions.ts` - Shared server actions for marking notifications read and revalidating admin routes.

## Decisions Made
- Kept dashboard reads in the server component so counts and recent notifications render without extra client JavaScript.
- Reused one notification action module for both admin surfaces to keep revalidation behavior consistent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added authentication checks inside notification server actions**
- **Found during:** Task 1 (dashboard notification actions)
- **Issue:** Server Actions are callable via POST, so notification mutations needed explicit auth checks instead of relying only on page-level guards.
- **Fix:** Added a shared `requireAdmin()` helper that calls `supabase.auth.getUser()` and redirects unauthenticated requests to `/login` before mutating notifications.
- **Files modified:** `app/admin/notifications/actions.ts`
- **Verification:** `npm run build`
- **Committed in:** `898f2fd`

**2. [Rule 3 - Blocking] Introduced the notification read action during dashboard work so the dashboard forms had a valid mutation target**
- **Found during:** Task 1 (dashboard notification list)
- **Issue:** The plan split the dashboard UI and notification actions across separate tasks, but the dashboard's read-on-click forms required the action file to exist immediately.
- **Fix:** Created `app/admin/notifications/actions.ts` in Task 1 with the read action, then expanded it in Task 2 with the mark-all action.
- **Files modified:** `app/admin/notifications/actions.ts`, `app/admin/page.tsx`
- **Verification:** `npm run build`
- **Committed in:** `898f2fd`, `479b1e5`

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both changes were required to keep the dashboard functional and secure without expanding scope.

## Issues Encountered
- `npm run build` surfaced pre-existing Next.js warnings about Turbopack root inference and deprecated `middleware.ts`; both were logged to `deferred-items.md` as out-of-scope follow-up work.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Admin dashboard and notifications surfaces are ready for later unread badge integration in Phase 3.
- Phase 2 can continue with remaining admin features without revisiting dashboard query structure.

## Self-Check
PASSED

---
*Phase: 02-admin-core-client-project-and-task-management*
*Completed: 2026-04-04*
