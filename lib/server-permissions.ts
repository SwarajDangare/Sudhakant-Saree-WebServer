import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, permissions, rolePermissions, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface ServerPermissions {
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

const PERMISSION_KEY_MAP: Record<string, keyof ServerPermissions> = {
  'view_dashboard': 'canAccessDashboard',
  'view_business_stats': 'canViewBusinessStats',
  'access_products_page': 'canAccessProductsPage',
  'create_products': 'canCreateProducts',
  'edit_products': 'canEditProducts',
  'delete_products': 'canDeleteProducts',
  'access_orders_page': 'canAccessOrdersPage',
  'view_order_details': 'canViewOrderDetails',
  'update_order_status': 'canUpdateOrderStatus',
  'delete_orders': 'canDeleteOrders',
  'access_categories_page': 'canAccessCategoriesPage',
  'create_categories': 'canCreateCategories',
  'edit_categories': 'canEditCategories',
  'delete_categories': 'canDeleteCategories',
  'access_sections_page': 'canAccessSectionsPage',
  'create_sections': 'canCreateSections',
  'edit_sections': 'canEditSections',
  'delete_sections': 'canDeleteSections',
  'access_customers_page': 'canAccessCustomersPage',
  'view_customer_details': 'canViewCustomerDetails',
  'edit_customers': 'canEditCustomers',
  'delete_customers': 'canDeleteCustomers',
  'access_team_page': 'canAccessTeamPage',
  'create_users': 'canCreateUsers',
  'edit_users': 'canEditUsers',
  'delete_users': 'canDeleteUsers',
  'manage_permissions': 'canManagePermissions',
};

/**
 * Get permissions for the current user from database
 * Use this in server components
 */
export async function getServerPermissions(): Promise<ServerPermissions> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.role) {
    redirect('/admin/login');
  }

  // Super admins get all permissions
  if (session.user.role === 'SUPER_ADMIN') {
    return {
      canAccessDashboard: true,
      canViewBusinessStats: true,
      canAccessProductsPage: true,
      canCreateProducts: true,
      canEditProducts: true,
      canDeleteProducts: true,
      canAccessOrdersPage: true,
      canViewOrderDetails: true,
      canUpdateOrderStatus: true,
      canDeleteOrders: true,
      canAccessCategoriesPage: true,
      canCreateCategories: true,
      canEditCategories: true,
      canDeleteCategories: true,
      canAccessSectionsPage: true,
      canCreateSections: true,
      canEditSections: true,
      canDeleteSections: true,
      canAccessCustomersPage: true,
      canViewCustomerDetails: true,
      canEditCustomers: true,
      canDeleteCustomers: true,
      canAccessTeamPage: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canManagePermissions: true,
    };
  }

  // Fetch role permissions from database
  const rolePerms = await db
    .select({
      key: permissions.key,
      enabled: rolePermissions.enabled,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(rolePermissions.role, session.user.role),
        eq(permissions.active, true)
      )
    );

  // Initialize all permissions as false
  const perms: ServerPermissions = {
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

  // Set enabled permissions
  rolePerms.forEach(rolePerm => {
    const permKey = PERMISSION_KEY_MAP[rolePerm.key];
    if (permKey && rolePerm.enabled) {
      perms[permKey] = true;
    }
  });

  return perms;
}

/**
 * Require a specific permission, redirect to dashboard if not allowed
 */
export async function requirePermission(permission: keyof ServerPermissions, redirectUrl = '/admin/dashboard') {
  const perms = await getServerPermissions();

  if (!perms[permission]) {
    redirect(redirectUrl);
  }

  return perms;
}
