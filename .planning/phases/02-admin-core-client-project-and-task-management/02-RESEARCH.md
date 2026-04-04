# Phase 02: Admin Core — Client, Project, and Task Management - Research

**Researched:** 2026-04-04
**Domain:** Next.js 16 (App Router + Server Actions), Supabase CRUD, shadcn/ui admin dashboards, dnd-kit kanban, Supabase Storage file upload
**Confidence:** HIGH

## Summary

This phase delivers full admin CRUD for clients, projects, tasks, and team members, plus dashboard metrics and file upload. The codebase already has a working foundation from Phase 1: database schema (8 tables with RLS), Supabase SSR auth (three-client pattern), admin layout with auth guard, and login/invite registration flows.

**Primary recommendation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for kanban (lightweight, no heavy dependencies), `react-hook-form` v7 + `@hookform/resolvers/zod` + `zod` v4 for complex forms, and server actions with `revalidatePath()` for all mutations. File uploads happen client-side via `@supabase/ssr` browser client with `upsert: true` (D-11: upload immediately, store path on form submit). Install shadcn/ui components: button, input, label, dialog, dropdown-menu, table, badge, select, textarea, card, tabs, scroll-area, toast, popover, field.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Persistent sidebar navigation (not top tabs). Always visible on desktop, collapses to hamburger on mobile.
- **D-02:** Three top-level nav items: Dashboard, Clients, Team Members. Projects and Tasks are sub-pages accessed within Clients (client → project list → task list).
- **D-03:** Toggle buttons (List | Kanban) at top of task list within a project. Default to list view.
- **D-04:** List view shows compact columns: title, status dot, posting date, assigned-to name, due date.
- **D-05:** Kanban view uses 3 columns (todo, in_progress, done). Overdue is a visual flag — red pulsing status dot on tasks where `posting_date < today AND status != 'done'`. Not a separate column.
- **D-06:** Team list shows per member: name, email, task count (assigned tasks), joined date.
- **D-07:** Invite flow is inline on the team page: admin enters email → token generated → invite link shown with a copy button. Admin shares link manually (WhatsApp, Slack, etc.). No email service.
- **D-08:** 4 metric cards in a row: Active Projects, In Progress, Overdue, Completed This Month. Simple numbers, no charts.
- **D-09:** Recent 5 notifications list below the metric cards. Click a notification to mark as read. "View all" link to full notifications page.
- **D-10:** Click-to-upload button + drag-and-drop zone. Shows file name and size after selection.
- **D-11:** File uploads immediately when selected/dropped (not on form submit). Shows progress bar during upload. File path stored on task after form submit.
- **D-12:** When editing a task with an existing file, show current file name + download link + "Replace" button.
- **D-13:** `posting_date < today AND status != 'done'` — computed at render time, not stored in DB. Dashboard overdue count uses same logic.

### Claude's Discretion

- Exact sidebar styling (width, icon choices from lucide-react, active state styling)
- Kanban card layout (what fields on the card face)
- Mobile behavior for drag-and-drop upload zone (falls back to click-to-upload)
- Form layout patterns (which fields are inline vs full-width, section grouping)
- Dashboard card styling (border, padding, exact typography)
- Error handling patterns for file upload failures

### Deferred Ideas (OUT OF SCOPE)

