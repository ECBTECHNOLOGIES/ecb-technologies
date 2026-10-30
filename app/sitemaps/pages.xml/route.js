import { SITE_URL } from "@/lib/business";
import { STATIC_PAGES, urlset, xmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export function GET() {
  return xmlResponse(urlset(STATIC_PAGES.map((path) => ({ loc: `${SITE_URL}${path === "/" ? "" : path}` }))));
}
