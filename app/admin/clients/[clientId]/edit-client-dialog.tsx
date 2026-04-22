'use client'

import { useState } from 'react'

import { Pencil } from 'lucide-react'

import { updateClientAction } from '@/app/admin/clients/[clientId]/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const CLIENT_PALETTE = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

type EditClientDialogProps = {
  client: {
    id: string
    name: string
    color: string | null
    description: string | null
    is_active: boolean
  }
}

export function EditClientDialog({ client }: EditClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(client.color || CLIENT_PALETTE[0])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-[11px] uppercase tracking-[0.06em]">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">Edit client</DialogTitle>
          <DialogDescription className="sr-only">Edit {client.name} details</DialogDescription>
        </DialogHeader>

        <form
          action={async (formData: FormData) => {
            await updateClientAction(client.id, formData)
            setOpen(false)
          }}
          className="space-y-5 pt-2"
        >
          <div className="space-y-2">
            <label htmlFor="edit-client-name" className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Name
            </label>
            <Input
              id="edit-client-name"
              name="name"
              defaultValue={client.name}
              minLength={1}
              required
              type="text"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Brand color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {CLIENT_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    selectedColor === c
                      ? 'ring-2 ring-foreground ring-offset-2 scale-110'
                      : 'ring-1 ring-border hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <input type="hidden" name="color" value={selectedColor} />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-client-description" className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Description
            </label>
            <Textarea
              id="edit-client-description"
              name="description"
              defaultValue={client.description ?? ''}
              maxLength={500}
              placeholder="What does this client do?"
              rows={3}
            />
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-[0.06em]">
              Internal reference only. Max 500 characters.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Status
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer transition hover:bg-surface-raised">
                <input
                  type="radio"
                  name="isActive"
                  value="true"
                  defaultChecked={client.is_active}
                  className="h-4 w-4 accent-foreground"
                />
                <span className="text-sm font-medium text-foreground">Active</span>
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer transition hover:bg-surface-raised">
                <input
                  type="radio"
                  name="isActive"
                  value="false"
                  defaultChecked={!client.is_active}
                  className="h-4 w-4 accent-foreground"
                />
                <span className="text-sm font-medium text-foreground">Inactive</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" className="font-mono text-[11px] uppercase tracking-[0.06em]">
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
