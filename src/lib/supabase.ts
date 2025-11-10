import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import type { SupabaseConfig } from '../types/config'

/**
 * Creates a configured Supabase client.
 * 
 * This function is fully configurable and does NOT read environment variables.
 * All configuration must be provided by the consuming application.
 * 
 * @param config - Supabase configuration including URL and keys
 * @returns Typed Supabase client
 */
export function createSupabaseClient(config: SupabaseConfig): SupabaseClient<Database> {
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      ...config.options?.auth,
    },
  })
}

export type TypedSupabaseClient = SupabaseClient<Database>

