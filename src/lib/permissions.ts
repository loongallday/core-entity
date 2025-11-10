/**
 * Permission checking utilities
 * 
 * These are pure functions that operate on permission arrays.
 * They can be used in both React components and server-side code.
 */

/**
 * Check if user has a specific permission
 * @param userPermissions - Array of permission codes the user has
 * @param requiredPermission - The required permission code
 * @returns true if user has the permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission)
}

/**
 * Check if user has ANY of the specified permissions
 * @param userPermissions - Array of permission codes the user has
 * @param requiredPermissions - Array of required permission codes (need ANY one)
 * @returns true if user has at least one of the required permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  )
}

/**
 * Check if user has ALL of the specified permissions
 * @param userPermissions - Array of permission codes the user has
 * @param requiredPermissions - Array of required permission codes (need ALL)
 * @returns true if user has all of the required permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  )
}

/**
 * Check if user has permission for a resource action pattern
 * Supports wildcards: "users:*" matches "users:create", "users:edit", etc.
 * @param userPermissions - Array of permission codes the user has
 * @param pattern - Permission pattern (e.g., "users:*" or "users:create")
 * @returns true if user has matching permission
 */
export function hasPermissionPattern(
  userPermissions: string[],
  pattern: string
): boolean {
  if (pattern.includes('*')) {
    // Convert pattern to regex
    const regexPattern = pattern.replace(/\*/g, '.*')
    const regex = new RegExp(`^${regexPattern}$`)
    return userPermissions.some((permission) => regex.test(permission))
  }
  return userPermissions.includes(pattern)
}

/**
 * Check if user has permission based on role level
 * Higher level = more authority
 * @param userLevel - User's highest role level
 * @param requiredLevel - Required role level
 * @returns true if user's level is >= required level
 */
export function hasRoleLevel(
  userLevel: number,
  requiredLevel: number
): boolean {
  return userLevel >= requiredLevel
}

/**
 * Get all permissions that match a category
 * @param userPermissions - Array of permission codes the user has
 * @param category - Category prefix (e.g., "users" will match "users:create", "users:edit")
 * @returns Array of matching permission codes
 */
export function getPermissionsByCategory(
  userPermissions: string[],
  category: string
): string[] {
  return userPermissions.filter((permission) =>
    permission.startsWith(`${category}:`)
  )
}

/**
 * Parse permission code into resource and action
 * @param permissionCode - Permission code (e.g., "users:create")
 * @returns Object with resource and action, or null if invalid format
 */
export function parsePermission(
  permissionCode: string
): { resource: string; action: string } | null {
  const parts = permissionCode.split(':')
  if (parts.length !== 2) return null
  return {
    resource: parts[0],
    action: parts[1],
  }
}

