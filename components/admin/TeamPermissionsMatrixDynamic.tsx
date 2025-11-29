'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  active: boolean;
}

interface TeamPermissionsMatrixDynamicProps {
  initialUsers: User[];
}

export default function TeamPermissionsMatrixDynamic({ initialUsers }: TeamPermissionsMatrixDynamicProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: '',
    key: '',
    description: '',
    category: 'Products',
  });

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

  const categoryColors: Record<string, string> = {
    Dashboard: 'bg-blue-50 border-l-4 border-blue-500',
    Products: 'bg-green-50 border-l-4 border-green-500',
    Orders: 'bg-yellow-50 border-l-4 border-yellow-500',
    Catalog: 'bg-purple-50 border-l-4 border-purple-500',
    Customers: 'bg-pink-50 border-l-4 border-pink-500',
    System: 'bg-gray-50 border-l-4 border-gray-500',
  };

  // Fetch permissions and role permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/role-permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');

      const data = await response.json();
      setPermissions(data.permissions);
      setRolePermissions(data.rolePermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setSaveMessage('Error loading permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (role: string, permissionId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionId]: !prev[role][permissionId],
      },
    }));

    setSaveMessage('Unsaved changes');
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    setSaveMessage('Saving permissions...');

    try {
      const response = await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolePermissions }),
      });

      if (!response.ok) throw new Error('Failed to save permissions');

      setSaveMessage('✓ Permissions saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setSaveMessage('❌ Error saving permissions');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.name || !newPermission.key || !newPermission.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPermission),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create permission');
      }

      // Refresh permissions list
      await fetchPermissions();

      // Reset form and close modal
      setNewPermission({ name: '', key: '', description: '', category: 'Products' });
      setShowAddPermissionModal(false);
      setSaveMessage('✓ Permission created successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to create permission');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, active: !currentActive } : user
      ));

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) throw new Error('Failed to update user status');
    } catch (error) {
      // Revert on error
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, active: currentActive } : user
      ));
      alert('Failed to update user status');
    }
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

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
          saveMessage.includes('❌') ? 'bg-red-50 border-red-200' :
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
                Click checkboxes to modify role permissions • {permissions.length} permissions configured
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPermissionModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                + New Permission
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={savingPermissions || !saveMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPermissions ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>

        {/* Permissions grouped by category */}
        <div className="p-6 space-y-6">
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <div key={category} className={`p-4 rounded-lg ${categoryColors[category] || 'bg-gray-50'}`}>
              <h4 className="text-lg font-bold text-gray-900 mb-4">{category}</h4>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-1/2">
                        Permission
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-purple-700">
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">👑</span>
                          <span>Super Admin</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-blue-700">
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">🛍️</span>
                          <span>Shop Manager</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-green-700">
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">💼</span>
                          <span>Salesman</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((permission) => (
                      <tr
                        key={permission.id}
                        className="border-b border-gray-100/50 hover:bg-white/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{permission.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{permission.description}</p>
                          </div>
                        </td>

                        {/* Super Admin */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions['SUPER_ADMIN']?.[permission.id] || false}
                              onChange={() => handlePermissionToggle('SUPER_ADMIN', permission.id)}
                              className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                            />
                          </div>
                        </td>

                        {/* Shop Manager */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions['SHOP_MANAGER']?.[permission.id] || false}
                              onChange={() => handlePermissionToggle('SHOP_MANAGER', permission.id)}
                              className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                            />
                          </div>
                        </td>

                        {/* Salesman */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={rolePermissions['SALESMAN']?.[permission.id] || false}
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
          ))}
        </div>
      </div>

      {/* Add Permission Modal */}
      {showAddPermissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl soft-shadow max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Permission</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name
                </label>
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  placeholder="e.g., Manage Products"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Key (unique identifier)
                </label>
                <input
                  type="text"
                  value={newPermission.key}
                  onChange={(e) => setNewPermission({ ...newPermission, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g., manage_products"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  placeholder="e.g., Create, edit, and delete products"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newPermission.category}
                  onChange={(e) => setNewPermission({ ...newPermission, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="Products">Products</option>
                  <option value="Orders">Orders</option>
                  <option value="Catalog">Catalog</option>
                  <option value="Customers">Customers</option>
                  <option value="System">System</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddPermissionModal(false);
                  setNewPermission({ name: '', key: '', description: '', category: 'Products' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPermission}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="soft-card p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👑</span>
            <h4 className="text-lg font-bold text-gray-900">Super Admin</h4>
          </div>
          <p className="text-sm text-gray-600">
            Full system access. Can manage all products, orders, users, permissions, and system settings. Has unrestricted access to all features.
          </p>
        </div>

        <div className="soft-card p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🛍️</span>
            <h4 className="text-lg font-bold text-gray-900">Shop Manager</h4>
          </div>
          <p className="text-sm text-gray-600">
            Manages day-to-day operations. Can handle products, categories, orders, and customer information. Permissions can be customized by Super Admin.
          </p>
        </div>

        <div className="soft-card p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💼</span>
            <h4 className="text-lg font-bold text-gray-900">Salesman</h4>
          </div>
          <p className="text-sm text-gray-600">
            Limited access focused on product and order management. Permissions can be customized by Super Admin based on business needs.
          </p>
        </div>
      </div>
    </div>
  );
}
