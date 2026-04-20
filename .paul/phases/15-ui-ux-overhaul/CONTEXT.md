# Phase Context

**Phase:** 15 — UI/UX Overhaul & Simplification
**Generated:** 2026-04-20
**Status:** Ready for planning

## Goals

- **Streamline project navigation:** Reduce the number of steps/layers required to navigate from project selection to task editing. Current flow is too tedious with multiple layers.
- **Fix calendar task overflows:** Tasks overflow in the calendar view — needs layout fix to handle task display properly.
- **Remove notifications feature:** The notification feature is unnecessary and should be completely removed.
- **Remove all commenting functionality:** Strip out all commenting features to reduce clutter and keep the interface simple.
- **Fix mobile view issues:** Significant overflow and usability problems in mobile view that must be resolved.
- **Pivot to personal-use tool:** Disable all team-related features — no longer needed for multi-team collaboration.
- **Reorganize client portal task descriptions:** Task description areas need better organization, clear separation, and consistent alignment. Currently inconsistent and poorly laid out.
- **General UI/UX polish:** Numerous UI and UX issues require attention for a more polished, streamlined experience.

## Approach

- **Feature removal:** Remove notifications and commenting features entirely (UI components, API routes, database references where safe).
- **Navigation simplification:** Flatten the project → task navigation hierarchy to reduce clicks.
- **Mobile-first fixes:** Address overflow issues at 375px breakpoint, ensure all views are usable on small screens.
- **Team feature deprecation:** Hide/disable team member management, assignments, and related UI surfaces.
- **Client portal cleanup:** Redesign task description layout for consistency and clarity.

## Constraints

- Must maintain cream/beige (#FAF8F0) brand aesthetic
- Must work on 375px width screens
- Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Supabase
- Pivot to personal-use means admin-only workflow primarily

## Open Questions

- Should commenting database tables be dropped or just hidden from UI?
- Should team member tables be dropped or just hidden?
- What is the ideal navigation flow for project → task editing?
- Are there any team features that should remain for the personal-use pivot?

## Additional Context

User expressed dissatisfaction with current UI/UX, citing redundant features and tabs. The pivot to personal-use tool simplifies the user model significantly — primarily admin-only usage. This is a significant overhaul affecting multiple surfaces (admin dashboard, calendar, client portal, mobile views).

---

*This file is temporary. It informs planning but is not required.*
*Created by /paul-discuss, consumed by /paul-plan.*
