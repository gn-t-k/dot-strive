import { createId } from '@paralleldrive/cuid2';

import { muscles as musclesSchema } from 'database/tables/muscles';

import { validateMuscle } from '.';

import type { Muscle } from '.';
import type { Trainee } from '../trainee';
import type { Database } from 'database/get-instance';

type CreateMuscle = (database: Database) => (props: {
  name: Muscle['name'];
  traineeId: Trainee['id'];
}) => Promise<
| {
  result: 'success';
  data: Muscle;
}
| {
  result: 'failure';
}
>;
export const createMuscle: CreateMuscle = (database) => async ({ name, traineeId }) => {
  try {
    const data = await database
      .insert(musclesSchema)
      .values({
        id: createId(),
        name,
        traineeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    const muscle = validateMuscle(data[0]);

    return muscle ? { result: 'success', data: muscle } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
