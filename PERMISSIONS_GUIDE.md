# Permission System Guide

## Overview

The Sudhakant Sarees admin panel uses a comprehensive role-based access control (RBAC) system to manage user permissions. This guide explains how to use the permission system throughout the application.

## User Roles

The system supports three user roles, each with different levels of access:

### 1. SUPER_ADMIN
- **Full Access**: Complete control over all features
- **User Management**: Can create, edit, and delete admin users
- **Products**: Full CRUD access
- **Categories & Sections**: Full CRUD access
- **Orders**: View all orders, update status, view customer info
- **Customers**: View and manage all customer data

### 2. SHOP_MANAGER
- **Products**: Full CRUD access
- **Categories**: Can add and edit (cannot delete)
- **Sections**: Can add and edit (cannot delete)
- **Orders**: View all orders, update status, view customer info
- **Customers**: View only (cannot manage)
- **Limitations**: Cannot manage admin users

### 3. SALESMAN
- **Products**: Can add and edit (cannot delete)
- **Orders**: View active orders only (no status updates)
- **Limitations**:
  - Cannot manage categories or sections
  - Cannot view customer personal information
  - Cannot manage admin users

## Available Permissions

| Permission | SUPER_ADMIN | SHOP_MANAGER | SALESMAN |
|---|---|---|---|
| `canManageAdminUsers` | ✓ | ✗ | ✗ |
| `canAddProducts` | ✓ | ✓ | ✓ |
| `canEditProducts` | ✓ | ✓ | ✓ |
| `canDeleteProducts` | ✓ | ✓ | ✗ |
| `canAddCategories` | ✓ | ✓ | ✗ |
| `canEditCategories` | ✓ | ✓ | ✗ |
| `canDeleteCategories` | ✓ | ✗ | ✗ |
| `canAddSections` | ✓ | ✓ | ✗ |
| `canEditSections` | ✓ | ✓ | ✗ |
| `canDeleteSections` | ✓ | ✗ | ✗ |
| `canViewAllOrders` | ✓ | ✓ | ✗ |
| `canViewActiveOrders` | ✓ | ✓ | ✓ |
| `canUpdateOrderStatus` | ✓ | ✓ | ✗ |
| `canViewCustomerInfo` | ✓ | ✓ | ✗ |
| `canViewCustomers` | ✓ | ✓ | ✗ |
| `canManageCustomers` | ✓ | ✗ | ✗ |

---

## Implementation Guide

### 1. API Route Protection

Use the permission guard utilities in `/lib/permission-guards.ts` to protect API routes.

#### Basic Authentication Check

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAuth } from '@/lib/permission-guards';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  const authError = requireAuth(session);
  if (authError) {
    return authError; // Returns 401 Unauthorized
  }

  // Continue with authenticated logic
}
```

#### Single Permission Check

```typescript
import { requirePermission, getPermissionErrorMessage } from '@/lib/permission-guards';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check specific permission
  const permissionError = requirePermission(
    session,
    'canAddCategories',
    getPermissionErrorMessage('canAddCategories')
  );
  if (permissionError) {
    return permissionError; // Returns 403 Forbidden
  }

  // User has permission, proceed
}
```

#### Multiple Permissions (ALL required)

```typescript
import { requireAllPermissions } from '@/lib/permission-guards';

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // User must have ALL these permissions
  const permissionError = requireAllPermissions(
    session,
    ['canDeleteCategories', 'canManageAdminUsers']
  );
  if (permissionError) {
    return permissionError;
  }

  // User has all permissions, proceed
}
```

#### Multiple Permissions (ANY required)

```typescript
import { requireAnyPermission } from '@/lib/permission-guards';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // User needs at least ONE of these permissions
  const permissionError = requireAnyPermission(
    session,
    ['canAddCategories', 'canEditCategories', 'canDeleteCategories'],
    'You do not have permission to access categories.'
  );
  if (permissionError) {
    return permissionError;
  }

  // User has at least one permission, proceed
}
```

---

### 2. Server Component Protection (Pages)

Use permission checks in server components to protect pages and redirect unauthorized users.

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPermissions, type UserRole } from '@/lib/permissions';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Get user permissions
  const permissions = getPermissions(session.user.role as UserRole);

  // Check if user has ANY category permission
  if (!permissions.canAddCategories && !permissions.canEditCategories && !permissions.canDeleteCategories) {
    redirect('/admin/dashboard');
  }

  // User has permission, render page
  return (
    <div>
      {/* Conditionally show UI based on specific permissions */}
      {permissions.canAddCategories && (
        <button>Add Category</button>
      )}

      {permissions.canEditCategories && (
        <button>Edit</button>
      )}

      {permissions.canDeleteCategories && (
        <button>Delete</button>
      )}
    </div>
  );
}
```

---

### 3. Client Component Protection

Use the `PermissionGuard` component in client components to conditionally render UI elements.

#### Basic Usage

