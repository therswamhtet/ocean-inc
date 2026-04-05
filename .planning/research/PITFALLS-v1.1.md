# Pitfalls Research — v1.1 Frontend Redesign & New Features

**Domain:** v1.1 additions to existing Next.js 16 + Supabase project management app
**Researched:** 2026-04-05
**Confidence:** HIGH for Supabase, Next.js, and React patterns; MEDIUM for Next.js 16-specific caching changes (newer version)

This document covers the common mistakes when **adding** these features to an existing, operational codebase:
- Brand theme overhaul (black-and-white to cream/beige with gradients)
- Kanban board with drag-and-drop and inline editing
- Calendar overhaul (square day blocks, mobile-friendly)
- Task comments (real-time updates for team members)
- Username selection on first login
- Image previewer with Supabase Storage signed URLs
- Mobile responsive sidebar (hamburger navigation)
- Client portal block elements

---

## Critical Pitfalls

### Pitfall 1: Halfway Design System Migration — "CSS in Transit"

**What goes wrong:**
Swapping all Tailwind color tokens from black-and-white to cream/beige mid-project creates a fractured UI where old components still use the previous theme values. Some pages show the new theme, others the old one. Gradient accent cards clash with components still using `bg-background` (now cream). The `--color-ring` token changing from black to a warm tone means every `focus-visible:ring` outline shifts across all components, including forms that aren't part of the redesign scope.

**Why it happens:**
Developers replace `globals.css` `@theme` tokens and assume every component will adapt. In reality, components using hardcoded values (`bg-white`, `text-black`, `border-gray-200`) bypass the theme system entirely and remain unchanged. shadcn/ui components installed with the old theme also baked in color values via `cn()` utility calls.

**Consequences:**
- Inconsistent visual experience across pages
- Components look broken during the transition
- Design review takes weeks hunting individual hardcoded values
- Old `border-white`, `bg-white` classes now invisible on cream backgrounds
- Status dot color changes ripple into non-targeted areas (login forms, team pages)

**Prevention:**
1. **Audit every hardcoded color first** — search for `bg-white`, `text-black`, `bg-\[\#`, `border-gray`, `text-gray` across all `.tsx` files before touching `globals.css`
2. **Replace hardcoded values with CSS variables first**, then change the CSS variables
3. **Create a migration checklist** of every component file that uses color values
4. **Test every route** after the token swap (not just the redesigned pages)
5. **Keep old and new tokens side-by-side during transition** — prefix new ones (e.g., `--color-cream-bg`) until full migration is verified
6. **The `--color-ring` change affects all focus-visible outlines everywhere** — explicitly audit all interactive elements

**Detection:**
- Visual regression testing (before/after screenshots of every page)
- Run a regex search for leftover hardcoded values: `grep -rn 'bg-white\|text-black\|text-gray\|border-gray' app/ components/`
- Check that no pages use old theme values while others use new ones

**Phase to address:** Phase 1 (Brand Theme & Layout Foundation) — must be completed BEFORE other visual features are touched.

---

### Pitfall 2: Kanban Drag-and-Drop with Server Component Data — State Mismatch

**What goes wrong:**
The project page fetches tasks as a Server Component (`page.tsx` calls `supabase.from('tasks').select(...)` with `serviceRoleClient`). It passes the fetched tasks to `TaskViewToggle` client component for dnd-kit interactivity. When a user drags a task column to change status, the optimistic UI updates the column locally, but the Server Action mutation and `revalidatePath()` cause the Server Component to re-render with fresh data. If the Server Action fails (RLS policy, validation), the UI flashes the changed state then snaps back, confusing the user. Additionally, if the user drags quickly before the mutation completes, duplicate mutations fire.

**Why it happens:**
Next.js Server Actions with dnd-kit creates a timing dance: drag event fires, optimistic UI moves the card, Server Action updates the database, `revalidatePath` triggers revalidation. If multiple drags happen in quick succession, multiple overlapping Server Actions fire. The existing code already uses `serviceRoleClient` in the Server Component but the Server Action likely uses the authenticated client — and RLS policies on the tasks table may reject status updates from the authenticated role if the task isn't assigned to that authenticated user (admin vs team_member).

**Consequences:**
- Cards snap back to original position after failed mutations
- Double-clicking or rapid drags sends duplicate database updates
- Admin can update any task, but team_member can only update assigned tasks — dnd-kit needs to handle both access patterns
- Drag state survives route navigation if browser caches the page

