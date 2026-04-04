# Phase 5: UI/UX Polish and Refinement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 05-ui-ux-polish-and-refinement
**Areas discussed:** Modal sizing, share links, terminology, mobile navigation, calendar polish, task dashboard, card redesign

---

## Modal Sizing

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width on mobile, constrained on desktop | Dialog takes 95vw on mobile, max-w-2xl/3xl on desktop. Content scrolls internally. | ✓ |
| Fixed width with media queries | Single width value with CSS media queries overriding. More code to maintain. | |
| Different modal sizes per context | Small for confirmations, large for task detail, medium for edits. Consistent but potentially inconsistent. | |

**User's choice:** Full-width on mobile, constrained on desktop
**Notes:** Matches responsive pattern. Internal scroll keeps actions visible. Consistent across admin, team, and portal surfaces.

---

## Share Links

| Option | Description | Selected |
|--------|-------------|----------|
| Inline copy button with URL | Show the shareable URL with a copy button next to it in the client settings area. Uses existing CopyButton component. | ✓ |
| Generate + copy in one click | Button generates the absolute URL and copies it directly, showing "Copied!" feedback. | |
| QR code + copy button | QR code for quick phone scanning plus copyable URL. More complex, better for sharing. | |

**User's choice:** Inline copy button with URL
**Notes:** Simplest approach. Reuses CopyButton component. URL should be the absolute `/portal/[slug]` path.

---

## Terminology Standardization

| Option | Description | Selected |
|--------|-------------|----------|
| Centralized label constants | Single source of truth in `lib/constants.ts` for all UI labels. Import everywhere. | ✓ |
| Find + replace across files | Search and replace inconsistent labels in each file. No single source. | |
| i18n framework | Use next-intl or similar for future-proofing. Overkill for single-language app. | |

**User's choice:** Centralized label constants
**Notes:** Single file for all UI labels. Prevents drift between admin, team, and portal surfaces.

---

## Mobile Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger menu with slide-out panel | Sidebar collapses to hamburger icon on <768px. Menu slides from left. Matches standard mobile nav pattern. | ✓ |
| Bottom tab bar | Fixed bottom bar with icons for primary sections. Good for thumb reach. Would replace sidebar entirely. | |
| Top dropdown menu | Simple dropdown select at top of page. Minimal surface, but fewer top-level links. | |

**User's choice:** Hamburger menu with slide-out panel
**Notes:** Admin and team sidebars both collapse to hamburger. Client portal uses stacked top tabs on mobile.

---

## Calendar Polish

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal scroll + minimum touch targets | Calendar cells are minimum 44px for touch. Overflow days scroll horizontally on narrow screens. | ✓ |
| Compact cell with tap-to-expand | Cell shows count, tap to expand list. Less information density at a glance. | |
| List view fallback | On very small screens, fall back to task list sorted by date. Loses calendar metaphor. | |

**User's choice:** Horizontal scroll + minimum touch targets
**Notes:** Calendar maintains its grid metaphor. Horizontal scroll handles overflow gracefully. 44px touch targets for WCAG compliance.

---

## Task Dashboard

| Option | Description | Selected |
|--------|-------------|----------|
| 4 metric cards in responsive grid | Total Projects, Tasks In Progress, Overdue Tasks, Completed This Month. 2x2 on tablet, 4-across on desktop. | ✓ |
| Single stat row | Metrics as inline text in a single horizontal row. More compact but less visually impactful. | |
| Card with mini sparkline | Each metric card includes a small visual trend line. More implementation complexity. | |

**User's choice:** 4 metric cards in responsive grid
**Notes:** Same 4 metrics as existing dashboard. Improved visual hierarchy with consistent sizing and spacing.

---

## Card Redesign

| Option | Description | Selected |
|--------|-------------|----------|
| Unified card component variants | Single `Card` component root class with variant props (kanban, list, metric). Shared border/padding tokens. | ✓ |
| Separate components per surface | Each surface (admin/team/portal) has its own card components. More duplication, more flexibility. | |
| Tailwind component classes only | Define shared utility classes in CSS. Less structured but no JS surface area. | |

**User's choice:** Unified card component variants
**Notes:** Shared tokens for border, padding, spacing. Variant-specific content areas for kanban, list, and metric cards.

---

## Deferred Ideas

- Real-time data updates via Supabase Realtime — remains v2 scope.
- Dashboard charts/graphs — not in MVP scope.
- Advanced filtering and search — deferred to when scale demands it.
- QR code share links — nice-to-have but not MVP-critical.

---

*Discussion log: 2026-04-04*
*Phase: 05-ui-ux-polish-and-refinement*