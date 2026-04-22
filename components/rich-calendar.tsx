'use client'

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  format,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek as dfStartOfWeek,
  endOfWeek as dfEndOfWeek,
  eachDayOfInterval,
} from 'date-fns'

// ── Types ──────────────────────────────────────────────────────
export type RichCalendarDayEvent = {
  id: string
  title: string
  color: number
  subtitle?: string
}

export type RichCalendarDayInfo = {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: RichCalendarDayEvent[]
}

export type RichCalendarProps = {
  days: RichCalendarDayInfo[][]
  heading: string
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onEventClick?: (event: RichCalendarDayEvent) => void
  maxEvents?: number
  showHeader?: boolean
  showNavigation?: boolean
  viewMode?: 'month' | 'week'
  onViewModeChange?: (mode: 'month' | 'week') => void
  className?: string
  expandable?: boolean
  onExpandDay?: (dayKey: string, expanded: boolean) => void
  expandedDays?: Set<string>
}

// ── Nothing-style monochrome event colours ─────────────────────
const EVENT_COLOURS = [
  { bar: 'bg-[#1A1A1A]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#4A4A4A]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#6B6B6B]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#8C8C8C]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#3D3D3D]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#525252]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#757575]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#999999]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#2A2A2A]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
  { bar: 'bg-[#5A5A5A]',       pill: 'bg-surface border-border',              text: 'text-foreground' },
]

// ── Desktop grid cell ──────────────────────────────────────────
function DeskCell({
  day, events, onClickEvent, expandable, onExpand, expanded, maxEvents = 3,
}: {
  day: RichCalendarDayInfo; events: RichCalendarDayEvent[];
  onClickEvent?: (e: RichCalendarDayEvent) => void;
  expandable?: boolean; onExpand?: (key: string, expanded: boolean) => void;
  expanded?: boolean; maxEvents?: number;
}) {
  const visible = expanded ? events : events.slice(0, maxEvents)
  const overflow = !expanded && events.length > maxEvents ? events.length - maxEvents : 0
  const key = format(day.date, 'yyyy-MM-dd')

  return (
    <div
      className={cn(
        'group relative flex min-h-[140px] flex-col rounded-lg border border-border/60 bg-surface p-3 transition-colors',
        day.isToday && 'border-foreground/20 bg-surface-raised',
        day.isToday && !day.isCurrentMonth && 'bg-surface-raised/50',
        day.isCurrentMonth === false && 'bg-surface',
        expandable && events.length > 0 && 'cursor-pointer'
      )}
      onClick={() => { if (expandable && events.length > 0) onExpand?.(key, !expanded) }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && expandable && events.length > 0) {
          e.preventDefault(); onExpand?.(key, !expanded)
        }
      }}
      role={expandable && events.length > 0 ? 'button' : undefined}
      tabIndex={expandable && events.length > 0 ? 0 : undefined}
      aria-expanded={expandable && events.length > 0 ? expanded : undefined}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          'text-sm font-semibold',
          day.isToday
            ? 'flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-bold text-background'
            : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/35'
        )}>
          {format(day.date, 'd')}
        </span>
        {events.length > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{events.length} tasks</span>
        )}
      </div>

      {/* Event cards — Trello-style with accent bar */}
      <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
        {visible.map((ev) => {
          const c = EVENT_COLOURS[ev.color % EVENT_COLOURS.length]
          return (
            <div
              key={ev.id}
              onClick={(e) => { e.stopPropagation(); onClickEvent?.(ev) }}
              className={cn(
                'relative overflow-hidden rounded-md border bg-surface transition cursor-pointer hover:bg-surface-raised',
                c.pill
              )}
            >
              {/* Accent bar */}
              <div className={cn('absolute left-0 top-0 bottom-0 w-1', c.bar)} />
              <div className="pl-3 pr-2.5 py-2">
                <p className="truncate text-xs font-medium text-foreground leading-snug">{ev.title}</p>
                {ev.subtitle && <p className="truncate text-[10px] text-muted-foreground mt-0.5 leading-tight">{ev.subtitle}</p>}
              </div>
            </div>
          )
        })}
        {overflow > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (expandable) onExpand?.(key, !expanded)
            }}
            className="mt-0.5 w-full text-left text-[10px] font-medium text-muted-foreground px-2.5 py-1.5 rounded-md hover:bg-surface-raised transition"
          >
            +{overflow} more…
          </button>
        )}
      </div>
    </div>
  )
}

