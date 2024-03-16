import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';

import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());

  return json({ trainee });
};

const Page: FC = () => {
  const { trainee } = useLoaderData<typeof loader>();

  return (
    <Main>
      <Section>
        <h1>トレーニング一覧</h1>
        <Link to={`/trainees/${trainee.id}/trainings/new`}>トレーニングを登録する</Link>
      </Section>
    </Main>
  );
};
export default Page;
