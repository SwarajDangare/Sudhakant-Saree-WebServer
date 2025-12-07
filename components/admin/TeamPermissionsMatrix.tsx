'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamPermissionsMatrixProps {
  initialUsers: User[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: {
    SUPER_ADMIN: boolean;
    SHOP_MANAGER: boolean;
    SALESMAN: boolean;
  };
}

const permissionsMatrix: Permission[] = [
  {
    id: 'view_dashboard',
    name: 'View Dashboard',
    description: 'Access to main dashboard and analytics',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: true },
  },
  {
    id: 'manage_products',
    name: 'Manage Products',
    description: 'Create, edit, and delete products',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: true },
  },
  {
    id: 'view_all_orders',
    name: 'View All Orders',
    description: 'Access to all orders including completed and cancelled',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: false },
  },
  {
    id: 'update_orders',
    name: 'Update Order Status',
    description: 'Change order status and send notifications',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: false },
  },
  {
    id: 'view_customers',
    name: 'View Customer Info',
    description: 'Access customer personal information',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: false },
  },
  {
    id: 'manage_categories',
    name: 'Manage Categories',
    description: 'Create and edit product categories',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: false },
  },
  {
    id: 'manage_sections',
    name: 'Manage Sections',
    description: 'Create and edit top-level sections',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: false },
  },
  {
    id: 'view_financials',
    name: 'View Financials',
    description: 'Access revenue and financial reports',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: true, SALESMAN: false },
  },
  {
    id: 'manage_users',
    name: 'Manage Admin Users',
    description: 'Create, edit, and delete admin users',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: false, SALESMAN: false },
  },
  {
    id: 'system_settings',
    name: 'System Settings',
    description: 'Access to system configuration',
    roles: { SUPER_ADMIN: true, SHOP_MANAGER: false, SALESMAN: false },
  },
];

export default function TeamPermissionsMatrix({ initialUsers }: TeamPermissionsMatrixProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const roleDisplayNames = {
    SUPER_ADMIN: 'Super Admin',
    SHOP_MANAGER: 'Shop Manager',
    SALESMAN: 'Salesman',
  };

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    SHOP_MANAGER: 'bg-blue-100 text-blue-700',
    SALESMAN: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <div className="soft-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage admin users and their access levels
            </p>
          </div>
          <button className="soft-btn-primary">
            + Add New User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.name || 'No Name'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`soft-pill text-xs ${roleColors[user.role as keyof typeof roleColors]}`}>
                  {roleDisplayNames[user.role as keyof typeof roleDisplayNames]}
                </span>
                <span className={`text-xs ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="soft-card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Role Permissions Matrix</h3>
          <p className="text-sm text-gray-500 mt-1">
            Overview of permissions for each role
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10">
                  Permission
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-purple-700">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">👑</span>
                    <span>Super Admin</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-700">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">🛍️</span>
                    <span>Shop Manager</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-green-700">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-1">💼</span>
                    <span>Salesman</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((permission, index) => (
                <tr
                  key={permission.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900">{permission.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{permission.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {permission.roles.SUPER_ADMIN ? (
                        <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {permission.roles.SHOP_MANAGER ? (
                        <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {permission.roles.SALESMAN ? (
                        <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="soft-card p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👑</span>
            <h4 className="text-lg font-bold text-gray-900">Super Admin</h4>
          </div>
          <p className="text-sm text-gray-600">
            Full system access. Can manage all products, orders, users, and system settings. Has unrestricted access to all features.
          </p>
        </div>

        <div className="soft-card p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🛍️</span>
            <h4 className="text-lg font-bold text-gray-900">Shop Manager</h4>
          </div>
          <p className="text-sm text-gray-600">
            Manages day-to-day operations. Can handle products, categories, orders, and customer information. Cannot manage admin users.
          </p>
        </div>

        <div className="soft-card p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💼</span>
            <h4 className="text-lg font-bold text-gray-900">Salesman</h4>
          </div>
          <p className="text-sm text-gray-600">
            Limited access focused on product management. Can add and edit products, and view active orders. Cannot access sensitive customer or financial data.
          </p>
        </div>
      </div>
    </div>
  );
}
