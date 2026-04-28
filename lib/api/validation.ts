import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createClientSchema = z.object({
  name: z.string().min(2).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  description: z.string().max(500).optional(),
})

export const updateClientSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
})

export const createProjectSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(['active', 'archived']).optional(),
})

export const createTaskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  briefing: z.string().max(5000).optional(),
  caption: z.string().max(2000).optional(),
  posting_date: z.string().date().optional().nullable(),
  posting_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).optional().nullable(),
  due_date: z.string().date().optional().nullable(),
  deadline: z.string().date().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  briefing: z.string().max(5000).optional().nullable(),
  caption: z.string().max(2000).optional().nullable(),
  posting_date: z.string().date().optional().nullable(),
  posting_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).optional().nullable(),
  due_date: z.string().date().optional().nullable(),
  deadline: z.string().date().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  is_revision: z.boolean().default(false),
})
