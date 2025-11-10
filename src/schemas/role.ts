import { z } from 'zod'

export const roleSchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code must be at most 50 characters')
    .regex(/^[a-z0-9_-]+$/, 'Code must contain only lowercase letters, numbers, hyphens, and underscores'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  level: z
    .number()
    .int('Level must be an integer')
    .min(0, 'Level must be at least 0')
    .max(100, 'Level must be at most 100')
    .default(10),
  is_active: z.boolean().default(true),
})

export const createRoleSchema = roleSchema.extend({
  permission_ids: z.array(z.string().uuid('Invalid permission ID')).optional().default([]),
})

export const updateRoleSchema = roleSchema.partial()

export const updateRolePermissionsSchema = z.object({
  permission_ids: z.array(z.string().uuid('Invalid permission ID')),
})

export type RoleSchema = z.infer<typeof roleSchema>
export type CreateRoleSchema = z.infer<typeof createRoleSchema>
export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>
export type UpdateRolePermissionsSchema = z.infer<typeof updateRolePermissionsSchema>

