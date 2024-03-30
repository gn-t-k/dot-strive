import { eq, inArray } from 'drizzle-orm';

import { trainingRecords } from 'database/tables/training-records';
import { trainingSets } from 'database/tables/training-sets';
import { trainings } from 'database/tables/trainings';

import type { Database } from 'database/get-instance';

type DeleteTraining = (database: Database) => (props: { id: string }) => Promise<
| { result: 'success'; data: { id: string; date: Date } }
| { result: 'failure' }
>;
export const deleteTraining: DeleteTraining = (database) => async ({ id }) => {
  try {
    const recordIds = await database
      .select({ id: trainingRecords.id })
      .from(trainingRecords)
      .where(eq(trainingRecords.trainingId, id));

    const [_sets, _records, [deleted]] = await database.batch([
      database
        .delete(trainingSets)
        .where(inArray(
          trainingSets.recordId,
          recordIds.map(({ id }) => id),
        )),
      database
        .delete(trainingRecords)
        .where(eq(trainingRecords.trainingId, id)),
      database
        .delete(trainings)
        .where(eq(trainings.id, id))
        .returning({ id: trainings.id, date: trainings.date }),
    ]);

    return deleted ? { result: 'success', data: deleted } : { result: 'failure' };
  } catch (error) {
    console.log({ error });
    return { result: 'failure' };
  }
};
