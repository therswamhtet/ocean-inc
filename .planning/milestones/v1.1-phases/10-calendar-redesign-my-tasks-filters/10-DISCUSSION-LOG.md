# Phase 10: Calendar Redesign & My Tasks Filters - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 10-calendar-redesign-my-tasks-filters
**Areas discussed:** Calendar Cell Design, Calendar Overflow & Layout, My Tasks Filters, Time Period Definitions

---

## Calendar Cell Design

| Option | Description | Selected |
|--------|-------------|----------|
| Square blocks | Day cells render as square blocks — no rounded corners | ✓ |
| Rounded corners | Keep current rounded-lg border style | |

**User's choice:** Auto-selected: Square blocks (recommended default)
**Notes:** Phase 10 goal explicitly states "clean square day blocks" — requirement CAL-01

---

## Calendar Overflow Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Expand on click | maxVisible=3 pills, click cell to expand all, "+N more" indicator | ✓ |
| Truncate all | Show all tasks but truncate titles | |
| Scroll within cell | Vertical scroll inside day cell | |

**User's choice:** Auto-selected: Expand on click (recommended default)
**Notes:** Existing pattern in codebase — user familiar with it

---

## My Tasks Filter Location

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle button group | Segmented control above task list | ✓ |
| Dropdown | Single button with dropdown menu | |
| Tabs | Full-width tab bar | |

**User's choice:** Auto-selected: Toggle button group (recommended default)
**Notes:** Consistent with calendar mode toggle style already in codebase

---

## My Tasks Filter Options

| Option | Description | Selected |
|--------|-------------|----------|
| Today, This week, This month | Three time period filters | ✓ |
| Today, This week, This month, All | Four options including unfiltered | |

**User's choice:** Auto-selected: Three time period filters (recommended default)
**Notes:** Matches TASKS-01 requirement exactly

---

## Default Filter Selection

| Option | Description | Selected |
|--------|-------------|----------|
| This week | Most useful default for ongoing work | ✓ |
| Today | Shows most urgent only | |
| This month | Broadest view by default | |

**User's choice:** Auto-selected: This week (recommended default)
**Notes:** Practical default — balances urgency with overview

---

## Time Period Definitions

| Option | Description | Selected |
|--------|-------------|----------|
| ISO week (Sun-Sat) | Sunday through Saturday | ✓ |
| Mon-Sun | Monday through Sunday | |

**User's choice:** Auto-selected: ISO week (Sun-Sat) (recommended default)
**Notes:** date-fns startOfWeek defaults to Sunday in most locales

---

## Calendar Mobile Width

| Option | Description | Selected |
|--------|-------------|----------|
| Shrink cells proportionally | min-w-[560px] maintained, cells shrink, smaller text | ✓ |
| Remove min-width | Full width grid at mobile | |
| Different layout | Switch to week view only at mobile | |

**User's choice:** Auto-selected: Shrink cells proportionally (recommended default)
**Notes:** Maintains consistency across breakpoints

---

## Claude's Discretion

The following were auto-resolved using recommended defaults:
- maxVisible={3} pill count retained from existing implementation
- Task pill truncation style (text-[11px], truncate class) retained from existing implementation
- Client-side filtering approach (no new API endpoints) — practical for MVP

## Deferred Ideas

None — discussion stayed within phase scope.
