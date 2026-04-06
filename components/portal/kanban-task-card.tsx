import { format } from 'date-fns'

import { LABELS } from '@/lib/labels'
import { StatusDot } from '@/components/ui/status-dot'
import { ContentCard } from '@/components/ui/content-card'
import type { PortalTask } from '@/lib/portal/types'

type PortalKanbanTaskCardProps = {
  task: PortalTask
  isOverdue: boolean
  onSelect: (task: PortalTask) => void
}

function formatPostingDate(postingDate: string | null) {
  if (!postingDate) {
    return LABELS.emptyStates.noDate
  }

  const parsed = new Date(postingDate)
  if (Number.isNaN(parsed.getTime())) {
    return LABELS.emptyStates.noDate
  }

  return format(parsed, 'MMM d')
}

/** Derive a task category tag from task fields */
function getTaskTags(task: PortalTask): string[] {
  const tags: string[] = []
  if (task.caption) tags.push('Content')
  if (task.designFilePath) tags.push('Design')
  if (!task.caption && !task.designFilePath) tags.push('Todo')
  return tags
}

const tagStyles: Record<string, string> = {
  Content: 'bg-blue-100 text-blue-700',
  Design: 'bg-purple-100 text-purple-700',
  Todo: 'bg-muted text-muted-foreground',
}

export function PortalKanbanTaskCard({ task, isOverdue, onSelect }: PortalKanbanTaskCardProps) {
  const cardDate = formatPostingDate(task.postingDate)
  const tags = getTaskTags(task)

  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      className="w-full text-left"
    >
      <ContentCard variant="kanban" className="cursor-pointer hover:shadow-sm transition-all bg-background">
        {/* Tags row at top */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] ${tagStyles[tag] ?? 'bg-muted text-muted-foreground'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <span className="mb-3 block text-sm font-medium leading-snug text-foreground truncate">
          {task.title}
        </span>

        {/* Bottom row: status dot + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status={isOverdue ? 'overdue' : task.status} />
          </div>

          {cardDate && (
            <span className={`text-[11px] font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              {cardDate}
            </span>
          )}
        </div>

        {isOverdue && (
          <div className="mt-2 inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
            Overdue
          </div>
        )}
      </ContentCard>
    </button>
  )
}
