'use client'

import { useEffect, useState } from 'react'

import { Plus } from 'lucide-react'

import { createClientAction } from './actions'
import { Button } from '@/components/ui/button'
import { LABELS } from '@/lib/labels'
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

type CreateClientDialogProps = {
  errorMessage?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const CLIENT_PALETTE = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

export function CreateClientDialog({ errorMessage, open: controlledOpen, onOpenChange }: CreateClientDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(Boolean(errorMessage))
  const [selectedColor, setSelectedColor] = useState(() =>
    CLIENT_PALETTE[Math.floor(Math.random() * CLIENT_PALETTE.length)]
  )

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next)
    else setUncontrolledOpen(next)
  }

  useEffect(() => {
    if (errorMessage) setOpen(true)
  }, [errorMessage])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {LABELS.client.create}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{LABELS.client.createTitle}</DialogTitle>
          <DialogDescription>
            {LABELS.client.createDescription}
          </DialogDescription>
        </DialogHeader>

        <form action={createClientAction} className="space-y-5 pt-2">
          <div className="space-y-2">
            <label htmlFor="client-name" className="text-sm font-medium text-foreground">
              Client name
            </label>
            <Input
              id="client-name"
              name="name"
              minLength={2}
              placeholder="Northwind Studio"
              required
              type="text"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Brand color
            </label>
            <div className="flex items-center gap-2">
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
            <label htmlFor="client-description" className="text-sm font-medium text-foreground">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="client-description"
              name="description"
              maxLength={200}
              placeholder="What does this client do?"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Internal reference only. Max 200 characters.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-[#D71921]/20 bg-[#D71921]/5 px-4 py-3 text-sm text-[#D71921]">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button type="submit">{LABELS.project.create}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}