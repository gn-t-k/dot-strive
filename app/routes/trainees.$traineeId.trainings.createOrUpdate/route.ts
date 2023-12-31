import { createId } from '@paralleldrive/cuid2';
import { redirect } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { validationError } from 'remix-validated-form';

import { validateMuscle } from 'app/features/muscle';
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
    return validationError({ fieldErrors: { muscle: '部位の登録に失敗しました' } });
  }

  const id = result.data.id ?? createId();
  const name = result.data.name;

  const muscle = validateMuscle({ id, name });
  if (!muscle) {
    // TODO: 何が起きるのか調査
    return validationError({ fieldErrors: { muscle: '部位の登録に失敗しました' } });
  }

  const isCreate = !result.data.id;
  await (isCreate
    ? database
      .insert(musclesSchema)
      .values({
        ...muscle,
        traineeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    : database
      .update(musclesSchema)
      .set({
        ...muscle,
        updatedAt: new Date(),
      })
      .where(eq(musclesSchema.id, id)));
  
  return redirect(`/trainees/${traineeId}/muscles`);
};
