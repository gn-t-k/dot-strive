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
  }).and(z.union([
    z.object({
      actionType: z.literal('create'),
    }),
    z.object({
      actionType: z.literal('update'),
      muscleId: z.string(),
    }),
    z.object({
      actionType: z.literal('delete'),
      muscleId: z.string(),
    })
  ])),
);

type Props =
  & Omit<ComponentProps<typeof ValidatedForm>, 'validator'>
  & {
    actionProps: (
      | {
        type: 'create';
      }
      | {
        type: 'update';
        muscleId: string;
      }
    );
  };
export const MuscleForm: FC<Props> = ({
  className,
  actionProps,
  ...props
}) => {
  return (
    <ValidatedForm
      className={cn('flex items-end space-x-2', className)}
      validator={validator}
      {...props}
    >
      <input
        type="hidden"
        name="muscleId"
        value={actionProps.type === 'create' ? '' : actionProps.muscleId}
      />
      <MuscleNameField
        id={actionProps.type === 'create' ? 'newMuscle' : actionProps.muscleId}
        name="name"
        defaultValue={props.defaultValues?.['name']}
        className="grow"
      />
      <Button
        type="submit"
        name="actionType"
        value={actionProps.type}
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
