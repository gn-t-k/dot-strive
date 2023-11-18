import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';

import { getAuthenticator } from 'app/services/auth.server';

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
      <p>{JSON.stringify(user)}</p>
      <Form method="POST" action="/auth/logout">
        <button>logout</button>
      </Form>
    </main>
  );
};
export default Page;
