'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'

import { format, formatDistanceToNow, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

import { markNotificationAsRead } from '@/app/admin/notifications/actions'
import { cn } from '@/lib/utils'

const metricCardClassName = 'rounded-lg border border-border p-5'

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
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#222222] px-1.5 text-[10px] font-medium text-white">
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
          <p className="text-sm text-[#888888]">{metric.label}</p>
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
  title: string
  posting_date: string | null
  status: string
  projects: { name: string } | null
}

type DashboardCalendarProps = {
  tasks: TaskForCalendar[]
  currentMonth: Date
}

export function DashboardCalendar({ tasks, currentMonth }: DashboardCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.posting_date) {
      if (!acc[task.posting_date]) acc[task.posting_date] = []
      acc[task.posting_date].push(task)
    }
    return acc
  }, {} as Record<string, TaskForCalendar[]>)

  return (
    <section className="rounded-lg border border-border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px] grid grid-cols-7 gap-px text-center text-xs">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="py-1 text-xs sm:text-sm font-medium text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayTasks = tasksByDate[dateKey] ?? []
            const isToday = isSameDay(day, new Date())
            const isExpanded = expandedDay === dateKey
            
            return (
              <div
                key={dateKey}
                onClick={() => dayTasks.length > 0 && setExpandedDay(isExpanded ? null : dateKey)}
                className={cn(
                  'relative rounded border border-border p-1 text-xs',
                  dayTasks.length > 0 && 'cursor-pointer hover:border-muted-foreground',
                  !isSameMonth(day, currentMonth) && 'text-muted-foreground',
                  isToday && 'border-foreground',
                  isExpanded && 'z-10 bg-muted/60 sm:min-h-[120px]'
                )}
              >
                <span className="text-xs sm:text-sm">{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <>
                    <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                      {dayTasks.slice(0, 3).map((task, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            task.status === 'done' ? 'bg-green-500' :
                            task.status === 'in_progress' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          )}
                        />
                      ))}
                    </div>
                    {isExpanded && (
                      <div className="absolute top-full left-0 z-20 w-44 rounded-md border border-border bg-white p-2 shadow-lg sm:absolute">
                        {dayTasks.map((task, i) => (
                          <div key={task.id} className={cn(i > 0 && 'mt-1 pt-1 border-t border-border')}>
                            <p className="text-xs font-medium truncate">{task.title}</p>
                            {task.projects?.name && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{task.projects.name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
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
  projects: { name: string } | null | { name: string }[]
}

type DashboardTaskSectionsProps = {
  overdueTasks: TaskForSections[]
  todayTasks: TaskForSections[]
  upcomingTasks?: TaskForSections[]
}

export function DashboardTaskSections({ overdueTasks, todayTasks, upcomingTasks }: DashboardTaskSectionsProps) {
  function getProjectName(projects: { name: string } | null | { name: string }[]): string | undefined {
    if (!projects) return undefined
    if (Array.isArray(projects)) return projects[0]?.name
    return projects.name
  }

  return (
    <div className="space-y-4">
      {overdueTasks.length > 0 && (
        <section className="rounded-lg border border-l-4 border-l-red-500 border-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-red-600">Overdue</h3>
          <ul className="space-y-2">
            {overdueTasks.slice(0, 5).map((task) => {
              const projectName = getProjectName(task.projects)
              return (
                <li key={task.id} className="text-sm">
                  <span className="font-medium">{task.title}</span>
                  {projectName && <span className="text-muted-foreground"> — {projectName}</span>}
                </li>
              )
            })}
          </ul>
        </section>
      )}
      
      {todayTasks.length > 0 && (
        <section className="rounded-lg border border-l-4 border-l-yellow-500 border-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-yellow-600">Today</h3>
          <ul className="space-y-2">
            {todayTasks.slice(0, 5).map((task) => {
              const projectName = getProjectName(task.projects)
              return (
                <li key={task.id} className="text-sm">
                  <span className="font-medium">{task.title}</span>
                  {projectName && <span className="text-muted-foreground"> — {projectName}</span>}
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
              const projectName = getProjectName(task.projects)
              return (
                <li key={task.id} className="text-sm">
                  <span className="font-medium">{task.title}</span>
                  {projectName && <span className="text-muted-foreground"> — {projectName}</span>}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
