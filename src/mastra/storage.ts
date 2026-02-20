/**
 * Mastra Storage Factory
 * 
 * Configurable storage backend based on environment variables:
 * - MASTRA_STORAGE_PROVIDER: 'libsql' (default) | 'postgres' | 'mysql'
 * - MASTRA_DB_URL: Database connection URL
 * 
 * URL formats:
 * - libsql: 'file:./mastra.db' or 'file:/path/to/db.sqlite'
 * - postgres: 'postgresql://user:pass@host:port/dbname'
 * - mysql: 'mysql://user:pass@host:port/dbname'
 */

import { LibSQLStore } from '@mastra/libsql';
import { PostgresStore } from '@mastra/pg';

export type StorageProvider = 'libsql' | 'postgres' | 'mysql';

export interface StorageConfig {
  provider: StorageProvider;
  url: string;
}

export function getStorageConfig(): StorageConfig {
  const provider = (process.env.MASTRA_STORAGE_PROVIDER as StorageProvider) || 'libsql';
  
  // Default URLs based on provider
  const defaultUrls: Record<StorageProvider, string> = {
    libsql: 'file:./mastra.db',
    postgres: 'postgresql://localhost:5432/mastra',
    mysql: 'mysql://localhost:3306/mastra',
  };
  
  // For backwards compatibility, check SUPABASE_DB_URL if postgres is selected
  let url = process.env.MASTRA_DB_URL;
  if (!url && provider === 'postgres') {
    url = process.env.SUPABASE_DB_URL;
  }
  
  // Fall back to default
  if (!url) {
    url = defaultUrls[provider];
  }
  
  return { provider, url };
}

export function createStorage(id: string = 'mastra-storage') {
  const config = getStorageConfig();
  
  switch (config.provider) {
    case 'postgres':
      return new PostgresStore({
        id,
        connectionString: config.url,
      });
      
    case 'mysql':
      // MySQL support - add when @mastra/mysql is installed
      throw new Error(
        'MySQL storage provider is not yet installed. ' +
        'Run: pnpm add @mastra/mysql'
      );
      
    case 'libsql':
    default:
      return new LibSQLStore({
        id,
        url: config.url,
      });
  }
}

// Re-export for convenience
export { LibSQLStore, PostgresStore };
