# Project Details Page Redesign

## Goal

Redesign `/admin/clients/[clientId]/projects/[projectId]` to mirror the reference UI:
1. **Project details card** at top — title, description, status badge, dates, team lead, client
2. **Tab navigation** — Task Board | Timeline | Files
3. **4-column kanban** — To do | In progress | Review | Completed
4. **Rich task cards** — title, assignee, date, tag/category, overdue badge

## Approach

Since we have only 3 statuses (todo, in_progress, done) and no description/assignee fields on projects, we'll:
- Add "Review" column in kanban (grouped with in_progress for now — no review status exists)
- Show project info from clients table (description, color)
- Map "done" → "Completed", "in_progress" → "In progress"
- Use task.due_date/posting_date for date display on cards
- Add overdue detection to kanban cards

## Files to Modify

1. `app/admin/clients/[clientId]/projects/[projectId]/page.tsx` — Full rewrite of header/details section
2. `components/admin/kanban-board.tsx` — Add Review column, update layout
3. `components/admin/kanban-card.tsx` — Richer card design with assignee, dates, tags, overdue
4. `app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx` — Add tab component

## What We DON'T Change

- Database schema (no new fields)
- Actions/queries
- Existing task-create flow
