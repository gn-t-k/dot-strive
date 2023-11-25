import type { FC, PropsWithChildren } from 'react';

export const Container: FC<PropsWithChildren> = ({ children }) => {
  // モバイル画面だけ開発する
  return <div className="mx-auto max-w-sm">{children}</div>;
};
