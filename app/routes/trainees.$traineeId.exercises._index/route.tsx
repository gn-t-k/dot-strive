import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

import { createExercise } from 'app/features/exercise/create-exercise';
import { getExercisesByTraineeId } from 'app/features/exercise/get-exercises-by-trainee-id';
import { getExercisesWithTargetsByTraineeId } from 'app/features/exercise/get-exercises-with-targets-by-trainee-id';
import { getMusclesByTraineeId } from 'app/features/muscle/get-muscles-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'app/ui/alert-dialog';
import { Button } from 'app/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from 'app/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from 'app/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'app/ui/dropdown-menu';
import { Heading } from 'app/ui/heading';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { getInstance } from 'database/get-instance';

import { ExerciseForm, getExerciseFormSchema } from './exercise-form';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());
  const database = getInstance(context);
  const [muscles, exercisesWithTargets] = await Promise.all([
    getMusclesByTraineeId(database)(trainee.id),
    getExercisesWithTargetsByTraineeId(database)(trainee.id),
  ]);

  return json({ muscles, exercisesWithTargets });
};

const Page: FC = () => {
  const { muscles, exercisesWithTargets } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    console.log({ actionData });
  }, [actionData]);

  const exercises = exercisesWithTargets.map(data => data.exercise);

  return (
    <Main>
      <Section>
        <ul className="flex flex-col gap-4">
          {exercisesWithTargets.map(({ exercise, targets }) => {
            return (
              <li key={exercise.id}>
                <Card>
                  <CardHeader className="flex w-full space-x-2">
                    <div className="grow">
                      <Heading level={2}>{exercise.name}</Heading>
                      <CardDescription>{targets.map(target => target.name).join('、')}</CardDescription>
                    </div>
                    <div className="flex-none">
                      <Dialog>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <DialogTrigger className="flex w-full">
                                    <Edit className="mr-2 size-4" />
                                    編集
                                  </DialogTrigger>
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
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>種目の編集</DialogTitle>
                            </DialogHeader>
                            <ExerciseForm
                              registeredMuscles={muscles}
                              registeredExercises={exercises}
                              defaultValues={{ id: exercise.id, name: exercise.name, targets: targets.map(target => target.id) }}
                              actionType="update"
                            />
                            <DialogFooter>
                              <DialogClose>キャンセル</DialogClose>
                            </DialogFooter>
                          </DialogContent>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>種目の削除</AlertDialogTitle>
                              <AlertDialogDescription>種目を削除しますか？</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <Form method="post">
                                <input
                                  type="hidden"
                                  name="id"
                                  value={exercise.id}
                                />
                                <input
                                  type="hidden"
                                  name="name"
                                  value={exercise.name}
                                />
                                <AlertDialogAction type="submit" name="actionType" value="delete" className="w-full">
                                  削除
                                </AlertDialogAction>
                              </Form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Dialog>
                    </div>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
        <Card>
          <CardHeader>
            <Heading level={2}>種目を登録する</Heading>
            <CardDescription>.STRIVEでは、種目に名前と対象の部位を設定することが出来ます。</CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseForm
              registeredMuscles={muscles}
              registeredExercises={exercises}
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
  const database = getInstance(context);
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());

  const [registeredMuscles, registeredExercises, formData] = await Promise.all([
    getMusclesByTraineeId(database)(trainee.id),
    getExercisesByTraineeId(database)(trainee.id),
    request.formData(),
  ]);

  switch (formData.get('actionType')) {
    case 'create': {
      const submission = parseWithValibot(formData, {
        schema: getExerciseFormSchema({ registeredMuscles, registeredExercises, beforeName: null }),
      });
      if(submission.status !== 'success') {
        return json({
          action: 'create',
          success: false,
          submission: submission.reply(),
        });
      }

      const createResult = await createExercise(database)({
        name: submission.value.name,
        muscleIds: submission.value.targets,
        traineeId: trainee.id,
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
    default: {
      throw new Response('Bad Request', { status: 400 });
    }
  }
};
