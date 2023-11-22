import { forwardRef } from 'react';

import { cn } from 'app/libs/shadcn/utils';

import type { ComponentProps } from 'react';

export const H2 = forwardRef<HTMLHeadingElement, ComponentProps<'h2'>>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
);
H2.displayName = 'H2';
