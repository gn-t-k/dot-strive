import { redirect } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { validationError } from 'remix-validated-form';

import { validator } from 'app/features/muscle/muscle-form';
import { muscles as musclesSchema } from 'database/tables/muscles';

import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const result = await validator.validate(
    await request.formData(),
  );
  if (result.error) {
    // TODO: 何が起きるのか調査
    return validationError(result.error);
  }

  const env = context['env'] as Env;
  const database = drizzle(env.DB);

  const traineeId = params['traineeId'];
  if (!traineeId) {
    // TODO: 何が起きるのか調査
    return validationError({ fieldErrors: { muscle: '部位の削除に失敗しました' } });
  }

  const id = result.data.id;
  if (id === undefined) {
    // TODO: 何が起きるのか調査
    return validationError({ fieldErrors: { muscle: '部位の削除に失敗しました' } });
  }

  await database
    .delete(musclesSchema)
    .where(eq(musclesSchema.id, id))
    .returning();

  return redirect(`/trainees/${traineeId}/muscles`);
};
