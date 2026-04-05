# Phase 12: Brand Redesign & Mobile Polish - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Entire application adopts the new cream/beige brand aesthetic (THEME-01 through THEME-07) and all components respond gracefully on mobile screens (MOB-01 through MOB-04). This is the final sweep phase that applies the visual transformation after all feature work (Phases 9-11) is complete.
</domain>

<decisions>
## Implementation Decisions

### Brand Color System (THEME-01, THEME-02)
- **D-01:** Background: cream/beige (#FAF8F0) — replaces pure white
- **D-02:** Card backgrounds: warm cream tones with subtle warm gradient overlays
- **D-03:** Accent cards: colorful gradient backgrounds (not flat colors)
- **D-04:** Warm typography: text uses softer blacks (#1a1a1a vs #111111)
- **D-05:** Tailwind CSS theme tokens updated via CSS variables in globals.css

### Icon System (THEME-03)
- **D-06:** Icon system updated with consistent, modern icon choices across all components
- **D-07:** Icons harmonize with the warm color palette

### Dashboard Metric Cards (THEME-04)
- **D-08:** Metric cards redesigned with colorful gradient backgrounds
- **D-09:** Consistent card alignment across dashboard

### Sidebar (THEME-05)
- **D-10:** Sidebar uses modern minimal navigation style
- **D-11:** Large square blocks removed from sidebar design
- **D-12:** Mobile hamburger menu positioned on the LEFT side (MOB-01)

### Task Cards (THEME-06)
- **D-13:** Consistent text alignment across all task card views
- **D-14:** Proper sizing with modern styling
- **D-15:** Copy button sizing reduced (THEME-07)

### Typography (THEME-07)
- **D-16:** Typography sizing reduced across all components for cleaner readability
- **D-17:** Copy buttons reduced in size

### Mobile Responsiveness (MOB-02, MOB-03, MOB-04)
- **D-18:** Dashboard has no overlapping or overflow elements at 375px width
- **D-19:** Calendar has no overflow or clipping on mobile
- **D-20:** All cards and components resize gracefully on mobile without horizontal scroll

### Claude's Discretion
- Specific gradient color values and exact pixel sizing — let planner determine based on design coherence
- Icon library selection — Lucide, Heroicons, or custom set
- Exact breakpoint strategies for mobile scaling

### Folded Todos
None — no matched todos for this phase scope.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Brand & Design
- `.planning/REQUIREMENTS.md` §v1.1 Requirements: Branding & Design System — THEME-01 through THEME-07
- `.planning/REQUIREMENTS.md` §v1.1 Requirements: Mobile Optimization — MOB-01 through MOB-04
- `app/globals.css` — Current Tailwind CSS theme tokens (baseline for transformation)
- `components/ui/card.tsx` — Existing Card component structure
- `components/admin/dashboard-inner.tsx` — Dashboard metric cards structure
- `components/admin/kanban-card.tsx` — Task card component structure

### Mobile
- `components/admin/kanban-board.tsx` — Kanban board for mobile testing
- `app/globals.css` — Mobile responsive baseline

### Existing Code Insights
No external specs — requirements fully captured in decisions above.

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/card.tsx` — shadcn Card component, can be restyled with new theme
- `components/ui/button.tsx` — button component with existing variants
- `components/ui/dialog.tsx`, `components/ui/sheet.tsx` — modal/drawer components
- `components/admin/dashboard-inner.tsx` — contains metric card structure
- `components/admin/kanban-card.tsx` — task card rendering

### Established Patterns
- Tailwind CSS 4 with `@theme inline` CSS variables in globals.css
- shadcn/ui component library base
- Status dot animation with `animate-pulse-status` class
- Poppins font already in use

### Integration Points
- Theme changes span all surfaces: admin, team, portal
- Mobile changes affect layout components across all views
- globals.css is the single source of truth for theme tokens
</code_context>

<specifics>
## Specific Ideas

- New brand aesthetic: cream/beige (#FAF8F0), warm gradients, colorful accent cards, bold modern typography
- Large square blocks removed from sidebar — modern minimal navigation
- Copy buttons and typography sizing reduced across all components
- Mobile sidebar toggle on LEFT side

No specific requirements — open to standard approaches within the brand direction.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 12-brand-redesign-mobile-polish*
*Context gathered: 2026-04-05*
