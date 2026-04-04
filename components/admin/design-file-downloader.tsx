'use client'

import { useState, useTransition } from 'react'
import { Download, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={download} disabled={isPending}>
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {fileName}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
