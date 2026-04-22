import { format } from 'date-fns'

import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type PortalKanbanTaskCardProps = {
  task: PortalTask
  isOverdue: boolean
  onSelect: (task: PortalTask) => void
}

const statusPill: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', bg: 'bg-[#999999]/10', text: 'text-[#666666]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', bg: 'bg-[#D4A843]/10', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', bg: 'bg-[#4A9E5C]/10', text: 'text-[#4A9E5C]' },
}

function formatPostingDate(postingDate: string | null) {
  if (!postingDate) return null
  const parsed = new Date(postingDate)
  if (Number.isNaN(parsed.getTime())) return null
  return format(parsed, 'MMM d')
}

function getTaskTags(task: PortalTask): string[] {
  const tags: string[] = []
  if (task.caption) tags.push('Content')
  if (task.designFilePath) tags.push('Design')
  return tags
}

export function PortalKanbanTaskCard({ task, isOverdue, onSelect }: PortalKanbanTaskCardProps) {
  const cardDate = formatPostingDate(task.postingDate)
  const tags = getTaskTags(task)
  const s = isOverdue
    ? { label: 'Overdue', dot: 'bg-[#D71921]', bg: 'bg-[#D71921]/10', text: 'text-[#D71921]' }
    : (statusPill[task.status] ?? statusPill.todo)

  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      className="w-full text-left"
    >
      <article
        className={cn(
          'group relative rounded-lg border bg-surface p-3 cursor-pointer transition-all',
          'hover:border-foreground/20',
          isOverdue ? 'border-[#D71921]/20' : 'border-border'
        )}
      >
        {tags.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  tag === 'Content' ? 'bg-[#D4A843]/10 text-[#D4A843]' :
                  tag === 'Design' ? 'bg-surface-raised text-foreground' :
                  'bg-[#4A9E5C]/10 text-[#4A9E5C]'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mb-2 text-sm font-medium leading-snug text-foreground line-clamp-2 break-words">
          {task.title}
        </p>

        <div className="flex items-center justify-between">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', s.bg, s.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
            {s.label}
          </span>
          {cardDate && (
            <span className={cn('text-[11px] tabular-nums font-mono', isOverdue ? 'font-semibold text-[#D71921]' : 'text-muted-foreground')}>
              {cardDate}
            </span>
          )}
        </div>
      </article>
    </button>
  )
}
