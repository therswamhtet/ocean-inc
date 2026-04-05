---
phase: 02-admin-core-client-project-and-task-management
plan: 03
subsystem: ui
tags: [nextjs, supabase, dnd-kit, react-hook-form, zod, storage]
requires:
  - phase: 01-foundation-database-auth-and-security
    provides: Supabase auth clients, storage bucket, task schema, status-dot component
  - phase: 02-admin-core-client-project-and-task-management
    provides: client and project routes that task management extends
provides:
  - Project task page with list and kanban views
  - Immediate design file uploads with temp-path storage workflow
  - Task server actions for create, update, delete, and status changes
affects: [02-04, admin-tasks, task-detail, team-assignment]
tech-stack:
  added: [@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @radix-ui/react-dropdown-menu, @radix-ui/react-popover, @radix-ui/react-select]
  patterns:
    - Server-rendered project page delegates interactive task controls to a dedicated client entry file
    - Task uploads land in temp storage first, then server actions copy/remove into final task paths
    - Task mutations resolve literal revalidatePath targets from related project/task records for Next.js 16 compatibility
key-files:
  created:
    - app/admin/clients/[clientId]/projects/[projectId]/actions.ts
    - app/admin/clients/[clientId]/projects/[projectId]/page.tsx
    - app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx
    - components/admin/design-file-uploader.tsx
    - components/admin/kanban-board.tsx
    - components/admin/kanban-card.tsx
    - components/admin/task-create-form.tsx
    - components/admin/task-list.tsx
  modified:
    - package.json
    - package-lock.json
    - components/ui/dropdown-menu.tsx
    - components/ui/field.tsx
    - components/ui/popover.tsx
    - components/ui/select.tsx
    - components/ui/table.tsx
    - components/ui/textarea.tsx
key-decisions:
  - "Split TaskViewToggle into its own client entry file because the project page stays server-rendered under Next.js 16 server/client boundaries."
  - "Resolved concrete project and task paths before calling revalidatePath instead of using wildcard routes, matching the current Next.js docs."
  - "Recreated the needed shadcn-style primitives manually after the CLI failed with an Invalid Version error in this repo."
patterns-established:
  - "Project task pages: fetch in RSC, normalize Supabase joins, then hand interactive state to a colocated client toggle component."
  - "Task storage pattern: upload immediately to {projectId}/temp/{uuid}/{filename}, then finalize to {projectId}/{taskId}/{filename} inside server actions."
requirements-completed: [ADMIN-06, ADMIN-07]
duration: 13 min
completed: 2026-04-04
---

# Phase 02 Plan 03: Task creation form with file upload, list view, and kanban view Summary

**Project task management now ships with immediate image uploads, a validated creation form, compact list rows, and an optimistic three-column kanban board.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-04T05:49:00Z
- **Completed:** 2026-04-04T06:02:20Z
- **Tasks:** 7
- **Files modified:** 16

## Accomplishments
- Added a new `/admin/clients/[clientId]/projects/[projectId]` project task page with breadcrumb context and a default list/kanban toggle.
- Built reusable task UI pieces: validated task form, immediate design uploader, sortable kanban cards, and table-based task list rows.
- Implemented reusable task server actions including temp-to-final storage moves and status persistence for drag-and-drop.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install task view dependencies and UI primitives** - `52227ae` (chore)
2. **Task 2: Create project task page with list/kanban toggle** - `0705d75` (feat)
3. **Task 3: Create task list view component** - `9c84fe3` (feat)
4. **Task 4: Create kanban board with @dnd-kit** - `a54ccb7` (feat)
5. **Task 5: Create design file uploader component** - `15f7a46` (feat)
6. **Task 6: Create task create form with react-hook-form + zod** - `cc4d229` (feat)
7. **Task 7: Create task server actions (create, update, delete)** - `86833cb` (feat)

**Follow-up fix:** `e1790fd` wired the task list delete menu to the new server action after final integration verification.

## Files Created/Modified
- `app/admin/clients/[clientId]/projects/[projectId]/page.tsx` - Server-rendered project task page and Supabase task query.
- `app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx` - Client-side task view toggle and create-task dialog shell.
- `app/admin/clients/[clientId]/projects/[projectId]/actions.ts` - Task mutation actions with validation, storage finalization, and revalidation.
- `components/admin/task-list.tsx` - Compact task table with overdue dots, edit links, and delete actions.
- `components/admin/kanban-board.tsx` - Optimistic drag-and-drop kanban board with three columns.
- `components/admin/kanban-card.tsx` - Sortable task cards with overdue-aware status dots.
- `components/admin/design-file-uploader.tsx` - Immediate XHR-based upload flow with progress feedback.
- `components/admin/task-create-form.tsx` - React Hook Form + Zod task creation UI.

## Decisions Made
- Used a separate `task-view-toggle.tsx` client entry instead of forcing the page itself to become a client component.
- Used literal `revalidatePath` targets resolved from related records because the current Next.js docs require route-pattern + type or literal paths, not wildcard strings.
- Kept the task actions file focused on reusable task/storage helpers so plan 02-04 can extend it cleanly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced failed shadcn CLI generation with manual UI primitives**
- **Found during:** Task 1 (Install @dnd-kit packages and shadcn components for task views)
- **Issue:** `npx shadcn@latest add ...` failed in this repo with `Invalid Version:` and could not generate the required primitives.
- **Fix:** Installed the missing Radix packages directly and added compatible `dropdown-menu`, `field`, `popover`, `select`, `table`, and `textarea` components manually.
- **Files modified:** `package.json`, `package-lock.json`, `components/ui/dropdown-menu.tsx`, `components/ui/field.tsx`, `components/ui/popover.tsx`, `components/ui/select.tsx`, `components/ui/table.tsx`, `components/ui/textarea.tsx`
- **Verification:** Dependency checks passed and `npm run build` succeeded.
- **Committed in:** `52227ae`

**2. [Rule 3 - Blocking] Added a dedicated client toggle file for the task page**
- **Found during:** Task 2 (Create project task page with list/kanban toggle)
- **Issue:** The plan described an RSC page plus a client `TaskViewToggle`, which cannot coexist in one Next.js App Router file.
- **Fix:** Added `task-view-toggle.tsx` as the client entry and kept the route page server-rendered.
- **Files modified:** `app/admin/clients/[clientId]/projects/[projectId]/page.tsx`, `app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx`
- **Verification:** The route built successfully and the page still stayed server-rendered.
- **Committed in:** `0705d75`

**3. [Rule 2 - Missing Critical] Wired task deletion after final integration**
- **Found during:** Final verification
- **Issue:** The list row action menu exposed Delete but the menu item was still disabled after the server action work landed.
- **Fix:** Connected the dropdown action to `deleteTaskAction` and refreshed the page after successful deletion.
- **Files modified:** `components/admin/task-list.tsx`
- **Verification:** `npm run build` succeeded after wiring the action.
- **Committed in:** `e1790fd`

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** All deviations were needed to keep the plan shippable under the repo’s current toolchain and Next.js constraints. No unrelated scope was added.

## Issues Encountered
- The shadcn CLI failed with an `Invalid Version:` error in this repository, so the required primitives were authored manually.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02-04 can extend the new task actions file for task detail editing and assignment flows.
- The project task route, uploader temp-path workflow, and status update action are in place for downstream task detail work.

## Self-Check: PASSED
