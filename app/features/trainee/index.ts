import { brand, cuid2, minLength, object, parse, string, url } from 'valibot';

import type { Input, Output } from 'valibot';

const schema = object({
  id: string([cuid2()]),
  name: string([minLength(1)]),
  image: string([url()]),
});
const branded = brand(schema, 'trainee');

export type Trainee = Output<typeof branded>;

type BrandTrainee = (input: Input<typeof schema>) => Trainee;
export const brandTrainee: BrandTrainee = (input) => {
  const result = parse(branded, input);

  return result;
};
