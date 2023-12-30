import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, useField } from 'remix-validated-form';
import { z } from 'zod';

import { cn } from 'app/libs/shadcn/utils';
import { Button } from 'app/ui/button';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { ComponentProps, FC, HTMLAttributes } from 'react';

export const validator = withZod(
  z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: '部位の名前を入力してください' }),
  }),
);

type Props =
  & Omit<ComponentProps<typeof ValidatedForm>, 'validator'>
  & (
    | { update?: true; id: string; name: string }
    | { update?: false }
  );
export const MuscleForm: FC<Props> = ({
  className,
  ...props
}) => {
  return (
    <ValidatedForm
      className={cn('flex items-end space-x-2', className)}
      {...props}
      validator={validator}
      action="createOrUpdate"
    >
      <input
        type="hidden"
        name="muscleId"
        value={props.update ? props.id : undefined}
      />
      <MuscleNameField
        id={props.update ? props.id : undefined}
        name="name"
        defaultValue={props.update ? props.name : undefined}
        className="grow"
      />
      <Button type="submit" className="grow-0">
        登録
      </Button>
    </ValidatedForm>
  );
};

type MuscleNameFieldProps =
  & HTMLAttributes<HTMLDivElement>
  & {
    name: string;
  };
const MuscleNameField: FC<MuscleNameFieldProps> = ({
  name,
  className,
  id = 'new',
  ...props
}) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <Label htmlFor={id}>名前</Label>
      <Input
        type="text"
        placeholder="例: 大胸筋"
        {...getInputProps({ id })}
      />
      {
        error &&
        // TODO: コンポーネント化
        <span className="text-sm font-medium text-destructive">{error}</span>
      }
    </div>
  );
};
