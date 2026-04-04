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

export function CreateClientDialog({ errorMessage }: CreateClientDialogProps) {
  const [open, setOpen] = useState(Boolean(errorMessage))

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
