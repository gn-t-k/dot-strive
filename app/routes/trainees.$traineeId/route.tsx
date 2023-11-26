import { json, redirect } from '@remix-run/cloudflare';
import { Outlet } from '@remix-run/react';
import { CircleUserRound } from 'lucide-react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { brandTrainee } from 'app/features/trainee';

import { Logotype } from '../../ui/logotype';

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

const PageWithNavigationHeader: FC = () => {
  return (
    <>
      <header className="sticky top-0">
        <nav className="inline-flex w-full items-center justify-between bg-white py-2 pl-4 pr-1">
          <Logotype />
          <div className="p-2">
            <CircleUserRound size="20px" />
          </div>
        </nav>
      </header>
      <Outlet />
    </>
  );
};
export default PageWithNavigationHeader;
