'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar, ListChecks } from 'lucide-react'

import { format, formatDistanceToNow, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

import { markNotificationAsRead } from '@/app/admin/notifications/actions'
import { cn } from '@/lib/utils'

const metricCardClassName = 'rounded-lg border border-border p-5 bg-gradient-to-br from-amber-50 to-orange-50'

function formatNotificationTime(createdAt: string | null) {
  if (!createdAt) {
    return 'Just now'
  }

  return formatDistanceToNow(new Date(createdAt), { addSuffix: true })
}

type Notification = {
  id: string
  message: string
  created_at: string | null
  read: boolean | null
}

function NotificationsSection({ notifications, unreadCount }: { notifications: Notification[] | null; unreadCount: number }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <section className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-muted/30"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          >
            View all
          </Link>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div>
          {notifications && notifications.length > 0 ? (
            <ul>
              {notifications.map((notification) => {
                const markAsRead = markNotificationAsRead.bind(null, notification.id)

                return (
                  <li key={notification.id} className="border-b border-border last:border-b-0">
                    <form action={markAsRead}>
                      <button
                        type="submit"
                        className={cn(
                          'flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-muted/30',
                          !notification.read && 'border-l-2 border-l-foreground pl-[14px]'
                        )}
                      >
                        <span className="space-y-1">
                          <span className="block text-sm font-medium">{notification.message}</span>
                          <span className="block text-xs text-muted-foreground">
                            {formatNotificationTime(notification.created_at)}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </button>
                    </form>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">No notifications yet.</p>
          )}
        </div>
      )}
    </section>
  )
}

type Metric = { label: string; value: number; className?: string }

export function DashboardMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className={cn(metricCardClassName, metric.className)}>
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{metric.value}</p>
        </article>
      ))}
    </div>
  )
}

export function DashboardNotifications({ notifications, unreadCount }: { notifications: Notification[] | null; unreadCount: number }) {
  return <NotificationsSection notifications={notifications} unreadCount={unreadCount} />
}

type TaskForCalendar = {
  id: string
  project_id: string | null
  title: string
  posting_date: string | null
  status: string
  projects: { id: string; name: string; client_id: string } | null
}

type DashboardCalendarProps = {
  tasks: TaskForCalendar[]
  currentMonth: Date
}

// ── Colour categories based on task title (same as portal calendar) ──
function adminCategoriseTask(task: TaskForCalendar): number {
  const title = task.title.toLowerCase()
  if (/standup|stand-up|sync /.test(title)) return 0
  if (/lunch|dinner|coffee|break/.test(title)) return 1
  if (/one.?on.?one|1on1|1:1/.test(title)) return 2
  if (/all.?hands|demo|meeting|catch ?up/.test(title)) return 3
  if (/plann|strateg|roadmap/.test(title)) return 4
  if (/design|content |creative/.test(title)) return 5
  if (/deep work|writing|coding/.test(title)) return 6
  if (/inspection|engagment|client/.test(title)) return 7
  if (/review|audit|quarterly/.test(title)) return 8
  const hash = task.title.split('').reduce((h, c) => (h + c.charCodeAt(0) * 31) % 10, 0)
  return hash
}

const ADMIN_DOT_COLOURS = [
  'bg-slate-400', 'bg-pink-400', 'bg-purple-400', 'bg-indigo-400', 'bg-blue-400',
  'bg-violet-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-gray-400',
]

function AdminEventDot({ task }: { task: TaskForCalendar }) {
  const cat = adminCategoriseTask(task)
  return <span className={cn('h-[6px] w-[6px] rounded-full', ADMIN_DOT_COLOURS[cat % ADMIN_DOT_COLOURS.length])} />
}

