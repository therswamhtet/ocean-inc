'use client'

import { useMemo, useState, useTransition } from 'react'

import { updateTeamTaskContentAction, updateTeamTaskFilePathAction } from '@/app/team/tasks/actions'
import CopyButton from '@/components/admin/copy-button'
import DesignFileDownloader from '@/components/admin/design-file-downloader'
import { DesignFileUploader } from '@/components/admin/design-file-uploader'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { linkify } from '@/lib/utils'

type TaskDetailFormProps = {
  task: {
    id: string
    title: string
    briefing: string | null
    caption: string | null
    postingDate: string | null
    dueDate: string | null
    deadline: string | null
    status: 'todo' | 'in_progress' | 'done'
    designFilePath: string | null
    projectName: string
    clientName: string
  }
}

function ReadOnlyValue({ value }: { value: string | null }) {
  return <div className="rounded-lg border border-border px-3 py-3 text-sm text-foreground">{value || '—'}</div>
}

function BriefingValue({ text }: { text: string | null }) {
  if (!text) {
    return <ReadOnlyValue value={null} />
  }

  return (
    <div
      className="rounded-lg border border-border px-3 py-3 text-sm text-foreground"
      dangerouslySetInnerHTML={{ __html: linkify(text) }}
    />
  )
}

export function TaskDetailForm({ task }: TaskDetailFormProps) {
  const [caption, setCaption] = useState(task.caption ?? '')
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(task.status)
  const [designFilePath, setDesignFilePath] = useState(task.designFilePath)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSavingCaption, startSavingCaption] = useTransition()
  const [isSavingStatus, startSavingStatus] = useTransition()
  const [isReplacingFile, startReplacingFile] = useTransition()

  const currentFileName = useMemo(() => designFilePath?.split('/').pop() ?? null, [designFilePath])

  function saveContent(nextValues: { caption: string; status: 'todo' | 'in_progress' | 'done' }, successMessage: string) {
    setFeedback(null)

    return updateTeamTaskContentAction(task.id, nextValues).then((result) => {
      if (result.success) {
        setFeedback(successMessage)
        return
      }

      setFeedback(result.error)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <section className="space-y-6 rounded-lg border border-border p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Task context</p>
          <h2 className="text-lg font-semibold text-foreground">Review your assigned work</h2>
          <p className="text-sm text-muted-foreground">Project: {task.projectName} · Client: {task.clientName}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <ReadOnlyValue value={task.title} />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>Briefing</FieldLabel>
            <BriefingValue text={task.briefing} />
          </Field>

          <Field>
            <FieldLabel>Posting date</FieldLabel>
            <ReadOnlyValue value={task.postingDate} />
          </Field>

          <Field>
            <FieldLabel>Due date</FieldLabel>
            <ReadOnlyValue value={task.dueDate} />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>Deadline</FieldLabel>
            <ReadOnlyValue value={task.deadline} />
          </Field>
        </div>
      </section>

      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Caption</h3>
              <p className="text-sm text-muted-foreground">Update the social copy without changing your file or status.</p>
            </div>
            <CopyButton text={caption} />
          </div>

          <Field>
            <FieldLabel htmlFor="caption">Caption text</FieldLabel>
            <Textarea
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write the post caption here"
            />
          </Field>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSavingCaption}
              onClick={() => {
                startSavingCaption(() => {
                  void saveContent({ caption, status }, 'Caption saved.')
                })
              }}
            >
              {isSavingCaption ? 'Saving...' : 'Save caption'}
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Status</h3>
            <p className="text-sm text-muted-foreground">Change progress without bundling other edits.</p>
          </div>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select value={status} onValueChange={(value: 'todo' | 'in_progress' | 'done') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSavingStatus}
              onClick={() => {
                startSavingStatus(() => {
                  void saveContent({ caption, status }, 'Status saved.')
                })
              }}
            >
              {isSavingStatus ? 'Saving...' : 'Save status'}
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Design file</h3>
            <p className="text-sm text-muted-foreground">Download the current file or upload a replacement.</p>
          </div>

          {designFilePath && currentFileName ? (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Current file: {currentFileName}</p>
                <p className="break-all text-xs text-muted-foreground">{designFilePath}</p>
              </div>
              <DesignFileDownloader filePath={designFilePath} fileName={currentFileName} />
            </div>
          ) : (
            <FieldDescription>No design file uploaded yet.</FieldDescription>
          )}

          <div className="border-t border-border pt-4">
            <DesignFileUploader
              projectId={task.id}
              taskId={task.id}
              onUploadComplete={(path) => {
                setFeedback(null)
                setDesignFilePath(path)

                startReplacingFile(async () => {
                  const result = await updateTeamTaskFilePathAction(task.id, path)

                  if (result.success) {
                    setFeedback(task.designFilePath ? 'Design file replaced.' : 'Design file uploaded.')
                    return
                  }

                  setFeedback(result.error)
                })
              }}
            />
            {isReplacingFile ? (
              <p className="mt-2 text-sm text-muted-foreground">Saving file reference...</p>
            ) : null}
          </div>
        </section>

        {feedback ? <div className="rounded-lg border border-border px-3 py-2 text-sm">{feedback}</div> : null}
      </div>
    </div>
  )
}