- v2 task sorting/filtering — mentioned during task views discussion, belongs in a future enhancement phase
- v2 features already in REQUIREMENTS.md (content review, team member comments, reassign tasks) — not deferred, already scoped to v2

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Admin can create a client (name only, auto-generates unique slug) | Server action with `crypto.randomBytes` slug, UNIQUE constraint upsert handling |
| ADMIN-02 | Admin can view list of all clients with active project count | Supabase count query with LEFT JOIN projects, or subquery SELECT COUNT |
| ADMIN-03 | Admin can view a client's project list | RSC with nested route `admin/clients/[clientId]/projects/` |
| ADMIN-04 | Admin can create a project (name, month, year, status) | Server action with zod validation, `revalidatePath()` for client page |
| ADMIN-05 | Admin dashboard shows metrics: active projects, in progress, overdue, completed this month | Supabase aggregate queries, overdue = `posting_date < today AND status != 'done'` |
| ADMIN-06 | Admin can create a task (title, briefing, caption, design file, posting date, due date, deadline, status) | react-hook-form + zod resolver, two-step: client upload then DB insert |
| ADMIN-07 | Admin can view project tasks in list view and kanban view | List: HTML table with compact columns. Kanban: @dnd-kit DndContext with SortableContext |
| ADMIN-08 | Admin can edit all task fields including title, briefing, caption, dates, status | react-hook-form pre-populated, zod validation, server action update |
| ADMIN-09 | Admin can assign a task to a team member via dropdown | `<select>` with team members list, server action INSERT/DELETE into task_assignments |
| ADMIN-10 | Admin task detail page shows all fields with full edit capability | Full form layout with all fields, file replace (D-12), assignment dropdown |
| ADMIN-11 | Briefing text renders URLs as clickable anchor tags | `linkify` regex or `<a href>` detection component, no external lib needed |
| ADMIN-12 | Design file upload uses Supabase Storage with download capability | Client-side upload via browser client, `createSignedUrl` for download (bucket is private) |
| ADMIN-13 | Caption field shows a "Copy" button (clipboard copy) | `navigator.clipboard.writeText()` with toast feedback |
| ADMIN-14 | Admin can manage team members: view list, task counts per member, invite new members by email | RSC query with subquery COUNT, server action generates 32-char random token, 7-day expiry |
| UI-06 | Overdue detection: `posting_date < today AND status != 'done'` | Computed in JS with `date-fns`, not stored in DB (D-13) |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop context for kanban | Lightweight, zero dependencies beyond React. `DndContext` + `useSensor` + PointerSensor. No react-beautiful-dnd (abandoned, breaks with React 19). |
| @dnd-kit/sortable | ^10.0.0 | Sortable columns and cards within kanban | First-party companion to @dnd-kit/core. `SortableContext` per column with `verticalListSortingStrategy`. `useSortable` hook gives transform/transition for smooth reordering. |
| @dnd-kit/utilities | ^3.2.2 | CSS transform helpers | Needed for `CSS.Transform.toString(transform)` in sortable cards. |
| react-hook-form | ^7.72.2 | Form state for task/project creation | Already installed. Best-in-class React form performance. Client-side only (`'use client'`). |
| @hookform/resolvers | ^5.2.2 | Connect zod to react-hook-form | Already installed. `/zod` subpath export compatible with zod v4 (verified at runtime). |
| zod | 4.3.6 | Schema validation for server actions + forms | Already installed. v4 API: `z.object()`, `z.string()`, `z.number()`, `z.optional()` all work the same as v3. `.parse()` behavior identical. Verified compatibility with `@hookform/resolvers/zod` v5.2.2. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^1.7.0 | Icons (sidebar, copy, download, status) | Already installed. Use everywhere icons are needed. |
| date-fns | ^4.1.0 | Date formatting, overdue detection, relative dates | Already installed. Use `format()`, `formatDistanceToNow()`, `isPast()`, `isToday()` for Kanban and dashboard. |
| @supabase/ssr | ^0.10.0 | Browser client for file upload | Already installed. `createBrowserClient()` for client-side upload with progress tracking. |
| sonner | latest (from shadcn) | Toast notifications | For upload success/failure, copy-to-clipboard feedback, form submission results. Install via `npx shadcn@latest add toast`. |

### shadcn/ui Components to Install

```bash
npx shadcn@latest add button input label textarea select dialog dropdown-menu table badge select card tabs scroll-area toast popover field
```

| Component | Where Used |
|-----------|------------|
| button (already available via shadcn) | Sidebar nav items, form submit, copy-to-clipboard, file replace |
| input | Client name field, project name field, team member invite email |
| label | Field labels in all forms |
| label (field group) | Group label/field/error with shadcn field components |
| textarea | Caption field (multi-line), briefing field |
| select | Status dropdown (todo/in_progress/done), team member assignment |
| dialog | Task create/edit modal, project create, client create |
| dropdown-menu | Row action menus (edit/delete for clients, projects, tasks) |
| table | Task list view (List view toggle from D-03) |
| badge | Status badges, project status badges |
| card | Dashboard metric cards, kanban column containers |
| tabs | Not needed - use simple List | Kanban toggle buttons instead |
| scroll-area | Kanban board horizontal scroll, long lists |
| toast | File upload success/error, copy feedback, form results |
| popover | Date picker for posting/due dates (if shadcn calendar installed) |
| field | Field wrapper with label, field, and error message for shadcn form pattern |

> NOTE: shadcn is already initialized (`components.json` exists with rsc: true). Components are added individually. Only `status-dot.tsx` is currently in `components/ui/`.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core | @hello-pangea/dnd (react-beautiful-dnd fork) | @hello-pangea/dnd has nicer default animations but heavier. dnd-kit is 2x smaller, works with React 19, and gives us everything for a 3-column kanban. |
| @dnd-kit/core | react-dnd | react-dnd is overkill for simple kanban. Designed for complex drag-drop (file explorer, multi-type drops). Much higher learning curve. |
| Table + manual rows | @tanstack/react-table + shadcn DataTable | @tanstack/react-table adds sorting/filtering/pagination we don't need in admin task list. Simple HTML table is sufficient for ADMIN-07 (list view). Defer to v2 if sorting needed. |
| react-hook-form | Plain `<form>` with `formData.get()` (Phase 1 pattern) | Phase 1 used plain forms. Task creation has 8+ fields with file upload — react-hook-form provides real-time validation, pre-population for edit, and cleaner state management. Use react-hook-form for task forms, plain forms for simple create (client, project). |

