# Quick Plan fs9: Client Section Alignment, Color Coding, Status Icons

## Summary

**Plan:** quick-01
**Phase:** quick (fs9)
**Executed:** 2026-04-05
**Duration:** ~4 minutes
**Tasks Completed:** 5 main tasks + 3 verifications

---

## One-Liner

Removed Timeline tab, fixed Add Client button alignment, added client color indicators to detail/portal headers, and added status icons to project tables.

---

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 97a6087 | docs(quick): create plan for portal timeline removal |
| 2 | 1cbf50f | feat(quick): remove Timeline tab from portal shell |
| 3 | 2dc1cf6 | fix(quick): align Add Client button with header content |
| 4 | ff6a985 | feat(quick): add client color indicator to detail page |
| 5 | 7eefc9a | feat(quick): add client color to portal header |
| 6 | 73c8869 | feat(quick): add status icons to project table |

---

## Tasks Executed

### Task 1: Remove Timeline Tab from Portal Shell
**Status:** ✅ Complete  
**Files Modified:**
- `components/portal/portal-shell.tsx`

**Changes:**
- Removed `PortalTimelineView` import
- Changed `tabLabels` from `['Kanban', 'Calendar', 'Timeline']` to `['Kanban', 'Calendar']`
- Simplified conditional rendering to handle only two views
- Kanban remains the default selected tab

**Verification:** `grep "Timeline" portal-shell.tsx` returns no matches.

---

### Task 2: Fix Client Section Alignment
**Status:** ✅ Complete  
**Files Modified:**
- `app/admin/clients/page.tsx`

**Changes:**
- Changed `sm:items-end` to `sm:items-center` in the header flex container
- The Add Client button now aligns vertically with the header content instead of sitting lower

---

### Task 3: Add Client Color to Client Detail Page
**Status:** ✅ Complete  
**Files Modified:**
- `app/admin/clients/[clientId]/page.tsx`

**Changes:**
- Added `color` to the client query select
- Added `CLIENT_PALETTE` constant and `getColorForClient()` helper function
- Display color bar (matching client-card style) in the client detail header
- Uses `h-5 w-1` color bar with `rounded-sm`

---

### Task 4: Add Client Color to Portal Header
**Status:** ✅ Complete  
**Files Modified:**
- `lib/portal/types.ts`
- `lib/portal/queries.ts`
- `app/portal/[slug]/page.tsx`

**Changes:**
- Added `color` field to `PortalClient` type
- Updated `getPortalDataBySlug()` to select and return client color
- Added color bar indicator to portal header (matching client-card style)

---

### Task 5: Add Status Icons to Project Table
**Status:** ✅ Complete  
**Files Modified:**
- `app/admin/clients/[clientId]/page.tsx`

**Changes:**
- Added `StatusBadge` component with colored dot indicators
- Color mapping: Green (active), Yellow (paused), Gray (done)
- Applied to both desktop table and mobile cards

---

### Task 6: Verify Kanban Default
**Status:** ✅ Verified (No Changes Needed)  
**File:** `app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle.tsx`

**Finding:** Kanban is already the default view (line 43: `useState<'list' | 'kanban'>('kanban')`)

---

### Task 7: Verify Calendar View
**Status:** ✅ Verified (No Changes Needed)  
**File:** `components/portal/calendar-view.tsx`

**Finding:** `StatusDot` is already properly used for task items in both month and week modes.

---

### Task 8: Verify Design File Downloader
**Status:** ✅ Verified (No Changes Needed)  
**File:** `components/admin/design-file-downloader.tsx`

**Finding:** Component correctly creates signed URLs and opens them in a new tab for direct downloads.

---

## Files Modified

| File | Change |
|------|--------|
| `components/portal/portal-shell.tsx` | Removed Timeline tab, simplified to 2 tabs |
| `app/admin/clients/page.tsx` | Fixed button alignment |
| `app/admin/clients/[clientId]/page.tsx` | Added color indicator, status badges |
| `lib/portal/types.ts` | Added color to PortalClient |
| `lib/portal/queries.ts` | Added color to query |
| `app/portal/[slug]/page.tsx` | Added color indicator to header |

---

## Deviations from Original Plan

The original plan only covered removing the Timeline tab. Additional issues were identified and addressed:
- **Rule 2 (Auto-add missing critical functionality):** Client detail and portal headers lacked color indicators present in client-card
- **Rule 2 (Auto-add missing critical functionality):** Project table lacked status visual indicators

---

## Key Decisions

1. **Removed Timeline:** Simplified portal to Kanban + Calendar only (2 tabs)
2. **StatusBadge over StatusDot:** Created separate StatusBadge for project statuses (active/paused/done) since StatusDot only supports task statuses
3. **Consistent color indicator style:** Used `h-5 w-1 rounded-sm` matching client-card across all locations

---

## Self-Check: PASSED

All committed files exist:
- ✅ `components/portal/portal-shell.tsx` - Timeline removed
- ✅ `app/admin/clients/page.tsx` - Button aligned
- ✅ `app/admin/clients/[clientId]/page.tsx` - Color + status badges
- ✅ `lib/portal/types.ts` - PortalClient includes color
- ✅ `lib/portal/queries.ts` - Query returns color
- ✅ `app/portal/[slug]/page.tsx` - Portal header has color

All commit hashes verified in git log.
