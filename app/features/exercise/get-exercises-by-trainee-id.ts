import { desc, eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';

import type { Database } from 'database/get-instance';

type GetExercisesByTraineeId = (database: Database) => (traineeId: string) => Promise<Exercise[]>;
type Exercise = {
  id: string;
  name: string;
};
export const getExercisesByTraineeId: GetExercisesByTraineeId = (database) => async (traineeId) => {
  const data = await database
    .select({ id: exercisesSchema.id, name: exercisesSchema.name })
    .from(exercisesSchema)
    .where(eq(exercisesSchema.traineeId, traineeId))
    .orderBy(desc(exercisesSchema.createdAt));

  return data;
};
