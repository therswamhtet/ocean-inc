import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateApiKey, hashApiKey, parseBearerToken, hasPermission, requirePermission } from '@/lib/api/auth'
import type { ApiKeyRecord } from '@/lib/api/types'

describe('API Auth', () => {
  describe('generateApiKey', () => {
    it('generates a key with correct format', () => {
      const { fullKey, prefix, hash } = generateApiKey()

      expect(fullKey).toContain('.')
      expect(prefix.length).toBe(8)
      expect(hash.length).toBe(64) // sha256 hex
      expect(fullKey.startsWith(prefix)).toBe(true)
    })

    it('generates unique keys', () => {
      const key1 = generateApiKey()
      const key2 = generateApiKey()

      expect(key1.fullKey).not.toBe(key2.fullKey)
      expect(key1.hash).not.toBe(key2.hash)
    })
  })

  describe('hashApiKey', () => {
    it('produces consistent hashes', () => {
      const key = 'test-key-123'
      expect(hashApiKey(key)).toBe(hashApiKey(key))
    })

    it('produces sha256 hex output', () => {
      const hash = hashApiKey('any-key')
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('parseBearerToken', () => {
    it('extracts token from Bearer header', () => {
      expect(parseBearerToken('Bearer my-token')).toBe('my-token')
    })

    it('is case insensitive for Bearer', () => {
      expect(parseBearerToken('bearer my-token')).toBe('my-token')
      expect(parseBearerToken('BEARER my-token')).toBe('my-token')
    })

    it('returns null for missing header', () => {
      expect(parseBearerToken(null)).toBeNull()
    })

    it('returns null for malformed header', () => {
      expect(parseBearerToken('Basic my-token')).toBeNull()
      expect(parseBearerToken('my-token')).toBeNull()
    })
  })

  describe('hasPermission', () => {
    const baseKey: ApiKeyRecord = {
      id: 'test-id',
      name: 'Test Key',
      key_hash: 'hash',
      key_prefix: 'prefix',
      permissions: ['read:clients', 'read:tasks'],
      is_active: true,
      last_used_at: null,
      request_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    it('returns true for granted permission', () => {
      expect(hasPermission(baseKey, 'read:clients')).toBe(true)
    })

    it('returns false for missing permission', () => {
      expect(hasPermission(baseKey, 'write:clients')).toBe(false)
    })

    it('admin permission grants everything', () => {
      const adminKey: ApiKeyRecord = { ...baseKey, permissions: ['admin'] }
      expect(hasPermission(adminKey, 'read:clients')).toBe(true)
      expect(hasPermission(adminKey, 'write:clients')).toBe(true)
      expect(hasPermission(adminKey, 'admin')).toBe(true)
    })
  })
})
