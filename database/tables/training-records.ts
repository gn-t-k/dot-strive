import { foreignKey, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { trainings } from "./trainings";
import { exercises } from "./exercises";
import { relations } from "drizzle-orm";
import { trainingSets } from "./training-sets";

export const trainingRecords = sqliteTable(
  'training_records',
  {
    id: text('id').notNull(),
    memo: text('memo').notNull(),
    order: integer('order').notNull(),
    trainingId: text('training_id').notNull(),
    exerciseId: text('exercise_id').notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    fk1: foreignKey({ columns: [columns.trainingId], foreignColumns: [trainings.id] }),
    fk2: foreignKey({ columns: [columns.exerciseId], foreignColumns: [exercises.id] }),
    idx1: index('training_index').on(columns.trainingId),
    idx2: index('exercise_index').on(columns.exerciseId),
  })
)

export const trainingRecordsRelations = relations(
  trainingRecords,
  ({one, many}) => ({
    training: one(trainings),
    trainingSets: many(trainingSets)
  })
)