**Prevention:**
1. **Use `useOptimistic` (React 19 hook)** for the Kanban state — this is built into React 19 (already installed in this project) and handles optimistic state + rollback on action failure cleanly
2. **Debounce/drag lock** — disable drag on a column while a mutation is in flight
3. **Role-aware drag permissions** — admin can drag any card; team_member can only move cards in their own column or status
4. **Server Action should return success/failure** — if failure, trigger a hard re-fetch to sync client and server state
5. **Pass the `projectId` and `clientId` through hidden form fields** to the Server Action since dnd-kit's `onDragEnd` runs on the client
6. **Use a unique `key` based on task IDs, not array index** — otherwise React reconciliation gets confused when tasks reorder

**Detection:**
- Add console logging in `onDragEnd` and the Server Action to track mutation frequency
- Test rapid drags — cards should not double-move
- Test as team_member: try dragging a task assigned to someone else — should be rejected
- Network tab should show exactly one POST per drag, no duplicates

**Phase to address:** Phase 2 (Kanban Board with Inline Editing) — this pitfall IS the feature's core complexity.

---

### Pitfall 3: Kanban Inline Editing — Form State Conflicts with Server Data

**What goes wrong:**
Inline editing on Kanban cards means the card itself becomes a form (editing title, caption, status) without navigating away. The problem: the same task data flows from the Server Component at page load, but inline edits happen on the client. When the user edits a field, then clicks another card to edit it, then the parent component re-renders (from any revalidation), the second card's form state gets blown away — or worse, shows the wrong task's data because the inline edit form was keyed by array index.

**Why it happens:**
React key identity. If the Kanban component maps `tasks.map((task, i) => <TaskCard key={i} ... />)`, then when tasks reorder or a task's status changes, a card gets a different task's data but keeps the old form state. Additionally, Server Actions that mutate data cause `revalidatePath()` to re-render the entire Server Component tree, wiping unsaved inline edits.

**Consequences:**
- Unsaved edits silently discarded on background revalidation
- Form state (typed text, selected status) jumps between cards
- Users report "the text I was typing changed to something else"
- Validation errors appear on the wrong card

**Prevention:**
1. **Stable keys** — `key={task.id}` always, never index-based keys
2. **Isolate form state per card** — each inline edit form manages its own state via `useState`, does not share state with parent
3. **Cancel inline edits on revalidate** — listen for route changes or use a `version` counter that increments when server data changes, resetting all open forms
4. **Use `useTransition`** from React 19 to keep the UI responsive during Server Action submissions
5. **Autosave with debounce** — 500ms debounce from last keystroke to Server Action call, show "Saving..." indicator
6. **Do NOT call `revalidatePath` on every inline edit** — use `useFormStatus` and only re-validate the affected column, or use Supabase realtime to push only the changed task to other clients

**Detection:**
- Inspect React DevTools Keys — all list items must have unique, stable keys
- Type in one card's inline edit, then trigger a mutation elsewhere — your typed text should not jump to another card
- Network tab: one mutation per autosave, no rapid-fire requests during typing

**Phase to address:** Phase 2 (Kanban Board with Inline Editing)

---

### Pitfall 4: Calendar Render Performance — Rendering Every Task on Every Day Cell

**What goes wrong:**
A calendar with square day blocks plots tasks by their `posting_date`. The naive approach queries ALL tasks and then in the React component, runs `tasks.filter(t => t.posting_date === cellDate)` for every visible day cell. On a monthly view with 30 day cells, this means 30 filter operations over the entire task array. When the client manages dozens of clients with hundreds of monthly tasks, this causes noticeable render lag — especially on mobile (375px screens) where React spends more time on layout.

**Why it happens:**
Developers think "just filter the array for each day" — but with many clients and many tasks, this O(n*m) render pattern becomes expensive. Worse, if the calendar re-renders on every interaction (hover, click, status filter change), the entire filter-then-render cycle repeats.

**Consequences:**
- Calendar takes 500ms+ to render on first load with many tasks
- Switching months causes visible jank
- Mobile browser may show "page unresponsive" warning
- Every status filter change triggers full re-render

**Prevention:**
1. **Pre-compute the date-to-tasks map** — create a `Map<string, Task[]>` keyed by date string, built once from the fetched tasks array:
```typescript
const tasksByDate = new Map<string, TaskRecord[]>();
for (const task of tasks) {
  if (task.posting_date) {
    const existing = tasksByDate.get(task.posting_date) || [];
    existing.push(task);
    tasksByDate.set(task.posting_date, existing);
  }
}
// O(n) once, then O(1) per cell
```
2. **Virtualize or paginate** — if showing 3+ months, only render the visible month plus one buffer month on each side
3. **Memoize day cell components** — `React.memo` on the DayCell component, only re-render if that specific day's tasks change
4. **Limit tasks rendered per cell** — show "3 more" instead of rendering 15 tasks stacked in a single day cell (which breaks square block layout)
5. **Query only the visible date range from Supabase** — if the calendar shows April, query `WHERE posting_date BETWEEN '2026-04-01' AND '2026-04-30'`, not all tasks
6. **Use CSS `content-visibility: auto`** on day cells outside the viewport for month view