```typescript
'use client';

import PermissionGuard from '@/components/PermissionGuard';
import { UserRole } from '@/lib/permissions';

interface Props {
  userRole: UserRole;
}

export default function ProductActions({ userRole }: Props) {
  return (
    <div>
      {/* Show button only if user can add products */}
      <PermissionGuard userRole={userRole} permission="canAddProducts">
        <button>Add Product</button>
      </PermissionGuard>

      {/* Show edit button only if user can edit products */}
      <PermissionGuard userRole={userRole} permission="canEditProducts">
        <button>Edit Product</button>
      </PermissionGuard>

      {/* Show delete button only if user can delete products */}
      <PermissionGuard userRole={userRole} permission="canDeleteProducts">
        <button>Delete Product</button>
      </PermissionGuard>
    </div>
  );
}
```

#### Check Multiple Permissions (ALL required)

```typescript
<PermissionGuard
  userRole={userRole}
  requireAll={['canEditProducts', 'canDeleteProducts']}
>
  <button>Advanced Product Management</button>
</PermissionGuard>
```

#### Check Multiple Permissions (ANY required)

```typescript
<PermissionGuard
  userRole={userRole}
  requireAny={['canViewAllOrders', 'canViewActiveOrders']}
>
  <OrdersList />
</PermissionGuard>
```

#### With Fallback Content

```typescript
<PermissionGuard
  userRole={userRole}
  permission="canManageAdminUsers"
  fallback={<p className="text-red-500">Access Denied</p>}
>
  <UserManagementPanel />
</PermissionGuard>
```

---

### 4. Using Permission Hooks

The `PermissionGuard` component also exports hooks for programmatic permission checks in client components.

#### usePermissions Hook

```typescript
'use client';

import { usePermissions } from '@/components/PermissionGuard';
import { UserRole } from '@/lib/permissions';

interface Props {
  userRole: UserRole;
}

export default function ProductToolbar({ userRole }: Props) {
  const permissions = usePermissions(userRole);

  const handleAction = () => {
    if (permissions.canDeleteProducts) {
      // Perform delete
    } else {
      alert('You do not have permission to delete products');
    }
  };

  return (
    <div>
      {permissions.canAddProducts && <button>Add</button>}
      {permissions.canEditProducts && <button>Edit</button>}
      {permissions.canDeleteProducts && <button onClick={handleAction}>Delete</button>}
    </div>
  );
}
```

#### useHasPermission Hook

```typescript
'use client';

import { useHasPermission } from '@/components/PermissionGuard';

export default function DeleteButton({ userRole }: { userRole: UserRole }) {
  const canDelete = useHasPermission(userRole, 'canDeleteProducts');

  if (!canDelete) {
    return null; // Don't render button
  }

  return <button className="btn-danger">Delete</button>;
}
```

---

## Common Patterns

### Pattern 1: API Route with GET/POST/PUT/DELETE

```typescript
// /app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermission, requireAnyPermission } from '@/lib/permission-guards';

// GET - View categories (needs any category permission)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const error = requireAnyPermission(session, [
    'canAddCategories',
    'canEditCategories',
    'canDeleteCategories'
  ]);
  if (error) return error;

  // Fetch and return categories
}

// POST - Create category (needs add permission)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const error = requirePermission(session, 'canAddCategories');
  if (error) return error;

  // Create category
}
```

```typescript
// /app/api/admin/categories/[id]/route.ts

// PUT - Update category (needs edit permission)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const error = requirePermission(session, 'canEditCategories');
  if (error) return error;

  // Update category
}

// DELETE - Delete category (needs delete permission)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const error = requirePermission(session, 'canDeleteCategories');
  if (error) return error;

  // Delete category
}
```

### Pattern 2: Protected Page with Conditional UI

```typescript
// /app/admin/categories/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPermissions, type UserRole } from '@/lib/permissions';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const permissions = getPermissions(session.user.role as UserRole);

  // Require at least one category permission
  if (!permissions.canAddCategories && !permissions.canEditCategories && !permissions.canDeleteCategories) {
    redirect('/admin/dashboard');
  }

  return (
    <div>
      {/* Header with conditional Add button */}
      {permissions.canAddCategories && (
        <Link href="/admin/categories/new">Add Category</Link>
      )}

      {/* Table with conditional action buttons */}
      <table>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                {permissions.canEditCategories && (
                  <Link href={`/admin/categories/${category.id}/edit`}>Edit</Link>
                )}
                {permissions.canDeleteCategories && (
                  <DeleteButton categoryId={category.id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Pattern 3: Client Component with Permission Guard

```typescript
'use client';

import PermissionGuard from '@/components/PermissionGuard';
import { UserRole } from '@/lib/permissions';

interface Props {
  userRole: UserRole;
  categoryId: string;
  categoryName: string;
}

