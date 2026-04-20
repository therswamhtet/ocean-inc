'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, isBefore, startOfDay, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { ArrowRight, Calendar, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { QuickTaskDialog } from '@/components/admin/quick-task-dialog'

type TaskRecord = {
  id: string
  title: string
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: string
  client_id: string
  client_name: string
  client_color: string | null
  project_id: string
  project_name: string
}

type TaskSection = {
  label: string
  tasks: TaskRecord[]
}

type AllTasksProps = {
  today: TaskSection
  upcoming: TaskSection
  overdue: TaskSection
  clients: { id: string; name: string; color: string }[]
  projectsByClient: Record<string, { id: string; name: string; month: number; year: number }[]>
}

function formatDateLabel(dateStr: string | null) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'MMM d')
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null
  return differenceInDays(new Date(dateStr), new Date())
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  todo: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  in_progress: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  done: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
}

function TaskRow({ task }: { task: TaskRecord }) {
  const isOverdue = Boolean(
    task.posting_date &&
      isBefore(startOfDay(new Date(task.posting_date)), startOfDay(new Date())) &&
      task.status !== 'done'
  )
  const taskHref = `/admin/clients/${task.client_id}/projects/${task.project_id}/tasks/${task.id}`
  const style = isOverdue
    ? { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' }
    : (statusStyles[task.status] ?? statusStyles.todo)
  const dateLabel = formatDateLabel(task.posting_date)

  return (
    <Link
      href={taskHref}
      className="group flex items-center gap-4 rounded-lg px-4 py-3 transition hover:bg-muted/50"
    >
      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', style.dot)} />

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-foreground truncate group-hover:underline">
          {task.title}
        </span>
        <span className="block mt-0.5 text-xs text-muted-foreground truncate">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle"
            style={{ backgroundColor: task.client_color ?? '#b45309' }}
          />
          {task.client_name}
          <span className="mx-1.5 text-muted-foreground/40">·</span>
          {task.project_name}
        </span>
      </span>

      {dateLabel && (
        <span className={cn(
          'hidden sm:inline-flex items-center gap-1 shrink-0 text-xs',
          isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
        )}>
          <Calendar className="h-3 w-3" />
          {dateLabel}
        </span>
      )}

      <span className={cn(
        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        style.bg, style.text
      )}>
        {isOverdue ? 'Overdue' : task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}
      </span>

      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-foreground transition" />
    </Link>
  )
}

export default function AllTasks({ today, upcoming, overdue, clients, projectsByClient }: AllTasksProps) {
  const sections = [
    { key: 'overdue', data: overdue, accent: 'bg-red-500', empty: 'No overdue tasks' },
    { key: 'today', data: today, accent: 'bg-amber-400', empty: 'No tasks scheduled for today' },
    { key: 'upcoming', data: upcoming, accent: 'bg-blue-400', empty: 'No upcoming tasks' },
  ] as const

  const totalTasks = today.tasks.length + upcoming.tasks.length + overdue.tasks.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalTasks > 0
              ? `${totalTasks} task${totalTasks !== 1 ? 's' : ''} across your projects`
              : 'No tasks yet. Create one to get started.'}
          </p>
        </div>
        <QuickTaskDialog clients={clients} projectsByClient={projectsByClient} />
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          if (section.data.tasks.length === 0) return null
          return (
            <div key={section.key}>
              <div className="mb-2 flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', section.accent)} />
                <h3 className="text-sm font-semibold text-foreground">
                  {section.data.label}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {section.data.tasks.length}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                {section.data.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {totalTasks === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-base font-medium text-foreground">
            No tasks yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks will appear here when they are assigned posting dates in a project.
          </p>
        </div>
      )}
    </div>
  )
}