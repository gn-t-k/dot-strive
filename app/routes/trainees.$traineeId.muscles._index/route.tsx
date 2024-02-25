import { defer, json, redirect } from '@remix-run/cloudflare';
import { Await, Form, useActionData, useLoaderData, useSearchParams } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { Edit, MoreHorizontal, Trash2, X } from 'lucide-react';
import { Suspense, useCallback, useEffect } from 'react';

import { getAuthenticator } from 'app/features/auth/get-authenticator.server';
import { createMuscle } from 'app/features/muscle/create-muscle';
import { deleteMuscle } from 'app/features/muscle/delete-muscle';
import { getMusclesByTraineeId } from 'app/features/muscle/get-muscles-by-trainee-id';
import { MuscleForm, getMuscleFormSchema } from 'app/features/muscle/muscle-form';
import { updateMuscle } from 'app/features/muscle/update-muscle';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'app/ui/alert-dialog';
import { Button } from 'app/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from 'app/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'app/ui/dropdown-menu';
import { Heading } from 'app/ui/heading';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { useToast } from 'app/ui/use-toast';
import { getInstance } from 'database/get-instance';

import { MuscleListSkeleton } from './muscle-list-skeleton';

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

  const database = getInstance(context);
  const muscles = getMusclesByTraineeId(database)(params['traineeId']);

  return defer({ muscles });
};

const Page: FC = () => {
  const { muscles } = useLoaderData<typeof loader>();
  const [searchParameters, setSearchParameters] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) {
      // TODO: エラーハンドリング
      return;
    }

    if (actionData.success) {
      switch (actionData.action) {
        case 'create': {
          toast({ title: '部位を登録しました' });
          break;
        }
        case 'update': {
          searchParameters.delete('editing');
          setSearchParameters(searchParameters, { preventScrollReset: true });
          toast({ title: '部位を更新しました' });
          break;
        }
        case 'delete': {
          toast({ title: '部位を削除しました' });
          break;
        }
      }
    } else {
      switch (actionData.action) {
        case 'create': {
          toast({ title: '部位の登録に失敗しました', variant: 'destructive' });
          break;
        }
        case 'update': {
          toast({ title: '部位の更新に失敗しました', variant: 'destructive' });
          break;
        }
        case 'delete': {
          toast({ title: '部位の削除に失敗しました', variant: 'destructive' });
          break;
        }
      }
    }
  }, [actionData, searchParameters, setSearchParameters, toast]);

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
      <Suspense fallback={<MuscleListSkeleton />}>
        <Await resolve={muscles}>
          {(muscles) => (
            <Section>
              <ul className="inline-flex flex-col justify-start gap-4">
                {muscles.map(muscle => {
                  return (
                    <li key={muscle.id}>
                      <Card className="relative">
                        <AlertDialog>
                          <CardHeader className="flex w-full space-x-2">
                            <div className="grow">
                              {
                                editing === muscle.id ? (
                                  <MuscleForm
                                    registeredMuscles={muscles}
                                    actionType="update"
                                    defaultValues={{ id: muscle.id, name: muscle.name }}
                                  />
                                ) :
                                  <Heading level={2} className="break-all">{muscle.name}</Heading>
                              }
                            </div>
                            <div className="flex-none">
                              <DropdownMenu>
                                {
                                  editing === muscle.id
                                    ? (
                                      <Button onClick={onClickCancel} size="icon" variant="ghost">
                                        <X className="size-4" onClick={onClickCancel} />
                                      </Button>
                                    )
                                    : (
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                          <MoreHorizontal className="size-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                    )
                                }
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
                            </div>
                          </CardHeader>
                          {/* <CardContent>
                            <Heading level={3} size="sm">今週のセット数</Heading>
                            <p>coming soon</p>
                          </CardContent> */}
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
          )}
        </Await>
      </Suspense>
    </Main>
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const database = getInstance(context);
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect('/login');
  }

  const traineeId = params['traineeId'];
  if (traineeId !== user.id) {
    throw new Response('Bad Request1', { status: 400 });
  }

  const formData = await request.formData();

  switch (formData.get('actionType')) {
    case 'create': {
      const muscles = await getMusclesByTraineeId(database)(traineeId);
      const submission = parseWithValibot(formData, {
        schema: getMuscleFormSchema(muscles),
      });
      if (submission.status !== 'success') {
        return json({
          action: 'create',
          success: false,
          submission: submission.reply(),
        });
      }

      const createResult = await createMuscle(database)({
        name: submission.value.name,
        traineeId,
      });
      if (createResult.result === 'failure') {
        return json({
          action: 'create',
          success: false,
        });
      }

      return json({
        action: 'create',
        success: true,
        submission: submission.reply(),
      });
    }

    case 'update': {
      const muscleId = formData.get('id')?.toString();
      if (!muscleId) {
        return json({
          action: 'update',
          success: false,
        });
      }

      const muscles = await getMusclesByTraineeId(database)(traineeId);

      const submission = parseWithValibot(formData, {
        schema: getMuscleFormSchema(muscles),
      });
      if (submission.status !== 'success') {
        return json({
          action: 'update',
          success: false,
          submission: submission.reply(),
        });
      }

      const updateResult = await updateMuscle(database)({
        id: muscleId,
        name: submission.value.name,
      });
      if (updateResult.result === 'failure') {
        return json({
          action: 'update',
          success: false,
        });
      }

      return json({
        action: 'update',
        success: true,
        submission: submission.reply(),
      });
    }

    case 'delete': {
      const muscleId = formData.get('id')?.toString();
      if (!muscleId) {
        return json({
          action: 'delete',
          success: false,
        });
      }

      const deleteResult = await deleteMuscle(database)({ id: muscleId });
      if (deleteResult.result === 'failure') {
        return json({
          action: 'delete',
          success: false,
        });
      }

      return json({
        action: 'delete',
        success: true,
      });
    }

    default: {
      throw new Response('Bad Request', { status: 400 });
    }
  }
};
