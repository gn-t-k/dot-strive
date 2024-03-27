import { eq } from 'drizzle-orm';

import { muscleExerciseMappings as muscleExerciseMappingsSchema } from 'database/tables/muscle-exercise-mappings';
import { muscles as musclesSchema } from 'database/tables/muscles';

import type { Database } from 'database/get-instance';

type DeleteMuscle = (database: Database) => (props: { id: string }) => Promise<
| { result: 'success'; data: { id: string; name: string } }
| { result: 'failure' }
>;
export const deleteMuscle: DeleteMuscle = (database) => async ({ id }) => {
  try {
    const [, data] = await database.batch([
      database
        .delete(muscleExerciseMappingsSchema)
        .where(eq(muscleExerciseMappingsSchema.muscleId, id)),
      database
        .delete(musclesSchema)
        .where(eq(musclesSchema.id, id))
        .returning({ id: musclesSchema.id, name: musclesSchema.name }),
    ]);

    const deleted = data[0];

    return deleted ? { result: 'success', data: deleted } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
