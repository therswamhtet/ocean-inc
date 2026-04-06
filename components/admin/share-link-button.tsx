'use client'

import { useEffect, useState } from 'react'
import { Check, Link2 } from 'lucide-react'

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
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  if (!url) return null

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      onClick={handleCopy}
      title={url}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Share Link
        </>
      )}
    </button>
  )
}
