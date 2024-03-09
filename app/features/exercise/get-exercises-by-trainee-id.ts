import { desc, eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';

import { validateExercise } from '.';

import type { Exercise } from '.';
import type { Trainee } from '../trainee';
import type { Database } from 'database/get-instance';

type GetExercisesByTraineeId = (database: Database) => (traineeId: Trainee['id']) => Promise<Exercise[]>;
export const getExercisesByTraineeId: GetExercisesByTraineeId = (database) => async (traineeId) => {
  const data = await database
    .select()
    .from(exercisesSchema)
    .where(eq(exercisesSchema.traineeId, traineeId))
    .orderBy(desc(exercisesSchema.createdAt));
  const exercises = data.flatMap(datum => {
    const result = validateExercise(datum);

    return result ? [result] : [];
  });

  return exercises;
};
