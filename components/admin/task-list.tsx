'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { format, isBefore, startOfDay } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'

import { deleteTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { LABELS } from '@/lib/labels'
import { StatusDot } from '@/components/ui/status-dot'
import { Button } from '@/components/ui/button'
import { ContentCard } from '@/components/ui/content-card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TaskListProps = {
  tasks: TaskRow[]
  projectId: string
}

function formatOptionalDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return format(new Date(value), 'MMM d, yyyy')
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  const router = useRouter()
  const params = useParams<{ clientId: string }>()
  const clientId = params.clientId
  const today = startOfDay(new Date())
  const [isPending, startTransition] = useTransition()

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
        {LABELS.emptyStates.noTasks}
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{LABELS.task.postingDate}</TableHead>
                <TableHead>{LABELS.task.assignee}</TableHead>
                <TableHead>{LABELS.task.dueDate}</TableHead>
                <TableHead className="w-[72px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isOverdue = Boolean(
                  task.posting_date && isBefore(startOfDay(new Date(task.posting_date)), today) && task.status !== 'done'
                )

                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium text-foreground">
                      <Link
                        className="underline-offset-4 hover:underline"
                        href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}
                      >
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusDot status={isOverdue ? 'overdue' : task.status} showLabel />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatOptionalDate(task.posting_date)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.assigned_to_username
                        ? `@${task.assigned_to_username}`
                        : task.assigned_to_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatOptionalDate(task.due_date)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label={`Task actions for ${task.title}`} size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isPending}
                            onSelect={(event) => {
                              event.preventDefault()

                              if (!window.confirm(`Delete ${task.title}?`)) {
                                return
                              }

                              startTransition(async () => {
                                const result = await deleteTaskAction(task.id, projectId, task.design_file_path ?? undefined)

                                if (result.success) {
                                  router.refresh()
                                }
                              })
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {tasks.map((task) => {
          const isOverdue = Boolean(
            task.posting_date && isBefore(startOfDay(new Date(task.posting_date)), today) && task.status !== 'done'
          )

          return (
            <ContentCard key={task.id} variant="mobile" className="space-y-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}
                  className="text-base font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {task.title}
                </Link>
                <StatusDot status={isOverdue ? 'overdue' : task.status} showLabel />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="text-xs uppercase tracking-[0.1em]">{LABELS.task.postingDate}</span>
                  <p>{formatOptionalDate(task.posting_date)}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.1em]">{LABELS.task.assignee}</span>
                  <p>
                    {task.assigned_to_username
                      ? `@${task.assigned_to_username}`
                      : task.assigned_to_name ?? '—'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs uppercase tracking-[0.1em]">{LABELS.task.dueDate}</span>
                  <p>{formatOptionalDate(task.due_date)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/clients/${clientId}/projects/${projectId}/tasks/${task.id}`}
                  className="min-h-[44px] flex-1 rounded-md border border-border px-3 py-2 text-center text-sm font-medium text-foreground transition hover:bg-muted/30"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="min-h-[44px] flex-1 rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5"
                  onClick={() => {
                    if (!window.confirm(`Delete ${task.title}?`)) {
                      return
                    }

                    startTransition(async () => {
                      const result = await deleteTaskAction(task.id, projectId, task.design_file_path ?? undefined)

                      if (result.success) {
                        router.refresh()
                      }
                    })
                  }}
                >
                  Delete
                </button>
              </div>
            </ContentCard>
          )
        })}
      </div>
    </>
  )
}
