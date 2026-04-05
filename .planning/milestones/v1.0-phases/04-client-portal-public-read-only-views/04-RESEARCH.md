# Phase 04 Research — Client Portal (Public Read-Only Views)

**Date:** 2026-04-04  
**Scope:** CLIENT-01 through CLIENT-10  
**Discovery Level:** 2 (standard research)

## Summary

Build the portal with existing stack primitives (Next.js App Router, Supabase, date-fns, shadcn Dialog) and avoid adding new calendar/timeline dependencies for MVP.

Key direction:
- Use a server-rendered `/portal/[slug]` page with `export const dynamic = 'force-dynamic'` (per D-16).
- Keep all portal interactions read-only (no server actions, no mutation endpoints).
- Reuse `StatusDot`, `CopyButton`, and `DesignFileDownloader` for consistency.
- Implement calendar and timeline as lightweight custom components using `date-fns`.

## Inputs Reviewed

- `.planning/phases/04-client-portal-public-read-only-views/04-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`
- `components/ui/status-dot.tsx`
- `components/admin/copy-button.tsx`
- `components/admin/design-file-downloader.tsx`
- `components/admin/kanban-board.tsx`
- `app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`

## Confirmed Constraints (from locked decisions)

- D-01: Kanban is 3 columns (`todo`, `in_progress`, `done`) and overdue is a visual flag only.
- D-03/D-04: Active project is `status = 'active'` and at most one is expected.
- D-05/D-06: Top tabs; default view is Kanban.
- D-07/D-08: Modal dialog with read-only task details.
- D-09/D-10: Calendar defaults to month with week toggle.
- D-11/D-12: Timeline is month-grouped swimlanes with horizontal scroll.
- D-13/D-14: Empty state message; no history browsing.
- D-15/D-16/D-17: Slug validation, force-dynamic, public route.

## Technical Recommendations

### 1) Data + route architecture

- Create `lib/portal/types.ts` as interface contract used by all three view components.
- Create `lib/portal/queries.ts` for slug -> client -> active project -> tasks fetch flow.
- Create `app/portal/[slug]/page.tsx` as Server Component with:
  - `export const dynamic = 'force-dynamic'`
  - `notFound()` on invalid slug
  - empty-state rendering when no active project
  - pass normalized task data to a client shell component

### 2) Security/read-only guard

- Portal code path must include **no mutation surface**:
  - no `"use server"` action imports in portal route/components
  - no POST/PATCH/DELETE route handlers under `app/portal`
- Add a dedicated migration for portal-read data access policy strategy aligned to existing DB policy style.

### 3) View implementations (no new dependency)

- Kanban: custom read-only board/card components (reuse admin visual language, remove dnd/mutation behavior).
- Calendar: custom month/week grid built with `date-fns` utilities already installed.
- Timeline: custom month swimlanes + horizontal scroll container + date-positioned task bars.

### 4) Task detail modal

- Reuse `components/ui/dialog.tsx`.
- Reuse `CopyButton` and `DesignFileDownloader` in read-only mode.
- Keep details strictly scoped to caption, design file, posting date, and status (per D-07/D-08).

## Dependency Decision

**No new npm dependencies recommended**.

Reasoning:
- `date-fns` is already available and sufficient.
- Existing component system can render required interactions.
- Avoids introducing compatibility and styling drift in a late-stage MVP phase.

## Risks + Mitigations

1. **Requirement text vs D-01 mismatch (4 columns vs 3+overdue flag)**  
   Mitigation: implement 3 columns per locked user decision D-01 and explicitly document traceability in plans.

2. **Public portal data access policy correctness**  
   Mitigation: isolate policy changes in a dedicated migration and include grep-verifiable acceptance criteria.

3. **Calendar/timeline complexity creep**  
   Mitigation: enforce MVP rendering rules (single posting date, no drag, no ranges, no edits).

## Validation Architecture

Validation approach for execution phase:
- Per task: lint + focused vitest file checks.
- Per plan: `npm run test` and `npm run build` before summary.
- Verification focus:
  - Slug validation + force-dynamic presence
  - Read-only guarantees (no portal mutations)
  - Correct rendering semantics in all three views
  - Modal content + signed URL download integration

## Research Verdict

Proceed with planning using existing stack only. No prerequisite external research remains.
