import { getAuthenticator } from 'app/services/auth.server';

import type { LoaderFunction } from '@remix-run/cloudflare';

export const loader: LoaderFunction = ({ request, context }) => {
  const authenticator = getAuthenticator(context);

  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
};
