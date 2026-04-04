'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { formatDistanceToNow } from 'date-fns'

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
          <h3 className="text-base font-semibold">Recent Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#222222] px-1.5 text-[10px] font-medium text-white">
              {unreadCount}
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
