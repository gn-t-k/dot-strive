import { getCollectionProps, getFieldsetProps, getFormProps, getInputProps, useForm } from '@conform-to/react';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { array, custom, minLength, nonOptional, object, optional, string } from 'valibot';

import { Button } from 'app/ui/button';
import { Checkbox } from 'app/ui/checkbox';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { FC } from 'react';

export const getExerciseFormSchema = (
  { registeredMuscles, registeredExercises, beforeName }
  : { registeredMuscles: Muscle[]; registeredExercises: Exercise[]; beforeName: string | null },
) => object({
  id: optional(string()),
  name: nonOptional(string([
    custom(
      value => registeredExercises.every(exercise => exercise.name !== value) || value === beforeName,
      '種目の名前が重複しています',
    ),
  ]), '種目の名前を入力してください'),
  targets: array(
    string([
      minLength(1),
      custom(value => registeredMuscles.some(muscle => muscle.id === value)),
    ]),
    // FIXME: なんか選んでるのにエラー出る（そのまま通る）
    [minLength(1, '対象の部位を選択してください')]),
  actionType: string(),
});
type Exercise = { id: string; name: string };
type Muscle = { id: string; name: string };

type Props = {
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
  actionType: string;
  defaultValues?: {
    id: string;
    name: string;
    targets: string[];
  };
};
export const ExerciseForm: FC<Props> = ({ registeredMuscles, registeredExercises, actionType, defaultValues }) => {
  const beforeName = defaultValues?.name ?? null;
  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, { schema: getExerciseFormSchema({ registeredMuscles, registeredExercises, beforeName }) });
    },
    defaultValue: defaultValues,
  });

  return (
    <Form
      method="post"
      className="flex flex-col space-y-3"
      {...getFormProps(form)}
    >
      <input {...getInputProps(fields.id, { type: 'hidden' })} />
      <div className="space-y-2">
        <Label htmlFor={fields.name.id}>名前</Label>
        <Input {...getInputProps(fields.name, { type: 'text' })} />
        {fields.name.errors?.map(error => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </div>
      <fieldset {...getFieldsetProps(fields.targets)} className="space-y-2">
        <Label asChild>
          <legend>対象の部位</legend>
        </Label>
        {getCollectionProps(
          fields.targets,
          { type: 'checkbox', options: registeredMuscles.map(muscle => muscle.id) },
        ).map((props) => (
          <div key={props.id} className="flex items-center space-x-1">
            <Checkbox {...props} type="button" />
            <Label htmlFor={props.id} className="font-medium">
              {registeredMuscles.find(muscle => muscle.id === props.value)?.name}
            </Label>
          </div>
        ))}
        {fields.targets.errors?.map(error => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </fieldset>
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
