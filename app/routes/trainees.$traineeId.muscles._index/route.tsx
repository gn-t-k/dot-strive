import { createId } from '@paralleldrive/cuid2';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { MoreHorizontal } from 'lucide-react';
import { validationError } from 'remix-validated-form';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { validateMuscle } from 'app/features/muscle';
import { UpsertMuscleForm, validator } from 'app/features/muscle/upsert-muscle-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'app/ui/card';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { muscles as musclesSchema } from 'database/tables/muscles';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
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
        <ul className="inline-flex flex-col justify-start gap-4">
          {muscles.map(muscle => {
            return (
              <li key={muscle.id} className="relative">
                {/* TODO: Popoverのボタンにする */}
                <div className="absolute right-4 top-4">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>{muscle.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* TODO: コンポーネント化 */}
                    <p className="scroll-m-20 text-xl font-semibold tracking-tight">今週のセット数</p>
                    <p>coming soon</p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
        <Card>
          <CardHeader>
            <CardTitle>部位を登録しましょう</CardTitle>
            <CardDescription>.STRIVEでは、各種目に割り当てる部位に名前をつけて管理することができます。</CardDescription>
          </CardHeader>
          <CardContent>
            <UpsertMuscleForm
              method="post"
              validator={validator}
              resetAfterSubmit
            />
          </CardContent>
        </Card>
      </Section>
    </Main>
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  // TODO: 作成の場合の処理しか書いてないので、更新の場合の処理も書く
  const result = await validator.validate(
    await request.formData(),
  );

  if (result.error) {
    return validationError(result.error);
  }

  const id = createId();
  const name = result.data.name;
  const traineeId = params['traineeId'];

  const muscle = validateMuscle({ id, name });
  if (!muscle || !traineeId) {
    // TODO: form側でのハンドリングについて調査
    return validationError({ fieldErrors: { muscle: '部位の登録に失敗しました' } });
  }

  const env = context['env'] as Env;
  const database = drizzle(env.DB);
  await database.insert(musclesSchema).values({
    ...muscle,
    traineeId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return json({ muscle });
};
