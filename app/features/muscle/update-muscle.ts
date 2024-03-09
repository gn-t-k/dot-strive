import { eq } from 'drizzle-orm';

import { muscles as musclesSchema } from 'database/tables/muscles';

import { validateMuscle } from './schema';

import type { Muscle } from './schema';
import type { Database } from 'database/get-instance';

type UpdateMuscle = (database: Database) => (props: {
  id: Muscle['id'];
  name: Muscle['name'];
}) => Promise<
| {
  result: 'success';
  data: Muscle;
}
| {
  result: 'failure';
}
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
    const muscle = validateMuscle(data[0]);

    return muscle ? { result: 'success', data: muscle } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
