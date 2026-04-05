'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, isBefore, startOfDay } from 'date-fns'
import { ChevronDown, ChevronRight, Clock, LinkIcon, User } from 'lucide-react'

import { LABELS } from '@/lib/labels'
import { StatusDot } from '@/components/ui/status-dot'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { QuickTaskDialog } from '@/components/admin/quick-task-dialog'

type TaskRecord = {
  id: string
  title: string
  posting_date: string | null
  due_date: string | null
  deadline: string | null
  status: string
  assigned_to_name: string | null
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
}

type TaskExpandState = {
  id: string | null
  task: TaskRecord | null
}

function formatOptionalDate(value: string | null, fallback = '—') {
  if (!value) return fallback
  return format(new Date(value), 'MMM d, yyyy')
}

function getMonthLabel(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMMM')
}

function TaskDetailPanel({ task }: { task: TaskRecord }) {
  const isOverdue = Boolean(
    task.posting_date &&
      isBefore(startOfDay(new Date(task.posting_date)), startOfDay(new Date())) &&
      task.status !== 'done'
  )

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
      {/* Header */}
      <div className="mb-3 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="font-medium text-foreground truncate">{task.title}</p>
            <Badge
              className={cn(
                'flex-shrink-0 mt-0 capitalize',
                isOverdue
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : task.status === 'in_progress'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-muted-foreground/20 bg-muted text-muted-foreground',
              )}
            >
              {isOverdue ? 'overdue' : task.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.client_color ?? undefined }}
              />
              {task.client_name}
            </span>
            <span>·</span>
            <span className="truncate">{task.project_name}</span>
          </div>
        </div>
      </div>

      {/* Detail Fields - 2 Column Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {/* Assigned To */}
        <div className="flex items-start gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground mt-0 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {LABELS.common.assignedTo}
            </p>
            <p className="text-sm font-medium text-foreground">
              {task.assigned_to_name ?? 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Posting Date */}
        <div className="flex items-start gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {LABELS.task.postingDate}
            </p>
            <p className="text-sm text-foreground tabular-nums">
              {formatOptionalDate(task.posting_date, LABELS.task.noDate)}
            </p>
          </div>
        </div>

      </div>

      {/* Navigation Link */}
      <div className="pt-3 mt-3">
        <Link
          href={`/admin/clients/${task.client_id}/projects/${task.project_id}/tasks/${task.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition"
        >
          Open task detail &rarr;
        </Link>
      </div>
    </div>
  )
}

function TaskListView({ title, tasks, expanded, onToggle }: {
  title: string
  tasks: TaskRecord[]
  expanded: TaskExpandState
  onToggle: (task: TaskRecord | null) => void
}) {
  if (tasks.length === 0) return null

  return (
    <section className="space-y-2">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1">
        {tasks.map((task) => {
          const isOverdue = Boolean(
            task.posting_date &&
              isBefore(startOfDay(new Date(task.posting_date)), startOfDay(new Date())) &&
              task.status !== 'done'
          )
          const isExpanded = expanded.id === task.id
          const taskHref = `/admin/clients/${task.client_id}/projects/${task.project_id}/tasks/${task.id}`

          return (
            <div key={task.id} className="space-y-0">
              {/* Task Row */}
              <div
                className={cn(
                  'group rounded-lg border border-transparent px-3 py-2.5 transition hover:bg-muted/20 hover:border-border',
                  isExpanded && 'border-border bg-muted/30',
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Expand Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggle(isExpanded ? null : task)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition p-0.5"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Status Dot */}
                  <div className="flex-shrink-0">
                    <StatusDot status={isOverdue ? 'overdue' : task.status as 'todo' | 'in_progress' | 'done'} />
                  </div>

                  {/* Task Title (links to parent task) */}
                  <Link
                    href={taskHref}
                    className="flex-1 min-w-0 font-medium text-foreground text-sm underline-offset-4 hover:underline truncate"
                  >
                    {task.title}
                  </Link>

                  {/* Content Plan / Month */}
                  <span className="hidden lg:inline text-xs text-muted-foreground flex-shrink-0 w-20 truncate">
                    {getMonthLabel(task.posting_date)}
                  </span>

                  {/* Client Name */}
                  <span className="hidden sm:inline flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0 w-28 truncate">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: task.client_color ?? undefined }}
                    />
                    {task.client_name}
                  </span>

                  {/* Project Name */}
                  <span className="hidden md:inline text-xs text-muted-foreground flex-shrink-0 w-28 truncate">
                    {task.project_name}
                  </span>

                  {/* Assignment */}
                  <span className="hidden lg:inline text-xs text-muted-foreground flex-shrink-0 w-28 truncate text-right">
                    {task.assigned_to_name ?? '—'}
                  </span>
                </div>
              </div>

              {/* Expandable Detail Panel */}
              {isExpanded && task && (
                <TaskDetailPanel task={task} />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function AllTasks({ today, upcoming, overdue }: AllTasksProps) {
  const [expanded, setExpanded] = useState<TaskExpandState>({ id: null, task: null })

  const handleToggle = useCallback(
    (task: TaskRecord | null) => {
      setExpanded(task ? { id: task.id, task } : { id: null, task: null })
    },
    [],
  )

  return (
    <div className="space-y-4">
      {/* Header Bar - matches clients page pattern */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">All Tasks</h2>
          <p className="text-sm text-muted-foreground">
            View tasks organized by urgency — today, upcoming, and overdue.
          </p>
        </div>
        <QuickTaskDialog />
      </div>

      {/* Compact Task Sections */}
      <div className="space-y-4">
        <TaskListView
          title={`Today's Tasks (${today.tasks.length})`}
          tasks={today.tasks as TaskRecord[]}
          expanded={expanded}
          onToggle={handleToggle}
          key={`today-${today.tasks.length}`}
        />
        <TaskListView
          title={`Upcoming (${upcoming.tasks.length})`}
          tasks={upcoming.tasks as TaskRecord[]}
          expanded={expanded}
          onToggle={handleToggle}
          key={`upcoming-${upcoming.tasks.length}`}
        />
        <TaskListView
          title={`Overdue (${overdue.tasks.length})`}
          tasks={overdue.tasks as TaskRecord[]}
          expanded={expanded}
          onToggle={handleToggle}
          key={`overdue-${overdue.tasks.length}`}
        />
      </div>

      {/* Empty State */}
      {today.tasks.length === 0 &&
        upcoming.tasks.length === 0 &&
        overdue.tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
            <p className="text-lg font-medium text-foreground">No tasks found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks will appear here when they are created in a project.
            </p>
          </div>
        )}
    </div>
  )
}
