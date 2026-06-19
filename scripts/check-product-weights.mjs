// Checks what percentage of WooCommerce products have a non-empty/non-zero
// weight value set, to decide whether per-product weight-based shipping
// surcharges are currently feasible.
//
// Usage: node --env-file=.env.local scripts/check-product-weights.mjs

import axios from "axios";

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

async function main() {
  const perPage = 100;
  let page = 1;
  let total = 0;
  let withWeight = 0;
  let missingOrZero = 0;
  const missingSamples = [];

  while (true) {
    const { data, headers } = await api.get("/products", {
      params: { per_page: perPage, page, status: "any" },
    });
    if (page === 1) {
      total = Number(headers["x-wp-total"] ?? data.length);
    }
    if (data.length === 0) break;

    for (const p of data) {
      const weight = parseFloat(p.weight);
      if (p.weight && !Number.isNaN(weight) && weight > 0) {
        withWeight++;
      } else {
        missingOrZero++;
        if (missingSamples.length < 15) {
          missingSamples.push(`${p.id} - ${p.name} (weight="${p.weight}")`);
        }
      }
    }

    console.log(`Checked page ${page} (${data.length} products)...`);
    if (data.length < perPage) break;
    page++;
  }

  const checked = withWeight + missingOrZero;
  console.log(`\nTotal products checked: ${checked} (store reports ${total} total)`);
  console.log(`With weight set: ${withWeight} (${((withWeight / checked) * 100).toFixed(1)}%)`);
  console.log(`Missing/zero weight: ${missingOrZero} (${((missingOrZero / checked) * 100).toFixed(1)}%)`);
  console.log("\nSample of products missing weight:");
  missingSamples.forEach((s) => console.log(`  - ${s}`));
}

main().catch((error) => {
  console.error("Failed:", error.response?.data ?? error.message);
  process.exit(1);
});
