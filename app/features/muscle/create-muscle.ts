import { muscles as musclesSchema } from 'database/tables/muscles';

import type { Muscle } from './schema';
import type { Database } from 'database/get-instance';

type CreateMuscle = (database: Database) => (props: {
  muscle: Muscle;
  traineeId: string;
}) => Promise<
| { result: 'success'; data: { id: string; name: string } }
| { result: 'failure' }
>;
export const createMuscle: CreateMuscle = (database) => async ({ muscle, traineeId }) => {
  try {
    const data = await database
      .insert(musclesSchema)
      .values({
        id: muscle.id,
        name: muscle.name,
        traineeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: musclesSchema.id, name: musclesSchema.name });

    const created = data[0];

    return created ? { result: 'success', data: created } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
