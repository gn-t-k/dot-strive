import { cva } from 'class-variance-authority';

import { cn } from 'app/libs/shadcn/utils';

import type { VariantProps } from 'class-variance-authority';
import type { DetailedHTMLProps, FC, HTMLAttributes } from 'react';

const headingVariants = cva(
  'scroll-m-20',
  {
    variants: {
      size: {
        default: 'text-2xl font-semibold tracking-tight',
        sm: 'text-xl font-semibold tracking-tight',
        lg: 'pb-2 text-3xl font-semibold tracking-tight',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

type Props =
  & DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  & VariantProps<typeof headingVariants>
  & { level: 1 | 2 | 3 | 4 | 5 | 6 };
export const Heading: FC<Props> = ({ className, size, ...props }) => {
  const Comp = `h${props.level}` as const;

  return (
    <Comp
      className={cn(headingVariants({ size, className }))}
      {...props}
    />
  );
};
