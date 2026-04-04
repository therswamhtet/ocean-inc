import Link from 'next/link'

import { format, formatDistanceToNow, startOfMonth } from 'date-fns'

import { markNotificationAsRead } from '@/app/admin/notifications/actions'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

const metricCardClassName = 'rounded-lg border border-border p-4'

function formatNotificationTime(createdAt: string | null) {
  if (!createdAt) {
    return 'Just now'
  }

  return formatDistanceToNow(new Date(createdAt), { addSuffix: true })
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const [
    { count: activeProjects },
    { count: inProgress },
    { count: overdue },
    { count: completedThisMonth },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('posting_date', today)
      .neq('status', 'done'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .gte('updated_at', monthStart),
  ])

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const metrics = [
    { label: 'Active Projects', value: activeProjects ?? 0 },
    { label: 'In Progress', value: inProgress ?? 0 },
    {
      label: 'Overdue',
      value: overdue ?? 0,
      className: 'border-l-4 border-l-red-500',
    },
    { label: 'Completed This Month', value: completedThisMonth ?? 0 },
  ]

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track current project volume and the latest team updates.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className={cn(metricCardClassName, metric.className)}>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold">{metric.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <h3 className="text-base font-semibold">Recent Notifications</h3>
            <p className="text-sm text-muted-foreground">Latest updates from the team.</p>
          </div>

          <Link href="/admin/notifications" className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground">
            View all notifications
          </Link>
        </div>

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
      </section>
    </div>
  )
}
