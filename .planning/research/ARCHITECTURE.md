# Architecture Integration Analysis -- v1.1 Frontend Redesign

**Domain:** Next.js 15 App Router + Supabase RLS + shadcn/ui project management app -- v1.1 feature integration points
**Researched:** 2026-04-05
**Confidence:** HIGH (verified against existing codebase components, migrations, RLS policies, and Server Actions)

## Recommended Integration Architecture

The existing architecture is sound. Every new feature integrates into the established pattern: Server Components for reads, Server Actions for mutations, RLS at the database for enforcement, and shared shadcn/ui components. No architectural layer needs replacement. Three features require database migrations; zero require new third-party dependencies beyond what is already in `package.json`.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Layout (unchanged)                  │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │ Sidebar   │  │                Main Content                   │ │
│  │ (static)  │  │  ┌──────────────────┐  ┌──────────────────┐  │ │
│  │ Desktop:  │  │  │ RSC Pages        │  │ Client Islands   │  │ │
│  │ fixed L   │  │  │ (queries +       │  │ (Kanban, Cal,    │  │ │
│  │           │  │  │  render)         │  │  Dialogs, Forms) │  │ │
│  │ Mobile:   │  │  └────────┬─────────┘  └────────┬─────────┘  │ │
│  │ Sheet     │  └───────────┼──────────────────────┼───────────┘ │
│  └──────────┘              │                      │              │
│                            ▼                      ▼              │
│              ┌──────────────────────┬──────────────────────────┐ │
│              │   Server Actions     │   Supabase browser ctrl  │ │
│              │   (mutations +       │   (signed URLs,          │ │
│              │    revalidatePath)   │    optimistic rollback)  │ │
│              └──────────┬───────────┴──────────┬───────────────┘ │
│                         │                      │                 │
└─────────────────────────┼──────────────────────┼─────────────────┘
                          │                      │
┌─────────────────────────┼──────────────────────┼─────────────────┐
│                        Supabase               │                  │
│  ┌──────────┐ ┌─────────┐ ┌────────┐ ┌───────┴──┐ ┌───────────┐ │
│  │ clients  │→│projects │→│ tasks  │ │comments  │ │ design-   │ │
│  │ [+is_act,│ │         │ │        │ │[table    │ │ files     │ │
│  │  +desc]  │ │         │ │        │ │ already  │ │ bucket    │ │
│  └──────────┘ └─────────┘ └──┬─────┘ │  exists] │ └───────────┘ │
│                              │       └────┬─────┘                 │
│                    ┌───────┬─┴─┐     ┌────┴────┐                  │
│                    │assign│members│   │notifs   │                  │
│                    │ments │[+username]│         │                  │
│                    └──────┴─────┘   └─────────┘                   │
│               RLS policies enforce all access across all tables   │
└───────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility (existing or new) | Communicates With |
|-----------|--------------------------------|-------------------|
| **Admin/Team Layouts** | Auth check, sidebar, mobile header, notification bell | Supabase server client, MobileNav/TeamMobileNav |
| **TaskViewToggle** | Switches between List, Kanban, (new: Calendar) views | `KanbanBoard`, `TaskList`, (new: `ProjectCalendar`) |
| **KanbanBoard** | Drag-drop with optimistic status updates | `updateTaskStatusAction`, `@dnd-kit/core` |
| **KanbanCard** (existing) | Sortable card, links to task detail | `@dnd-kit/sortable`, click handler navigates to `TaskEditForm` |
| **TaskEditForm** | Full task CRUD (react-hook-form + zod) | `updateTaskAction`, `deleteTaskAction`, `assignTaskToMemberAction`, Supabase storage |
| **PortalCalendarView** (existing, portal only) | Month/week grid with task pills | Local state, calendar-utils from `lib/portal/` |
| **ProjectCalendar** (new) | Admin-facing calendar with same grid logic | Shared calendar-utils, inline task detail popup |
| **CommentSection** (new) | Display + create comments on a task | `createCommentAction` (new Server Action), inserts into `notifications` |
| **PortalShell** | Client portal task view toggle (Kanban/Calendar/Timeline) | `PortalKanbanTaskCard`, `PortalCalendarView`, `PortalTimelineView`, `PortalTaskDetailDialog` |
| **PortalTaskDetailDialog** | Read-only task detail with signed image preview | Supabase browser client `createSignedUrl` |
| **MobileNav / TeamMobileNav** | Sheet-based mobile navigation | `AdminSidebar` / `TeamSidebar` via `mobile` prop |
| **ImagePreviewDialog** (new) | Full-screen image preview with stable signed URLs | Shared `useSignedUrl` hook (new), `createSignedUrl` |

