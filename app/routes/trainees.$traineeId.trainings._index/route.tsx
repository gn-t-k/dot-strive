import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { format, parseISO } from 'date-fns';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { getTrainingsByTraineeId } from 'app/features/training/get-trainings-by-trainee-id';
import { loader as traineeLoader } from 'app/routes/trainees.$traineeId/route';
import { Button } from 'app/ui/button';
import { Card, CardContent, CardHeader } from 'app/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'app/ui/dropdown-menu';
import { Heading } from 'app/ui/heading';
import { Main } from 'app/ui/main';
import { Section } from 'app/ui/section';
import { getInstance } from 'database/get-instance';

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
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

  return (
    <Main>
      <Section>
        <ol className="flex flex-col gap-8">
          {trainings.map(training => {
            return (
              <li key={training.id}>
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <Heading level={2}>
                      {format(parseISO(training.date), 'yyyy年MM月dd日')}
                    </Heading>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Edit className="mr-2 size-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 size-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <ol className="flex flex-col gap-6">
                      {training.sessions.map(session => {
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
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
        <Link to={`/trainees/${trainee.id}/trainings/new`}>トレーニングを登録する</Link>
      </Section>
    </Main>
  );
};
export default Page;
