# Dynamic Permissions System Setup Guide

## Overview

The Sudhakant Sarees admin panel now features a **fully dynamic, database-driven permissions system**. Super Admins can:
- Create custom permissions
- Assign permissions to roles (Super Admin, Shop Manager, Salesman)
- Manage permissions without touching code
- View and edit the role permissions matrix in real-time

## Database Setup

### Step 1: Run the Migration

Since automatic migration may fail due to network restrictions, manually run the SQL migration through **Neon's SQL Editor**:

```sql
-- Copy and run the contents of: db/migrations/0005_jittery_stephen_strange.sql

CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);

CREATE TABLE "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "Role" NOT NULL,
	"permissionId" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_permissions_id_fk"
FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
```

### Step 2: Seed Default Permissions

After running the migration, seed the database with default permissions:

```bash
npm run db:seed-permissions
```

This will create:
- **23 default permissions** across 6 categories:
  - Dashboard (2 permissions)
  - Products (4 permissions)
  - Orders (4 permissions)
  - Catalog (4 permissions)
  - Customers (3 permissions)
  - System (4 permissions)

- **Default role configurations**:
  - Super Admin: All permissions enabled
  - Shop Manager: Most permissions (except user management)
  - Salesman: Limited permissions (products and orders only)

## Features

### 1. **Dynamic Permission Management**

Super Admins can create new permissions directly from the admin panel:

- **Permission Name**: Display name (e.g., "Manage Products")
- **Permission Key**: Unique identifier (e.g., "manage_products")
- **Description**: What this permission allows
- **Category**: Group permissions logically

### 2. **Role Permissions Matrix**

View and edit all permissions for all roles in one place:

- ✅ Visual checkbox interface
- 📊 Grouped by category for easy navigation
- 💾 Real-time save functionality
- 🎨 Color-coded categories

### 3. **No Hardcoded Permissions**

All permissions are stored in the database. Super Admins can:
- Add new permissions as business needs change
- Remove obsolete permissions
- Modify permission descriptions
- Reorganize permissions into categories

## API Endpoints

### Permissions Management

**GET** `/api/admin/permissions`
- Fetch all permissions
- Returns: `{ permissions: Permission[] }`

**POST** `/api/admin/permissions`
- Create a new permission
- Body: `{ name, key, description, category, active? }`
- Returns: `{ permission: Permission, message }`

**PUT** `/api/admin/permissions/[id]`
- Update a permission
- Body: `{ name?, key?, description?, category?, active? }`
- Returns: `{ permission: Permission, message }`

**DELETE** `/api/admin/permissions/[id]`
- Delete a permission
- Returns: `{ message }`

### Role Permissions Matrix

**GET** `/api/admin/role-permissions`
- Fetch the complete role permissions matrix
- Returns: `{ permissions: Permission[], rolePermissions: Matrix }`

**PUT** `/api/admin/role-permissions`
- Update the role permissions matrix
- Body: `{ rolePermissions: { [role]: { [permissionId]: boolean } } }`
- Returns: `{ message }`

## Database Schema

### `permissions` Table

