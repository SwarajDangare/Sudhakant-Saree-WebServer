import 'dotenv/config';
import { db } from './index';
import { permissions, rolePermissions } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Seed script for permissions system
 * Run with: npm run db:seed-permissions
 */

const defaultPermissions = [
  // Dashboard & Analytics
  { key: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard and analytics', category: 'Dashboard' },
  { key: 'view_financials', name: 'View Financials', description: 'Access revenue and financial reports', category: 'Dashboard' },

  // Products Management
  { key: 'view_products', name: 'View Products', description: 'View product catalog', category: 'Products' },
  { key: 'create_products', name: 'Create Products', description: 'Add new products', category: 'Products' },
  { key: 'edit_products', name: 'Edit Products', description: 'Modify existing products', category: 'Products' },
  { key: 'delete_products', name: 'Delete Products', description: 'Remove products from catalog', category: 'Products' },

  // Orders Management
  { key: 'view_orders', name: 'View Orders', description: 'View all orders', category: 'Orders' },
  { key: 'view_all_orders', name: 'View All Orders', description: 'Access to all orders including completed and cancelled', category: 'Orders' },
  { key: 'update_orders', name: 'Update Order Status', description: 'Change order status and send notifications', category: 'Orders' },
  { key: 'delete_orders', name: 'Delete Orders', description: 'Remove orders from system', category: 'Orders' },

  // Categories & Sections
  { key: 'view_categories', name: 'View Categories', description: 'View product categories', category: 'Catalog' },
  { key: 'manage_categories', name: 'Manage Categories', description: 'Create and edit product categories', category: 'Catalog' },
  { key: 'view_sections', name: 'View Sections', description: 'View top-level sections', category: 'Catalog' },
  { key: 'manage_sections', name: 'Manage Sections', description: 'Create and edit top-level sections', category: 'Catalog' },

  // Customer Management
  { key: 'view_customers', name: 'View Customer Info', description: 'Access customer personal information', category: 'Customers' },
  { key: 'edit_customers', name: 'Edit Customers', description: 'Modify customer information', category: 'Customers' },
  { key: 'delete_customers', name: 'Delete Customers', description: 'Remove customer accounts', category: 'Customers' },

  // Admin Users & Permissions
  { key: 'view_users', name: 'View Admin Users', description: 'View list of admin users', category: 'System' },
  { key: 'manage_users', name: 'Manage Admin Users', description: 'Create, edit, and delete admin users', category: 'System' },
  { key: 'manage_permissions', name: 'Manage Permissions', description: 'Create, edit, and assign permissions', category: 'System' },
  { key: 'system_settings', name: 'System Settings', description: 'Access to system configuration', category: 'System' },
];

// Default role permissions configuration
const defaultRolePermissions = {
  SUPER_ADMIN: [
    // All permissions enabled for Super Admin
    'view_dashboard', 'view_financials',
    'view_products', 'create_products', 'edit_products', 'delete_products',
    'view_orders', 'view_all_orders', 'update_orders', 'delete_orders',
    'view_categories', 'manage_categories', 'view_sections', 'manage_sections',
    'view_customers', 'edit_customers', 'delete_customers',
    'view_users', 'manage_users', 'manage_permissions', 'system_settings',
  ],
  SHOP_MANAGER: [
    // Shop Manager permissions
    'view_dashboard', 'view_financials',
    'view_products', 'create_products', 'edit_products',
    'view_orders', 'view_all_orders', 'update_orders',
    'view_categories', 'manage_categories', 'view_sections', 'manage_sections',
    'view_customers', 'edit_customers',
    'view_users',
  ],
  SALESMAN: [
    // Salesman permissions (limited)
    'view_dashboard',
    'view_products', 'create_products', 'edit_products',
    'view_orders',
  ],
};

async function seedPermissions() {
  try {
    console.log('🌱 Starting permissions seed...\n');

    // 1. Seed Permissions
    console.log('📝 Creating permissions...');
    const permissionMap = new Map<string, string>(); // key -> id

    for (const perm of defaultPermissions) {
      const [inserted] = await db
        .insert(permissions)
        .values({
          key: perm.key,
          name: perm.name,
          description: perm.description,
          category: perm.category,
          active: true,
        })
        .onConflictDoUpdate({
          target: permissions.key,
          set: {
            name: perm.name,
            description: perm.description,
            category: perm.category,
            updatedAt: new Date(),
          },
        })
        .returning();

      permissionMap.set(perm.key, inserted.id);
      console.log(`  ✓ ${perm.name} (${perm.key})`);
    }

    console.log(`\n✅ Created/Updated ${defaultPermissions.length} permissions\n`);

    // 2. Seed Role Permissions
    console.log('🔐 Configuring role permissions...');

    for (const [role, permKeys] of Object.entries(defaultRolePermissions)) {
      console.log(`\n  Setting up ${role}:`);

      for (const permKey of permKeys) {
        const permissionId = permissionMap.get(permKey);
        if (!permissionId) {
          console.log(`    ⚠️  Permission not found: ${permKey}`);
          continue;
        }

        await db
          .insert(rolePermissions)
          .values({
            role: role as 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN',
            permissionId,
            enabled: true,
          })
          .onConflictDoNothing();

        console.log(`    ✓ ${permKey}`);
      }
    }

    console.log('\n✅ Role permissions configured successfully!\n');
    console.log('🎉 Permissions seed completed!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedPermissions();
