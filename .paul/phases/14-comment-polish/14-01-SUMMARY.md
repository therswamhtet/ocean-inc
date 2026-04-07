---
phase: 14-comment-polish
plan: 01
subsystem: ui
tags: comments, avatars, notifications, revision-requests

# Dependency graph
requires:
  - phase: 13-collaboration
    provides: comment table, is_revision column, postCommentAction
provides:
  - Edit/delete comment UI + admin notifications + avatar + label fixes

affects: future comment/comment-related phases

# Tech tracking
tech-stack:
  added:
    - components/ui/avatar.tsx (initials-based colored circles, no migration needed)
  patterns:
    - Comment edit/delete actions require ownership (team_member_id === user.id)
    - Revision comments now create admin notifications with 🔴 emoji + message text
    - Regular comments also create admin notifications with 💬 emoji
    - Avatar uses deterministic color from name.charCodeAt(0)
    - Default toggle is OFF ("Not a revision") on both team + portal surfaces

key-files:
  created:
    - components/ui/avatar.tsx
  modified:
    - app/team/tasks/actions.ts (editCommentAction, deleteCommentAction, notification on post)
    - app/team/tasks/[taskId]/task-detail-form.tsx (edit/delete UI, avatars)
    - components/portal/task-detail-dialog.tsx (avatars, "Team" → "Client", default toggle OFF)
    - components/admin/task-detail-dialog.tsx (avatars in comment display)
    - app/api/portal/comment/route.ts (notification on comment)

key-decisions:
  - "Comments can be edited + deleted — requires ownership verification (team_member_id === user.id)"
  - "Every comment (regular or revision) triggers admin notification"
  - "Revision notification distinct via 🔴 emoji + message content"
  - "Portal comments show "Client" not "Team" — correctly identifies anonymous comment source"

patterns-established:
  - "Comment ownership via team_member_id match with authenticated user"
  - "Avatars are pure initials — no DB column needed, no profile images"

# Metrics
duration: 15min
started: 2026-04-07T10:00:00Z
completed: 2026-04-07T10:15:00Z
---

# Phase 14 Plan 01: Comment Polish

**Comment edit/delete, admin notifications, avatars, "Team" → "Client" label, default toggle OFF**

## Performance

| Metric | Value |
|--------|-------|
| Duration | 15min |
| Started | 2026-04-07T10:00:00Z |
| Completed | 2026-04-07T10:15:00Z |
| Tasks | 5 completed |
| Files modified | 7 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Comment edit/delete works for own comments | Pass | auth → ownership check → DB update/delete → revalidate |
| AC-2: Default "revision requested" toggle is OFF | Pass | Portal + team both have `useState(false)` |
| AC-3: Every comment creates admin notification | Pass | `postCommentAction` and `/api/portal/comment/route.ts` both insert to notifications |
| AC-4: Revision comments visually distinct in notifications | Pass | 🔴 emoji prefix in message, amber highlight in comment display |
| AC-5: Portal shows "Client" not "Team" | Pass | Fallback changed across all 3 surfaces |
| AC-6: Avatars on all comment surfaces | Pass | Initials-based colored circle (28px), deterministic color from name |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `components/ui/avatar.tsx` | Created | Initials-based avatar component (10 colors, no DB migration) |
| `app/team/tasks/actions.ts` | Modified | Added editCommentAction, deleteCommentAction, notification on comment |
| `app/team/tasks/[taskId]/task-detail-form.tsx` | Modified | Added avatar, inline edit UI (check/x buttons), delete button |
| `components/portal/task-detail-dialog.tsx` | Modified | Avatar + 'Client' label, revision toggle default OFF |
| `components/admin/task-detail-dialog.tsx` | Modified | Added avatars to comment cards, amber badge for revision |
| `app/api/portal/comment/route.ts` | Modified | Added admin notification insert after comment |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| avatars are initials only | No DB column or profile images needed — works with existing user name field | Zero migrations, no storage overhead |
| Edit/delete requires ownership via team_member_id | Prevents cross-user comment manipulation | Safe — follows existing Supabase auth pattern |
| Notification emoji-based distinction | No new column in notifications table — simpler | Revision comments use 🔴 prefix, regular use 💬 |

## Deviations from Plan

### Auto-fixed Issues

**1. `team_member_id` not exposed in comment queries**
- **Found during:** Task 4 update — needed `team_member_id` for ownership display check but queries only fetched `team_members(name)`, not the FK itself
- **Fix:** Updated all comment queries to include `team_member_id` alongside the join
- **Files:** `app/team/tasks/[taskId]/task-detail-form.tsx`, `components/admin/task-detail-dialog.tsx`
- **Verification:** TypeScript check passes

### Deferred Items

None — all requirements met.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `team_member_id` not in query results | Added to select queries in all comment-fetching components |

## Next Phase Readiness

**Ready:**
- Comment system now includes edit + delete, avatars, and admin notification on every comment
- Avatar component can be reused in other parts of the app if needed

**Concerns:**
- Admin notifications use the full task ID UUID slice for display — not the task title, since we fetch the task by ID but don't include the title in the notification message

**Blockers:**
- None

---
*Phase: 14-comment-polish, Plan: 01*
*Completed: 2026-04-07*