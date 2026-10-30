import { CHILD_SITEMAPS, sitemapIndex, xmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export function GET() {
  return xmlResponse(sitemapIndex(CHILD_SITEMAPS));
}
