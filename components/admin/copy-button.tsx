'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CopyButtonProps = {
  text: string
  label?: string
  className?: string
}

export default function CopyButton({ text, label, className }: CopyButtonProps) {
  const displayLabel = label ?? LABELS.copy.label
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [copied])

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy()}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? LABELS.copy.copied : displayLabel}
      </Button>
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {copied ? LABELS.copy.confirmation : ''}
      </span>
    </div>
  )
}
