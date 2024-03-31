import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

import { trainingRecords } from 'database/tables/training-records';
import { trainings } from 'database/tables/trainings';

import { getEstimatedMaximumWeight } from './get-estimated-maximum-weight';

import type { Training } from './schema';
import type { Database } from 'database/get-instance';

type CreateTraining = (database: Database) => (props: {
  training: Training;
  traineeId: string;
}) => Promise<
| { result: 'success'; data: { id: string } }
| { result: 'failure' }
>;
export const createTraining: CreateTraining = (database) => async ({ training, traineeId }) => {
  try {
    const { sessions, sets } = flatTraining(training);

    const [data] = await database.batch([
      database
        .insert(trainings)
        .values({
          id: training.id,
          date: training.date,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: trainings.id }),
      database
        .insert(trainingRecords)
        .values(sessions),
      // D1のvariablesの数の上限が100なので、それを回避するために生で書いている
      database.run(sql.raw(
        `INSERT INTO "training_sets"
          ("id", "weight", "repetition", "rpe", "order", "estimated_maximum_weight", "record_id")
        VALUES
          ${sets.map(set => `('${set.id}', ${set.weight}, ${set.repetition}, ${set.rpe}, ${set.order}, ${set.estimatedMaximumWeight}, '${set.recordId}')`).join(',')}
        ;`,
      )),
    ]);

    const created = data[0];

    return created ? { result: 'success', data: created } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};

type FlatTraining = (training: Training) => Payload;
type Payload = {
  sessions: Session[];
  sets: Set[];
};
type Session = {
  id: string;
  memo: string;
  order: number;
  trainingId: string;
  exerciseId: string;
};
type Set = {
  id: string;
  weight: number;
  repetition: number;
  rpe: number;
  order: number;
  estimatedMaximumWeight: number;
  recordId: string;
};
const flatTraining: FlatTraining = (training) => {
  return training.sessions.reduce<Payload>((accumulator, session, index) => {
    const sessionData = {
      id: createId(),
      memo: session.memo,
      order: index,
      trainingId: training.id,
      exerciseId: session.exercise.id,
    };
    const setData = session.sets.map((set, index) => ({
      id: createId(),
      weight: set.weight,
      repetition: set.reps,
      rpe: set.rpe,
      order: index,
      estimatedMaximumWeight: getEstimatedMaximumWeight({ weight: set.weight, repetition: set.reps }),
      recordId: sessionData.id,
    }));

    return {
      sessions: [...accumulator.sessions, sessionData],
      sets: [...accumulator.sets, ...setData],
    };
  }, { sessions: [], sets: [] });
};
