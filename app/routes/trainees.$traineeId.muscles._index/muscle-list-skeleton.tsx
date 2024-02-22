import { Skeleton } from "app/ui/skeleton";
import { FC } from "react";

export const MuscleListSkeleton: FC = () => {
  return (
    <ul className="inline-flex flex-col justify-start gap-4">
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
      <li>
        <Skeleton className="h-[88px]" />
      </li>
    </ul>
  )
}
