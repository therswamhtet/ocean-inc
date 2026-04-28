# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-04-07)

**Core value:** Admins can create/manage social media content tasks and give clients a clean read-only portal — all in one place.
**Current focus:** v1.2 complete — Phase 16 done

## Current Position

Milestone: v1.2 Collaboration & Workflow (v1.2.0)
Phase: 16 of 16 — Upload Bug Fix (COMPLETE)
Plan: 16-01 complete
Status: Phase 16 complete — all plans done
Last activity: 2026-04-28 — Plan 16-01 complete (upload auth + error handling)

Progress:
- Milestone: [██████████] 100%
- Phase 16: [██████████] 100%

## Loop Position

Current loop state:
```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop complete - Phase 16 done]
```

## Session Continuity

Last session: 2026-04-28
Stopped at: Phase 16 complete — upload fix shipped
Next action: Transition phase 16 as complete, archive milestone or start v1.3
Resume file: .paul/phases/16-upload-fix/16-01-SUMMARY.md

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Phase 16: 1 plan total (16-01)

## Accumulated Context

### Decisions
- Comments and revision requests unified through single `comments` table with `is_revision` boolean
- Team members can post comments on assigned tasks via server action with auth
- Clients leave revision-request comments via public API route (no auth, service role client)
- Revision requests visually distinguished with amber badge + border
- Admin can post, edit, delete ANY comment from task detail dialog
- Clients can edit/delete their own comments in portal
- Avatars are initials-only (no profile images, no DB migration)
- Hydration fix for dnd-kit KanbanCard (mounted guard on drag button)
- Phase 15 split into 4 plans: 15-01 (remove notifications+comments), 15-02 (disable team features), 15-03 (streamline navigation), 15-04 (fix calendar/mobile/dialog polish)
- Database tables hidden from UI only (not dropped) for reversibility
- Projects page added as flat list shortcut — skips Clients intermediary
- Dashboard enhanced with Active Projects quick-access cards
- Quick Task Dialog cleaned of team member/assignee references
- Mobile calendar pattern: hidden sm:block grid + block sm:hidden card feed
- Status pill pattern: rounded-full with dot, bg, text, border classes
- Section card pattern: rounded-xl border bg-card with border-b header
- Removed min-w-[560px]/min-w-[640px] from all portal calendar/timeline views
- Replaced StatusDot component with status pill badges across all views
- Task edit form: section cards (Content/Schedule/Design File), removed team member assignment
- Kanban detail dialogs: h3 section titles, breathing room, copy button as bordered element, status in footer
- Upload API route now requires admin auth (createClient().auth.getUser()) — returns 401 for unauthenticated requests
- All client upload components now parse and display server error messages instead of generic "Upload failed"

### Deferred Issues
- Security: `dangerouslySetInnerHTML` without sanitizing on task briefing
- Race condition in invite registration flow
- Pre-existing test failures: portal-queries mock setup, portal-kanban aria-label drift (Phase 15 redesign), portal-task-dialog missing test env vars

### Blockers/Concerns
None.

---

*STATE.md — Updated after every significant action*
