---
phase: 08-infrastructure-database-migrations
plan: "05"
wave: 5
completed: 2026-04-05T15:18:00Z
status: complete
---

# Plan 08-05: Switch task assignment displays to @username

## Objective
Switch all task assignment displays from `team_members.name` to `team_members.username` so task assignments show clean @username identifiers (D-13, social-media style).

## Tasks Completed

### Task 1: Update all assignment queries to select username from team_members
- **app/admin/page.tsx**: Updated query to select `team_members(name, username)`, normalized to `assignee_username` with fallback to `name`
- **app/admin/tasks/page.tsx**: Updated to extract `team_members?.username` with name fallback
- **app/admin/clients/[clientId]/projects/[projectId]/page.tsx**: Updated query and normalization to use username first
- **app/admin/clients/[clientId]/projects/[projectId]/tasks/[taskId]/page.tsx**: Added `username` to team_members select

### Task 2: Update task create and edit forms to use username in assignment dropdowns
- **task-edit-form.tsx**: Already shows `@${member.username}` for each team member (verified)
- **quick-task-dialog.tsx**: Already shows `@${member.username}` for each team member (verified)
- **task-create-form.tsx**: Added team member dropdown with `@${member.username}` display

### Task 3: Update all UI surfaces displaying assignee names
- **task-list.tsx**: Already shows `@${task.assigned_to_username}` (verified)
- **all-tasks.tsx**: Already shows `@${task.assigned_to_username}` (verified)
- **task-view-toggle.tsx**: TaskRow type already includes `assigned_to_username` (verified)
- **dashboard-inner.tsx**: Already shows `@${task.assignee_username}` (verified)
- **kanban-card.tsx**: Added `@ ${task.assigned_to_username}` display (lines 54-58)

## Key Changes

### components/admin/task-create-form.tsx
- Added `useEffect` import
- Added `createClient as createSupabaseClient` import
- Added `TeamMember` type with `id, name, email, username`
- Added `teamMembers` state
- Added `useEffect` to fetch team members on mount
- Updated assignment dropdown to show `@${member.username}` with name fallback

### components/admin/kanban-card.tsx
- Added conditional rendering of assignee username:
  ```tsx
  {task.assigned_to_username && (
    <span className="mb-1 block text-[11px] font-mono text-muted-foreground">
      @ {task.assigned_to_username}
    </span>
  )}
  ```

## Verification

- All task assignment queries include `team_members.username`
- Display code uses `username ?? name` fallback chain
- Assignment dropdowns show @username for members with name fallback
- Kanban cards now display @username for assignees
- All list views and dashboard show @username

## Files Modified

- `components/admin/task-create-form.tsx` (added team member dropdown)
- `components/admin/kanban-card.tsx` (added assignee display)

## Related Decisions

- D-13: Task assignment displays show @username only (not real name)
- D-14: Existing members with NULL username fall back to name display
