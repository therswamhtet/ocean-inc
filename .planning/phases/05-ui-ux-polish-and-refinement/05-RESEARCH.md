# Phase 05 Research — UI/UX Polish and Refinement

**Date:** 2026-04-04  
**Scope:** UI/UX refin across admin, team, portal, and shared components  
**Discovery Level:** 2 (standard research)

## Summary

This phase is a presentation-layer polish pass with no new data dependencies. All work is in existing component files, layout files, and shared utilities. The focus areas are: modal sizing responsiveness, share link behavior, terminology consistency, mobile navigation, calendar view polish, task dashboard redesign, card component unification, and general bug fixes. No new npm dependencies are needed.

## Inputs Reviewed

- `.planning/phases/05-ui-ux-polish-and-refinement/05-CONTEXT.md`
- `.planning/phases/04-client-portal-public-read-only-views/04-DISCUSSION-LOG.md`
- `.planning/phases/04-client-portal-public-read-only-views/04-CONTEXT.md`
- `.planning/phases/03-team-workflow-task-dashboard-and-editing/03-CONTEXT.md`
- `.planning/phases/02-admin-core-client-project-and-task-management/02-CONTEXT.md`
- `.planning/phases/01-foundation-database-auth-and-security/01-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`

## Confirmed Constraints (from locked decisions)

- D-01/D-02/D-03: Modal sizing — responsive, with scrollable content, consistent across surfaces.
- D-04/D-05/D-06: Share links — absolute URLs with CopyButton, clear feedback.
- D-07/D-08/D-09: Terminology — consistent across admin, team, portal; central source of truth.
- D-10/D-11/D-12/D-13: Mobile nav — hamburger for admin/team, stacked tabs for portal, card layouts for tables.
- D-14/D-15/D-16/D-17: Calendar — horizontal scroll, 44px touch targets, B&W brand.
- D-18/D-19/D-20: Dashboard — 4 metrics in responsive grid, collapsible notifications.
- D-21/D-22/D-23/D-24: Cards — unified token variants for kanban, list, metric.

## Technical Recommendations

### 1) Work by area, not by surface

Tackle one concern across all surfaces before moving to the next. For example:
- Modal sizing: fix all Dialog usages together (admin task create, portal task detail, team notifications).
- Terminology: audit all `.tsx` files, update labels, add constants.
- This avoids the risk of inconsistent application.

### 2) Modal sizing strategy

- Audit all Dialog component usages across admin, team, and portal.
- Apply responsive maxWidth: `max-w-[95vw]` on mobile → `max-w-xl` / `max-w-2xl` / `max-w-3xl` per modal context.
- Add `max-h-[85vh] overflow-y-auto` to dialog content containers.
- Test at 375px width after each change.

### 3) Terminology audit process

- `rg '"Create project"|"create project"|"Projects"|"Tasks"|"Posting Date"|"Post Date"'` across `*.tsx` and `*.jsx`.
- Map all variants to a single canonical form.
- Write `lib/labels.ts` with constants for all UI strings.
- Phase in replacements per surface.

### 4) Mobile navigation

- Admin sidebar (`app/admin/layout.tsx`) needs hamburger toggle + slide-out panel for `<md` breakpoint.
- Team sidebar (`app/team/layout.tsx`) mirrors admin pattern.
- Client portal tabs (`.planning/phases/04-...` calendar/timeline/tab components) need vertical stacking at 375px.
- Table-to-card conversion: existing list views need mobile-specific rendering.

### 5) Calendar view polish

- Ensure minimum cell sizes (44px touch targets).
- Add horizontal scroll wrapper for narrow viewports.
- Task indicators in cells should truncate or use ellipsis for multi-task days.

### 6) Dashboard redesign

- 4 metric cards in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Large number display (`text-3xl` or `text-4xl`), smaller label below.
- Notifications section collapsible with `hidden`/`block` toggle.

### 7) Card component unification

- Shared base class for cards: `border border-[#E5E5E5] p-4` as starting point.
- Variant-specific additions for kanban (compact), list (row), metric (centered).
- Audit and align padding, gap, and content truncation across surfaces.

## Dependency Decision

**No new npm dependencies recommended.**

Reasoning:
- All work is presentation-layer refinements using existing stack.
- Adding dependencies at this late stage introduces risk without proportional benefit.

## Risks + Mitigations

1. **Scope creep — "polish everything" has no natural boundary**  
   Mitigation: constrain to the 8 specific areas documented. Bug-fix list capped by time budget per plan.

2. **Mobile nav breaking existing desktop layout**  
   Mitigation: isolate mobile-specific CSS behind Tailwind responsive prefixes (`md:`). Test desktop layout after every mobile change.

3. **Terminology changes breaking existing integrations**  
   Mitigation: only change UI labels (`aria-label`, visible text), not variable names, route paths, or data attributes.

4. **Calendar scroll breaking week toggle behavior**  
   Mitigation: week/month toggle affects data grid, horizontal scroll is a display-layer concern. Keep them decoupled.

## Validation Architecture

Validation approach for execution phase:
- Per task: lint + build checks, manual viewport testing at 375px and desktop.
- Per plan wave: `npm run build` to verify no regressions.
- Verification focus:
  - All modals render at correct responsive sizes
  - Share links copy correctly with feedback
  - Terminology consistent across surfaces (grep audit)
  - Mobile nav collapsible at <768px
  - Calendar interactive at 375px
  - Dashboard cards display correctly at all breakpoints
  - Card variants consistent across surfaces
  - No build errors or new lint warnings

## Research Verdict

Proceed with planning. All areas are presentation-layer work using existing primitives. No external research or new dependencies needed.