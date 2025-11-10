// Configuration types for core-entity

export interface SupabaseConfig {
  url: string
  anonKey: string
  options?: {
    auth?: {
      persistSession?: boolean
      autoRefreshToken?: boolean
      detectSessionInUrl?: boolean
      flowType?: 'pkce' | 'implicit'
    }
  }
}

