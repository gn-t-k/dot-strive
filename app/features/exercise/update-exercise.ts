import { eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from 'database/tables/muscle-exercise-mappings';

import type { Exercise } from './schema';
import type { Database } from 'database/get-instance';

type UpdateExercise = (database: Database) => (props: Exercise) => Promise<
| { result: 'success'; data: { id: string; name: string } }
| { result: 'failure' }
>;
export const updateExercise: UpdateExercise = (database) => async ({ id, name, targets }) => {
  try {
    const [data] = await database.batch([
      database
        .update(exercisesSchema)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(exercisesSchema.id, id))
        .returning({ id: exercisesSchema.id, name: exercisesSchema.name }),
      database
        .delete(muscleExerciseMappingsSchema)
        .where(eq(muscleExerciseMappingsSchema.exerciseId, id)),
      database
        .insert(muscleExerciseMappingsSchema)
        .values(targets.map(target => ({ exerciseId: id, muscleId: target.id }))),
    ]);
    
    const updated = data[0];

    return updated ? { result: 'success', data: updated } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
