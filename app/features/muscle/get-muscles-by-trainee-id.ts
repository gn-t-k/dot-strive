import { desc, eq } from 'drizzle-orm';

import { muscles as musclesSchema } from 'database/tables/muscles';

import { validateMuscle } from './schema';

import type { Database } from 'database/get-instance';

type GetMusclesByTraineeId = (database: Database) => (traineeId: string) => Promise<Muscle[]>;
type Muscle = {
  id: string;
  name: string;
};
export const getMusclesByTraineeId: GetMusclesByTraineeId = (database) => async (traineeId) => {
  const data = await database
    .select({ id: musclesSchema.id, name: musclesSchema.name })
    .from(musclesSchema)
    .where(eq(musclesSchema.traineeId, traineeId))
    .orderBy(desc(musclesSchema.createdAt));
  const muscles = data.flatMap(datum => {
    const result = validateMuscle(datum);

    return result ? [result] : [];
  });

  return muscles;
};
