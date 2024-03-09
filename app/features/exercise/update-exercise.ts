import { eq } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from 'database/tables/muscle-exercise-mappings';

import { validateExercise } from '.';

import type { Exercise } from '.';
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
    // TODO: transaction
    // const data = await database.transaction(async (tx) => {
    //   const exercise = await tx
    //     .update(exercisesSchema)
    //     .set({
    //       name,
    //       updatedAt: new Date(),
    //     })
    //     .where(eq(exercisesSchema.id, id))
    //     .returning();
    //   await tx
    //     .delete(muscleExerciseMappingsSchema)
    //     .where(eq(muscleExerciseMappingsSchema.exerciseId, id));
    //   await tx
    //     .insert(muscleExerciseMappingsSchema)
    //     .values(targets.map(muscleId => ({ exerciseId: id, muscleId })));
      
    //   return exercise;
    // });
    const data = await database
      .update(exercisesSchema)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(exercisesSchema.id, id))
      .returning();
    await database
      .delete(muscleExerciseMappingsSchema)
      .where(eq(muscleExerciseMappingsSchema.exerciseId, id));
    await database
      .insert(muscleExerciseMappingsSchema)
      .values(targets.map(muscleId => ({ exerciseId: id, muscleId })));
    
    const exercise = validateExercise(data[0]);

    return exercise ? { result: 'success', data: exercise } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
