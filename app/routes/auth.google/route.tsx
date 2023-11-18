import { redirect } from '@remix-run/cloudflare';

import { getAuthenticator } from 'app/services/auth.server';

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = ({ request, context }) => {
  const authenticator = getAuthenticator(context);

  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
};
