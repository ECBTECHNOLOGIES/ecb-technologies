import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[980px] px-6 pb-24 pt-10 sm:pt-14">
      <Skeleton className="h-12 w-full max-w-lg" />
      <Skeleton className="mt-4 h-6 w-72" />
      <Skeleton className="mt-8 h-11 w-60 rounded-full" />
      <div className="mt-12 space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <Skeleton className="h-24 w-24 shrink-0 rounded-[18px] sm:h-36 sm:w-36" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
