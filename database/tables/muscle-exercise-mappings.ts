import { relations } from "drizzle-orm";
import { foreignKey, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { muscles } from "./muscles";
import { exercises } from "./exercises";

export const muscleExerciseMappings = sqliteTable(
  'muscle_exercise_mappings',
  {
    muscleId: text('muscle_id').notNull(),
    exerciseId: text('exercise_id').notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.muscleId, columns.exerciseId] }),
    fkMuscle: foreignKey({ columns: [columns.muscleId], foreignColumns: [muscles.id] }), 
    fkExercise: foreignKey({ columns: [columns.exerciseId], foreignColumns: [exercises.id] })
  })
)

export const muscleExerciseMappingsRelations = relations(
  muscleExerciseMappings,
  ({one}) => ({
    muscle: one(muscles, { fields: [muscleExerciseMappings.muscleId], references: [muscles.id]}),
    exercise: one(exercises, { fields: [muscleExerciseMappings.exerciseId], references: [exercises.id]})
  })
)
