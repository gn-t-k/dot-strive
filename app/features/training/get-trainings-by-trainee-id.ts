import { eq, sql } from 'drizzle-orm';
import { array, date, merge, number, object, safeParse, string } from 'valibot';

import { exercises } from 'database/tables/exercises';
import { trainingRecords } from 'database/tables/training-records';
import { trainingSets } from 'database/tables/training-sets';
import { trainings } from 'database/tables/trainings';

import type { Database } from 'database/get-instance';
import type { Input } from 'valibot';

type GetTrainingsByTraineeId = (database: Database) => (traineeId: string) => Promise<Payload>;
type Payload = Input<typeof payloadSchema>;
const exerciseSchema = object({
  id: string(),
  name: string(),
});
const setSchema = object({
  id: string(),
  weight: number(),
  repetition: number(),
  rpe: number(),
  estimatedMaximumWeight: number(),
});
const sessionSchema = object({
  id: string(),
  memo: string(),
});
const trainingSchema = object({
  id: string(),
  date: date(),
});
const payloadSchema = array(merge([
  trainingSchema,
  object({
    id: string(),
    date: date(),
    sessions: array(merge([
      sessionSchema,
      object({
        exercise: exerciseSchema,
        sets: array(setSchema),
      }),
    ])),
  }),
]));
export const getTrainingsByTraineeId: GetTrainingsByTraineeId = (database) => async (traineeId) => {
  const data = await database
    .select({
      trainingId: sql`${trainings.id}`.as('trainingId'),
      date: trainings.date,
      sessionId: sql`${trainingRecords.id}`.as('sessionId'),
      exerciseId: sql`${exercises.id}`.as('exerciseId'),
      exerciseName: exercises.name,
      memo: trainingRecords.memo,
      sessionOrder: sql`${trainingRecords.order}`.as('sessionOrder'),
      setId: sql`${trainingSets.id}`.as('setId'),
      weight: trainingSets.weight,
      repetition: trainingSets.repetition,
      rpe: trainingSets.rpe,
      estimatedMaximumWeight: trainingSets.estimatedMaximumWeight,
      setOrder: sql`${trainingSets.order}`.as('setOrder'),
    })
    .from(trainings)
    .leftJoin(trainingRecords, eq(trainings.id, trainingRecords.trainingId))
    .leftJoin(trainingSets, eq(trainingRecords.id, trainingSets.recordId))
    .leftJoin(exercises, eq(trainingRecords.exerciseId, exercises.id))
    .where(eq(trainings.traineeId, traineeId));

  return data.reduce<Payload>((accumulator, current) => {
    const [parseTrainingResult, parseSessionResult, parseExerciseResult, parseSetResult] = [
      safeParse(trainingSchema, { id: current.trainingId, date: current.date }),
      safeParse(sessionSchema, { id: current.sessionId, memo: current.memo }),
      safeParse(exerciseSchema, { id: current.exerciseId, name: current.exerciseName }),
      safeParse(setSchema, {
        id: current.setId,
        weight: current.weight,
        repetition: current.repetition,
        rpe: current.rpe,
        estimatedMaximumWeight: current.estimatedMaximumWeight,
      }),
    ];
    if (!parseTrainingResult.success || !parseSessionResult.success || !parseExerciseResult.success || !parseSetResult.success) {
      return accumulator;
    }
    const [currentTraining, currentSession, currentExercise, currentSet]
      = [parseTrainingResult.output, parseSessionResult.output, parseExerciseResult.output, parseSetResult.output];

    const trainingIndex = accumulator.findIndex(training => training.id === currentTraining.id);
    if (trainingIndex === -1) {
      return [...accumulator, {
        ...currentTraining,
        sessions: [{
          ...currentSession,
          exercise: currentExercise,
          sets: [currentSet],
        }],
      }];
    }

    const foundTraining = accumulator[trainingIndex];
    if (!foundTraining) {
      return accumulator;
    }

    const sessionIndex = foundTraining.sessions.findIndex(session => session.id === currentSession.id);
    if (sessionIndex === -1) {
      return accumulator.with(trainingIndex, {
        ...foundTraining,
        sessions: [...foundTraining.sessions, {
          ...currentSession,
          exercise: currentExercise,
          sets: [currentSet],
        }],
      });
    }

    const foundSession = foundTraining.sessions[sessionIndex];
    if (!foundSession) {
      return accumulator;
    }

    return accumulator.with(trainingIndex, {
      ...foundTraining,
      sessions: foundTraining.sessions.with(sessionIndex, {
        ...foundSession,
        sets: [...foundSession.sets, currentSet],
      }),
    });
  }, []);
};
