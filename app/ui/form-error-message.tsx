import type { ComponentProps, FC } from 'react';

type Props = {
  message: string;
} & ComponentProps<'span'>;
export const FormErrorMessage: FC<Props> = ({ message, ...props }) => {
  return (
    <span className="text-sm font-medium text-destructive" {...props}>{message}</span>
  );
};
