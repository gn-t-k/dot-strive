import { forwardRef } from 'react';

import { cn } from 'app/libs/shadcn/utils';

import type { ComponentProps } from 'react';

export const H2 = forwardRef<HTMLHeadingElement, ComponentProps<'h2'>>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-base font-extrabold', className)}
      {...props}
    >
      {children}
    </h2>
  ),
);
H2.displayName = 'Annotation';
