'use client'

import { useEffect, useState } from 'react'
import { Check, Link as LinkIcon } from 'lucide-react'

import { LABELS } from '@/lib/labels'

export function ShareLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    setUrl(`${window.location.origin}/portal/${slug}`)
  }, [slug])

  function handleCopy() {
    if (url) {
      try {
        void navigator.clipboard.writeText(url)
      } catch {
        // Fallback for environments where clipboard API is restricted
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
    }
  }

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [copied])

  if (!url) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        onClick={handleCopy}
        title={url}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            {LABELS.share.copied}
          </>
        ) : (
          <>
            <LinkIcon className="h-3 w-3" />
            {LABELS.share.copyAction}
          </>
        )}
      </button>
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {copied ? LABELS.share.copied : ''}
      </span>
    </div>
  )
}