```typescript
{
  id: string (UUID),
  name: string,                  // Display name
  key: string (unique),          // Unique identifier
  description: string,           // What it allows
  category: string,              // Grouping
  active: boolean,               // Is active
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `role_permissions` Table

```typescript
{
  id: string (UUID),
  role: 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN',
  permissionId: string (FK -> permissions.id),
  enabled: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Usage in Code

### Checking Permissions (Future Implementation)

Once you implement permission middleware, you can check permissions like this:

```typescript
import { hasPermission } from '@/lib/permissions';

// In API routes
if (!hasPermission(session.user.role, 'manage_products')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// In components
if (hasPermission(userRole, 'view_financials')) {
  // Show financial data
}
```

### Permission Utility Function (To be created)

```typescript
// lib/permissions.ts

import { db } from '@/db';
import { permissions, rolePermissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function hasPermission(
  role: string,
  permissionKey: string
): Promise<boolean> {
  const permission = await db
    .select()
    .from(permissions)
    .where(eq(permissions.key, permissionKey))
    .limit(1);

  if (!permission.length) return false;

  const rolePermission = await db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.role, role),
        eq(rolePermissions.permissionId, permission[0].id),
        eq(rolePermissions.enabled, true)
      )
    )
    .limit(1);

  return rolePermission.length > 0;
}
```

## Default Permission Categories

### Dashboard
- `view_dashboard` - Access to main dashboard and analytics
- `view_financials` - Access revenue and financial reports

### Products
- `view_products` - View product catalog
- `create_products` - Add new products
- `edit_products` - Modify existing products
- `delete_products` - Remove products from catalog

### Orders
- `view_orders` - View all orders
- `view_all_orders` - Access to all orders including completed and cancelled
- `update_orders` - Change order status and send notifications
- `delete_orders` - Remove orders from system

### Catalog
- `view_categories` - View product categories
- `manage_categories` - Create and edit product categories
- `view_sections` - View top-level sections
- `manage_sections` - Create and edit top-level sections

### Customers
- `view_customers` - Access customer personal information
- `edit_customers` - Modify customer information
- `delete_customers` - Remove customer accounts

### System
- `view_users` - View list of admin users
- `manage_users` - Create, edit, and delete admin users
- `manage_permissions` - Create, edit, and assign permissions
- `system_settings` - Access to system configuration

## Team & Permissions Page

The Team & Permissions page (`/admin/users`) now features:

### Team Members Section
- View all admin users
- Toggle user active/inactive status
- Color-coded role badges
- Add new users (button ready for implementation)

### Role Permissions Matrix
- Interactive checkbox interface
- Grouped by category
- Real-time changes indicator
- Save button with loading states

### Permission Creation Modal
- Create new permissions on-the-fly
- Auto-format permission keys
- Category selection dropdown
- Instant refresh after creation

### Role Descriptions
- Visual cards explaining each role
- Updated to reflect dynamic permissions
- Links to relevant documentation

## Best Practices

1. **Permission Naming Convention**:
   - Use descriptive names: "Manage Products" not "Products"
   - Use action verbs: "View", "Create", "Edit", "Delete", "Manage"

2. **Permission Keys**:
   - Use snake_case: `manage_products`
   - Be specific: `view_orders` vs `view_all_orders`
   - Never change keys once created (or update all references)

3. **Categories**:
   - Keep categories consistent
   - Use existing categories when possible
   - Create new categories only for distinct feature groups

4. **Role Configuration**:
   - Super Admin should have all permissions
   - Shop Manager should have most operational permissions
   - Salesman should have minimal permissions
   - Review permissions quarterly

## Troubleshooting

### "Failed to fetch permissions"
- Check database connection
- Verify migration was run successfully
- Check API route logs for errors

### "Permission key already exists"
- Use unique keys for each permission
- Check existing permissions before creating

### Changes not saving
- Check browser console for errors
- Verify Super Admin access
- Check network tab for API responses

### Missing permissions after seed
- Re-run seed script: `npm run db:seed-permissions`
- Check database for `permissions` and `role_permissions` tables
- Verify seed script completed without errors

## Future Enhancements

1. **Permission Groups**: Group permissions for easier assignment
2. **Custom Roles**: Allow creating custom roles beyond the three defaults
3. **Permission Inheritance**: Child permissions automatically granted with parent
4. **Audit Logging**: Track who changed permissions and when
5. **Bulk Assignment**: Assign multiple permissions at once
6. **Permission Templates**: Pre-configured sets of permissions
7. **User-Level Permissions**: Override role permissions for specific users

## Migration from Hardcoded Permissions

If you were using hardcoded permissions before:

1. Run the database migration
2. Run the seed script to populate default permissions
3. Update permission checks in your code to use the database
4. Remove hardcoded permission arrays from code
5. Test all permission checks thoroughly

---

**Last Updated**: November 29, 2025
**Version**: 1.0.0
