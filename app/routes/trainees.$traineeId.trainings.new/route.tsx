import { json } from '@remix-run/cloudflare';
import { useActionData, useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import { parseFormData } from 'parse-nested-form-data';
import { useEffect } from 'react';

import { getExercisesByTraineeId } from 'app/features/exercise/get-exercises-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { getInstance } from 'database/get-instance';

import { TrainingForm } from './training-form';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());
  const database = getInstance(context);
  const registeredExercises = await getExercisesByTraineeId(database)(trainee.id);

  return json({ registeredExercises });
};

const Page: FC = () => {
  const { registeredExercises } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    console.log({ actionData, registeredExercises });
  }, [actionData, registeredExercises]);

  return (
    <TrainingForm
      actionType="create"
      registeredExercises={registeredExercises}
      defaultValues={{
        date: format(new Date(), 'yyyy-MM-dd'),
        records: [
          {
            exerciseId: '',
            memo: '',
            sets: [
              { weight: '', reps: '' },
            ],
          },
        ],
      }}
    />
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const result = parseFormData(formData);

  return json({ result });
};
