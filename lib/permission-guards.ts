/**
 * Permission Guard Utilities
 *
 * Provides reusable functions for checking permissions in API routes and pages.
 * These guards use the role-based permission system defined in lib/permissions.ts
 */

import { NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { getPermissions, hasPermission, type UserRole, type Permission } from './permissions';

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
 * Get user permissions from session
 * Returns null if user is not authenticated
 */
export function getUserPermissions(session: Session | null): Permission | null {
  if (!isAuthenticated(session)) {
    return null;
  }
  return getPermissions(session.user.role as UserRole);
}

/**
 * Check if user has a specific permission
 */
export function checkPermission(
  session: Session | null,
  permissionKey: keyof Permission
): boolean {
  if (!isAuthenticated(session)) {
    return false;
  }
  return hasPermission(session.user.role as UserRole, permissionKey);
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
 * Guard for API routes - checks specific permission
 * Returns error response if permission denied, null otherwise
 */
export function requirePermission(
  session: Session | null,
  permissionKey: keyof Permission,
  customMessage?: string
): NextResponse | null {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) {
    return authError;
  }

  // Check permission
  if (!checkPermission(session, permissionKey)) {
    return forbiddenResponse(
      customMessage || `You do not have permission to perform this action. Required permission: ${permissionKey}`
    );
  }

  return null;
}

/**
 * Guard for API routes - checks multiple permissions (user needs ALL of them)
 */
export function requireAllPermissions(
  session: Session | null,
  permissionKeys: Array<keyof Permission>,
  customMessage?: string
): NextResponse | null {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) {
    return authError;
  }

  // Check all permissions
  const hasAllPermissions = permissionKeys.every((key) =>
    checkPermission(session, key)
  );

  if (!hasAllPermissions) {
    return forbiddenResponse(
      customMessage || `You do not have permission to perform this action. Required permissions: ${permissionKeys.join(', ')}`
    );
  }

  return null;
}

/**
 * Guard for API routes - checks if user has ANY of the specified permissions
 */
export function requireAnyPermission(
  session: Session | null,
  permissionKeys: Array<keyof Permission>,
  customMessage?: string
): NextResponse | null {
  // First check authentication
  const authError = requireAuth(session);
  if (authError) {
    return authError;
  }

  // Check if user has at least one permission
  const hasAnyPermission = permissionKeys.some((key) =>
    checkPermission(session, key)
  );

  if (!hasAnyPermission) {
    return forbiddenResponse(
      customMessage || `You do not have permission to perform this action. Required one of: ${permissionKeys.join(', ')}`
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
export function hasAnyRole(session: Session | null, roles: UserRole[]): boolean {
  if (!isAuthenticated(session)) {
    return false;
  }
  return roles.includes(session.user.role as UserRole);
}

/**
 * Server-side page guard - checks authentication
 * Throws redirect if not authenticated (for use in Server Components)
 */
export function assertAuthenticated(
  session: Session | null
): asserts session is Session {
  if (!isAuthenticated(session)) {
    throw new Error('REDIRECT:/admin/login');
  }
}

/**
 * Server-side page guard - checks specific permission
 * Throws redirect if permission denied (for use in Server Components)
 */
export function assertPermission(
  session: Session | null,
  permissionKey: keyof Permission,
  redirectTo: string = '/admin/dashboard'
): asserts session is Session {
  assertAuthenticated(session);

  if (!checkPermission(session, permissionKey)) {
    throw new Error(`REDIRECT:${redirectTo}`);
  }
}

/**
 * Server-side page guard - checks if user has ANY of the specified permissions
 */
export function assertAnyPermission(
  session: Session | null,
  permissionKeys: Array<keyof Permission>,
  redirectTo: string = '/admin/dashboard'
): asserts session is Session {
  assertAuthenticated(session);

  const hasAnyPerm = permissionKeys.some((key) =>
    checkPermission(session, key)
  );

  if (!hasAnyPerm) {
    throw new Error(`REDIRECT:${redirectTo}`);
  }
}

/**
 * Utility to get error message from permission check failure
 */
export function getPermissionErrorMessage(permissionKey: keyof Permission): string {
  const messages: Partial<Record<keyof Permission, string>> = {
    canManageAdminUsers: 'Only Super Admins can manage admin users.',
    canAddProducts: 'You do not have permission to add products.',
    canEditProducts: 'You do not have permission to edit products.',
    canDeleteProducts: 'You do not have permission to delete products.',
    canAddCategories: 'You do not have permission to add categories.',
    canEditCategories: 'You do not have permission to edit categories.',
    canDeleteCategories: 'You do not have permission to delete categories.',
    canAddSections: 'You do not have permission to add sections.',
    canEditSections: 'You do not have permission to edit sections.',
    canDeleteSections: 'You do not have permission to delete sections.',
    canViewAllOrders: 'You do not have permission to view all orders.',
    canViewActiveOrders: 'You do not have permission to view orders.',
    canUpdateOrderStatus: 'You do not have permission to update order status.',
    canViewCustomerInfo: 'You do not have permission to view customer information.',
    canViewCustomers: 'You do not have permission to view customers.',
    canManageCustomers: 'You do not have permission to manage customers.',
  };

  return messages[permissionKey] || `You do not have the required permission: ${permissionKey}`;
}
