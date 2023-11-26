import { Outlet } from '@remix-run/react';
import { CircleUserRound } from 'lucide-react';

import { Logotype } from '../../ui/logotype';

import type { FC } from 'react';

const NavigationHeader: FC = () => {
  return (
    <>
      <header className="sticky top-0">
        <nav className="inline-flex w-full items-center justify-between bg-white py-2 pl-4 pr-1">
          <Logotype />
          <div className="p-2">
            <CircleUserRound size="20px" />
          </div>
        </nav>
      </header>
      <Outlet />
    </>
  );
};
export default NavigationHeader;
