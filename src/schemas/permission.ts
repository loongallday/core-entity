import { z } from 'zod'

export const permissionSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .regex(/^[a-z_]+:[a-z_]+$/, 'Code must be in format "resource:action" (e.g., "users:create")'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
})

export type PermissionSchema = z.infer<typeof permissionSchema>

