import { foreignKey, index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { trainingRecords } from "./training-records";
import { relations } from "drizzle-orm";

export const trainingSets = sqliteTable(
  'training_sets',
  {
    id: text('id').notNull(),
    weight: real('weight').notNull(),
    repetition: integer('repetition').notNull(),
    rpe: integer('rpe').notNull(),
    order: integer('order').notNull(),
    estimatedMaximumWeight: real('estimated_maximum_weight').notNull(),
    recordId: text('record_id').notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    fk: foreignKey({ columns: [columns.recordId], foreignColumns: [trainingRecords.id] }),
    idx1: index('record_index').on(columns.recordId),
    idx2: index('estimated_maximum_weight_index').on(columns.estimatedMaximumWeight),
  })
)

export const trainingSetsRelations = relations(
  trainingSets,
  ({ one }) => ({
    trainingRecords: one(trainingRecords)
  })
)
