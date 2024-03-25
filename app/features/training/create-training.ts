import { trainingRecords } from 'database/tables/training-records';
import { trainings } from 'database/tables/trainings';

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
        .insert(trainingRecords),
    ]);
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
