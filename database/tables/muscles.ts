import { foreignKey, index, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { trainees } from "./trainees";
import { relations } from "drizzle-orm";
import { exercises } from "./exercises";

export const muscles = sqliteTable(
  'muscles',
  {
    id: text('id').notNull(),
    name: text('name').notNull(),
    traineeId: text('trainee_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id]}),
    uk: unique().on(columns.traineeId, columns.name),
    fk: foreignKey({ columns: [columns.traineeId], foreignColumns: [trainees.id] }),
    idx: index('trainee_index').on(columns.traineeId),
  })
)

export const musclesRelations = relations(
  muscles,
  ({one, many}) => ({
    trainee: one(trainees),
    exercises: many(exercises)
  })
)
