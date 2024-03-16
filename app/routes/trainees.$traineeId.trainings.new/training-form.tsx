import { getFieldsetProps, getFormProps, getInputProps, getTextareaProps, useForm, useInputControl } from '@conform-to/react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { array, boolean, custom, date, maxLength, minLength, object, string } from 'valibot';

import { Button } from 'app/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from 'app/ui/card';
import { DatePicker } from 'app/ui/date-picker';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'app/ui/select';
import { Textarea } from 'app/ui/textarea';

import type { Exercise } from 'app/features/exercise/schema';
import type { FC } from 'react';

export const getTrainingFormSchema = (registeredExercises: Exercise[]) => object({
  date: date(),
  records: array(object({
    exerciseId: string([
      custom(
        value => registeredExercises.some(exercise => exercise.id === value),
        '種目を選択してください',
      ),
    ]),
    memo: string([maxLength(100, 'メモは100文字以内で入力してください')]),
    sets: array(object({
      weight: string([minLength(1, '重量を入力してください')]),
      reps: string([minLength(1, '回数を入力してください')]),
      sameWeight: boolean(),
      sameReps: boolean(),
    })),
  }),
  [minLength(1, 'トレーニング記録を入力してください')]),
});

type Props = {
  registeredExercises: Exercise[];
  actionType: string;
  defaultValues?: {
    date: string;
    records: {
      exerciseId: Exercise['id'];
      memo: string;
      sets: {
        weight: string;
        reps: string;
      }[];
    }[];
  };
};
export const TrainingForm: FC<Props> = ({ registeredExercises, actionType, defaultValues }) => {
  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
      console.log({ formData: Object.fromEntries(formData.entries()) });
      return parseWithValibot(formData, { schema: getTrainingFormSchema(registeredExercises) });
    },
    defaultValue: defaultValues,
  });

  const {
    value: selectedDate,
    change: onSelectedDateChange,
  } = useInputControl(fields.date);

  const records = fields.records.getFieldList();

  return (
    <Form
      method="post"
      className="flex flex-col space-y-5"
      {...getFormProps(form)}
    >
      <div className="flex flex-col space-y-2">
        <Label htmlFor={fields.date.id}>日付</Label>
        <DatePicker
          date={selectedDate ? new Date(selectedDate) : undefined}
          setDate={(date) => onSelectedDateChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
        />
        {fields.date.errors?.map(error => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </div>
      <fieldset {...getFieldsetProps(fields.records)} className="flex flex-col space-y-4">
        <Label asChild><legend>記録</legend></Label>
        {records.map((record, recordIndex) => {
          const recordFields = record.getFieldset();
          const sets = recordFields.sets.getFieldList();

          return (
            <Card key={record.id}>
              <CardHeader className="flex flex-col space-y-2">
                <Label htmlFor={recordFields.exerciseId.id}>種目</Label>
                <Select {...getInputProps(recordFields.exerciseId, { type: 'text' })}>
                  <SelectTrigger id={recordFields.exerciseId.id}>
                    <SelectValue placeholder="種目を選択する" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredExercises.map(exercise => (
                      <SelectItem
                        key={`${recordFields.exerciseId.id}-${exercise.id}`}
                        value={exercise.id}
                      >
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <fieldset className="flex flex-col space-y-2">
                  <Label htmlFor={recordFields.sets.id} asChild><legend>重量・回数</legend></Label>
                  {sets.map((set, setIndex) => {
                    const setFields = set.getFieldset();

                    return (
                      <div key={set.id} className="flex items-center">
                        <VisuallyHidden.Root>
                          <Label htmlFor={setFields.weight.id}>重量</Label>
                        </VisuallyHidden.Root>
                        <Input
                          {...getInputProps(setFields.weight, { type: 'number' })}
                          inputMode="decimal"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <span>kg</span>
                        <VisuallyHidden.Root>
                          <Label htmlFor={setFields.reps.id}>回数</Label>
                        </VisuallyHidden.Root>
                        <Input
                          {...getInputProps(setFields.reps, { type: 'number' })}
                          pattern="[0-9]*"
                          placeholder="000"
                        />
                        <span>回</span>
                        <Button
                          {...form.remove.getButtonProps({ name: `records[${recordIndex}].sets`, index: setIndex })}
                          size="icon"
                          variant="ghost"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    {...form.insert.getButtonProps({ name: `records[${recordIndex}].sets` })}
                    variant="secondary"
                  >
                  重量・回数を追加
                  </Button>
                </fieldset>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex w-full flex-col space-y-2">
                  <Label htmlFor={recordFields.memo.id}>メモ</Label>
                  <Textarea {...getTextareaProps(recordFields.memo)} />
                </div>
                <Button
                  {...form.remove.getButtonProps({ name: 'records', index: recordIndex })}
                  variant="outline"
                  className="w-full"
                >
                記録を削除
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        <Button
          {...form.insert.getButtonProps({ name: 'records' })}
          variant="secondary"
        >
          記録を追加
        </Button>
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
