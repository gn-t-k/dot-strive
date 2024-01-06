import { createId } from '@paralleldrive/cuid2';
import { Form } from '@remix-run/react';
import * as v from 'valibot';

import { cn } from 'app/libs/shadcn/utils';
import { Button } from 'app/ui/button';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';

import type { ComponentProps, FC, HTMLAttributes } from 'react';

type Props =
  & ComponentProps<typeof Form>
  & {
    actionType: 'create' | 'update';
    defaultValues?: {
      id: string;
      name: string;
    };
    errorMessage?: {
      name: ErrorMessages;
    };
  };
export const MuscleForm: FC<Props> = ({
  className,
  actionType,
  defaultValues,
  ...props
}) => {
  return (
    <Form
      {...props}
      method="post"
      className={cn('flex items-end space-x-2', className)}
    >
      <input
        type="hidden"
        name="id"
        value={defaultValues?.id}
      />
      <MuscleNameField
        id={defaultValues?.id}
        defaultValue={defaultValues?.name}
        errorMessages={props.errorMessage?.name ?? []}
        className="grow"
      />
      <Button type="submit" name="actionType" value={actionType} className="grow-0">
        登録
      </Button>
    </Form>
  );
};

type MuscleNameFieldProps =
  & HTMLAttributes<HTMLDivElement>
  & {
    errorMessages: ErrorMessages;
  };
const MuscleNameField: FC<MuscleNameFieldProps> = ({
  className,
  id = 'new',
  defaultValue,
  errorMessages,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <Label htmlFor={id}>名前</Label>
      <Input
        id={id}
        type="text"
        name="name"
        placeholder="例: 大胸筋"
        defaultValue={defaultValue}
      />
      {errorMessages.map(message => (
        // TODO: コンポーネント化
        <span key={message} className="text-sm font-medium text-destructive">{message}</span>
      ))}
    </div>
  );
};

type ValidateForm = (formData: FormData) => {
  id: ValidationResult;
  name: ValidationResult;
  actionType: ValidationResult;
};
type ValidationResult = (
  | {
    success: true;
    value: string;
  }
  | {
    success: false;
    errorMessages: ErrorMessages;
  }
);
type ErrorMessages = string[];
export const validateForm: ValidateForm = (formData) => {
  const id = formData.get('id')?.toString() || createId();

  const name = formData.get('name')?.toString();
  const nameSchema = v.string([
    v.minLength(1, '名前を入力してください'),
    // TODO: 重複チェック
  ]);
  const nameParseResult = v.safeParse(nameSchema, name);

  const actionType = formData.get('actionType')?.toString();
  const actionTypeSchema = v.string();
  const actionTypeParseResult = v.safeParse(actionTypeSchema, actionType);

  return {
    id: { success: true, value: id },
    name: nameParseResult.success
      ? { success: true, value: nameParseResult.output }
      : { success: false, errorMessages: nameParseResult.issues.map(issue => issue.message) },
    actionType: actionTypeParseResult.success
      ? { success: true, value: actionTypeParseResult.output }
      : { success: false, errorMessages: actionTypeParseResult.issues.map(issue => issue.message) },
  };
};
