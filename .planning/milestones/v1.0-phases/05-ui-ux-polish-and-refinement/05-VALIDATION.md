---
phase: 05
slug: ui-ux-polish-and-refinement
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-04
last_verified: 2026-04-05
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npm run test -- __tests__/polish-*.test.ts*` |
| **Full suite command** | `npm run test && npm run build` |
| **Estimated runtime** | ~3 seconds |
| **Actual runtime** | 2.89s |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- __tests__/polish-*.test.ts*`
- **After every plan wave:** Run `npm run test && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-01 | 01 | 1 | Modal sizing | static-analysis | `npm run test -- __tests__/polish-modal-sizing.test.tsx` | ✅ green |
| 05-01-02 | 01 | 1 | Share links | integration | `npm run test -- __tests__/polish-share-link.test.tsx` | ✅ green |
| 05-01-03 | 01 | 1 | Terminology | lint | `npm run test -- __tests__/polish-labels-usage.test.ts` | ✅ green |
| 05-02-01 | 02 | 2 | Mobile nav | static-analysis | `npm run test -- __tests__/polish-mobile-nav.test.tsx` | ✅ green |
| 05-02-02 | 02 | 2 | Calendar polish | static-analysis | `npm run test -- __tests__/polish-calendar-touch-targets.test.tsx` | ✅ green |
| 05-02-03 | 02 | 2 | Task dashboard | static-analysis | `npm run test -- __tests__/polish-dashboard-metrics.test.tsx` | ✅ green |
| 05-03-01 | 03 | 2 | Card redesign | static-analysis | `npm run test -- __tests__/polish-card-variants.test.tsx` | ✅ green |
| 05-03-02 | 03 | 2 | Client cards clickable | static-analysis | `npm run test -- __tests__/polish-client-cards.test.tsx` | ✅ green |
| 05-03-02 | 03 | 2 | Responsive tables | static-analysis | `npm run test -- __tests__/polish-responsive-tables.test.tsx` | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements (Complete)

- [x] `__tests__/polish-modal-sizing.test.tsx` — 8 tests: responsive dialog sizing, consistent card tokens
- [x] `__tests__/polish-mobile-nav.test.tsx` — 12 tests: hamburger toggle, Sheet usage, 44px targets
- [x] `__tests__/polish-card-variants.test.tsx` — 13 tests: ContentCard component, terminology audit

---

## Expanded Test Suite (Nyquist Audit)

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| `polish-modal-sizing.test.tsx` | 8 | Dialog responsive sizing, consistent card tokens |
| `polish-share-link.test.tsx` | 7 | Absolute URLs, clipboard API, feedback, integration |
| `polish-labels-usage.test.ts` | 8 | Centralized labels across all surfaces, no duplicates |
| `polish-mobile-nav.test.tsx` | 12 | Admin + team hamburger menus, 44px targets, aria |
| `polish-calendar-touch-targets.test.tsx` | 6 | 44px minimum, horizontal scroll, truncate |
| `polish-dashboard-metrics.test.tsx` | 13 | Admin + team responsive grid, consistent sizing |
| `polish-card-variants.test.tsx` | 13 | ContentCard component, terminology audit, "admin console" removal |
| `polish-client-cards.test.tsx` | 5 | Full card clickability, stopPropagation, visual affordance |
| `polish-responsive-tables.test.tsx` | 9 | Task/project/team tables, portal tabs responsive |

**Total: 85 tests across 9 test files — all passing.**

---

## Manual-Only Verifications (Still Recommended)

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Modal visual sizing at 375px, 768px, 1024px | Pixel-level layout fidelity | Open app in devtools at each breakpoint, verify modal width/scroll |
| Share link copy + paste flow | Browser clipboard API | Copy link, paste in new tab, verify portal loads |
| Calendar at 375px — touch + scroll | Actual touch behavior | Browser devtools mobile mode, tap and scroll |
| Hamburger animation smoothness | Subjective UX | DevTools mobile mode, observe animation quality |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s (~3s actual)
- [x] `nyquist_compliant: true` set in frontmatter
- [x] **Nyquist audit complete: 85 tests, 9 files, 0 failures**

**Approval:** approved
