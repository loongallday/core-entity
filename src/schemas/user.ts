import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
  locale: z.string().default('en'),
  timezone: z.string().default('Asia/Bangkok'),
  is_active: z.boolean().default(true),
})

export const createUserSchema = userSchema.extend({
  role_ids: z.array(z.string().uuid('Invalid role ID')).min(1, 'At least one role is required'),
})

export const updateUserSchema = userSchema.partial()

export const updateUserRolesSchema = z.object({
  role_ids: z.array(z.string().uuid('Invalid role ID')),
})

export type UserSchema = z.infer<typeof userSchema>
export type CreateUserSchema = z.infer<typeof createUserSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
export type UpdateUserRolesSchema = z.infer<typeof updateUserRolesSchema>

