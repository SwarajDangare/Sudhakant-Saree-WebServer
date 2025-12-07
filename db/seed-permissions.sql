-- =====================================================
-- Database-Backed Permission System Setup
-- =====================================================
-- Run this SQL in your Neon database to set up the dynamic permission system
-- This will allow you to edit permissions in the UI and have changes reflect immediately

-- Step 1: Clear existing permissions (fresh start)
-- =====================================================
DELETE FROM "user_permissions";
DELETE FROM "role_permissions";
DELETE FROM "permissions";

-- Step 2: Insert Page-Based Permissions
-- =====================================================

-- Dashboard Permissions
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'view_dashboard', 'Dashboard - Overview', 'Access main dashboard page', 'Dashboard', true, NOW(), NOW()),
  (gen_random_uuid(), 'view_business_stats', 'Dashboard - Business Statistics', 'View revenue, sales, and business metrics on dashboard', 'Dashboard', true, NOW(), NOW());

-- Products Permissions
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'access_products_page', 'Products Page Access', 'Access products management page', 'Products', true, NOW(), NOW()),
  (gen_random_uuid(), 'create_products', 'Products - Create', 'Add new products', 'Products', true, NOW(), NOW()),
  (gen_random_uuid(), 'edit_products', 'Products - Edit', 'Modify existing products', 'Products', true, NOW(), NOW()),
  (gen_random_uuid(), 'delete_products', 'Products - Delete', 'Remove products', 'Products', true, NOW(), NOW());

-- Orders Permissions
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'access_orders_page', 'Orders Page Access', 'Access orders management page', 'Orders', true, NOW(), NOW()),
  (gen_random_uuid(), 'view_order_details', 'Orders - View Details', 'View complete order information', 'Orders', true, NOW(), NOW()),
  (gen_random_uuid(), 'update_order_status', 'Orders - Update Status', 'Change order status', 'Orders', true, NOW(), NOW()),
  (gen_random_uuid(), 'delete_orders', 'Orders - Delete', 'Remove orders', 'Orders', true, NOW(), NOW());

-- Categories Permissions
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'access_categories_page', 'Categories Page Access', 'Access categories management page', 'Catalog', true, NOW(), NOW()),
  (gen_random_uuid(), 'create_categories', 'Categories - Create', 'Add new categories', 'Catalog', true, NOW(), NOW()),
  (gen_random_uuid(), 'edit_categories', 'Categories - Edit', 'Modify categories', 'Catalog', true, NOW(), NOW()),
  (gen_random_uuid(), 'delete_categories', 'Categories - Delete', 'Remove categories', 'Catalog', true, NOW(), NOW());

-- Sections Permissions
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'access_sections_page', 'Sections Page Access', 'Access sections management page', 'Catalog', true, NOW(), NOW()),
  (gen_random_uuid(), 'create_sections', 'Sections - Create', 'Add new sections', 'Catalog', true, NOW(), NOW()),
  (gen_random_uuid(), 'edit_sections', 'Sections - Edit', 'Modify sections', 'Catalog', true, NOW(), NOW()),
  (gen_random_uuid(), 'delete_sections', 'Sections - Delete', 'Remove sections', 'Catalog', true, NOW(), NOW());

-- Customers Permissions
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'access_customers_page', 'Customers Page Access', 'Access customers management page', 'Customers', true, NOW(), NOW()),
  (gen_random_uuid(), 'view_customer_details', 'Customers - View Details', 'View customer personal information', 'Customers', true, NOW(), NOW()),
  (gen_random_uuid(), 'edit_customers', 'Customers - Edit', 'Modify customer information', 'Customers', true, NOW(), NOW()),
  (gen_random_uuid(), 'delete_customers', 'Customers - Delete', 'Remove customers', 'Customers', true, NOW(), NOW());

-- Team Management Permissions (Super Admin Only)
INSERT INTO "permissions" (id, key, name, description, category, active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'access_team_page', 'Team & Permissions Page Access', 'Access team management page', 'System', true, NOW(), NOW()),
  (gen_random_uuid(), 'create_users', 'Team - Create Users', 'Add new admin users', 'System', true, NOW(), NOW()),
  (gen_random_uuid(), 'edit_users', 'Team - Edit Users', 'Modify admin users', 'System', true, NOW(), NOW()),
  (gen_random_uuid(), 'delete_users', 'Team - Delete Users', 'Remove admin users', 'System', true, NOW(), NOW()),
  (gen_random_uuid(), 'manage_permissions', 'Permissions - Manage', 'Configure role permissions', 'System', true, NOW(), NOW());

