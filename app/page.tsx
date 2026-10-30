import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import OurProducts from "@/components/OurProducts";
import StudentDeals from "@/components/StudentDeals";
import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
      <Hero />
      <Suspense fallback={<ProductGridSkeleton />}>
        <OurProducts />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <StudentDeals />
      </Suspense>
    </>
  );
}
