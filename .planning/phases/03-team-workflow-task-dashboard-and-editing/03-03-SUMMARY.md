---
phase: 03-team-workflow-task-dashboard-and-editing
plan: "03"
subsystem: team
tags: [team-workflow, notifications, rls, confirmation-dialog]
dependencies:
  requires: ["03-02"]
  provides: ["03-04", "03-05"]
tech-stack:
  added: []
  patterns:
    - "Dedicated notify action separate from generic status updates"
    - "RLS policy for team member notification inserts"
    - "Confirmation dialog for destructive/completed actions"
key-files:
  created:
    - supabase/migrations/006_team_notification_insert_policy.sql
  modified:
    - app/team/tasks/actions.ts
    - app/team/tasks/[taskId]/task-detail-form.tsx
decisions:
  - id: D-07
    description: New RLS policy `team_insert_notifications` allows team members to INSERT notifications where `team_member_id IS NULL` (admin notifications)
    rationale: Enables team members to notify admins without widening broader notification access
  - id: D-08
    description: Confirmation dialog prevents accidental Notify Assigner execution
    rationale: Makes the notification deliberate and auditable per plan requirements
metrics:
  duration: 12min
  tasks: 2
  files: 3
---

# Phase 03 Plan 03: Notify Assigner Workflow Summary

**One-liner:** Added explicit Notify Assigner workflow with RLS-backed notification inserts and confirmation dialog.

## What Was Built

### 1. RLS Policy for Team Notification Inserts (`006_team_notification_insert_policy.sql`)
- Created `team_insert_notifications` policy on `public.notifications`
- Allows team_member role users to INSERT rows where `team_member_id IS NULL`
- Enables team members to create admin-facing notifications while restricting access to other notification rows

### 2. Notify Assigner Server Action (`app/team/tasks/actions.ts`)
- Added `notifyAssignerAction(taskId)` function implementing D-05 and D-06
- Verifies the caller owns the assigned task (reuses existing `getOwnedTask`)
- Fetches team member name and task title for message construction
- Inserts notification with exact format: `"[Member name] marked [task title] as done."`
- Updates task status to `'done'` in the same flow
- Revalidates all affected paths: `/team`, `/team/tasks/[taskId]`, `/admin`, `/admin/notifications`, and admin layout

### 3. Confirmed Notify Assigner UI (`app/team/tasks/[taskId]/task-detail-form.tsx`)
- Added separate "Notify Assigner" section with button
- Implemented confirmation dialog using shadcn Dialog primitives
- Dialog clearly states both outcomes: notification creation and status change to done
- Button triggers dedicated notify action (not generic status save)
- Updates local status state and shows feedback on success
- Keeps generic status edits available without forcing notification

## Key Implementation Details

- **Separate from status changes:** The notify action is deliberately separate from generic status updates, per D-05
- **Message format compliance:** Exact format `[Member name] marked [task title] as done.` per NOTIF-02
- **RLS-scoped:** Team members can only insert notifications with `team_member_id: null` (admin notifications)
- **Confirmation required:** Dialog must be explicitly confirmed before mutation executes per D-08

## Requirements Covered

- TEAM-06: Notify Assigner creates admin notification and marks task done
- NOTIF-01: Notification row created when team member clicks Notify Assigner
- NOTIF-02: Message format compliance

## Deviations from Plan

None - plan executed exactly as written.

## Commits

- `8f6cd1c`: feat(03-03): add team notification INSERT policy and notify assigner action
- `d66c7e4`: feat(03-03): add confirmed Notify Assigner UI to team task page

## Verification

- ESLint passes on all modified files
- Build completes successfully
- All acceptance criteria verified via grep patterns
