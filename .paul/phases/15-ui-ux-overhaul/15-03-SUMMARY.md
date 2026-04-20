# Plan 15-03 Summary

**Phase:** 15 — UI/UX Overhaul & Simplification
**Plan:** 15-03 — Streamline Project Navigation
**Date:** 2026-04-20

## What was done

- Created `/admin/projects` page — flat list of all projects across all clients with client color dots, status indicators, and direct links to project task boards
- Added "Projects" nav item to admin sidebar (between Dashboard and Tasks) with Briefcase icon
- Enhanced admin dashboard with "Active Projects" section showing up to 6 project cards linking directly to project task views
- Cleaned up Quick Task Dialog — removed team member fetch, TeamMember type, assignedTo field from schema, assignee dropdown UI, and assignedToValue state
- Cleaned up project task page query — removed `task_assignments(team_members(name, username))` from Supabase select
- Removed `assigned_to_name`/`assigned_to_username` from normalizedTasks mapping in project page

## Files created
- app/admin/projects/page.tsx — new Projects page

## Files modified
- app/admin/sidebar.tsx — added Projects nav item with Briefcase icon
- app/admin/page.tsx — added Active Projects section with quick-access cards, added ProjectForDashboard type and helpers
- components/admin/quick-task-dialog.tsx — removed TeamMember type, team member fetch, assignedTo field from schema, assignee dropdown UI, assignedToValue state
- app/admin/clients/[clientId]/projects/[projectId]/page.tsx — removed task_assignments from TaskRecord type and query, removed assigned_to mapping from normalizedTasks

## Navigation improvement

Before: Dashboard → Clients → Client Detail → Project Detail → Task Edit (5 layers)
After:  Dashboard → Projects → Project Tasks → Task Edit (3 layers)
Or:    Dashboard → Active Project Card → Project Tasks (2 layers — shortest path)

## Build verification
- `npm run build` passes cleanly
- New /admin/projects route appears in route tree

## Acceptance criteria
- [x] AC-1: /admin/projects shows all projects in flat list with client info and direct links
- [x] AC-2: Sidebar includes Projects nav item between Dashboard and Tasks
- [x] AC-3: Dashboard shows Active Projects section with cards linking to project task boards
- [x] AC-4: Quick Task Dialog no longer fetches team members or shows assignment dropdown
- [x] AC-5: Project task page query no longer joins task_assignments
- [x] AC-6: Build passes cleanly