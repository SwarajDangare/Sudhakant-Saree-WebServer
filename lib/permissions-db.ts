/**
 * Database-Backed Dynamic Permission System
 *
 * This system reads permissions from the database, allowing runtime configuration
 * through the admin UI. Permissions are hierarchical: page access controls CRUD operations.
 */

import { db, permissions, rolePermissions, userPermissions } from '@/db';
import { eq, and } from 'drizzle-orm';

// Cache for permissions to avoid excessive database queries
const permissionCache = new Map<string, Map<string, boolean>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let lastCacheTime = 0;

export type UserRole = 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN';

/**
 * Page-level permissions that control access to entire admin pages
 */
export interface PagePermissions {
  // Dashboard
  canAccessDashboard: boolean;
  canViewBusinessStats: boolean;

  // Products
  canAccessProductsPage: boolean;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;

  // Orders
  canAccessOrdersPage: boolean;
  canViewOrderDetails: boolean;
  canUpdateOrderStatus: boolean;
  canDeleteOrders: boolean;

  // Categories
  canAccessCategoriesPage: boolean;
  canCreateCategories: boolean;
  canEditCategories: boolean;
  canDeleteCategories: boolean;

  // Sections
  canAccessSectionsPage: boolean;
  canCreateSections: boolean;
  canEditSections: boolean;
  canDeleteSections: boolean;

  // Customers
  canAccessCustomersPage: boolean;
  canViewCustomerDetails: boolean;
  canEditCustomers: boolean;
  canDeleteCustomers: boolean;

  // Team Management
  canAccessTeamPage: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canManagePermissions: boolean;
}

/**
 * Permission key mapping (database keys -> interface properties)
 */
const PERMISSION_KEY_MAP: Record<string, keyof PagePermissions> = {
  // Dashboard
  'view_dashboard': 'canAccessDashboard',
  'view_business_stats': 'canViewBusinessStats',

  // Products
  'access_products_page': 'canAccessProductsPage',
  'create_products': 'canCreateProducts',
  'edit_products': 'canEditProducts',
  'delete_products': 'canDeleteProducts',

  // Orders
  'access_orders_page': 'canAccessOrdersPage',
  'view_order_details': 'canViewOrderDetails',
  'update_order_status': 'canUpdateOrderStatus',
  'delete_orders': 'canDeleteOrders',

  // Categories
  'access_categories_page': 'canAccessCategoriesPage',
  'create_categories': 'canCreateCategories',
  'edit_categories': 'canEditCategories',
  'delete_categories': 'canDeleteCategories',

  // Sections
  'access_sections_page': 'canAccessSectionsPage',
  'create_sections': 'canCreateSections',
  'edit_sections': 'canEditSections',
  'delete_sections': 'canDeleteSections',

  // Customers
  'access_customers_page': 'canAccessCustomersPage',
  'view_customer_details': 'canViewCustomerDetails',
  'edit_customers': 'canEditCustomers',
  'delete_customers': 'canDeleteCustomers',

  // Team
  'access_team_page': 'canAccessTeamPage',
  'create_users': 'canCreateUsers',
  'edit_users': 'canEditUsers',
  'delete_users': 'canDeleteUsers',
  'manage_permissions': 'canManagePermissions',
};

/**
 * Hierarchical permission rules
 * If page access is false, all sub-permissions are automatically false
 */
const PERMISSION_HIERARCHY: Record<string, string[]> = {
  'canAccessProductsPage': ['canCreateProducts', 'canEditProducts', 'canDeleteProducts'],
  'canAccessOrdersPage': ['canViewOrderDetails', 'canUpdateOrderStatus', 'canDeleteOrders'],
  'canAccessCategoriesPage': ['canCreateCategories', 'canEditCategories', 'canDeleteCategories'],
  'canAccessSectionsPage': ['canCreateSections', 'canEditSections', 'canDeleteSections'],
  'canAccessCustomersPage': ['canViewCustomerDetails', 'canEditCustomers', 'canDeleteCustomers'],
  'canAccessTeamPage': ['canCreateUsers', 'canEditUsers', 'canDeleteUsers', 'canManagePermissions'],
};

/**
 * Fetch permissions from database for a specific role
 */
async function fetchRolePermissionsFromDB(role: UserRole): Promise<Map<string, boolean>> {
  const permMap = new Map<string, boolean>();

  // Fetch all active permissions
  const allPermissions = await db
    .select()
    .from(permissions)
    .where(eq(permissions.active, true));

  // Fetch role-specific permissions
  const rolePerms = await db
    .select({
      permissionKey: permissions.key,
      enabled: rolePermissions.enabled,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(rolePermissions.role, role),
        eq(permissions.active, true)
      )
    );

  // Initialize all permissions as false
  for (const perm of allPermissions) {
    permMap.set(perm.key, false);
  }

  // Set enabled permissions to true
  for (const rolePerm of rolePerms) {
    if (rolePerm.enabled) {
      permMap.set(rolePerm.permissionKey, true);
    }
  }

  return permMap;
}

