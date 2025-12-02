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

interface TeamPermissionsMatrixInteractiveProps {
  initialUsers: User[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

const permissions: Permission[] = [
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard and analytics' },
  { id: 'manage_products', name: 'Manage Products', description: 'Create, edit, and delete products' },
  { id: 'view_all_orders', name: 'View All Orders', description: 'Access to all orders including completed and cancelled' },
  { id: 'update_orders', name: 'Update Order Status', description: 'Change order status and send notifications' },
  { id: 'view_customers', name: 'View Customer Info', description: 'Access customer personal information' },
  { id: 'manage_categories', name: 'Manage Categories', description: 'Create and edit product categories' },
  { id: 'manage_sections', name: 'Manage Sections', description: 'Create and edit top-level sections' },
  { id: 'view_financials', name: 'View Financials', description: 'Access revenue and financial reports' },
  { id: 'manage_users', name: 'Manage Admin Users', description: 'Create, edit, and delete admin users' },
  { id: 'system_settings', name: 'System Settings', description: 'Access to system configuration' },
];

// Default permissions for each role
const defaultRolePermissions: Record<string, Record<string, boolean>> = {
  'SUPER_ADMIN': {
    'view_dashboard': true,
    'manage_products': true,
    'view_all_orders': true,
    'update_orders': true,
    'view_customers': true,
    'manage_categories': true,
    'manage_sections': true,
    'view_financials': true,
    'manage_users': true,
    'system_settings': true,
  },
  'SHOP_MANAGER': {
    'view_dashboard': true,
    'manage_products': true,
    'view_all_orders': true,
    'update_orders': true,
    'view_customers': true,
    'manage_categories': true,
    'manage_sections': true,
    'view_financials': true,
    'manage_users': false,
    'system_settings': false,
  },
  'SALESMAN': {
    'view_dashboard': true,
    'manage_products': true,
    'view_all_orders': false,
    'update_orders': false,
    'view_customers': false,
    'manage_categories': false,
    'manage_sections': false,
    'view_financials': false,
    'manage_users': false,
    'system_settings': false,
  },
};

export default function TeamPermissionsMatrixInteractive({ initialUsers }: TeamPermissionsMatrixInteractiveProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

  const handlePermissionToggle = (role: string, permissionId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionId]: !prev[role][permissionId],
      },
    }));

    // Show unsaved changes indicator
    setSaveMessage('Unsaved changes');
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    setSaveMessage('Saving permissions...');

    try {
      // Simulate API call to save permissions
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would make an API call here:
      // const response = await fetch('/api/admin/permissions', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ permissions: rolePermissions }),
      // });

      setSaveMessage('✓ Permissions saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Error saving permissions');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, active: !currentActive } : user
      ));

      // In a real implementation:
      // await fetch(`/api/admin/users/${userId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ active: !currentActive }),
      // });
    } catch (error) {
      // Revert on error
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, active: currentActive } : user
      ));
    }
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
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
            + Add New User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
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
                <button
                  onClick={() => handleToggleUserStatus(user.id, user.active)}
                  className={`text-xs font-medium ${
                    user.active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {user.active ? '● Active' : '● Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button & Status */}
      {saveMessage && (
        <div className={`soft-card p-4 flex items-center justify-between ${
          saveMessage.includes('✓') ? 'bg-green-50 border-green-200' :
          saveMessage.includes('Error') ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        } border`}>
          <p className="text-sm font-medium">
            {saveMessage}
          </p>
          {saveMessage === 'Unsaved changes' && (
            <button
              onClick={handleSavePermissions}
              disabled={savingPermissions}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {savingPermissions ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="soft-card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Role Permissions Matrix</h3>
              <p className="text-sm text-gray-500 mt-1">
                Click checkboxes to modify role permissions
              </p>
            </div>
            <button
              onClick={handleSavePermissions}
              disabled={savingPermissions || !saveMessage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPermissions ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 sticky left-0 bg-gradient-to-r from-indigo-50 to-purple-50 z-10">
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
              {permissions.map((permission, index) => (
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

                  {/* Super Admin */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions['SUPER_ADMIN'][permission.id]}
                        onChange={() => handlePermissionToggle('SUPER_ADMIN', permission.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                      />
                    </div>
                  </td>

                  {/* Shop Manager */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions['SHOP_MANAGER'][permission.id]}
                        onChange={() => handlePermissionToggle('SHOP_MANAGER', permission.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                      />
                    </div>
                  </td>

                  {/* Salesman */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions['SALESMAN'][permission.id]}
                        onChange={() => handlePermissionToggle('SALESMAN', permission.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                      />
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