### Installation

```bash
# Drag and drop for kanban
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# shadcn/ui components for admin dashboard
npx shadcn@latest add button input label textarea select dialog dropdown-menu table badge card scroll-area toast field

# (zod, react-hook-form, @hookform/resolvers, date-fns, lucide-react are already in package.json)
```

### Version Verification

| Package | Installed Version | Latest on npm | Notes |
|---------|-------------------|---------------|-------|
| @dnd-kit/core | not installed | 6.3.1 | Will install |
| @dnd-kit/sortable | not installed | 10.0.0 | Will install |
| @dnd-kit/utilities | not installed | 3.2.2 | Will install |
| zod | 4.3.6 | 4.3.6 | Current |
| @hookform/resolvers | 5.2.2 | 5.2.2 | Current, zod v4 compatible |
| react-hook-form | 7.72.1 | 7.72.2+ | Current |
| date-fns | 4.1.0 | 4.1.0 | Current |
| lucide-react | 1.7.0 | 1.7.0+ | Current |

## Architecture Patterns

### Recommended Project Structure

```
app/admin/
  layout.tsx                          # Update: add sidebar here
  page.tsx                            # Dashboard with metric cards + recent notifications
  actions.ts                          # Dashboard server actions (metrics, notifications)

  clients/
    page.tsx                          # Client list with project counts
    actions.ts                        # Client create/delete server actions
    create-dialog.tsx                 # Client creation form (inline or dialog)

    [clientId]/
      page.tsx                        # Redirect to first project or project list
      actions.ts                      # Project create/delete for specific client

      projects/
        page.tsx                      # Wait — D-02 says projects accessed within clients
        [projectId]/
          page.tsx                    # Project tasks page (list/kanban toggle)
          actions.ts                  # Task create/update/delete, assignment

          tasks/
            [taskId]/
              page.tsx                # Task detail with full edit

  team/
    page.tsx                          # Team member list with task counts, inline invite
    actions.ts                        # Team member invite generation

  layout.tsx                          # Update existing to add sidebar navigation
```

**Route structure rationale:** D-02 specifies "Three top-level nav items: Dashboard, Clients, Team Members. Projects and Tasks are sub-pages accessed within Clients." This means:

- `/admin` → Dashboard (D-08, D-09)
- `/admin/clients` → Client list (ADMIN-02)
- `/admin/clients/[clientId]` → Client detail / project list (ADMIN-03)
- `/admin/clients/[clientId]/projects/[projectId]` → Task list for project (ADMIN-07)
- `/admin/clients/[clientId]/projects/[projectId]/tasks/[taskId]` → Task detail (ADMIN-10)
- `/admin/team` → Team member management (ADMIN-14)

### Pattern 1: Server Actions with Zod Validation

**What:** All CRUD mutations use `'use server'` functions with zod input validation.

**Example — create client:**

```typescript
// app/admin/clients/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import crypto from 'node:crypto'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  if (!name || name.trim().length < 2) {
    return { error: 'Client name must be at least 2 characters' }
  }

  const slug = crypto.randomBytes(8).toString('hex') // 16-char unique slug

  const { error } = await supabase
    .from('clients')
    .insert({ name: name.trim(), slug })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}
```

**Example — create task with react-hook-form:**

```typescript
// app/admin/clients/[clientId]/projects/[projectId]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  briefing: z.string().optional(),
  caption: z.string().optional(),
  postingDate: z.string().optional(),
  dueDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  designFilePath: z.string().optional(),
})

export async function createTask(
  projectId: string,
  data: typeof taskSchema._output,
  assignedToTeamMemberId?: string | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title: parsed.data.title,
      briefing: parsed.data.briefing || null,
      caption: parsed.data.caption || null,
      posting_date: parsed.data.postingDate || null,
      due_date: parsed.data.dueDate || null,
      deadline: parsed.data.deadline || null,
      status: parsed.data.status,
      design_file_path: parsed.data.designFilePath || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  if (assignedToTeamMemberId && task) {
    await supabase.from('task_assignments').insert({
      task_id: task.id,
      team_member_id: assignedToTeamMemberId,
    })
  }

  revalidatePath(`/admin/clients/*/projects/${projectId}`)
  revalidatePath(`/admin/clients/*/projects/${projectId}/tasks/${task.id}`)
  return { success: true, task }
}
```

