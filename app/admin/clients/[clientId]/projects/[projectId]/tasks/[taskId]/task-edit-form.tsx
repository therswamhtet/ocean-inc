'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Calendar, ClipboardCopy, FileImage, ImageUp, LoaderCircle, Save, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  deleteTaskAction,
  updateTaskAction,
  updateTaskFilePathAction,
} from '@/app/admin/clients/[clientId]/projects/[projectId]/actions'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { LABELS } from '@/lib/labels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput, TimeInput } from '@/components/ui/date-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function isImageFile(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
}

function useDesignImageUrl(filePath: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  const prevPath = useRef(filePath)

  if (prevPath.current !== filePath) {
    prevPath.current = filePath
    setUrl(null)
  }

  if (!filePath) return null
  if (url) return url

  createClient()
    .storage.from('design-files')
    .createSignedUrl(filePath, 3600)
    .then(({ data, error }) => {
      if (!error && data?.signedUrl) setUrl(data.signedUrl)
    })

  return null
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  briefing: z.string().optional(),
  caption: z.string().optional(),
  postingDate: z.string().optional(),
  postingTime: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  designFilePath: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

type TaskEditFormProps = {
  clientId: string
  projectId: string
  task: {
    id: string
    title: string
    briefing: string | null
    caption: string | null
    postingDate: string | null
    postingTime?: string | null
    dueDate?: string | null
    deadline: string | null
    status: 'todo' | 'in_progress' | 'done'
    designFilePath: string | null
  }
}

const statusOptions: { value: 'todo' | 'in_progress' | 'done'; label: string; dot: string }[] = [
  { value: 'todo', label: 'To Do', dot: 'bg-[#999999]' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-[#D4A843]' },
  { value: 'done', label: 'Done', dot: 'bg-[#4A9E5C]' },
]

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  )
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </label>
  )
}

