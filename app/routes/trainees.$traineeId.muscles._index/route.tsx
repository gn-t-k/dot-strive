import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { validateMuscle } from 'app/features/muscle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'app/ui/card';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { muscles as musclesSchema } from 'database/tables/muscles';

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
    throw new Response('Not found.', { status: 404 });
  }

  const env = context['env'] as Env;
  const database = drizzle(env.DB);
  
  const data = await database
    .select()
    .from(musclesSchema)
    .where(eq(musclesSchema.traineeId, params['traineeId']));
  const muscles = data.flatMap(datum => {
    const result = validateMuscle(datum);

    return result ? [result] : [];
  });

  return json({ muscles });
};

const Page: FC = () => {
  const { muscles } = useLoaderData<typeof loader>();

  return (
    <Main>
      <Section>
        {
          muscles.length === 0 ?
            (
              <Card>
                <CardHeader>
                  <CardTitle>部位を登録しましょう</CardTitle>
                  <CardDescription>まだ部位が登録されていません。.STRIVEでは、各種目に割り当てる部位に名前をつけて管理することができます。</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form
                    method="post"
                    action="upsert"
                    navigate={false}
                  >
                    <label>
                      名前
                      <input type="text" name="name" />
                    </label>
                    <button type="submit">登録</button>
                  </Form>
                </CardContent>
              </Card>
            ) :
            (
              <ul>
                {muscles.map(muscle => {
                  return (
                    <li key={muscle.id}>{muscle.name}</li>
                  );
                })}
              </ul>
            )
        }
      </Section>
    </Main>
  );
};
export default Page;
