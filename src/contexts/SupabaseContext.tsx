import { createContext, useContext, ReactNode } from 'react'
import type { TypedSupabaseClient } from '../lib/supabase'

interface SupabaseContextType {
  client: TypedSupabaseClient
}

const SupabaseContext = createContext<SupabaseContextType | null>(null)

export interface SupabaseProviderProps {
  children: ReactNode
  client: TypedSupabaseClient
}

/**
 * SupabaseProvider - Provides Supabase client to all hooks and components
 * 
 * This context allows hooks to access the Supabase client without
 * importing a global singleton. The client must be configured and
 * passed from the consuming application.
 * 
 * @example
 * ```tsx
 * import { createSupabaseClient, SupabaseProvider } from '@core-erp/entity'
 * 
 * const supabase = createSupabaseClient({
 *   url: process.env.VITE_SUPABASE_URL,
 *   anonKey: process.env.VITE_SUPABASE_ANON_KEY,
 * })
 * 
 * <SupabaseProvider client={supabase}>
 *   <App />
 * </SupabaseProvider>
 * ```
 */
export function SupabaseProvider({ children, client }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={{ client }}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * useSupabase - Access the Supabase client from context
 * 
 * Must be used within a SupabaseProvider.
 * 
 * @returns Typed Supabase client instance
 * @throws Error if used outside SupabaseProvider
 */
export function useSupabase(): TypedSupabaseClient {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context.client
}

