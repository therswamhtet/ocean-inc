'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Settings as SettingsIcon, User, Mail, Lock } from 'lucide-react'
import { animate } from 'animejs'

import { updateProfile, type UpdateProfileResult } from './actions'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  user: {
    email: string
    id: string
    username: string | null
    name: string
  }
}

const initialState: UpdateProfileResult = {}

export function SettingsForm({ user }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const containerRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll('.settings-section')
      if (sections.length > 0) {
        animate(sections, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
          delay: (_el: unknown, i: number) => i * 100,
          ease: "out(3)",
        })
      }
    }
  }, [])

  useEffect(() => {
    if (state?.success && successRef.current) {
      animate(successRef.current, {
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 400,
        ease: "out(3)",
      })
    }
  }, [state?.success])

  useEffect(() => {
    if (state?.error && errorRef.current) {
      animate(errorRef.current, {
        opacity: [0, 1],
        translateX: [-15, 0],
        duration: 400,
        ease: "out(3)",
      })
    }
  }, [state?.error])

  return (
    <div ref={containerRef} className="max-w-xl space-y-6">
      <section className="settings-section space-y-2 rounded-lg border border-border bg-surface p-5" style={{ opacity: 0 }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Profile Settings</p>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account details and security.
          </p>
        </div>
      </section>

      {state?.success && !state.error && (
        <div ref={successRef} className="rounded-lg border border-[#4A9E5C]/20 bg-[#4A9E5C]/10 px-4 py-3 text-sm text-[#4A9E5C]" style={{ opacity: 0 }}>
          {state.success}
        </div>
      )}
      {state?.error && (
        <div ref={errorRef} className="rounded-lg border border-[#D71921]/20 bg-[#D71921]/10 px-4 py-3 text-sm text-[#D71921]" style={{ opacity: 0 }}>
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-8">
        {/* Identity section */}
        <section className="settings-section space-y-4 rounded-lg border border-border bg-surface p-5" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Profile</h3>
          </div>

          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              placeholder="Your full name"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              defaultValue={user.username ?? ''}
              placeholder="username"
            />
            <FieldDescription>If set, must be unique. Lowercase letters, numbers, and hyphens only.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              placeholder="you@example.com"
            />
            <FieldDescription>Changing your email requires confirmation at the new address.</FieldDescription>
          </Field>
        </section>

        {/* Password section */}
        <section className="settings-section space-y-4 rounded-lg border border-border bg-surface p-5" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Change Password</h3>
          </div>

          <Field>
            <FieldLabel htmlFor="current_password">Current Password</FieldLabel>
            <Input
              id="current_password"
              name="current_password"
              type="password"
              placeholder="Enter your current password"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new_password">New Password</FieldLabel>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm_password">Confirm New Password</FieldLabel>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Re-enter new password"
              minLength={6}
            />
          </Field>
          <FieldDescription>Leave blank to keep your current password.</FieldDescription>
        </section>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
