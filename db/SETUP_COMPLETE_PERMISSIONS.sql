-- ============================================
-- COMPLETE PERMISSIONS SYSTEM SETUP
-- Run this entire script in Neon SQL Editor
-- ============================================

-- Step 1: Create permissions table
CREATE TABLE IF NOT EXISTS "permissions" (
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

-- Step 2: Create role_permissions table
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "Role" NOT NULL,
	"permissionId" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Step 3: Add foreign key for role_permissions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_permissionId_permissions_id_fk'
    ) THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_permissions_id_fk"
        FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Step 4: Create user_permissions table
CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"permissionId" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Step 5: Add foreign keys for user_permissions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_permissions_userId_users_id_fk'
    ) THEN
        ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_users_id_fk"
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_permissions_permissionId_permissions_id_fk'
    ) THEN
        ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_permissions_id_fk"
        FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Step 6: Clear existing data (if any)
TRUNCATE TABLE "role_permissions" CASCADE;
TRUNCATE TABLE "user_permissions" CASCADE;
TRUNCATE TABLE "permissions" CASCADE;

-- Step 7: Insert page-based permissions
INSERT INTO "permissions" ("id", "key", "name", "description", "category", "active", "createdAt", "updatedAt") VALUES
-- Dashboard (2 permissions)
(gen_random_uuid(), 'view_dashboard', 'Dashboard - Overview', 'Access main dashboard page', 'Dashboard', true, now(), now()),
(gen_random_uuid(), 'view_business_stats', 'Dashboard - Business Statistics', 'View revenue, sales, and business metrics on dashboard', 'Dashboard', true, now(), now()),

-- Products (4 permissions)
(gen_random_uuid(), 'access_products_page', 'Products Page', 'Access products management page', 'Products', true, now(), now()),
(gen_random_uuid(), 'create_products', 'Products - Create', 'Add new products', 'Products', true, now(), now()),
(gen_random_uuid(), 'edit_products', 'Products - Edit', 'Modify existing products', 'Products', true, now(), now()),
(gen_random_uuid(), 'delete_products', 'Products - Delete', 'Remove products', 'Products', true, now(), now()),

-- Orders (4 permissions)
(gen_random_uuid(), 'access_orders_page', 'Orders Page', 'Access orders management page', 'Orders', true, now(), now()),
(gen_random_uuid(), 'view_order_details', 'Orders - View Details', 'View complete order information', 'Orders', true, now(), now()),
(gen_random_uuid(), 'update_order_status', 'Orders - Update Status', 'Change order status', 'Orders', true, now(), now()),
(gen_random_uuid(), 'delete_orders', 'Orders - Delete', 'Remove orders', 'Orders', true, now(), now()),

-- Categories (4 permissions)
(gen_random_uuid(), 'access_categories_page', 'Categories Page', 'Access categories management page', 'Catalog', true, now(), now()),
(gen_random_uuid(), 'create_categories', 'Categories - Create', 'Add new categories', 'Catalog', true, now(), now()),
(gen_random_uuid(), 'edit_categories', 'Categories - Edit', 'Modify categories', 'Catalog', true, now(), now()),
(gen_random_uuid(), 'delete_categories', 'Categories - Delete', 'Remove categories', 'Catalog', true, now(), now()),

-- Sections (4 permissions)
(gen_random_uuid(), 'access_sections_page', 'Sections Page', 'Access sections management page', 'Catalog', true, now(), now()),
(gen_random_uuid(), 'create_sections', 'Sections - Create', 'Add new sections', 'Catalog', true, now(), now()),
(gen_random_uuid(), 'edit_sections', 'Sections - Edit', 'Modify sections', 'Catalog', true, now(), now()),
(gen_random_uuid(), 'delete_sections', 'Sections - Delete', 'Remove sections', 'Catalog', true, now(), now()),

-- Customers (4 permissions)
(gen_random_uuid(), 'access_customers_page', 'Customers Page', 'Access customers management page', 'Customers', true, now(), now()),
(gen_random_uuid(), 'view_customer_details', 'Customers - View Details', 'View customer personal information', 'Customers', true, now(), now()),
(gen_random_uuid(), 'edit_customers', 'Customers - Edit', 'Modify customer information', 'Customers', true, now(), now()),
(gen_random_uuid(), 'delete_customers', 'Customers - Delete', 'Remove customers', 'Customers', true, now(), now()),

-- System (5 permissions - Super Admin Only)
(gen_random_uuid(), 'access_team_page', 'Team & Permissions Page', 'Access team management page', 'System', true, now(), now()),
(gen_random_uuid(), 'create_users', 'Team - Create Users', 'Add new admin users', 'System', true, now(), now()),
(gen_random_uuid(), 'edit_users', 'Team - Edit Users', 'Modify admin users', 'System', true, now(), now()),
(gen_random_uuid(), 'delete_users', 'Team - Delete Users', 'Remove admin users', 'System', true, now(), now()),
(gen_random_uuid(), 'manage_permissions', 'Permissions - Manage', 'Configure role permissions', 'System', true, now(), now());

-- Step 8: Configure role permissions

-- Super Admin gets ALL 27 permissions
INSERT INTO "role_permissions" ("id", "role", "permissionId", "enabled", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'SUPER_ADMIN', "id", true, now(), now()
FROM "permissions";

-- Shop Manager gets 19 permissions (everything except system management)
INSERT INTO "role_permissions" ("id", "role", "permissionId", "enabled", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'SHOP_MANAGER', "id", true, now(), now()
FROM "permissions"
WHERE "key" IN (
    'view_dashboard', 'view_business_stats',
    'access_products_page', 'create_products', 'edit_products', 'delete_products',
    'access_orders_page', 'view_order_details', 'update_order_status',
    'access_categories_page', 'create_categories', 'edit_categories', 'delete_categories',
    'access_sections_page', 'create_sections', 'edit_sections', 'delete_sections',
    'access_customers_page', 'view_customer_details', 'edit_customers'
);

-- Salesman gets 6 permissions (limited access)
INSERT INTO "role_permissions" ("id", "role", "permissionId", "enabled", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'SALESMAN', "id", true, now(), now()
FROM "permissions"
WHERE "key" IN (
    'view_dashboard',
    'access_products_page', 'create_products', 'edit_products',
    'access_orders_page', 'view_order_details'
);

-- Step 9: Verify the setup
SELECT
    'Total Permissions Created' as status,
    COUNT(*) as count
FROM "permissions"
UNION ALL
SELECT
    'Super Admin Permissions' as status,
    COUNT(*) as count
FROM "role_permissions"
WHERE "role" = 'SUPER_ADMIN'
UNION ALL
SELECT
    'Shop Manager Permissions' as status,
    COUNT(*) as count
FROM "role_permissions"
WHERE "role" = 'SHOP_MANAGER'
UNION ALL
SELECT
    'Salesman Permissions' as status,
    COUNT(*) as count
FROM "role_permissions"
WHERE "role" = 'SALESMAN';

-- Expected results:
-- Total Permissions Created: 27
-- Super Admin Permissions: 27
-- Shop Manager Permissions: 19
-- Salesman Permissions: 6

-- SUCCESS! Now refresh your /admin/users page to see the permissions table!
