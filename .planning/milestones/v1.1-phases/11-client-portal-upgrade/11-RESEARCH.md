# Phase 11: Client Portal Upgrade - Research

**Gathered:** 2026-04-05
**Phase:** 11
**Goal:** Client portal displays client description, supports blocked clients, and matches the new brand theme

## Implementation Analysis

### 1. Client Description Display (D-01, D-02)

**Status: ALREADY IMPLEMENTED**

The portal header in `app/portal/[slug]/page.tsx` (lines 26-28) already displays the client description when set:

```tsx
{portalData.client.description && (
  <p className="text-sm text-muted-foreground">{portalData.client.description}</p>
)}
```

This was implemented in Phase 8. No additional work required for this criterion.

### 2. Blocked Client Handling (D-03, D-04, D-05, D-06, D-15, D-16)

**Status: MOSTLY IMPLEMENTED**

**Portal Query Filter (`lib/portal/queries.ts:45`):**
```typescript
.eq('is_active', true)
```
Blocked clients return `null` from `getPortalDataBySlug()`, triggering `notFound()` in the portal page. This matches D-03 and D-04 requirements.

**Admin Client Card (`app/admin/clients/client-card.tsx`):**
- `isActive` prop controls blocked state (line 27)
- Blocked clients display with `opacity-60` (line 75)
- `Badge variant="destructive"` shows "Blocked" label (line 91)
- `Switch` component allows toggle (line 123)
- `handleToggle()` calls `toggleClientStatusAction()` (lines 65-70)

**Gap Found:** The `toggleClientStatusAction` needs verification that it exists and works correctly.

### 3. Brand Theme Integration (D-07, D-08, D-09, D-10)

**Status: NEEDS IMPLEMENTATION**

Current theme in `app/globals.css`:
- `--color-background: #ffffff` (white)
- `--color-foreground: #111111` (near black)

Phase 11 brand direction (from CONTEXT.md):
- `--color-background: #FAF8F0` (cream/beige) for portal pages
- Warm gradient accents on task cards

**Files requiring changes:**

| File | Current State | Required Change |
|------|--------------|-----------------|
| `app/portal/[slug]/page.tsx` | White bg, black text | Add cream bg (#FAF8F0) to outer div |
| `components/portal/portal-shell.tsx` | `bg-[#222222]` active tab | Replace with brand gradient or warm color |
| `components/portal/kanban-task-card.tsx` | Default card styling | Add gradient accent styling |
| `components/portal/calendar-view.tsx` | Default styling | Apply warm color palette |

### 4. Integration Points

**Portal entry point:** `app/portal/[slug]/page.tsx`
- Header section with client name/description already present
- Wrapper div needs cream background

**Portal shell:** `components/portal/portal-shell.tsx`
- Tab buttons currently use `bg-[#222222]` for active state
- Need to update to brand-consistent warm color

**Kanban view:** `components/portal/kanban-view.tsx` and `kanban-task-card.tsx`
- Task cards need gradient accent updates

**Calendar view:** `components/portal/calendar-view.tsx`
- Calendar cells and task pills need warm color palette

### 5. Technical Verification Needed

1. **Action exists:** `toggleClientStatusAction` in `app/admin/clients/actions.ts`
2. **Database column:** `is_active` exists on `clients` table (from Phase 8)
3. **Portal queries filter:** `.eq('is_active', true)` correctly filters blocked clients

## Validation Architecture

### Phase 11 Success Criteria Verification

| Criterion | Verification Method |
|-----------|-------------------|
| Client description displays in portal header | Visual inspection of `app/portal/[slug]/page.tsx` |
| Admin client list shows blocked indicator | Visual inspection with blocked test client |
| Portal pages use cream/beige backgrounds | CSS class or inline style check |
| Blocked clients distinguishable in admin | Badge + opacity check |

## Risks & Recommendations

1. **Brand theme consistency:** Phase 12 will cascade brand globally. Phase 11 should use CSS variables where possible to ease Phase 12 integration.

2. **Blocked client UX:** Current implementation hides blocked clients from portal entirely. If a blocked client tries to access their portal, they see a 404. This may be confusing - consider a custom "Access Denied" page in the future.

3. **CSS specificity:** Applying brand theme directly in portal components (vs global CSS) may cause specificity conflicts during Phase 12 global rollout.

## Conclusion

Phase 11 has two main work items:
1. **Verify** blocked client toggle functionality works end-to-end
2. **Apply** cream/beige brand theme to portal surfaces

Most blocked client display logic is already implemented. The primary work is brand theme integration on portal pages.