### Pattern 2: Client-Side File Upload with Progress

**What:** Upload happens in `'use client'` component via browser client. Immediate upload (D-11), file path stored after form submit.

```typescript
// components/admin/design-file-uploader.tsx (client component)
'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadState {
  uploading: boolean
  progress: number // 0-100
  fileName: string
  filePath: string
  error: string | null
}

export function DesignFileUploader({
  projectId,
  taskId,
  onUploadComplete,
}: {
  projectId: string
  taskId: string | null // null during creation — file stored temporarily
  onUploadComplete: (filePath: string) => void
}) {
  const [state, setState] = useState<UploadState>({
    uploading: false, progress: 0, fileName: '', filePath: '', error: null,
  })

  const handleFile = useCallback(async (file: File) => {
    // Validate: images only, 10MB max (storage bucket enforces, but check client-side)
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setState(s => ({ ...s, error: 'Only image files under 10MB' }))
      return
    }

    // For new tasks (no taskId yet), use a temporary path
    const tempId = taskId || crypto.randomUUID()
    const path = `${projectId}/${tempId}/${file.name}`

    const supabase = createClient()
    setState({ uploading: true, progress: 0, fileName: file.name, filePath: '', error: null })

    // @supabase/ssr browser client upload (no progress events in supabase-js v2,
    // so we use setTimeout polling or XMLHttpRequest approach)
    // Best approach: upload directly with put() and show indeterminate progress
    const { error } = await supabase.storage
      .from('design-files')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      setState(s => ({ ...s, uploading: false, error: error.message }))
      return
    }

    setState(s => ({ ...s, uploading: false, progress: 100, filePath: path }))
    onUploadComplete(path)
  }, [projectId, taskId, onUploadComplete])

  // D-10: drop zone + click-to-upload
  return (
    <div
      className="border-2 border-dashed border-border rounded-sm p-8 text-center cursor-pointer"
      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {state.uploading ? (
        <div>
          <div className="h-2 bg-muted rounded-sm overflow-hidden">
            <div className="h-full bg-foreground transition-all" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="text-sm mt-2 text-muted-foreground">Uploading {state.fileName}...</p>
        </div>
      ) : state.filePath ? (
        <p className="text-sm">Uploaded: {state.fullName}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Click or drop to upload design file (PNG, JPG, GIF, WebP, max 10MB)</p>
      )}
      {state.error && <p className="text-sm text-red-500 mt-2">{state.error}</p>}
    </div>
  )
}
```

> **Important limitation:** `@supabase/supabase-js` v2 does NOT support upload progress callbacks. The `upload()` method returns a Promise with no intermediate progress events. Two workarounds:
> 1. **Indeterminate progress bar:** Show animated/indeterminate progress during upload (commonly used with Supabase).
> 2. **XMLHttpRequest approach:** Manually call the Supabase Storage REST API with XMLHttpRequest to get native `upload.progress` events. This is the only way to get true percentage-based progress.
>
> The supabase-js v3 preview does include `signal` and `abort` support, but v2 (which is installed at 2.101.1) does not have this. Given the small file sizes (10MB max), an indeterminate progress bar is acceptable and matches the D-11 "Shows progress bar during upload" requirement.

For true progress bar with percentage, use the REST API with XMLHttpRequest:

```typescript
const uploadWithProgress = (
  file: File,
  path: string,
  token: string,
  onProgress: (pct: number) => void
): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/design-files/${path}`
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('apiKey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('x-upsert', 'true')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      const result = JSON.parse(xhr.responseText)
      if (xhr.status >= 400) reject(result.error || result.message)
      else resolve(path)
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })
```

> The token can be obtained via `supabase.auth.getSession()` from the browser client. This is the standard pattern when true upload progress is required.

### Pattern 3: Kanban Board with @dnd-kit

**What:** 3-column kanban (todo, in_progress, done) with draggable cards. Drag moves tasks between columns (updates status) and reorders within columns.

```typescript
// components/admin/kanban-board.tsx ('use client')
'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatusDot } from '@/components/ui/status-dot'

// Kanban column IDs
const COLUMNS = ['todo', 'in_progress', 'done'] as const
type ColumnId = (typeof COLUMNS)[number]

interface TaskCard {
  id: string
  title: string
  status: ColumnId
  postingDate: string | null
  assignedTo: string | null
  isOverdue: boolean
}

function KanbanCard({ task }: { task: TaskCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border border-border rounded-sm p-3 bg-background cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={task.isOverdue ? 'overdue' : task.status} />
        <span className="text-sm font-medium truncate">{task.title}</span>
      </div>
      {task.postingDate && (
        <p className="text-xs text-muted-foreground">{task.postingDate}</p>
      )}
      {task.assignedTo && (
        <p className="text-xs text-muted-foreground mt-1">{task.assignedTo}</p>
      )}
    </div>
  )
}

