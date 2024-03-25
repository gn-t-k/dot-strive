import { brand, cuid2, minLength, object, safeParse, string } from 'valibot';

import type { Output } from 'valibot';

export const muscle = brand(object({
  id: string([cuid2('muscle cuid')]),
  name: string([minLength(1, 'muscle name min length')]),
}), 'muscle');

export type Muscle = Output<typeof muscle>;

type ValidateMuscle = (input: unknown) => Muscle | undefined;
export const validateMuscle: ValidateMuscle = (input) => {
  const result = safeParse(muscle, input);

  return result.success ? result.output : undefined;
};
