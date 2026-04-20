import { format } from 'date-fns'

import { LABELS } from '@/lib/labels'
import { ContentCard } from '@/components/ui/content-card'
import type { PortalTask } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

type PortalKanbanTaskCardProps = {
  task: PortalTask
  isOverdue: boolean
  onSelect: (task: PortalTask) => void
}

const statusPill: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-600' },
  done: { label: 'Done', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
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
    ? { label: 'Overdue', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' }
    : (statusPill[task.status] ?? statusPill.todo)

  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      className="w-full text-left"
    >
      <ContentCard variant="kanban" className="cursor-pointer hover:shadow-sm transition-all hover:border-primary/20">
        {tags.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  tag === 'Content' ? 'bg-blue-50 text-blue-600' :
                  tag === 'Design' ? 'bg-purple-50 text-purple-600' :
                  'bg-emerald-50 text-emerald-600'
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

        {cardDate && (
          <p className={cn('mb-2 text-[11px] tabular-nums', isOverdue ? 'font-semibold text-red-600' : 'text-muted-foreground')}>
            {cardDate}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', s.bg, s.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
            {s.label}
          </span>
        </div>
      </ContentCard>
    </button>
  )
}