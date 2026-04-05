# Phase 09: Task Management & Kanban Improvements - Research

**Phase:** 09
**Gathered:** 2026-04-05
**Mode:** Autonomous workflow

## Domain: What do I need to know to PLAN this phase well?

### Current State Analysis

**Kanban Board (components/admin/kanban-board.tsx)**
- Uses @dnd-kit/core and @dnd-kit/sortable for drag-and-drop
- Three columns: todo, in_progress, done
- `KanbanCard` component renders each task
- Currently links to `/admin/clients/[clientId]/projects/[projectId]/tasks/[taskId]` for editing
- No inline editing capability

**KanbanCard (components/admin/kanban-card.tsx)**
- Displays: status dot, posting_date, assigned_to_username, title
- Uses `ContentCard` with variant="kanban"
- Click triggers navigation via `<Link>` — no inline editing

**TaskList (components/admin/task-list.tsx)**
- Table row with `<DropdownMenu>` for actions (Edit, Delete)
- Dropdown trigger is `<Button size="icon" variant="ghost">` with `<MoreHorizontal>` icon
- Only the button is clickable — clicking the row itself does NOT open dropdown

**TaskRow type (task-view-toggle.tsx:22-35)**
```typescript
type TaskRow = {
  id: string
  title: string
  briefing: string | null
  caption: string | null
  design_file_path: string | null
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
  assigned_to_name: string | null
  assigned_to_username: string | null
}
```

**TaskCreateForm (components/admin/task-create-form.tsx)**
- Uses `<Dialog>` from ui/dialog
- Fields: title, briefing, caption, design_file_path, posting_date, deadline
- No posting_time field

### Required Changes

**1. TASK-01 & TASK-02: Inline Kanban Editing**
- Convert KanbanCard click from navigation to inline edit mode
- Use a dialog or inline form overlay on the board
- Fields to edit: title, dates, status, assignee
- Must NOT break drag-and-drop functionality
- Design: dialog overlay preserving board context

**2. TASK-03: Task Row Dropdown Expand Area**
- Make entire `<TableRow>` clickable to open dropdown
- Currently only `<DropdownMenuTrigger>` button triggers it
- Need to add click handler on `<TableRow>` itself
- Maintain existing Edit/Delete actions

**3. TASK-04: Task Details Dialog Redesign**
- Create a new dialog/drawer component for task details
- Display all fields: title, briefing, caption, posting_date, due_date, deadline, status, assignee
- Modern aesthetic per UI theme (Phase 12 design system)
- Should be reusable across list view and kanban

**4. TASK-05: Image Previewer Fix**
- Design file path stored as `design_file_path: string | null`
- Need to find image preview component
- Issue: "loads correctly on page reload, uses proper preview mode"
- Likely need Supabase Storage signed URL with size parameter

**5. TASK-06: Posting Time Field**
- Database: Add `posting_time` column to tasks table (default 10:00 AM)
- UI: Add time picker in task create and task edit forms
- Display: Show time alongside posting_date in kanban card

### Validation Architecture

**Schema Changes**
- New column: `posting_time` on tasks table (TIME type, nullable, default '10:00:00')

**Inline Edit Implementation**
- Dialog component for editing without navigation
- Must integrate with existing form components

**Dropdown Expand**
- CSS/HTML changes only — no database impact

## Technical Considerations

### Dependencies
- @dnd-kit/core, @dnd-kit/sortable (existing)
- Supabase client for storage URLs
- Existing Dialog component from ui/dialog

### Potential Challenges
1. Inline editing must not interfere with drag-and-drop — use pointer events wisely
2. Image preview requires understanding current Supabase Storage setup
3. Database migration for posting_time column needed

### File Patterns Detected
- components/admin/kanban-*.tsx
- components/admin/task-*.tsx
- lib/portal/queries.ts
- app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx

---

*Research complete*
