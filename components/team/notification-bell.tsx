'use client'

import Link from 'next/link'
import { Bell, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/team/notifications/actions'
import { formatDistanceToNow } from 'date-fns'

type Notification = {
  id: string
  message: string
  created_at: string | null
  read: boolean | null
}

function formatNotificationTime(createdAt: string | null) {
  if (!createdAt) return 'Just now'
  return formatDistanceToNow(new Date(createdAt), { addSuffix: true })
}

export function TeamNotificationBell({ notifications, unreadCount }: { notifications: Notification[] | null; unreadCount: number }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:bg-muted/30"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-white">
              {unreadCount > 0 ? unreadCount : ''}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <form action={markAllNotificationsAsRead}>
              <button type="submit" className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            </form>
          )}
        </div>

        {notifications && notifications.length > 0 ? (
          <ul className="max-h-[360px] overflow-y-auto">
            {notifications.map((notification) => {
              const markAsRead = markNotificationAsRead.bind(null, notification.id)
              return (
                <li key={notification.id} className="border-b border-border last:border-b-0">
                  <form action={markAsRead}>
                    <button
                      type="submit"
                      className={cn(
                        'flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-muted/30',
                        !notification.read && 'border-l-2 border-l-foreground pl-[14px]'
                      )}
                    >
                      <span className="space-y-1">
                        <span className="block text-sm font-medium">{notification.message}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
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
      </PopoverContent>
    </Popover>
  )
}
