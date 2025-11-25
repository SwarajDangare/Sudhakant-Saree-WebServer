'use client';

import { useState } from 'react';
import { getRoleDisplayName, getRoleDescription, type UserRole } from '@/lib/permissions';
import PasswordInput from '@/components/PasswordInput';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserManagementClientProps {
  initialUsers: User[];
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'SALESMAN' as UserRole,
    active: true,
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'SALESMAN',
      active: true,
    });
    setError(null);
  };

  const handleAddUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        active: formData.active,
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password
      name: user.name,
      role: user.role as UserRole,
      active: user.active,
    });
    setError(null);
    setShowEditModal(true);
  };

  return (
    <div>
      {/* Add User Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-maroon text-white px-6 py-3 rounded-md hover:bg-deep-maroon transition font-medium"
        >
          + Add New Admin User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isSuperAdmin = user.role === 'SUPER_ADMIN' && user.email === 'swarajdangare2016@gmail.com';

              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'SHOP_MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getRoleDisplayName(user.role as UserRole)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-maroon hover:text-deep-maroon"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    {!isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No admin users found. Add your first user to get started.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Admin User</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <PasswordInput
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon"
                >
                  <option value="SALESMAN">Salesman</option>
                  <option value="SHOP_MANAGER">Shop Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {getRoleDescription(formData.role)}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-maroon focus:ring-maroon border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAddUser}
                disabled={loading}
                className="flex-1 bg-maroon text-white px-4 py-2 rounded-md hover:bg-deep-maroon transition font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Admin User</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon"
                />
              </div>

              <div>
                <PasswordInput
                  label="New Password (leave blank to keep current)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon"
                  disabled={selectedUser.role === 'SUPER_ADMIN' && selectedUser.email === 'swarajdangare2016@gmail.com'}
                >
                  <option value="SALESMAN">Salesman</option>
                  <option value="SHOP_MANAGER">Shop Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {getRoleDescription(formData.role)}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-maroon focus:ring-maroon border-gray-300 rounded"
                  disabled={selectedUser.role === 'SUPER_ADMIN' && selectedUser.email === 'swarajdangare2016@gmail.com'}
                />
                <label htmlFor="edit-active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleEditUser}
                disabled={loading}
                className="flex-1 bg-maroon text-white px-4 py-2 rounded-md hover:bg-deep-maroon transition font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
