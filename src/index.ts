/**
 * @core-erp/entity
 * 
 * Core entity management, database types, and Supabase utilities
 * for Core ERP applications.
 */

// Types
export * from './types/database'
export * from './types/config'

// Supabase client utilities
export { createSupabaseClient, type TypedSupabaseClient } from './lib/supabase'

// Validation schemas
export * from './schemas'

// Permission utilities
export * from './lib/permissions'

// Constants
export * from './lib/constants'

// Auth retry utilities
export { withRetry, createRetryWrapper } from './lib/authRetry'

// Contexts
export * from './contexts'

// Hooks
export * from './hooks'

