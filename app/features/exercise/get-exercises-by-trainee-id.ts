import { desc, eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';

import { validateExercise } from './schema';

import type { Exercise } from './schema';
import type { Trainee } from '../trainee/schema';
import type { Database } from 'database/get-instance';

type GetExercisesByTraineeId = (database: Database) => (traineeId: Trainee['id']) => Promise<Exercise[]>;
export const getExercisesByTraineeId: GetExercisesByTraineeId = (database) => async (traineeId) => {
  const data = await database
    .select({ id: exercisesSchema.id, name: exercisesSchema.name })
    .from(exercisesSchema)
    .where(eq(exercisesSchema.traineeId, traineeId))
    .orderBy(desc(exercisesSchema.createdAt));
  const exercises = data.flatMap(datum => {
    const result = validateExercise(datum);

    return result ? [result] : [];
  });

  return exercises;
};