**Detection:**
- React DevTools Profiler — check render time per calendar component
- Count rendered DOM nodes: `document.querySelectorAll('.calendar-day').length`
- Test with 100+ tasks — should still render under 100ms

**Phase to address:** Phase 3 (Calendar Overhaul & My Tasks Filters)

---

### Pitfall 5: Calendar Layout — Square Cells Overflow on Mobile (375px)

**What goes wrong:**
The existing calendar design does square day blocks. On 375px screens, this means each day column is ~53px wide (375 / 7 days). Task dots, task indicators, and any inline text inside these cells overflow or wrap unpredictably. The requirement says "no overflow" but the current `overflow: hidden` approach clips content, making it invisible. The current design also uses `grid-cols-7` which does not account for sidebar on mobile — the sidebar may already consume horizontal space.

**Why it happens:**
Square-by-square calendar grids work on desktop but become illegible on small screens. Adding task dots, status indicators, and hover tooltips to 53px cells creates overflow.

**Consequences:**
- Task indicators clipped or overlapping
- Calendar is unusable on phones (which is the primary client access device)
- Horizontal scroll breaks the "no overflow" requirement
- Day cells become too tall to fit on screen

**Prevention:**
1. **Mobile-first: single-column day list on screens below 640px**, switch to grid at `sm:` breakpoint
2. **Use dot indicators, not text** — a 6px colored dot per task, max 5 visible per cell with "+N" for extras
3. **Calendar page must be full-width on mobile** — the admin sidebar (currently a fixed left panel) must collapse to a hamburger on `sm:` screens, freeing all 375px for the calendar
4. **`aspect-ratio: 1/1` on desktop, remove on mobile** — let day cells be rectangular on mobile to fit indicators
5. **Touch-friendly: min 44px tap targets** (WCAG requirement) for day cell click-to-expand

**Detection:**
- Test at exactly 375px viewport width
- Verify calendar is fully visible without horizontal scroll
- Check no content is clipped: inspect cells with DevTools for overflow
- Touch test: can you tap individual day indicators?

**Phase to address:** Phase 3 (Calendar Overhaul — must address mobile calendar simultaneously)

---

### Pitfall 6: Task Comments — Real-Time Updates Without Proper Subscription Lifecycle

**What goes wrong:**
The project has `@supabase/supabase-js` installed (v2.101.1). Adding task comments means implementing Supabase Realtime subscriptions (`supabase.channel('task-comments').on('postgres_changes', ...)`). The typical mistake: subscribing in a `useEffect` but not cleaning up properly on unmount or route change. When navigating between tasks, the old subscription persists, so comments from the previous task keep updating the current task's comment list. At scale, this also exhausts Supabase's real-time connection limit (200 concurrent channels on the free tier).

**Why it happens:**
Supabase Realtime subscriptions need explicit cleanup. React 19's Strict Mode in development double-invokes effects, surfacing bugs that only appear in production. Additionally, if the subscription callback updates state after the component unmounts, React throws a "setState on unmounted component" warning.

