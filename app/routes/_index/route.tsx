import { redirect } from '@remix-run/cloudflare';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const trainee = await authenticator.isAuthenticated(request);

  if (!trainee) {
    return redirect('/login');
  }

  return redirect (`/trainees/${trainee.id}`);
};
