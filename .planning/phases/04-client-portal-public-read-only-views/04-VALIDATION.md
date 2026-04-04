---
phase: 04
slug: client-portal-public-read-only-views
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-04
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npm run test -- __tests__/portal-*.test.ts*` |
| **Full suite command** | `npm run test && npm run build` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- __tests__/portal-*.test.ts*`
- **After every plan wave:** Run `npm run test && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | CLIENT-01, CLIENT-02, CLIENT-09 | unit | `npm run test -- __tests__/portal-queries.test.ts` | ✅ / ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CLIENT-01, CLIENT-08, CLIENT-09 | integration | `npm run lint -- app/portal/[slug]/page.tsx components/portal/portal-shell.tsx` | ✅ / ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | CLIENT-08 | migration | `rg "portal|anon|select" supabase/migrations/007_client_portal_read_policies.sql` | ✅ / ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | CLIENT-03, CLIENT-06 | component | `npm run test -- __tests__/portal-kanban.test.tsx` | ✅ / ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | CLIENT-04 | unit | `npm run test -- __tests__/portal-calendar-utils.test.ts` | ✅ / ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | CLIENT-05 | unit | `npm run test -- __tests__/portal-timeline-utils.test.ts` | ✅ / ❌ W0 | ⬜ pending |
| 04-05-01 | 05 | 3 | CLIENT-07, CLIENT-10 | integration | `npm run test -- __tests__/portal-task-dialog.test.tsx` | ✅ / ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/portal-queries.test.ts` — query + slug handling tests
- [ ] `__tests__/portal-kanban.test.tsx` — 3-column rendering + overdue-dot behavior tests
- [ ] `__tests__/portal-calendar-utils.test.ts` — week/month grouping tests
- [ ] `__tests__/portal-timeline-utils.test.ts` — month swimlane grouping tests
- [ ] `__tests__/portal-task-dialog.test.tsx` — modal content/read-only tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual layout and mobile behavior at 375px | CLIENT-03, CLIENT-04, CLIENT-05 | Pixel-level layout fidelity | Run `npm run dev`, open `/portal/[slug]`, verify tabs/views/modal at 375px in browser devtools |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
