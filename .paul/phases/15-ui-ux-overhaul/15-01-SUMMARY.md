# Plan 15-01 Summary

**Phase:** 15 — UI/UX Overhaul & Simplification
**Plan:** 15-01 — Remove notifications + comments
**Date:** 2026-04-20

## What was done

- Deleted notification bell components (admin + team)
- Deleted notifications page and actions (admin + team)
- Removed notification bell and data fetch from admin and team layouts
- Removed notification section from admin dashboard (DashboardNotifications component removed from dashboard-inner.tsx)
- Removed comment sections from team task detail form, portal task detail dialog, and admin task detail dialog
- Deleted comment API route (/api/portal/comment)
- Cleaned up notification revalidation path reference in team/tasks/actions.ts

## Files deleted
- components/admin/notification-bell.tsx
- components/team/notification-bell.tsx
- app/admin/notifications/page.tsx
- app/admin/notifications/actions.ts
- app/team/notifications/actions.ts
- app/api/portal/comment/route.ts

## Files modified
- app/admin/layout.tsx — removed NotificationBell import, component, and notification data fetch
- app/team/layout.tsx — removed TeamNotificationBell import, component, and notification data fetch
- components/admin/dashboard-inner.tsx — removed NotificationsSection, DashboardNotifications, and related imports
- app/team/tasks/[taskId]/task-detail-form.tsx — removed comment state, handlers, and entire comment section
- components/portal/task-detail-dialog.tsx — removed all comment state, handlers, API calls, and comment section
- components/admin/task-detail-dialog.tsx — removed comment state, handlers, actions imports, and comment section
- app/team/tasks/actions.ts — removed /admin/notifications revalidation path

## Build verification
- `npm run build` passes cleanly (TypeScript + compilation)
- All routes still functional (no broken imports)

## Database
- Tables untouched (notifications, comments) — UI-only removal as planned

## Acceptance criteria
- [x] AC-1: No notification UI remains
- [x] AC-2: No comment UI remains
- [x] AC-3: Comment API route removed
- [x] AC-4: Dashboard renders without notification sections
- [x] AC-5: Navigation is clean
