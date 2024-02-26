import { Skeleton } from 'app/ui/skeleton';

import type { FC } from 'react';

export const MainContentSkeleton: FC = () => {
  return (
    <ul className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index}>
          <Skeleton className="h-[88px]" />
        </li>
      ))}
    </ul>
  );
};
