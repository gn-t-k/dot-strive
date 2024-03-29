import { getFieldsetProps, getFormProps, getInputProps, getSelectProps, getTextareaProps, useForm, useInputControl } from '@conform-to/react';
import { Form } from '@remix-run/react';
import { parseWithValibot } from 'conform-to-valibot';
import { format } from 'date-fns';
import { History, X } from 'lucide-react';
import { useCallback } from 'react';
import { array, custom, date, maxLength, maxValue, minLength, minValue, nonOptional, number, object, optional, string } from 'valibot';

import { Badge } from 'app/ui/badge';
import { Button } from 'app/ui/button';
import { Card, CardContent, CardHeader } from 'app/ui/card';
import { DatePicker } from 'app/ui/date-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from 'app/ui/dropdown-menu';
import { FormErrorMessage } from 'app/ui/form-error-message';
import { Input } from 'app/ui/input';
import { Label } from 'app/ui/label';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from 'app/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'app/ui/select';
import { Slider } from 'app/ui/slider';
import { Textarea } from 'app/ui/textarea';

import type { FieldMetadata, FormMetadata } from '@conform-to/react';
import type { FC , ComponentProps } from 'react';
import type { Input as Infer } from 'valibot';

export const getTrainingFormSchema = (registeredExercises: Exercise[]) => object({
  date: nonOptional(date(), '日付を選択してください'),
  sessions: array(getSessionSchema(registeredExercises), [minLength(1, 'セッションの情報を入力してください')]),
});
const getSessionSchema = (registeredExercises: Exercise[]) => object({
  exerciseId: nonOptional(string([
    custom(value => registeredExercises.some(exercise => exercise.id === value)),
  ]), '種目を選択してください'),
  memo: optional(string([maxLength(100, 'メモは100文字以内で入力してください')]), ''),
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
      exerciseId: string;
      memo: string;
      sets: {
        weight: string;
        reps: string;
        rpe: string;
      }[];
    }[];
  };
};
type Exercise = { id: string; name: string };
export const TrainingForm: FC<Props> = ({ registeredExercises, actionType, defaultValues }) => {
  const [form, fields] = useForm<TrainingFormType>({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, { schema: getTrainingFormSchema(registeredExercises) });
    },
    defaultValue: defaultValues ?? {
      date: format(new Date(), 'yyyy-MM-dd'),
      sessions: [
        {
          exerciseId: '',
          memo: '',
          sets: [
            { weight: '', reps: '', rpe: '' },
          ],
        },
      ],
    },
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
    <fieldset {...getFieldsetProps(sessionsField)} className="flex flex-col gap-4">
      <ol className="flex flex-col gap-4">
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
  const setFieldList = sessionFields.sets.getFieldList();

  return (
    <Card key={sessionField.id}>
      <CardHeader className="flex items-center justify-between">
        <Label asChild><legend>セッション{sessionIndex + 1}</legend></Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <X className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Button
                  {...removeIntent.getButtonProps({ name: 'sessions', index: sessionIndex })}
                  variant="ghost"
                >
                    セッション{sessionIndex + 1}を削除する
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ExerciseField
          registeredExercises={registeredExercises}
          exerciseField={sessionFields.exerciseId}
        />
        <SetsFieldset
          setFieldList={setFieldList}
          setsField={sessionFields.sets}
          removeIntent={removeIntent}
          sessionIndex={sessionIndex}
        />
        <Button
          {...insertIntent.getButtonProps({ name: `sessions[${sessionIndex}].sets` })}
          variant="secondary"
        >
          セットを追加
        </Button>
        <MemoField memoField={sessionFields.memo} />
      </CardContent>
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

type MemoFieldProps = {
  memoField: FieldMetadata<SessionFieldsType['memo']>;
};
const MemoField: FC<MemoFieldProps> = ({ memoField }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={memoField.id}>メモ</Label>
      <Textarea {...getTextareaProps(memoField)} />
      {memoField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SetsFieldsetProps = {
  setFieldList: FieldMetadata<SetFieldsType>[];
  setsField: FieldMetadata<SessionFieldsType['sets']>;
  removeIntent: FormMetadata<TrainingFormType>['remove'];
  sessionIndex: number;
};
const SetsFieldset: FC<SetsFieldsetProps> = ({ setFieldList, setsField, removeIntent, sessionIndex }) => {
  const weightHistory = [...new Set(setFieldList.flatMap(setField => {
    const weight = setField.value?.weight;
    return weight ? [weight] : [];
  }))].sort();
  const repsHistory = [...new Set(setFieldList.flatMap(setField => {
    const reps = setField.value?.reps;
    return reps ? [reps] : [];
  }))].sort();

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-4">
        {setFieldList.map((set, setIndex) => (
          <li key={set.id}>
            <SetFields
              removeIntent={removeIntent}
              setField={set}
              sessionIndex={sessionIndex}
              setIndex={setIndex}
              weightHistory={weightHistory}
              repsHistory={repsHistory}
            />
          </li>
        ))}
      </ol>
      {setsField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SetFieldsProps = {
  removeIntent: FormMetadata<TrainingFormType>['remove'];
  setField: FieldMetadata<SetFieldsType>;
  sessionIndex: number;
  setIndex: number;
  weightHistory: string[];
  repsHistory: string[];
};
const SetFields: FC<SetFieldsProps> = ({ removeIntent, setField, sessionIndex, setIndex, weightHistory, repsHistory }) => {
  const setFields = setField.getFieldset();
  
  return (
    <fieldset {...getFieldsetProps(setField)} className="flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <Label asChild><legend>セット{setIndex + 1}</legend></Label>
        <Button
          {...removeIntent.getButtonProps({ name: `sessions[${sessionIndex}].sets`, index: setIndex })}
          size="icon"
          variant="ghost"
          className="col-span-1 justify-self-end"
        >
          <X className="size-4" />
        </Button>
      </header>
      <WeightField weightField={setFields.weight} weightHistory={weightHistory} />
      <RepsField repsField={setFields.reps} repsHistory={repsHistory} />
      <RPEField rpeField={setFields.rpe} />
    </fieldset>
  );
};

type WeightFieldProps = {
  weightField: FieldMetadata<SetFieldsType['weight']>;
  weightHistory: string[];
};
const WeightField: FC<WeightFieldProps> = ({ weightField, weightHistory }) => {
  const { value, change } = useInputControl(weightField);

  type OnClickBadge = (weight: string) => ComponentProps<typeof Badge>['onClick'];
  const onClickBadge = useCallback<OnClickBadge>((weight) => (_) => {
    change(weight);
  }, [change]);

  const { value: _, ...inputProps } = getInputProps(weightField, { type: 'number' });

  return (
    <div className="flex flex-col gap-2 pl-2">
      <div className="grid grid-cols-6 items-center gap-2">
        <Label htmlFor={weightField.id} className="col-span-1">重量</Label>
        <Input
          {...inputProps}
          value={value ?? ''}
          onChange={(event) => change(event.target.value)}
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          className="col-span-3"
        />
        <span className="col-span-1">kg</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="col-span-1">
              <History className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="max-w-72">
            {weightHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">入力したセットの値を選んで入力できます</p>
            )}
            <ul className="flex gap-2">
              {weightHistory.map((weight, index) => (
                <li key={index}>
                  <PopoverClose>
                    <Badge onClick={onClickBadge(weight)} variant="outline">{weight}</Badge>
                  </PopoverClose>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      {weightField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type RepsFieldProps = {
  repsField: FieldMetadata<SetFieldsType['reps']>;
  repsHistory: string[];
};
const RepsField: FC<RepsFieldProps> = ({ repsField, repsHistory }) => {
  const { value, change } = useInputControl(repsField);

  type OnClickBadge = (reps: string) => ComponentProps<typeof Badge>['onClick'];
  const onClickBadge = useCallback<OnClickBadge>((reps) => (_) => {
    change(reps);
  }, [change]);

  const { value: _, ...inputProps } = getInputProps(repsField, { type: 'number' });

  return (
    <div className="flex flex-col gap-2 pl-2">
      <div className="grid grid-cols-6 items-center gap-2">
        <Label htmlFor={repsField.id} className="col-span-1">回数</Label>
        <Input
          {...inputProps}
          value={value ?? ''}
          onChange={(event) => change(event.target.value)}
          pattern="[0-9]*"
          placeholder="000"
          className="col-span-3"
        />
        <span className="col-span-1">回</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="col-span-1">
              <History className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="max-w-72">
            {repsHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">入力したセットの値を選んで入力できます</p>
            )}
            <ul className="flex gap-2">
              {repsHistory.map((reps, index) => (
                <li key={index}>
                  <PopoverClose>
                    <Badge onClick={onClickBadge(reps)} variant="outline">{reps}</Badge>
                  </PopoverClose>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
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
    <div className="flex flex-col gap-2 pl-2">
      <div className="grid grid-cols-6 items-center gap-2">
        <Label className="col-span-1">RPE</Label>
        <span className="col-span-1">{[undefined, '0'].includes(value) ? '-' : value}</span>
        <Slider
          step={1}
          min={0}
          max={10}
          onValueChange={(value) => change(value[0]?.toString())}
          className="col-span-3"
        />
      </div>
      {rpeField.errors?.map(error => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};
