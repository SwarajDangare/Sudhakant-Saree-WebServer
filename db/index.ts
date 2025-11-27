import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to avoid errors during build time
let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a singleton connection
  client = postgres(connectionString, {
    max: 1,
    ssl: 'require'
  });

  // Create drizzle instance
  dbInstance = drizzle(client, { schema });

  return dbInstance;
}

// Export a proxy that lazily initializes the connection
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const instance = getDb();
    return instance[prop as keyof typeof instance];
  }
});

// Export schema for use in queries
export * from './schema';
