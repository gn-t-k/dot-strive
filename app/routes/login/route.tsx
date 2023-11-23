import { json, redirect } from '@remix-run/cloudflare';
import { Form } from '@remix-run/react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { Button } from 'app/ui/button';

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
      <Button>login with google</Button>
    </Form>
  );
};
export default Page;
