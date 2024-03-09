import { CircleUserRound } from 'lucide-react';

import { Logotype } from 'app/ui/logotype';

import type { Trainee } from 'app/features/trainee/schema';
import type { FC } from 'react';

type Props = {
  trainee: Trainee;
};
export const HeaderNavigation: FC<Props> = ({ trainee }) => {
  return (
    <nav className="inline-flex w-full items-center justify-between bg-white py-2 pl-4 pr-1">
      <a href="/">
        <Logotype />
      </a>
      <a href={`/trainees/${trainee.id}`}>
        <div className="p-2">
          <CircleUserRound size="20px" />
        </div>
      </a>
    </nav>
  );
};
