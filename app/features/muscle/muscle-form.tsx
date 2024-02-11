import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { custom, nonOptional, object, optional, string } from 'valibot';

import { cn } from 'app/libs/shadcn/utils';
import { Button } from 'app/ui/button';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { Muscle } from '../muscle';
import type { ComponentProps, FC } from 'react';

export const getMuscleFormSchema = (registeredMuscles: Muscle[]) => object({
  id: optional(string()),
  name: nonOptional(string([
    custom(
      value => registeredMuscles.every(muscle => muscle.name !== value),
      '部位の名前が重複しています',
    ),
  ]), '部位の名前を入力してください'),
  actionType: string(),
});
type Fields = keyof ReturnType<typeof getMuscleFormSchema>['entries'];

type Props = {
  registeredMuscles: Muscle[];
  actionType: string;
  defaultValues?: {
    [key in Fields]?: string
  };
} & ComponentProps<typeof Form>;
export const MuscleForm: FC<Props> = ({ registeredMuscles, actionType, defaultValues, className, ...props }) => {
  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithValibot(formData, { schema: getMuscleFormSchema(registeredMuscles) }),
    defaultValue: defaultValues,
  });

  return (
    <Form
      method="post"
      className={cn('flex-col space-y-4', className)}
      {...getFormProps(form)}
      {...props}
    >
      <input
        {...getInputProps(fields.id, { type: 'hidden' })}
      />
      <fieldset className="grow space-y-2">
        <Label htmlFor={fields.name.id}>名前</Label>
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
