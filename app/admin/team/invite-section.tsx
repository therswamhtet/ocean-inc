'use client'

import { Copy, Link2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type GenerateInviteTokenResult =
  | { error: string }
  | { success: true; inviteUrl: string; token: string }

type InviteSectionProps = {
  generateInviteTokenAction: (email: string) => Promise<GenerateInviteTokenResult>
}

export function InviteSection({ generateInviteTokenAction }: InviteSectionProps) {
  const [email, setEmail] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setInviteUrl('')
    setCopied(false)

    startTransition(async () => {
      const result = await generateInviteTokenAction(email)

      if ('error' in result) {
        setError(result.error)
        return
      }

      setInviteUrl(result.inviteUrl)
      setEmail('')
    })
  }

  async function handleCopy() {
    if (!inviteUrl) {
      return
    }

    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-white p-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Invite</p>
        <div>
          <h2 className="text-xl font-semibold">Invite a team member</h2>
          <p className="text-sm text-muted-foreground">
            Generate a secure registration link for a new teammate and share it manually.
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@orca-digital.com"
          autoComplete="email"
          aria-label="Team member email address"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Generating…' : 'Generate Invite Link'}
        </Button>
      </form>

      {error ? <p className="text-sm text-status-overdue">{error}</p> : null}

      {inviteUrl ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white">
              <Link2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-medium">Invite link ready</p>
              <p className="break-all text-sm text-muted-foreground">{inviteUrl}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Share this link with the team member. They will use it to register.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
