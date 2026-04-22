'use client'

import { useState, useTransition } from 'react'
import { Download, LoaderCircle } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

type DesignFileDownloaderProps = {
  filePath: string
  fileName: string
}

export default function DesignFileDownloader({ filePath, fileName }: DesignFileDownloaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function download() {
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: signedUrlError } = await supabase.storage.from('design-files').createSignedUrl(filePath, 60)

      if (signedUrlError || !data?.signedUrl) {
        setError('Download link expired, please refresh')
        return
      }

      window.open(data.signedUrl, '_blank')
    })
  }

  return (
    <div className="w-full overflow-hidden">
      <button
        type="button"
        onClick={download}
        disabled={isPending}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition hover:bg-surface-raised disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0"
        title={fileName}
      >
        {isPending ? (
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <Download className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate min-w-0 text-left leading-tight">{fileName}</span>
      </button>
      {error && <p className="text-sm text-[#D71921] mt-2">{error}</p>}
    </div>
  )
}
