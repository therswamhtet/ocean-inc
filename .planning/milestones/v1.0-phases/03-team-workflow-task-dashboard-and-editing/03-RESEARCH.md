# Phase 03: Team Workflow — Task Dashboard and Editing - Research

**Researched:** 2026-04-04
**Domain:** Team-member task workflow in Next.js 16 App Router + Supabase RLS + existing admin notification surfaces
**Confidence:** HIGH

## Summary

Phase 03 can ship entirely on the existing stack. No new external libraries are required. The fastest path is to mirror the established admin server-first patterns while creating a separate `/team` surface per D-02, then extend the existing notifications system with one new team-member INSERT RLS policy and an admin unread badge.

**Primary recommendation:**
- Build `/team` as a server-rendered route group with its own layout and sidebar, matching the admin shell pattern.
- Keep team task detail as `page.tsx` + colocated `'use client'` form boundary, reusing `CopyButton`, `DesignFileUploader`, `DesignFileDownloader`, `StatusDot`, and `linkify()`.
- Use a dedicated `app/team/tasks/actions.ts` file for team mutations so RLS, revalidation, and notify/done behavior stay isolated from admin actions.
- Implement notifications with the existing `notifications` table and `revalidatePath()` refreshes only — **no Supabase Realtime** per D-09.

<user_constraints>
## User Constraints (from 03-CONTEXT.md)

### Locked Decisions
- **D-01:** `app/page.tsx` and `app/login/actions.ts` must redirect `team_member` users to `/team` and admins to `/admin`.
- **D-02:** Team task detail is a dedicated route at `app/team/tasks/[taskId]/page.tsx`.
- **D-03:** Team task detail read-only fields are labeled text: title, briefing with `linkify()`, posting date, due date, deadline.
- **D-04:** Editable fields are caption textarea + CopyButton, design file upload/download, and status select. Each can be changed independently.
- **D-05:** "Notify Assigner" is a separate explicit action with confirmation dialog.
- **D-06:** Notify action inserts admin notification with `team_member_id = NULL` and message `"[Member name] marked [task title] as done."`, then updates task status to `done`.
- **D-07:** Add a new RLS policy allowing team members to `INSERT` notifications where `team_member_id IS NULL`.
- **D-08:** Notify action must require confirmation before mutation.
- **D-09:** No realtime subscription; refresh notifications via `revalidatePath()` on normal navigation.

### Agent's Discretion
- Team sidebar visual details
- Summary card spacing/typography
- Exact team task list/table composition beyond the required columns
- Inline success/error feedback wording

### Deferred Ideas
- No Supabase Realtime
- No team comments
- No task reassignment between team members
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEAM-01 | Team dashboard shows total assigned, due today, overdue, completed | Server component `Promise.all` metric counts, same pattern as `app/admin/page.tsx` |
| TEAM-02 | Team sees assigned tasks sorted by due date with project, client, title, status dot | RSC task query through `task_assignments` join, `order('due_date')`, render `StatusDot` |
| TEAM-03 | Team task detail shows read-only title, briefing links, posting date, due date | Dedicated server page + `linkify()` preview block |
| TEAM-04 | Team can edit caption and design file | Reuse existing uploader/downloader + isolated team server actions |
| TEAM-05 | Team can change task status | Reuse existing select pattern with team-scoped update action |
| TEAM-06 | Notify Assigner creates admin notification and marks task done | One server action transaction-like flow: validate ownership → insert notification → update task |
| TEAM-07 | Team member can only see/edit own assigned tasks | Existing `team_select_tasks` / `team_update_tasks` policies already scope tasks; add regression verification script + team-only queries |
| TEAM-08 | Caption has Copy button; design file has Download button | Reuse existing client helpers |
| NOTIF-01 | Notification row created when team member clicks Notify Assigner | Insert into `notifications` from team action |
| NOTIF-02 | Message format is `[Team member name] marked [task title] as done.` | Build string from joined task + team member records |
| NOTIF-03 | Admin notifications page lists all notifications and marks read on click | Existing page already does this; Phase 03 only needs new notifications to flow into it |
| NOTIF-04 | Unread count badge displayed on bell icon in header | Add unread-count query to admin layout and revalidate layout-aware paths |
| NOTIF-05 | Notifications shown on admin dashboard | Existing dashboard already shows the latest 5; new team notifications will appear automatically |

</phase_requirements>

## Standard Stack

### Existing Components to Reuse
- `components/ui/status-dot.tsx`
- `components/admin/copy-button.tsx`
- `components/admin/design-file-uploader.tsx`
- `components/admin/design-file-downloader.tsx`
- `components/ui/card.tsx`
- `components/ui/select.tsx`
- `components/ui/dialog.tsx`
- `components/ui/badge.tsx`

### Existing Data/Mutation Patterns to Reuse
- Server pages: `await createClient()` → `auth.getUser()` → direct Supabase queries
- Mutations: `'use server'` file + auth guard + mutation + `revalidatePath()`
- Next.js 16 route files use `params: Promise<{ ... }>`
- Keep interactive browser code inside colocated `'use client'` leaf components

### No New Dependencies Needed
`package.json` already contains the required UI, form, date, icon, and Supabase packages.

## Architecture Patterns

### Pattern 1: Separate team shell, not admin reuse

Create a dedicated `/team` layout and sidebar rather than conditionally reusing the admin layout. This directly implements D-02 and avoids role-condition sprawl inside admin files.

Recommended files:

```text
app/team/
  layout.tsx
  sidebar.tsx
  page.tsx
  tasks/
    actions.ts
    [taskId]/
      page.tsx
      task-detail-form.tsx
```

### Pattern 2: Team task reads rely on RLS, but still query through assignments

Even though RLS already hides unassigned tasks, query tasks via the assignment relationship so the page logic naturally matches TEAM-02 and TEAM-07:
- team dashboard: `task_assignments(team_member_id = auth.uid())` with joined `tasks`, `projects`, `clients`
- team detail: `tasks` + joined `projects(clients(...))`, relying on `.single()`/`notFound()` when task is not visible

### Pattern 3: Notify Assigner uses explicit action, not status side effect

Do **not** overload generic status updates. Keep a dedicated `notifyAssignerAction(taskId)` that:
1. verifies the signed-in user is the assigned team member
2. fetches team member name + task title
3. inserts notification with `team_member_id: null`
4. updates `tasks.status` to `'done'`
5. revalidates `/team`, `/team/tasks/[taskId]`, `/admin`, `/admin/notifications`, and `/admin` layout surfaces

### Pattern 4: Admin unread badge belongs in layout

Unread count is cross-page navigation state, so query it in `app/admin/layout.tsx` and render a bell link with badge there. Notification mutation actions should revalidate both page routes and the admin layout tree.

## Common Pitfalls

1. **Forgetting role-aware redirect updates** — Phase 1 login/root redirects currently send every signed-in user to `/admin`.
2. **Mixing admin and team mutation files** — causes auth assumptions and revalidation paths to bleed together.
3. **Treating notify as a plain task update** — D-05 requires a separate confirmed action.
4. **Adding realtime complexity** — directly violates D-09.
5. **Assuming notification badge updates from page revalidation alone** — layout-aware surfaces need explicit revalidation coverage.

## Validation Architecture

This repo has no dedicated test framework yet, so Phase 03 validation should use:
- **Quick checks:** `npx eslint <touched files>`
- **Build check:** `npm run build`
- **Behavior regression script:** `node scripts/verify-team-rls.ts` after the team routes and notify flow land

Phase 03 should therefore add one lightweight verification script instead of introducing a full test runner mid-phase.

## Implementation Notes for Planning

- Keep plan scopes vertical and narrow: shell/dashboard, task detail editing, notify mutation, admin badge wiring, then RLS verification.
- Reuse the existing black-and-white card and border-only patterns from admin surfaces.
- Do not add comments, filtering, search, or realtime subscriptions.
