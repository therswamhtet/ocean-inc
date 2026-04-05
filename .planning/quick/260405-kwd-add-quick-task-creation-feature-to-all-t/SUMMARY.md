---
phase: quick-task-creation
plan: "01"
subsystem: admin
tags:
  - quick-task
  - all-tasks
  - task-creation
dependency_graph:
  requires: []
  provides:
    - quick-task-dialog
  affects:
    - app/admin/tasks/all-tasks.tsx
    - components/admin/quick-task-dialog.tsx
tech_stack:
  added:
    - QuickTaskDialog component
  patterns:
    - Client-side data fetching with Supabase browser client
    - Server action for task creation
    - Dialog-trigger pattern for quick actions
key_files:
  created:
    - components/admin/quick-task-dialog.tsx
  modified:
    - app/admin/tasks/all-tasks.tsx
decisions:
  - |
    Used Supabase browser client (createClient from @/lib/supabase/client) for 
    client-side fetching of clients and projects, matching existing patterns.
  - |
    Used existing createTaskAction server action for task creation, maintaining
    consistency with task-create-form.tsx approach.
metrics:
  duration: 3 min
  completed: "2026-04-05T08:35:00.000Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Quick Task 260405-kwd: Add Quick Task Creation Feature to All Tasks

## One-liner

Quick task creation dialog with client/project selection added to All Tasks view.

## Summary

Implemented a QuickTaskDialog component that allows users to quickly create tasks from the All Tasks view without navigating to a specific project page. The dialog provides client and project selection dropdowns followed by a task title input.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create QuickTaskDialog component | 49f9ead | components/admin/quick-task-dialog.tsx |
| 2 | Add QuickTaskDialog to AllTasks header | 49f9ead | app/admin/tasks/all-tasks.tsx |

## What Was Built

**QuickTaskDialog Component:**
- Client-side fetching of clients using Supabase browser client
- Project dropdown populated when client is selected (filtered by client_id, only active projects)
- Title input field for task name
- Calls `createTaskAction(projectId, { title, status: 'todo' })` on submit
- Success feedback with auto-close after 1 second
- Error handling with inline error messages
- router.refresh() called on success to refresh the task list

**AllTasks Integration:**
- QuickTaskDialog added to the header section after the description
- Uses default Next.js button styling from shadcn/ui

## Verification

- QuickTaskDialog component compiles without errors
- AllTasks imports and renders QuickTaskDialog (2 occurrences in file)
- Dialog opens when "Quick Add Task" button is clicked
- Client dropdown populates with clients from database
- Project dropdown populates when client is selected
- Task creates successfully with valid client/project/title selection

## Success Criteria

- [x] User can open quick add dialog from All Tasks view
- [x] User can select a client and project
- [x] User can enter a task title and create it
- [x] After creation, the new task appears in the list (via router.refresh)

## Deviations from Plan

None - plan executed exactly as written.

## Commit

- **49f9ead**: feat(quick-task-creation): add QuickTaskDialog to All Tasks view

---

**Plan:** 260405-kwd  
**Completed:** 2026-04-05  
**Duration:** 3 min
