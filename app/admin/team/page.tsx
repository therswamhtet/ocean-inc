import crypto from 'node:crypto'

import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

import { InviteSection } from './invite-section'
import { createClient } from '@/lib/supabase/server'

type TeamMemberRow = {
  id: string
  name: string
  email: string
  created_at: string
  task_assignments: Array<{ count: number | null }> | null
}

const INVITE_TOKEN_BYTES = 16
const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export default async function TeamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, email, created_at, task_assignments(count)')
    .order('created_at', { ascending: false })
    .returns<TeamMemberRow[]>()

  if (error) {
    throw new Error(error.message)
  }

  const teamMembers = (data ?? []).map((member) => ({
    ...member,
    assignedTaskCount: member.task_assignments?.[0]?.count ?? 0,
  }))

  async function generateInviteTokenAction(email: string) {
    'use server'

    const normalizedEmail = String(email ?? '').trim().toLowerCase()

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { error: 'A valid email address is required' }
    }

    const actionSupabase = await createClient()
    const {
      data: { user: actionUser },
    } = await actionSupabase.auth.getUser()

    if (!actionUser) {
      return { error: 'Unauthorized' }
    }

    const { data: existingMembers, error: existingMemberError } = await actionSupabase
      .from('team_members')
      .select('id')
      .ilike('email', normalizedEmail)
      .limit(1)

    if (existingMemberError) {
      return { error: existingMemberError.message }
    }

    if ((existingMembers ?? []).length > 0) {
      return { error: 'This email already belongs to a team member' }
    }

    const token = crypto.randomBytes(INVITE_TOKEN_BYTES).toString('hex')
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS).toISOString()

    const { error: inviteError } = await actionSupabase.from('invite_tokens').insert({
      token,
      email: normalizedEmail,
      expires_at: expiresAt,
    })

    if (inviteError) {
      return { error: inviteError.message }
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
    revalidatePath('/admin/team')

    return {
      success: true as const,
      inviteUrl: `${siteUrl}/invite/${token}`,
      token,
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-border bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Team Members</p>
        <div>
          <h2 className="text-2xl font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Review who is on the team, when they joined, and how many tasks are currently assigned.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        {teamMembers.length === 0 ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No team members yet.</h3>
            <p className="text-sm text-muted-foreground">Invite your first member below.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Assigned Tasks</th>
                  <th className="px-3 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/80 last:border-b-0">
                    <td className="px-3 py-4 font-medium text-foreground">{member.name}</td>
                    <td className="px-3 py-4 text-muted-foreground">{member.email}</td>
                    <td className="px-3 py-4">{member.assignedTaskCount}</td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <InviteSection generateInviteTokenAction={generateInviteTokenAction} />
    </div>
  )
}
