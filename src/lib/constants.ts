/**
 * Constants for entity management
 */

// Auth retry configuration
export const MAX_AUTH_RETRIES = 3
export const AUTH_RETRY_BASE_DELAY_MS = 1000

// Session management
export const RETURN_URL_KEY = 'auth_return_url'
export const AUTH_SYNC_CHANNEL = 'core_erp_auth_sync'

// Session expiry warnings (in milliseconds)
export const SESSION_WARNING_THRESHOLDS = [
  5 * 60 * 1000, // 5 minutes
  15 * 60 * 1000, // 15 minutes
  30 * 60 * 1000, // 30 minutes
]

