'use client'

import { useState } from 'react'
import { Copy, Key, Plus, Trash2, EyeOff, AlertCircle, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApiKeyRecord, ApiPermission } from '@/lib/api/types'
import { ALL_PERMISSIONS } from '@/lib/api/types'
import { createApiKeyAction, revokeApiKeyAction, deleteApiKeyAction } from './actions'

function PermissionBadge({ permission }: { permission: ApiPermission }) {
  const colorMap: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    'read:clients': 'bg-blue-100 text-blue-800 border-blue-200',
    'write:clients': 'bg-blue-100 text-blue-800 border-blue-200',
    'read:projects': 'bg-green-100 text-green-800 border-green-200',
    'write:projects': 'bg-green-100 text-green-800 border-green-200',
    'read:tasks': 'bg-purple-100 text-purple-800 border-purple-200',
    'write:tasks': 'bg-purple-100 text-purple-800 border-purple-200',
    'read:team_members': 'bg-orange-100 text-orange-800 border-orange-200',
    'read:comments': 'bg-pink-100 text-pink-800 border-pink-200',
    'write:comments': 'bg-pink-100 text-pink-800 border-pink-200',
    'read:portal': 'bg-teal-100 text-teal-800 border-teal-200',
  }

  return (
    <Badge variant="outline" className={cn('text-xs font-medium', colorMap[permission] ?? 'bg-gray-100 text-gray-800')}>
      {permission}
    </Badge>
  )
}

export function ApiKeysContent({ initialKeys }: { initialKeys: ApiKeyRecord[] }) {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(initialKeys)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<ApiPermission[]>(['read:clients', 'read:projects', 'read:tasks'])
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateKey() {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return

    setIsSubmitting(true)
    const result = await createApiKeyAction(newKeyName.trim(), selectedPermissions)
    setIsSubmitting(false)

    if (result.success) {
      setNewKeyValue(result.key)
      setNewKeyName('')
      setSelectedPermissions(['read:clients', 'read:projects', 'read:tasks'])
      // Refresh keys list
      window.location.reload()
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm('Are you sure you want to revoke this API key? It will no longer work.')) return
    const result = await revokeApiKeyAction(keyId)
    if (result.success) {
      setKeys(keys.map(k => k.id === keyId ? { ...k, is_active: false } : k))
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm('Are you sure you want to permanently delete this API key?')) return
    const result = await deleteApiKeyAction(keyId)
    if (result.success) {
      setKeys(keys.filter(k => k.id !== keyId))
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  function togglePermission(permission: ApiPermission) {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API keys for third-party integrations
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {newKeyValue ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertCircle className="inline h-4 w-4 mr-1 -mt-0.5" />
                    Copy this key now. You won&apos;t be able to see it again.
                  </div>
                  <div className="flex gap-2">
                    <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono break-all">
                      {newKeyValue}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyKey(newKeyValue)}
                    >
                      {copiedKey ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => { setNewKeyValue(null); setIsCreating(false) }} className="w-full">
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Zapier Integration"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_PERMISSIONS.map((permission) => (
                        <button
                          key={permission}
                          onClick={() => togglePermission(permission)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition',
                            selectedPermissions.includes(permission)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {permission}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateKey}
                    disabled={!newKeyName.trim() || selectedPermissions.length === 0 || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Key'}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Key className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-base font-medium text-foreground">No API keys yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an API key to allow third-party access to your data.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Key</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permissions</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usage</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Used</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map((key) => (
                <tr key={key.id} className={cn(!key.is_active && 'opacity-50')}>
                  <td className="px-4 py-3 font-medium text-foreground">{key.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {key.key_prefix}••••••••
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.slice(0, 3).map((p) => (
                        <PermissionBadge key={p} permission={p} />
                      ))}
                      {key.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{key.permissions.length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      key.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    )}>
                      {key.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{key.request_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {key.last_used_at
                      ? formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {key.is_active && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRevokeKey(key.id)}
                          title="Revoke"
                        >
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteKey(key.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
