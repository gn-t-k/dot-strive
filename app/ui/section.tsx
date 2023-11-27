import { cn } from 'app/libs/shadcn/utils';

import type { ComponentProps, FC, PropsWithChildren } from 'react';

type Props = ComponentProps<'section'>;

export const Section: FC<PropsWithChildren<Props>> =
  ({ className, children, ...props }) => {
    return (
      <section
        className={cn('inline-flex w-full flex-col justify-start gap-4', className)}
        {...props}
      >
        {children}
      </section>
    );
  };
