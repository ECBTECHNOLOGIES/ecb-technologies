import { BUSINESS } from "@/lib/business";
import { truncateAtWord } from "@/lib/utils";

// Default share image (1200x630) in /public, used wherever a page has no
// product photo of its own.
export const DEFAULT_SHARE_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${BUSINESS.name} - laptops, phones and accessories on Moi Avenue, Nairobi CBD`,
};

export const SITE_TITLE = "Laptops & Phones Shop in Nairobi CBD | ECB Technologies";
export const SITE_DESCRIPTION =
  "Laptops, phones and accessories at Techmart Iconic Business Plaza, Moi Avenue, Nairobi CBD. Pay by M-Pesa or card. Store pickup or delivery across Kenya.";

const BRAND_SUFFIX = ` | ${BUSINESS.name}`;
const MAX_TITLE = 60;

// Keeps <title> within ~60 characters: appends the brand only when it fits.
export function fitTitle(title) {
  return title.length + BRAND_SUFFIX.length <= MAX_TITLE ? `${title}${BRAND_SUFFIX}` : title;
}

// Next merges metadata shallowly, so a page that sets openGraph would drop the
// layout's siteName/locale/type. Every indexable page builds its metadata
// here so canonical, Open Graph and Twitter tags are always complete.
export function pageMetadata({ title, description, path, images = undefined, robots = undefined }) {
  const shareImages = images?.length ? images : [DEFAULT_SHARE_IMAGE];
  const fullTitle = title.endsWith(BRAND_SUFFIX) ? title : fitTitle(title);
  const metaDescription = truncateAtWord(description, 160);

  return {
    title: { absolute: fullTitle },
    description: metaDescription,
    alternates: { canonical: path },
    robots,
    openGraph: {
      type: "website",
      siteName: BUSINESS.name,
      locale: "en_KE",
      url: path,
      title: fullTitle,
      description: metaDescription,
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: shareImages.map((image) => image.url),
    },
  };
}
