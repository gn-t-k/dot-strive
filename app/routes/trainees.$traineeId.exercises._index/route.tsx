import { json } from '@remix-run/cloudflare';
import { useActionData, useLoaderData } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { useEffect } from 'react';

import { getExercisesByTraineeId } from 'app/features/exercise/get-exercises-by-trainee-id';
import { getMusclesByTraineeId } from 'app/features/muscle/get-muscles-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { getInstance } from 'database/get-instance';

import { ExerciseForm, getExerciseFormSchema } from './exercise-form';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());
  const database = getInstance(context);
  const [muscles, exercises] = await Promise.all([
    getMusclesByTraineeId(database)(trainee.id),
    getExercisesByTraineeId(database)(trainee.id),
  ]);

  return json({ muscles, exercises });
};

const Page: FC = () => {
  const { muscles, exercises } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    console.log({ actionData });
  }, [actionData]);

  return (
    <Main>
      <Section>
        <ul>
          {exercises.map(exercise => (<li key={exercise.id}>{exercise.name}</li>))}
        </ul>
        <ExerciseForm
          registeredMuscles={muscles}
          registeredExercises={exercises}
          actionType="create"
        />
      </Section>
    </Main>
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const database = getInstance(context);
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());

  const [muscles, exercises, formData] = await Promise.all([
    getMusclesByTraineeId(database)(trainee.id),
    getExercisesByTraineeId(database)(trainee.id),
    request.formData(),
  ]);

  const submission = parseWithValibot(formData, {
    schema: getExerciseFormSchema(muscles, exercises),
  });

  return json({
    action: formData.get('actionType'),
    success: true,
    submission: submission.reply(),
  });
};
