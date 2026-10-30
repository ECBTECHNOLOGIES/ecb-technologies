import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-10 sm:pt-14 lg:px-8">
      <Skeleton className="h-12 w-64" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
