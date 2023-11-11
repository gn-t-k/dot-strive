import { primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const trainees = sqliteTable(
  'trainees',
  {
    id: text('id').notNull(),
    name: text('name').notNull(),
    image: text('image').notNull(),
    authUserId: text('authUserId').notNull(),
  },
  (columns) => ({
    pk: primaryKey(columns.id),
    uk: unique().on(columns.authUserId),
  }),
);
