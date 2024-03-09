import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { custom, nonOptional, object, optional, string } from 'valibot';

import { Button } from 'app/ui/button';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { Muscle } from '../../features/muscle/schema';
import type { FC } from 'react';

export const getMuscleFormSchema = (
  { registeredMuscles, beforeName }
  : { registeredMuscles: Muscle[]; beforeName: string | null },
) => object({
  id: optional(string()),
  name: nonOptional(string([
    custom(
      value => registeredMuscles.every(muscle => muscle.name !== value) || value === beforeName,
      '部位の名前が重複しています',
    ),
  ]), '部位の名前を入力してください'),
  actionType: string(),
});

type Props = {
  registeredMuscles: Muscle[];
  actionType: string;
  defaultValues?: {
    id: Muscle['id'];
    name: Muscle['name'];
  };
};
export const MuscleForm: FC<Props> = ({ registeredMuscles, actionType, defaultValues }) => {
  const beforeName = defaultValues?.name ?? null;
  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithValibot(formData, { schema: getMuscleFormSchema({ registeredMuscles, beforeName }) }),
    defaultValue: defaultValues,
  });

  return (
    <Form
      method="post"
      className="flex space-x-1"
      {...getFormProps(form)}
    >
      <input
        {...getInputProps(fields.id, { type: 'hidden' })}
      />
      <fieldset className="w-full grow">
        <VisuallyHidden.Root>
          <Label htmlFor={fields.name.id}>名前</Label>
        </VisuallyHidden.Root>
        <Input
          {...getInputProps(fields.name, { type: 'text' })}
          placeholder="例: 大胸筋"
        />
        {fields.name.errors?.map(error => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </fieldset>
      <Button
        type="submit"
        name="actionType"
        value={actionType}
        className="grow-0"
      >
        登録
      </Button>
    </Form>
  );
};
