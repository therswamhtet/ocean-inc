'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Calendar } from 'lucide-react'

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

import { cn } from '@/lib/utils'
import { animate } from 'animejs'

const metricCardClassName = 'flex flex-col justify-between rounded-lg border border-border p-5 bg-surface h-full'

type Metric = { label: string; value: number; accent?: string }

function AnimatedMetric({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const duration = 1500;
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.round(eased * value);
      
      element.textContent = String(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value]);

  return <span ref={ref} className={className}>0</span>;
}

export function DashboardMetrics({ metrics }: { metrics: Metric[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.children;
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          delay: (_el: unknown, i: number) => i * 100,
          ease: "out(3)",
        });
      }
    }
  }, [metrics]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className={metricCardClassName} style={{ opacity: 0 }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground leading-relaxed min-h-[2.5rem]">
            {metric.label}
          </p>
          <p className={cn(
            'mt-3 font-mono text-4xl font-bold tracking-tight',
            metric.accent || 'text-foreground'
          )}>
            <AnimatedMetric value={metric.value} />
          </p>
        </article>
      ))}
    </div>
  )
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
  'bg-[#999999]', 'bg-[#EC4899]', 'bg-[#8B5CF6]', 'bg-[#5B9BF6]', 'bg-[#D4A843]',
  'bg-[#06B6D4]', 'bg-[#4A9E5C]', 'bg-[#F97316]', 'bg-[#D71921]', 'bg-[#999999]',
]

function AdminEventDot({ task }: { task: TaskForCalendar }) {
  const cat = adminCategoriseTask(task)
  return <span className={cn('h-[6px] w-[6px] rounded-full', ADMIN_DOT_COLOURS[cat % ADMIN_DOT_COLOURS.length])} />
}

