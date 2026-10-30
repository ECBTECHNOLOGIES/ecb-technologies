import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-8 sm:pt-12">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-4 h-12 w-56" />
      <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:gap-16">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-6 h-20 w-full rounded-[18px]" />
          <Skeleton className="h-20 w-full rounded-[18px]" />
        </div>
        <Skeleton className="h-72 w-full rounded-[18px] lg:w-[360px]" />
      </div>
    </div>
  );
}
