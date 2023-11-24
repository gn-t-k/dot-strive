import { Avatar, AvatarFallback, AvatarImage } from 'app/ui/avatar';

import type { Trainee } from 'app/features/trainee';
import type { FC } from 'react';

type Props = {
  trainee: Trainee;
};
export const TraineeInfo: FC<Props> = ({
  trainee,
}) => {
  return (
    <div className="inline-flex flex-col items-center justify-start gap-2 px-4">
      <Avatar>
        <AvatarImage src={trainee.image} alt={trainee.name} />
        <AvatarFallback>{trainee.name}</AvatarFallback>
      </Avatar>
      <p>{trainee.name}</p>
      <p>id: {trainee.id}</p>
    </div>
  );
};
