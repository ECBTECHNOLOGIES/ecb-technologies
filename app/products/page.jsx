import { Suspense } from "react";
import { getCategories, getCategory, getInterleavedProductsWithCount } from "@/lib/woocommerce";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ProductFilters from "@/components/ProductFilters";
import CategoryTabs from "@/components/CategoryTabs";
import Pagination from "@/components/Pagination";
import Skeleton from "@/components/Skeleton";
import { decodeEntities, stripHtml, truncateAtWord } from "@/lib/utils";

function parsePage(value) {
  const page = parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

async function getActiveCategory(categoryId) {
  if (!categoryId || !/^\d+$/.test(String(categoryId))) return null;
  return getCategory(categoryId).catch(() => null);
}

// Only the plain category / deals / all-products listings (optionally
// paginated) are indexable. Search results, price ranges and sort orders are
// near-duplicates of those, so they're noindexed and canonicalised back to the
// listing they were filtered from - this stops Google wasting crawl budget on
// endless ?orderby=&min_price= combinations.
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const category = await getActiveCategory(params.category);

  let title = "Shop Laptops, Phones & Accessories in Kenya";
  let description =
    "Browse laptops, smartphones, computer and mobile accessories at ECB Technologies, Moi Avenue, Nairobi CBD. Prices in KSh, M-Pesa or card payment, delivery across Kenya.";
  const canonical = new URLSearchParams();

  if (category) {
    const name = decodeEntities(category.name);
    title = `${name} - Prices in Kenya`;
    const categoryDescription = decodeEntities(stripHtml(category.description ?? ""))
      .replace(/\s+/g, " ")
      .trim();
    description =
      categoryDescription.length >= 70
        ? truncateAtWord(categoryDescription)
        : `Shop ${name} at ECB Technologies, Moi Avenue, Nairobi CBD. Compare prices in KSh, pay with M-Pesa or card, pick up in store or get delivery across Kenya.`;
    canonical.set("category", String(category.id));
  } else if (params.on_sale === "true") {
    title = "Deals & Discounts on Electronics in Kenya";
    description =
      "Current deals on laptops, phones and accessories at ECB Technologies, Moi Avenue, Nairobi CBD. Pay with M-Pesa or card, delivery across Kenya.";
    canonical.set("on_sale", "true");
  }

  const isFiltered = Boolean(
    params.search || params.min_price || params.max_price || params.orderby || params.order
  );
  if (!isFiltered && page > 1) {
    canonical.set("page", String(page));
    title = `${title} - Page ${page}`;
  }

  const query = canonical.toString();
  const canonicalUrl = `/products${query ? `?${query}` : ""}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl },
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
}

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
      className="sticky top-[118px] z-30 bg-white px-4 pt-2 sm:hidden"
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
    ({ products, totalPages } = await getInterleavedProductsWithCount(params));
  } catch (error) {
    console.error("Failed to fetch products from WooCommerce:", error.message);
    products = [];
    totalPages = 0;
  }

  let heading = "All Products";
  let intro = "";
  if (params.search) {
    heading = `Search results for "${params.search}"`;
  } else if (params.on_sale === true) {
    heading = "Deals";
  } else if (params.category) {
    const category = await getActiveCategory(params.category);
    if (category) {
      heading = decodeEntities(category.name);
      // Owner-written category copy from WooCommerce, shown on page 1 only so
      // paginated pages don't repeat it.
      if (page === 1) intro = decodeEntities(stripHtml(category.description ?? "")).trim();
    }
  }

  return (
    <div className="flex-1">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-brand-blue">{heading}</h1>
        {intro && <p className="mt-2 max-w-3xl text-sm text-gray-600">{intro}</p>}
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          No products found. Try adjusting your filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

  const page = parsePage(params.page);
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
    <div className="pb-8 sm:px-6 sm:py-8 lg:px-10">
      <Suspense fallback={null}>
        <MobileCategoryTabs activeCategoryId={params.category} />
      </Suspense>

      <div className="flex flex-col gap-8 px-4 pt-4 sm:px-0 sm:pt-0 lg:flex-row">
        <div className="lg:sticky lg:top-24 lg:h-fit lg:self-start">
          <Suspense fallback={<FiltersSkeleton />}>
            <CategoryFilters />
          </Suspense>
        </div>

        <Suspense key={JSON.stringify(queryParams)} fallback={<ResultsSkeleton />}>
          <ProductResults params={queryParams} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