**Consequences:**
- Comments leak between tasks (user sees Task A's comments while viewing Task B)
- Memory leak from orphaned subscriptions
- Supabase connection limit reached in production under heavy use
- Comments don't appear in real-time if the subscription silently fails
- No error handling if the real-time service is unavailable

**Prevention:**
1. **Channel per task with cleanup**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`task-${taskId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` },
      (payload) => setComments(prev => [...prev, payload.new])
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [taskId]);
```
2. **Broadcast the task_id in the filter** — do NOT subscribe to ALL comment inserts
3. **Handle subscription errors** — `.subscribe()` returns a status; fall back to polling if realtime fails
4. **Poll as backup** — fetch new comments every 10 seconds if the subscription is in error state
5. **For the free tier**: use broadcast (in-app) instead of postgres_changes if connection limits are hit, or fall back to optimistic local-only updates with periodic sync

**Detection:**
- Subscribe to all open channels: `supabase.getChannels()` in console — should equal number of open task-detail dialogs
- Navigate between 10 tasks, then check `supabase.getChannels().length` — should be 1, not 11
- Test realtime: open same task in two tabs, comment in one, verify it appears in the other

**Phase to address:** Phase 4 (Task Comments) — realtime is the feature's defining characteristic.

---

### Pitfall 7: Task Comments — RLS Policies for Inserts vs Reads

**What goes wrong:**
A new `task_comments` table is created. The RLS policy allows authenticated users to INSERT comments but the SELECT policy only returns comments where the commenter is assigned to the task OR the admin is viewing. Team members who are NOT assigned to the task but need to see the comment thread (e.g., a designer needs to see admin feedback on a task assigned to someone else) get empty results.

Alternatively, the opposite mistake: SELECT policy is too permissive, allowing any authenticated user to read comments on any task across all clients — leaking potentially sensitive client feedback.

**Why it happens:**
Developers mirror the task RLS policy for comments (`assigned_to = auth.uid()`), but comments have two participants: the commenter and readers who may not be assigned to the same task. Comments need a separate access model.

**Consequences:**
- Team members cannot see comments on tasks they're not assigned to
- OR: team members can see client data from clients they don't work with
- Admin cannot see comments (if policy only checks `assigned_to`)
- The `INSERT` policy missing `WITH CHECK` allows inserting comments into tasks the user shouldn't access

**Prevention:**
1. **Comments inherit the task's visibility** — use an `EXISTS` subquery:
```sql
CREATE POLICY "Users can view comments on tasks they can access"
ON task_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN task_assignments ON tasks.id = task_assignments.task_id
    WHERE tasks.id = task_comments.task_id
    AND task_assignments.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```
2. **INSERT must validate the target task**:
```sql
CREATE POLICY "Users can comment on accessible tasks"
ON task_comments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN task_assignments ON tasks.id = task_assignments.task_id
    WHERE tasks.id = task_id
    AND task_assignments.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```
3. **Cascade delete** — when a task is deleted, its comments should be deleted too:
```sql
ALTER TABLE task_comments
ADD CONSTRAINT fk_task_comments_task
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
```

**Detection:**
- Test as team_member: can you see comments on a task you're assigned to? YES
- Test as team_member: can you see comments on a task you're NOT assigned to? Should vary by design decision
- Test as team_member: can you comment on a task across another client's project? NO
- Test cascade: delete a task, verify its comments are gone

**Phase to address:** Phase 4 (Task Comments) — RLS must be built with the table creation migration.

---

### Pitfall 8: Username Selection on First Login — Conflicts with Existing Team Member Invite Flow

**What goes wrong:**
The existing team member registration flow is: admin generates invite token → team member visits `/invite/[token]` → enters name + email + password → account created with profile. Adding a username field here creates two pitfalls:

1. **Duplicate username** — two team members pick the same username. Without a unique constraint on the username column, the second registration silently duplicates. With a unique constraint, the registration fails with a confusing database error if not handled gracefully.

2. **Existing team members without usernames** — any team member who registered before this feature gets deployed has a `NULL` username. Every query and display that assumes `username IS NOT NULL` will crash or show "undefined".

**Why it happens:**
Adding a new required field to an existing user system means dealing with legacy data (NULL usernames for existing users AND concurrent registrations). The `profiles` table already exists and stores `name` — the `username` needs to be a separate, unique, URL-safe (or display-friendly) identifier.

**Consequences:**
- Registration fails silently or with a cryptic Postgres error for duplicate usernames
- Existing team member pages show "undefined" or crash where username is displayed
- Task assignments display shows nothing for existing team members
- Reports and notifications reference non-existent usernames
- Admin team management page breaks trying to sort/filter by username

**Prevention:**
1. **Add the column as nullable first**, backfill existing users:
```sql
ALTER TABLE profiles ADD COLUMN username text UNIQUE;
-- Backfill: for existing users, generate username from their name
UPDATE profiles SET username = LOWER(REPLACE(name, ' ', '_')) || '_' || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;
-- Then make it required:
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
```
2. **Client-side uniqueness check** before form submission — debounce the input and query `profiles` table for existing usernames (use a Server Action, not client-side supabase query to avoid RLS issues)
3. **Suggest usernames** — auto-generate 3 options from the user's name (e.g., "john_doe", "john_doe1", "jdoe") similar to Slack's onboarding
4. **Add username to the invite registration page** (`/invite/[token]`) as a new required field with real-time validation
5. **Redirect users who have NULL username** — middleware or layout check: if `profiles.username IS NULL`, redirect to `/onboarding/choose-username` (this shouldn't happen after backfill, but protects against edge cases)

**Detection:**
- `SELECT COUNT(*) FROM profiles WHERE username IS NULL` — should be 0
- Try registering two users with the same username — should get a clear UI error
- Check all existing pages that display team member names — verify username rendering works for pre-existing users

**Phase to address:** Phase 2 (Kanban Board phase) — username is needed before task comments (comments display "username said X"). Address BEFORE implementing comments.

---

### Pitfall 9: Image Previewer with Supabase Signed URLs — Load and Reload Bugs

**What goes wrong:**
Supabase Storage signed URLs expire after a set duration (commonly 60 seconds). The typical image preview implementation:
1. Server Action calls `createSignedUrl()` and passes URL to client
2. `<Image src={signedUrl} />` renders the preview
3. User keeps the page open for 2+ minutes
4. User closes and reopens the preview — the signed URL is expired, image returns 403
5. User navigates away and back via browser back button — cached expired URL, same 403

Additionally, Next.js Image component (`next/image`) caches URLs at build time for static images and may try to optimize the signed URL, which changes the hostname and breaks the signature. If the signed URL includes query parameters (which it does: `?X-Amz-...`), Next.js Image's URL rewriting may strip them.

**Why it happens:**
Signed URLs are time-bound by design. The Next.js Image component is designed for optimization, which includes URL transformation and caching — both incompatible with expiring signed URLs.

**Consequences:**
- Image preview works initially but breaks after 60 seconds
- Reopening the preview shows broken image icon with no error message
- Next.js Image component strips signature query parameters, making the URL invalid immediately
- Browser back/forward navigation loads cached expired URLs

**Prevention:**
1. **Do NOT use `next/image` for signed URLs** — use a plain `<img>` tag or wrap it in a client component that bypasses Next.js image optimization:
```tsx
<img src={signedUrl} alt={fileName} />
// OR
<Image
  src={signedUrl}
  unoptimized  // bypasses Next.js optimization
  alt={fileName}
