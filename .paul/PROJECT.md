# Orca Digital

## What This Is

An internal project management tool with a read-only client-facing portal for Orca Digital, a digital marketing agency. The agency manages monthly social media content projects for clients — each month is a "project" containing "tasks" (social media posts with captions, design files, and posting dates). Three user types: Admin (full control), Team Members (assigned tasks only), and Clients (read-only portal via magic link).

## Core Value

Admins can create and manage social media content tasks, assign them to team members, and give clients a clean read-only view of their project progress — all in one place.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 1.1.0 |
| Status | Production (v1.1 shipped) |
| Last Updated | 2026-04-07 |

## Requirements

### Validated (Shipped)

- [x] Admin can manage clients (create, view projects) — Phase 02
- [x] Admin can create projects per client (monthly social media content cycles) — Phase 02
- [x] Admin can create and manage tasks (posts with caption, design file, dates, briefing) — Phase 02
- [x] Admin can assign tasks to team members — Phase 02
- [x] Admin can view dashboard with project/task metrics — Phase 02
- [x] Admin can manage team members (invite, view assignments) — Phase 02
- [x] Admin can view and manage notifications — Phase 02/03
- [x] Team members register via one-time invite token — Phase 02
- [x] Team members see only their assigned tasks — Phase 03
- [x] Team members can upload design files and edit captions — Phase 03
- [x] Team members can mark tasks as done and notify admin — Phase 03
- [x] Supabase RLS enforces role-based data access — Phase 03
- [x] Admin authentication via email + password — Phase 01
- [x] Client portal is accessible via unique slug URL (no login) — Phase 04
- [x] Client portal shows active project with Kanban, Calendar views — Phase 04
- [x] Client can view task details (caption, design file, posting date, status) — Phase 04
- [x] UI/UX polish across admin, team, and portal surfaces — Phase 05/06
- [x] New brand theme: cream/beige backgrounds, warm gradients, colorful accent cards — Phase 12
- [x] Username support for team members on invite registration — Phase 08
- [x] Client description field and blocked (is_active) clients — Phase 08/11
- [x] Inline Kanban card editing via dialog overlay — Phase 09
- [x] Task detail dialog with image preview fixes — Phase 09
- [x] Calendar redesigned with square day blocks — Phase 10
- [x] My Tasks filters (Today, This week, This month) — Phase 10
- [x] Mobile optimization: hamburger on left, responsive layouts — Phase 12

### Active (In Progress)

- [ ] Team members can comment on tasks — **v1.2**
- [ ] Review/approval workflow (client can request revisions) — **v1.2**

### Out of Scope

- Email notifications — app notifications only for MVP
- Direct social media integration — not needed; content management, not publishing
- Payment system — not part of agency workflow
- Client login/accounts — magic link via unique slug only
- Multiple admin accounts — single admin account is sufficient
- Activity log / audit trail — not needed for MVP
- Search functionality — deferred until scale demands it
- File versioning — single file per task is sufficient

## Constraints

### Technical Constraints
- Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Supabase (DB + Auth + Storage), Vercel hosting
- Supabase Auth with RLS — security requirement for team member data isolation

### Business Constraints
- Cream/beige (#FAF8F0) backgrounds, warm gradients, colorful accent cards, bold modern typography
- Must work on 375px width screens — agency clients access via phone
- No paid third-party services beyond Supabase and Vercel — keep costs minimal

### Context
- Monthly social media content projects — each project = one month for one client
- Tasks = individual social media posts with caption, design file, posting date
- Clients have viewing modes: Kanban, Calendar (week + month)
- Status indicators: todo, in_progress, done, overdue (with animated pulsing dots)
- Briefing text supports clickable links
- Caption field always has a "Copy" button
- Design file always has a "Download" button

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for DB + Auth + Storage | Single service covers all backend needs, generous free tier, excellent Next.js integration | Validated — fully operational |
| Client portal via slug (no auth) | Reduces friction for clients, no password management needed | Validated — portal working |
| Team member invite tokens | One-time use tokens prevent unauthorized access without email service | Validated — implemented |
| No email notifications | Avoids email service dependency for MVP; in-app notifications sufficient | Validated — in-app only |
| Tailwind CSS 4 + shadcn/ui | Design system — cream/beige premium aesthetic | Validated — v1.1 shipped |
| Kanban as default project view | More actionable than timeline for monthly content | Validated — team uses Kanban daily |
| Client color/logo branding | Per-client visual identity in portal | Validated — enhances client experience |
| Username @handle system | Social-media style usernames for task assignments | Validated in Phase 08 |
| Inline Kanban editing via dialog | Click card to edit without navigation | Validated in Phase 09 |
| Cream/beige brand aesthetic | Premium warm design replacing black-and-white | Validated in Phase 12 |

## Tech Stack / Tools

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16.2.2 (App Router) | Server components, server actions |
| UI Library | React 19.2.4 | |
| Styling | Tailwind CSS v4 + shadcn/ui | Cream/beige premium aesthetic |
| Component Primitives | Radix UI | @radix-ui/react-dialog, dropdown-menu, select, etc. |
| Forms | react-hook-form + Zod | Schema validation |
| Database | Supabase PostgreSQL | 8 tables, 14 migrations |
| Auth | Supabase Auth | Email/password, role-based (admin, team_member) |
| Storage | Supabase Storage | design-files bucket, 10MB limit |
| Drag & Drop | dnd-kit | Kanban boards |
| Icons | Lucide React | |
| Dates | date-fns | Calendar grid builders |
| Testing | Vitest + Testing Library | 16 tests (jsdom) |
| Hosting | Vercel | Automatic deploys |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| v1.1 shipped | All phases 8-12 complete | Shipped 2026-04-06 | Achieved |
| v1.2 planning | Define Phase 13+ | In progress | In progress |
