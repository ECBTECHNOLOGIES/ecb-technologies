import { Suspense } from "react";
import HeroSlider from "@/components/HeroSlider";
import FeaturedCategories from "@/components/FeaturedCategories";
import StudentDeals from "@/components/StudentDeals";
import FeaturedProducts from "@/components/FeaturedProducts";
import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

function CategoriesSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <Skeleton className="h-7 w-48" />
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-lg bg-white p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-7 w-48" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSlider />
      <Suspense fallback={<CategoriesSkeleton />}>
        <FeaturedCategories />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <StudentDeals />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
