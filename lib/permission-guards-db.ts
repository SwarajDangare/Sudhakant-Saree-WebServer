/**
 * Database-Backed Permission Guard Utilities
 *
 * Provides async permission checking functions that read from the database.
 * These replace the static permission guards with dynamic, runtime-configurable permissions.
 */

import { NextResponse } from 'next/server';
import { Session } from 'next-auth';
import {
  getPermissionsFromDB,
  hasPermissionDB,
  type UserRole,
  type PagePermissions,
} from './permissions-db';

/**
 * Error response for unauthorized access
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Please log in to access this resource.' },
    { status: 401 }
  );
}

/**
 * Error response for forbidden access
 */
export function forbiddenResponse(message?: string) {
  return NextResponse.json(
    { error: message || 'Forbidden. You do not have permission to access this resource.' },
    { status: 403 }
  );
}

/**
 * Check if session exists and user is authenticated
 */
export function isAuthenticated(session: Session | null): session is Session {
  return session !== null && !!session.user && !!session.user.role;
}

/**
 * Get user permissions from database
 * Returns null if user is not authenticated
 */
export async function getUserPermissions(
  session: Session | null
): Promise<PagePermissions | null> {
  if (!isAuthenticated(session)) {
    return null;
  }
  return await getPermissionsFromDB(
    session.user.role as UserRole,
    session.user.id
  );
}

/**
 * Check if user has a specific permission (async, database-backed)
 */
export async function checkPermission(
  session: Session | null,
  permissionKey: keyof PagePermissions
): Promise<boolean> {
  if (!isAuthenticated(session)) {
    return false;
  }
  return await hasPermissionDB(
    session.user.role as UserRole,
    permissionKey,
    session.user.id
  );
}

/**
 * Guard for API routes - checks authentication
 * Returns error response if not authenticated, null otherwise
 */
export function requireAuth(session: Session | null): NextResponse | null {
  if (!isAuthenticated(session)) {
    return unauthorizedResponse();
  }
  return null;
}

/**
 * Guard for API routes - checks specific permission (async)
 * Returns error response if permission denied, null otherwise
 */
export async function requirePermission(
  session: Session | null,
  permissionKey: keyof PagePermissions,
  customMessage?: string
): Promise<NextResponse | null> {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) {
    return authError;
  }

  // Check permission from database
  const hasPermission = await checkPermission(session, permissionKey);
  if (!hasPermission) {
    return forbiddenResponse(
      customMessage ||
        `You do not have permission to perform this action. Required permission: ${permissionKey}`
    );
  }

  return null;
}

/**
 * Guard for API routes - checks multiple permissions (user needs ALL of them)
 */
export async function requireAllPermissions(
  session: Session | null,
  permissionKeys: Array<keyof PagePermissions>,
  customMessage?: string
): Promise<NextResponse | null> {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) {
    return authError;
  }

  // Check all permissions from database
  const permissionChecks = await Promise.all(
    permissionKeys.map((key) => checkPermission(session, key))
  );

  const hasAllPermissions = permissionChecks.every((hasIt) => hasIt);

  if (!hasAllPermissions) {
    return forbiddenResponse(
      customMessage ||
        `You do not have permission to perform this action. Required permissions: ${permissionKeys.join(
          ', '
        )}`
    );
  }

  return null;
}

/**
 * Guard for API routes - checks if user has ANY of the specified permissions
 */
export async function requireAnyPermission(
  session: Session | null,
  permissionKeys: Array<keyof PagePermissions>,
  customMessage?: string
): Promise<NextResponse | null> {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) {
    return authError;
  }

  // Check if user has at least one permission
  const permissionChecks = await Promise.all(
    permissionKeys.map((key) => checkPermission(session, key))
  );

  const hasAnyPermission = permissionChecks.some((hasIt) => hasIt);

  if (!hasAnyPermission) {
    return forbiddenResponse(
      customMessage ||
        `You do not have permission to perform this action. Required one of: ${permissionKeys.join(
          ', '
        )}`
    );
  }

  return null;
}

/**
 * Type guard for checking if session user has specific role
 */
export function hasRole(session: Session | null, role: UserRole): boolean {
  if (!isAuthenticated(session)) {
    return false;
  }
  return session.user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  session: Session | null,
  roles: UserRole[]
): boolean {
  if (!isAuthenticated(session)) {
    return false;
  }
  return roles.includes(session.user.role as UserRole);
}

/**
 * Utility to get error message from permission check failure
 */
export function getPermissionErrorMessage(
  permissionKey: keyof PagePermissions
): string {
  const messages: Partial<Record<keyof PagePermissions, string>> = {
    // Dashboard
    canAccessDashboard: 'You do not have permission to access the dashboard.',
    canViewBusinessStats:
      'You do not have permission to view business statistics.',

    // Products
    canAccessProductsPage:
      'You do not have permission to access the products page.',
    canCreateProducts: 'You do not have permission to create products.',
    canEditProducts: 'You do not have permission to edit products.',
    canDeleteProducts: 'You do not have permission to delete products.',

    // Orders
    canAccessOrdersPage: 'You do not have permission to access the orders page.',
    canViewOrderDetails: 'You do not have permission to view order details.',
    canUpdateOrderStatus: 'You do not have permission to update order status.',
    canDeleteOrders: 'You do not have permission to delete orders.',

    // Categories
    canAccessCategoriesPage:
      'You do not have permission to access the categories page.',
    canCreateCategories: 'You do not have permission to create categories.',
    canEditCategories: 'You do not have permission to edit categories.',
    canDeleteCategories: 'You do not have permission to delete categories.',

    // Sections
    canAccessSectionsPage:
      'You do not have permission to access the sections page.',
    canCreateSections: 'You do not have permission to create sections.',
    canEditSections: 'You do not have permission to edit sections.',
    canDeleteSections: 'You do not have permission to delete sections.',

    // Customers
    canAccessCustomersPage:
      'You do not have permission to access the customers page.',
    canViewCustomerDetails:
      'You do not have permission to view customer details.',
    canEditCustomers: 'You do not have permission to edit customers.',
    canDeleteCustomers: 'You do not have permission to delete customers.',

    // Team
    canAccessTeamPage:
      'Only Super Admins can access the team management page.',
    canCreateUsers: 'Only Super Admins can create admin users.',
    canEditUsers: 'Only Super Admins can edit admin users.',
    canDeleteUsers: 'Only Super Admins can delete admin users.',
    canManagePermissions: 'Only Super Admins can manage permissions.',
  };

  return (
    messages[permissionKey] ||
    `You do not have the required permission: ${permissionKey}`
  );
}
