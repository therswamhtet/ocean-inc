---
phase: 05
slug: ui-ux-polish-and-refinement
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-04
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Existing test framework (vitest + @testing-library/react) |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npm run test -- __tests__/polish-*.test.ts*` |
| **Full suite command** | `npm run test && npm run build` |
| **Estimated runtime** | ~45 seconds |

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
| 05-01-01 | 01 | 1 | Modal sizing | visual | `npm run test -- __tests__/modal-sizing.test.tsx` | ⬜ pending |
| 05-01-02 | 01 | 1 | Share links | integration | Manual link copy test | ⬜ pending |
| 05-01-03 | 01 | 1 | Terminology | lint | `rg "Post Date|publish date" "*.tsx"` returning 0 hits | ⬜ pending |
| 05-02-01 | 02 | 2 | Mobile nav | component | `npm run test -- __tests__/mobile-nav.test.tsx` | ⬜ pending |
| 05-02-02 | 02 | 2 | Calendar polish | visual | Manual at 375px + desktop | ⬜ pending |
| 05-02-03 | 02 | 2 | Task dashboard | visual | Manual at 375px + desktop | ⬜ pending |
| 05-03-01 | 03 | 2 | Card redesign | component | `npm run test -- __tests__/card-variants.test.tsx` | ⬜ pending |
| 05-03-02 | 03 | 2 | Bug fixes | integration | Per-bug verification | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/modal-sizing.test.tsx` — responsive modal rendering at breakpoints
- [ ] `__tests__/mobile-nav.test.tsx` — hamburger toggle behavior
- [ ] `__tests__/card-variants.test.tsx` — unified card component variants

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Modal visual sizing at 375px, 768px, 1024px | Pixel-level layout fidelity | Open app in devtools at each breakpoint, verify modal width/scroll |
| Share link copy + paste flow | Browser clipboard API | Copy link, paste in new tab, verify portal loads |
| Terminology consistency across all surfaces | Visual text audit | Full walkthrough of admin, team, portal checking labels |
| Calendar at 375px — touch targets, scroll | Mobile touch + scroll behavior | Browser devtools mobile mode, verify 44px minimum cells |
| Dashboard card layout at all breakpoints | Responsive grid behavior | DevTools at each breakpoint, verify grid collapse |
| Mobile nav hamburger + slide-out | Touch animation and state | DevTools mobile mode, tap hamburger, verify menu |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending