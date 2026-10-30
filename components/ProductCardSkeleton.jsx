import Skeleton from "./Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-square w-full rounded-[18px]" />
      <div className="mt-4 space-y-2 px-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
