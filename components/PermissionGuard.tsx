'use client';

/**
 * Permission Guard Component
 *
 * Client-side component for conditionally rendering UI elements based on user permissions.
 * This component should be used with the session data passed from server components.
 */

import { ReactNode } from 'react';
import { getPermissions, hasPermission, type UserRole, type Permission } from '@/lib/permissions';

interface PermissionGuardProps {
  /**
   * User role from session
   */
  userRole: UserRole;

  /**
   * Single permission key to check
   */
  permission?: keyof Permission;

  /**
   * Multiple permissions - user needs ALL of them (AND logic)
   */
  requireAll?: Array<keyof Permission>;

  /**
   * Multiple permissions - user needs ANY of them (OR logic)
   */
  requireAny?: Array<keyof Permission>;

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Optional fallback content to render if user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * Permission Guard Component
 *
 * @example
 * // Check single permission
 * <PermissionGuard userRole={session.user.role} permission="canAddProducts">
 *   <button>Add Product</button>
 * </PermissionGuard>
 *
 * @example
 * // Check multiple permissions (user needs ALL)
 * <PermissionGuard userRole={session.user.role} requireAll={['canEditProducts', 'canDeleteProducts']}>
 *   <button>Manage Products</button>
 * </PermissionGuard>
 *
 * @example
 * // Check multiple permissions (user needs ANY)
 * <PermissionGuard userRole={session.user.role} requireAny={['canViewAllOrders', 'canViewActiveOrders']}>
 *   <OrdersList />
 * </PermissionGuard>
 *
 * @example
 * // With fallback content
 * <PermissionGuard
 *   userRole={session.user.role}
 *   permission="canManageAdminUsers"
 *   fallback={<p>You don't have access to this feature.</p>}
 * >
 *   <UserManagementPanel />
 * </PermissionGuard>
 */
export default function PermissionGuard({
  userRole,
  permission,
  requireAll,
  requireAny,
  children,
  fallback = null,
}: PermissionGuardProps) {
  let hasAccess = false;

  // Single permission check
  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  }
  // Check all permissions (AND logic)
  else if (requireAll && requireAll.length > 0) {
    hasAccess = requireAll.every((perm) => hasPermission(userRole, perm));
  }
  // Check any permission (OR logic)
  else if (requireAny && requireAny.length > 0) {
    hasAccess = requireAny.some((perm) => hasPermission(userRole, perm));
  }
  // If no permission specified, default to no access
  else {
    console.warn('PermissionGuard: No permission criteria specified');
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook to get user permissions object
 * Use this in client components to check permissions programmatically
 *
 * @example
 * function MyComponent({ userRole }: { userRole: UserRole }) {
 *   const permissions = usePermissions(userRole);
 *
 *   return (
 *     <div>
 *       {permissions.canAddProducts && <button>Add</button>}
 *       {permissions.canEditProducts && <button>Edit</button>}
 *       {permissions.canDeleteProducts && <button>Delete</button>}
 *     </div>
 *   );
 * }
 */
export function usePermissions(userRole: UserRole): Permission {
  return getPermissions(userRole);
}

/**
 * Hook to check a specific permission
 * Convenience hook for checking a single permission
 *
 * @example
 * function MyComponent({ userRole }: { userRole: UserRole }) {
 *   const canDelete = useHasPermission(userRole, 'canDeleteProducts');
 *
 *   return (
 *     <div>
 *       {canDelete && <button onClick={handleDelete}>Delete</button>}
 *     </div>
 *   );
 * }
 */
export function useHasPermission(
  userRole: UserRole,
  permission: keyof Permission
): boolean {
  return hasPermission(userRole, permission);
}
