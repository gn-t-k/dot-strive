import { eq } from 'drizzle-orm';

import { muscles as musclesSchema } from 'database/tables/muscles';

import type { Muscle } from './schema';
import type { Database } from 'database/get-instance';

type UpdateMuscle = (database: Database) => (props: Muscle) => Promise<
| { result: 'success'; data: { id: string; name: string } }
| { result: 'failure' }
>;
export const updateMuscle: UpdateMuscle = (database) => async ({ id, name }) => {
  try {
    const data = await database
      .update(musclesSchema)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(musclesSchema.id, id))
      .returning({ id: musclesSchema.id, name: musclesSchema.name });

    const updated = data[0];

    return updated ? { result: 'success', data: updated } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
