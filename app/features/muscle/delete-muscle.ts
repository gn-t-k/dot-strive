import { eq } from 'drizzle-orm';

import { muscles as musclesSchema } from 'database/tables/muscles';

import { validateMuscle } from '.';

import type { Muscle } from '.';
import type { Database } from 'database/get-instance';

type DeleteMuscle = (database: Database) => (props: { id: Muscle['id'] }) => Promise<
| { result: 'success'; data: Muscle }
| { result: 'failure' }
>;
export const deleteMuscle: DeleteMuscle = (database) => async ({ id }) => {
  try {
    const data = await database
      .delete(musclesSchema)
      .where(eq(musclesSchema.id, id))
      .returning();
    const muscle = validateMuscle(data[0]);

    return muscle ? { result: 'success', data: muscle } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
