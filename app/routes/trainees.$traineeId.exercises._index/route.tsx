import { json, redirect } from '@remix-run/cloudflare';
import { useActionData, useLoaderData } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { useEffect } from 'react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { getExercisesByTraineeId } from 'app/features/exercise/get-exercises-by-trainee-id';
import { getMusclesByTraineeId } from 'app/features/muscle/get-muscles-by-trainee-id';
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
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  if(!user) {
    return redirect('/login');
  }

  if (params['traineeId'] !== user.id) {
    throw new Response('Not found.', { status: 404 });
  }

  const database = getInstance(context);
  const [muscles, exercises] = await Promise.all([
    getMusclesByTraineeId(database)(params['traineeId']),
    getExercisesByTraineeId(database)(params['traineeId']),
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
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect('/login');
  }

  const traineeId = params['traineeId'];
  if (traineeId !== user.id) {
    throw new Response('Bad Request1', { status: 400 });
  }

  const [muscles, exercises] = await Promise.all([
    getMusclesByTraineeId(database)(traineeId),
    getExercisesByTraineeId(database)(traineeId),
  ]);

  const formData = await request.formData();
  const submission = parseWithValibot(formData, {
    schema: getExerciseFormSchema(muscles, exercises),
  });

  return json({
    action: formData.get('actionType'),
    success: true,
    submission: submission.reply(),
  });
};