export function DashboardCalendar({ tasks, currentMonth }: DashboardCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      animate(sectionRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: 300,
        ease: "out(3)",
      });
    }
  }, []);

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
    <section ref={sectionRef} className="rounded-lg border border-border min-h-0" style={{ opacity: 0 }}>
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Calendar</h3>
          <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="mt-0.5 font-mono text-lg font-bold tracking-tight text-foreground">{format(currentMonth, 'MMMM yyyy')}</p>
      </div>
      <div className="p-4">
        {/* Desktop: full grid (hidden on mobile) */}
        <div className="hidden sm:block overflow-visible">
          <div className="mb-2 grid grid-cols-7 gap-2 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d} className="py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{d}</div>
            ))}
          </div>

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
                          ? 'border-foreground/20 bg-surface-raised'
                          : isCurrentMonth
                            ? 'border-border bg-surface hover:bg-surface-raised'
                            : 'border-border/50 bg-surface hover:bg-surface-raised/50'
                      )}
                      style={{ minHeight: '48px' }}
                    >
                      <div className="mb-1">
                        {isToday ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
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

                      {isExpanded && dayTasks.length > 0 && (
                        <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-md border border-border-visible bg-surface p-2">
                          {dayTasks.map((task, i) => {
                            const taskHref = `/admin/tasks/${task.id}`

                            return (
                              <div key={task.id} className={cn(
                                'rounded-sm px-1.5 py-1 transition hover:bg-surface-raised',
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

        {/* Mobile: vertical card feed (visible on small screens only) */}
        <div className="block sm:hidden space-y-3">
          {weeks.flat()
            .filter((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateKey] ?? []
              return dayTasks.length > 0 || isSameDay(day, new Date())
            })
            .map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateKey] ?? []
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isExpanded = expandedDay === dateKey

              return (
                <div
                  key={dateKey}
                  className={cn(
                    'rounded-xl border p-4 transition-colors',
                    isToday
                      ? 'border-foreground/20 bg-surface-raised'
                      : isCurrentMonth
                        ? 'border-border bg-surface'
                        : 'border-border/40 bg-surface'
                  )}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold',
                      isToday ? 'bg-foreground text-background' : 'text-foreground'
                    )}>
                      {format(day, 'd')}
                    </span>
                    <p className={cn(
                      'text-sm font-semibold',
                      isToday ? 'text-foreground' : 'text-foreground'
                    )}>
                      {format(day, 'EEE')}
                    </p>
                    {dayTasks.length > 0 && (
                      <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {dayTasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {dayTasks.map((task) => {
                        const taskHref = `/admin/tasks/${task.id}`
                        return (
                          <Link
                            key={task.id}
                            href={taskHref}
                            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition hover:bg-surface-raised active:scale-[0.99]"
                          >
                            <AdminEventDot task={task} />
                            <span className="truncate text-sm font-medium text-foreground">{task.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 ml-12">No tasks</p>
                  )}

                  {isExpanded && dayTasks.length > 0 && (
                    <div className="mt-2 rounded-md border border-border-visible bg-surface p-2">
                      {dayTasks.map((task, i) => {
                        const taskHref = `/admin/tasks/${task.id}`
                        return (
                          <div key={task.id} className={cn(
                            'rounded-sm px-1.5 py-1 transition hover:bg-surface-raised',
                            i > 0 && 'mt-1 border-t border-border pt-1'
                          )}>
                            <Link href={taskHref} className="text-xs font-medium truncate block" onClick={(e) => e.stopPropagation()}>
                              {task.title}
                            </Link>
                            {task.projects?.name && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{task.projects.name}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
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
  project_id: string | null
  projects: { name: string; client_id: string } | null | { name: string; client_id: string }[]
}

type DashboardTaskSectionsProps = {
  overdueTasks: TaskForSections[]
  todayTasks: TaskForSections[]
  upcomingTasks?: TaskForSections[]
}

export function DashboardTaskSections({ overdueTasks, todayTasks, upcomingTasks }: DashboardTaskSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll('section');
      if (sections.length > 0) {
        animate(sections, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
          delay: (_el: unknown, i: number) => 500 + i * 150,
          ease: "out(3)",
        });
      }
    }
  }, [overdueTasks, todayTasks, upcomingTasks]);

  function getProjectInfo(projects: { name: string; client_id: string } | null | { name: string; client_id: string }[]) {
    if (!projects) return { projectName: undefined, clientId: undefined }
    const first = Array.isArray(projects) ? projects[0] : projects
    return { projectName: first?.name, clientId: first?.client_id }
  }

  function renderTaskLink(task: TaskForSections, accentColor?: string) {
    const { projectName, clientId } = getProjectInfo(task.projects)
    const taskHref = task.project_id && clientId
      ? `/admin/clients/${clientId}/projects/${task.project_id}/tasks/${task.id}`
      : undefined

    const content = (
      <>
        <span className={cn('font-medium', accentColor)}>{task.title}</span>
        {projectName && <span className="text-muted-foreground"> — {projectName}</span>}
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
    <div ref={containerRef} className="space-y-6">
      {(overdueTasks ?? []).length > 0 && (
        <section style={{ opacity: 0 }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D71921]" />
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#D71921]">Overdue</h3>
            <span className="font-mono text-[11px] text-muted-foreground">({overdueTasks.length})</span>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {(overdueTasks ?? []).slice(0, 5).map((task) => (
              <div key={task.id} className="py-2.5 text-sm">
                {renderTaskLink(task, 'text-[#D71921]')}
              </div>
            ))}
          </div>
        </section>
      )}

      {(todayTasks ?? []).length > 0 && (
        <section style={{ opacity: 0 }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D4A843]" />
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#D4A843]">Today</h3>
            <span className="font-mono text-[11px] text-muted-foreground">({todayTasks.length})</span>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {(todayTasks ?? []).slice(0, 5).map((task) => (
              <div key={task.id} className="py-2.5 text-sm">
                {renderTaskLink(task)}
              </div>
            ))}
          </div>
        </section>
      )}

      {upcomingTasks && upcomingTasks.length > 0 && (
        <section style={{ opacity: 0 }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#999999]" />
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Upcoming</h3>
            <span className="font-mono text-[11px] text-muted-foreground">({upcomingTasks.length})</span>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="py-2.5 text-sm">
                {renderTaskLink(task)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
