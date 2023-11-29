import { createId } from '@paralleldrive/cuid2';

import { validateMuscle } from 'app/features/muscle';

import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  // TODO: 作成の場合の処理しか書いてないので、更新の場合の処理も書く
  const id = createId();
  const name = formData.get('name')?.toString() ?? '';

  const muscle = validateMuscle({ id, name });
  console.log({ muscle });
  return null;
};
