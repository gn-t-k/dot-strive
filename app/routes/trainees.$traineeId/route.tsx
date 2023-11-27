import { json, redirect } from '@remix-run/cloudflare';
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { brandTrainee } from 'app/features/trainee';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'app/ui/tabs';

import { HeaderNavigation } from './header-navigation';

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
  const { trainee } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const location = pathname.split('/')[3];

  return (
    <>
      <header className="sticky top-0">
        <HeaderNavigation trainee={trainee} />
      </header>
      {
        location ? (
          <Tabs defaultValue={location}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trainings" asChild>
                <Link to={`/trainees/${trainee.id}/trainings`} className="w-full">
                  トレーニング
                </Link>
              </TabsTrigger>
              <TabsTrigger value="exercises" asChild>
                <Link to={`/trainees/${trainee.id}/exercises`} className="w-full">
                  種目
                </Link>
              </TabsTrigger>
              <TabsTrigger value="muscles" asChild>
                <Link to={`/trainees/${trainee.id}/muscles`} className="w-full">
                  部位
                </Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={location}>
              <Outlet />
            </TabsContent>
          </Tabs>
        ) : (
          <Outlet />
        )
      }
    </>
  );
};
export default PageWithNavigationHeader;
