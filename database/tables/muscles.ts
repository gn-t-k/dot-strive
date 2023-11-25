import { relations } from 'drizzle-orm';
import { foreignKey, index, integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

import { exercises } from './exercises';
import { trainees } from './trainees';

export const muscles = sqliteTable(
  'muscles',
  {
    id: text('id').notNull(),
    name: text('name').notNull(),
    traineeId: text('trainee_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    uk: unique().on(columns.traineeId, columns.name),
    fk: foreignKey({ columns: [columns.traineeId], foreignColumns: [trainees.id] }),
    idx: index('muscles_trainee_index').on(columns.traineeId),
  }),
);

export const musclesRelations = relations(
  muscles,
  ({ one, many }) => ({
    trainee: one(trainees),
    exercises: many(exercises),
  }),
);
