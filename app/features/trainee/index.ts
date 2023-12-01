import { brand, cuid2, minLength, object, safeParse, string, url } from 'valibot';

import type { Input, Output } from 'valibot';

const schema = object({
  id: string([cuid2()]),
  name: string([minLength(1)]),
  image: string([url()]),
});
const branded = brand(schema, 'trainee');

export type Trainee = Output<typeof branded>;

type ValidateTrainee = (input: Input<typeof schema>) => Trainee | undefined;
export const validateTrainee: ValidateTrainee = (input) => {
  const result = safeParse(branded, input);

  return result.success ? result.output : undefined;
};
