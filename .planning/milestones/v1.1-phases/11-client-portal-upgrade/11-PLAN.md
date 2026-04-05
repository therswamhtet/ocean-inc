---
wave: 1
depends_on: []
files_modified:
  - app/portal/[slug]/page.tsx
  - components/portal/portal-shell.tsx
  - components/portal/kanban-task-card.tsx
  - components/portal/calendar-view.tsx
  - app/admin/clients/client-card.tsx
  - app/admin/clients/actions.ts
requirements_addressed:
  - CLIENT-14
autonomous: false
---

# Phase 11: Client Portal Upgrade - Plan

## objective

Apply the v1.1 brand theme (cream/beige backgrounds) to client portal pages and verify blocked client functionality end-to-end.

## background

Phase 8 added `description` and `is_active` fields to clients. Phase 11 surfaces these in the UI and applies Phase 12's brand direction early to portal surfaces. Most blocked-client logic already exists in `client-card.tsx` — this phase verifies it works and applies brand styling.

## Tasks

### Task 1: Verify blocked client toggle functionality

**objective:** Confirm the admin can toggle a client's blocked status and the portal correctly hides blocked clients.

<read_first>
- app/admin/clients/client-card.tsx
- app/admin/clients/actions.ts
- lib/portal/queries.ts
- .planning/phases/11-client-portal-upgrade/11-RESEARCH.md
</read_first>

<acceptance_criteria>
- `toggleClientStatusAction` function exists in `app/admin/clients/actions.ts`
- `app/admin/clients/client-card.tsx` calls `toggleClientStatusAction` when Switch is toggled
- `lib/portal/queries.ts` filters by `.eq('is_active', true)` so blocked clients return null
- When `getPortalDataBySlug` returns null, portal shows `notFound()`
</acceptance_criteria>

<action>
1. Read `app/admin/clients/actions.ts` to confirm `toggleClientStatusAction` exists
2. Read `lib/portal/queries.ts` lines 41-50 to confirm `is_active` filter is present
3. If `toggleClientStatusAction` is missing, create it using `createServerClient` to update `clients.is_active`
4. If filter is missing, add `.eq('is_active', true)` to the client query
</action>

---

### Task 2: Apply brand theme to portal page header

**objective:** Update `app/portal/[slug]/page.tsx` to use cream background (#FAF8F0) on the portal header and outer wrapper.

<read_first>
- app/portal/[slug]/page.tsx
- app/globals.css
- .planning/phases/11-client-portal-upgrade/11-CONTEXT.md (D-07, D-10)
</read_first>

<acceptance_criteria>
- Outer wrapper div has `className` containing `bg-[#FAF8F0]` or style applying cream background
- Header section uses cream background
- Client name and description are visible against the cream background
</acceptance_criteria>

<action>
In `app/portal/[slug]/page.tsx`:
1. Change line 21 outer div className from `mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8` to `mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 bg-[#FAF8F0]`
2. Change line 22 header div className from `flex items-center gap-3 space-y-2 rounded-lg border border-border p-5` to `flex items-center gap-3 space-y-2 rounded-lg border border-border p-5 bg-white`
</action>

---

### Task 3: Update portal shell tab styling to brand theme

**objective:** Replace the `bg-[#222222]` active tab color with a brand-consistent warm color in `portal-shell.tsx`.

<read_first>
- components/portal/portal-shell.tsx
- .planning/phases/11-client-portal-upgrade/11-CONTEXT.md (D-08)
</read_first>

<acceptance_criteria>
- Active tab button no longer uses `bg-[#222222]`
- Active tab uses a warm color that fits the cream/beige brand direction
- Inactive tabs remain clearly distinguishable from active tabs
</acceptance_criteria>

<action>
In `components/portal/portal-shell.tsx`:
1. Change line 49 active tab className from `bg-[#222222] text-white` to `bg-[#b45309] text-white` (warm amber that complements cream)
2. Optionally add a subtle gradient: `bg-gradient-to-br from-amber-600 to-orange-700`
</action>

---

### Task 4: Apply brand theme to kanban task cards

**objective:** Add warm gradient accents to task cards in the portal kanban view.

<read_first>
- components/portal/kanban-task-card.tsx
- components/portal/kanban-view.tsx
- .planning/phases/11-client-portal-upgrade/11-CONTEXT.md (D-09)
</read_first>

<acceptance_criteria>
- Task card has a colored left border or gradient accent
- Status indicator colors match the warm palette (done=#22c55e, in_progress=#facc15 stays, overdue=#ef4444 stays)
- Card background is white or cream, not stark white
</acceptance_criteria>

<action>
In `components/portal/kanban-task-card.tsx`:
1. Add a warm gradient border or left accent stripe using `border-l-4 border-amber-500` or similar
2. Ensure card has `bg-white` background for contrast against cream portal background
</action>

---

### Task 5: Apply brand theme to calendar view

**objective:** Update calendar cells and task pills to use the warm color palette.

<read_first>
- components/portal/calendar-view.tsx
- .planning/phases/11-client-portal-upgrade/11-CONTEXT.md (D-14)
</read_first>

<acceptance_criteria>
- Calendar day cells have cream/beige background or subtle warm border
- Task pills use warm color palette consistent with brand
- Calendar grid maintains clean square blocks (from Phase 10)
</acceptance_criteria>

<action>
In `components/portal/calendar-view.tsx`:
1. Add `bg-[#FAF8F0]` or warm tint to calendar container/grid
2. Ensure task pills within calendar use status colors consistent with the brand
</action>

---

## Verification

1. **Visual inspection checklist:**
   - [ ] Portal page at `/portal/[slug]` shows cream (#FAF8F0) background
   - [ ] Client name and description visible in header
   - [ ] Tab buttons use warm amber active state
   - [ ] Kanban task cards have gradient/warm accent
   - [ ] Calendar has warm color scheme

2. **Functional verification:**
   - [ ] Create a test client, mark as blocked (is_active=false)
   - [ ] Verify blocked client does not appear in portal
   - [ ] Verify blocked client appears in admin with "Blocked" badge and reduced opacity
   - [ ] Toggle client back to active, verify portal shows client again

3. **Browser test:**
   - Navigate to `/portal/test-client-slug` (use existing client)
   - Confirm cream background, warm tab styling, gradient task cards

## must_haves

- Portal header displays cream background (#FAF8F0)
- Portal shell tab buttons use warm amber active state
- Kanban task cards have warm gradient accent styling
- Calendar view uses warm color palette
- Blocked client shows destructive badge + 0.6 opacity in admin
- Toggle switch changes client active status in database
