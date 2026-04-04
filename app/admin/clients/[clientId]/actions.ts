'use server'

import { redirect } from 'next/navigation'

export async function createProjectAction(clientId: string, _formData: FormData) {
  void _formData
  redirect(`/admin/clients/${clientId}`)
}

export async function deleteProjectAction(_projectId: string, clientId: string) {
  redirect(`/admin/clients/${clientId}`)
}
