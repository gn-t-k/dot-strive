import { eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from 'database/tables/muscle-exercise-mappings';

import { validateExercise } from './schema';

import type { Exercise } from './schema';
import type { Muscle } from '../muscle/schema';
import type { Database } from 'database/get-instance';

type UpdateExercise = (database: Database) => (props: {
  id: Exercise['id'];
  name: Exercise['name'];
  targets: Muscle['id'][];
}) => Promise<
| {
  result: 'success';
  data: Exercise;
}
| {
  result: 'failure';
}
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
        .values(targets.map(muscleId => ({ exerciseId: id, muscleId }))),
    ]);
    
    const exercise = validateExercise(data[0]);

    return exercise ? { result: 'success', data: exercise } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
