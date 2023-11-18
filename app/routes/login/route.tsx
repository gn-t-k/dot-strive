import { json, redirect } from '@remix-run/cloudflare';
import { Form } from '@remix-run/react';

import { getAuthenticator } from 'app/services/auth.server';

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  return user ? redirect('/') : json({});
};

const Page: FC = () => {
  return (
    <Form method="POST" action="/auth/google">
      <button>login with google</button>
    </Form>
  );
};
export default Page;
