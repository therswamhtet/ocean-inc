'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CopyButtonProps = {
  text: string
  label?: string
  className?: string
}

export default function CopyButton({ text, label = 'Copy', className }: CopyButtonProps) {
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
        {copied ? 'Copied' : label}
      </Button>
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {copied ? 'Copied to clipboard.' : ''}
      </span>
    </div>
  )
}
