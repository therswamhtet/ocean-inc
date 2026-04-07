---
phase: 13-collaboration
plan: 01
subsystem: ui
tags: comments, revisions, supabase, react, server-actions

# Dependency graph
requires:
  - phase: 04-client-portal
    provides: portal task detail dialog + Supabase storage
provides:
  - Comment system across admin, team, and client portal
  - Revision request workflow for clients
  - Public API route for portal comment submission
affects: future phases that build on comment features

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Comments + revision requests unified via single `comments` table with `is_revision` boolean
    - Portal write operations use dedicated API route (no server actions)
    - Team operations use server actions with auth guard

key-files:
  created:
    - supabase/migrations/015_add_comment_type.sql
    - app/api/portal/comment/route.ts
  modified:
    - app/team/tasks/actions.ts
    - components/admin/task-detail-dialog.tsx
    - app/team/tasks/[taskId]/task-detail-form.tsx
    - components/portal/task-detail-dialog.tsx
    - lib/labels.ts

key-decisions:
  - "Unified comments + revisions: single table, `is_revision` boolean flag"
  - "Portal comments via API route (public), team comments via server action (auth)"
  - "Revision requests visually distinct with amber badge + border"

patterns-established:
  - "Comments sorted by created_at ascending across all surfaces"
  - "Service role client with null team_member_id for public comments"

# Metrics
duration: 12min
started: 2026-04-07T10:00:00Z
completed: 2026-04-07T10:12:00Z
---

# Phase 13 Plan 01: Collaboration & Comments Summary

**Unified comment system with revision flags across all three user surfaces (admin, team, portal)**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~12 min |
| Started | 2026-04-07T10:00:00Z |
| Completed | 2026-04-07T10:12:00Z |
| Tasks | 6 completed |
| Files modified | 8 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: is_revision column in comments table | Pass | Migration 015 created + composite index |
| AC-2: Team member can post comment | Pass | `postCommentAction()` with auth guard + task ownership |
| AC-3: Client can request revision via portal | Pass | POST /api/portal/comment route, revision flag ON by default |
| AC-4: Admin/team see revision flags distinctly | Pass | Amber border + badge with "Revision Requested" label |
| AC-5: Comments sorted by created_at ascending | Pass | `.order('created_at', { ascending: true })` on all queries |

## Accomplishments

- Unified comment system across admin, team, and client portal
- Revision request workflow: clients can flag comments as revision requests from the portal
- Team members can leave standard comments or optionally flag as revision request
- Public API route for portal comment submission (first write action from unauthenticated portal)
- TypeScript build passes cleanly (3 type errors found and fixed during implementation)

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `supabase/migrations/015_add_comment_type.sql` | Created | Add `is_revision` boolean column + composite index |
| `app/team/tasks/actions.ts` | Modified | Add `postCommentAction()` server action with auth + ownership check |
| `components/admin/task-detail-dialog.tsx` | Modified | Comment display section with revision highlighting (amber badge/border) |
| `app/team/tasks/[taskId]/task-detail-form.tsx` | Modified | Comment form with optional revision flag, inline display |
| `components/portal/task-detail-dialog.tsx` | Modified | Comment form (revision ON by default) + display for clients |
| `app/api/portal/comment/route.ts` | Created | POST route for unauthenticated portal comment submission |
| `lib/labels.ts` | Modified | Added `comments` domain labels |
| `.paul/phases/13-collaboration/13-01-PLAN.md` | Created | Phase 13 plan document |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Unified comments + revisions via `is_revision` boolean | Both needs served by a single table; avoids duplication | Simpler query, consistent UI across surfaces |
| Portal comments via API route (not server action) | Portal uses server components only; no auth context available | Established pattern for future portal write operations |
| `team_member_id: null` for portal comments | No user identity available on public portal | Portal comments appear as "Team" in the name display |
| Revision flag ON by default in portal | Primary use case for clients is revision requests | Lower friction for most common client action |

## Deviations from Plan

### Auto-fixed Issues

**1. TypeScript `PromiseLike.finally` error**
- **Found during:** Task 3 (admin task detail dialog comments)
- **Issue:** Supabase's `.from().select()` chain returns `PromiseLike`, not `Promise`, so `.finally()` is not available in strict TypeScript
- **Fix:** Replaced `.finally()` with `.then(...).then(() => { cleanup }, () => { cleanup })`
- **Files:** `components/admin/task-detail-dialog.tsx`
- **Verification:** `npx tsc --noEmit` passes clean

**2. Portal `task` possibly null TypeScript error**
- **Found during:** Task 5 (portal task detail comments)
- **Issue:** `task` can be `null` in `setIsRevision` — `useTransition` callback captures `task` which may change between render and execution
- **Fix:** Extract `taskId = task.id` before entering `startPostingComment`, guard with `!task` check
- **Files:** `components/portal/task-detail-dialog.tsx`
- **Verification:** `npx tsc --noEmit` passes clean

**3. Missing Switch import in team task detail form**
- **Found during:** Task 4 (team task detail comments)
- **Issue:** Using `<Switch>` component but `Switch` was not imported into the team task detail form
- **Fix:** Added `import { Switch } from '@/components/ui/switch'`
- **Files:** `app/team/tasks/[taskId]/task-detail-form.tsx`
- **Verification:** Build passes

**Total impact:** Essential TypeScript type fixes — no scope creep, all necessary for build to pass.

### Deferred Items

None - plan executed exactly as written (with auto-fixes for type errors).

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Supabase PromiseLike incompatibility with `.finally()` | Replaced with double `.then()` pattern |
| Portal `task` null in async context | Extracted `taskId` before state change |

## Next Phase Readiness

**Ready:**
- Comment system established across all surfaces (admin, team, portal)
- API route pattern established for future portal write operations
- `is_revision` boolean enables revision workflow without separate table/status

**Concerns:**
- Portal comments use service role client with no auth — anyone with the slug can post comments (intended for MVP, but could be abused)
- No notification sent to team when client posts a revision request — they only see it on the next open of the task detail dialog

**Blockers:**
- None

---
*Phase: 13-collaboration, Plan: 01*
*Completed: 2026-04-07*
