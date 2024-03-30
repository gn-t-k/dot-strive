import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { format, parseISO } from 'date-fns';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

import { deleteTraining } from 'app/features/training/delete-training';
import { getTrainingsByTraineeId } from 'app/features/training/get-trainings-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from 'app/ui/alert-dialog';
import { Button } from 'app/ui/button';
import { Card, CardContent, CardHeader } from 'app/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'app/ui/dropdown-menu';
import { Heading } from 'app/ui/heading';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { useToast } from 'app/ui/use-toast';
import { getInstance } from 'database/get-instance';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { FC } from 'react';

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(response => response.json());
  const database = getInstance(context);
  const trainings = await getTrainingsByTraineeId(database)(trainee.id);

  return json({ trainee, trainings });
};

const Page: FC = () => {
  const { trainee, trainings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) {
      return;
    }
    toast({
      title: actionData.success ? 'トレーニングを削除しました' : 'トレーニングの削除に失敗しました',
      variant: actionData.success ? 'default' : 'destructive',
    });
  }, [actionData, toast]);

  return (
    <Main>
      <Section>
        <Button size="lg" asChild>
          <a href={`/trainees/${trainee.id}/trainings/new`}>トレーニングを登録する</a>
        </Button>
        <ol className="flex flex-col gap-8">
          {trainings.map(training => {
            const dateString = format(parseISO(training.date), 'yyyy年MM月dd日');
            return (
              <li key={training.id}>
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <Heading level={2}>{dateString}</Heading>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <AlertDialog>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem>
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
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>トレーニングの削除</AlertDialogTitle>
                            <AlertDialogDescription>{dateString}のトレーニングを削除しますか？</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <Form method="post">
                              <input
                                type="hidden"
                                name="id"
                                value={training.id}
                              />
                              <AlertDialogAction type="submit" name="actionType" value="delete" className="w-full">
                                削除
                              </AlertDialogAction>
                            </Form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <TrainingSessionList sessions={training.sessions} />
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </Section>
    </Main>
  );
};
export default Page;

type TrainingSessionListProps = {
  sessions: {
    id: string;
    exercise: {
      name: string;
    };
    sets: {
      id: string;
      weight: number;
      repetition: number;
      rpe: number;
    }[];
    memo: string;
  }[];
};
const TrainingSessionList: FC<TrainingSessionListProps> = ({ sessions }) => {
  return (
    <ol className="flex flex-col gap-6">
      {sessions.map(session => {
        return (
          <li key={session.id} className="flex flex-col gap-4">
            <Heading level={3} size="sm">
              {session.exercise.name}
            </Heading>
            <ol className="flex flex-col gap-2 px-4">
              {session.sets.map((set, setIndex) => {
                return (
                  <li key={set.id} className="grid grid-cols-7 items-center">
                    <div className="col-span-1">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-2 flex items-end gap-1">
                      <span>{set.weight}</span>
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                    <div className="col-span-2 flex items-end gap-1">
                      <span>{set.repetition}</span>
                      <span className="text-sm text-muted-foreground">回</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-end gap-1">
                        <span className="text-sm text-muted-foreground">RPE</span>
                        <span>{set.rpe === 0 ? '-' : `${set.rpe}`}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {session.memo && (
              <div className="rounded bg-muted p-4">
                <p className="text-muted-foreground">{session.memo}</p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export const action = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  const database = getInstance(context);
  const formData = await request.formData();

  const trainingId = formData.get('id')?.toString();
  if (!trainingId) {
    return json({
      success: false,
      description: 'get formData "id" failed',
    });
  }

  const deleteResult = await deleteTraining(database)({ id: trainingId });
  if (deleteResult.result === 'failure') {
    return json({
      success: false,
      description: 'delete data failed',
    });
  }

  return json({
    success: true,
    description: 'success',
  });
}; 
