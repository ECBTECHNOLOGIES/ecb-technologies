import { Suspense } from "react";
import { getCategories, getProductsWithCount } from "@/lib/woocommerce";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ProductFilters from "@/components/ProductFilters";
import CategoryTabs from "@/components/CategoryTabs";
import Pagination from "@/components/Pagination";
import Skeleton from "@/components/Skeleton";
import { decodeEntities } from "@/lib/utils";

export const metadata = {
  title: "Shop Products | ECB Technologies",
};

async function getFilteredCategories() {
  try {
    const categories = await getCategories({ parent: 0, orderby: "count", order: "desc" });
    return categories.filter(
      (category) => category.slug !== "uncategorized" && category.count > 0
    );
  } catch {
    return [];
  }
}

async function CategoryFilters() {
  const categories = await getFilteredCategories();
  return <ProductFilters categories={categories} />;
}

async function MobileCategoryTabs({ activeCategoryId }) {
  const categories = (await getFilteredCategories()).filter(
    (category) => category.id !== 274
  );

  if (!categories.length) return null;

  return (
    <CategoryTabs
      categories={[{ id: "", name: "All Products" }, ...categories]}
      activeCategoryId={activeCategoryId}
      className="mb-4 sm:hidden"
    />
  );
}

function FiltersSkeleton() {
  return (
    <div className="w-full shrink-0 space-y-4 lg:w-64">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex-1">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

async function ProductResults({ params, page }) {
  let products = [];
  let totalPages = 0;

  try {
    ({ products, totalPages } = await getProductsWithCount(params));
  } catch (error) {
    console.error("Failed to fetch products from WooCommerce:", error.message);
    products = [];
    totalPages = 0;
  }

  let heading = "All Products";
  if (params.search) {
    heading = `Search results for "${params.search}"`;
  } else if (params.on_sale === true) {
    heading = "Deals";
  } else if (params.category) {
    const categories = await getFilteredCategories();
    heading = decodeEntities(
      categories.find((c) => String(c.id) === params.category)?.name ?? "All Products"
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-4">
        <h1
          className={`text-2xl font-bold ${
            params.category ? "text-brand-blue" : "text-gray-900"
          }`}
        >
          {heading}
        </h1>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          No products found. Try adjusting your filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const queryParams = {
    per_page: 12,
    page,
    status: "publish",
    orderby: params.orderby ?? "date",
    order: params.order ?? "desc",
  };

  if (params.category) queryParams.category = params.category;
  if (params.search) queryParams.search = params.search;
  if (params.min_price) queryParams.min_price = params.min_price;
  if (params.max_price) queryParams.max_price = params.max_price;
  if (params.on_sale === "true") queryParams.on_sale = true;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <MobileCategoryTabs activeCategoryId={params.category} />
      </Suspense>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense fallback={<FiltersSkeleton />}>
          <CategoryFilters />
        </Suspense>

        <Suspense key={JSON.stringify(queryParams)} fallback={<ResultsSkeleton />}>
          <ProductResults params={queryParams} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
