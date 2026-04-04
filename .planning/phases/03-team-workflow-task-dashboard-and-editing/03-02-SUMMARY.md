---
phase: 03-team-workflow-task-dashboard-and-editing
plan: "02"
subsystem: ui
tags: [nextjs, react, supabase, server-actions, rls]

requires:
  - phase: 03-01
    provides: Team dashboard with task list
  - phase: 02
    provides: Admin task management patterns, CopyButton, DesignFileUploader, DesignFileDownloader

provides:
  - Team-scoped task detail route at /team/tasks/[taskId]
  - Server actions with team ownership validation (getOwnedTask, updateTeamTaskContentAction, updateTeamTaskFilePathAction)
  - TaskDetailForm client component with read-only context and independent editors
  - Caption editing with CopyButton integration
  - Design file upload/replace with DesignFileDownloader
  - Status selection independent of other fields

affects:
  - Team member workflow
  - Task editing capabilities
  - RLS policy enforcement

tech-stack:
  added: []
  patterns:
    - "Team-only server actions with ownership validation via task_assignments join"
    - "Server Component page with colocated Client Component form"
    - "Independent field editors (caption, status, file) with separate save flows"
    - "RLS-enforced data access with getOwnedTask helper"

key-files:
  created:
    - app/team/tasks/actions.ts
    - app/team/tasks/[taskId]/page.tsx
    - app/team/tasks/[taskId]/task-detail-form.tsx
  modified: []

key-decisions:
  - "Team task detail built as dedicated route, not shared with admin (D-02)"
  - "Read-only fields (title, briefing, dates) displayed as labeled text blocks (D-03)"
  - "Editable fields (caption, status, file) are independent with separate save flows (D-04)"
  - "Ownership validation through task_assignments join query in getOwnedTask helper"
  - "Revalidation includes both /team and /team/tasks/[taskId] paths"

patterns-established:
  - "Team-scoped actions: validate role, verify ownership via assignment join, then mutate"
  - "Client form with independent submit flows per field group"
  - "notFound() for unauthorized access to prevent information leakage"

requirements-completed: [TEAM-03, TEAM-04, TEAM-05, TEAM-08]

duration: 5min
completed: 2026-04-04
---

# Phase 03 Plan 02: Team Task Detail and Editing Summary

**Team task detail page with read-only context display and independently editable caption, design file, and status fields**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-04T08:25:00Z
- **Completed:** 2026-04-04T08:30:00Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- Created team-scoped server actions with ownership validation through task_assignments
- Built dedicated `/team/tasks/[taskId]` route with project and client context
- Implemented TaskDetailForm with read-only fields (title, briefing, posting date, due date, deadline)
- Added editable caption textarea with CopyButton for clipboard access
- Integrated DesignFileUploader and DesignFileDownloader for file management
- Implemented independent status selector (todo/in_progress/done)
- Enforced team-only access with notFound() fallback for unauthorized requests

## Task Commits

Each task was committed atomically:

1. **Task 1 & 2: Team task detail implementation** - `c0ea503` (feat)
   - Created app/team/tasks/actions.ts with team-scoped mutations
   - Created app/team/tasks/[taskId]/page.tsx server page
   - Created app/team/tasks/[taskId]/task-detail-form.tsx client form

## Files Created/Modified

- `app/team/tasks/actions.ts` - Team-scoped server actions with ownership validation
  - `getOwnedTask()`: Validates user is team_member and owns the task via assignment
  - `updateTeamTaskContentAction()`: Updates caption and status with validation
  - `updateTeamTaskFilePathAction()`: Updates design file path after upload
  - `revalidateTeamTaskViews()`: Revalidates /team and /team/tasks/[taskId]

- `app/team/tasks/[taskId]/page.tsx` - Server page for team task detail
  - Validates user is authenticated team_member
  - Fetches task through task_assignments join (RLS-enforced)
  - Returns notFound() for missing or unauthorized tasks
  - Passes normalized task data to TaskDetailForm

- `app/team/tasks/[taskId]/task-detail-form.tsx` - Client form for editing
  - Read-only display: title, briefing (with linkify), posting date, due date, deadline
  - Editable caption textarea with CopyButton
  - Independent status selector with separate save flow
  - Design file section with DesignFileDownloader and DesignFileUploader
  - Loading states for each independent save operation

## Decisions Made

- Followed D-02: Built dedicated team route instead of sharing admin components
- Followed D-03: Read-only fields displayed as labeled text blocks, not form inputs
- Followed D-04: Each editable field (caption, status, file) has independent save flow
- Used existing CopyButton, DesignFileUploader, DesignFileDownloader components from admin
- Applied linkify() to briefing text for clickable URLs
- Maintained black/white design system, mobile-responsive at 375px

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused isReplacingFile variable in task-detail-form.tsx**
- **Found during:** Verification (ESLint)
- **Issue:** `isReplacingFile` from useTransition was assigned but never used
- **Fix:** Added loading state display during file reference save
- **Files modified:** app/team/tasks/[taskId]/task-detail-form.tsx
- **Verification:** ESLint passes, build succeeds
- **Committed in:** c0ea503 (part of main commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor code quality fix. No scope creep.

## Issues Encountered

None - files were already created and functional. Only required minor ESLint fix for unused variable.

## Next Phase Readiness

- Team task detail is complete and functional
- Team members can now review assigned task context and update deliverables
- Ready for Phase 03 Plan 03 (Notify Assigner functionality with TEAM-06, NOTIF-01, NOTIF-02)

## Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| TEAM-03 | Complete | Read-only task context with title, briefing (linkified), posting date, due date |
| TEAM-04 | Complete | Editable caption textarea and design file upload/replace |
| TEAM-05 | Complete | Independent status selector with todo/in_progress/done options |
| TEAM-08 | Complete | CopyButton on caption, DesignFileDownloader for existing files |

## Design Decisions (D-02, D-03, D-04)

All locked decisions from 03-CONTEXT.md are fully implemented:
- **D-02**: Dedicated team task page at `/team/tasks/[taskId]` (not shared with admin)
- **D-03**: Read-only labeled blocks for title, briefing with linkify(), posting date, due date, deadline
- **D-04**: Editable fields (caption with CopyButton, design file with uploader/downloader, status dropdown) with independent save flows

---
*Phase: 03-team-workflow-task-dashboard-and-editing*
*Completed: 2026-04-04*
