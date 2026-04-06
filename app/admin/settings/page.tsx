import { redirect } from 'next/navigation'

import { SettingsForm } from './settings-form'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('username, name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <SettingsForm
      user={{
        email: user.email ?? '',
        id: user.id,
        username: member?.username ?? null,
        name: member?.name ?? '',
      }}
    />
  )
}
