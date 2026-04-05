---
phase: quick
plan: "260405-kio"
type: execute
wave: 1
depends_on: []
files_modified:
  - app/admin/tasks/all-tasks.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - Task dropdown shows single-line layout without Due Date column
    - Expanded panel shows only Assigned To, Posting Date, Content Plan fields
    - Status colors render correctly (yellow for in_progress per globals.css)
  artifacts:
    - path: app/admin/tasks/all-tasks.tsx
      provides: Fixed TaskDetailPanel and TaskListView
  key_links:
    - from: TaskListView task row
      to: TaskDetailPanel expanded view
      via: expanded state toggle
---

<objective>
Fix the task dropdown in AllTasks component: remove Due Date column from list view and Due Date/Deadline section from expanded panel, fix alignment to single-line layout, ensure status colors match CSS variables.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
From app/admin/tasks/all-tasks.tsx:
- TaskListView (lines 178-279): Renders task rows with columns: toggle, status dot, title, Content Plan/Month, Client Name, Project Name, Due Date, Assignment
- TaskDetailPanel (lines 55-176): Expanded panel showing task details in 2-column grid with header, then Due Date & Deadline separate row

From components/ui/status-dot.tsx:
- StatusDot renders status colors using: `bg-status-todo`, `bg-status-in-progress`, `bg-status-done`, `bg-status-overdue`

From app/globals.css:
- --color-status-in-progress: #facc15 (yellow)
- --color-status-done: #22c55e (green)
- --color-status-overdue: #ef4444 (red)
- --color-status-todo: #d1d5db (gray)
</context>

<tasks>

<task type="auto">
  <name>Fix task dropdown layout and remove Due Date</name>
  <files>app/admin/tasks/all-tasks.tsx</files>
  <action>
    In TaskListView component:
    1. Remove Due Date column from task row (lines 257-260) - delete the entire span element
    2. Adjust Assignment column width from `w-24` to `w-28` to fill space

    In TaskDetailPanel component:
    1. Remove the entire "Due Date & Deadline - Separate Row with Separator" section (lines 137-163)
    2. Keep the 2-column grid with Assigned To, Posting Date, Content Plan fields only
    3. Remove the border-t border on the grid container (line 138) since we're removing the separate row below it
    4. Add single-line layout: reduce gap-y from 3 to 2, adjust padding for tighter spacing
  </action>
  <verify>
    <automated>grep -n "due_date\|Due Date\|w-24" app/admin/tasks/all-tasks.tsx | head -20</automated>
  </verify>
  <done>
    Due Date column removed from list view, Due Date/Deadline section removed from expanded panel, layout is compact single-line, no due_date references remain in the UI
  </done>
</task>

</tasks>

<verification>
- Due Date column no longer appears in TaskListView rows
- TaskDetailPanel expanded view shows only 3 fields (Assigned To, Posting Date, Content Plan) in 2-column grid
- No broken layout or missing elements
</verification>

<success_criteria>
- No "due_date" display in either list view columns or expanded panel
- TaskDetailPanel maintains 2-column grid layout without extra row
- grep confirms no remaining due_date references in UI elements
</success_criteria>

<output>
After completion, create `.planning/quick/260405-kio-fix-task-dropdown-remove-due-date-single/SUMMARY.md`
</output>