/**
 * Fetch user-specific permission overrides from database
 */
async function fetchUserPermissionOverrides(userId: string): Promise<Map<string, boolean>> {
  const permMap = new Map<string, boolean>();

  const userPerms = await db
    .select({
      permissionKey: permissions.key,
      enabled: userPermissions.enabled,
    })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(
      and(
        eq(userPermissions.userId, userId),
        eq(permissions.active, true)
      )
    );

  for (const userPerm of userPerms) {
    permMap.set(userPerm.permissionKey, userPerm.enabled);
  }

  return permMap;
}

/**
 * Clear permission cache (call this when permissions are updated)
 */
export function clearPermissionCache() {
  permissionCache.clear();
  lastCacheTime = 0;
}

/**
 * Apply hierarchical rules to permissions
 * If page access is denied, all sub-permissions are automatically denied
 */
function applyHierarchicalRules(perms: PagePermissions): PagePermissions {
  const result = { ...perms };

  for (const [pagePermission, subPermissions] of Object.entries(PERMISSION_HIERARCHY)) {
    const hasPageAccess = result[pagePermission as keyof PagePermissions];

    if (!hasPageAccess) {
      // If no page access, disable all sub-permissions
      for (const subPerm of subPermissions) {
        (result as any)[subPerm] = false;
      }
    }
  }

  return result;
}

/**
 * Get permissions for a role from database with caching
 */
export async function getPermissionsFromDB(
  role: UserRole,
  userId?: string
): Promise<PagePermissions> {
  // Check cache freshness
  const now = Date.now();
  if (now - lastCacheTime > CACHE_TTL) {
    permissionCache.clear();
    lastCacheTime = now;
  }

  // Check cache
  const cacheKey = userId ? `${role}:${userId}` : role;
  if (permissionCache.has(cacheKey)) {
    const cachedPerms = permissionCache.get(cacheKey)!;
    return convertToPermissionObject(cachedPerms);
  }

  try {
    // Fetch role permissions from database
    const rolePermMap = await fetchRolePermissionsFromDB(role);

    // Fetch user-specific overrides if userId provided
    if (userId) {
      const userOverrides = await fetchUserPermissionOverrides(userId);
      // Apply user overrides (they take precedence)
      for (const [key, value] of userOverrides) {
        rolePermMap.set(key, value);
      }
    }

    // Cache the result
    permissionCache.set(cacheKey, rolePermMap);

    return convertToPermissionObject(rolePermMap);
  } catch (error) {
    console.error('Error fetching permissions from database:', error);
    // Fallback to no permissions on error
    return createEmptyPermissions();
  }
}

/**
 * Convert database permission map to typed permission object
 */
function convertToPermissionObject(permMap: Map<string, boolean>): PagePermissions {
  const perms: any = {};

  // Map all database keys to interface properties
  for (const [dbKey, interfaceKey] of Object.entries(PERMISSION_KEY_MAP)) {
    perms[interfaceKey] = permMap.get(dbKey) || false;
  }

  // Apply hierarchical rules
  return applyHierarchicalRules(perms as PagePermissions);
}

/**
 * Create empty permissions object (all false)
 */
function createEmptyPermissions(): PagePermissions {
  return {
    canAccessDashboard: false,
    canViewBusinessStats: false,
    canAccessProductsPage: false,
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canAccessOrdersPage: false,
    canViewOrderDetails: false,
    canUpdateOrderStatus: false,
    canDeleteOrders: false,
    canAccessCategoriesPage: false,
    canCreateCategories: false,
    canEditCategories: false,
    canDeleteCategories: false,
    canAccessSectionsPage: false,
    canCreateSections: false,
    canEditSections: false,
    canDeleteSections: false,
    canAccessCustomersPage: false,
    canViewCustomerDetails: false,
    canEditCustomers: false,
    canDeleteCustomers: false,
    canAccessTeamPage: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canManagePermissions: false,
  };
}

/**
 * Check if a role has a specific permission (database-backed)
 */
export async function hasPermissionDB(
  role: UserRole,
  permission: keyof PagePermissions,
  userId?: string
): Promise<boolean> {
  const permissions = await getPermissionsFromDB(role, userId);
  return permissions[permission];
}

/**
 * Check if a role is super admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    SHOP_MANAGER: 'Shop Manager',
    SALESMAN: 'Salesman',
  };
  return displayNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    SUPER_ADMIN: 'Complete access to all features and settings. Can manage admin users and permissions.',
    SHOP_MANAGER: 'Can manage products, orders, and customers. Cannot manage admin users or system settings.',
    SALESMAN: 'Limited access to products and viewing orders. Cannot manage categories, customers, or admin users.',
  };
  return descriptions[role] || '';
}

// For backward compatibility, export the sync version that uses old hardcoded permissions
// This is used as a fallback when database is not available
export { getPermissions, hasPermission, type Permission } from './permissions-legacy';
