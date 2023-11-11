import type { Config } from 'drizzle-kit';

export default {
  schema: './database/schema.ts',
  out: './database/migrations',
} satisfies Config;