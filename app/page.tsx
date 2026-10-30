import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import OurProducts from "@/components/OurProducts";
import StudentDeals from "@/components/StudentDeals";
import StoreVisit from "@/components/StoreVisit";
import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function ProductGridSkeleton() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
      <Skeleton className="h-9 w-48" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
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
      <Hero />
      <Suspense fallback={<ProductGridSkeleton />}>
        <OurProducts />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <StudentDeals />
      </Suspense>
      <StoreVisit />
    </>
  );
}
