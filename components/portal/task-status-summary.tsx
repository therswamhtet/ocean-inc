import type { PortalTask } from '@/lib/portal/types'

type TaskStatusSummaryProps = {
  tasks: PortalTask[]
}

export function TaskStatusSummary({ tasks }: TaskStatusSummaryProps) {
  const total = tasks.length
  const todo = tasks.filter((t) => t.status === 'todo').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const done = tasks.filter((t) => t.status === 'done').length

  const items = [
    { label: 'TOTAL', value: total },
    { label: 'TO DO', value: todo },
    { label: 'IN PROGRESS', value: inProgress },
    { label: 'DONE', value: done },
  ]

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-surface">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center justify-center border-border bg-surface px-4 py-6 [&:nth-child(1)]:border-r [&:nth-child(1)]:border-b [&:nth-child(2)]:border-b [&:nth-child(3)]:border-r"
        >
          <span className="text-3xl font-bold tabular-nums text-foreground">
            {item.value}
          </span>
          <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
