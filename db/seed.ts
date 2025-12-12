import { db, sections, categories, users } from './index';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Seed the database with initial data
 * This includes:
 * - Super Admin user
 * - Sarees section
 * - 5 categories (Silk, Cotton, Banarasi, Kanjivaram, Patola)
 */
async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Create Super Admin user
    console.log('👤 Creating Super Admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10); // Change this password!

    const [admin] = await db
      .insert(users)
      .values({
        email: 'swarajdangare2016@gmail.com',
        passwordHash,
        name: 'Swaraj Dangare',
        role: 'SUPER_ADMIN',
        active: true,
      })
      .returning();

    console.log(`✅ Created admin user: ${admin.email}`);
    console.log(`⚠️  Default password: admin123 (CHANGE THIS IMMEDIATELY!)\n`);

    // 2. Create Sarees section
    console.log('📁 Creating Sarees section...');
    const [sareeSection] = await db
      .insert(sections)
      .values({
        name: 'Sarees',
        slug: 'sarees',
        description: 'Traditional Indian sarees in various fabrics and styles',
        order: 1,
        active: true,
      })
      .returning();

    console.log(`✅ Created section: ${sareeSection.name}\n`);

    // 3. Create categories
    console.log('🏷️  Creating categories...');
    const categoriesToCreate = [
      {
        sectionId: sareeSection.id,
        name: 'Silk Sarees',
        slug: 'silk',
        description: 'Pure silk sarees with rich texture and shine',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
        imagePublicId: 'demo/accessories-bag',
        order: 1,
      },
      {
        sectionId: sareeSection.id,
        name: 'Cotton Sarees',
        slug: 'cotton',
        description: 'Comfortable and breathable cotton sarees for daily wear',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
        imagePublicId: 'demo/leather-bag',
        order: 2,
      },
      {
        sectionId: sareeSection.id,
        name: 'Banarasi Sarees',
        slug: 'banarasi',
        description: 'Traditional Banarasi silk sarees with intricate zari work',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
        imagePublicId: 'demo/shoes',
        order: 3,
      },
      {
        sectionId: sareeSection.id,
        name: 'Kanjivaram Sarees',
        slug: 'kanjivaram',
        description: 'South Indian Kanjivaram silk sarees with temple borders',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
        imagePublicId: 'demo/analog-classic',
        order: 4,
      },
      {
        sectionId: sareeSection.id,
        name: 'Patola Sarees',
        slug: 'patola',
        description: 'Double ikat Patola sarees with geometric patterns',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/food.jpg',
        imagePublicId: 'demo/food',
        order: 5,
      },
    ];

    const createdCategories = await db
      .insert(categories)
      .values(categoriesToCreate)
      .returning();

    createdCategories.forEach((category) => {
      console.log(`  ✅ ${category.name}`);
    });

    console.log('\n🎉 Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - 1 Super Admin user created`);
    console.log(`  - 1 Section created (Sarees)`);
    console.log(`  - 5 Categories created`);
    console.log('\n🔐 Login credentials:');
    console.log(`  Email: swarajdangare2016@gmail.com`);
    console.log(`  Password: admin123`);
    console.log(`  ⚠️  IMPORTANT: Change this password after first login!\n`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
