import { getAuthenticator } from 'app/features/auth/get-authenticator.server';

import type { LoaderFunction } from '@remix-run/cloudflare';

export const loader: LoaderFunction = ({ request, context }) => {
  const authenticator = getAuthenticator(context);

  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
};
