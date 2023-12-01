import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, useField } from 'remix-validated-form';
import { z } from 'zod';

import { Button } from 'app/ui/button';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { ComponentProps, FC } from 'react';

export const validator = withZod(z.object({
  name: z.string().min(1, { message: '部位の名前を入力してください' }),
}));

type Props = ComponentProps<typeof ValidatedForm>;
export const UpsertMuscleForm: FC<Props> = (props) => {
  return (
    <ValidatedForm {...props} className="space-y-6">
      <MuscleNameField name="name" />
      <Button type="submit" name="action" value="create">登録</Button>
    </ValidatedForm>
  );
};

type MuscleNameFieldProps = {
  name: string;
};
const MuscleNameField: FC<MuscleNameFieldProps> = ({
  name,
}) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>名前</Label>
      <Input type="text" {...getInputProps({ id: name })} />
      {
        error &&
        // TODO: コンポーネント化
        <span className="text-sm font-medium text-destructive">{error}</span>
      }
    </div>
  );
};
