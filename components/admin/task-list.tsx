'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { format, isBefore, startOfDay } from 'date-fns'
import { ArrowRight, MoreHorizontal, Trash2 } from 'lucide-react'

import { deleteTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type TaskListProps = {
  tasks: TaskRow[]
  projectId: string
}

const statusPill: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  todo: { label: 'To Do', dot: 'bg-[#999999]', bg: 'bg-[#999999]/10', text: 'text-[#666666]' },
  in_progress: { label: 'In Progress', dot: 'bg-[#D4A843]', bg: 'bg-[#D4A843]/10', text: 'text-[#D4A843]' },
  done: { label: 'Done', dot: 'bg-[#4A9E5C]', bg: 'bg-[#4A9E5C]/10', text: 'text-[#4A9E5C]' },
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  const router = useRouter()
  const clientId = useParams<{ clientId: string }>().clientId
  const [isPending, startTransition] = useTransition()

  if (tasks.length === 0) {
    return (
      <div className="hatch-pattern rounded-xl border border-dashed border-border py-12 text-center">
        <p className="text-base font-medium text-foreground">No tasks yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Create your first task to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="divide-y divide-border">
        {tasks.map((task) => {
          const isOverdue = Boolean(
            (task.posting_date || task.due_date) &&
            isBefore(startOfDay(new Date(task.due_date || task.posting_date!)), startOfDay(new Date())) &&
            task.status !== 'done'
          )
          const s = isOverdue
            ? { label: 'Overdue', dot: 'bg-[#D71921]', bg: 'bg-[#D71921]/10', text: 'text-[#D71921]' }
            : (statusPill[task.status] ?? statusPill.todo)
          const taskHref = `/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`
          const date = task.due_date || task.posting_date

          return (
            <div key={task.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-surface-raised">
              <Link href={taskHref} className="min-w-0 flex-1 group/link">
                <p className="text-sm font-medium text-foreground truncate group-hover/link:underline">{task.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {date && <span>{format(new Date(date), 'MMM d, yyyy')}</span>}
                  {task.caption && <span className="rounded bg-[#D4A843]/10 text-[#D4A843] px-1 py-0.5 text-[10px] font-medium">Caption</span>}
                  {task.design_file_path && <span className="rounded bg-surface-raised text-foreground px-1 py-0.5 text-[10px] font-medium">Design</span>}
                </div>
              </Link>

              <span className={cn('shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', s.bg, s.text)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                {s.label}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem asChild>
                    <Link href={taskHref}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isPending}
                    className="text-[#D71921] focus:text-[#D71921]"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!window.confirm(`Delete "${task.title}"?`)) return
                      startTransition(async () => {
                        const result = await deleteTaskAction(task.id, projectId, task.design_file_path ?? undefined)
                        if (result.success) router.refresh()
                      })
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}