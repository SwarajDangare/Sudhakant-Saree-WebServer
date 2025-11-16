import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Generate a bcrypt hash for a password
 * Usage: tsx db/generate-password.ts <your-password>
 */
async function generatePasswordHash() {
  const password = process.argv[2];

  if (!password) {
    console.error('❌ Error: Please provide a password');
    console.log('\nUsage: npm run db:hash-password <your-password>');
    console.log('Example: npm run db:hash-password MySecurePassword123');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  console.log('🔐 Generating password hash...\n');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log('✅ Password hash generated successfully!');
  console.log('\n📋 Use this hash in your SQL INSERT statement:\n');
  console.log(`'${hash}'`);
  console.log('\n💡 Full SQL example:\n');
  console.log(`INSERT INTO users (id, email, "passwordHash", name, role, active, "createdAt", "updatedAt")`);
  console.log(`VALUES (`);
  console.log(`  gen_random_uuid()::text,`);
  console.log(`  'swarajdangare2016@gmail.com',`);
  console.log(`  '${hash}',`);
  console.log(`  'Swaraj Dangare',`);
  console.log(`  'SUPER_ADMIN',`);
  console.log(`  true,`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`);`);
  console.log('\n🔒 Keep this password safe! You\'ll use it to login to the admin panel.\n');
}

generatePasswordHash().catch(console.error);