/>
```
2. **Create a dedicated `ImagePreviewDialog` component** that refreshes the signed URL on every open:
```tsx
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const openPreview = async (filePath: string) => {
  const url = await generateSignedUrlAction(filePath); // fresh URL each time
  setPreviewUrl(url);
  setOpen(true);
};
```
3. **Auto-refresh signed URLs** — if the dialog stays open > 50 seconds, re-fetch the URL (60s expiry minus 10s buffer)
4. **Show a clear loading/error state** — don't just show a broken image. Show "Loading preview..." → "Unable to load preview" → "Retry" button
5. **Store the file path, not the signed URL, in component state** — always regenerate the URL from the path when needed

**Detection:**
- Open image preview, wait 70 seconds, try to view — should still work
- Open preview, refresh the page, reopen — should not show 403
- Inspect image src in DevTools — should contain `?X-Amz-` signature parameters
- Verify Next.js is NOT rewriting or optimizing the image URL

**Phase to address:** Phase 3 (Calendar Overhaul & My Tasks Filters) — image preview is used across the app.

---

### Pitfall 10: Mobile Responsive Sidebar — Overlap on Route Changes and Keyboard Events

**What goes wrong:**
The admin area already has a fixed sidebar (`app/admin/sidebar.tsx`) and a mobile nav (`app/admin/mobile-nav.tsx`). The team area has its own versions (`app/team/sidebar.tsx`, `app/team/mobile-nav.tsx`). Making the sidebar mobile-responsive with hamburger navigation causes these problems:

1. **Duplicate hamburger implementations** — admin and team each have their own, they may behave differently
2. **Overlay dismissal conflicts** — the sidebar opens as an overlay on mobile. The overlay should close when tapping outside, pressing Escape, or navigating to a page. But Next.js navigation doesn't trigger overlay close — the next page renders behind the stale sidebar overlay
3. **Body scroll lock** — when the mobile sidebar is open, the background content should not scroll. Without `body { overflow: hidden }`, the user can scroll the background while the sidebar is open, causing the underlying content to shift
4. **Focus trap** — screen readers and keyboard navigation can tab to elements behind the closed sidebar
5. **z-index stacking** — the sidebar overlay, a task detail dialog, and a toast notification stack in unpredictable z-index order

**Why it happens:**
The existing sidebar components are separate per role (admin vs team) with duplicated overlay logic. Each independently manages state. When the user navigates between `/admin/...` and `/team/...` routes, the sidebar state is NOT shared because they're separate React trees (different root layouts).

**Consequences:**
- User clicks hamburger, opens sidebar, clicks a link — sidebar stays open over the new page
- Multiple open overlays (sidebar + dialog) create unusable z-index chaos
- Background content scrolls while trying to read sidebar on mobile
- Keyboard users can tab to invisible elements behind the overlay
- On iOS Safari, the "pull to refresh" gesture interferes with sidebar open/close

**Prevention:**
1. **Extract a shared `<MobileSidebar>` component** in `components/admin/mobile-sidebar.tsx` that both admin and team layouts use
2. **Close sidebar on route change** — use `usePathname` in the sidebar component and close when pathname changes:
```tsx
const pathname = usePathname();
useEffect(() => {
  setOpen(false);
}, [pathname]);
```
3. **Lock body scroll** — add a `useEffect` that sets `document.body.style.overflow = 'hidden'` when sidebar is open, and restores it when closed
4. **Focus management** — when sidebar opens, focus the first nav link; when it closes, focus returns to the hamburger button
5. **Consistent z-index scale** — define z-index tokens in the theme: sidebar=50, dialogs=100, toasts=200. Use these, not arbitrary `z-[999]` values
6. **Use the existing Radix Dialog primitives** — `@radix-ui/react-dialog` is already installed. Use `Dialog` for the mobile sidebar overlay — it handles focus trapping, escape key, body scroll lock, and overlay dismissal automatically

**Detection:**
- At 375px: open sidebar, click a link, verify sidebar auto-closes
- At 375px: open sidebar, try to scroll the background page — should be locked
- Press Escape key with sidebar open — should close and focus returns to hamburger
- Open sidebar, then open a task detail dialog — verify dialog appears ABOVE sidebar overlay
- Tab through elements with sidebar closed — no hidden elements behind overlay

**Phase to address:** Phase 1 (Brand Theme & Layout Foundation) — must be done alongside brand redesign so all routes get consistent mobile behavior.

---

### Pitfall 11: Client Portal Block Elements — RLS Policy Mismatch

**What goes wrong:**
The client portal currently uses a Server Action with `createServiceRoleClient()` to bypass RLS and fetch data scoped to the client's slug. Adding new block elements (client description, additional content sections) means either adding new database columns to existing tables or creating new tables. If using the same `serviceRoleClient` approach, RLS is bypassed for all queries — including queries for the new block elements. If the new block elements accidentally leak data across clients (e.g., showing Client A's description on Client B's portal), there is no RLS safety net.

**Why it happens:**
Server Actions that use `serviceRoleClient` have no RLS protection. The scoping must be done entirely in application code (the `WHERE` clauses). Adding new tables or columns means remembering to add these WHERE clauses to every new query.

**Consequences:**
- One client sees another client's description or project data
- No RLS fallback catches the missing WHERE clause in production
- Debugging is harder because the service role client does not return "permission denied" errors — it returns all data
- Migration scripts for new columns don't include RLS policies (even though service role bypasses them, future code might use the anon client)

**Prevention:**
1. **Create a `clientScopedFetch` helper** that always includes `client_id = ?` in queries, even with service role:
```typescript
async function getPortalData(clientSlug: string) {
  const supabase = createServiceRoleClient();
  // ALWAYS filter by the validated client_id
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('portal_slug', clientSlug)
    .single();

  if (!client) throw new Error('Invalid portal');

  // All subsequent queries MUST use client.id
  return supabase.from('projects').select('*').eq('client_id', client.id);
}
```
2. **Write RLS policies for the new columns/tables anyway** — even if not enforced by service role queries, they serve as documentation and protect future anon-client queries
3. **Validate the slug at the Server Action entry point** — return an error if the slug does not match, don't proceed with data fetching
4. **Add integration tests** that verify each portal route only returns data for its own client

**Detection:**
- Audit every Server Action that uses `serviceRoleClient` — each one must include an explicit client_id filter
- Manually test: open Client A's portal, modify the URL slug to Client B — should show completely different data
- Check new tables/columns have RLS policies defined (even if not currently used)

**Phase to address:** Phase 5 (Client Portal Upgrade) — every new block element needs audit.

---

### Pitfall 12: Tailwind CSS 4 Theme Syntax Change Breaking Existing Token Customization

**What goes wrong:**
The project uses Tailwind CSS 4 (`"tailwindcss": "^4"`) with the `@theme inline` syntax in `globals.css`. This is a significant departure from Tailwind CSS 3's `@layer base` + `tailwind.config.js` approach. Adding new brand colors (cream, beige, warm gradients) requires adding new CSS custom properties to `@theme inline`. However, developers accustomed to Tailwind 3 may write a `tailwind.config.js` with a `theme.extend.colors` block — Tailwind 4 ignores this file entirely. The colors simply don't work.

**Why it happens:**
Tailwind CSS 4 moved from JavaScript-based configuration (`tailwind.config.js`) to CSS-based configuration (`@theme` directive). Any documentation, Stack Overflow answers, or tutorials for Tailwind 3 are obsolete. Team members who have only used Tailwind 3 will write incorrect config.

**Consequences:**
- Added colors in `tailwind.config.js` are silently ignored
- `bg-cream` class doesn't exist because the theme token wasn't added to `@theme inline`
- Gradient utilities may be missing if `@theme` doesn't declare them
- shadcn/ui CLI tool may generate Tailwind 3 config files
- Inconsistent approaches across the team — some write CSS variables, some write config

**Prevention:**
1. **All theme tokens must go in `@theme inline` in `globals.css`**:
```css
@theme inline {
  --color-cream: #faf8f0;
  --color-beige: #f5f0e8;
  --color-warm-gradient: linear-gradient(...);
  /* ... existing tokens updated to new values */
}
```
2. **Do NOT create a `tailwind.config.js`** — it is ignored in Tailwind 4
3. **Verify all new utility classes work** after adding tokens — `bg-cream` should compile without errors
4. **shadcn/ui v2+ uses CSS variables natively** — use `bg-background` not `bg-white`
5. **For gradients**, Tailwind 4 supports them via `@theme` custom utilities or arbitrary values. Use CSS `@property` for animated gradients if needed

**Detection:**
- `npx tailwindcss --help` should show v4 help text
- Search for `tailwind.config.js` or `tailwind.config.ts` — should NOT exist
- After adding a new color token to `@theme inline`, use it in any component and verify it renders correctly

**Phase to address:** Phase 1 (Brand Theme & Layout Foundation) — must be done BEFORE any visual changes.

---

## Moderate Pitfalls

### Pitfall 13: Brand Gradient Backgrounds on shadcn/ui Components

**Problem:**
Many shadcn/ui components (Card, Dialog, Popover) use `bg-background` and `border-color` in their base styles. Adding colorful gradient card backgrounds means these components will render their white (or now cream) background as a solid rectangle on top of the gradient, hiding it entirely. Similarly, transparent dialogs on a gradient background need `bg-transparent` or `backdrop-blur` to show the gradient beneath.

**Prevention:**
Override component backgrounds with `bg-transparent` or `bg-background/80` where gradient should show through. Audit every Dialog, Card, and Popover after the theme change.

---

### Pitfall 14: "My Tasks" Filter Date Boundaries and Timezone Mismatches

**Problem:**
The "Today", "This week", "This month" filters for My Tasks need to compare `posting_date` (stored as date or timestamp) against `new Date()`. JavaScript's `Date` is timezone-aware, but `posting_date` in the database may be a date-only string (`"2026-04-05"`) or a timestamptz. Comparisons using `new Date().toISOString()` will be off by one day for users in negative UTC offsets (e.g., US Pacific: 9pm on April 5 is already April 6 UTC).

**Prevention:**
1. Query by date strings, not timestamps: `WHERE posting_date = CURRENT_DATE` (Postgres handles timezone conversion)
2. For "This week": `WHERE posting_date >= date_trunc('week', CURRENT_DATE) AND posting_date < date_trunc('week', CURRENT_DATE) + '7 days'`
3. Use `date-fns` (already installed) with the user's local timezone for client-side date formatting, NOT for query construction
4. The Server Action should use Postgres date functions, not JavaScript dates, for all comparisons

---

### Pitfall 15: Client Portal Block Elements — New Tables Need RLS Policies Immediately

**Problem:**
Adding a `client_descriptions` table or `client_portal_blocks` table (for the block elements) requires RLS policies. The existing pattern uses `serviceRoleClient` in Server Actions, which bypasses RLS. However, forgetting RLS means if anyone ever queries these tables from the browser (for autocomplete, search, or a future admin feature), all data is exposed.

**Prevention:**
Always include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and policies in the same migration that creates the table. Write policies even if they're not immediately enforced by service role queries.

---

### Pitfall 16: Warm Typography Change — Poppins Font Weights and Sizes Need Remapping

**Problem:**
Switching from black-and-white to warm/premium aesthetic likely means different font sizes, weights, and letter-spacing. Poppins has a distinct geometric feel — bold weights (600+) look very different from the current light/regular weights used in the black-and-white theme. Changing `font-weight` globally affects every component, including forms, tables, and dialogs that may not be part of the redesign scope.

**Prevention:**
Audit every `font-*` Tailwind class across the codebase before changing weight defaults. Consider a phased approach: new components use the new typography, existing components opt-in. The `@theme` should define new `--font-weight-*` values explicitly.

---

### Pitfall 17: Dashboard Redesign — Card Alignment Breaks Across Different Viewport Widths

**Problem:**
The dashboard's metric cards and data cards need consistent alignment under the new brand theme. The current dashboard may use fixed `grid-cols-X` grids that work at specific breakpoints but break at intermediate widths. The new theme's colored backgrounds and borders make misalignment more visually obvious than the previous minimal black-and-white theme.

**Prevention:**
Use CSS Grid with `auto-fit` and `minmax()` for responsive card grids. Test at every breakpoint (375px, 640px, 768px, 1024px, 1280px). Verify cards align to the left edge and are equally spaced.

---

### Pitfall 18: Multiple `MobileNav` Components — State Duplication Across Layouts

**Problem:**
There are currently two separate `MobileNav` components: `app/admin/mobile-nav.tsx` and `app/team/mobile-nav.tsx`. The redesign calls for a unified mobile experience with hamburger left. If each component independently manages its own open/close state, the admin layout's sidebar and team layout's sidebar behave differently, creating an inconsistent user experience.

**Prevention:**
Extract a single `MobileNav` component to `components/admin/mobile-nav.tsx` that accepts `navItems` as a prop. Both admin and team layouts pass their respective navigation items. Share the open/close state logic.

---

## Minor Pitfalls

### Pitfall 19: Toast Notifications for Comment Submissions

`@radix-ui/react-toast` is installed. When a user posts a comment, a toast saying "Comment added" should appear. But if the user posts multiple comments rapidly, toast stacking can fill the screen. Use `ToastProvider` with `maxVisibleToasts=3`.

### Pitfall 20: Sidebar Redesign — Removing Large Square Blocks

The requirement says "remove large square blocks" from the sidebar. These are likely the current logo/brand blocks. Removing them changes the sidebar's height, which may affect layout calculations for the main content area (e.g., `min-h-screen` calculations, padding-top values). Verify main content still fills the viewport correctly after sidebar height changes.

### Pitfall 21: Form Validation with Zod v4

The project uses Zod v4 (`"zod": "^4.3.6"`). Zod v4 has breaking changes from v3. The `task-edit-form.tsx` already uses Zod for validation. Adding new forms (username selection, comment posting) must use Zod v4 syntax. Mixing v2/v3 patterns (`z.string().email()`) with v4 may cause subtle validation differences.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Brand Theme Migration | Halfway migration, inconsistent tokens | Full audit BEFORE changing tokens, checklist every component |
| Kanban Board | State mismatch, inline edit conflicts | Use React 19 useOptimistic, stable keys, debounce mutations |
| Calendar Overhaul | N+1 render, mobile overflow | Pre-compute date maps, mobile-first layout, virtualize |
| Task Comments | Real-time subscription leaks, RLS gaps | Channel-per-task with cleanup, EXISTS-based RLS |
| Username Onboarding | Duplicate usernames, NULL existing users | Backfill migration, uniqueness check, auto-suggest |
| Image Preview | Expired signed URLs, next/image cache | Plain `<img>` or `unoptimized`, regenerate per-open |
| Mobile Navigation | Overlay state, z-index, duplicate components | Shared MobileNav, usePathname auto-close, Radix Dialog |
| Client Portal Blocks | Data leakage via serviceRoleClient | Always filter by client_id, write RLS anyway |
| My Tasks Filters | Timezone date off-by-one | Use Postgres date functions, not JS Date |

---

## Integration Pitfall Map

The following pitfalls have **cross-phase dependencies** — a mistake in one phase breaks features in a later phase:

```
Phase 1: Brand Migration
  └─ If inconsistent tokens → Phase 2 Kanban cards, Phase 3 Calendar cells look broken
  └─ If MobileNav not unified → Phase 3 mobile calendar has no sidebar to open

