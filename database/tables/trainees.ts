import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { muscles } from './muscles';

export const trainees = sqliteTable(
  'trainees',
  {
    id: text('id').notNull(),
    name: text('name').notNull(),
    image: text('image').notNull(),
    authUserId: text('authUserId').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id]}),
    uk: unique().on(columns.authUserId),
  }),
);

export const traineesRelations = relations(
  trainees,
  ({many}) => ({
    muscles: many(muscles)
  })
)
