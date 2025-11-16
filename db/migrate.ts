import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
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
    // Read the migration SQL file
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', '0000_unique_big_bertha.sql'),
      'utf-8'
    );

    console.log('📝 Running migration...');

    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sql.unsafe(statement);
      console.log('✅ Executed statement');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('  - users');
    console.log('  - sections');
    console.log('  - categories');
    console.log('  - products');
    console.log('  - product_images');
    console.log('  - product_colors');
    console.log('  - color_images');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

migrate();
