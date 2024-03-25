import { createId } from '@paralleldrive/cuid2';
import { json } from '@remix-run/cloudflare';
import { useActionData, useLoaderData } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { useEffect } from 'react';

import { getExercisesByTraineeId } from 'app/features/exercise/get-exercises-by-trainee-id';
import { getExercisesWithTargetsByTraineeId } from 'app/features/exercise/get-exercises-with-targets-by-trainee-id';
import { validateExercise } from 'app/features/exercise/schema';
import { validateTraining } from 'app/features/training/schema';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { getInstance } from 'database/get-instance';

import { TrainingForm, getTrainingFormSchema } from './training-form';

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
    console.log({ actionData });
  }, [actionData]);

  return (
    <TrainingForm
      actionType="create"
      registeredExercises={registeredExercises}
    />
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const database = getInstance(context);
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }).then(response => response.json()),
    request.formData(),
  ]);

  switch (formData.get('actionType')) {
    case 'create': {
      const registeredExercises = await getExercisesWithTargetsByTraineeId(database)(trainee.id);
      const submission = parseWithValibot(formData, {
        schema: getTrainingFormSchema(registeredExercises),
      });
      if (submission.status !== 'success') {
        return json({
          action: 'create',
          success: false,
          description: 'form validation failed',
          submission: submission.reply(),
        });
      }

      const training = validateTraining({
        id: createId(),
        date: submission.value.date,
        sessions: submission.value.sessions.flatMap(session => {
          const exercise = validateExercise(registeredExercises.find((registeredExercise => registeredExercise.id === session.exerciseId)));
          if (!exercise) {
            return [];
          }

          return [{
            exercise,
            memo: session.memo,
            sets: session.sets,
          }];
        }),
      });
      if (!training) {
        return json({
          action: 'create',
          success: false,
          description: 'domain validation failed',
        });
      }

      return json({
        action: 'create',
        success: true,
        description: 'success',
      });
    }
    case 'update':
    case 'delete':
    default: {
      throw new Response('Bad Request', { status: 400 });
    }
  }
};
