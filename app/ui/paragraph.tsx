import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from 'app/libs/shadcn/utils';

import type { VariantProps } from 'class-variance-authority';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

const paragraphVariants = cva(
  '',
  {
    variants: {
      variant: {},
      size: {},
    },
    defaultVariants: {
      // variant: 'default',
      // size: 'default',
    },
  },
);

type Props =
  VariantProps<typeof paragraphVariants>
  & DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;

export const P = forwardRef<HTMLParagraphElement, Props>(
  ({ className, variant, size, ...props }, ref) => {

    return (
      <p
        ref={ref}
        className={cn(paragraphVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
P.displayName = 'P';
