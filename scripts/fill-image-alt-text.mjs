// Fills in missing alt text on WooCommerce product images, so Google Images
// and screen readers get a description instead of an empty alt.
//
// Only images whose alt text is EMPTY are touched - alt text someone has
// already written is never overwritten. The alt is built from the product's
// own name (which carries brand, model and key specs), e.g.
//   "HP EliteBook 840 G5 Core i5 8GB RAM 256GB SSD"
//   "HP EliteBook 840 G5 Core i5 8GB RAM 256GB SSD - photo 2"
//
// Alt text lives on the image (WordPress attachment), so an image shared by
// several products is labelled once, from the first product that uses it.
//
// Usage:
//   node --env-file=.env.local scripts/fill-image-alt-text.mjs          # dry run: prints what would change
//   node --env-file=.env.local scripts/fill-image-alt-text.mjs --apply  # writes the changes

import axios from "axios";

const APPLY = process.argv.includes("--apply");
const MAX_ALT_LENGTH = 125;

const baseURL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    consumer_key: process.env.WC_CONSUMER_KEY,
    consumer_secret: process.env.WC_CONSUMER_SECRET,
  };
  return config;
});

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function cleanName(name = "") {
  return name
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
      if (entity[0] === "#") {
        const code =
          entity[1] === "x" || entity[1] === "X"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isNaN(code) ? match : String.fromCharCode(code);
      }
      return NAMED_ENTITIES[entity] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function buildAlt(productName, index) {
  const suffix = index === 0 ? "" : ` - photo ${index + 1}`;
  const room = MAX_ALT_LENGTH - suffix.length;
  const base =
    productName.length <= room
      ? productName
      : productName.slice(0, productName.lastIndexOf(" ", room)).trim();
  return `${base}${suffix}`;
}

async function getAllProducts() {
  const perPage = 100;
  let page = 1;
  let products = [];
  while (true) {
    const { data } = await api.get("/products", {
      params: { per_page: perPage, page, status: "publish", _fields: "id,name,images" },
    });
    products = products.concat(data);
    console.log(`Fetched page ${page} (${data.length} products)...`);
    if (data.length < perPage) break;
    page++;
  }
  return products;
}

async function main() {
  const products = await getAllProducts();
  const labelled = new Set();
  let imagesTotal = 0;
  let alreadyHadAlt = 0;
  let filled = 0;
  let productsUpdated = 0;
  let failures = 0;

  for (const product of products) {
    const name = cleanName(product.name);
    const images = product.images ?? [];
    imagesTotal += images.length;

    let changed = false;
    // The whole gallery must be sent back in order, or WooCommerce would
    // drop the images left out.
    const updatedImages = images.map((image, index) => {
      if (image.alt?.trim()) {
        alreadyHadAlt++;
        return { id: image.id };
      }
      if (labelled.has(image.id)) return { id: image.id };

      labelled.add(image.id);
      changed = true;
      filled++;
      const alt = buildAlt(name, index);
      console.log(`  #${product.id} image ${image.id}: "${alt}"`);
      return { id: image.id, alt };
    });

    if (!changed || !APPLY) continue;

    try {
      await api.put(`/products/${product.id}`, { images: updatedImages });
      productsUpdated++;
    } catch (error) {
      failures++;
      console.error(
        `  Failed to update product #${product.id} (${name}): ${error.response?.status ?? error.message}`
      );
    }
  }

  console.log(`\nProducts checked: ${products.length}`);
  console.log(`Images checked: ${imagesTotal}`);
  console.log(`Already had alt text (left unchanged): ${alreadyHadAlt}`);
  console.log(`Missing alt text ${APPLY ? "filled" : "that would be filled"}: ${filled}`);
  if (APPLY) {
    console.log(`Products updated: ${productsUpdated}, failures: ${failures}`);
  } else {
    console.log("\nDry run only. Re-run with --apply to write these changes.");
  }
}

main().catch((error) => {
  console.error(error.response?.data ?? error.message);
  process.exit(1);
});
