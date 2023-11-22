import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { Button } from 'app/ui/button';
import { H1 } from 'app/ui/h1';
import { H2 } from 'app/ui/h2';

import type { MetaFunction , LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect('/login');
  }

  return json({ user });
};

export const meta: MetaFunction = () => {
  return [
    { title: 'dot-strive' },
    { name: 'description', content: 'training' },
  ];
};

const Page: FC = () => {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main>
      <H1>Welcome! {user.name}</H1>
      <H2>部位</H2>
      <H2>種目</H2>
      <Form method="POST" action="/auth/logout">
        <Button>logout</Button>
      </Form>
    </main>
  );
};
export default Page;
