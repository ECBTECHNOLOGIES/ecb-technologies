import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/woocommerce";

const BASE_URL = "https://www.ecbtechkenya.com";

async function getAllProducts() {
  const perPage = 100;
  let page = 1;
  let allProducts: Awaited<ReturnType<typeof getProducts>> = [];

  while (true) {
    const products = await getProducts({
      per_page: perPage,
      page,
      status: "publish",
      _fields: "slug,date_modified",
    });
    allProducts = allProducts.concat(products);
    if (products.length < perPage) break;
    page += 1;
  }

  return allProducts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories({ parent: 0 }),
    getAllProducts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily" as const, priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly" as const, priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter(
      (category: { slug: string; count: number; id: number }) =>
        category.slug !== "uncategorized" && category.count > 0
    )
    .map((category: { id: number }) => ({
      url: `${BASE_URL}/products?category=${category.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const productRoutes: MetadataRoute.Sitemap = products.map(
    (product: { slug: string; date_modified: string }) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.date_modified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  );

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
