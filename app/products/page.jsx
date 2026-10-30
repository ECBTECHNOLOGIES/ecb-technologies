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

async function CategoryChips({ activeCategoryId }) {
  const categories = await getFilteredCategories();
  if (!categories.length) return null;

  return (
    <CategoryTabs
      categories={[{ id: "", name: "All" }, ...categories]}
      activeCategoryId={activeCategoryId}
    />
  );
}

async function ListingHeader({ params, page }) {
  let heading = "All products";
  let intro = "";
  if (params.search) {
    heading = `Results for \u201c${params.search}\u201d`;
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
    <div>
      <h1 className="type-hero text-ink">{heading}</h1>
      {intro && <p className="type-lead mt-3 max-w-3xl text-ink-80">{intro}</p>}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function ProductResults({ params, page }) {
  let products = [];
  let totalPages = 0;
  let total = 0;

  try {
    ({ products, totalPages, total } = await getInterleavedProductsWithCount(params));
  } catch (error) {
    console.error("Failed to fetch products from WooCommerce:", error.message);
    products = [];
    totalPages = 0;
  }

  if (products.length === 0) {
    return (
      <p className="type-lead py-24 text-center text-ink-48">
        No products match. Try another category or clear the price filter.
      </p>
    );
  }

  return (
    <>
      <p className="type-caption mb-6 text-ink-48">
        {total} {total === 1 ? "product" : "products"}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} searchParams={params} />
    </>
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
    <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-10 sm:pt-14 lg:px-8">
      <Suspense fallback={<Skeleton className="h-12 w-64" />}>
        <ListingHeader params={queryParams} page={page} />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-9 w-full max-w-xl rounded-full" />}>
          <CategoryChips activeCategoryId={params.category} />
        </Suspense>
      </div>

      <div className="mt-4 border-b border-hairline pb-4">
        <Suspense fallback={<div className="h-9" />}>
          <ProductFilters />
        </Suspense>
      </div>

      <div className="mt-6">
        <Suspense key={JSON.stringify(queryParams)} fallback={<ResultsSkeleton />}>
          <ProductResults params={queryParams} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