export function TaskEditForm({
  clientId,
  projectId,
  task,
}: TaskEditFormProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [designFilePath, setDesignFilePath] = useState(task.designFilePath)
  const [isSaving, startSaving] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const [isReplacing, startReplacing] = useTransition()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      briefing: task.briefing ?? '',
      caption: task.caption ?? '',
      postingDate: task.postingDate ?? '',
      postingTime: task.postingTime ?? '10:00',
      deadline: task.deadline ?? '',
      status: task.status,
      designFilePath: task.designFilePath ?? '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const previewUrl = useDesignImageUrl(designFilePath)
  const currentFileName = useMemo(() => designFilePath?.split('/').pop() ?? null, [designFilePath])
  const projectPath = `/admin/clients/${clientId}/projects/${projectId}`
  const showDesignImage = designFilePath && isImageFile(designFilePath)
  const [copiedCaption, setCopiedCaption] = useState(false)

  const handleCopyCaption = async () => {
    const caption = watch('caption') ?? ''
    if (!caption) return
    try {
      await navigator.clipboard.writeText(caption)
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2000)
    } catch { /* */ }
  }

  const onSubmit = handleSubmit((values) => {
    setFeedback(null)
    startSaving(async () => {
      const result = await updateTaskAction(task.id, {
        ...values,
        designFilePath: designFilePath ?? '',
      })
      if (result.success) {
        setFeedback('Saved')
        router.refresh()
      } else {
        setFeedback(result.error)
      }
    })
  })

  const handleDesignUpload = (path: string) => {
    setFeedback(null)
    setDesignFilePath(path)
    setValue('designFilePath', path, { shouldDirty: true })
    startReplacing(async () => {
      const result = await updateTaskFilePathAction(task.id, path)
      if (result.success) {
        setFeedback('Design file uploaded.')
        router.refresh()
      } else {
        setFeedback(result.error)
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Content */}
      <Section title="Content">
        <div>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" placeholder="Instagram carousel" {...register('title')} />
          {errors.title && <p className="mt-2 text-sm text-[#D71921]">{errors.title.message}</p>}
        </div>

        <div>
          <FieldLabel htmlFor="briefing">Briefing</FieldLabel>
          <Textarea id="briefing" placeholder="Key notes, references, or campaign direction" rows={4} {...register('briefing')} />
          <p className="mt-2 text-[11px] text-muted-foreground font-mono uppercase tracking-[0.06em]">URLs will render as clickable links</p>
          {errors.briefing && <p className="mt-2 text-sm text-[#D71921]">{errors.briefing.message}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel htmlFor="caption">Caption</FieldLabel>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-raised hover:text-foreground transition font-mono uppercase tracking-[0.06em]"
            >
              <ClipboardCopy className="h-3 w-3" />
              {copiedCaption ? 'Copied' : 'Copy'}
            </button>
          </div>
          <Textarea id="caption" placeholder="Write the post caption here" rows={4} {...register('caption')} />
          {errors.caption && <p className="mt-2 text-sm text-[#D71921]">{errors.caption.message}</p>}
        </div>
      </Section>

      {/* Schedule */}
      <Section title="Schedule" icon={Calendar}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="postingDate">{LABELS.task.postingDate}</FieldLabel>
            <DateInput id="postingDate" {...register('postingDate')} />
            {errors.postingDate && <p className="mt-2 text-sm text-[#D71921]">{errors.postingDate.message}</p>}
          </div>

          <div>
            <FieldLabel htmlFor="postingTime">Posting Time</FieldLabel>
            <TimeInput id="postingTime" {...register('postingTime')} />
            {errors.postingTime && <p className="mt-2 text-sm text-[#D71921]">{errors.postingTime.message}</p>}
          </div>

          <div>
            <FieldLabel htmlFor="deadline">{LABELS.task.deadline}</FieldLabel>
            <DateInput id="deadline" {...register('deadline')} />
            {errors.deadline && <p className="mt-2 text-sm text-[#D71921]">{errors.deadline.message}</p>}
          </div>

          <div>
            <FieldLabel>Status</FieldLabel>
            <Select
              value={watch('status')}
              onValueChange={(value: 'todo' | 'in_progress' | 'done') =>
                setValue('status', value, { shouldDirty: true, shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="inline-flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', opt.dot)} />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="mt-2 text-sm text-[#D71921]">{errors.status.message}</p>}
          </div>
        </div>
      </Section>

      {/* Design File */}
      <Section title="Design File" icon={FileImage}>
        {designFilePath && currentFileName ? (
          <div className="space-y-5">
            {showDesignImage && previewUrl && (
              <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
                <img src={previewUrl} alt={currentFileName} className="h-auto w-full max-h-80 object-contain" />
              </div>
            )}
            {showDesignImage && !previewUrl && (
              <div className="flex items-center justify-center rounded-lg border border-border py-10">
                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <DesignFileDownloader fileName={currentFileName} filePath={designFilePath} />
              <span className="text-xs text-muted-foreground truncate font-mono">{currentFileName}</span>
            </div>
            <div className="rounded-lg border border-dashed border-border p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Replace file</p>
              <InlineUploader projectId={projectId} taskId={task.id} onUpload={handleDesignUpload} />
            </div>
          </div>
        ) : (
          <InlineUploader projectId={projectId} taskId={task.id} onUpload={handleDesignUpload} />
        )}
      </Section>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="font-mono text-[11px] uppercase tracking-[0.06em]">
            <Link href={projectPath}>
              <ArrowLeft className="h-4 w-4" />
              Back to project
            </Link>
          </Button>
          <Button disabled={isSaving || isReplacing} type="button" onClick={onSubmit} className="font-mono text-[11px] uppercase tracking-[0.06em]">
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving…' : LABELS.common.save}
          </Button>
        </div>

        <Button
          type="button"
          variant="destructive"
          disabled={isDeleting}
          onClick={() => {
            if (!window.confirm(LABELS.task.deleteConfirm)) return
            setFeedback(null)
            startDeleting(async () => {
              const result = await deleteTaskAction(task.id, projectId, designFilePath ?? undefined)
              if (result.success) {
                router.push(projectPath)
                router.refresh()
              } else {
                setFeedback(result.error)
              }
            })
          }}
          className="font-mono text-[11px] uppercase tracking-[0.06em]"
        >
          {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete task
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-border bg-surface-raised px-5 py-3 text-sm text-foreground font-mono">{feedback}</div>
      )}
    </div>
  )
}

function InlineUploader({ projectId, taskId, onUpload }: {
  projectId: string
  taskId: string
  onUpload: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Only image files are supported.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Files must be 10MB or smaller.'); return }
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'jpg'
    const path = `${projectId}/temp/${crypto.randomUUID()}/${crypto.randomUUID()}.${ext}`
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('path', path)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        const result = await updateTaskFilePathAction(taskId, data.path)
        if (result.success) onUpload(data.path)
        else setError(result.error ?? 'Failed to save.')
      } else { setError('Upload failed.') }
    } catch { setError('Upload failed.') }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = '' }} />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f) }}
        className={cn(
          'rounded-lg border-2 border-dashed px-6 py-8 text-center transition cursor-pointer',
          isDragging ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20 hover:bg-surface-raised'
        )}
      >
        <div className="mx-auto flex flex-col items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised">
            {uploading ? <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" /> : <ImageUp className="h-5 w-5 text-muted-foreground" />}
          </div>
          <p className="text-sm font-medium text-foreground">Upload design file</p>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-[0.06em]">Drag and drop or click to browse (max 10MB)</p>
        </div>
      </div>
      {error && <p className="text-sm text-[#D71921]">{error}</p>}
    </div>
  )
}
