import { redirect } from '@remix-run/cloudflare';

import { getAuthenticator } from 'app/services/auth.server';

import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export const loader = () => redirect('/login');

export const action = ({ request, context }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context);

  return authenticator.logout(request, {
    redirectTo: '/login',
  });
};