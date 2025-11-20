/**
 * Role-based Access Control (RBAC) utility functions
 *
 * User Roles:
 * - SUPER_ADMIN: Complete access to everything, can manage admin users
 * - SHOP_MANAGER: Can add/edit products, categories, and sections, view/manage all orders
 * - SALESMAN: Can add/edit products, view active orders only (no order status update)
 */

export type UserRole = 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN';

export interface Permission {
  // User Management
  canManageAdminUsers: boolean;

  // Product Management
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;

  // Category Management
  canAddCategories: boolean;
  canEditCategories: boolean;
  canDeleteCategories: boolean;

  // Section Management
  canAddSections: boolean;
  canEditSections: boolean;
  canDeleteSections: boolean;

  // Order Management
  canViewAllOrders: boolean;
  canViewActiveOrders: boolean;
  canUpdateOrderStatus: boolean;
  canViewCustomerInfo: boolean;

  // Customer Management
  canViewCustomers: boolean;
  canManageCustomers: boolean;
}

/**
 * Get permissions for a given role
 */
export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        // User Management
        canManageAdminUsers: true,

        // Product Management
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,

        // Category Management
        canAddCategories: true,
        canEditCategories: true,
        canDeleteCategories: true,

        // Section Management
        canAddSections: true,
        canEditSections: true,
        canDeleteSections: true,

        // Order Management
        canViewAllOrders: true,
        canViewActiveOrders: true,
        canUpdateOrderStatus: true,
        canViewCustomerInfo: true,

        // Customer Management
        canViewCustomers: true,
        canManageCustomers: true,
      };

    case 'SHOP_MANAGER':
      return {
        // User Management
        canManageAdminUsers: false,

        // Product Management
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,

        // Category Management
        canAddCategories: true,  // Can add categories
        canEditCategories: true,
        canDeleteCategories: false,

        // Section Management
        canAddSections: true,    // Can create and manage sections
        canEditSections: true,
        canDeleteSections: false,

        // Order Management
        canViewAllOrders: true,  // Can view all order history
        canViewActiveOrders: true,
        canUpdateOrderStatus: true,  // Can update order status
        canViewCustomerInfo: true,   // Can view full customer information

        // Customer Management
        canViewCustomers: true,
        canManageCustomers: false,
      };

    case 'SALESMAN':
      return {
        // User Management
        canManageAdminUsers: false,

        // Product Management
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: false,

        // Category Management
        canAddCategories: false,
        canEditCategories: false,
        canDeleteCategories: false,

        // Section Management
        canAddSections: false,
        canEditSections: false,
        canDeleteSections: false,

        // Order Management
        canViewAllOrders: false,     // Cannot view completed orders
        canViewActiveOrders: true,   // Can only view active/pending orders
        canUpdateOrderStatus: false, // Cannot update order status
        canViewCustomerInfo: false,  // Can only see order items, quantity, address (no personal info)

        // Customer Management
        canViewCustomers: false,
        canManageCustomers: false,
      };

    default:
      // No permissions by default
      return {
        canManageAdminUsers: false,
        canAddProducts: false,
        canEditProducts: false,
        canDeleteProducts: false,
        canAddCategories: false,
        canEditCategories: false,
        canDeleteCategories: false,
        canAddSections: false,
        canEditSections: false,
        canDeleteSections: false,
        canViewAllOrders: false,
        canViewActiveOrders: false,
        canUpdateOrderStatus: false,
        canViewCustomerInfo: false,
        canViewCustomers: false,
        canManageCustomers: false,
      };
  }
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  const permissions = getPermissions(role);
  return permissions[permission];
}

/**
 * Check if a role is super admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Check if a role is shop manager or higher
 */
export function isShopManagerOrHigher(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'SHOP_MANAGER';
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
    SUPER_ADMIN: 'Complete access to all features and settings. Can manage admin users.',
    SHOP_MANAGER: 'Can manage products, categories, sections, and orders. Can view all customer information.',
    SALESMAN: 'Can add/edit products and view active orders. Limited access to customer information.',
  };
  return descriptions[role] || '';
}
