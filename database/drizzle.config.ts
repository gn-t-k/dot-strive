import type { Config } from 'drizzle-kit';

export default {
  schema: './database/tables/*',
  out: './database/migrations',
} satisfies Config;
