import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, useField } from 'remix-validated-form';
import { z } from 'zod';

import { cn } from 'app/libs/shadcn/utils';
import { Button } from 'app/ui/button';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { ComponentProps, FC, HTMLAttributes } from 'react';

const upsertSchema = z.union([
  z.object({
    actionType: z.literal('create'),
    muscleId: z.undefined(),
  }),
  z.object({
    actionType: z.literal('update'),
    muscleId: z.string(),
  }),
]);
export const validator = withZod(
  z.object({
    name: z.string().min(1, { message: '部位の名前を入力してください' }),
  }).and(upsertSchema),
);

type Props =
  & ComponentProps<typeof ValidatedForm>
  & z.infer<typeof upsertSchema>;
export const UpsertMuscleForm: FC<Props> = ({ actionType, muscleId, ...props }) => {
  return (
    <ValidatedForm {...props} className="flex items-end space-x-2">
      <input type="hidden" name="muscleId" value={muscleId} />
      <MuscleNameField
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
  ...props
}) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <Label htmlFor={name}>名前</Label>
      <Input type="text" placeholder="例: 大胸筋" {...getInputProps({ id: name })} />
      {
        error &&
        // TODO: コンポーネント化
        <span className="text-sm font-medium text-destructive">{error}</span>
      }
    </div>
  );
};
