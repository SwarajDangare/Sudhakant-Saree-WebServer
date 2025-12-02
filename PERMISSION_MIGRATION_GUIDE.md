## 🔄 Migration Guide: Database-Backed Permission System

This guide will help you switch from the static hardcoded permission system to the dynamic database-backed system that allows you to edit permissions in the UI.

---

## 📋 What Changed?

### Before (Static/Hardcoded)
- Permissions defined in code (`lib/permissions.ts`)
- Changes require code modification and deployment
- No UI for managing permissions
- Permissions checked synchronously

### After (Database-Backed)
- Permissions stored in database (`permissions`, `role_permissions`, `user_permissions` tables)
- Changes via SQL or UI (coming soon)
- **Hierarchical permissions**: Page access controls all CRUD operations
- Changes reflect immediately (5-minute cache)
- Permissions checked asynchronously

---

## 🎯 Key Features

### 1. **Hierarchical Permission System**

If you disable **"Categories Page Access"** for SHOP_MANAGER, then:
- ❌ User cannot see the categories page
- ❌ All category buttons automatically hidden (Create, Edit, Delete)
- ❌ API requests automatically blocked

**Page Access Permissions Control:**
- `canAccessCategoriesPage` → controls `canCreateCategories`, `canEditCategories`, `canDeleteCategories`
- `canAccessSectionsPage` → controls `canCreateSections`, `canEditSections`, `canDeleteSections`
- `canAccessProductsPage` → controls `canCreateProducts`, `canEditProducts`, `canDeleteProducts`
- `canAccessOrdersPage` → controls `canViewOrderDetails`, `canUpdateOrderStatus`, `canDeleteOrders`
- `canAccessCustomersPage` → controls `canViewCustomerDetails`, `canEditCustomers`, `canDeleteCustomers`
- `canAccessTeamPage` → controls `canCreateUsers`, `canEditUsers`, `canDeleteUsers`, `canManagePermissions`

### 2. **User-Specific Overrides**

You can override permissions for individual users:
- Give a specific SALESMAN permission to delete products
- Restrict a specific SHOP_MANAGER from certain operations
- Granular control per user

### 3. **5-Minute Cache**

Permissions are cached for 5 minutes to avoid excessive database queries:
- Changes visible within 5 minutes
- Or restart server for immediate effect
- Cache automatically clears when stale

---

## 🚀 Step-by-Step Migration

### Step 1: Run SQL in Neon Database

1. **Open Neon SQL Editor**
   - Go to your Neon dashboard
   - Select your database
   - Click "SQL Editor"

2. **Run the Setup SQL**
   ```bash
   # The SQL file is located at:
   db/seed-permissions.sql
   ```

3. **Copy and paste the SQL** into Neon SQL Editor

4. **Execute the queries** - This will:
   - ✅ Clear existing permissions
   - ✅ Create 27 page-based permissions
   - ✅ Configure default permissions for all roles
   - ✅ Show verification queries

### Step 2: Verify Permissions Were Created

Run this query in Neon to verify:

```sql
-- Should return 27 permissions
SELECT COUNT(*) FROM permissions;

-- View permissions by category
SELECT category, COUNT(*) as count
FROM permissions
GROUP BY category
ORDER BY category;
```

Expected output:
- **Catalog**: 8 permissions (Categories + Sections)
- **Customers**: 4 permissions
- **Dashboard**: 2 permissions
- **Orders**: 4 permissions
- **Products**: 4 permissions
- **System**: 5 permissions (Team Management)

### Step 3: Update Your Code (Already Done!)

The following files have been created/updated:
- ✅ `lib/permissions-db.ts` - Database-backed permission system
- ✅ `lib/permission-guards-db.ts` - Async permission guards
- ✅ `lib/permissions-legacy.ts` - Backup of old system
- ✅ `lib/permissions.ts` - Exports both systems

### Step 4: Update API Routes (Example)

