import { SITE_URL } from "@/lib/business";
import { getSitemapProducts, unavailableResponse, urlset, xmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

// Every published product, with its photos as image-sitemap entries.
export async function GET() {
  try {
    const products = await getSitemapProducts();
    return xmlResponse(
      urlset(
        products.map((product) => ({
          loc: `${SITE_URL}/products/${product.slug}`,
          lastModified: product.date_modified,
          images: (product.images ?? []).map((image) => image.src).filter(Boolean),
        }))
      )
    );
  } catch (error) {
    console.error("products sitemap failed:", error.message);
    return unavailableResponse();
  }
}
