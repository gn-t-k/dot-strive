import type { FC, PropsWithChildren } from 'react';

export const Container: FC<PropsWithChildren> = ({ children }) => {
  // モバイル画面だけ開発する
  return <div className="max-w-sm mx-auto">{children}</div>;
};
