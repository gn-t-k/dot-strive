import { foreignKey, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { trainees } from "./trainees";
import { relations } from "drizzle-orm";
import { muscles } from "./muscles";

export const exercises = sqliteTable(
  'exercises',
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

export const exercisesRelations = relations(
  exercises,
  ({one, many}) => ({
    trainee: one(trainees),
    muscles: many(muscles)
  })
)
