# Testing Patterns

**Analysis Date:** 2026-04-07

## Test Framework

**Runner:**
- Vitest 4.1.2
- Config: `vitest.config.mts` in project root
- Environment: `jsdom`
- Globals: `true` (describe, expect, it, vi available globally)
- TypeScript: `vite-tsconfig-paths` plugin for `@/*` path resolution
- React: `@vitejs/plugin-react`

**Assertion Library:**
- Vitest built-in `expect`
- Matchers: `toBe`, `toEqual`, `toThrow`

**Run Commands:**
```bash
npm test                    # Run all tests (vitest run)
```

No coverage script or watch mode script configured.

## Test File Organization

**Location:**
- All tests in root-level `__tests__/` directory (NOT co-located with source)
- No `setupTests.ts` or shared test utilities file

**Naming:**
- kebab-case with `.test.ts` for non-React tests, `.test.tsx` for React component tests
- `polish-*` prefix — static file analysis/quality assertion tests
- `{feature}-` prefix — behavioral unit tests

**Structure:**
```
__tests__/
├── polish-calendar-touch-targets.test.tsx
├── polish-card-variants.test.tsx
├── polish-client-cards.test.tsx
├── polish-dashboard-metrics.test.tsx
├── polish-labels-usage.test.ts
├── polish-mobile-nav.test.tsx
├── polish-modal-sizing.test.tsx
├── polish-responsive-tables.test.tsx
├── polish-share-link.test.tsx
├── portal-calendar-utils.test.ts
├── portal-kanban.test.tsx
├── portal-queries.test.ts
├── portal-task-dialog.test.tsx
├── portal-timeline-utils.test.ts
├── team-task-actions.test.ts
└── team-task-page-and-form.test.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
// Testing Library imports for React tests
import { render, screen } from '@testing-library/react';

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle specific case', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

**Patterns:**
- Two distinct test categories:
  - **Type A (9 `polish-*` tests):** Static analysis — read source files with `readFileSync` + `globSync`, assert on file contents (string matching, regex)
  - **Type B (7 behavioral tests):** Runtime testing — import modules, test behavior
- `beforeEach` with `vi.clearAllMocks()` — consistent mock reset pattern

## Mocking

**Framework:**
- Vitest built-in `vi`

**Patterns:**
```typescript
// Mock external dependency
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      }))
    }))
  }))
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));
```

**What to Mock:**
- Supabase client chain (`createClient` → `from` → `select` → `eq` → `maybeSingle`)
- `next/cache` — `revalidatePath`

**What NOT to Mock:**
- Pure utility functions (`calendar-utils.ts`, `timeline-utils.ts`)
- Internal business logic without external dependencies

**Mock Scope:**
- Top-level `vi.mock()` at file level — modules imported after mock is registered
- Dynamic imports inside test bodies: `await import('@/lib/portal/queries')` to ensure mocks are active

## Fixtures and Factories

**Test Data:**
- Inline test data — fixtures constructed inline as plain objects in test bodies
- No shared fixture files or factory functions
- No `__fixtures__` directory

**Supabase Mock Chain Pattern:**
```typescript
const clientMaybeSingle = vi.fn().mockResolvedValue({ data: mockClient })
const clientEq = vi.fn().mockReturnValue({ maybeSingle: clientMaybeSingle })
```

## Coverage

**Requirements:**
- No coverage configuration in Vitest config
- No `test:coverage` or similar script in package.json
- No `.coverage` directory
- Coverage is not enforced

## Test Types

**Unit Tests:**
- Test single utility functions or components in isolation
- Mock all external dependencies (Supabase, `next/cache`)
- Examples: `portal-calendar-utils.test.ts`, `team-task-actions.test.ts`

**Static Analysis Tests (`polish-*`):**
- Read and assert on source file structure/conventions
- Examples: `polish-labels-usage.test.ts`, `polish-card-variants.test.tsx`
- Phase-based quality assurance — headers reference plan numbers (e.g., `05-01-02`)

**Integration/E2E Tests:**
- Not currently used — no Playwright, Cypress, or browser testing

---

*Testing analysis: 2026-04-07*
*Update when test patterns change*
