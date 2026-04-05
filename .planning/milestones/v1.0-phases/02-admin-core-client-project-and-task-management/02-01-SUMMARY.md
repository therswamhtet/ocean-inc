---
phase: 02-admin-core-client-project-and-task-management
plan: "01"
subsystem: ui
tags: [nextjs, supabase, server-actions, shadcn, admin]
requires:
  - phase: 01-foundation-database-auth-and-security
    provides: Supabase SSR auth guard, schema, and brand tokens
provides:
  - Persistent admin sidebar shell with mobile sheet navigation
  - Client directory page with active project counts and delete controls
  - Client creation flow with cryptographic slug generation and collision retry
affects: [02-02, 02-03, admin-navigation, client-crud]
tech-stack:
  added: [@radix-ui/react-dialog, @radix-ui/react-label, @radix-ui/react-slot, @radix-ui/react-toast]
  patterns: [client sidebar for pathname-aware nav state, dialog-driven CRUD forms, redirect-based server action feedback]
key-files:
  created: [app/admin/sidebar.tsx, components/ui/sheet.tsx, components/ui/button.tsx, components/ui/dialog.tsx, app/admin/clients/page.tsx, app/admin/clients/actions.ts, app/admin/clients/create-dialog.tsx]
  modified: [app/admin/layout.tsx, package.json, package-lock.json]
key-decisions:
  - "Extracted sidebar navigation into a client component so active route state can use usePathname without violating Next.js layout constraints."
  - "Derived active project counts from a left-joined projects relation in the clients page rather than changing the database or adding an RPC."
  - "Used redirect query parameters for client CRUD feedback to stay consistent with existing server action patterns."
patterns-established:
  - "Admin shell pattern: server layout handles auth and wraps client navigation components."
  - "Simple admin create flows use dialog forms with server actions and search-param feedback banners."
requirements-completed: [ADMIN-01, ADMIN-02]
duration: 4 min
completed: 2026-04-04
---

# Phase 2 Plan 1: Client CRUD with auto-generated slug and client list view Summary

**Persistent admin navigation with a mobile sheet menu, plus a client directory that creates cryptographic slugs and shows active project counts.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-04T12:10:29+06:30
- **Completed:** 2026-04-04T05:44:34Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Replaced the header-only admin shell with a persistent desktop sidebar and mobile hamburger sheet.
- Added reusable shadcn-style UI primitives needed for dialogs and future admin CRUD screens.
- Built the admin clients page with dialog-based creation, auto-generated slugs, delete actions, and active project counts.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update admin layout with persistent sidebar navigation** - `1da7f38` (feat)
2. **Task 2: Install shadcn/ui components needed for client CRUD** - `46e4968` (feat)
3. **Task 3: Create client list page with project counts and create form** - `7a65861` (feat)

**Plan metadata:** Recorded in the final docs commit for this plan.

## Files Created/Modified
- `app/admin/layout.tsx` - server-rendered admin shell with auth guard, desktop sidebar, and mobile sheet trigger
- `app/admin/sidebar.tsx` - pathname-aware client navigation component for admin routes
- `components/ui/sheet.tsx` - sheet primitive used by the mobile admin menu
- `components/ui/button.tsx` - shared brand-aligned button primitive
- `components/ui/input.tsx` - shared text input primitive
- `components/ui/label.tsx` - shared label primitive
- `components/ui/dialog.tsx` - shared dialog primitive for modal CRUD flows
- `components/ui/card.tsx` - shared card primitive for list sections and summaries
- `components/ui/badge.tsx` - shared badge primitive for counts and statuses
- `components/ui/toast.tsx` - toast primitive scaffold for future admin feedback flows
- `app/admin/clients/actions.ts` - authenticated client create/delete server actions with slug generation
- `app/admin/clients/create-dialog.tsx` - create-client dialog UI wired to the server action
- `app/admin/clients/page.tsx` - client list page with left-joined project counts and delete forms

## Decisions Made
- Extracted the nav into `app/admin/sidebar.tsx` because Next.js layouts do not re-render on navigation and should not own pathname-driven active state.
- Used search-param banners and dialog reopening for client CRUD errors instead of client-side mutation state, matching the existing server-action redirect pattern.
- Added slug collision retries around `crypto.randomBytes(8).toString('hex')` to preserve the uniqueness guarantee without schema changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added authorization checks inside client server actions**
- **Found during:** Task 3 (Create client list page with project counts and create form)
- **Issue:** The plan sketched client CRUD server actions but did not enforce per-action auth verification.
- **Fix:** Verified `supabase.auth.getUser()` inside both client server actions and redirect unauthenticated requests to `/login`.
- **Files modified:** `app/admin/clients/actions.ts`
- **Verification:** `npm run build`
- **Committed in:** `7a65861` (part of task commit)

**2. [Rule 2 - Missing Critical] Added slug collision retry handling**
- **Found during:** Task 3 (Create client list page with project counts and create form)
- **Issue:** A single insert attempt could fail on the unique slug constraint, leaving ADMIN-01 unreliable.
- **Fix:** Retried slug generation up to three times before surfacing a user-facing error.
- **Files modified:** `app/admin/clients/actions.ts`
- **Verification:** `npm run build`
- **Committed in:** `7a65861` (part of task commit)

**3. [Rule 3 - Blocking] Recreated shadcn-style primitives manually after CLI install failure**
- **Found during:** Task 1 / Task 2
- **Issue:** `npx shadcn@latest add ...` failed in this repo with `Invalid Version`, blocking the planned component installation flow.
- **Fix:** Installed the required Radix dependencies with npm and added equivalent local UI primitive files directly in `components/ui/`.
- **Files modified:** `package.json`, `package-lock.json`, `components/ui/sheet.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/dialog.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/toast.tsx`
- **Verification:** `npm run build`
- **Committed in:** `1da7f38`, `46e4968`

---

**Total deviations:** 3 auto-fixed (2 missing critical, 1 blocking)
**Impact on plan:** All fixes were required for correctness or to unblock the requested UI work. No architectural scope change was introduced.

## Issues Encountered
- The shadcn CLI could not run in this environment due to an `Invalid Version` npm/arborist error, so the components were created locally after installing the underlying Radix packages.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Client CRUD foundation is in place for plan 02-02 to hang project creation and per-client project browsing off the new client directory.
- The admin shell navigation and dialog primitives are ready for reuse across remaining Phase 2 screens.

## Self-Check: PASSED

---
*Phase: 02-admin-core-client-project-and-task-management*
*Completed: 2026-04-04*
