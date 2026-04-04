import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Phase 05 — Modal Sizing Test (05-01-01)
 * Verifies: All Dialog components use consistent responsive sizing classes.
 *
 * Checks:
 * 1. DialogContent has responsive maxWidth: max-w-[95vw] mobile, sm:max-w-xl desktop
 * 2. DialogContent has max-h-[85vh] overflow-y-auto for scrollable content
 * 3. Task detail dialog uses DialogContent from components/ui/dialog
 * 4. Kanban cards use consistent card tokens (rounded-lg border border-border)
 */

describe('Phase 05: Modal Responsive Sizing', () => {
  const dialogPath = join(process.cwd(), 'components', 'ui', 'dialog.tsx')
  const dialogContent = readFileSync(dialogPath, 'utf-8')

  it('DialogContent has responsive maxWidth for mobile (max-w-[95vw])', () => {
    expect(dialogContent).toContain('max-w-[95vw]')
  })

  it('DialogContent has responsive maxWidth for desktop (sm:max-w-xl)', () => {
    expect(dialogContent).toContain('sm:max-w-xl')
  })

  it('DialogContent has scrollable content (max-h-[85vh] overflow-y-auto)', () => {
    expect(dialogContent).toContain('max-h-[85vh]')
    expect(dialogContent).toContain('overflow-y-auto')
  })

  it('DialogContent has different overflow max for sm+ screens', () => {
    expect(dialogContent).toContain('sm:max-h-[80vh]')
  })

  it('task detail dialog imports DialogContent from shared dialog', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'portal', 'task-detail-dialog.tsx'), 'utf-8')
    expect(content).toContain("from '@/components/ui/dialog'")
    expect(content).toContain('DialogContent')
  })

  it('kanban card uses consistent card tokens', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'admin', 'kanban-card.tsx'), 'utf-8')
    expect(content).toContain('rounded-lg border border-border')
  })

  it('portal kanban task card uses consistent card tokens', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'portal', 'kanban-task-card.tsx'), 'utf-8')
    expect(content).toContain('rounded-lg border border-border')
  })

  it('mobile task cards use consistent card tokens', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'admin', 'task-list.tsx'), 'utf-8')
    expect(content).toContain('rounded-lg border border-border')
  })
})