**Old way (static):**
```typescript
import { requirePermission } from '@/lib/permission-guards';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Sync check - hardcoded permissions
  const error = requirePermission(session, 'canAddCategories');
  if (error) return error;
}
```

**New way (database-backed):**
```typescript
import { requirePermission } from '@/lib/permission-guards-db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Async check - reads from database
  const error = await requirePermission(session, 'canAccessCategoriesPage');
  if (error) return error;
}
```

### Step 5: Update Server Components (Example)

**Old way:**
```typescript
import { getPermissions } from '@/lib/permissions';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  const permissions = getPermissions(session.user.role); // Sync, hardcoded

  if (!permissions.canAddCategories) {
    redirect('/admin/dashboard');
  }
}
```

**New way:**
```typescript
import { getPermissionsFromDB } from '@/lib/permissions';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  const permissions = await getPermissionsFromDB(session.user.role); // Async, from database

  if (!permissions.canAccessCategoriesPage) {
    redirect('/admin/dashboard');
  }
}
```

---

## 🎨 New Permission Structure

### Categories (by Module)

#### Dashboard
- `canAccessDashboard` - View dashboard page
- `canViewBusinessStats` - See revenue/sales stats

#### Products
- **`canAccessProductsPage`** ← **Page Access** (required for all below)
  - `canCreateProducts` - Add products
  - `canEditProducts` - Modify products
  - `canDeleteProducts` - Remove products

#### Orders
- **`canAccessOrdersPage`** ← **Page Access**
  - `canViewOrderDetails` - See order details
  - `canUpdateOrderStatus` - Change order status
  - `canDeleteOrders` - Remove orders

#### Categories
- **`canAccessCategoriesPage`** ← **Page Access**
  - `canCreateCategories` - Add categories
  - `canEditCategories` - Modify categories
  - `canDeleteCategories` - Remove categories

#### Sections
- **`canAccessSectionsPage`** ← **Page Access**
  - `canCreateSections` - Add sections
  - `canEditSections` - Modify sections
  - `canDeleteSections` - Remove sections

#### Customers
- **`canAccessCustomersPage`** ← **Page Access**
  - `canViewCustomerDetails` - See customer info
  - `canEditCustomers` - Modify customers
  - `canDeleteCustomers` - Remove customers

#### Team Management
- **`canAccessTeamPage`** ← **Page Access** (SUPER_ADMIN only)
  - `canCreateUsers` - Add admin users
  - `canEditUsers` - Modify admin users
  - `canDeleteUsers` - Remove admin users
  - `canManagePermissions` - Configure permissions

---

## 🔧 How to Modify Permissions

### Example 1: Disable Categories Page for SHOP_MANAGER

```sql
-- This will hide the entire categories page AND all create/edit/delete buttons
UPDATE "role_permissions" rp
SET enabled = false, "updatedAt" = NOW()
FROM "permissions" p
WHERE rp."permissionId" = p.id
  AND rp.role = 'SHOP_MANAGER'
  AND p.key = 'access_categories_page';
```

Result:
- ❌ SHOP_MANAGER cannot access `/admin/categories`
- ❌ All category CRUD operations automatically blocked
- ❌ API requests automatically return 403 Forbidden

### Example 2: Give SALESMAN Delete Products Permission

```sql
-- First, ensure they have page access (they already do by default)
-- Then enable the specific permission

UPDATE "role_permissions" rp
SET enabled = true, "updatedAt" = NOW()
FROM "permissions" p
WHERE rp."permissionId" = p.id
  AND rp.role = 'SALESMAN'
  AND p.key = 'delete_products';
```

### Example 3: User-Specific Override

Give a specific user (e.g., a SALESMAN) access to view customer details:

```sql
-- Get the user ID
SELECT id, email, name, role FROM users WHERE email = 'salesman@example.com';

-- Get the permission ID
SELECT id, key, name FROM permissions WHERE key = 'view_customer_details';

-- Create user-specific override
INSERT INTO "user_permissions" (id, "userId", "permissionId", enabled, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'user-id-here',  -- Replace with actual user ID
  'permission-id-here',  -- Replace with actual permission ID
  true,
  NOW(),
  NOW()
);
```

