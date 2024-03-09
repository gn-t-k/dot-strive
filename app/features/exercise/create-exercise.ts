import { createId } from '@paralleldrive/cuid2';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings } from 'database/tables/muscle-exercise-mappings';

import { validateExercise } from '.';

import type { Exercise } from '.';
import type { Muscle } from '../muscle/schema';
import type { Trainee } from '../trainee';
import type { Database } from 'database/get-instance';

type CreateExercise = (database: Database) => (props: {
  name: Exercise['name'];
  muscleIds: Muscle['id'][];
  traineeId: Trainee['id'];
}) => Promise<
| {
  result: 'success';
  data: Exercise;
}
| {
  result: 'failure';
}
>;
export const createExercise: CreateExercise = (database) => async ({ name, muscleIds, traineeId }) => {
  try {
    const exerciseId = createId();
    const data = await database
      .insert(exercisesSchema)
      .values({
        id: exerciseId,
        name,
        traineeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    const exercise = validateExercise(data[0]);
    await database
      .insert(muscleExerciseMappings)
      .values(muscleIds.map(muscleId => ({ exerciseId, muscleId })))
      .onConflictDoNothing();

    return exercise ? { result: 'success', data: exercise } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
