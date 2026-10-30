import { SITE_URL } from "@/lib/business";
import { getSitemapCategories, unavailableResponse, urlset, xmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET() {
  try {
    const categories = await getSitemapCategories();
    return xmlResponse(
      urlset(
        categories.map((category) => ({
          loc: `${SITE_URL}/products?category=${category.id}`,
          images: category.image?.src ? [category.image.src] : [],
        }))
      )
    );
  } catch (error) {
    console.error("categories sitemap failed:", error.message);
    return unavailableResponse();
  }
}
