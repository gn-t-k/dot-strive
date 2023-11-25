import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { brandTrainee } from 'app/features/trainee';
import { Button } from 'app/ui/button';

import { TraineeInfo } from './trainee-info';

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect('/login');
  }

  if (params['traineeId'] !== user.id) {
    return redirect(`/trainees/${user.id}`);
  }
  const trainee = brandTrainee(user);

  return json({ trainee });
};

const Page: FC = () => {
  const { trainee } = useLoaderData<typeof loader>();

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
