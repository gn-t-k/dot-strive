import { drizzle } from 'drizzle-orm/d1';

import type { AppLoadContext } from '@remix-run/cloudflare';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

/**
 * @see: https://developers.cloudflare.com/d1/examples/d1-and-remix/
 */
type GetDBClient = (context: AppLoadContext) => DrizzleD1Database;
export const getDBClient: GetDBClient = (context) => {
  const env = context as { DB: D1Database };
  const client = drizzle(env.DB);

  return client;
};
