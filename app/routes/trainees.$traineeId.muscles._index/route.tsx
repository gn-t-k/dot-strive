import { createId } from '@paralleldrive/cuid2';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { validationError } from 'remix-validated-form';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { validateMuscle } from 'app/features/muscle';
import { MuscleForm, validator } from 'app/features/muscle/muscle-form';
import { Button } from 'app/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from 'app/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'app/ui/dropdown-menu';
import { Heading } from 'app/ui/heading';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { muscles as musclesSchema } from 'database/tables/muscles';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC , MouseEventHandler } from 'react';

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
    .where(eq(musclesSchema.traineeId, params['traineeId']))
    .orderBy(desc(musclesSchema.createdAt));
  const muscles = data.flatMap(datum => {
    const result = validateMuscle(datum);

    return result ? [result] : [];
  });

  return json({ muscles });
};

const Page: FC = () => {
  const { muscles } = useLoaderData<typeof loader>();
  const [editing, setEditing] = useState<string>('');

  type OnClickEdit = (id: string) => MouseEventHandler;
  const onClickEdit = useCallback<OnClickEdit>((id) => (_) => {
    setEditing(id);
  }, []);
  const onClickCancel = useCallback<MouseEventHandler>((_) => {
    setEditing('');
  }, []);

  return (
    <Main>
      <Section>
        <ul className="inline-flex flex-col justify-start gap-4">
          {muscles.map(muscle => {
            return (
              <li key={muscle.id}>
                <Card className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="absolute right-2 top-2" asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={onClickEdit(muscle.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CardHeader>
                    {
                      editing === muscle.id ? (
                        <div className="flex items-end space-x-2">
                          <MuscleForm
                            method="post"
                            actionType="update"
                            muscleId={muscle.id}
                            validator={validator}
                            defaultValues={{ name: muscle.name }}
                            className="grow"
                          />
                          <Button
                            onClick={onClickCancel}
                            variant="secondary"
                            className="grow-0"
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) :
                        <Heading level={2}>{muscle.name}</Heading>
                    }
                  </CardHeader>
                  <CardContent>
                    <Heading level={3} size="sm">今週のセット数</Heading>
                    <p>coming soon</p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
        <Card>
          <CardHeader>
            <div className="inline-flex justify-between">
              <Heading level={2}>部位を登録する</Heading>
            </div>
            <CardDescription>.STRIVEでは、各種目に割り当てる部位に名前をつけて管理することができます。</CardDescription>
          </CardHeader>
          <CardContent>
            <MuscleForm
              method="post"
              actionType="create"
              muscleId="new"
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
  const result = await validator.validate(
    await request.formData(),
  );

  if (result.error) {
    return validationError(result.error);
  }

  const env = context['env'] as Env;
  const database = drizzle(env.DB);

  const traineeId = params['traineeId'];
  if (!traineeId) {
    // TODO: form側でのハンドリングについて調査
    return validationError({ fieldErrors: { muscle: '部位の登録に失敗しました' } });
  }

  switch (result.data.actionType) {
    case 'create': {
      const id = createId();
      const name = result.data.name;
    
      const muscle = validateMuscle({ id, name });
      if (!muscle) {
        // TODO: form側でのハンドリングについて調査
        return validationError({ fieldErrors: { muscle: '部位の登録に失敗しました' } });
      }

      await database
        .insert(musclesSchema)
        .values({
          ...muscle,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      return json({ muscle });
    }
    case 'update': {
      const id = result.data.muscleId;
      const name = result.data.name;

      const muscle = validateMuscle({ id, name });
      if (!muscle) {
        // TODO: form側でのハンドリングについて調査
        return validationError({ fieldErrors: { muscle: '部位の登録に失敗しました' } });
      }
      console.log({ id });

      await database
        .update(musclesSchema)
        .set({
          ...muscle,
          updatedAt: new Date(),
        })
        .where(eq(musclesSchema.id, id));

      return json({ muscle });
    }
  }

};
