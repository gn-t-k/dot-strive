import { eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from 'database/tables/muscle-exercise-mappings';

import type { Database } from 'database/get-instance';

type DeleteExercise = (database: Database) => (props: { id: string }) => Promise<
| { result: 'success'; data: { id: string; name: string } }
| { result: 'failure' }
>;
export const deleteExercise: DeleteExercise = (database) => async ({ id }) => {
  try {
    const [_, data] = await database.batch([
      database
        .delete(muscleExerciseMappingsSchema)
        .where(eq(muscleExerciseMappingsSchema.exerciseId, id)),
      database
        .delete(exercisesSchema)
        .where(eq(exercisesSchema.id, id))
        .returning({ id: exercisesSchema.id, name: exercisesSchema.name }),
    ]);

    const deleted = data[0];

    return deleted ? { result: 'success', data: deleted } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
