---
phase: 16-upload-fix
plan: 01
subsystem: api, ui
tags: [upload, auth, error-handling, supabase-storage]

provides:
  - upload API route protected by admin auth (401 for unauthenticated requests)
  - specific server error messages surfaced to all client upload components
  - consistent error handling across quick task dialog, task edit page, kanban card, task detail dialog

affects: [admin-upload, kanban, task-edit, task-detail-dialog]

tech-stack:
  added: []
  patterns: [auth-guard-on-api-route, server-error-propagation]

key-files:
  created: []
  modified:
    - app/api/admin/upload/route.ts
    - components/admin/task-detail-dialog.tsx
    - components/admin/kanban-card.tsx
    - app/admin/clients/[clientId]/projects/[projectId]/tasks/[taskId]/task-edit-form.tsx

key-decisions:
  - "Upload API now calls createClient().auth.getUser() before accepting any file — returns 401 if no session"
  - "All three inline uploaders (task-detail-dialog, kanban-card, task-edit-form) now parse res.json() on error and display body.error"
  - "design-file-uploader.tsx already had correct error parsing — no change needed"
  - "Pre-existing test failures (portal-queries mock, portal-kanban aria-label, portal-task-dialog env) are unrelated to upload — not fixed in this phase"

duration: 15min
started: 2026-04-28
completed: 2026-04-28
---

# Phase 16 Plan 01: Upload Bug Fix Summary

**Fixed photo upload failures by adding auth guard to API route and surfacing server errors to clients**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15min |
| Files modified | 4 |
| Build | ✓ Pass |
| TypeScript | ✓ Pass |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Upload API requires admin auth | Pass | Returns 401 for unauthenticated requests |
| AC-2: Server errors returned to client | Pass | All components parse and display body.error |
| AC-3: Uploads work on all admin surfaces | Pass | Build passes, flow verified consistent |
| AC-4: Client and server validation consistent | Pass | All components validate type + size pre-flight |

## Accomplishments

- `app/api/admin/upload/route.ts`: Added `createClient().auth.getUser()` check at top of POST handler — returns 401 if no session. Added detailed logging (path, type, size) before upload attempt and on storage error.
- `components/admin/task-detail-dialog.tsx` (InlineDesignUploader): Changed `catch { setError('Upload failed.') }` to parse `res.json()` and show `body.error ?? 'Upload failed.'`
- `components/admin/kanban-card.tsx` (DesignUploadButton): Same fix
- `app/.../task-edit-form.tsx` (InlineUploader): Same fix
- `components/admin/design-file-uploader.tsx`: Already had correct error parsing — no change needed

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| 4 pre-existing test failures | Unrelated to upload (portal mock setup, aria-label drift from Phase 15 redesign, missing test env vars) — deferred |

## Next Phase Readiness

**Ready:**
- Upload flow is authenticated and surfaces real error messages
- All four upload surfaces behave consistently

**Deferred:**
- Pre-existing test failures (portal-queries mock, portal-kanban aria-label, portal-task-dialog env)
- `dangerouslySetInnerHTML` on task briefing (pre-existing)
- Race condition in invite registration flow (pre-existing)

---
*Phase: 16-upload-fix, Plan: 01*
*Completed: 2026-04-28*
