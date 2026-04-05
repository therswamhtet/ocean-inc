'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

async function requireTeamMember() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.app_metadata.role !== 'team_member') {
    throw new Error('Unauthorized')
  }

  return { supabase, userId: user.id }
}

export async function markNotificationAsRead(notificationId: string) {
  const { supabase, userId } = await requireTeamMember()

  if (!notificationId) {
    return
  }

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('team_member_id', userId)

  revalidatePath('/team')
  revalidatePath('/team/tasks')
  revalidatePath('/team', 'layout')
}

export async function markAllNotificationsAsRead() {
  const { supabase, userId } = await requireTeamMember()

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false)
    .eq('team_member_id', userId)

  revalidatePath('/team')
  revalidatePath('/team/tasks')
  revalidatePath('/team', 'layout')
}
