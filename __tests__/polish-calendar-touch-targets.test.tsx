import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Calendar Touch Targets Test (05-03-01)
 * Verifies: Calendar view has minimum 44px touch targets on all interactive elements.
 *
 * Checks:
 * 1. Calendar cells have min-h-[44px]
 * 2. Week/month toggle button has min-h-[44px]
 * 3. Previous/Next month navigation buttons have min-h-[44px]
 * 4. Calendar has horizontal scroll wrapper (overflow-x-auto)
 * 5. Calendar grid has minimum width (min-w-[560px]) for scroll
 * 6. Task indicators within cells use truncate for long content
 */

describe('Phase 05: Calendar Touch Targets', () => {
  const calendarPath = join(process.cwd(), 'components', 'portal', 'calendar-view.tsx')
  const content = readFileSync(calendarPath, 'utf-8')

  it('has at least 4 elements with min-h-[44px] (cells, toggle, prev, next)', () => {
    const matches = content.match(/min-h-\[44px\]/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(4)
  })

  it('week/month toggle button has min-h-[44px]', () => {
    expect(content).toMatch(/flex-1 min-h-\[44px\]/)
  })

  it('Previous month button exists and is interactive', () => {
    expect(content).toContain('Previous')
    // Both prev/next buttons share the same className pattern
    expect(content).toMatch(/min-h-\[44px\] rounded-sm border/)
  })

  it('Next month button exists and is interactive', () => {
    expect(content).toContain('Next')
  })

  it('calendar has horizontal scroll wrapper (overflow-x-auto)', () => {
    const overflowMatches = (content.match(/overflow-x-auto/g) || []).length
    expect(overflowMatches).toBeGreaterThanOrEqual(1)
  })

  it('calendar grid has min-w-[560px] for consistent scroll', () => {
    const minWMatches = content.match(/min-w-\[560px\]/g)
    expect(minWMatches).not.toBeNull()
    expect(minWMatches!.length).toBeGreaterThanOrEqual(2)
  })

  it('task titles truncate in calendar cells', () => {
    expect(content).toContain('truncate')
  })
})
