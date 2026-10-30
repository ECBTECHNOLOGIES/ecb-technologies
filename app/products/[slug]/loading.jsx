import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-6 lg:px-8">
      <Skeleton className="h-3 w-48" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <Skeleton className="aspect-square w-full rounded-[18px]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-8 h-12 w-full rounded-full" />
          <Skeleton className="mt-8 h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
