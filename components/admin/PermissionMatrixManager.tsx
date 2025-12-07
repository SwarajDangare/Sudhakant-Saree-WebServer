'use client';

import React, { useState } from 'react';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
}

export interface RolePermissionMatrix {
  SUPER_ADMIN: Record<string, boolean>;
  SHOP_MANAGER: Record<string, boolean>;
  SALESMAN: Record<string, boolean>;
}

interface Props {
  initialPermissions: Permission[];
  initialMatrix: RolePermissionMatrix;
}

export default function PermissionMatrixManager({ initialPermissions, initialMatrix }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [matrix, setMatrix] = useState<RolePermissionMatrix>(initialMatrix);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Hierarchical permission mapping
  const permissionHierarchy: Record<string, string[]> = {
    'access_products_page': ['create_products', 'edit_products', 'delete_products'],
    'access_orders_page': ['view_order_details', 'update_order_status', 'delete_orders'],
    'access_categories_page': ['create_categories', 'edit_categories', 'delete_categories'],
    'access_sections_page': ['create_sections', 'edit_sections', 'delete_sections'],
    'access_customers_page': ['view_customer_details', 'edit_customers', 'delete_customers'],
    'access_team_page': ['create_users', 'edit_users', 'delete_users', 'manage_permissions'],
  };

  // Find permission ID by key
  const findPermissionIdByKey = (key: string): string | null => {
    const perm = permissions.find(p => p.key === key);
    return perm ? perm.id : null;
  };

  const handleToggle = (
    role: keyof RolePermissionMatrix,
    permissionId: string,
    currentValue: boolean
  ) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return;

    const newValue = !currentValue;

    setMatrix((prev) => {
      const newMatrix = {
        ...prev,
        [role]: {
          ...prev[role],
          [permissionId]: newValue,
        },
      };

      // Apply hierarchical logic
      // If this is a page access permission being turned OFF, turn off all sub-permissions
      if (permissionHierarchy[permission.key] && !newValue) {
        permissionHierarchy[permission.key].forEach(subKey => {
          const subPermId = findPermissionIdByKey(subKey);
          if (subPermId) {
            newMatrix[role][subPermId] = false;
          }
        });
      }

      // If this is a sub-permission being turned ON, turn on the parent page access
      for (const [pageKey, subKeys] of Object.entries(permissionHierarchy)) {
        if (subKeys.includes(permission.key) && newValue) {
          const pagePermId = findPermissionIdByKey(pageKey);
          if (pagePermId) {
            newMatrix[role][pagePermId] = true;
          }
        }
      }

      return newMatrix;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rolePermissions: matrix,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save permissions');
      }

      alert('✅ Permissions saved successfully! Changes take effect immediately.');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('❌ Failed to save permissions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setMatrix(initialMatrix);
      setHasChanges(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'SHOP_MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'SALESMAN':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Dashboard':
        return '📊';
      case 'Products':
        return '🛍️';
      case 'Orders':
        return '📦';
      case 'Catalog':
        return '📁';
      case 'Customers':
        return '👥';
      case 'System':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const isPageAccessPermission = (key: string) => {
    return key.startsWith('access_') && key.endsWith('_page');
  };

  return (
    <div className="space-y-6">
      {/* Header with Save/Reset Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permission Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage what each role can access. Page-level permissions control all sub-permissions.
          </p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-6 py-2 bg-maroon text-white rounded-lg hover:bg-deep-maroon disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Permission
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor('SUPER_ADMIN')}`}>
                      Super Admin
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor('SHOP_MANAGER')}`}>
                      Shop Manager
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor('SALESMAN')}`}>
                      Salesman
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedPermissions).map(([category, perms]) => {
                // Separate page access permissions from CRUD permissions
                const pageAccessPerms = perms.filter(p => isPageAccessPermission(p.key));
                const otherPerms = perms.filter(p => !isPageAccessPermission(p.key));

                // Group CRUD permissions by their parent page access
                const groupedByParent: Record<string, Permission[]> = {};
                otherPerms.forEach(perm => {
                  // Find parent permission
                  let parentKey = null;
                  for (const [pageKey, subKeys] of Object.entries(permissionHierarchy)) {
                    if (subKeys.includes(perm.key)) {
                      parentKey = pageKey;
                      break;
                    }
                  }
                  if (parentKey) {
                    if (!groupedByParent[parentKey]) {
                      groupedByParent[parentKey] = [];
                    }
                    groupedByParent[parentKey].push(perm);
                  }
                });

                return (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr className="bg-gray-100">
                      <td colSpan={4} className="px-6 py-3">
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <span className="text-2xl">{getCategoryIcon(category)}</span>
                          <span className="text-sm uppercase tracking-wide">{category}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Page Access Permissions (Parents) with their children */}
                    {pageAccessPerms.map((pageAccessPerm) => {
                      const children = groupedByParent[pageAccessPerm.key] || [];

                      return (
                        <React.Fragment key={pageAccessPerm.id}>
                          {/* Page Access Permission Row (Parent) */}
                          <tr className="bg-blue-50/30 hover:bg-blue-50/50">
                            <td className="px-6 py-3 sticky left-0 bg-blue-50/30">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">📁</span>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                                      PAGE ACCESS
                                    </span>
                                    <span className="font-bold text-gray-900 text-sm">
                                      {pageAccessPerm.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600 mt-1">
                                    {pageAccessPerm.description}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Super Admin Checkbox */}
                            <td className="px-6 py-3 text-center bg-blue-50/30">
                              <input
                                type="checkbox"
                                checked={matrix.SUPER_ADMIN[pageAccessPerm.id] || false}
                                onChange={() =>
                                  handleToggle('SUPER_ADMIN', pageAccessPerm.id, matrix.SUPER_ADMIN[pageAccessPerm.id])
                                }
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                              />
                            </td>

                            {/* Shop Manager Checkbox */}
                            <td className="px-6 py-3 text-center bg-blue-50/30">
                              <input
                                type="checkbox"
                                checked={matrix.SHOP_MANAGER[pageAccessPerm.id] || false}
                                onChange={() =>
                                  handleToggle('SHOP_MANAGER', pageAccessPerm.id, matrix.SHOP_MANAGER[pageAccessPerm.id])
                                }
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </td>

                            {/* Salesman Checkbox */}
                            <td className="px-6 py-3 text-center bg-blue-50/30">
                              <input
                                type="checkbox"
                                checked={matrix.SALESMAN[pageAccessPerm.id] || false}
                                onChange={() =>
                                  handleToggle('SALESMAN', pageAccessPerm.id, matrix.SALESMAN[pageAccessPerm.id])
                                }
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                              />
                            </td>
                          </tr>

                          {/* Child CRUD Permissions (Indented) */}
                          {children.map((childPerm) => (
                            <tr key={childPerm.id} className="hover:bg-gray-50">
                              <td className="px-6 py-2 sticky left-0 bg-white">
                                <div className="flex items-center gap-2 pl-8">
                                  <span className="text-gray-400">└─</span>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-700 text-sm">
                                      {childPerm.name}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                      {childPerm.description}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Super Admin Checkbox */}
                              <td className="px-6 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={matrix.SUPER_ADMIN[childPerm.id] || false}
                                  onChange={() =>
                                    handleToggle('SUPER_ADMIN', childPerm.id, matrix.SUPER_ADMIN[childPerm.id])
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                />
                              </td>

                              {/* Shop Manager Checkbox */}
                              <td className="px-6 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={matrix.SHOP_MANAGER[childPerm.id] || false}
                                  onChange={() =>
                                    handleToggle('SHOP_MANAGER', childPerm.id, matrix.SHOP_MANAGER[childPerm.id])
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                              </td>

                              {/* Salesman Checkbox */}
                              <td className="px-6 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={matrix.SALESMAN[childPerm.id] || false}
                                  onChange={() =>
                                    handleToggle('SALESMAN', childPerm.id, matrix.SALESMAN[childPerm.id])
                                  }
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                />
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Orphan permissions (those without a parent) */}
                    {otherPerms.filter(p => {
                      let hasParent = false;
                      for (const [pageKey, subKeys] of Object.entries(permissionHierarchy)) {
                        if (subKeys.includes(p.key)) {
                          hasParent = true;
                          break;
                        }
                      }
                      return !hasParent;
                    }).map((orphanPerm) => (
                      <tr key={orphanPerm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 sticky left-0 bg-white">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 text-sm">
                              {orphanPerm.name}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {orphanPerm.description}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={matrix.SUPER_ADMIN[orphanPerm.id] || false}
                            onChange={() =>
                              handleToggle('SUPER_ADMIN', orphanPerm.id, matrix.SUPER_ADMIN[orphanPerm.id])
                            }
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-6 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={matrix.SHOP_MANAGER[orphanPerm.id] || false}
                            onChange={() =>
                              handleToggle('SHOP_MANAGER', orphanPerm.id, matrix.SHOP_MANAGER[orphanPerm.id])
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-6 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={matrix.SALESMAN[orphanPerm.id] || false}
                            onChange={() =>
                              handleToggle('SALESMAN', orphanPerm.id, matrix.SALESMAN[orphanPerm.id])
                            }
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">How Permissions Work:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>Page Access</strong> permissions control whether a user can see the entire page
              </li>
              <li>If page access is OFF, all sub-permissions (Create/Edit/Delete) are automatically hidden</li>
              <li>Changes take effect immediately after saving (no server restart needed)</li>
              <li>Super Admins should typically have all permissions enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
