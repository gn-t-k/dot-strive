import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from 'app/libs/shadcn/utils';

import type { VariantProps } from 'class-variance-authority';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

const textVariants = cva(
  '',
  {
    variants: {
      variant: {
        body: 'text-base font-light',
        annotation: 'text-xs font-light',
        title: 'text-base font-extrabold',
      },
    },
    defaultVariants: {
      variant: 'body',
    },
  },
);

type Props =
  & VariantProps<typeof textVariants>
  & DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;

export const Text = forwardRef<HTMLParagraphElement, Props>(
  ({ className, variant, ...props }, ref) => {

    return (
      <p
        ref={ref}
        className={cn(textVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
Text.displayName = 'P';
