'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

import { createTaskAction } from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { LABELS } from '@/lib/labels'

type Client = {
  id: string
  name: string
  color: string
}

type Project = {
  id: string
  name: string
  month: string
  year: number
}

type QuickTaskDialogProps = {
  onSuccess?: () => void
}

export function QuickTaskDialog({ onSuccess }: QuickTaskDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch clients on mount
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('clients')
      .select('id, name, color')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setClients(data)
        }
      })
  }, [])

  // Fetch projects when client is selected
  useEffect(() => {
    if (!selectedClientId) {
      setProjects([])
      setSelectedProjectId('')
      return
    }

    const supabase = createClient()
    supabase
      .from('projects')
      .select('id, name, month, year')
      .eq('client_id', selectedClientId)
      .eq('status', 'active')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setProjects(data)
        }
      })
  }, [selectedClientId])

  const handleSubmit = () => {
    if (!selectedProjectId || !title.trim()) {
      setError('Please select a client, project, and enter a task title.')
      return
    }

    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await createTaskAction(selectedProjectId, {
        title: title.trim(),
        status: 'todo',
      })

      if (result.success) {
        setSuccess(true)
        setTitle('')
        setSelectedClientId('')
        setSelectedProjectId('')
        setProjects([])
        router.refresh()
        onSuccess?.()

        // Close dialog after brief success feedback
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
        }, 1000)
      } else {
        setError(result.error)
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle('')
      setSelectedClientId('')
      setSelectedProjectId('')
      setProjects([])
      setError(null)
      setSuccess(false)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Quick Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{LABELS.task.create}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Client Select */}
          <Field>
            <FieldLabel>Client</FieldLabel>
            <Select
              value={selectedClientId}
              onValueChange={(value) => {
                setSelectedClientId(value)
                setSelectedProjectId('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      {client.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Project Select */}
          <Field>
            <FieldLabel>Project</FieldLabel>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={!selectedClientId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={selectedClientId ? 'Select a project' : 'Select a client first'}
                />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.month} {project.year} — {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Title Input */}
          <Field>
            <FieldLabel>Task Title</FieldLabel>
            <Input
              placeholder="Instagram carousel post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg border border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
              Task created successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {LABELS.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? LABELS.task.creating : LABELS.common.create}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
