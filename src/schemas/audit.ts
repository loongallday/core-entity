import { z } from 'zod'

export const auditLogSchema = z.object({
  user_id: z.string().uuid('Invalid user ID').optional().nullable(),
  action: z.string().min(1, 'Action is required'),
  resource_type: z.string().optional().nullable(),
  resource_id: z.string().optional().nullable(),
  changes: z.any().optional().nullable(),
  ip_address: z.string().ip().optional().nullable(),
  user_agent: z.string().optional().nullable(),
})

export type AuditLogSchema = z.infer<typeof auditLogSchema>

