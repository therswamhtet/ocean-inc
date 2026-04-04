import Link from 'next/link'

import { formatDistanceToNow } from 'date-fns'

import { markAllNotificationsAsRead, markNotificationAsRead } from '@/app/admin/notifications/actions'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

function formatNotificationTime(createdAt: string | null) {
  if (!createdAt) {
    return 'Just now'
  }

  return formatDistanceToNow(new Date(createdAt), { addSuffix: true })
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin</p>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Review every team update and clear unread items.</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground">
            Back to dashboard
          </Link>

          <form action={markAllNotificationsAsRead}>
            <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted/30">
              Mark all as read
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-lg border border-border">
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
                        'flex w-full flex-col gap-2 px-4 py-4 text-left transition hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between',
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
          <p className="px-4 py-6 text-sm text-muted-foreground">No notifications to review.</p>
        )}
      </section>
    </div>
  )
}
