import { brand, cuid2, minLength, object, safeParse, string } from 'valibot';

import type { Output } from 'valibot';

const schema = object({
  id: string([cuid2()]),
  name: string([minLength(1)]),
});
const branded = brand(schema, 'exercise');

export type Exercise = Output<typeof branded>;

type ValidateExercise = (input: unknown) => Exercise | undefined;
export const validateExercise: ValidateExercise = (input) => {
  const result = safeParse(branded, input);

  return result.success ? result.output : undefined;
};