Phase 2: Kanban + Username
  └─ If username backfill not done → Phase 4 comments show "undefined" as author
  └─ If Kanban keys are unstable → Phase 4 realtime comment updates re-render cards incorrectly

Phase 3: Calendar + Image Preview
  └─ If calendar renders ALL tasks → Phase 4 comment dialogs render on top of slow calendar
  └─ If image preview uses next/image → signed URLs break in calendar card thumbnails too

Phase 4: Task Comments (needs Phase 2 username)
  └─ If comment RLS is too permissive → Phase 5 client portal may expose team-only comments

Phase 5: Client Portal (needs Phase 1 mobile nav)
  └─ If serviceRoleClient lacks filtering → any new table leaks cross-client data
```

---

## Sources

- [@dnd-kit/core documentation](https://docs.dndkit.com/) — HIGH confidence (official docs)
- [React 19 useOptimistic hook](https://react.dev/reference/react/useOptimistic) — HIGH confidence (official React docs)
- [Supabase Realtime documentation](https://supabase.com/docs/guides/realtime) — HIGH confidence (official docs)
- [Supabase Storage signed URL documentation](https://supabase.com/docs/guides/storage/file-size-limits-and-caching) — HIGH confidence (official docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs) — HIGH confidence (official docs)
- [Next.js 16 App Router caching](https://nextjs.org/docs/app/building-your-application/caching) — MEDIUM confidence (Next 16 is very new)
- Next.js Image component optimization behavior — HIGH confidence (official docs)
- Radix UI Dialog focus management — HIGH confidence (official docs)
- Community experience with design system migrations — MEDIUM confidence (based on patterns observed in migration post-mortems)

---

*Pitfalls research for: v1.1 Frontend Redesign & New Features — adding Kanban, Calendar, Comments, Onboarding, Image Preview, Mobile Navigation, Client Portal*
*Researched: 2026-04-05*
