import { array, brand, cuid2, minLength, object, safeParse, string } from 'valibot';

import { muscle } from '../muscle/schema';

import type { Output } from 'valibot';

export const exercise = brand(object({
  id: string([cuid2('exercise cuid')]),
  name: string([minLength(1, 'exercise name min length')]),
  targets: array(muscle),
}), 'exercise');

export type Exercise = Output<typeof exercise>;

type ValidateExercise = (input: unknown) => Exercise | undefined;
export const validateExercise: ValidateExercise = (input) => {
  const result = safeParse(exercise, input);

  return result.success ? result.output : undefined;
};