export function KanbanBoard({
  tasks,
  onStatusChange,
}: {
  tasks: TaskCard[]
  onStatusChange: (taskId: string, newStatus: ColumnId, newOrder: TaskCard[]) => void
}) {
  const [columns, setColumns] = useState<Record<ColumnId, TaskCard[]>>(() => {
    const cols: Record<string, TaskCard[]> = { todo: [], in_progress: [], done: [] }
    for (const task of tasks) cols[task.status].push(task)
    return cols as Record<ColumnId, TaskCard[]>
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !columns) return
    // Determine which column the item was dropped into
    // Update task status and reorder using arrayMove
    // Revalidate path on server after drag completes
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((colId) => (
          <div key={colId} className="min-h-[400px]">
            <h3 className="text-sm font-medium mb-3 capitalize">
              {colId.replace('_', ' ')}
            </h3>
            <SortableContext
              items={columns[colId].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {columns[colId].map((task) => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  )
}
```

**Optimistic update pattern:** On `handleDragEnd`, immediately update local state with the new task status/order, then fire a server action to persist the change. If the server action fails, roll back the local state.

### Pattern 4: Dashboard Metrics with Supabase

**What:** 4 aggregation queries run in parallel on the dashboard RSC.

```typescript
// app/admin/page.tsx (RSC - server component)
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

  // Parallel queries for performance
  const [
    { count: activeProjects },
    { count: inProgress },
    { count: overdue },
    { count: completedThisMonth },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('posting_date', today)
      .neq('status', 'done'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .gte('updated_at', monthStart),
  ])

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard label="Active Projects" value={activeProjects || 0} />
      <MetricCard label="In Progress" value={inProgress || 0} />
      <MetricCard label="Overdue" value={overdue || 0} variant="warning" />
      <MetricCard label="Completed This Month" value={completedThisMonth || 0} />
      {/* Recent 5 notifications below */}
    </div>
  )
}
```

### Pattern 5: Invite Token Generation

**What:** Server action generates 32-char hex token with 7-day expiry (from Phase 1 decisions).

```typescript
// app/admin/team/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import crypto from 'node:crypto'

export async function generateInviteToken(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const token = crypto.randomBytes(16).toString('hex') // 32 characters
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('invite_tokens')
    .insert({ token, email, expires_at: expiresAt })

  if (error) return { error: error.message }

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/invite/${token}`
  revalidatePath('/admin/team')
  return { success: true, inviteUrl, token }
}
```

### Pattern 6: Linkifying Briefing Text

**What:** Convert URLs in briefing text to clickable anchor tags without an external library.

```typescript
// lib/utils.ts
export function linkify(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline">$1</a>')
}

// Usage in component
function BriefingText({ text }: { text: string }) {
  if (!text) return null
  return (
    <div
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: linkify(text) }}
    />
  )
}
```

### Pattern 7: Sidebar Navigation (D-01)

**What:** Persistent sidebar in admin layout, updated to replace current basic header layout.

```
Existing: app/admin/layout.tsx (header-only layout)
Update: Add sidebar with three nav links: Dashboard, Clients, Team Members
Mobile: Collapses to hamburger menu (can use shadcn Sheet for mobile nav)
```

### Anti-Patterns to Avoid

- **Don't put file upload in form submit:** D-11 explicitly requires immediate upload. Storing FormData file and uploading on submit means large files block the entire mutation.
- **Don't store overdue as a DB field:** D-13 requires computed overdue at render time. Storing it means stale data and double-maintenance.
- **Don't use @tanstack/react-table for task list:** Adds complexity (columns, rows, state management) for a simple 5-column table. Plain HTML `<table>` or shadcn Table is sufficient.
- **Don't create separate kanban column state:** Keep a flat `TaskCard[]` array and derive columns from `task.status`. Simpler state, less risk of stale data.
- **Don't use server-side drag-and-drop:** dnd-kit needs client-side event handling for drag. Keep kanban as `'use client'` component with optimistic updates via server actions.
- **Don't bypass `revalidatePath()`:** Every mutation must revalidate affected pages. Missing revalidation causes stale dashboards and task lists.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Kanban drag-and-drop | Custom mouse event handlers for drag | @dnd-kit/core + @dnd-kit/sortable | Touch support, keyboard accessibility, collision detection, smooth transition animations — all edge cases that custom implementations miss |
| Form validation | Manual `formData.get()` + if/else for 8+ fields | react-hook-form + zod resolver | Real-time validation, type-safe, pre-population for edit, error messages with field-level accuracy |
| Clipboard copy | Custom text selection hack | `navigator.clipboard.writeText()` | Clean async API, works across all modern browsers |
| Invite token generation | `Math.random().toString(36)` | `crypto.randomBytes(16).toString('hex')` | Cryptographic randomness required for security (already using this in Phase 01) |
| Date formatting | `new Date().toLocaleDateString()` | date-fns `format()` | Deterministic formatting, relative dates (`formatDistanceToNow`), locale support |
| Class name merging | Template literals + ternary | `cn()` from lib/utils | Already built, handles conditional classes cleanly |
| Slug generation | `name.toLowerCase().replace(/ /g, '-')` | `crypto.randomBytes(8).toString('hex')` | DB-06 requires cryptographically random slug; name-based slugs collide and are predictable |

**Key insight:** The task creation form (8+ fields, file upload, validation, assignment) has enough complexity that hand-rolling any part of it (validation, file state, error display) will introduce bugs that the libraries already solve.

## Runtime State Inventory

**Not applicable** — this is a greenfield implementation phase (new features built on existing database schema). No renamed strings or migrated data. The database schema from Phase 1 is the foundation, and this phase adds application code on top of it.

## Environment Availability

### Project Code

| Tool | Available | Version | Notes |
|------|-----------|---------|-------|
| Node.js | Check | — | Runtime required |
| npm | Check | — | Already used for project |

### External Dependencies

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase (DB + Auth + Storage) | All admin CRUD operations | Yes (from Phase 1) | — | No fallback — core infrastructure |
| Supabase browser client | Client-side file upload | Yes (`@supabase/ssr`) | 0.10.0 | Server-side upload (no progress bar) |
| Supabase project URL + anon key | Client-side upload | Check via .env.local | — | No fallback — credentials required |

**Note:** The environment availability check is limited — cannot run `command -v` checks as environment tools are not available for Supabase. The project already ran successfully through Phase 1, confirming the Supabase connection works. The `.env.local` file must contain `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Common Pitfalls

### Pitfall 1: Next.js 16 Server Actions — FormData vs typed arguments

**What goes wrong:** Mixing `FormData`-based server actions (Phase 1 pattern) with typed object arguments (needed for react-hook-form) causes confusion and inconsistent error handling.

**Why it happens:** Phase 1 used `<form action={serverAction}>` with `formData.get()`. react-hook-form calls actions with typed objects, not FormData.

**How to avoid:** Use two patterns:
- **Simple creates** (client, project): React hook form with typed object server actions for consistency, or plain FormData for simplicity.
- **Complex forms** (task): react-hook-form + `useFormAction({ action: createTask })` pattern, or manual `onClick` that calls the typed server action directly.

**Warning signs:** `z.object().parse()` throwing on FormData input (FormData values are strings, not types like `Date` or `boolean`).

### Pitfall 2: Supabase Storage upload with no progress callback

**What goes wrong:** Using `supabase.storage.upload()` without realizing it has no progress events, then the progress bar is a fake indeterminate spinner.

**Why it happens:** `@supabase/supabase-js` v2 does not expose upload progress.

**How to avoid:** Use XMLHttpRequest with the Supabase Storage REST API for true progress tracking. For this project with 10MB max images, an indeterminate progress bar is acceptable. Be honest in the UI: "Uploading..." rather than fake percentage.

**Warning signs:** Progress bar stuck at 0% then jumping to 100%.

### Pitfall 3: `revalidatePath` with dynamic route segments

**What goes wrong:** Calling `revalidatePath('/admin/clients/*/projects/[projectId]')` with literal `*` or `[projectId]` instead of actual values.

**Why it happens:** Developers copy the pattern from docs without replacing route params.

**How to avoid:** Always use actual values: `revalidatePath(`/admin/clients/${clientId}/projects/${projectId}`)`. For client list actions, also revalidate `/admin/clients` and `/admin`.

### Pitfall 4: Kanban drag changes local state but server update fails

**What goes wrong:** User drags card from "todo" to "done", optimistic update shows success, server action fails (RLS, network), but UI doesn't roll back.

**Why it happens:** Optimistic updates without rollback logic.

**How to avoid:** Wrap optimistic update in try/catch. On failure: set local state back to pre-drag state and show error toast. Consider using Next.js `useOptimistic` hook for structured optimistic state management.

### Pitfall 5: File upload before task creation — orphaned files

**What goes wrong:** D-11 requires immediate upload, but taskId doesn't exist yet during creation. Files uploaded with temporary paths may become orphaned if form is abandoned.

**Why it happens:** Two-step flow (upload then DB insert) with no cleanup.

**How to avoid:** Two options:
1. Use `crypto.randomUUID()` as temporary taskId for upload path, then rename the file after task creation via `update()` call.
2. Use a `temp/` folder with a cron job cleanup for files older than 24 hours with no associated task.
3. Upload with a temporary path and rename after task creation using Supabase Storage's `copy` + `remove` pattern.

Recommendation: Option 1 — upload with temp UUID, then use Supabase's `copy()` to move to final path and `remove()` the temp file. This keeps the `{project_id}/{task_id}/{filename}` pattern intact after task creation.

### Pitfall 6: dnd-kit collision detection with multiple columns

**What goes wrong:** Using `closestCenter` collision detection causes cards to snap to wrong columns when dragged near column boundaries.

**Why it happens:** `closestCenter` finds the nearest draggable element, not the nearest droppable container.

**How to avoid:** Use `closestCorners` or `pointerWithin` collision detection for multi-column layouts. For kanban, `closestCorners` works best — it calculates which column's corner points are closest to the dragged item.

### Pitfall 7: zod v4 type inference differences

**What goes wrong:** Zod v4 type inference might differ from v3, particularly for optional fields and enum types.

**Why it happens:** Zod v4 has internal changes to type inference.

**How to avoid:** We verified at runtime that `z.string().optional()` and `z.enum()` work with @hookform/resolvers v5.2.2. Use `z.string().optional()` for nullable string fields and `z.enum(['todo', 'in_progress', 'done'])` for status. The `.safeParse()` return type with `.error.flatten()` gives form-level error objects compatible with react-hook-form.

### Pitfall 8: Overdue tasks counting both in `in_progress` and overdue

**What goes wrong:** A task with `status: 'in_progress'` but `posting_date` in the past shows as both "In Progress" in the metric card AND as overdue with red dot.

**Why it happens:** Overdue is a computed visual flag (red pulse), not a separate status. The dashboard "In Progress" count includes overdue tasks.

**How to avoid:** This is actually the correct behavior per D-05 and D-13. The dashboard "In Progress" card counts `status = 'in_progress'` (regardless of overdue). The overdue card counts `posting_date < today AND status != 'done'` (which includes overdue tasks with status `in_progress` or `todo`). This is intentional — they measure different things. Document this clearly so the user understands the overlap.

## Code Examples

### Linkifying URLs in Briefing Text

```typescript
// lib/utils.ts — add this function
const URL_REGEX = /(https?:\/\/[^\s<]+)/g

export function linkify(text: string): string {
  return text.replace(URL_REGEX, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline">$1</a>')
}
```

### Copy to Clipboard Button

```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </Button>
  )
}
```

### Dashboard Metric Card

```typescript
function MetricCard({ label, value, variant = 'default' }: {
  label: string; value: number; variant?: 'default' | 'warning'
}) {
  return (
    <div className={`border border-border rounded-sm p-4 ${variant === 'warning' ? 'border-l-4 border-l-red-500' : ''}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
```

### Task List View (List mode)

```typescript
// D-04: compact columns — title, status dot, posting date, assigned-to, due date
<table className="w-full">
  <thead>
    <tr className="border-b border-border">
      <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Title</th>
      <th className="py-2 px-3 text-sm font-medium text-muted-foreground">Status</th>
      <th className="py-2 px-3 text-sm font-medium text-muted-foreground">Posting Date</th>
      <th className="py-2 px-3 text-sm font-medium text-muted-foreground">Assigned To</th>
      <th className="py-2 px-3 text-sm font-medium text-muted-foreground">Due Date</th>
    </tr>
  </thead>
  <tbody>
    {tasks.map((task) => (
      <tr key={task.id} className="border-b border-border hover:bg-muted/50">
        <td className="py-2 px-3 text-sm font-medium">
          <Link href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}>
            {task.title}
          </Link>
        </td>
        <td className="py-2 px-3">
          <StatusDot status={task.isOverdue ? 'overdue' : task.status} />
        </td>
        <td className="py-2 px-3 text-sm text-muted-foreground">
          {formatDate(task.posting_date)}
        </td>
        <td className="py-2 px-3 text-sm text-muted-foreground">
          {task.assigned_to_name || '—'}
        </td>
        <td className="py-2 px-3 text-sm text-muted-foreground">
          {formatDate(task.due_date)}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Invite Token Generation with Inline Display

```typescript
// app/admin/team/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import crypto from 'node:crypto'

export async function createInviteToken(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!email || !email.includes('@')) {
    return { error: 'Valid email required' }
  }

  const token = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('invite_tokens')
    .insert({ token, email, expires_at: expiresAt })

  if (error) return { error: error.message }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  revalidatePath('/admin/team')
  return { success: true, inviteUrl: `${siteUrl}/invite/${token}` }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/core | 2023 (react-beautiful-dnd abandoned) | dnd-kit supports React 18/19, has better mobile touch support, modular architecture |
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 (official deprecation) | Already adopted in Phase 1. Cookie-based session management with three-client pattern |
| API Routes for CRUD | Server Actions | Next.js 14+ | Simpler code — no separate API endpoints needed, type-safe via typed function params |
| `getSession()` for auth | `getUser()` | Security best practice | JWT verification against public keys, prevents session cookie forgery |
| Manual form validation | zod + react-hook-form | Ongoing | Type-safe validation, auto-generated error messages, real-time feedback |
| Moment.js | date-fns | 2020+ | Tree-shakeable, functional API, 25x smaller bundle |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Officially replaced by `@supabase/ssr` (already adopted)
- `tailwind.config.ts`: Not used — this project uses Tailwind CSS 4 with CSS-based config (`@theme` in `app/globals.css`)
- `getSession()` in server code: Security anti-permissive, use `getUser()` instead

## Open Questions

1. **File upload path for new tasks (no taskId yet):** The storage path convention is `{project_id}/{task_id}/{filename}` but taskId doesn't exist during task creation.
   - **Recommendation:** Upload to `{project_id}/temp/{uuid}/{filename}`, then move to final path after task creation using Supabase's storage `copy()` + `remove()`. The plan should handle this in the task creation server action.

2. **Next.js 16 vs Next.js 15 patterns:** The project uses Next.js 16.2.2 (package.json), not Next.js 15 as stated in constraints. Server actions and App Router patterns remain the same, but some Next.js 15 documentation may reference features that behave slightly differently. The `cookies()` API is async in both versions (changed in Next.js 15), so Phase 1 patterns carry forward unchanged.
   - **Recommendation:** Existing Phase 1 patterns are compatible. No changes needed.

3. **Kanban drag-to-change-status:** Does dragging a card from "todo" to "done" column automatically change the `status` field in the database?
   - **Recommendation:** Yes — the `handleDragEnd` callback should call a server action that updates `tasks.status` based on the target column ID. This is an optimistic update pattern: update local state immediately, fire server action in background, rollback on failure.

4. **Site URL for invite links:** The invite generation server action needs `NEXT_PUBLIC_SITE_URL` to construct the invite URL, but this env var might not be set locally.
   - **Recommendation:** Use `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}` as a fallback during development.

## Sources

### Primary (HIGH confidence)

- **Existing codebase** - `/app/admin/layout.tsx`, `/app/login/actions.ts`, `/app/invite/[token]/actions.ts`, `/lib/supabase/server.ts`, `/lib/supabase/client.ts` — verified server action patterns, auth patterns, Supabase client setup
- **Database schema** - `/supabase/migrations/001_initial_schema.sql` — verified table structure, all columns, constraints
- **RLS policies** - `/supabase/migrations/002_rls_policies.sql` — verified admin full access, team member scoped access
- **Storage policies** - `/supabase/migrations/003_storage.sql` — verified `design-files` bucket config, admin/team policies
- **[dnd-kit documentation](https://dndkit.com/introduction/getting-started)** — verified core components, kanban setup patterns
- **[dnd-kit sortable preset](https://dndkit.com/presets/sortable)** — verified `useSortable`, `SortableContext`, sorting strategies
- **Runtime verification** — `zod` v4 + `@hookform/resolvers/zod` v5.2.2 compatibility confirmed by running `node -e` test
- **[Supabase Storage docs](https://supabase.com/docs/guides/storage)** — verified bucket configuration, upload API

### Secondary (MEDIUM confidence)

- **[Supabase Storage JS API reference](https://supabase.github.io/storage/api/js/functions/StorageClient.upload.html)** — `upload()` method signature (no progress callback in v2)
- **[supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js)** — v2.101.1 confirmed, no progress events in upload method
- **[npm @dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core)** — v6.3.1, confirmed current stable
- **[npm @dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable)** — v10.0.0, confirmed current stable

### Tertiary (LOW confidence)

- **Exact shadcn component installation names** — may vary slightly by shadcn version (e.g., `field` vs `form-field`). Plan should verify during installation.
- **Next.js 16-specific server action behaviors** — no breaking changes from Next.js 15 found in web search, but comprehensive changelog review not performed.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified against npm registry, runtime compatibility confirmed for zod v4 + hookform/resolvers
- Architecture patterns: HIGH - Based on existing Phase 1 patterns in the codebase, established server action patterns
- Pitfalls: HIGH for Supabase patterns (verified in docs), MEDIUM for dnd-kit collision detection (inferred from docs), MEDIUM for Next.js 16 specifics (v16 docs not thoroughly reviewed)

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable technologies, 30-day validity)
