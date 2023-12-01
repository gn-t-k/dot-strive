import { brand, cuid2, minLength, object, safeParse, string } from 'valibot';

import type { Input, Output } from 'valibot';

const schema = object({
  id: string([cuid2()]),
  name: string([minLength(1)]),
});
const branded = brand(schema, 'muscle');

export type Muscle = Output<typeof branded>;

type ValidateMuscle = (input: Input<typeof schema>) => Muscle | undefined;
export const validateMuscle: ValidateMuscle = (input) => {
  const result = safeParse(branded, input);

  return result.success ? result.output : undefined;
};
