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
import { Label } from '@/components/ui/label'

type CreateClientDialogProps = {
  errorMessage?: string
}

const CLIENT_PALETTE = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#F97316']

export function CreateClientDialog({ errorMessage }: CreateClientDialogProps) {
  const [open, setOpen] = useState(Boolean(errorMessage))
  const [selectedColor, setSelectedColor] = useState(() =>
    CLIENT_PALETTE[Math.floor(Math.random() * CLIENT_PALETTE.length)]
  )

  useEffect(() => {
    setOpen(Boolean(errorMessage))
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

        <form action={createClientAction} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client name</Label>
            <Input
              id="client-name"
              name="name"
              minLength={2}
              placeholder="Northwind Studio"
              required
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label>Brand color</Label>
            <div className="flex gap-2">
              {CLIENT_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`h-7 w-7 rounded-full transition ring-2 ring-offset-1 ${selectedColor === c ? 'ring-foreground scale-110' : 'ring-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <input type="hidden" name="color" value={selectedColor} />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit">{LABELS.project.create}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
