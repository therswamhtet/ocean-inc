'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Link as LinkIcon } from 'lucide-react'

export function ShareLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    setUrl(`${window.location.origin}/portal/${slug}`)
  }, [slug])

  function handleCopy() {
    if (url) {
      void navigator.clipboard.writeText(url)
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
            Copied
          </>
        ) : (
          <>
            <LinkIcon className="h-3 w-3" />
            Share Link
          </>
        )}
      </button>
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {copied ? 'Link copied.' : ''}
      </span>
    </div>
  )
}
