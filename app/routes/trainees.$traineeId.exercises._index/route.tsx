import { json } from '@remix-run/cloudflare';
import { useActionData, useLoaderData } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { useEffect } from 'react';

import { createExercise } from 'app/features/exercise/create-exercise';
import { getExercisesByTraineeId } from 'app/features/exercise/get-exercises-by-trainee-id';
import { getExercisesWithTargetsByTraineeId } from 'app/features/exercise/get-exercises-with-targets-by-trainee-id';
import { getMusclesByTraineeId } from 'app/features/muscle/get-muscles-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { Card, CardContent, CardDescription, CardHeader } from 'app/ui/card';
import { Heading } from 'app/ui/heading';
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
  const [muscles, exercisesWithTargets] = await Promise.all([
    getMusclesByTraineeId(database)(trainee.id),
    getExercisesWithTargetsByTraineeId(database)(trainee.id),
  ]);

  return json({ muscles, exercisesWithTargets });
};

const Page: FC = () => {
  const { muscles, exercisesWithTargets } = useLoaderData<typeof loader>();
  const exercises = exercisesWithTargets.map(data => data.exercise);
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    console.log({ actionData });
  }, [actionData]);

  return (
    <Main>
      <Section>
        <ul>
          {JSON.stringify(exercisesWithTargets)}
        </ul>
        <Card>
          <CardHeader>
            <Heading level={2}>種目を登録する</Heading>
            <CardDescription>.STRIVEでは、種目に名前と対象の部位を設定することが出来ます。</CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseForm
              registeredMuscles={muscles}
              registeredExercises={exercises}
              actionType="create"
            />
          </CardContent>
        </Card>
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

  switch (formData.get('actionType')) {
    case 'create': {
      const submission = parseWithValibot(formData, {
        schema: getExerciseFormSchema(muscles, exercises),
      });
      if(submission.status !== 'success') {
        return json({
          action: 'create',
          success: false,
          submission: submission.reply(),
        });
      }

      const createResult = await createExercise(database)({
        name: submission.value.name,
        muscleIds: submission.value.targets,
        traineeId: trainee.id,
      });
      if (createResult.result === 'failure') {
        return json({
          action: 'create',
          success: false,
        });
      }

      return json({
        action: 'create',
        success: true,
        submission: submission.reply(),
      });
    }
    default: {
      throw new Response('Bad Request', { status: 400 });
    }
  }
};
