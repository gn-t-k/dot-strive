import { getFieldsetProps, getFormProps, getInputProps, getSelectProps, getTextareaProps, useForm, useInputControl } from '@conform-to/react';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { array, boolean, custom, date, maxLength, maxValue, minLength, minValue, nonOptional, number, object, optional, string } from 'valibot';

import { Button } from 'app/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from 'app/ui/card';
import { DatePicker } from 'app/ui/date-picker';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'app/ui/select';
import { Slider } from 'app/ui/slider';
import { Textarea } from 'app/ui/textarea';

import type { FieldMetadata, FormMetadata } from '@conform-to/react';
import type { Exercise } from 'app/features/exercise/schema';
import type { FC } from 'react';
import type { Input as Infer } from 'valibot';

export const getTrainingFormSchema = (registeredExercises: Exercise[]) => object({
  date: nonOptional(date(), '日付を選択してください'),
  records: array(getRecordSchema(registeredExercises), [minLength(1, '記録を入力してください')]),
});
const getRecordSchema = (registeredExercises: Exercise[]) => object({
  exerciseId: nonOptional(string([
    custom(value => registeredExercises.some(exercise => exercise.id === value)),
  ]), '種目を選択してください'),
  memo: optional(string([maxLength(100, 'メモは100文字以内で入力してください')])),
  sets: array(setSchema, [minLength(1, '重量・回数を入力してください')]),
});
const setSchema = object({
  weight: nonOptional(
    number([minValue(0, '0以上の数値で入力してください')]),
    '重量を入力してください',
  ),
  reps: nonOptional(
    number([minValue(0, '0以上の数値で入力してください')]),
    '回数を入力してください',
  ),
  rpe: optional(
    number([
      minValue(0, '1以上の数値で入力してください'),
      maxValue(10, '10以下の数値で入力してください'),
    ]), 0),
  sameWeight: optional(boolean()),
  sameReps: optional(boolean()),
});

type TrainingFormType = Infer<ReturnType<typeof getTrainingFormSchema>>;
type RecordFieldsType = Infer<ReturnType<typeof getRecordSchema>>;
type SetFieldsType = Infer<typeof setSchema>;

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
        rpe: string;
      }[];
    }[];
  };
};
export const TrainingForm: FC<Props> = ({ registeredExercises, actionType, defaultValues }) => {
  const [form, fields] = useForm<TrainingFormType>({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
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
        {records.map((record, recordIndex) => ( 
          <RecordFields
            key={record.id}
            form={form}
            record={record}
            registeredExercises={registeredExercises}
            recordIndex={recordIndex}
          />
        ))}
        <Button
          {...form.insert.getButtonProps({ name: 'records' })}
          variant="secondary"
        >
          記録を追加
        </Button>
        {fields.records.errors?.map(error => (
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

type RecordFieldsProps = {
  form: FormMetadata<TrainingFormType>;
  record: FieldMetadata<RecordFieldsType>;
  registeredExercises: Exercise[];
  recordIndex: number;
};
const RecordFields: FC<RecordFieldsProps> = ({ form, record, registeredExercises, recordIndex }) => {
  const recordFields = record.getFieldset();
  const sets = recordFields.sets.getFieldList();

  return (
    <Card key={record.id}>
      <CardHeader className="flex flex-col space-y-2">
        <Label htmlFor={recordFields.exerciseId.id}>種目</Label>
        <Select {...getSelectProps(recordFields.exerciseId)} defaultValue="">
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
        {recordFields.exerciseId.errors?.map(error => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-4">
          {sets.map((set, setIndex) => (
            <SetFields
              key={set.id}
              form={form}
              set={set}
              recordIndex={recordIndex}
              setIndex={setIndex}
            />
          ))}
          {recordFields.sets.errors?.map(error => (
            <FormErrorMessage key={error} message={error} />
          ))}
          <Button
            {...form.insert.getButtonProps({ name: `records[${recordIndex}].sets` })}
            variant="secondary"
          >
            セットを追加
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex w-full flex-col space-y-2">
          <Label htmlFor={recordFields.memo.id}>メモ</Label>
          <Textarea {...getTextareaProps(recordFields.memo)} />
          {recordFields.memo.errors?.map(error => (
            <FormErrorMessage key={error} message={error} />
          ))}
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
};

type SetFieldsProps = {
  form: FormMetadata<TrainingFormType>;
  set: FieldMetadata<SetFieldsType>;
  recordIndex: number;
  setIndex: number;
};
const SetFields: FC<SetFieldsProps> = ({ form, set, recordIndex, setIndex }) => {
  const setFields = set.getFieldset();
  const { value: rpeValue, change: onRPEChange } = useInputControl(setFields.rpe);

  return (
    <fieldset {...getFieldsetProps(set)} className="flex flex-col space-y-1">
      <header className="flex items-center justify-between">
        <Label asChild><legend>{setIndex + 1}セット目</legend></Label>
        <Button
          {...form.remove.getButtonProps({ name: `records[${recordIndex}].sets`, index: setIndex })}
          size="icon"
          variant="ghost"
          className="col-span-1 justify-self-end"
        >
          <X className="size-4" />
        </Button>
      </header>
      <div className="flex items-center gap-4 px-4">
        <Label className="flex-none">重量</Label>
        <Input
          {...getInputProps(setFields.weight, { type: 'number' })}
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
        />
        <span className="flex-none">kg</span>
      </div>
      {setFields.weight.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
      <div className="flex items-center gap-4 px-4">
        <Label className="flex-none">回数</Label>
        <Input
          {...getInputProps(setFields.reps, { type: 'number' })}
          pattern="[0-9]*"
          placeholder="000"
        />
        <span className="flex-none">回</span>
      </div>
      {setFields.reps.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
      <div className="flex items-center gap-4 px-4">
        <Label className="flex-none">RPE</Label>
        <span className="flex-none text-muted-foreground">{[undefined, '0'].includes(rpeValue) ? '-' : rpeValue}</span>
        <Slider
          step={1}
          min={0}
          max={10}
          defaultValue={[0]}
          value={rpeValue ? [Number(rpeValue)] : [0]}
          onValueChange={(value) => onRPEChange(value[0]?.toString())}
        />
      </div>
      {setFields.rpe.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </fieldset>
  );
};
