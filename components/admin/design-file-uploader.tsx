'use client'

import { useRef, useState } from 'react'
import { ImageUp, LoaderCircle, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type DesignFileUploaderProps = {
  projectId: string
  onUploadComplete: (path: string) => void
  taskId?: string | null
}

const maxFileSize = 10 * 1024 * 1024

export function DesignFileUploader({ projectId, onUploadComplete, taskId }: DesignFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [filePath, setFilePath] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Files must be 10MB or smaller.')
      return
    }

    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      setError('You must be signed in to upload files.')
      return
    }

    const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
    const tempId = crypto.randomUUID()
    const path = taskId ? `${projectId}/${taskId}/${safeName}` : `${projectId}/temp/${tempId}/${safeName}`
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/design-files/${path}`

    setUploading(true)
    setProgress(0)
    setError(null)
    setFileName(file.name)

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
      xhr.setRequestHeader('x-upsert', 'true')

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return
        }

        setProgress(Math.round((event.loaded / event.total) * 100))
      }

      xhr.onload = () => {
        setUploading(false)

        if (xhr.status >= 200 && xhr.status < 300) {
          setFilePath(path)
          onUploadComplete(path)
        } else {
          setError('Upload failed. Please try again.')
        }

        resolve()
      }

      xhr.onerror = () => {
        setUploading(false)
        setError('Upload failed. Please check your connection and try again.')
        resolve()
      }

      xhr.send(file)
    })
  }

  async function handleFile(file: File | null) {
    if (!file || uploading) {
      return
    }

    await uploadFile(file)
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          void handleFile(event.dataTransfer.files?.[0] ?? null)
        }}
        className={cn(
          'rounded-lg border border-dashed border-border px-4 py-8 text-center transition',
          isDragging && 'border-foreground bg-muted/40',
          uploading && 'pointer-events-none opacity-80'
        )}
      >
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border">
            {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ImageUp className="h-5 w-5" />}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Upload design file</p>
            <p className="text-sm text-muted-foreground">
              Click to browse or drag and drop an image up to 10MB.
            </p>
          </div>

          <Button type="button" variant="outline">
            <Upload className="h-4 w-4" />
            Choose image
          </Button>
        </div>
      </div>

      {uploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{fileName || 'Uploading image'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {fileName ? (
        <div className="rounded-lg border border-border px-3 py-2 text-sm">
          <p className="font-medium text-foreground">{fileName}</p>
          {filePath ? <p className="mt-1 break-all text-xs text-muted-foreground">{filePath}</p> : null}
          <p className="mt-1 text-xs text-muted-foreground">Max size {Math.round(maxFileSize / (1024 * 1024))}MB</p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
