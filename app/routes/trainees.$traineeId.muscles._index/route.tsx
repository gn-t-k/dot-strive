import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { validateMuscle } from 'app/features/muscle';
import { MuscleForm, validateForm } from 'app/features/muscle/muscle-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'app/ui/alert-dialog';
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

  const [editing, setEditing] = useState<MuscleId>('');
  type MuscleId = string;

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
                  <AlertDialog>
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
                            <AlertDialogTrigger className="flex">
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </AlertDialogTrigger>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <CardHeader>
                      {
                        editing === muscle.id ? (
                          <div className="flex items-end space-x-2">
                            <MuscleForm
                              actionType="update"
                              defaultValues={{ id: muscle.id, name: muscle.name }}
                              onSubmit={() => setEditing('')}
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
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>部位の削除</AlertDialogTitle>
                        <AlertDialogDescription>部位を削除しますか？</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <Form method="post">
                          <input
                            type="hidden"
                            name="id"
                            value={muscle.id}
                          />
                          <input
                            type="hidden"
                            name="name"
                            value={muscle.name}
                          />
                          <AlertDialogAction type="submit" name="actionType" value="delete">
                            削除
                          </AlertDialogAction>
                        </Form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
            <MuscleForm actionType="create" />
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
  const formData = await request.formData();
  const { id, name, actionType } = validateForm(formData);
  console.log({ id, name, actionType });
  if (!id.success || !name.success || !actionType.success) {
    return {
      errorMessage: {
        id: id.success ? [] : id.errorMessages,
        name: name.success ? [] : name.errorMessages,
        actionType: actionType.success ? [] : actionType.errorMessages,
      },
    };
  }

  const env = context['env'] as Env;
  const database = drizzle(env.DB);

  const traineeId = params['traineeId'];
  if (!traineeId) {
    console.log({ traineeId });
    throw new Response('Bad Request', { status: 400 });
  }

  switch (actionType.value) {
    case 'create': {
      await database
        .insert(musclesSchema)
        .values({
          id: id.value,
          name: name.value,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      break;
    }
    case 'update': {
      await database
        .update(musclesSchema)
        .set({
          name: name.value,
          updatedAt: new Date(),
        })
        .where(eq(musclesSchema.id, id.value));
      break;
    }
    case 'delete': {
      const returning = await database
        .delete(musclesSchema)
        .where(eq(musclesSchema.id, id.value))
        .returning();
      console.log({ returning });
      break;
    }
  }
  
  return redirect(`/trainees/${traineeId}/muscles`);
};
