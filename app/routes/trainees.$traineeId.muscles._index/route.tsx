import { createId } from '@paralleldrive/cuid2';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { getMusclesByTraineeId } from 'app/features/muscle/get-muscles-by-trainee-id';
import { MuscleForm, getMuscleFormSchema } from 'app/features/muscle/muscle-form';
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
  const muscles = await getMusclesByTraineeId(database)(params['traineeId']);

  return json({ muscles });
};

const Page: FC = () => {
  const { muscles } = useLoaderData<typeof loader>();
  const [searchParameters, setSearchParameters] = useSearchParams();

  const editing = searchParameters.get('editing');

  type OnClickEdit = (id: string) => MouseEventHandler;
  const onClickEdit = useCallback<OnClickEdit>((id) => (_) => {
    const parameters = new URLSearchParams();
    parameters.set('editing', id);
    setSearchParameters(parameters, { preventScrollReset: true });
  }, [setSearchParameters]);
  const onClickCancel = useCallback<MouseEventHandler>((_) => {
    const parameters = new URLSearchParams();
    parameters.delete('editing');
    setSearchParameters(parameters, { preventScrollReset: true });
  }, [setSearchParameters]);

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
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={onClickEdit(muscle.id)}>
                            <Edit className="mr-2 size-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertDialogTrigger className="flex w-full">
                              <Trash2 className="mr-2 size-4" />
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
                              registeredMuscles={muscles}
                              actionType="update"
                              defaultValues={{ id: muscle.id, name: muscle.name }}
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
            <MuscleForm
              key={Math.random().toString()}
              registeredMuscles={muscles}
              actionType="create"
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
  const env = context['env'] as Env;
  const database = drizzle(env.DB);
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect('/login');
  }

  if (params['traineeId'] !== user.id) {
    throw new Response('Bad Request1', { status: 400 });
  }
  const traineeId = params['traineeId'];

  const formData = await request.formData();

  switch (formData.get('actionType')) {
    case 'create': {
      const muscles = await getMusclesByTraineeId(database)(traineeId);
      const submission = parseWithValibot(formData, {
        schema: getMuscleFormSchema(muscles),
      });
      if (submission.status !== 'success') {
        return json({
          success: false,
          submission: submission.reply(),
        });
      }

      await database
        .insert(musclesSchema)
        .values({
          id: createId(),
          name: submission.value.name,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      return {
        success: true,
        submission: submission.reply(),
      };
    }

    case 'update': {
      const muscleId = formData.get('id')?.toString();
      if (!muscleId) {
        throw new Response('Bad Request2', { status: 400 });
      }

      const muscles = await getMusclesByTraineeId(database)(traineeId);

      const submission = parseWithValibot(formData, {
        schema: getMuscleFormSchema(muscles),
      });
      if (submission.status !== 'success') {
        return json({
          success: false,
          submission: submission.reply(),
        });
      }

      await database
        .update(musclesSchema)
        .set({
          name: submission.value.name,
          updatedAt: new Date(),
        })
        .where(eq(musclesSchema.id, muscleId));

      return {
        success: true,
        submission: submission.reply(),
      };
    }

    case 'delete': {
      const muscleId = formData.get('id')?.toString();
      if (!muscleId) {
        throw new Response('Bad Request', { status: 400 });
      }

      await database
        .delete(musclesSchema)
        .where(eq(musclesSchema.id, muscleId));

      return {
        success: true,
      };
    }

    default: {
      throw new Response('Bad Request3', { status: 400 });
    }
  }
};
