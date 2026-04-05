'use client'

import { useCallback, useState, useTransition, useRef, type FormEvent } from 'react'
import { checkUsernameAction, register } from './actions'

type InviteRegistrationFormProps = {
  token: string
  email: string
  initialError?: string
}

export function InviteRegistrationForm({ token, email, initialError }: InviteRegistrationFormProps) {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | 'checking' | null>(null)
  const [usernameMessage, setUsernameMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, startTransition] = useTransition()

  const checkUsername = useCallback((value: string) => {
    const cleaned = value.trim().toLowerCase()
    if (cleaned.length === 0) {
      setUsernameStatus(null)
      setUsernameMessage('')
      return
    }
    if (cleaned.length < 3) {
      setUsernameStatus('invalid')
      setUsernameMessage('Must be at least 3 characters')
      return
    }
    if (!/^[a-z0-9-]+$/.test(cleaned)) {
      setUsernameStatus('invalid')
      setUsernameMessage('Only lowercase letters, numbers, and hyphens allowed')
      return
    }

    setUsernameStatus('checking')
    setUsernameMessage('')

    startTransition(async () => {
      const result = await checkUsernameAction(value)
      if (result.available) {
        setUsernameStatus('available')
        setUsernameMessage('')
      } else if (result.error) {
        setUsernameStatus(result.available ? null : 'taken')
        setUsernameMessage(result.error)
      }
    })
  }, [startTransition])

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setUsername(value)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => checkUsername(value), 300)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await register(token, fd)
  }

  return (
    <>
      <form action={register.bind(null, token)} className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm mb-1">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm mb-1">Username</label>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">{"@"}</span>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={20}
              placeholder={"johndoe"}
              value={username}
              onChange={handleUsernameChange}
              className={`w-full border rounded p-2 ${
                usernameStatus === 'available' ? 'border-green-500'
                  : usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500'
                    : 'border'
              }`}
            />
          </div>
          {usernameStatus === 'available' && (
            <p className="text-sm text-green-600 mt-1">Username is available</p>
          )}
          {usernameStatus === 'checking' && (
            <p className="text-sm text-muted-foreground mt-1">Checking availability...</p>
          )}
          {(usernameStatus === 'taken' || usernameStatus === 'invalid') && usernameMessage && (
            <p className="text-sm text-red-600 mt-1">{usernameMessage}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground p-2 rounded"
        >
          Create Account
        </button>
      </form>
    </>
  )
}