export default function CategoryActions({ userRole, categoryId, categoryName }: Props) {
  return (
    <div className="flex gap-2">
      <PermissionGuard userRole={userRole} permission="canEditCategories">
        <button
          onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
          className="btn-primary"
        >
          Edit
        </button>
      </PermissionGuard>

      <PermissionGuard
        userRole={userRole}
        permission="canDeleteCategories"
        fallback={
          <button disabled className="btn-disabled" title="You don't have permission to delete">
            Delete
          </button>
        }
      >
        <button
          onClick={() => handleDelete(categoryId)}
          className="btn-danger"
        >
          Delete
        </button>
      </PermissionGuard>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Validate on the Server

✅ **DO**: Always check permissions in API routes and server components
```typescript
// API route with permission check
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const error = requirePermission(session, 'canAddProducts');
  if (error) return error;

  // Create product
}
```

❌ **DON'T**: Rely only on client-side permission checks
```typescript
// Client component only - NOT SECURE!
<PermissionGuard userRole={userRole} permission="canAddProducts">
  <button onClick={createProduct}>Add Product</button>
</PermissionGuard>
```

### 2. Use Appropriate Permission Checks

- **Single permission**: Use when one specific permission is needed
- **requireAll**: Use when multiple permissions are ALL required
- **requireAny**: Use when user needs at least ONE of several permissions

### 3. Provide Clear Error Messages

```typescript
const error = requirePermission(
  session,
  'canDeleteProducts',
  'Only Super Admins and Shop Managers can delete products.'
);
```

### 4. Handle Edge Cases

```typescript
// Check if user session exists before accessing
if (!session || !session.user || !session.user.role) {
  redirect('/admin/login');
}

// Provide fallback UI for unauthorized access
<PermissionGuard
  userRole={userRole}
  permission="canManageAdminUsers"
  fallback={<UnauthorizedMessage />}
>
  <AdminPanel />
</PermissionGuard>
```

### 5. Keep UI Consistent with Permissions

If a user can't perform an action, don't show them the button:

```typescript
// Good: Hide button if no permission
{permissions.canDeleteProducts && (
  <button onClick={handleDelete}>Delete</button>
)}

// Also good: Show disabled button with explanation
<button
  disabled={!permissions.canDeleteProducts}
  title={!permissions.canDeleteProducts ? 'You do not have permission to delete' : ''}
  onClick={handleDelete}
>
  Delete
</button>
```

---

## Testing Permissions

When testing the permission system:

1. **Test each role**: Login as SUPER_ADMIN, SHOP_MANAGER, and SALESMAN
2. **Verify UI elements**: Check that buttons/links are shown/hidden appropriately
3. **Test API protection**: Try accessing protected APIs directly (should return 401/403)
4. **Test edge cases**: Try accessing pages/APIs with insufficient permissions

### Example Test Scenarios

| Scenario | SUPER_ADMIN | SHOP_MANAGER | SALESMAN |
|---|---|---|---|
| View categories page | ✓ Pass | ✓ Pass | ✗ Redirect |
| Add new category | ✓ Pass | ✓ Pass | ✗ 403 Error |
| Edit category | ✓ Pass | ✓ Pass | ✗ 403 Error |
| Delete category | ✓ Pass | ✗ 403 Error | ✗ 403 Error |
| Manage admin users | ✓ Pass | ✗ 403 Error | ✗ 403 Error |
| View all orders | ✓ Pass | ✓ Pass | ✗ 403 Error |
| View active orders | ✓ Pass | ✓ Pass | ✓ Pass |
| Update order status | ✓ Pass | ✓ Pass | ✗ 403 Error |

---

## Troubleshooting

### Issue: Permission checks not working

**Solution**: Ensure session is properly initialized
```typescript
const session = await getServerSession(authOptions);
if (!session) {
  redirect('/admin/login');
}
```

### Issue: 401 Unauthorized errors

**Solution**: Check that the user is logged in and session is valid

### Issue: 403 Forbidden errors

**Solution**: Verify the user's role has the required permission in `/lib/permissions.ts`

### Issue: UI showing unauthorized elements

**Solution**: Make sure you're passing the correct `userRole` prop to `PermissionGuard`

---

## File Reference

- **Permission Definitions**: `/lib/permissions.ts`
- **API Route Guards**: `/lib/permission-guards.ts`
- **Client Component Guards**: `/components/PermissionGuard.tsx`
- **Database Schema**: `/db/schema/index.ts` (users, roles, permissions tables)
- **Auth Configuration**: `/lib/auth.ts`

---

## Future Enhancements

The current system uses static role-based permissions. Future enhancements could include:

1. **Dynamic Permissions**: Store permissions in database for runtime configuration
2. **User-Specific Overrides**: Allow per-user permission customization
3. **Permission Groups**: Create permission sets for easier management
4. **Audit Logging**: Track permission changes and access attempts
5. **Permission UI**: Admin interface for managing roles and permissions

These features are partially implemented in the database schema but not yet activated. See `/db/schema/index.ts` for the `permissions`, `rolePermissions`, and `userPermissions` tables.

---

## Support

For questions or issues with the permission system, contact the development team or refer to:
- CLAUDE.md - Project overview
- This guide (PERMISSIONS_GUIDE.md)
- Code comments in `/lib/permissions.ts` and `/lib/permission-guards.ts`

---

*Last Updated: December 2025*
