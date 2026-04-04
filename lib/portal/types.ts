export type PortalTaskStatus = 'todo' | 'in_progress' | 'done'

export type PortalTask = {
  id: string
  projectId: string
  title: string
  caption: string | null
  designFilePath: string | null
  postingDate: string | null
  status: PortalTaskStatus
}

export type PortalProject = {
  id: string
  clientId: string
  name: string
  month: number
  year: number
  status: 'active'
}

export type PortalClient = {
  id: string
  name: string
  slug: string
}

export type PortalData = {
  client: PortalClient
  activeProject: PortalProject | null
  tasks: PortalTask[]
}
