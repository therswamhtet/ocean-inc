import { format } from 'date-fns'

import { LABELS } from '@/lib/labels'
import { StatusDot } from '@/components/ui/status-dot'
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

export function PortalKanbanTaskCard({ task, isOverdue, onSelect }: PortalKanbanTaskCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      className="w-full rounded-sm border border-border bg-background p-3 text-left hover:bg-muted/20"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <StatusDot status={isOverdue ? 'overdue' : task.status} />
        <span className="text-xs text-muted-foreground">{formatPostingDate(task.postingDate)}</span>
      </div>

      <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
    </button>
  )
}
