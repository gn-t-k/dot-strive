import { eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from 'database/tables/muscle-exercise-mappings';

import { validateExercise } from '.';

import type { Exercise } from '.';
import type { Database } from 'database/get-instance';

type DeleteExercise = (database: Database) => (props: { id: Exercise['id' ] }) => Promise<
| { result: 'success'; data: Exercise }
| { result: 'failure' }
>;
export const deleteExercise: DeleteExercise = (database) => async ({ id }) => {
  try {
    // TODO: transaction
    await database
      .delete(muscleExerciseMappingsSchema)
      .where(eq(muscleExerciseMappingsSchema.exerciseId, id));
    const data = await database
      .delete(exercisesSchema)
      .where(eq(exercisesSchema.id, id))
      .returning();
    const exercise = validateExercise(data[0]);

    return exercise ? { result: 'success', data: exercise } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
