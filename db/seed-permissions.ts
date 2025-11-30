import 'dotenv/config';
import { db } from './index';
import { permissions, rolePermissions } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Seed script for page-based permissions system
 * This creates permissions based on actual admin pages
 * Run with: npm run db:seed-permissions
 */

const adminPagePermissions = [
  // Dashboard Access
  { key: 'view_dashboard', name: 'Dashboard - Overview', description: 'Access main dashboard page', category: 'Dashboard' },
  { key: 'view_business_stats', name: 'Dashboard - Business Statistics', description: 'View revenue, sales, and business metrics on dashboard', category: 'Dashboard' },

  // Products Management
  { key: 'access_products_page', name: 'Products Page', description: 'Access products management page', category: 'Products' },
  { key: 'create_products', name: 'Products - Create', description: 'Add new products', category: 'Products' },
  { key: 'edit_products', name: 'Products - Edit', description: 'Modify existing products', category: 'Products' },
  { key: 'delete_products', name: 'Products - Delete', description: 'Remove products', category: 'Products' },

  // Orders Management
  { key: 'access_orders_page', name: 'Orders Page', description: 'Access orders management page', category: 'Orders' },
  { key: 'view_order_details', name: 'Orders - View Details', description: 'View complete order information', category: 'Orders' },
  { key: 'update_order_status', name: 'Orders - Update Status', description: 'Change order status', category: 'Orders' },
  { key: 'delete_orders', name: 'Orders - Delete', description: 'Remove orders', category: 'Orders' },

  // Categories Management
  { key: 'access_categories_page', name: 'Categories Page', description: 'Access categories management page', category: 'Catalog' },
  { key: 'create_categories', name: 'Categories - Create', description: 'Add new categories', category: 'Catalog' },
  { key: 'edit_categories', name: 'Categories - Edit', description: 'Modify categories', category: 'Catalog' },
  { key: 'delete_categories', name: 'Categories - Delete', description: 'Remove categories', category: 'Catalog' },

  // Sections Management
  { key: 'access_sections_page', name: 'Sections Page', description: 'Access sections management page', category: 'Catalog' },
  { key: 'create_sections', name: 'Sections - Create', description: 'Add new sections', category: 'Catalog' },
  { key: 'edit_sections', name: 'Sections - Edit', description: 'Modify sections', category: 'Catalog' },
  { key: 'delete_sections', name: 'Sections - Delete', description: 'Remove sections', category: 'Catalog' },

  // Customers Management
  { key: 'access_customers_page', name: 'Customers Page', description: 'Access customers management page', category: 'Customers' },
  { key: 'view_customer_details', name: 'Customers - View Details', description: 'View customer personal information', category: 'Customers' },
  { key: 'edit_customers', name: 'Customers - Edit', description: 'Modify customer information', category: 'Customers' },
  { key: 'delete_customers', name: 'Customers - Delete', description: 'Remove customers', category: 'Customers' },

  // Team Management (Super Admin Only)
  { key: 'access_team_page', name: 'Team & Permissions Page', description: 'Access team management page', category: 'System' },
  { key: 'create_users', name: 'Team - Create Users', description: 'Add new admin users', category: 'System' },
  { key: 'edit_users', name: 'Team - Edit Users', description: 'Modify admin users', category: 'System' },
  { key: 'delete_users', name: 'Team - Delete Users', description: 'Remove admin users', category: 'System' },
  { key: 'manage_permissions', name: 'Permissions - Manage', description: 'Configure role permissions', category: 'System' },
];

// Default role permissions configuration
const defaultRolePermissions = {
  SUPER_ADMIN: [
    // Super Admin has ALL permissions
    'view_dashboard', 'view_business_stats',
    'access_products_page', 'create_products', 'edit_products', 'delete_products',
    'access_orders_page', 'view_order_details', 'update_order_status', 'delete_orders',
    'access_categories_page', 'create_categories', 'edit_categories', 'delete_categories',
    'access_sections_page', 'create_sections', 'edit_sections', 'delete_sections',
    'access_customers_page', 'view_customer_details', 'edit_customers', 'delete_customers',
    'access_team_page', 'create_users', 'edit_users', 'delete_users', 'manage_permissions',
  ],
  SHOP_MANAGER: [
    // Shop Manager - Most permissions except critical system settings
    'view_dashboard', 'view_business_stats',
    'access_products_page', 'create_products', 'edit_products', 'delete_products',
    'access_orders_page', 'view_order_details', 'update_order_status',
    'access_categories_page', 'create_categories', 'edit_categories', 'delete_categories',
    'access_sections_page', 'create_sections', 'edit_sections', 'delete_sections',
    'access_customers_page', 'view_customer_details', 'edit_customers',
  ],
  SALESMAN: [
    // Salesman - Limited to products and viewing orders
    'view_dashboard',
    'access_products_page', 'create_products', 'edit_products',
    'access_orders_page', 'view_order_details',
  ],
};

async function seedPermissions() {
  try {
    console.log('🌱 Starting page-based permissions seed...\n');

    // 1. Delete existing permissions (fresh start)
    console.log('🗑️  Clearing existing permissions...');
    await db.delete(rolePermissions);
    await db.delete(permissions);
    console.log('✓ Cleared\n');

    // 2. Seed Permissions
    console.log('📝 Creating page-based permissions...');
    const permissionMap = new Map<string, string>(); // key -> id

    for (const perm of adminPagePermissions) {
      const [inserted] = await db
        .insert(permissions)
        .values({
          key: perm.key,
          name: perm.name,
          description: perm.description,
          category: perm.category,
          active: true,
        })
        .returning();

      permissionMap.set(perm.key, inserted.id);
      console.log(`  ✓ ${perm.name}`);
    }

    console.log(`\n✅ Created ${adminPagePermissions.length} permissions\n`);

    // 3. Seed Role Permissions
    console.log('🔐 Configuring role permissions...');

    for (const [role, permKeys] of Object.entries(defaultRolePermissions)) {
      console.log(`\n  Setting up ${role}:`);

      for (const permKey of permKeys) {
        const permissionId = permissionMap.get(permKey);
        if (!permissionId) {
          console.log(`    ⚠️  Permission not found: ${permKey}`);
          continue;
        }

        await db.insert(rolePermissions).values({
          role: role as 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN',
          permissionId,
          enabled: true,
        });

        console.log(`    ✓ ${permKey}`);
      }
    }

    console.log('\n✅ Role permissions configured successfully!\n');
    console.log('📊 Permission Summary:');
    console.log(`   - Dashboard: 2 permissions`);
    console.log(`   - Products: 4 permissions`);
    console.log(`   - Orders: 4 permissions`);
    console.log(`   - Catalog: 8 permissions (Categories + Sections)`);
    console.log(`   - Customers: 4 permissions`);
    console.log(`   - System: 5 permissions (Team Management)`);
    console.log(`   - Total: ${adminPagePermissions.length} permissions\n`);

    console.log('🎉 Page-based permissions seed completed!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedPermissions();
