import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * useAuth - Access authentication context
 * 
 * Must be used within an AuthProvider.
 * 
 * @returns Authentication context with user, session, permissions, and auth functions
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

