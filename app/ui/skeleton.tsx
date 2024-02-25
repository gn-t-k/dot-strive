import { cn } from 'app/libs/shadcn/utils';

import type { FC, HTMLAttributes } from 'react';

export const Skeleton: FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
};
