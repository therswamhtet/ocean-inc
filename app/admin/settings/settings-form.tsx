'use client'

import { useActionState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Mail, Lock } from 'lucide-react'

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

  return (
    <div className="max-w-xl space-y-6">
      <section className="space-y-2 rounded-lg border border-border bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile Settings</p>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account details and security.
          </p>
        </div>
      </section>

      {state?.success && !state.error && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {state.success}
        </div>
      )}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-8">
        {/* Identity section */}
        <section className="space-y-4 rounded-lg border border-border bg-white p-5">
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
        <section className="space-y-4 rounded-lg border border-border bg-white p-5">
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
