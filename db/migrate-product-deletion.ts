import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🔄 Connecting to database...');
  const sql = postgres(connectionString, {
    max: 1,
    ssl: 'require'
  });

  try {
    console.log('📝 Running migration: Allow product deletion...');

    // Make productId nullable in orderItems and change constraint to SET NULL
    await sql`ALTER TABLE "orderItems" DROP CONSTRAINT IF EXISTS "orderItems_productId_products_id_fk"`;
    await sql`ALTER TABLE "orderItems" ALTER COLUMN "productId" DROP NOT NULL`;
    await sql`ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_products_id_fk" 
      FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`;
    
    console.log('✅ Updated orderItems table');

    // Make productId nullable in cartItems and change constraint to SET NULL  
    await sql`ALTER TABLE "cartItems" DROP CONSTRAINT IF EXISTS "cartItems_productId_products_id_fk"`;
    await sql`ALTER TABLE "cartItems" ALTER COLUMN "productId" DROP NOT NULL`;
    await sql`ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productId_products_id_fk" 
      FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`;
    
    console.log('✅ Updated cartItems table');

    console.log('🎉 Migration completed successfully!');
    console.log('✨ Products can now be deleted even if they are in orders or carts');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration();
