# Mastra Storage Configuration

This project supports configurable storage backends for Mastra via environment variables.

## Supported Providers

| Provider | Package | Description |
|----------|---------|-------------|
| `libsql` | `@mastra/libsql` | Local SQLite database (default) |
| `postgres` | `@mastra/pg` | PostgreSQL database |
| `mysql` | `@mastra/mysql` | MySQL database (not installed) |

## Environment Variables

```bash
# Storage provider: 'libsql' | 'postgres' | 'mysql'
MASTRA_STORAGE_PROVIDER=libsql

# Database connection URL
MASTRA_DB_URL=file:./mastra.db
```

## URL Formats

### LibSQL (SQLite)
```bash
# Local file
MASTRA_DB_URL=file:./mastra.db

# Absolute path
MASTRA_DB_URL=file:/path/to/mastra.db

# In-memory (not recommended for production)
MASTRA_DB_URL=:memory:
```

### PostgreSQL
```bash
# Direct connection
MASTRA_DB_URL=postgresql://user:password@host:port/database

# Supabase connection pooler
MASTRA_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### MySQL
```bash
MASTRA_DB_URL=mysql://user:password@host:port/database
```

## Configuration Examples

### Local Development (SQLite - Default)
```bash
MASTRA_STORAGE_PROVIDER=libsql
MASTRA_DB_URL=file:./mastra.db
```

### Production with Supabase (PostgreSQL)
```bash
MASTRA_STORAGE_PROVIDER=postgres
MASTRA_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

### Using Legacy SUPABASE_DB_URL
If `MASTRA_STORAGE_PROVIDER=postgres` and `MASTRA_DB_URL` is not set, the system will fall back to `SUPABASE_DB_URL`:
```bash
MASTRA_STORAGE_PROVIDER=postgres
SUPABASE_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

## Adding MySQL Support

To add MySQL support, install the package:

```bash
pnpm add @mastra/mysql
```

Then configure:
```bash
MASTRA_STORAGE_PROVIDER=mysql
MASTRA_DB_URL=mysql://user:password@localhost:3306/mastra
```

## Implementation

The storage configuration is handled in `src/mastra/storage.ts`:

```typescript
import { createStorage } from './storage';

// Creates storage based on env vars
const storage = createStorage('my-storage-id');
```

This factory function is used in:
- `src/mastra/index.ts` - Main Mastra storage
- `src/mastra/agents/mail-triage.ts` - Agent memory storage
