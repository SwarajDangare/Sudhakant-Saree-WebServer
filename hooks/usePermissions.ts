import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserPermissions {
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

// Permission key mapping (database keys -> interface properties)
const PERMISSION_KEY_MAP: Record<string, keyof UserPermissions> = {
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

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (status === 'loading') return;

      if (!session?.user?.role) {
        setPermissions(null);
        setIsLoading(false);
        return;
      }

      // Super admins get all permissions
      if (session.user.role === 'SUPER_ADMIN') {
        setPermissions({
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
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/permissions/user/${session.user.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }

        const data = await response.json();

        // Convert permission keys to UserPermissions interface
        const perms: UserPermissions = {
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

        if (data.permissions) {
          data.permissions.forEach((perm: { key: string; enabled: boolean }) => {
            const permKey = PERMISSION_KEY_MAP[perm.key];
            if (permKey) {
              perms[permKey] = perm.enabled;
            }
          });
        }

        setPermissions(perms);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Default to no permissions on error
        setPermissions({
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
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPermissions();
  }, [session, status]);

  return { permissions, isLoading };
}
