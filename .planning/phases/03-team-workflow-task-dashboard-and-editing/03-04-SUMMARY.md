---
phase: 03-team-workflow-task-dashboard-and-editing
plan: "04"
subsystem: admin-notifications
tags: [notifications, badge, layout, revalidation]
requires: []
provides:
  - NOTIF-03
  - NOTIF-04
  - NOTIF-05
  - D-09
affects:
  - app/admin/layout.tsx
  - app/admin/notifications/actions.ts
tech-stack:
  added: []
  patterns:
    - "Server-side notification count query in layout"
    - "Layout revalidation for shared badge updates"
    - "Navigation-time refresh (no realtime)"
key-files:
  created: []
  modified:
    - app/admin/layout.tsx
    - app/admin/notifications/actions.ts
decisions:
  - "Added 'layout' revalidation option to markNotificationAsRead and markAllNotificationsAsRead for badge sync"
  - "Bell icon positioned in sidebar header (desktop) and mobile header for consistent visibility"
  - "Badge uses destructive variant for high visibility of unread count"
metrics:
  duration: "8 minutes"
  completed_at: "2026-04-04T08:23:00Z"
  tasks: 2
  files: 2
---

# Phase 03 Plan 04: Admin Unread Notification Badge — Summary

## What Was Built

A shared notification bell icon with unread-count badge integrated into the admin layout chrome. The badge appears in both desktop (sidebar header) and mobile (header bar) views, linking to the existing `/admin/notifications` page. Notification read-state changes now trigger layout revalidation to keep the badge synchronized.

**One-liner:** Bell icon with unread badge in admin chrome, synchronized via navigation-time revalidation (no realtime).

## Implementation Details

### Task 1: Admin Layout Bell Badge

Updated `app/admin/layout.tsx` to:
- Import `Bell` icon from lucide-react and `Badge` component
- Query unread notification count server-side using Supabase `.eq('read', false)`
- Render bell icon link in desktop sidebar header with relative positioning for badge overlay
- Render bell icon link in mobile header alongside hamburger menu
- Use destructive badge variant when unread count > 0
- Follow existing border-only styling (no shadows, minimal radius)

### Task 2: Notification Actions Revalidation

Updated `app/admin/notifications/actions.ts` to:
- Add `revalidatePath('/admin', 'layout')` to both `markNotificationAsRead` and `markAllNotificationsAsRead`
- Maintain existing auth guard via `requireAdmin()`
- Keep existing revalidation for `/admin` (dashboard) and `/admin/notifications` (full list)
- Document revalidation targets in code comments

## Requirements Covered

| Requirement | Description | Status |
|-------------|-------------|--------|
| NOTIF-03 | Admin notification list with read/unread | ✅ Existing, badge adds visibility |
| NOTIF-04 | Unread badge on bell icon | ✅ Implemented in layout |
| NOTIF-05 | Dashboard notification list | ✅ Existing, refreshed via revalidation |
| D-09 | Navigation-time revalidation only, no realtime | ✅ Honored — no Supabase Realtime |

## Files Changed

```
app/admin/layout.tsx                      | 50 +++++++++++++--
app/admin/notifications/actions.ts        | 10 +++-
```

## Commits

| Commit | Description |
|--------|-------------|
| `e87fe2a` | feat(03-04): add unread bell badge to admin layout |
| `d4553ba` | feat(03-04): extend notification actions to refresh layout surfaces |

## Deviations from Plan

None — plan executed exactly as written.

## Design Compliance

- ✅ Black/white only (no colors beyond destructive badge for urgent state)
- ✅ Poppins font (inherited from layout)
- ✅ No shadows, no gradients
- ✅ Border-only styling on bell button
- ✅ Max 8px radius on bell button
- ✅ Mobile-responsive (visible at 375px width)

## Verification

- ✅ ESLint passes on both modified files
- ✅ `npm run build` succeeds
- ✅ Bell icon linked to `/admin/notifications` in both desktop and mobile
- ✅ Unread count rendered with Badge component when > 0
- ✅ No realtime subscription or polling logic present
- ✅ Auth guard maintained in notification actions
- ✅ Layout revalidation added to both read actions

## Self-Check: PASSED

- [x] All created/modified files exist and are committed
- [x] All commits are present in git history
- [x] Build passes without errors
- [x] Requirements NOTIF-03, NOTIF-04, NOTIF-05 covered
- [x] Decision D-09 (no realtime) honored
