import { SITE_URL } from "@/lib/business";
import { getCategories, getProducts } from "@/lib/woocommerce";

// XML sitemap system: /sitemap.xml is an index pointing at one sitemap per
// page family, so a WooCommerce outage can only ever affect the catalogue
// sitemaps - the static pages sitemap is always served.

export const SITEMAP_REVALIDATE_SECONDS = 3600;

export const CHILD_SITEMAPS = ["pages", "categories", "products"];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function xmlResponse(body) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// A failed catalogue fetch returns 503 rather than an empty sitemap, so
// search engines retry later instead of thinking every product vanished.
export function unavailableResponse() {
  return new Response("Sitemap temporarily unavailable", {
    status: 503,
    headers: { "Retry-After": "3600" },
  });
}

export function sitemapIndex(names, lastModified = new Date()) {
  const entries = names
    .map(
      (name) =>
        `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/${name}.xml</loc>\n    <lastmod>${lastModified.toISOString()}</lastmod>\n  </sitemap>`
    )
    .join("\n");
  return `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}

export function urlset(urls) {
  const hasImages = urls.some((url) => url.images?.length);
  const entries = urls
    .map((url) => {
      const lines = [`    <loc>${escapeXml(url.loc)}</loc>`];
      if (url.lastModified) lines.push(`    <lastmod>${new Date(url.lastModified).toISOString()}</lastmod>`);
      for (const image of url.images ?? []) {
        lines.push(`    <image:image>\n      <image:loc>${escapeXml(image)}</image:loc>\n    </image:image>`);
      }
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");
  const imageNs = hasImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : "";
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>\n${entries}\n</urlset>`;
}

export const STATIC_PAGES = ["/", "/products", "/products?on_sale=true", "/delivery", "/contact"];

async function fetchAllPages(fetchPage) {
  const perPage = 100;
  let page = 1;
  let all = [];
  while (true) {
    const batch = await fetchPage({ per_page: perPage, page });
    all = all.concat(batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return all;
}

export async function getSitemapCategories() {
  const categories = await fetchAllPages((params) => getCategories(params));
  return categories.filter((category) => category.slug !== "uncategorized" && category.count > 0);
}

export async function getSitemapProducts() {
  return fetchAllPages((params) =>
    getProducts({ ...params, status: "publish", _fields: "slug,date_modified,images" })
  );
}
