import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { globSync } from 'glob'

/**
 * Phase 05 — Labels Usage Test (05-01-02)
 * Verifies: lib/labels.ts is the single source of truth for UI strings across all surfaces.
 *
 * Checks:
 * 1. labels.ts exports LABELS constant
 * 2. Dashboard metric labels in team dashboard use LABELS (not hardcoded)
 * 3. Admin dashboard uses LABELS for metric labels
 * 4. Calendar view uses LABELS for empty states
 * 5. Task list uses LABELS for column headers
 * 6. No duplicate/conflicting label variants ("Post Date" vs "Publish Date")
 */

const labelsFile = join(process.cwd(), 'lib', 'labels.ts')

describe('Phase 05: Centralized Labels Usage', () => {
  it('labels.ts exists and exports LABELS', () => {
    const content = readFileSync(labelsFile, 'utf-8')
    expect(content).toContain("export const LABELS")
  })

  it('labels.ts has team dashboard metrics (LABELS.dashboard.team)', () => {
    const content = readFileSync(labelsFile, 'utf-8')
    expect(content).toContain('totalAssigned')
    expect(content).toContain('dueToday')
    expect(content).toContain('overdue')
    expect(content).toContain('completed')
    // Must be nested under dashboard.team
    expect(content).toMatch(/dashboard:[\s\S]*?team:[\s\S]*?totalAssigned/)
  })

  it('team dashboard imports and uses LABELS for metric labels', () => {
    const content = readFileSync(join(process.cwd(), 'app', 'team', 'page.tsx'), 'utf-8')
    // Should import LABELS
    expect(content).toContain("from '@/lib/labels'")
    // Should use LABELS for team metrics, NOT hardcoded string literals
    expect(content).toContain('LABELS.dashboard.team')
    // Should NOT have bare hardcoded metric labels in the metrics array
    expect(content).not.toMatch(/label:\s*['"](Total Assigned|Due Today|Overdue|Completed)['"]/)
  })

  it('admin dashboard uses LABELS for metric labels', () => {
    const content = readFileSync(join(process.cwd(), 'app', 'admin', 'page.tsx'), 'utf-8')
    expect(content).toContain("from '@/lib/labels'")
    expect(content).toContain('LABELS.dashboard')
  })

  it('calendar view uses LABELS for empty states', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'portal', 'calendar-view.tsx'), 'utf-8')
    expect(content).toContain("from '@/lib/labels'")
    expect(content).toContain('LABELS.emptyStates')
  })

  it('task list uses LABELS for column headers', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'admin', 'task-list.tsx'), 'utf-8')
    expect(content).toContain("from '@/lib/labels'")
    expect(content).toContain('LABELS.task.postingDate')
    expect(content).toContain('LABELS.task.assignee')
    expect(content).toContain('LABELS.task.dueDate')
  })

  it('no duplicate/conflicting label variants exist in source files', () => {
    const tsxFiles = globSync('**/*.{tsx,ts}', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**', '__tests__/**'],
    })

    // These old variants should not appear as visible text in source
    const forbiddenPatterns = [
      /['"][Pp]ublish [Dd]ate['"]/,
      /['"][Pp]ost [Dd]ate(?!['"])/,
    ]

    for (const file of tsxFiles) {
      const content = readFileSync(join(process.cwd(), file), 'utf-8')
      for (const pattern of forbiddenPatterns) {
        expect(content).not.toMatch(pattern)
      }
    }
  })

  it('share link button uses LABELS for text', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'admin', 'share-link-button.tsx'), 'utf-8')
    expect(content).toContain("from '@/lib/labels'")
    expect(content).toContain('LABELS.share')
  })

  it('admin/layout uses LABELS for adminPanel text', () => {
    const content = readFileSync(join(process.cwd(), 'app', 'admin', 'layout.tsx'), 'utf-8')
    expect(content).toContain("from '@/lib/labels'")
    expect(content).toContain('LABELS.common.adminPanel')
    expect(content).not.toContain('"Admin Console"')
    expect(content).not.toContain("'Admin Console'")
  })

  it('kanban card uses LABELS for task labels', () => {
    const content = readFileSync(join(process.cwd(), 'components', 'admin', 'kanban-card.tsx'), 'utf-8')
    expect(content).toContain("from '@/lib/labels'")
    expect(content).toContain('LABELS.task')
  })
})
