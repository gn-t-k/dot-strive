import { Annotation } from 'app/ui/annotation';
import { Avatar, AvatarFallback, AvatarImage } from 'app/ui/avatar';
import { Heading } from 'app/ui/heading';

import type { Trainee } from 'app/features/trainee/schema';
import type { FC } from 'react';

type Props = {
  trainee: Trainee;
};
export const TraineeInfo: FC<Props> = ({
  trainee,
}) => {
  return (
    <div className="inline-flex w-full flex-col items-center justify-start gap-2 px-4">
      <Avatar>
        <AvatarImage src={trainee.image} alt={trainee.name} />
        <AvatarFallback>{trainee.name}</AvatarFallback>
      </Avatar>
      <Heading level={1}>{trainee.name}</Heading>
      <Annotation>id: {trainee.id}</Annotation>
    </div>
  );
};
