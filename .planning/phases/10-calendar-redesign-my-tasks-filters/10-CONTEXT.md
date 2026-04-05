# Phase 10: Calendar Redesign & My Tasks Filters - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Calendar renders with clean square day blocks and no overflow; team members can filter tasks by time period (Today, This week, This month).

</domain>

<decisions>
## Implementation Decisions

### Calendar Cell Design
- **D-01:** Day cells render as square blocks — no rounded corners (replacing current rounded-lg border)
- **D-02:** Tasks display without clipping — use expand-on-click pattern with "+N more" overflow indicator (existing pattern retained)
- **D-03:** maxVisible={3} pills shown by default; click cell to expand and show all tasks; click "Collapse" to minimize
- **D-04:** Clean month grid layout — consistent square cells in 7-column grid

### Calendar Overflow & Layout
- **D-05:** Calendar uses overflow-x-auto wrapper with min-w-[560px] for desktop scroll behavior
- **D-06:** At 375px mobile: cells shrink proportionally, text sizes reduce, 44px touch targets maintained
- **D-07:** Task pills truncate with ellipsis (text-[11px] font, truncate class) — full title on title attribute tooltip

### My Tasks Filters
- **D-08:** Filter buttons appear as toggle button group above the task list in admin dashboard
- **D-09:** Three filter options: "Today", "This week", "This month" — styled as segmented control
- **D-10:** Default filter selection: "This week" (most useful default for ongoing work)
- **D-11:** Active filter highlighted with filled background (#222222 bg, white text); inactive filters use muted styling

### Time Period Definitions
- **D-12:** "Today" = posts with posting_date matching current calendar date
- **D-13:** "This week" = Sunday through Saturday of current week (ISO week standard)
- **D-14:** "This month" = all tasks with posting_date in current calendar month

### Calendar Revert
- **D-15:** CAL-04 refers to reverting to "initial calendar style" — confirmed as the square block month grid described above

### Integration Points
- **D-16:** Calendar component (PortalCalendarView in components/portal/calendar-view.tsx) handles both admin dashboard calendar and client portal calendar
- **D-17:** My Tasks filters apply to DashboardMyTasks component in components/admin/dashboard-inner.tsx
- **D-18:** Date filtering happens client-side after fetching assigned tasks (no new API endpoints needed)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Calendar Implementation
- `components/portal/calendar-view.tsx` — existing calendar component with MonthDayCell, TaskPill, mode toggle (month/week)
- `lib/portal/calendar-utils.ts` — buildMonthGrid, buildWeekGrid, groupTasksByPostingDate utilities

### Admin Dashboard
- `app/admin/page.tsx` — dashboard page that fetches calendarTasks and myTasks
- `components/admin/dashboard-inner.tsx` — DashboardCalendar, DashboardMyTasks components; lines 490-519 show current My Tasks structure

### Task Types
- `lib/portal/types.ts` — PortalTask type used by calendar; check TaskRow vs PortalTask boundary mentioned in STATE.md blockers

### Team Tasks
- `app/team/page.tsx` — team member dashboard showing assigned tasks (sorted by due date); filter not yet implemented

### Requirements
- `.planning/REQUIREMENTS.md` §Calendar (lines 158-164): CAL-01, CAL-02, CAL-03, CAL-04
- `.planning/REQUIREMENTS.md` §My Tasks (lines 165-168): TASKS-01, TASKS-02

### Design Notes
- `.planning/STATE.md` blocker note: "Calendar type boundary: extracting calendar-utils from lib/portal/ to shared lib/ requires type adaptation between PortalTask and TaskRow"

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `MonthDayCell` component: already handles expand/collapse overflow pattern
- `TaskPill` component: already handles truncation with title tooltip
- `groupTasksByPostingDate`: already groups tasks by day key (yyyy-MM-dd format)
- date-fns utilities: startOfWeek, endOfWeek, startOfMonth, endOfMonth already imported in calendar-utils

### Established Patterns
- Toggle button group style: mode === nextMode ? 'bg-[#222222] text-white' : 'text-muted-foreground' (from calendar mode toggle in calendar-view.tsx)
- 44px min-height touch targets on mobile (accessibility standard)
- Status dot colors and pulse animation from existing UI-03

### Integration Points
- Admin dashboard page (app/admin/page.tsx) already fetches myTasks and passes to DashboardMyTasks
- My Tasks filtering is a client-side concern — tasks already fetched, filter reduces visible subset
- Calendar utils live in lib/portal/ but may need type adaptation for lib/ usage (STATE.md blocker)

</codebase_context>

<specifics>
## Specific Ideas

No specific references from discussion — using standard calendar grid patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-calendar-redesign-my-tasks-filters*
*Context gathered: 2026-04-05*
