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
  sessions: array(getSessionSchema(registeredExercises), [minLength(1, 'セッションの情報を入力してください')]),
});
const getSessionSchema = (registeredExercises: Exercise[]) => object({
  exerciseId: nonOptional(string([
    custom(value => registeredExercises.some(exercise => exercise.id === value)),
  ]), '種目を選択してください'),
  memo: optional(string([maxLength(100, 'メモは100文字以内で入力してください')])),
  sets: array(setSchema, [minLength(1, 'セットの情報を入力してください')]),
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
type SessionFieldsType = Infer<ReturnType<typeof getSessionSchema>>;
type SetFieldsType = Infer<typeof setSchema>;

type Props = {
  registeredExercises: Exercise[];
  actionType: string;
  defaultValues?: {
    date: string;
    sessions: {
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

  return (
    <Form
      method="post"
      className="flex flex-col gap-8"
      {...getFormProps(form)}
    >
      <DateField dateField={fields.date} />
      <SessionsFieldset
        removeIntent={form.remove}
        insertIntent={form.insert}
        sessionsField={fields.sessions}
        registeredExercises={registeredExercises}
      />
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

type DateFieldProps = {
  dateField: FieldMetadata<TrainingFormType['date']>;
};
const DateField: FC<DateFieldProps> = ({ dateField }) => {
  const { value, change } = useInputControl(dateField);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={dateField.id}>日付</Label>
      <DatePicker
        date={value ? new Date(value) : undefined}
        setDate={(date) => change(date ? format(date, 'yyyy-MM-dd') : undefined)}
      />
      {dateField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SessionsFieldsetProps = {
  removeIntent: FormMetadata<TrainingFormType>['remove'];
  insertIntent: FormMetadata<TrainingFormType>['insert'];
  sessionsField: FieldMetadata<TrainingFormType['sessions']>;
  registeredExercises: Exercise[];
};
const SessionsFieldset: FC<SessionsFieldsetProps> = ({ removeIntent, insertIntent, sessionsField, registeredExercises }) => {
  const sessions = sessionsField.getFieldList();

  return (
    <fieldset {...getFieldsetProps(sessionsField)} className="flex flex-col space-y-2">
      <Label asChild><legend>セッション</legend></Label>
      <ol>
        {sessions.map((session, sessionIndex) => ( 
          <li key={session.id}>
            <SessionFields
              removeIntent={removeIntent}
              insertIntent={insertIntent}
              sessionField={session}
              registeredExercises={registeredExercises}
              sessionIndex={sessionIndex}
            />
          </li>
        ))}
      </ol>
      {sessionsField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
      <Button
        {...insertIntent.getButtonProps({ name: 'sessions' })}
        {...insertIntent.getButtonProps({ name: `sessions[${sessions.length}].sets` })}
        variant="secondary"
      >
        セッションを追加
      </Button>
    </fieldset>
  );
};

type SessionFieldsProps = {
  removeIntent: FormMetadata<TrainingFormType>['remove'];
  insertIntent: FormMetadata<TrainingFormType>['insert'];
  sessionField: FieldMetadata<SessionFieldsType>;
  registeredExercises: Exercise[];
  sessionIndex: number;
};
const SessionFields: FC<SessionFieldsProps> = ({ removeIntent, insertIntent, sessionField, registeredExercises, sessionIndex }) => {
  const sessionFields = sessionField.getFieldset();
  const sets = sessionFields.sets.getFieldList();

  return (
    <Card key={sessionField.id}>
      <CardHeader>
        <ExerciseField
          registeredExercises={registeredExercises}
          exerciseField={sessionFields.exerciseId}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SetsFieldset
          setsField={sets}
          removeIntent={removeIntent}
          sessionIndex={sessionIndex}
        />
        {sessionFields.sets.errors?.map(error => (
          <FormErrorMessage key={error} message={error} />
        ))}
        <Button
          {...insertIntent.getButtonProps({ name: `sessions[${sessionIndex}].sets` })}
          variant="secondary"
        >
          セットを追加
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor={sessionFields.memo.id}>メモ</Label>
          <Textarea {...getTextareaProps(sessionFields.memo)} />
          {sessionFields.memo.errors?.map(error => (
            <FormErrorMessage key={error} message={error} />
          ))}
        </div>
        <Button
          {...removeIntent.getButtonProps({ name: 'sessions', index: sessionIndex })}
          variant="outline"
          className="w-full"
        >
        セッションを削除
        </Button>
      </CardFooter>
    </Card>
  );
};

type ExerciseFieldProps = {
  registeredExercises: Exercise[];
  exerciseField: FieldMetadata<SessionFieldsType['exerciseId']>;
};
const ExerciseField: FC<ExerciseFieldProps> = ({ registeredExercises, exerciseField }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={exerciseField.id}>種目</Label>
      <Select {...getSelectProps(exerciseField)} defaultValue="">
        <SelectTrigger id={exerciseField.id}>
          <SelectValue placeholder="種目を選択する" />
        </SelectTrigger>
        <SelectContent>
          {registeredExercises.map(exercise => (
            <SelectItem
              key={`${exercise.id}-${exercise.id}`}
              value={exercise.id}
            >
              {exercise.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {exerciseField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SetsFieldsetProps = {
  setsField: FieldMetadata<SetFieldsType>[];
  removeIntent: FormMetadata<TrainingFormType>['remove'];
  sessionIndex: number;
};
const SetsFieldset: FC<SetsFieldsetProps> = ({ setsField, removeIntent, sessionIndex }) => {
  return (
    <ol className="flex flex-col gap-4">
      {setsField.map((set, setIndex) => (
        <li key={set.id}>
          <SetFields
            removeIntent={removeIntent}
            setField={set}
            sessionIndex={sessionIndex}
            setIndex={setIndex}
          />
        </li>
      ))}
    </ol>
  );
};

type SetFieldsProps = {
  removeIntent: FormMetadata<TrainingFormType>['remove'];
  setField: FieldMetadata<SetFieldsType>;
  sessionIndex: number;
  setIndex: number;
};
const SetFields: FC<SetFieldsProps> = ({ removeIntent, setField, sessionIndex, setIndex }) => {
  const setFields = setField.getFieldset();
  
  return (
    <fieldset {...getFieldsetProps(setField)} className="flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <Label asChild><legend>{setIndex + 1}セット目</legend></Label>
        <Button
          {...removeIntent.getButtonProps({ name: `sessions[${sessionIndex}].sets`, index: setIndex })}
          size="icon"
          variant="ghost"
          className="col-span-1 justify-self-end"
        >
          <X className="size-4" />
        </Button>
      </header>
      <WeightField weightField={setFields.weight} />
      <RepsField repsField={setFields.reps} />
      <RPEField rpeField={setFields.rpe} />
    </fieldset>
  );
};

type WeightFieldProps = {
  weightField: FieldMetadata<SetFieldsType['weight']>;
};
const WeightField: FC<WeightFieldProps> = ({ weightField }) => {
  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center gap-4">
        <Label htmlFor={weightField.id} className="flex-none">重量</Label>
        <Input
          {...getInputProps(weightField, { type: 'number' })}
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
        />
        <span className="flex-none">kg</span>
      </div>
      {weightField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type RepsFieldProps = {
  repsField: FieldMetadata<SetFieldsType['reps']>;
};
const RepsField: FC<RepsFieldProps> = ({ repsField }) => {
  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center gap-4">
        <Label htmlFor={repsField.id} className="flex-none">回数</Label>
        <Input
          {...getInputProps(repsField, { type: 'number' })}
          pattern="[0-9]*"
          placeholder="000"
        />
        <span className="flex-none">回</span>
      </div>
      {repsField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type RPEFieldProps = {
  rpeField: FieldMetadata<SetFieldsType['rpe']>;
};
const RPEField: FC<RPEFieldProps> = ({ rpeField }) => {
  const { value, change } = useInputControl(rpeField);

  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center gap-4">
        <Label className="flex-none">RPE</Label>
        <span className="flex-none text-muted-foreground">{[undefined, '0'].includes(value) ? '-' : value}</span>
        <Slider
          step={1}
          min={0}
          max={10}
          onValueChange={(value) => change(value[0]?.toString())}
        />
      </div>
      {rpeField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};
