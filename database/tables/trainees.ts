import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { muscles } from './muscles';
import { exercises } from './exercises';
import { trainings } from './trainings';

export const trainees = sqliteTable(
  'trainees',
  {
    id: text('id').notNull(),
    name: text('name').notNull(),
    image: text('image').notNull(),
    authUserId: text('auth_user_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id]}),
    uk: unique().on(columns.authUserId),
  }),
);

export const traineesRelations = relations(
  trainees,
  ({many}) => ({
    muscles: many(muscles),
    exercises: many(exercises),
    trainings: many(trainings)
  })
)