---

## 📊 Permission Matrix

| Permission | SUPER_ADMIN | SHOP_MANAGER | SALESMAN |
|---|:---:|:---:|:---:|
| **Dashboard** |
| Access Dashboard | ✅ | ✅ | ✅ |
| View Business Stats | ✅ | ✅ | ❌ |
| **Products** |
| Access Products Page | ✅ | ✅ | ✅ |
| Create Products | ✅ | ✅ | ✅ |
| Edit Products | ✅ | ✅ | ✅ |
| Delete Products | ✅ | ✅ | ❌ |
| **Orders** |
| Access Orders Page | ✅ | ✅ | ✅ |
| View Order Details | ✅ | ✅ | ✅ |
| Update Order Status | ✅ | ✅ | ❌ |
| Delete Orders | ✅ | ❌ | ❌ |
| **Categories** |
| Access Categories Page | ✅ | ✅ | ❌ |
| Create Categories | ✅ | ✅ | ❌ |
| Edit Categories | ✅ | ✅ | ❌ |
| Delete Categories | ✅ | ✅ | ❌ |
| **Sections** |
| Access Sections Page | ✅ | ✅ | ❌ |
| Create Sections | ✅ | ✅ | ❌ |
| Edit Sections | ✅ | ✅ | ❌ |
| Delete Sections | ✅ | ✅ | ❌ |
| **Customers** |
| Access Customers Page | ✅ | ✅ | ❌ |
| View Customer Details | ✅ | ✅ | ❌ |
| Edit Customers | ✅ | ✅ | ❌ |
| Delete Customers | ✅ | ❌ | ❌ |
| **Team Management** |
| Access Team Page | ✅ | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| Manage Permissions | ✅ | ❌ | ❌ |

---

## 🐛 Troubleshooting

### Issue: Permissions not updating

**Solution:** Wait 5 minutes or restart server
```bash
# The system caches permissions for 5 minutes
# To see changes immediately, restart your server
```

### Issue: User has no permissions

**Check 1:** Verify user's role
```sql
SELECT id, email, name, role FROM users WHERE email = 'user@example.com';
```

**Check 2:** Verify role has permissions
```sql
SELECT p.name, rp.enabled
FROM role_permissions rp
JOIN permissions p ON rp."permissionId" = p.id
WHERE rp.role = 'SHOP_MANAGER';  -- Replace with actual role
```

### Issue: Page access works but CRUD operations don't

**This is by design!** If you have page access but not CRUD permissions:
- ✅ You can see the page
- ❌ Create/Edit/Delete buttons are hidden
- ❌ API requests for those operations return 403

**Solution:** Enable the specific CRUD permissions:
```sql
UPDATE "role_permissions" rp
SET enabled = true, "updatedAt" = NOW()
FROM "permissions" p
WHERE rp."permissionId" = p.id
  AND rp.role = 'SHOP_MANAGER'
  AND p.key IN ('create_categories', 'edit_categories', 'delete_categories');
```

---

## 🎯 Next Steps

1. ✅ Run the SQL seed script in Neon
2. ✅ Verify permissions were created
3. ⏳ Test with different roles
4. ⏳ Build UI for managing permissions (optional, coming soon)
5. ⏳ Update remaining API routes to use database-backed guards

---

## 📚 Related Files

- `lib/permissions-db.ts` - Database-backed permission system
- `lib/permission-guards-db.ts` - Async permission guards for API routes
- `lib/permissions-legacy.ts` - Old hardcoded system (backup)
- `db/seed-permissions.sql` - SQL setup script
- `PERMISSIONS_GUIDE.md` - Original permission documentation

---

**Questions?** Check the code comments or refer to the `PERMISSIONS_GUIDE.md` for usage examples!
