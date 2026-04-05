import { format } from 'date-fns'
import { Mail, Calendar, UserPlus, User } from 'lucide-react'

import { InviteSection } from './invite-section'
import { createClient } from '@/lib/supabase/server'

type TeamMemberRow = {
  id: string
  name: string
  email: string
  username: string | null
  created_at: string
  task_assignments: Array<{ count: number | null }> | null
}

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
    .select('id, name, email, username, created_at, task_assignments(count)')
    .order('created_at', { ascending: false })
    .returns<TeamMemberRow[]>()

  if (error) {
    throw new Error(error.message)
  }

  const teamMembers = (data ?? []).map((member) => ({
    ...member,
    assignedTaskCount: member.task_assignments?.[0]?.count ?? 0,
  }))

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-border bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Team Members</p>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-muted-foreground" />
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
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Username</th>
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Email</th>
                    <th className="px-3 py-3 font-medium">Assigned Tasks</th>
                    <th className="px-3 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border/80 last:border-b-0">
                      <td className="px-3 py-4 font-mono text-sm">
                        {member.username ? `@${member.username}` : <span className="text-muted-foreground italic">not set</span>}
                      </td>
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

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-border bg-white p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-medium text-foreground">{member.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="text-xs uppercase tracking-[0.1em]">Username</span>
                      <p className="font-mono">{member.username ? `@${member.username}` : <span className="italic">not set</span>}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-[0.1em]">Email</span>
                      <p className="truncate">{member.email}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-[0.1em]">Assigned Tasks</span>
                      <p>{member.assignedTaskCount}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs uppercase tracking-[0.1em]">Joined</span>
                      <p>{format(new Date(member.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <InviteSection />
    </div>
  )
}
