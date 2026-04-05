---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/admin/clients/actions.ts
  - components/admin/quick-task-dialog.tsx
  - app/admin/tasks/all-tasks.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - QuickTaskDialog uses server actions for fetching clients/projects
    - Quick Add Task button positioned in action bar above task sections
  artifacts:
    - path: app/admin/clients/actions.ts
      provides: Server actions for fetching clients and projects
    - path: components/admin/quick-task-dialog.tsx
      provides: Quick task creation dialog
    - path: app/admin/tasks/all-tasks.tsx
      provides: Task list view with properly positioned action button
---

<objective>
Fix QuickTaskDialog to use server actions instead of client-side Supabase queries, and fix button positioning in all-tasks.tsx.
</objective>

<context>
@components/admin/quick-task-dialog.tsx
@app/admin/tasks/all-tasks.tsx
@app/admin/clients/actions.ts
@lib/supabase/server.ts
</context>

<interfaces>
From app/admin/clients/actions.ts (after changes):
```typescript
// New server actions to add:
export async function getClientsAction(): Promise<{ success: true; clients: Client[] } | { success: false; error: string }>
export async function getProjectsAction(clientId: string): Promise<{ success: true; projects: Project[] } | { success: false; error: string }>
```

Where Client = { id: string; name: string; color: string }
Where Project = { id: string; name: string; month: string; year: number }
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add server actions for clients and projects</name>
  <files>app/admin/clients/actions.ts</files>
  <action>
    Add two new exported server actions to app/admin/clients/actions.ts:

    1. `getClientsAction()` - Fetches all clients ordered by name. Returns { success: true, clients: Client[] } or { success: false, error: string }.

    2. `getProjectsAction(clientId: string)` - Fetches active projects for a client, ordered by year desc, month desc. Returns { success: true, projects: Project[] } or { success: false, error: string }.

    Both actions must:
    - Use `createClient()` from @/lib/supabase/server (not the browser client)
    - Check authentication via getUser() and redirect to /login if not authenticated
    - Use proper TypeScript types for return values
  </action>
  <verify>
    <automated>grep -n "getClientsAction\|getProjectsAction" app/admin/clients/actions.ts</automated>
  </verify>
  <done>Server actions for fetching clients and projects exist in actions.ts</done>
</task>

<task type="auto">
  <name>Task 2: Update QuickTaskDialog to use server actions</name>
  <files>components/admin/quick-task-dialog.tsx</files>
  <action>
    Rewrite QuickTaskDialog to use server actions instead of client-side Supabase queries:

    1. REMOVE: useEffect that fetches clients using `createClient()` from @/lib/supabase/client
    2. REMOVE: useEffect that fetches projects using `createClient()` from @/lib/supabase/client
    3. REMOVE: import of `createClient` from @/lib/supabase/client
    4. ADD: Import `getClientsAction` and `getProjectsAction` from @/app/admin/clients/actions

    5. REPLACE client fetching with server action call:
       - Change `useEffect` fetching clients to call `getClientsAction()` via startTransition
       - Set clients state from the returned data

    6. REPLACE project fetching with server action call:
       - Change `useEffect` fetching projects to call `getProjectsAction(selectedClientId)` via startTransition
       - Set projects state from the returned data

    Keep all existing form logic, styling, and submission behavior intact.
  </action>
  <verify>
    <automated>grep -n "useEffect\|createClient" components/admin/quick-task-dialog.tsx | grep -v "supabase/client" || echo "No client-side supabase queries remain"</automated>
  </verify>
  <done>QuickTaskDialog fetches clients and projects via server actions, not client-side Supabase</done>
</task>

<task type="auto">
  <name>Task 3: Move Quick Add Task button to action bar</name>
  <files>app/admin/tasks/all-tasks.tsx</files>
  <action>
    Move the QuickTaskDialog button from inside the header text section to a proper action/toolbar bar above the task sections:

    1. REMOVE QuickTaskDialog from inside the header div (lines 251-259)
    2. ADD a new action bar section BEFORE the "Compact Task Sections" div (before line 262):
    
    ```tsx
    {/* Action Bar */}
    <div className="flex items-center justify-between">
      <div />
      <QuickTaskDialog />
    </div>
    ```

    The header section should only contain text descriptions. The button belongs in a toolbar above the task list.
  </action>
  <verify>
    <automated>grep -n "Action Bar\|flex items-center justify-between" app/admin/tasks/all-tasks.tsx</automated>
  </verify>
  <done>Quick Add Task button positioned in action bar above task sections, not in header text</done>
</task>

</tasks>

<verification>
- QuickTaskDialog imports from @/app/admin/clients/actions (not @/lib/supabase/client)
- No useEffect with supabase.from() calls remain in QuickTaskDialog
- QuickTaskDialog button renders in action bar before task sections
</verification>

<success_criteria>
1. QuickTaskDialog uses getClientsAction and getProjectsAction server actions
2. QuickTaskDialog no longer imports createClient from @/lib/supabase/client
3. Quick Add Task button appears in a toolbar above the task list, not in the header text area
</success_criteria>

<output>
After completion, create `.planning/quick/260405-l35-fix-quicktaskdialog-use-server-actions-f/SUMMARY.md`
</output>
