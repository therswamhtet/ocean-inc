---
phase: quick-task-creation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/admin/tasks/all-tasks.tsx
  - components/admin/quick-task-dialog.tsx
autonomous: true
requirements: []
---

<objective>
Add quick task creation to the All Tasks view with fast client/project selection via a dialog.
</objective>

<context>
@app/admin/tasks/all-tasks.tsx
@components/admin/task-create-form.tsx
@app/admin/clients/[clientId]/projects/[projectId]/actions.ts
@components/ui/dialog.tsx
@lib/labels.ts
</context>

<interfaces>
From actions.ts:
```typescript
export async function createTaskAction(
  projectId: string,
  data: TaskFormData,
  assignedToTeamMemberId?: string | null
): Promise<MutationResult>
```

From task-create-form.tsx:
```typescript
type TaskFormData = {
  title: string
  briefing?: string
  caption?: string
  postingDate?: string
  dueDate?: string
  deadline?: string
  status: 'todo' | 'in_progress' | 'done'
  designFilePath?: string
}
```

Available UI components: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, Select/SelectContent/SelectItem/SelectTrigger/SelectValue, Button, Input, Field, FieldLabel
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create QuickTaskDialog component</name>
  <files>components/admin/quick-task-dialog.tsx</files>
  <action>
    Create a new 'use client' component `QuickTaskDialog` that:

    1. Uses `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@/components/ui/dialog`
    2. Fetches clients on mount from `/admin/clients/page.tsx` pattern using service role client
    3. Fetches projects when a client is selected (filter by client_id)
    4. Renders:
       - A "Quick Add Task" button (using the pattern from other dialog triggers)
       - A dialog with:
         - Client Select dropdown (populated from clients query)
         - Project Select dropdown (populated from projects query filtered by selected client_id, disabled until client selected)
         - Title Input field (required)
         - Cancel and Create buttons
    5. On submit, calls `createTaskAction(projectId, { title, status: 'todo' })`
    6. On success: closes dialog, shows brief success feedback, calls `router.refresh()`
    7. On error: shows error message in the dialog

    Use existing `createTaskAction` from `@/app/admin/clients/[clientId]/projects/[projectId]/actions`
    Use `useRouter` from `next/navigation` for refresh
    Use `useTransition` for async state
  </action>
  <verify>
    <automated>grep -l "QuickTaskDialog" components/admin/quick-task-dialog.tsx && grep -l "createTaskAction" components/admin/quick-task-dialog.tsx</automated>
  </verify>
  <done>QuickTaskDialog component exists, accepts onSuccess prop, creates task via createTaskAction</done>
</task>

<task type="auto">
  <name>Task 2: Add QuickTaskDialog to AllTasks header</name>
  <files>app/admin/tasks/all-tasks.tsx</files>
  <action>
    Modify `AllTasks` component in `all-tasks.tsx`:

    1. Import `QuickTaskDialog` from `@/components/admin/quick-task-dialog`
    2. In the Header section (around line 247-258), add `QuickTaskDialog` after the description paragraph
    3. Pass `router.refresh` as the `onSuccess` prop to trigger task list refresh after creation

    The button should appear inline with the header content, styled consistently with the existing UI.
  </action>
  <verify>
    <automated>grep -c "QuickTaskDialog" app/admin/tasks/all-tasks.tsx</automated>
  </verify>
  <done>Quick Add Task button visible in All Tasks header, dialog opens on click</done>
</task>

</tasks>

<verification>
- [ ] QuickTaskDialog component compiles without errors
- [ ] AllTasks imports and renders QuickTaskDialog
- [ ] Dialog opens when button is clicked
- [ ] Client dropdown populates with clients
- [ ] Project dropdown populates when client selected
- [ ] Task creates successfully with valid client/project/title
</verification>

<success_criteria>
- User can open quick add dialog from All Tasks view
- User can select a client and project
- User can enter a task title and create it
- After creation, the new task appears in the list (via router.refresh)
</success_criteria>

<output>
After completion, create `.planning/quick/260405-kwd-add-quick-task-creation-feature-to-all-t/{phase}-01-SUMMARY.md`
</output>
