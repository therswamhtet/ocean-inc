'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const currentYear = new Date().getFullYear()

const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters'),
  month: z.coerce.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number().int().min(currentYear - 3, `Year must be between ${currentYear - 3} and ${currentYear + 3}`).max(currentYear + 3, `Year must be between ${currentYear - 3} and ${currentYear + 3}`),
  status: z.enum(['active', 'paused', 'done']).default('active'),
})

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

export async function createProjectAction(clientId: string, formData: FormData) {
  const supabase = await requireAdmin()

  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    month: formData.get('month'),
    year: formData.get('year'),
    status: formData.get('status') ?? 'active',
  })

  if (!parsed.success) {
    redirect(`/admin/clients/${clientId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Invalid project data')}`)
  }

  const { error } = await supabase.from('projects').insert({
    client_id: clientId,
    name: parsed.data.name,
    month: parsed.data.month,
    year: parsed.data.year,
    status: parsed.data.status ?? 'active',
  })

  if (error) {
    redirect(`/admin/clients/${clientId}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin')
  redirect(`/admin/clients/${clientId}`)
}

export async function deleteProjectAction(projectId: string, clientId: string) {
  await requireAdmin()
  const serviceRoleClient = createServiceRoleClient()

  const { error } = await serviceRoleClient.from('projects').delete().eq('id', projectId)

  if (error) {
    redirect(`/admin/clients/${clientId}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin')
  redirect(`/admin/clients/${clientId}`)
}
