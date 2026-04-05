# Phase 09: Task Management & Kanban Improvements - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous workflow)

<domain>
## Phase Boundary

Admin can edit tasks inline on Kanban board with improved card UX and fixed interactions. 5 improvements:
1. Click Kanban card → inline edit (no navigation away)
2. Task dropdown clickable anywhere on row
3. Task details dialog with updated visual design, all fields
4. Image previewer loads on page reload with sized preview
5. Posting time: admin can set specific time, default 10:00 AM
</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — autonomous workflow. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key decisions:
- Inline edit: convert Kanban card click to open an inline editing mode or dialog overlay
- Dropdown: expand hit area from just the arrow button to entire task row/cell
- Task dialog: comprehensive display with all fields (title, caption, status, assigned_to, posting_date, posting_time)
- Image previewer: use thumbnail/preview sizes, not full-res
- Posting time: add time field (default 10:00 AM), store alongside posting_date
</decisions>

<code_context>
## Existing Code Insights

Phase 8 just completed: Kanban card now shows @username assignee display.
Kanban card exists at components/admin/kanban-card.tsx with dnd-kit sortable support.
Image previewer: likely references image preview components in admin.
Task dropdown: admin task-list.tsx has dropdown menus for task actions.
Database: Supabase backend. Tasks table already has posting_date; need posting_time column.
</code_context>

<specifics>
## Specific Ideas

Inline editing reduces clicks and keeps admin in flow state.
Image preview needs lazy loading or thumbnail approach for performance.
Default posting time of 10 AM matches typical social media posting conventions.
</specifics>

<deferred>
## Deferred Ideas

None — scope limited to 5 success criteria from ROADMAP.
</deferred>
