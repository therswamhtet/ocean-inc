# Phase 11: Client Portal Upgrade - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous workflow)

<domain>
## Phase Boundary

Client portal displays client description, supports blocked clients, and matches the new brand theme. Integrates Phase 8 database fields (description, is_active) into portal UI and applies v1.1 brand aesthetic to portal surfaces. Phase 12 completes the full brand redesign.

</domain>

<decisions>
## Implementation Decisions

### Client Description in Portal
- **D-01:** Portal header (`app/portal/[slug]/page.tsx`) already displays description when set — confirmed working from Phase 8
- **D-02:** Description shows as muted text below client name in the header section

### Blocked Client Handling
- **D-03:** Portal queries (`lib/portal/queries.ts`) filter by `is_active = true` — blocked clients return no data
- **D-04:** Blocked client accessing portal sees `notFound()` — behaves as if client doesn't exist (not a warning)
- **D-05:** Admin client list (`client-card.tsx`) shows blocked clients with Badge variant="destructive" + reduced opacity (0.6)
- **D-06:** Admin can toggle client active status via Switch component on client card

### Brand Theme Integration (Phase 11 scope)
- **D-07:** Portal pages adopt new cream/beige backgrounds (#FAF8F0) and warm styling per v1.1 brand direction
- **D-08:** Portal shell and child components receive same brand treatment as admin surfaces (Phase 12 will apply globally)
- **D-09:** Task cards in portal views use gradient accent styling consistent with new design language
- **D-10:** Portal header area uses cream background with updated typography

### Integration Points
- **D-11:** `app/portal/[slug]/page.tsx` — portal entry point, needs brand theme wrapper
- **D-12:** `components/portal/portal-shell.tsx` — tab buttons and layout containers need brand styling
- **D-13:** `components/portal/kanban-view.tsx` and `kanban-task-card.tsx` — need gradient accent updates
- **D-14:** `components/portal/calendar-view.tsx` — calendar cells and task pills need warm color palette

### Blocked Client Admin UX
- **D-15:** Blocked clients remain visible in admin list (not hidden) with visual indicator
- **D-16:** Toggle switch allows admin to unblock client — immediate reactivation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Portal Implementation
- `app/portal/[slug]/page.tsx` — portal entry point with header (already shows description)
- `components/portal/portal-shell.tsx` — tab navigation and layout wrapper
- `components/portal/kanban-view.tsx` — Kanban board container
- `components/portal/kanban-task-card.tsx` — individual task cards in Kanban
- `components/portal/calendar-view.tsx` — calendar grid with day cells and task pills
- `lib/portal/queries.ts` — portal data queries with is_active filter

### Admin Client Management
- `app/admin/clients/page.tsx` — client list page
- `app/admin/clients/client-card.tsx` — client card with blocked indicator and toggle

### Brand Design System (Phase 12 reference)
- `.planning/REQUIREMENTS.md` §Branding & Design System (lines 139-147): THEME-01 through THEME-07
- `.planning/PROJECT.md` §Current Milestone: v1.1 Frontend Redesign — brand direction described

### Requirements
- `.planning/REQUIREMENTS.md` — CLIENT-14 (blocked client admin display)
- `.planning/ROADMAP.md` — Phase 11 success criteria

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `PortalShell` component: already handles tab switching (Kanban/Calendar), needs brand styling
- `PortalKanbanView` and `PortalCalendarView`: existing views that need styling updates
- `client-card.tsx`: already has blocked indicator implementation (Badge + opacity) — pattern to follow
- `portalData.client.description`: already being fetched and displayed

### Established Patterns
- Tab toggle style: `activeTab === tab ? 'bg-[#222222] text-white' : 'text-foreground'` (from portal-shell.tsx)
- Task pills: truncate with ellipsis, title tooltip on hover
- Status dots: pulse animation for overdue tasks

### Integration Points
- Brand theme application starts with portal header wrapper in `app/portal/[slug]/page.tsx`
- Phase 12 brand work will cascade to all portal components — Phase 11 prepares surfaces

</codebase_context>

<specifics>
## Specific Ideas

Phase 11 is primarily Phase 8's database fields (description, is_active) being surfaced in UI, plus brand theme preparation. Most functional requirements are already implemented. The primary work is brand theme integration on portal surfaces.
</specifics>

<deferred>
## Deferred Ideas

None — scope limited to Phase 11 success criteria and CLIENT-14 requirement.

</deferred>

---

*Phase: 11-client-portal-upgrade*
*Context gathered: 2026-04-05*
