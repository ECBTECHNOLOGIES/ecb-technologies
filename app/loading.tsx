import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <>
      <section className="flex flex-col items-center px-6 pb-14 pt-14 sm:pt-20">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-12 w-full max-w-xl" />
        <Skeleton className="mt-4 h-6 w-full max-w-md" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </section>

      <section className="bg-parchment py-14">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <Skeleton className="h-9 w-48" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
