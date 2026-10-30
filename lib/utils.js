// Tiny gray shimmer used as a blur-up placeholder for product/category images
// while the optimized image loads.
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+";

export function formatPrice(price) {
  const amount = Number(price);
  if (Number.isNaN(amount)) return "";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").trim();
}

// WooCommerce alt text when the owner has written one; otherwise the product
// name, numbered for extra gallery photos so each image has a distinct alt.
export function imageAlt(image, productName, index = 0) {
  const alt = decodeEntities(image?.alt ?? "").trim();
  if (alt) return alt;
  return index === 0 ? productName : `${productName} - photo ${index + 1}`;
}

// Shortens text for meta descriptions without cutting a word in half.
export function truncateAtWord(text, maxLength = 160) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:-]+$/, "")}…`;
}

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// Decodes HTML entities (e.g. "Gaming &amp; Computing" -> "Gaming & Computing")
// returned by the WordPress REST API, without relying on browser-only APIs.
export function decodeEntities(str = "") {
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCharCode(code);
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}
