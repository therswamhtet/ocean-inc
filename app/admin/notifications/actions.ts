'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return supabase
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await requireAdmin()

  if (!notificationId) {
    return
  }

  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)

  // Revalidate all surfaces that can show notification state:
  // - Dashboard (recent notifications list)
  // - Notifications page (full list)
  // - Layout (bell badge with unread count)
  revalidatePath('/admin')
  revalidatePath('/admin/notifications')
  revalidatePath('/admin', 'layout')
}

export async function markAllNotificationsAsRead() {
  const supabase = await requireAdmin()

  await supabase.from('notifications').update({ read: true }).eq('read', false)

  // Revalidate all surfaces that can show notification state:
  // - Dashboard (recent notifications list)
  // - Notifications page (full list)
  // - Layout (bell badge with unread count)
  revalidatePath('/admin')
  revalidatePath('/admin/notifications')
  revalidatePath('/admin', 'layout')
}