### Data Flow

**Reads (unchanged for v1.1):**
```
RSC Page → Supabase server/service client → normalized data props → Client component
```

**Writes (unchanged for v1.1):**
```
Client component → Server Action → Supabase server/service → revalidatePath() → router.refresh() or optimistic rollback
```

**New patterns for v1.1:**
```
Comment post → Server Action → INSERT comments + INSERT notifications → revalidatePath
Kanban drag → optimistic setItems → updateTaskStatusAction → rollback on failure
Signed URL → useSignedUrl hook (shared, memoized) → createSignedUrl (1hr expiry) → stale-if-error caching
```

## Patterns to Follow

### Pattern 1: Kanban Inline Editing Integration

**What:** The existing `KanbanBoard` (`components/admin/kanban-board.tsx`) already does optimistic drag-drop via `updateTaskStatusAction`. Inline editing adds field-level editing directly on the kanban card without navigating to the full `TaskEditForm` page.

**Integration approach:** Two components need changes:

1. **`KanbanCard`** (`components/admin/kanban-card.tsx`): Currently uses `useSortable` drag listeners spread across the entire card. The fix: stop propagation on a click handler separate from the drag listeners. Clicking opens an inline editor.

2. **`ProjectCalendar`** (new): Admin calendar component. Shares the same grid logic as `PortalCalendarView` but adds edit capability.

**Technical detail -- separating click from drag:**
```tsx
// In KanbanCard: the drag listeners are spread across the outer wrapper.
// Add an onClick that stops event propagation to the draggable layer:
//
//   <div {...attributes} {...listeners}>  ← drag layer
//     <button onClick={(e) => { e.stopPropagation(); onEdit(task) }}>  ← click layer
//       ... card content ...
//     </button>
//   </div>
//
// The inline editor can be a shadcn Popover or Dialog that appears on click.
// It edits title, status, posting date -- fields small enough for card-level editing.
// Full editing still uses the dedicated TaskEditForm page.
```

**Server Action integration:** Reuse existing `updateTaskAction` (in `app/admin/clients/[clientId]/projects/[projectId]/actions.ts`). No new Server Action needed for inline edits. Call the same action, same zod validation, same revalidatePath. The optimistic update pattern from `KanbanBoard.handleDragEnd` applies identically.

**Confidence:** HIGH -- verified against existing `KanbanBoard.tsx` at lines 95-117 which already implements the optimistic update + rollback pattern.

### Pattern 2: Calendar Redesign (Admin Integration)

**What:** The calendar currently exists only in the client portal (`PortalCalendarView` at `components/portal/calendar-view.tsx`). For the v1.1 redesign, the admin needs calendar access with the same square day blocks and overflow handling. The calendar-utils (`lib/portal/calendar-utils.ts`) should be shared.

**Integration approach -- recommended:** Add `'calendar'` as a third view in the existing `TaskViewToggle` (at `app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx`). This component already manages view switching between `'list'` and `'kanban'`. Adding `'calendar'` is a single state value.

**What needs to happen:**
1. Extract `buildMonthGrid`, `buildWeekGrid`, `groupTasksByPostingDate` from `lib/portal/calendar-utils.ts` → `lib/calendar-utils.ts` (shared, remove `portal` scoping)
2. Create `components/admin/project-calendar.tsx` -- admin variant of the calendar that receives `TaskRow` data and renders the same grid
3. Add `'calendar'` to the `view` state in `TaskViewToggle`
4. Render `<ProjectCalendar>` instead of `<TaskList>` or `<KanbanBoard>` when selected

