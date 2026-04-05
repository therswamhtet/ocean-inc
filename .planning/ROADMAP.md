# Roadmap: Orca Digital — Project Management & Client Portal

## Milestones

- ✅ **v1.0 MVP** — Phases 1-7 (shipped 2026-04-05)
- 🚧 **v1.1 Frontend Redesign & New Features** — Phases 8-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-7) — SHIPPED 2026-04-05</summary>

- [x] Phase 1: Foundation (5/5 plans) — Database, Auth, RLS, design system
- [x] Phase 2: Admin Core (8/8 plans) — Client, Project, Task CRUD, dashboard
- [x] Phase 3: Team Workflow (5/5 plans) — Task editing, notifications
- [x] Phase 4: Client Portal (5/5 plans) — Kanban, Calendar, Timeline views
- [x] Phase 5: UI/UX Polish (5/5 plans) — Modals, mobile, polish
- [x] Phase 6: Comprehensive UI/UX (7/7 plans) — Calendar, branding, icons
- [x] Phase 7: Gap Closure (shipped 2026-04-05) — Calendar links, grid layout, task detail

**Full details:** `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Frontend Redesign & New Features

**Milestone Goal:** Complete frontend redesign with premium brand aesthetic, improved task workflow, and new features including usernames, client descriptions, calendar overhaul, and mobile optimization.

### Phase 8: Infrastructure & Database Migrations
**Goal**: Database schema additions and shared utility refactoring required as foundation for all subsequent v1.1 features
**Depends on**: Phase 7 (v1.0 gap closure)
**Requirements**: CLIENT-11, CLIENT-12, CLIENT-13, USER-01, USER-02
**Success Criteria** (what must be TRUE):
  1. Admin can create a client with an optional description field and see it saved in the database
  2. Admin can mark a client as blocked (is_active = false) and see blocked status in the admin client list
  3. New team members can set a username during invite registration and have it stored in the database
  4. Username and real name both appear in task assignment displays across the app
**Plans**: TBD

### Phase 9: Task Management & Kanban Improvements
**Goal**: Admin can edit tasks inline on Kanban board with improved card UX and fixed interactions
**Depends on**: Phase 8 (usernames available for assignee display)
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06
**Success Criteria** (what must be TRUE):
  1. Admin can click a Kanban card and edit fields inline without navigating away from the board
  2. Task dropdown menus open when clicking any area of the task row, not just the dropdown arrow icon
  3. Task details dialog displays with updated visual design and includes all task fields
  4. Image previewer loads correctly on page reload and shows an appropriately sized preview (not full resolution)
  5. Admin can set a specific posting time for tasks, with a default of 10:00 AM when no time is specified
**Plans**: TBD
**UI hint**: yes

### Phase 10: Calendar Redesign & My Tasks Filters
**Goal**: Calendar renders with clean square day blocks and no overflow; team members can filter tasks by time period
**Depends on**: Phase 8 (username display in task assignments used by task lists)
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, TASKS-01, TASKS-02
**Success Criteria** (what must be TRUE):
  1. Calendar day cells render as square blocks in a clean month grid layout
  2. All tasks assigned to their respective days display fully without clipping or partial overflow
  3. Calendar page has no horizontal overflow or layout issues at both 375px mobile and desktop widths
  4. Team member "My Tasks" view shows filter buttons for "Today", "This week", and "This month"
  5. Selecting a time filter correctly updates the displayed task list to show only matching tasks
**Plans**: TBD
**UI hint**: yes

### Phase 11: Client Portal Upgrade
**Goal**: Client portal displays client description, supports blocked clients, and matches the new brand theme
**Depends on**: Phase 8 (client description and active flag available in database)
**Requirements**: CLIENT-14
**Success Criteria** (what must be TRUE):
  1. Client portal header displays the client description text when one is set
  2. Admin client list visually indicates when a client is blocked (is_active = false)
  3. Client portal pages render with new brand theme (cream/beige backgrounds, updated styling)
  4. Blocked clients are clearly distinguishable in the admin client management view
**Plans**: TBD
**UI hint**: yes

### Phase 12: Brand Redesign & Mobile Polish
**Goal**: Entire application adopts the new cream/beige brand aesthetic and all components respond gracefully on mobile screens
**Depends on**: Phase 9, Phase 10, Phase 11 (all feature work complete before visual polish sweep)
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, THEME-06, THEME-07, MOB-01, MOB-02, MOB-03, MOB-04
**Success Criteria** (what must be TRUE):
  1. All UI elements use the new cream/beige backgrounds, warm gradients, and colorful accent cards (replacing black-and-white)
  2. Dashboard metric cards display with colorful gradient backgrounds and consistent alignment
  3. Sidebar uses modern minimal navigation style without large square blocks
  4. Task cards show consistent text alignment, proper sizing, and modern styling across all views
  5. Dashboard and Calendar pages have no overlapping or overflow elements at 375px mobile width
  6. All cards and components resize gracefully on mobile without horizontal scroll or clipped content
  7. Mobile hamburger menu toggle is positioned on the left side of the screen
  8. Copy buttons and typography sizing are reduced across all components for cleaner readability
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Infrastructure & DB Migrations | v1.1 | 0/TBD | Not started | - |
| 9. Task Management & Kanban | v1.1 | 0/TBD | Not started | - |
| 10. Calendar Redesign & My Tasks | v1.1 | 0/TBD | Not started | - |
| 11. Client Portal Upgrade | v1.1 | 0/TBD | Not started | - |
| 12. Brand Redesign & Mobile Polish | v1.1 | 0/TBD | Not started | - |

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLIENT-11 | Phase 8 | Pending |
| CLIENT-12 | Phase 8 | Pending |
| CLIENT-13 | Phase 8 | Pending |
| USER-01 | Phase 8 | Pending |
| USER-02 | Phase 8 | Pending |
| TASK-01 | Phase 9 | Pending |
| TASK-02 | Phase 9 | Pending |
| TASK-03 | Phase 9 | Pending |
| TASK-04 | Phase 9 | Pending |
| TASK-05 | Phase 9 | Pending |
| TASK-06 | Phase 9 | Pending |
| CAL-01 | Phase 10 | Pending |
| CAL-02 | Phase 10 | Pending |
| CAL-03 | Phase 10 | Pending |
| CAL-04 | Phase 10 | Pending |
| TASKS-01 | Phase 10 | Pending |
| TASKS-02 | Phase 10 | Pending |
| CLIENT-14 | Phase 11 | Pending |
| THEME-01 | Phase 12 | Pending |
| THEME-02 | Phase 12 | Pending |
| THEME-03 | Phase 12 | Pending |
| THEME-04 | Phase 12 | Pending |
| THEME-05 | Phase 12 | Pending |
| THEME-06 | Phase 12 | Pending |
| THEME-07 | Phase 12 | Pending |
| MOB-01 | Phase 12 | Pending |
| MOB-02 | Phase 12 | Pending |
| MOB-03 | Phase 12 | Pending |
| MOB-04 | Phase 12 | Pending |

**Coverage:** 29/29 v1.1 requirements mapped

---

*Roadmap created: 2026-04-05*
*Milestone v1.1: 5 phases, 29 requirements*
