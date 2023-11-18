import { foreignKey, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { trainees } from "./trainees";
import { relations } from "drizzle-orm";
import { exercises } from "./exercises";

export const muscles = sqliteTable(
  'muscles',
  {
    id: text('id').notNull(),
    name: text('name').notNull(),
    traineeId: text('traineeId').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id]}),
    uk: unique().on(columns.traineeId, columns.name),
    fk: foreignKey({ columns: [columns.traineeId], foreignColumns: [trainees.id] })
  })
)

export const musclesRelations = relations(
  muscles,
  ({one, many}) => ({
    trainee: one(trainees),
    exercises: many(exercises)
  })
)