**What does NOT need changing:**
- The grid math (`buildMonthGrid`, `buildWeekGrid`) is pure math, role-agnostic
- The task-to-date grouping (`groupTasksByPostingDate`) is pure function composition
- The day cell rendering can be extracted into a shared `DayCell` component

**Admin Calendar specifics:**
- Admin calendar does NOT need the `TaskPill` color categorization (the portal's `categoriseTask` function is heuristically based on task titles and not meaningful to agency clients)
- Admin calendar SHOULD show status indicators (StatusDot) and assignee names
- Admin calendar can reuse the `onTaskSelect` callback to open the inline editor (Pattern 1)

**Confidence:** HIGH -- verified both `calendar-utils.ts` (pure functions, no portal-specific imports) and `task-view-toggle.tsx` (already has the view toggle pattern).

### Pattern 3: Task Comments Integration

**What:** The `comments` table **already exists** in the original schema (`001_initial_schema.sql`). RLS policies already grant:
- Admin: full access via `admin_all` policy (migration `002_rls_policies.sql`, line 35-38)
- Team member SELECT: on their assigned tasks only (lines 141-152: `team_select_comments`)
- Team member INSERT: on their assigned tasks only (lines 155-168: `team_insert_comments`)

**The table has NEVER been used in application code.** No component, Server Action, or page references it.

**What needs to be built:**

**1. Server Action** (new -- add to existing `actions.ts` or create `comments-actions.ts`):
```typescript
// New Server Action
'use server'
export async function createCommentAction(
  taskId: string,
  content: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Verify auth (requireAdmin or resolve team_member_id)
  // 2. INSERT into comments (task_id, team_member_id, content)
  // 3. INSERT into notifications (notify task assignees + admin)
  // 4. revalidatePath(taskPath)
}
```

**2. Component** (`components/admin/comment-section.tsx`):
- Display existing comments (fetched by RSC page, passed as props)
- Textarea + submit button for new comment
- Timestamps and author names

**3. Integration with TaskEditForm**: Embed `CommentSection` below the task form fields, separated by a heading.

**4. Notification integration:** The `notifications` table already exists. The Server Action should:
- Insert a notification for the admin ("Team member X commented on task Y")
- Optionally insert notifications for other team members assigned to the same task

**Database query pattern for the page:**
```sql
-- In the RSC page (server component):
SELECT c.id, c.content, c.created_at, tm.name AS author_name
FROM comments c
JOIN team_members tm ON tm.id = c.team_member_id
WHERE c.task_id = $1
ORDER BY c.created_at ASC;
```

**What team members see:** The existing `team_select_comments` RLS policy already restricts team members to comments on their assigned tasks. This is correct behavior -- a team member should not see comments on tasks they are not assigned to.

**Confidence:** HIGH -- verified table exists (001), RLS policies exist (002), application code does not use them (zero grep hits for `createCommentAction`, `commentSection`, or comments table insert in any actions file).

### Pattern 4: Username Selection on First Login

**What:** The `team_members` table currently has `name` and `email`. There is no `username` column. The v1.1 requirement adds usernames for display on comments and task assignments.

**Migration needed** (`supabase/migrations/012_add_username_to_team_members.sql` -- new):
```sql
ALTER TABLE public.team_members ADD COLUMN username TEXT;
-- Optional: enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_username
  ON public.team_members (username) WHERE username IS NOT NULL;
```

**Two flows need to be updated:**

**Flow A -- New registrations (preferred path):**
Update `/invite/[token]` page (`app/invite/[token]/page.tsx`):
- Add a username input field alongside the existing name and password fields
- `app/invite/actions.ts` (the `register` function) must insert `username` into `team_members`

**Flow B -- Existing team members:**
After the migration runs, existing team members will have `username = NULL`. The `/team` layout (`app/team/layout.tsx`) currently checks `user.app_metadata.role !== 'team_member'`. It needs an additional check:
```typescript
// After the existing role check:
const { data: member } = await supabase
  .from('team_members')
  .select('username')
  .eq('id', user.id)
  .single();

if (!member?.username) {
  redirect('/team/choose-username');
}
```
Create `/team/choose-username/page.tsx` -- a simple form that sets the username.

**Display logic:** Components that currently show `team_members.name` should prefer `team_members.username` (with `name` as fallback). This affects:
- Task assignment dropdowns in `TaskEditForm`
- Comment author display (new CommentSection)
- Team member list page

**Confidence:** HIGH -- verified invite flow at `app/invite/[token]/page.tsx` (collects name + password), team layout at `app/team/layout.tsx` (checks role but not username), and team_members table structure (001_initial_schema.sql, no username column).

### Pattern 5: Client Portal -- Block Clients + Description

**What:** The `clients` table currently has `id`, `name`, `slug`, `color`, and a `logo_path` may or may not exist. There is no "blocked" or "is_active" flag, and no description field.

**Migration needed** (`supabase/migrations/012_add_client_fields.sql` -- can be combined with migration 012):
```sql
ALTER TABLE public.clients ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.clients ADD COLUMN description TEXT;
```

**Integration points:**

**1. Portal query update** (`lib/portal/queries.ts`, line 39):
The `getPortalDataBySlug` function queries `clients` by slug. It must add `.eq('is_active', true)`:
```typescript
// Change:
.from('clients')
.select('id, name, slug, color')
.eq('slug', normalizedSlug)
// To:
.from('clients')
.select('id, name, slug, color, is_active')
.eq('slug', normalizedSlug)
.eq('is_active', true)
.maybeSingle<ClientRow>()
```

When a blocked client visits their portal, this returns `null`, and the existing `notFound()` at `app/portal/[slug]/page.tsx` line 16 triggers. Optionally, differentiate between "client not found" and "client portal blocked" by checking first without the `is_active` filter.

**2. Admin interface:** Add a "Block Client" toggle to the client card (`app/admin/clients/client-card.tsx`) or client detail page. A new Server Action (`app/admin/clients/actions.ts` -- already exists) can handle `updateClientIsActiveAction`:
```typescript
export async function updateClientIsActiveAction(
  clientId: string,
  isActive: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  // Use createServiceRoleClient() (existing pattern)
  // .from('clients').update({ is_active: isActive }).eq('id', clientId)
  // revalidatePath('/admin/clients')
}
```

**3. RLS consideration:** The portal currently uses `createServiceRoleClient()` (bypasses RLS entirely). The `is_active` check is **application-level**, not RLS-enforced. This is the correct pattern for the portal -- the service role client is used for the public-facing query, and application logic filters. If the portal switched to the regular server client with authenticated RLS, a new RLS policy would be needed.

**4. Existing projects/tasks for blocked clients:** No change needed. RLS policies already filter queries to assigned tasks. Blocking a client does not affect admin or team member access to that client's data -- admins and team members can still see and edit everything.

**Confidence:** HIGH -- verified `getPortalDataBySlug` at `lib/portal/queries.ts` (uses service role client), `app/portal/[slug]/page.tsx` (calls notFound() when null), and `clients` table schema (no `is_active` column in 001).

### Pattern 6: Image Previewer with Signed URL Stability

**What:** The codebase already uses `createSignedUrl` in two places:
1. `TaskEditForm` lines 41-67 (`useDesignImageUrl` hook)
2. `PortalTaskDetailDialog` lines 44-72 (inline useEffect pattern)

Both implementations follow the same pattern: create signed URL with 1-hour expiry, set state, handle cancellation. The "reload stability" problem manifests as:
- **Flicker on every remount:** Each time the component mounts (e.g., after navigating back), a new signed URL is requested, showing a loading state
- **Cache invalidation:** Browser forward/back does not reuse the previously loaded URL
- **Duplication:** Two nearly identical implementations with slightly different caching logic

**Integration approach:**

**1. Extract shared hook** (`lib/use-signed-url.ts` -- new):
```typescript
'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSignedUrl(filePath: string | null, duration = 3600) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cache = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    if (!filePath) {
      setUrl(null)
      return
    }

    // Return cached URL immediately (prevents flicker)
    const cached = cache.current.get(filePath)
    if (cached) {
      setUrl(cached)
      return
    }

    setLoading(true)
    let cancelled = false
    createClient()
      .storage.from('design-files')
      .createSignedUrl(filePath, duration)
      .then(({ data, error }) => {
        if (!cancelled && !error && data?.signedUrl) {
          cache.current.set(filePath, data.signedUrl)
          setUrl(data.signedUrl)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [filePath, duration])

  return { url, loading }
}
```

**2. Create full-screen preview dialog** (`components/admin/image-preview-dialog.tsx` -- new):
- Shadcn Dialog with full-screen image display
- `useSignedUrl` hook for signed URL generation
- Download button (reuse `DesignFileDownloader`)
- Close button and click-outside-to-close

**3. Replace existing implementations:**
- `TaskEditForm.useDesignImageUrl` → `useSignedUrl`
- `PortalTaskDetailDialog` inline logic → `useSignedUrl`
- Both existing `<img>` tags → wrapped in `ImagePreviewDialog`

**Critical detail:** Signed URLs expire after 1 hour. The `Map` cache does not handle expiration. For an agency tool with session-based usage, this is acceptable. If 1-hour expiration becomes a real issue, add a timestamp to the cache and re-generate on error (403 response).

**Confidence:** HIGH -- verified both existing implementations follow the same pattern, both can be extracted without changing behavior. The hook approach is the standard React pattern for deduplicating async side effects.

### Pattern 7: Mobile Sidebar -- Minimal Change Required

**What:** Mobile navigation is already implemented correctly for both admin and team roles:
- `app/admin/mobile-nav.tsx`: Uses shadcn `Sheet` wrapping `AdminSidebar`
- `app/team/mobile-nav.tsx`: Uses shadcn `Sheet` wrapping `TeamSidebar`
- Both use `z-30` on the sticky header, sheet uses default `z-50` from radix -- no overlap
- All interactive elements use `min-h-[44px]` for touch accessibility

**The 375px requirement is already met.** The `Sheet` component (from `components/ui/sheet.tsx`) renders a fixed panel over content at `w-60`, which fits within 375px width (375 - 240 = 135px content remains visible behind backdrop).

**What SHOULD change for v1.1:**

1. **Visual theming only:** Update the `MobileNav` background, text, and border colors from the current black-and-white theme to the new cream/beige design system. This is CSS-only -- no structure changes.

2. **New navigation items:** If the Kanban calendar view gets its own route (Pattern 2, rejected in favor of embedded approach), or if the team member area gets a "My Calendar" view, the respective sidebar nav arrays (`AdminSidebar` at `app/admin/sidebar.tsx` line 9-13, `TeamSidebar` at `app/team/sidebar.tsx` line 9-11) need new entries.

3. **Sheet title accessibility:** The admin `MobileNav` already includes `<SheetTitle className="sr-only">` (line 29). The team `MobileNav` should match this pattern for accessibility parity.

**What should NOT change:**
- The `Sheet` component itself (radix-ui wrapper, working correctly)
- The layout structure (`aside` for desktop, `header` for mobile, main content wrapper)
- The touch target sizes (already `min-h-[44px]`)
- The z-index layering (already correct)

**Confidence:** HIGH -- verified `MobileNav` uses Sheet pattern correctly, Sheet uses radix dialog which handles all layering and accessibility, no structural issues at 375px viewport width.

### Pattern 8: Admin Calendar Embedded in TaskViewToggle

**Architecture Decision:** Add calendar as a third view tab in the existing `TaskViewToggle` component rather than creating a new route.

**Why embedded over separate route:**

| Criterion | Embedded (recommended) | Separate route |
|-----------|----------------------|----------------|
| Data availability | Already loaded by RSC page | Requires duplicate query |
| View switching | Single state change | Client-side navigation |
| URL structure | `/admin/clients/.../projects/proj-id` | `/admin/clients/.../projects/proj-id/calendar` |
| revalidatePath | One path to invalidate | Two paths |
| Code reuse | Direct import of calendar-utils | Would need SSR rendering |
| Bookmarkable | Calendar state not in URL | URL reflects view |

**Trade-off:** The embedded approach means the calendar view is not directly linkable. Users must navigate to the project page, then switch to calendar tab. For an agency tool with ~5-20 clients, this is acceptable.

**Integration into TaskViewToggle:**
```typescript
// Current state:
const [view, setView] = useState<'list' | 'kanban'>('kanban')
// Becomes:
const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('kalender')

// Current render:
{view === 'list' ? <TaskList /> : <KanbanBoard />}
// Becomes:
{view === 'list' ? <TaskList /> : view === 'kanban' ? <KanbanBoard /> : <ProjectCalendar />}
```

**Data requirements:** `ProjectCalendar` needs the same `TaskRow[]` data that `KanbanBoard` and `TaskList` already receive. The `TaskRow` type already includes `posting_date`. No additional data fetching is required.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Data Fetching for Server Routes

**What:** Moving data fetching from Server Components to `useEffect` in client components.
**Why bad:** The existing architecture correctly uses RSC for initial data load. Client-side fetching duplicates Supabase query logic and adds loading states.
**Instead:** Keep RSC as the data source. Pass as props. Use Server Actions for mutations.

### Anti-Pattern 2: Duplicating Signed URL Logic

**What:** Three implementations of `createSignedUrl` after adding the new ImagePreviewDialog.
**Why bad:** Already duplicated twice. Third copy makes global fixes (caching, error retries) impossible to apply consistently.
**Instead:** Extract to `lib/use-signed-url.ts` and replace all existing implementations.

### Anti-Pattern 3: Bypassing RLS for New Features

**What:** Using `createServiceRoleClient()` for new feature queries that could use authenticated clients.
**Why bad:** The codebase has carefully crafted RLS policies (migrations 002, 011). Using service role for everything undermines the security model.
**Instead:** Comments INSERT already has proper team-member RLS. New Server Actions should use the authenticated client when possible, or verify auth before escalating to service role (the pattern already used in `actions.ts` `requireAdmin()`).

### Anti-Pattern 4: Inline Editing Without Optimistic Updates

**What:** Waiting for Server Action round-trip before showing updated data.
**Why bad:** The Kanban already does optimistic updates with rollback. Any feature without this pattern feels laggy.
**Instead:** Every user-facing mutation updates local state immediately, fires Server Action, rolls back on failure.

### Anti-Pattern 5: Modifying existing components without extraction

**What:** Adding inline editor code directly into `KanbanCard` making it do drag + edit + display.
**Why bad:** `KanbanCard` is already 63 lines with drag listeners, style transforms, and status rendering. Adding inline editing inline with all of this creates an unwieldy component.
**Instead:** Create `components/admin/inline-task-editor.tsx` as a separate component triggered by click. `KanbanCard` only needs to add the click handler (3 lines) and pass-through prop.

## Suggested Build Order

Build order determined by dependency analysis (features with no blockers first, shared infrastructure before consumption):

```
1. Image Previewer (lib/use-signed-url.hook + ImagePreviewDialog)
   └── Depends on: nothing (pure refactoring)
   └── Unblocks: TaskEditForm and PortalTaskDetailDialog use shared hook
   └── Risk: LOW -- isolated refactoring, no DB changes

2. Username flows
   ├── 2a. DB migration (adds username column to team_members)
   ├── 2b. Update invite registration form (app/invite/[token]/page.tsx)
   └── 2c. Create /team/choose-username page (handles existing members)
   └── Depends on: Migration #1
   └── Unblocks: Comments (need author display name)
   └── Risk: LOW -- simple column add, backward compatible

3. Client block/unblock
   ├── 3a. DB migration (adds is_active + description to clients)
   ├── 3b. Update portal query (lib/portal/queries.ts)
   └── 3c. Admin UI toggle (client card or detail page)
   └── Depends on: Migration #2
   └── Risk: LOW -- is_active defaults to TRUE, no data loss

4. Task Comments
   ├── 4a. Create CommentSection component (components/admin/comment-section.tsx)
   ├── 4b. Server action: createCommentAction (extends actions.ts)
   ├── 4c. Notification integration (INSERT into notifications table)
   └── 4d. Embed in TaskEditForm
   └── Depends on: Username #2 (comment author names)
   └── Unblocks: Kanban inline editing (if comment count displayed on cards)
   └── Risk: MEDIUM -- RLS policies exist but have never been exercised
   └── NOTE: The comments table + RLS was designed but never tested in application code.
       The team_insert_comments policy (migration 002, line 155) has an EXISTS subquery
       that joins task_assignments. If the task_assignments table is empty for a task,
       the INSERT will fail. Verify by testing with real data.

5. Admin Calendar View
   ├── 5a. Extract shared calendar-utils (lib/calendar-utils.ts)
   ├── 5b. Create ProjectCalendar component (components/admin/project-calendar.tsx)
   └── 5c. Add 'calendar' tab to TaskViewToggle
   └── Depends on: Nothing blocking (can build in parallel with 1-4)
   └── Risk: LOW -- pure function extraction, existing portal calendar is proven
   └── NOTE: calendar-utils.ts at lib/portal/calendar-utils.ts uses PortalTask type.
       Extracting it requires creating overloads for TaskRow type.

6. Kanban Inline Editing
   ├── 6a. Add onClick handler to KanbanCard (stop drag propagation)
   ├── 6b. Create InlineTaskEditor component
   └── 6c. Wire to existing updateTaskAction
   └── Depends on: Nothing blocking (can build in parallel with 1-5)
   └── Risk: LOW -- reuses existing Server Action, same optimistic pattern

7. Mobile Sidebar Polish
   └── Visual theme updates to existing MobileNav components
   └── Depends on: All visual changes (theme is cross-cutting)
   └── Risk: LOW -- CSS-only changes to working components

8. Brand Redesign (CSS + component theme updates)
   └── Apply cream/beige theme across all components
   └── Depends on: All above (cross-cutting change, done last)
   └── Risk: MEDIUM -- touches every component, merge conflicts likely if parallel dev
```

**Rationale for this order:**
- Steps 1-3 are migrations + refactoring: run first, minimal risk, unblock others
- Step 4 (Comments) needs usernames (Step 2) to display author names properly; the underlying table and RLS exist so no schema changes needed
- Steps 5-6 (Calendar, Kanban Inline) are independent frontend features that can be built in parallel with each other but after the infrastructure is stable
- Steps 7-8 are visual polish: done last because they touch every component and would cause constant merge conflicts if done earlier

**Parallel build options:**
```
Week 1: Steps 1, 2, 3 (infrastructure)
Week 2: Steps 4, 5, 6 in parallel (feature work)
Week 3: Steps 7, 8 (polish)
```

## Scalability Considerations

| Concern | At current scale (~50 tasks/project) | At 500 tasks/project | At 2000+ tasks/project |
|---------|--------------------------------------|----------------------|------------------------|
| Kanban render | Fine (existing pattern) | Minor lag on drag, acceptable | Needs windowing/virtualization |
| Calendar render | Fine (existing pattern) | Fine with `overflow-hidden` | Server-rendered month pages |
| Comments per task | Fine | Fine | "Load more" or cursor pagination |
| Signed URL caching | Fine (Map cache, in-memory) | Fine | Consider CDN or public bucket |
| Server Action latency | Negligible (<200ms) | Negligible | Consider edge runtimes |

## Phase-Specific Warnings

| Feature Topic | Likely Pitfall | Mitigation |
|--------------|----------------|------------|
| Comments RLS | `team_insert_comments` policy has EXISTS subquery to `task_assignments` that may reject valid inserts | Test with real team_member_id that is assigned to the target task |
| Calendar utils extraction | `PortalTask` type differs from `TaskRow` type -- field names and shape | Create type adapter or generic calendar-utils that accepts any shape with `id`, `postingDate`, `title`, `status` |
| Signed URL cache | `Map` cache leaks memory in long-running client sessions | Add TTL-based eviction or clear on page unload |
| Username migration | Existing `team_members` rows will have `username = NULL` after migration | Must include `/team/choose-username` redirect for existing members |
| Client blocking | `is_active` defaults to TRUE -- existing clients all become active (correct) | Verify with manual check that no existing client should be pre-blocked |
| Kanban inline editing | Click handler on sortable card fires both drag and click | Use `e.stopPropagation()` and separate clickable element within the card |

## Sources

- Existing KanbanBoard: `/Users/MSIModern14/ocean-inc/components/admin/kanban-board.tsx` (optimistic update pattern, lines 95-117)
- Existing KanbanCard: `/Users/MSIModern14/ocean-inc/components/admin/kanban-card.tsx` (drag listeners on wrapper, lines 21-30)
- Existing PortalCalendarView: `/Users/MSIModern14/ocean-inc/components/portal/calendar-view.tsx` (grid rendering, lines 177-323)
- Existing calendar-utils: `/Users/MSIModern14/ocean-inc/lib/portal/calendar-utils.ts` (pure functions, extractable)
- Existing task actions: `/Users/MSIModern14/ocean-inc/app/admin/clients/[clientId]/projects/[projectId]/actions.ts` (all Server Actions)
- Existing task edit form: `/Users/MSIModern14/ocean-inc/app/admin/clients/[clientId]/projects/[projectId]/tasks/[taskId]/task-edit-form.tsx` (useDesignImageUrl hook, lines 41-67)
- Existing TaskViewToggle: `/Users/MSIModern14/ocean-inc/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx` (view switching pattern)
- Existing portal query: `/Users/MSIModern14/ocean-inc/lib/portal/queries.ts` (getPortalDataBySlug, lines 30-113)
- Existing portal task detail: `/Users/MSIModern14/ocean-inc/components/portal/task-detail-dialog.tsx` (signed URL logic, lines 44-72)
- Portal types: `/Users/MSIModern14/ocean-inc/lib/portal/types.ts` (PortalTask, PortalProject, PortalClient)
- Database schema: `/Users/MSIModern14/ocean-inc/supabase/migrations/001_initial_schema.sql` (all tables including comments)
- RLS policies: `/Users/MSIModern14/ocean-inc/supabase/migrations/002_rls_policies.sql` (admin_all, team_select_comments, team_insert_comments)
- RLS fixes: `/Users/MSIModern14/ocean-inc/supabase/migrations/011_fix_rls_cascade_delete.sql` (updated team policies with CASE expression)
- Invite flow: `/Users/MSIModern14/ocean-inc/app/invite/[token]/page.tsx` (registration form with name + password)
- Team layout: `/Users/MSIModern14/ocean-inc/app/team/layout.tsx` (role check + notification fetch)
- Admin sidebar: `/Users/MSIModern14/ocean-inc/app/admin/sidebar.tsx` (nav array, lines 9-13)
- Team sidebar: `/Users/MSIModern14/ocean-inc/app/team/sidebar.tsx` (nav array, lines 9-11)
- Admin mobile nav: `/Users/MSIModern14/ocean-inc/app/admin/mobile-nav.tsx` (Sheet pattern, complete)
- Team mobile nav: `/Users/MSIModern14/ocean-inc/app/team/mobile-nav.tsx` (Sheet pattern, complete)
- QuickTaskDialog: `/Users/MSIModern14/ocean-inc/components/admin/quick-task-dialog.tsx` (two-step client/project select)
- Portal shell: `/Users/MSIModern14/ocean-inc/components/portal/portal-shell.tsx` (task view toggle for portal)
- Portal Kanban card: `/Users/MSIModern14/ocean-inc/components/portal/kanban-task-card.tsx` (portal-only task cards)

---
*Architecture integration analysis for: Orca Digital v1.1 Frontend Redesign*
*Researched: 2026-04-05*
