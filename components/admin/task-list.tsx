'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format, isBefore, startOfDay } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'

import type { TaskRow } from '@/app/admin/clients/[clientId]/projects/[projectId]/task-view-toggle'
import { StatusDot } from '@/components/ui/status-dot'
import { Button } from '@/components/ui/button'
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
  const params = useParams<{ clientId: string }>()
  const clientId = params.clientId
  const today = startOfDay(new Date())

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
        No tasks yet. Create the first task to populate this project.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Posting Date</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
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
                <TableCell className="text-muted-foreground">{task.assigned_to_name ?? '—'}</TableCell>
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
                      <DropdownMenuItem disabled>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
