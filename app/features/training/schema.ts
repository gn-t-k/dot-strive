import { array, brand, cuid2, date, maxValue, minValue, number, object, safeParse, string } from 'valibot';

import { exercise } from '../exercise/schema';

import type { Output } from 'valibot';

export const training = brand(object({
  id: string([cuid2('training cuid')]),
  date: date('training date'),
  sessions: array(object({
    exercise: exercise,
    memo: string('training memo'),
    sets: array(object({
      weight: number([minValue(0, 'weight min value')]),
      reps: number([minValue(0, 'reps min value')]),
      rpe: number([minValue(0, 'rpe min value'), maxValue(10, 'rpe max value')]),
    })),
  })),
}), 'training');

export type Training = Output<typeof training>;

type ValidateTraining = (input: unknown) => Training | undefined;
export const validateTraining: ValidateTraining = (input) => {
  const result = safeParse(training, input);
  console.log({ issues: JSON.stringify(result.issues) });

  return result.success ? result.output : undefined;
};
