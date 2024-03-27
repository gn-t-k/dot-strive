import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings } from 'database/tables/muscle-exercise-mappings';

import type { Exercise } from './schema';
import type { Database } from 'database/get-instance';

type CreateExercise = (database: Database) => (props: {
  exercise: Exercise;
  traineeId: string;
}) => Promise<
| { result: 'success'; data: { id: string; name: string } }
| { result: 'failure' }
>;
export const createExercise: CreateExercise = (database) => async ({ exercise, traineeId }) => {
  try {
    const [data] = await database.batch([
      database
        .insert(exercisesSchema)
        .values({
          id: exercise.id,
          name: exercise.name,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: exercisesSchema.id, name: exercisesSchema.name }),
      database
        .insert(muscleExerciseMappings)
        .values(exercise.targets.map(target => ({ exerciseId: exercise.id, muscleId: target.id })))
        .onConflictDoNothing(),
    ]);

    const created = data[0];

    return created ? { result: 'success', data: created } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
