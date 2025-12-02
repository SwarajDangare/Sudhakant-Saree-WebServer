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

interface TeamManagementSimpleProps {
  initialUsers: User[];
}

export default function TeamManagementSimple({ initialUsers }: TeamManagementSimpleProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALESMAN' as 'SHOP_MANAGER' | 'SALESMAN',
  });

  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALESMAN' as 'SHOP_MANAGER' | 'SALESMAN',
  });

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

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      setNewUserData({ name: '', email: '', password: '', role: 'SALESMAN' });
      setShowAddUserModal(false);
      setSaveMessage('✓ User created successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to create user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role as 'SHOP_MANAGER' | 'SALESMAN',
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditUserModal(false);
      setSelectedUser(null);
      setSaveMessage('✓ User updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      setSaveMessage('✓ User deleted successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    }
  };

  const handleTogglePermission = (role: 'SHOP_MANAGER' | 'SALESMAN', permissionId: string) => {
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
    setSaving(true);
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
      setSaveMessage('❌ Error saving permissions');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
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
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, active: currentActive } : user
      ));
      alert('Failed to update user status');
    }
  };

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter out super admin from users list
  const managedUsers = users.filter(u => u.role !== 'SUPER_ADMIN');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading team management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Team Members Section */}
      <div className="soft-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Team Members</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage Shop Managers and Salesmen
            </p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs"
          >
            + Add Team Member
          </button>
        </div>

        {managedUsers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">No team members yet</p>
            <p className="text-gray-400 text-xs mt-1">Click "Add Team Member" to create your first user</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {managedUsers.map((user) => (
              <div key={user.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{user.name || 'No Name'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className={`soft-pill text-[10px] ${
                    user.role === 'SHOP_MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.role === 'SHOP_MANAGER' ? 'Shop Manager' : 'Salesman'}
                  </span>
                  <button
                    onClick={() => handleToggleUserStatus(user.id, user.active)}
                    className={`text-[10px] font-medium ${
                      user.active ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {user.active ? '● Active' : '● Inactive'}
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                    className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Status */}
      {saveMessage && (
        <div className={`soft-card p-3 flex items-center justify-between ${
          saveMessage.includes('✓') ? 'bg-green-50 border-green-200' :
          saveMessage.includes('❌') ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        } border`}>
          <p className="text-xs font-medium">{saveMessage}</p>
          {saveMessage === 'Unsaved changes' && (
            <button
              onClick={handleSavePermissions}
              disabled={saving}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          )}
        </div>
      )}

      {/* Permissions Table */}
      <div className="soft-card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Admin Page Permissions</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Control which admin pages Shop Managers and Salesmen can access
              </p>
            </div>
            <button
              onClick={handleSavePermissions}
              disabled={saving || !saveMessage}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-700">
                  Admin Page / Permission
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-blue-700">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-0.5">🛍️</span>
                    <span>Shop Manager</span>
                  </div>
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-green-700">
                  <div className="flex flex-col items-center">
                    <span className="text-lg mb-0.5">💼</span>
                    <span>Salesman</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(permissionsByCategory).map(([category, perms], catIndex) => (
                <>
                  <tr key={`category-${category}`} className="bg-gray-100">
                    <td colSpan={3} className="px-4 py-2">
                      <h4 className="font-bold text-gray-900 text-sm">{category}</h4>
                    </td>
                  </tr>
                  {perms.map((permission, permIndex) => (
                    <tr
                      key={permission.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        permIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{permission.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{permission.description}</p>
                        </div>
                      </td>

                      {/* Shop Manager Checkbox */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions['SHOP_MANAGER']?.[permission.id] || false}
                            onChange={() => handleTogglePermission('SHOP_MANAGER', permission.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                          />
                        </div>
                      </td>

                      {/* Salesman Checkbox */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions['SALESMAN']?.[permission.id] || false}
                            onChange={() => handleTogglePermission('SALESMAN', permission.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer transition-all"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl soft-shadow max-w-md w-full p-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">Add New Team Member</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'SHOP_MANAGER' | 'SALESMAN' })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="SHOP_MANAGER">Shop Manager</option>
                  <option value="SALESMAN">Salesman</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUserData({ name: '', email: '', password: '', role: 'SALESMAN' });
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl soft-shadow max-w-md w-full p-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Edit User: {selectedUser.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as 'SHOP_MANAGER' | 'SALESMAN' })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="SHOP_MANAGER">Shop Manager</option>
                  <option value="SALESMAN">Salesman</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
