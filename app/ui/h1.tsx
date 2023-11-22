import { forwardRef } from 'react';

import { cn } from 'app/libs/shadcn/utils';

import type { ComponentProps } from 'react';

export const H1 = forwardRef<HTMLHeadingElement, ComponentProps<'h1'>>(
  ({ className, children, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  ),
);
H1.displayName = 'H1';
