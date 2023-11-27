import { forwardRef } from 'react';

import { cn } from 'app/libs/shadcn/utils';

import type { ComponentProps } from 'react';

export const Annotation = forwardRef<HTMLParagraphElement, ComponentProps<'small'>>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn('text-xs font-light', className)}
      {...props}
    />
  ),
);
Annotation.displayName = 'Annotation';
