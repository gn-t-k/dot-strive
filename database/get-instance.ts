import { drizzle } from 'drizzle-orm/d1';

import type { AppLoadContext } from '@remix-run/cloudflare';

export type Database = ReturnType<typeof drizzle>;

type GetInstance = (context: AppLoadContext) => Database;
export const getInstance: GetInstance = context => {
  const env = context['env'] as Env;
  const database = drizzle(env.DB);

  return database;
};
