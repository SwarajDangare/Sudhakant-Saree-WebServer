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

interface TeamManagementSimpleProps {
  initialUsers: User[];
}

export default function TeamManagementSimple({ initialUsers }: TeamManagementSimpleProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
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

  // Filter out super admin from users list
  const managedUsers = users.filter(u => u.role !== 'SUPER_ADMIN');

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
        <div className={`soft-card p-3 ${
          saveMessage.includes('✓') ? 'bg-green-50 border-green-200' :
          saveMessage.includes('❌') ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        } border`}>
          <p className="text-xs font-medium">{saveMessage}</p>
        </div>
      )}

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
