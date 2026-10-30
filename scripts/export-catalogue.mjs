// Exports the WooCommerce catalogue to a CSV with SEO/catalogue issues
// flagged per product - the input for the catalogue audit (prices, missing
// brands, thin descriptions, missing specs, missing alt text, duplicates).
// Read-only: nothing in WooCommerce is changed.
//
// Usage: node --env-file=.env.local scripts/export-catalogue.mjs [output.csv]
// Default output: catalogue-export.csv (contains no customer data).

import axios from "axios";
import { writeFile } from "node:fs/promises";

const OUTPUT = process.argv[2] ?? "catalogue-export.csv";
const SITE_URL = "https://www.ecbtechkenya.com";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3`,
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

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
const wordCount = (html) => stripHtml(html).split(/\s+/).filter(Boolean).length;
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const normaliseName = (name) => stripHtml(name).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function getAll(path, params = {}) {
  const perPage = 100;
  let page = 1;
  let all = [];
  while (true) {
    const { data } = await api.get(path, { params: { per_page: perPage, page, ...params } });
    all = all.concat(data);
    if (data.length < perPage) break;
    page++;
  }
  return all;
}

async function main() {
  const products = await getAll("/products", { status: "any" });
  console.log(`Fetched ${products.length} products.`);

  const nameCounts = new Map();
  for (const p of products) {
    const key = normaliseName(p.name);
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  const rows = [];
  const issueTotals = new Map();

  for (const p of products) {
    let variations = [];
    if (p.type === "variable") {
      variations = await getAll(`/products/${p.id}/variations`).catch(() => []);
    }

    const specs = (p.attributes ?? []).filter((a) => !a.variation && a.visible !== false);
    const options = (p.attributes ?? []).filter((a) => a.variation);
    const images = p.images ?? [];
    const missingAlt = images.filter((img) => !img.alt?.trim()).length;
    const variationPrices = variations.map((v) => Number(v.price)).filter((n) => n > 0);
    const descWords = wordCount(p.description);
    const shortWords = wordCount(p.short_description);
    const brand = p.brands?.map((b) => b.name).join("|") ?? "";

    const issues = [];
    if (p.status !== "publish") issues.push(`status:${p.status}`);
    if (p.type !== "variable" && !(Number(p.price) > 0)) issues.push("zero_or_missing_price");
    if (p.type === "variable" && !variationPrices.length) issues.push("variations_without_price");
    if (p.on_sale && Number(p.sale_price) >= Number(p.regular_price)) issues.push("sale_not_below_regular");
    if (!brand) issues.push("missing_brand");
    if (!images.length) issues.push("no_images");
    if (missingAlt) issues.push("images_missing_alt");
    if (!p.sku) issues.push("missing_sku");
    if (specs.length < 2) issues.push("few_spec_attributes");
    if (descWords < 80) issues.push("thin_description");
    if (!shortWords) issues.push("no_short_description");
    if (nameCounts.get(normaliseName(p.name)) > 1) issues.push("duplicate_name");
    if (p.stock_status !== "instock") issues.push(`stock:${p.stock_status}`);
    for (const issue of issues) issueTotals.set(issue.split(":")[0], (issueTotals.get(issue.split(":")[0]) ?? 0) + 1);

    rows.push({
      id: p.id,
      name: stripHtml(p.name).trim(),
      url: `${SITE_URL}/products/${p.slug}`,
      status: p.status,
      type: p.type,
      sku: p.sku,
      price: p.type === "variable" && variationPrices.length
        ? `${Math.min(...variationPrices)}-${Math.max(...variationPrices)}`
        : p.price,
      regular_price: p.regular_price,
      sale_price: p.sale_price,
      stock_status: p.stock_status,
      categories: (p.categories ?? []).map((c) => c.name).join("|"),
      brand,
      spec_attributes: specs.map((a) => `${a.name}=${a.options.join("/")}`).join("; "),
      option_attributes: options.map((a) => `${a.name}=${a.options.join("/")}`).join("; "),
      variations: variations.length,
      images: images.length,
      images_missing_alt: missingAlt,
      short_description_words: shortWords,
      description_words: descWords,
      date_modified: p.date_modified,
      issues: issues.join(" "),
    });
  }

  const headers = Object.keys(rows[0] ?? { id: "" });
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(","))].join("\n");
  await writeFile(OUTPUT, csv);

  console.log(`\nWrote ${rows.length} rows to ${OUTPUT}\n\nIssue counts:`);
  for (const [issue, count] of [...issueTotals.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${issue}: ${count}`);
  }
}

main().catch((error) => {
  console.error(error.response?.data ?? error.message);
  process.exit(1);
});
