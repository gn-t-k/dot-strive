import { desc, eq, sql } from 'drizzle-orm';

import { exercises as exercisesSchema } from 'database/tables/exercises';
import { muscleExerciseMappings } from 'database/tables/muscle-exercise-mappings';
import { muscles as musclesSchema } from 'database/tables/muscles';

import { validateExercise } from '.';
import { validateMuscle } from '../muscle/schema';

import type { Exercise } from '.';
import type { Muscle } from '../muscle/schema';
import type { Trainee } from '../trainee';
import type { Database } from 'database/get-instance';

type GetExercisesWithTargetsByTraineeId = (database: Database) => (traineeId: Trainee['id']) => Promise<Payload>;
type Payload = { exercise: Exercise; targets: Muscle[] }[];
export const getExercisesWithTargetsByTraineeId: GetExercisesWithTargetsByTraineeId = (database) => async (traineeId) => {
  const data = await database
    .select({
      exerciseId: sql`${exercisesSchema.id}`.as('exerciseId'),
      exerciseName: sql`${exercisesSchema.name}`.as('exerciseName'),
      muscleId: sql`${musclesSchema.id}`.as('muscleId'),
      muscleName: sql`${musclesSchema.name}`.as('muscleName'),
    })
    .from(exercisesSchema)
    .innerJoin(muscleExerciseMappings, eq(exercisesSchema.id, muscleExerciseMappings.exerciseId))
    .innerJoin(musclesSchema, eq(muscleExerciseMappings.muscleId, musclesSchema.id))
    .where(eq(exercisesSchema.traineeId, traineeId))
    .orderBy(desc(exercisesSchema.createdAt));

  return data.reduce((accumulator: Payload, { exerciseId, exerciseName, muscleId, muscleName }) => {
    const exercise = validateExercise({ id: exerciseId, name: exerciseName });
    const muscle = validateMuscle({ id: muscleId, name: muscleName });
    if (!exercise || !muscle) return accumulator;

    const index = accumulator.findIndex(({ exercise }) => exercise.id === exerciseId);
    if (index === -1) {
      return [...accumulator, { exercise, targets: [muscle] }];
    }

    const current = accumulator[index];
    if (!current) return accumulator;

    return accumulator.with(index, {
      exercise: current.exercise,
      targets: [...current.targets, muscle],
    });
  }, []);
};
