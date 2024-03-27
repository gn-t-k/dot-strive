import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';

import { getTrainingsByTraineeId } from 'app/features/training/get-trainings-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { getInstance } from 'database/get-instance';

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());
  const database = getInstance(context);
  const trainings = await getTrainingsByTraineeId(database)(trainee.id);

  return json({ trainee, trainings });
};

const Page: FC = () => {
  const { trainee, trainings } = useLoaderData<typeof loader>();

  return (
    <Main>
      <Section>
        <h1>トレーニング一覧</h1>
        <ol>
          {trainings.map(training => {
            return (
              <li key={training.id}>
                <p>{training.date}</p>
                <ol>
                  {training.sessions.map(session => {
                    return (
                      <li key={session.id}>
                        <p>{session.exercise.name}</p>
                        <ol>
                          {session.sets.map(set => {
                            return (
                              <li key={set.id}>
                                <p>{set.weight} kg</p>
                                <p>{set.repetition} 回</p>
                                <p>{set.rpe === 0 ? 'RPE 未入力' : `RPE ${set.rpe}`}</p>
                                <p>推定1RM: {set.estimatedMaximumWeight} kg</p>
                              </li>
                            );
                          })}
                        </ol>
                        <p>{session.memo}</p>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>
        <Link to={`/trainees/${trainee.id}/trainings/new`}>トレーニングを登録する</Link>
      </Section>
    </Main>
  );
};
export default Page;
