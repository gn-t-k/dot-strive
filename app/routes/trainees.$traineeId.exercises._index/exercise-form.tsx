import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { array, custom, minLength, nonOptional, object, optional, string } from 'valibot';

import { Button } from 'app/ui/button';
import { Checkbox } from 'app/ui/checkbox';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { Exercise } from 'app/features/exercise';
import type { Muscle } from 'app/features/muscle/schema';
import type { FC } from 'react';

export const getExerciseFormSchema = (registeredMuscles: Muscle[], registeredExercises: Exercise[]) => object({
  id: optional(string()),
  name: nonOptional(string([
    custom(
      value => registeredExercises.every(exercise => exercise.name !== value),
      '種目の名前が重複しています',
    ),
  ]), '種目の名前を入力してください'),
  targets: array(
    string([
      minLength(1),
      custom(value => registeredMuscles.some(muscle => muscle.id === value)),
    ]),
    [minLength(1, '対象の部位を選択してください')]),
  actionType: string(),
});

type Props = {
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
  actionType: string;
  defaultValues?: {
    id: Exercise['id'];
    name: Exercise['name'];
    targets: Muscle['id'][];
  };
};
export const ExerciseForm: FC<Props> = ({ registeredMuscles, registeredExercises, actionType, defaultValues }) => {
  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
      console.log({ formData: formData.get('targets') });
      return parseWithValibot(formData, { schema: getExerciseFormSchema(registeredMuscles, registeredExercises) });
    },
    defaultValue: defaultValues,
  });

  return (
    <Form
      method="post"
      {...getFormProps(form)}
    >
      <input {...getInputProps(fields.id, { type: 'hidden' })} />
      <Label htmlFor={fields.name.id}>名前</Label>
      <Input {...getInputProps(fields.name, { type: 'text' })} />
      {fields.name.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
      <fieldset>
        {registeredMuscles.map(muscle => (
          <div key={muscle.id}>
            <Checkbox
              id={muscle.id}
              value={muscle.id}
              name={fields.targets.name}
              defaultChecked={defaultValues?.targets.includes(muscle.id) ?? false}
            />
            <Label htmlFor={muscle.id}>{muscle.name}</Label>
          </div>
        ))}
      </fieldset>
      {fields.targets.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
      <Button
        type="submit"
        name="actionType"
        value={actionType}
      >
        登録
      </Button>
    </Form>
  );
};