// Build week start/end helpers
function weekStartOfWeek(date: Date, weekStartsOn: number): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function weekEndOfWeek(date: Date, weekStartsOn: number): Date {
  const d = weekStartOfWeek(date, weekStartsOn)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export function DashboardCalendar({ tasks, currentMonth }: DashboardCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const tasksByDate = (tasks ?? []).reduce((acc, task) => {
    if (task.posting_date) {
      if (!acc[task.posting_date]) acc[task.posting_date] = []
      acc[task.posting_date].push(task)
    }
    return acc
  }, {} as Record<string, TaskForCalendar[]>)

  // Build the full calendar grid (weeks x days, including padding days)
  const gridStart = weekStartOfWeek(monthStart, 0)
  const gridEnd = weekEndOfWeek(monthEnd, 0)
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <section className="rounded-lg border border-border overflow-x-auto min-h-0">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Calendar</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{format(currentMonth, 'MMMM yyyy')}</p>
      </div>
      <div className="overflow-visible p-4">
        {/* Weekday header */}
        <div className="mb-2 flex">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground w-full">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
        </div>

        {/* Day grid */}
        <div className="space-y-2">
          {weeks.map((week, wi) => (
            <div key={`admin-week-${wi}`} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayTasks = tasksByDate[dateKey] ?? []
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isExpanded = expandedDay === dateKey

                return (
                  <div
                    key={dateKey}
                    tabIndex={0}
                    onClick={() => dayTasks.length > 0 && setExpandedDay(isExpanded ? null : dateKey)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && dayTasks.length > 0) {
                        e.preventDefault()
                        setExpandedDay(isExpanded ? null : dateKey)
                      }
                    }}
                    role="button"
                    aria-label={`${format(day, 'd')} – ${dayTasks.length} task(s)`}
                    aria-expanded={isExpanded}
                    className={cn(
                      'relative cursor-pointer rounded-lg border p-2 text-left transition',
                      isToday
                        ? 'border-primary/30 bg-primary/[0.04]'
                        : isCurrentMonth
                          ? 'border-border bg-white hover:bg-muted/40'
                          : 'border-border/50 bg-muted/20 hover:bg-muted/30'
                    )}
                    style={{ minHeight: '48px' }}
                  >
                    {/* Day number */}
                    <div className="mb-1">
                      {isToday ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {format(day, 'd')}
                        </span>
                      ) : (
                        <span className={cn(
                          'text-xs font-medium',
                          isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {format(day, 'd')}
                        </span>
                      )}
                    </div>

                    {/* Task dots */}
                    {dayTasks.length > 0 && (
                      <>
                        <div className="flex flex-wrap gap-1">
                          {dayTasks.slice(0, 5).map((task) => (
                            <AdminEventDot key={task.id} task={task} />
                          ))}
                        </div>
                        {dayTasks.length > 5 && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground text-clip">+{dayTasks.length - 5} more</p>
                        )}
                      </>
                    )}

                    {/* Expanded popup */}
                    {isExpanded && dayTasks.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-md border border-border bg-background p-2 shadow-lg">
                        {dayTasks.map((task, i) => {
                          const taskHref = `/admin/tasks/${task.id}`

                          return (
                            <div key={task.id} className={cn(
                              'rounded-sm px-1.5 py-1 transition hover:bg-muted/30',
                              i > 0 && 'mt-1 border-t border-border pt-1'
                            )}>
                              {taskHref ? (
                                <Link href={taskHref} className="text-xs font-medium truncate block" onClick={(e) => e.stopPropagation()}>
                                  {task.title}
                                </Link>
                              ) : (
                                <p className="text-xs font-medium truncate">{task.title}</p>
                              )}
                              {task.projects?.name && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground">{task.projects.name}</p>
                              )}
                            </div>
                          )
                        })}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setExpandedDay(null); }}
                          className="mt-1 w-full text-center text-[11px] text-muted-foreground underline underline-offset-2"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type TaskForSections = {
  id: string
  title: string
  posting_date: string | null
  status: string
  project_id: string | null
  projects: { name: string; client_id: string } | null | { name: string; client_id: string }[]
}

type DashboardTaskSectionsProps = {
  overdueTasks: TaskForSections[]
  todayTasks: TaskForSections[]
  upcomingTasks?: TaskForSections[]
}

export function DashboardTaskSections({ overdueTasks, todayTasks, upcomingTasks }: DashboardTaskSectionsProps) {
  function getProjectInfo(projects: { name: string; client_id: string } | null | { name: string; client_id: string }[]) {
    if (!projects) return { projectName: undefined, clientId: undefined }
    const first = Array.isArray(projects) ? projects[0] : projects
    return { projectName: first?.name, clientId: first?.client_id }
  }

  function renderTaskLink(task: TaskForSections) {
    const { projectName, clientId } = getProjectInfo(task.projects)
    const taskHref = task.project_id && clientId
      ? `/admin/clients/${clientId}/projects/${task.project_id}/tasks/${task.id}`
      : undefined

    const content = (
      <>
        <span className="font-medium">{task.title}</span>
        {projectName && <span className="text-muted-foreground"> — { projectName}</span>}
      </>
    )

    return taskHref ? (
      <Link
        href={taskHref}
        className="transition hover:text-foreground/70"
      >
        {content}
      </Link>
    ) : content
  }

  return (
    <div className="space-y-4">
      {(overdueTasks ?? []).length > 0 && (
        <section className="rounded-lg border border-l-4 border-l-red-500 border-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-red-600">Overdue</h3>
          <ul className="space-y-2">
            {(overdueTasks ?? []).slice(0, 5).map((task) => {
              return (
                <li key={task.id} className="text-sm">
                  {renderTaskLink(task)}
                </li>
              )
            })}
          </ul>
        </section>
      )}
      
      {(todayTasks ?? []).length > 0 && (
        <section className="rounded-lg border border-l-4 border-l-yellow-500 border-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-yellow-600">Today</h3>
          <ul className="space-y-2">
            {(todayTasks ?? []).slice(0, 5).map((task) => {
              return (
                <li key={task.id} className="text-sm">
                  {renderTaskLink(task)}
                </li>
              )
            })}
          </ul>
        </section>
      )}
      
      {upcomingTasks && upcomingTasks.length > 0 && (
        <section className="rounded-lg border border-l-4 border-l-gray-300 border-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-600">Upcoming</h3>
          <ul className="space-y-2">
            {upcomingTasks.slice(0, 5).map((task) => {
              return (
                <li key={task.id} className="text-sm">
                  {renderTaskLink(task)}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

type TaskForMyTasks = {
  id: string
  title: string
  status: string
  posting_date: string | null
  due_date: string | null
  project_id: string | null
  client_id: string | null
  project_name: string | null
  client_name: string | null
  assignee_name: string | null
  assignee_username: string | null
}

type FilterType = 'today' | 'week' | 'month'

export function DashboardMyTasks({ tasks }: { tasks: TaskForMyTasks[] }) {
  const [filter, setFilter] = useState<FilterType>('week')
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDate = new Date()

  const weekStart = format(startOfWeek(todayDate), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(todayDate), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(todayDate), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(todayDate), 'yyyy-MM-dd')

  const filteredTasks = tasks.filter((t) => {
    if (!t.posting_date) return false
    switch (filter) {
      case 'today':
        return t.posting_date === today
      case 'week':
        return t.posting_date >= weekStart && t.posting_date <= weekEnd
      case 'month':
        return t.posting_date >= monthStart && t.posting_date <= monthEnd
      default:
        return true
    }
  })

  const overdue = filteredTasks.filter(
    (t) => t.posting_date && t.posting_date < today && t.status !== 'done'
  )
  const inProgress = filteredTasks.filter((t) => t.status === 'in_progress')
  const todo = filteredTasks.filter((t) => t.status === 'todo')

  function getTaskHref(task: TaskForMyTasks) {
    return task.project_id && task.client_id
      ? `/admin/clients/${task.client_id}/projects/${task.project_id}/tasks/${task.id}`
      : undefined
  }

  function TaskLink({ task }: { task: TaskForMyTasks }) {
    const href = getTaskHref(task)
    const content = (
      <>
        <span className="font-medium">{task.title}</span>
        {task.project_name && (
          <span className="text-muted-foreground"> — {task.project_name}</span>
        )}
        {(task.assignee_username || task.assignee_name) && (
          <span className="text-muted-foreground"> ({task.assignee_username ? `@${task.assignee_username}` : task.assignee_name})</span>
        )}
      </>
    )

    return href ? (
      <Link href={href} className="block text-sm transition hover:text-foreground/70">
        {content}
      </Link>
    ) : (
      <span className="block text-sm">{content}</span>
    )
  }

  function StatusGroup({ title, items, borderColor, textColor }: { title: string; items: TaskForMyTasks[]; borderColor: string; textColor: string }) {
    if (items.length === 0) return null
    return (
      <section className={cn('rounded-lg border border-l-4', borderColor, 'border-border p-4')}>
        <h3 className={cn('mb-2 text-sm font-semibold', textColor)}>
          {title}
        </h3>
        <ul className="space-y-2">
          {items.slice(0, 5).map((task) => (
            <li key={task.id}>
              <TaskLink task={task} />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">My Tasks</h3>
          <ListChecks className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Tasks assigned to your team that need attention.</p>
      </div>
      <div className="flex gap-2 border-b border-border px-4 py-3">
        {(['today', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'min-h-[36px] rounded-md px-3 py-1.5 text-sm font-medium transition',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
          >
            {f === 'today' ? 'Today' : f === 'week' ? 'This week' : 'This month'}
          </button>
        ))}
      </div>
      <div className="space-y-4 p-4">
        {overdue.length === 0 && inProgress.length === 0 && todo.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up — no assigned tasks.</p>
        ) : (
          <>
            <StatusGroup title="Overdue" items={overdue} borderColor="border-l-red-500" textColor="text-red-600" />
            <StatusGroup title="In Progress" items={inProgress} borderColor="border-l-blue-500" textColor="text-blue-600" />
            <StatusGroup title="To Do" items={todo} borderColor="border-l-gray-300" textColor="text-gray-600" />
          </>
        )}
      </div>
    </section>
  )
}
