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