// ── Mobile day card (vertical feed) ────────────────────────────
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function MobileDayCard({
  day, events, onClickEvent, expandable, onExpand, expanded, maxEvents = 3,
}: {
  day: RichCalendarDayInfo; events: RichCalendarDayEvent[];
  onClickEvent?: (e: RichCalendarDayEvent) => void;
  expandable?: boolean; onExpand?: (key: string, expanded: boolean) => void;
  expanded?: boolean; maxEvents?: number;
}) {
  const visible = expanded ? events : events.slice(0, maxEvents)
  const overflow = !expanded && events.length > maxEvents ? events.length - maxEvents : 0
  const key = format(day.date, 'yyyy-MM-dd')

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        day.isToday
          ? 'border-foreground/20 bg-surface-raised'
          : day.isCurrentMonth
            ? 'border-border bg-surface'
            : 'border-border/40 bg-surface',
        expandable && events.length > 0 && 'cursor-pointer active:bg-surface-raised/50'
      )}
      onClick={() => { if (expandable && events.length > 0) onExpand?.(key, !expanded) }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && expandable && events.length > 0) {
          e.preventDefault(); onExpand?.(key, !expanded)
        }
      }}
      role={expandable && events.length > 0 ? 'button' : undefined}
      tabIndex={expandable && events.length > 0 ? 0 : undefined}
      aria-expanded={expandable && events.length > 0 ? expanded : undefined}
    >
      {/* Day header */}
      <div className="flex items-center gap-3 mb-2">
        <span className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold',
          day.isToday
            ? 'bg-foreground text-background'
            : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
        )}>
          {format(day.date, 'd')}
        </span>
        <div className="min-w-0">
          <p className={cn(
            'text-sm font-semibold',
            day.isToday ? 'text-foreground' : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
          )}>
            {DAY_SHORT[day.date.getDay()]}
          </p>
          {!day.isCurrentMonth && <p className="text-xs text-muted-foreground/40">This month</p>}
        </div>
        {events.length > 0 && (
          <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
            {events.length}
          </span>
        )}
      </div>

      {/* Event cards */}
      {events.length > 0 ? (
        <div className="space-y-2">
          {visible.map((ev) => {
            const c = EVENT_COLOURS[ev.color % EVENT_COLOURS.length]
            return (
              <div
                key={ev.id}
                onClick={(e) => { e.stopPropagation(); onClickEvent?.(ev) }}
                className={cn(
                  'relative overflow-hidden rounded-lg border bg-surface cursor-pointer transition hover:bg-surface-raised active:scale-[0.99]',
                  c.pill
                )}
              >
                <div className={cn('absolute left-0 top-0 bottom-0 w-1', c.bar)} />
                <div className="flex items-start gap-3 pl-3 pr-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground leading-snug">{ev.title}</p>
                    {ev.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate leading-tight">{ev.subtitle}</p>}
                  </div>
                </div>
              </div>
            )
          })}
          {overflow > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (expandable) onExpand?.(key, !expanded)
              }}
              className="w-full text-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground py-2 rounded-lg border border-border hover:bg-surface-raised transition"
            >
              Show {overflow} more task{overflow > 1 ? 's' : ''}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50 ml-12">No tasks</p>
      )}
    </div>
  )
}

// ── Main calendar component ────────────────────────────────────
const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function RichCalendar({
  days, heading, onNavigatePrev, onNavigateNext, onEventClick,
  maxEvents = 3, showHeader = true, showNavigation = true,
  viewMode, onViewModeChange, className, expandable,
  onExpandDay, expandedDays = new Set(),
}: RichCalendarProps) {
  return (
    <section className={cn('flex flex-col rounded-xl border border-border bg-surface', className)}>
      {/* ── Header  */}
      {showHeader && (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Calendar</h3>
            <span className="text-lg font-semibold tracking-tight text-foreground">{heading}</span>
          </div>

          <div className="flex items-center gap-2">
            {viewMode && onViewModeChange && (
              <div className="mr-2 inline-flex rounded-lg border border-border p-1">
                {(['month', 'week'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onViewModeChange(m)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition',
                      viewMode === m
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {m === 'month' ? 'Month' : 'Week'}
                  </button>
                ))}
              </div>
            )}
            {showNavigation && (
              <>
                <button
                  type="button"
                  onClick={onNavigatePrev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-surface-raised hover:text-foreground"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={onNavigateNext}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-surface-raised hover:text-foreground"
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          DESKTOP: Full 7-column grid (hidden on mobile)
         ═══════════════════════════════════════════════════════ */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        {days.map((week) => (
          <div key={format(week[0].date, 'yyyy-MM-dd')} className="grid grid-cols-7">
            {week.map((day) => (
              <DeskCell
                key={format(day.date, 'yyyy-MM-dd')}
                day={day} events={day.events}
                onClickEvent={onEventClick}
                expandable={expandable} onExpand={onExpandDay}
                expanded={expandedDays.has(format(day.date, 'yyyy-MM-dd'))}
                maxEvents={maxEvents}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE: Vertical card feed (only today + days with tasks)
         ═══════════════════════════════════════════════════════ */}
      <div className="block sm:hidden px-3 py-3 space-y-3">
        {days.flat()
          .filter((d) => d.events.length > 0 || d.isToday)
          .map((day) => (
            <MobileDayCard
              key={format(day.date, 'yyyy-MM-dd')}
              day={day} events={day.events}
              onClickEvent={onEventClick}
              expandable={expandable} onExpand={onExpandDay}
              expanded={expandedDays.has(format(day.date, 'yyyy-MM-dd'))}
              maxEvents={maxEvents}
            />
          ))}
      </div>
    </section>
  )
}

// ── Helpers ────────────────────────────────────────────────────
export function buildCalendarGrid(anchor: Date): Date[][] {
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)
  const gridStart = dfStartOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = dfEndOfWeek(monthEnd, { weekStartsOn: 0 })
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }
  return weeks
}
