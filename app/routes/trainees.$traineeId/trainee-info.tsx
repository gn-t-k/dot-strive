import { Avatar, AvatarFallback, AvatarImage } from 'app/ui/avatar';
import { Text } from 'app/ui/text';

import type { Trainee } from 'app/features/trainee';
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
      {/* TODO: H2としてマークアップしたい */}
      <Text variant="title">{trainee.name}</Text>
      <Text variant="annotation">id: {trainee.id}</Text>
    </div>
  );
};
