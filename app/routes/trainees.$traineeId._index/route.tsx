import { Form, useRouteLoaderData } from '@remix-run/react';

import { Button } from 'app/ui/button';

import { TraineeInfo } from './trainee-info';

import type { loader } from '../trainees.$traineeId/route';
import type { FC } from 'react';

const Page: FC = () => {
  const data = useRouteLoaderData<typeof loader>('routes/trainees.$traineeId');
  if (!data) return null; // TODO: いいかんじにする
  const { trainee } = data;

  return (
    <main>
      <section className="mt-4 inline-flex w-full flex-col items-center justify-start gap-4">
        <TraineeInfo trainee={trainee} />
        <Form method="POST" action="/auth/logout">
          <Button>logout</Button>
        </Form>
      </section>
    </main>
  );
};
export default Page;
