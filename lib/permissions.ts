/**
 * Permission System - Database-Backed with Legacy Fallback
 *
 * This file provides both async (database-backed) and sync (legacy fallback) permission checking.
 * Use the async functions when possible for dynamic, runtime-configurable permissions.
 */

export {
  getPermissionsFromDB,
  hasPermissionDB,
  clearPermissionCache,
  isSuperAdmin,
  getRoleDisplayName,
  getRoleDescription,
  type UserRole,
  type PagePermissions,
} from './permissions-db';

// Export legacy sync functions for backward compatibility
export {
  getPermissions,
  hasPermission,
  isShopManagerOrHigher,
  type Permission,
} from './permissions-legacy';

// Re-export types for convenience
export type { PagePermissions as DynamicPermission } from './permissions-db';
export type { Permission as LegacyPermission } from './permissions-legacy';
