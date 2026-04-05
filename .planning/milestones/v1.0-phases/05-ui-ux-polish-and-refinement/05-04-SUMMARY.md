---
phase: 05
plan: 05-04
subsystem: ui-components
tags: [ui, cards, consistency, tokens, interactivity]
key-files:
  - components/ui/content-card.tsx (already existed, migrated consumers)
  - components/admin/kanban-card.tsx (migrated to ContentCard)
  - components/portal/kanban-task-card.tsx (migrated to ContentCard)
  - components/admin/task-list.tsx (migrated mobile cards to ContentCard)
  - app/admin/clients/[clientId]/page.tsx (migrated mobile project cards to ContentCard)
  - app/admin/clients/client-card.tsx (fixed click handler)
decisions:
  - Kept ContentCard as div-based wrapper, not full shadcn Card — minimal token surface
  - Migrated only primary card surfaces (kanban, mobile) — form sections retain inline patterns as section containers, not cards
  - Fixed client card click to exclude all anchor elements, not just a[target] — prevents double navigation
metrics:
  started: 2026-04-05T04:33:29Z
  completed: 2026-04-05T04:42:00Z
  tasks: 3
  files_modified: 5
  commits: 1
---

# Phase 05 Plan 04: Card Redesign Unification Summary

**One-liner:** Unified card tokens across admin, team, and portal surfaces — migrated 5 card surfaces to shared ContentCard component and ensured full-card click interactivity on client cards.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 05-04-01 | Audit card components across all surfaces | Done | |
| 05-04-02 | Create shared card wrapper component | Done (migrated) | 3277473 |
| 05-04-03 | Verify client island interactivity | Done | 3277473 |

## Audit Findings

The `ContentCard` component already existed from Plan 05-02 but had zero consumers. All card surfaces used inline `rounded-lg border border-border p-X` patterns:

1. **Kanban card** (`components/admin/kanban-card.tsx`) — used inline `rounded-lg border border-border bg-background p-3 cursor-grab transition hover:border-foreground/30 active:cursor-grabbing`
2. **Portal kanban card** (`components/portal/kanban-task-card.tsx`) — used inline `w-full rounded-lg border border-border bg-background p-3 text-left transition hover:bg-muted/30`
3. **Task list mobile cards** (`components/admin/task-list.tsx`) — used inline `rounded-lg border border-border bg-white p-4 space-y-3`
4. **Project list mobile cards** (`app/admin/clients/[clientId]/page.tsx`) — used inline `rounded-lg border border-border bg-white p-4 space-y-3`
5. **Client cards** (`app/admin/clients/client-card.tsx`) — already clickable but exclusion selector was `a[target]` instead of `a`, causing double navigation on name link clicks
6. **Dashboard metric cards** — use `metricCardClassName` constant (`rounded-lg border border-border p-5`), matches ContentCard metric variant

## Migrations Performed

- **Admin kanban card**: Wrapped in `ContentCard variant="kanban"` with preserved drag attributes
- **Portal kanban card**: Wrapped in `ContentCard variant="kanban"`, added ContentCard import
- **Task list mobile cards**: Replaced `<div>` with `ContentCard variant="mobile"`
- **Project list mobile cards**: Replaced `<div>` with `ContentCard variant="mobile"`
- **Client cards**: Fixed click handler to exclude all `<a>` elements (not just `a[target]`), preventing double navigation when clicking the client name link

## Verification

- [x] `components/ui/content-card.tsx` exists and is used across card surfaces
- [x] Admin kanban cards use ContentCard with kanban variant
- [x] Portal kanban cards use ContentCard with kanban variant
- [x] Task/project mobile cards use ContentCard with mobile variant
- [x] Client cards navigate on click anywhere; name link and other links still work independently
- [x] All cards use consistent tokens (rounded-lg, border-border, transition)
- [x] `npx tsc --noEmit` passes without errors

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

All files verified present, commit 3277473 confirmed in history.