-- Step 3: Configure Role Permissions
-- =====================================================

-- SUPER_ADMIN: All Permissions
INSERT INTO "role_permissions" (id, role, "permissionId", enabled, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'SUPER_ADMIN'::"Role",
  id,
  true,
  NOW(),
  NOW()
FROM "permissions";

-- SHOP_MANAGER: Most permissions except critical system settings
INSERT INTO "role_permissions" (id, role, "permissionId", enabled, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'SHOP_MANAGER'::"Role",
  id,
  true,
  NOW(),
  NOW()
FROM "permissions"
WHERE key IN (
  -- Dashboard
  'view_dashboard', 'view_business_stats',
  -- Products
  'access_products_page', 'create_products', 'edit_products', 'delete_products',
  -- Orders
  'access_orders_page', 'view_order_details', 'update_order_status',
  -- Categories
  'access_categories_page', 'create_categories', 'edit_categories', 'delete_categories',
  -- Sections
  'access_sections_page', 'create_sections', 'edit_sections', 'delete_sections',
  -- Customers
  'access_customers_page', 'view_customer_details', 'edit_customers'
  -- Note: NO delete_orders, delete_customers, or any team management permissions
);

-- SALESMAN: Limited to products and viewing orders
INSERT INTO "role_permissions" (id, role, "permissionId", enabled, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'SALESMAN'::"Role",
  id,
  true,
  NOW(),
  NOW()
FROM "permissions"
WHERE key IN (
  -- Dashboard (view only)
  'view_dashboard',
  -- Products (limited)
  'access_products_page', 'create_products', 'edit_products',
  -- Orders (view only)
  'access_orders_page', 'view_order_details'
  -- Note: NO delete operations, NO categories, sections, customers, or team management
);

-- =====================================================
-- Verification Queries
-- =====================================================

-- View all permissions
SELECT category, key, name, description, active
FROM "permissions"
ORDER BY category, key;

-- View SUPER_ADMIN permissions
SELECT
  p.category,
  p.name,
  rp.enabled
FROM "role_permissions" rp
JOIN "permissions" p ON rp."permissionId" = p.id
WHERE rp.role = 'SUPER_ADMIN'
ORDER BY p.category, p.name;

-- View SHOP_MANAGER permissions
SELECT
  p.category,
  p.name,
  rp.enabled
FROM "role_permissions" rp
JOIN "permissions" p ON rp."permissionId" = p.id
WHERE rp.role = 'SHOP_MANAGER'
ORDER BY p.category, p.name;

-- View SALESMAN permissions
SELECT
  p.category,
  p.name,
  rp.enabled
FROM "role_permissions" rp
JOIN "permissions" p ON rp."permissionId" = p.id
WHERE rp.role = 'SALESMAN'
ORDER BY p.category, p.name;

-- Count permissions by role
SELECT
  rp.role,
  COUNT(*) as total_permissions,
  SUM(CASE WHEN rp.enabled THEN 1 ELSE 0 END) as enabled_permissions
FROM "role_permissions" rp
GROUP BY rp.role;

-- =====================================================
-- How to modify permissions after setup
-- =====================================================

-- Example 1: Disable "Categories Page Access" for SHOP_MANAGER
-- (This will automatically hide all category create/edit/delete buttons due to hierarchical rules)
/*
UPDATE "role_permissions" rp
SET enabled = false, "updatedAt" = NOW()
FROM "permissions" p
WHERE rp."permissionId" = p.id
  AND rp.role = 'SHOP_MANAGER'
  AND p.key = 'access_categories_page';
*/

-- Example 2: Enable "Delete Products" for SALESMAN
/*
UPDATE "role_permissions" rp
SET enabled = true, "updatedAt" = NOW()
FROM "permissions" p
WHERE rp."permissionId" = p.id
  AND rp.role = 'SALESMAN'
  AND p.key = 'delete_products';
*/

-- Example 3: Give SHOP_MANAGER access to Team page (not recommended!)
/*
INSERT INTO "role_permissions" (id, role, "permissionId", enabled, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'SHOP_MANAGER'::"Role",
  id,
  true,
  NOW(),
  NOW()
FROM "permissions"
WHERE key = 'access_team_page';
*/

-- =====================================================
-- IMPORTANT: After making changes
-- =====================================================
-- The permission system has a 5-minute cache. To see changes immediately:
-- 1. Wait 5 minutes, OR
-- 2. Restart your Next.js server, OR
-- 3. Force a cache clear by redeploying
