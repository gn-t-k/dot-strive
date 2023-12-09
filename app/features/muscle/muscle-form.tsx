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
    name: z.string().min(1, { message: '部位の名前を入力してください' }),
    muscleId: z.string(),
    actionType: z.union([z.literal('create'), z.literal('update')]),
  }),
);

type Props =
  & ComponentProps<typeof ValidatedForm>
  & {
    actionType: 'create' | 'update';
    muscleId: string;
  };
export const MuscleForm: FC<Props> = ({
  actionType,
  muscleId,
  className,
  ...props
}) => {
  return (
    <ValidatedForm
      className={cn('flex items-end space-x-2', className)}
      {...props}
    >
      <input type="hidden" name="muscleId" value={muscleId} />
      <MuscleNameField
        id={muscleId}
        name="name"
        defaultValue={props.defaultValues?.['name']}
        className="grow"
      />
      <Button
        type="submit"
        name="actionType"
        value={actionType}
        className="grow-0"
      >
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
