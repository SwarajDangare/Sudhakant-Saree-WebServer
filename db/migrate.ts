import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Please check .env.local');
  }

  console.log('🔄 Connecting to database for migration...');
  const migrationClient = postgres(connectionString, { max: 1, ssl: 'require' });
  const db = drizzle(migrationClient);

  try {
    console.log('⏳ Running migrations from ./db/migrations...');
    
    // This will automatically run all pending migrations
    await migrate(db, { migrationsFolder: './db/migrations' });
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main();
