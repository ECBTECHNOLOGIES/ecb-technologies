// AI-readable versions of the shop (served by the ecb-speed Worker).
//
// - /<page>.md, /index.md, or any public page with "Accept: text/markdown"
//   (text/markdown must out-rank text/html), or /api/md/<path>: a clean
//   markdown version of the page, built from the same data the HTML shows.
// - /api/md/_catalog: every markdown URL (JSON).
// - /llms.txt (llmstxt.org), /llms-full.txt (all core pages + the whole
//   product list in one file), /ai.txt (usage policy).
//
// Markdown responses are noindex with the HTML page as canonical, so search
// engines keep indexing the HTML. Keep llms.txt, ai.txt and robots.txt
// (cloudflare-worker-sitemap.js) in sync.
//
// To give a new page type a markdown version: add a renderer to RENDERERS
// (pattern -> function returning { title, summary, body }).

import { CATEGORIES, CATEGORY_OF } from "./catalog-map.js";
import { SITE, SOCIALS, decode, parseKsh } from "./seo.js";

const SITE_NAME = "ECB Technologies";
const SITE_DESCRIPTION =
  "Electronics shop in Nairobi CBD, Kenya, selling genuine laptops, smartphones, printers, gaming gear and accessories, with prices in Kenyan shillings (KSh).";
const FACTS = [
  "Shop: Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, Nairobi CBD, Kenya",
  "Phone and WhatsApp: +254717040531 (0717 040 531)",
  "Email: ecbtechnologies001@gmail.com",
  "Opening hours: Monday to Saturday, 9am to 7pm; closed on Sunday",
  "Payment: M-Pesa or card",
  "Delivery: rider delivery within Nairobi, courier delivery to all 47 counties, free pickup at the shop",
];

// Info pages: path -> [title, one-line summary].
export const INFO_PAGES = {
  "/about": ["About ECB Technologies", "Who ECB Technologies is and how the shop in Nairobi CBD works."],
  "/contact": ["Contact ECB Technologies", "Address, phone, WhatsApp, email and opening hours of the shop on Moi Avenue, Nairobi CBD."],
  "/faq": ["Frequently asked questions", "Answers about ordering, accounts, returns and support at ECB Technologies."],
  "/delivery": ["Delivery across Kenya", "How ECB Technologies delivers: riders in Nairobi, courier to all 47 counties, free pickup in Nairobi CBD."],
  "/laptop-prices-in-kenya": ["Laptop prices in Kenya", "Laptop prices at ECB Technologies by budget, brand and processor."],
  "/student-laptops-kenya": ["Student laptops under KSh 40,000 in Kenya", "Laptops with an 8th-gen or newer Core i5/i7 at KSh 40,000 or less."],
  "/hp-vs-dell-vs-lenovo-laptops-kenya": ["HP vs Dell vs Lenovo laptops in Kenya", "Models, starting prices and series of HP, Dell and Lenovo laptops at ECB Technologies."],
  "/privacy": ["Privacy policy", "How ECB Technologies collects and uses personal information."],
  "/terms": ["Terms and conditions", "The terms for buying from ECB Technologies."],
};
const CORE = ["/", "/about", "/contact", "/delivery", "/faq"];
// Order of llms-full.txt: core pages, guides, legal.
const GUIDES = ["/laptop-prices-in-kenya", "/student-laptops-kenya", "/hp-vs-dell-vs-lenovo-laptops-kenya"];
const LEGAL = ["/privacy", "/terms"];
export const CORE_PAGES = [...CORE, ...GUIDES, ...LEGAL];
// Categories with products (the TVs category is empty and noindex).
export const LISTED_CATEGORIES = CATEGORIES.filter(([slug]) => slug !== "TV-and-Home-Appliances");

// ---------- routing ----------

// Paths that have a markdown version (allowlist).
export function isContentPath(path) {
  return (
    path === "/" ||
    !!INFO_PAGES[path] ||
    path === "/category" ||
    /^\/category\/[A-Za-z0-9-]+(\/[A-Za-z0-9-]+)?$/.test(path) ||
    /^\/item\/[A-Za-z0-9-]+$/.test(path) ||
    /^\/research(\/[a-z0-9-]+)?$/.test(path) ||
    /^\/(guides|laptop-shop-nairobi|categories|best\/[a-z0-9-]+|compare\/[a-z0-9-]+|series\/[a-z0-9-]+|laptops\/[a-z0-9-]+)$/.test(path)
  );
}

// Markdown wins only when the client ranks text/markdown above text/html.
export function wantsMarkdown(accept) {
  if (!accept) return false;
  let md = 0;
  let html = 0;
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().toLowerCase().split(";").map((x) => x.trim());
    const qp = params.find((p) => p.startsWith("q="));
    const q = qp ? Number(qp.slice(2)) || 0 : 1;
    if (type === "text/markdown" || type === "text/x-markdown") md = Math.max(md, q);
    else if (type === "text/html" || type === "application/xhtml+xml") html = Math.max(html, q);
    else if ((type === "text/*" || type === "*/*") && html === 0) html = Math.max(html, q * 0.999);
  }
  return md > 0 && md > html;
}

export const mdPathFor = (path) => (path === "/" ? "/index.md" : `${path}.md`);

// ---------- formatting ----------

const absUrl = (u) => {
  try {
    return new URL(u, SITE + "/").toString();
  } catch {
    return u;
  }
};
const esc = (t) => String(t).replace(/([\[\]])/g, "\\$1");
const link = (text, url) => `[${esc(text)}](${absUrl(url)})`;
const ksh = (n) => (n ? `KSh ${n.toLocaleString("en-US")}` : "");

function inline(html) {
  return decode(
    String(html)
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m, h, t) => {
        const text = decode(t);
        return text ? ` ${link(text, h)} ` : " ";
      })
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, t) => (decode(t) ? ` **${decode(t)}** ` : " "))
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, t) => (decode(t) ? ` *${decode(t)}* ` : " "))
  )
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\*\*\s+\*\*/g, " ")
    .trim();
}

function tableToMd(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => inline(c[1]).replace(/\|/g, "\\|") || " ")
  );
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r) => r.concat(Array(width - r.length).fill(" "));
  const [head, ...body] = rows.map(pad);
  return ["", `| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...body.map((r) => `| ${r.join(" | ")} |`), ""].join("\n");
}

export function htmlToMd(html) {
  let s = String(html)
    .replace(/<(script|style|noscript|svg|button|form)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const blocks = [];
  const keep = (md) => `\u0000${blocks.push(md) - 1}\u0000`;
  s = s.replace(/<table\b[\s\S]*?<\/table>/gi, (t) => keep(`\n\n${tableToMd(t)}\n\n`));
  s = s.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (m, l, t) => {
    const text = inline(t);
    return text ? keep(`\n\n${"#".repeat(Math.min(4, Math.max(2, Number(l))))} ${text}\n\n`) : "";
  });
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (m, t) => keep(`\n- ${inline(t)}`));
  s = s.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (m, t) => {
    const parts = t.split(/<br\s*\/?>/i).map(inline).filter(Boolean);
    return parts.length ? keep(`\n\n${parts.join("  \n")}\n\n`) : "";
  });
  s = s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(div|ul|ol|section|article)>/gi, "\n\n");
  s = inline(s.replace(/\u0000(\d+)\u0000/g, (m, i) => `\u0001${i}\u0001`)).replace(/\u0001(\d+)\u0001/g, (m, i) => blocks[i]);
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => blocks[i]).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function page({ title, summary, canonical, body, related }) {
  const lines = [`# ${title}`, "", `> ${summary}`, "", `Canonical: ${canonical}`, `Last updated: ${new Date().toISOString().slice(0, 10)}`, "", body.trim()];
  if (related && related.length) lines.push("", "## Related", ...related.map(([t, u]) => `- ${link(t, u)}`));
  return lines.join("\n") + "\n";
}

// ---------- data from the shop's HTML ----------

export function productCards(html) {
  const out = [];
  for (const card of html.split('<div class="ecb-fp-card"').slice(1)) {
    const a = card.match(/href="(https:\/\/www\.ecbtechkenya\.com\/item\/([A-Za-z0-9-]+))"/);
    const name = card.match(/class="ecb-fp-name">\s*([^<]+?)\s*</);
    const price = card.match(/class="ecb-fp-price">\s*([^<]+?)\s*</);
    if (a && name) out.push({ url: a[1], slug: a[2], name: decode(name[1]).replace(/\.\.\.$/, "…"), price: parseKsh(price && price[1]) });
  }
  return out;
}

// ---------- renderers ----------

function renderHome(html) {
  const featured = productCards(html).slice(0, 8);
  const body = [
    SITE_DESCRIPTION,
    "",
    "## Shop facts",
    ...FACTS.map((f) => `- ${f}`),
    "",
    "## Categories",
    ...LISTED_CATEGORIES.map(([slug, name]) => `- ${link(name, `/category/${slug}`)}`),
    `- ${link("All products", "/category")}`,
    "",
    "## Featured products",
    ...featured.map((p) => `- ${link(p.name, p.url)} - ${ksh(p.price)}`),
    "",
    "## Buying guides",
    ...GUIDES.map((g) => `- ${link(INFO_PAGES[g][0], g)} - ${INFO_PAGES[g][1]}`),
  ].join("\n");
  return {
    title: "ECB Technologies - Laptops & Phones Shop in Nairobi CBD",
    summary: "Genuine laptops, smartphones, printers and accessories with prices in KSh, at Techmart Iconic Business Plaza, Moi Avenue, Nairobi CBD.",
    body,
    related: [["Contact and directions", "/contact"], ["Delivery across Kenya", "/delivery"], ["All products", "/category"]],
  };
}

function renderProduct(html, seo) {
  const p = seo.product || {};
  const sku = (html.match(/ecb-pd-meta-label">SKU<\/span>\s*<span class="ecb-pd-meta-value">([^<]*)</) || [])[1];
  const body = html.split('<div class="ecb-pd-description-body">')[1] || "";
  const descHtml = body.split(/<div class="ecb-pd-(?:rating|review)|<\/section>/)[0];
  const intro = (html.match(/<h2 class="ecb-price-intro">[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/) || [])[1];
  const rest = descHtml.replace(/<h2 class="ecb-price-intro">[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/, "");
  const specs = [...rest.matchAll(/<(?:strong|b)>([^<]{1,60}?):?\s*<\/(?:strong|b)>\s*:?\s*([\s\S]*?)(?=<(?:strong|b)>|<\/p>|$)/gi)]
    .map((m) => [decode(m[1]).replace(/:$/, ""), inline(m[2].replace(/<br\s*\/?>/gi, " "))])
    .filter(([k, v]) => k && v);
  const facts = [
    ["Price", p.price && p.price < 2000000 ? ksh(p.price) : "See the product page"],
    ["Availability", p.outStock ? "Out of stock" : "In stock"],
    p.category ? ["Category", link(p.category[1], `/category/${p.category[0]}`)] : null,
    sku ? ["SKU", sku] : null,
    ["Seller", "ECB Technologies, Moi Avenue, Nairobi CBD"],
  ].filter(Boolean);
  const lines = [
    "| | |",
    "| --- | --- |",
    ...facts.map(([k, v]) => `| ${k} | ${v} |`),
    "",
    intro ? inline(intro) : "",
    "",
  ];
  if (specs.length) lines.push("## Specifications", "", "| Spec | Value |", "| --- | --- |", ...specs.map(([k, v]) => `| ${k.replace(/\|/g, "\\|")} | ${v.replace(/\|/g, "\\|")} |`));
  else if (rest.trim()) lines.push("## Description", "", htmlToMd(rest));
  if (p.image) lines.push("", "## Photo", "", `![${esc(p.name)}](${p.image})`);
  lines.push("", "## How to buy", "", "- Order online on the product page, or on WhatsApp: +254717040531", "- Pay by M-Pesa or card", "- Free pickup in Nairobi CBD, rider delivery in Nairobi, courier to all 47 counties");
  return {
    title: p.name || seo.title,
    summary: seo.description || `${p.name} at ECB Technologies, Nairobi CBD.`,
    body: lines.join("\n"),
    related: [p.category ? [`More ${p.category[1]}`, `/category/${p.category[0]}`] : ["All products", "/category"], ["Delivery across Kenya", "/delivery"]],
  };
}

function renderCategory(html, seo, url) {
  const c = seo.category || {};
  const items = productCards(html);
  const page = Number(url.searchParams.get("page") || 1);
  const pages = Math.max(1, ...[...html.matchAll(/[?&]page=(\d+)/g)].map((m) => Number(m[1])));
  const lines = [`${c.count || items.length} products. Prices in KSh. Page ${page} of ${pages}.`, "", ...items.map((p) => `- ${link(p.name, p.url)} - ${ksh(p.price)}`)];
  if (page < pages) lines.push("", `Next page: ${link(`Page ${page + 1}`, `${url.pathname}.md?page=${page + 1}`)}`);
  return {
    title: c.name ? `${c.name} - prices in Kenya` : "All products",
    summary: seo.description || `${c.name} at ECB Technologies, Nairobi CBD, with prices in KSh.`,
    body: lines.join("\n"),
    related: LISTED_CATEGORIES.map(([slug, name]) => [name, `/category/${slug}`]),
  };
}

function renderInfo(html, path) {
  const [title, summary] = INFO_PAGES[path];
  let body = "";
  if (path === "/faq") {
    body = [...html.matchAll(/<button class="accordion-button[^"]*"[^>]*>([\s\S]*?)<\/button>[\s\S]*?<div class="accordion-body">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi)]
      .map((m) => `### ${inline(m[1])}\n\n${htmlToMd(m[2]).replace(/^#+ .*\n+/gm, "")}`)
      .join("\n\n");
  } else if (path === "/contact") {
    body = ["## Shop details", ...FACTS.map((f) => `- ${f}`), "", `Map and directions: ${link("Google Business Profile", "https://share.google/56ymLkB3i6DS0HHvJ")}`].join("\n");
  } else {
    const start = html.split('<div class="ecb-about-lead-body">')[1] || "";
    body = htmlToMd(start.split(/<div class="ecb-about-(?!lead)|<\/main>/)[0]);
  }
  return { title, summary, body, related: [["Home", "/"], ["Contact", "/contact"], ["Delivery", "/delivery"]] };
}

// path -> { title, summary, body, related } from the shop's HTML for that path.
export function renderPath(path, url, html, seo) {
  if (path === "/") return renderHome(html);
  if (INFO_PAGES[path]) return renderInfo(html, path);
  if (path.startsWith("/item/")) return renderProduct(html, seo);
  if (path === "/category" || path.startsWith("/category/")) return renderCategory(html, seo, url);
  return null;
}

export function markdownPage(rendered, canonical) {
  return page({ ...rendered, canonical });
}

export function notFoundMd(path) {
  return page({
    title: "Not found",
    summary: `There is no public page at ${path}.`,
    canonical: `${SITE}${path}`,
    body: `See ${link("llms.txt", "/llms.txt")} for the pages that exist, or ${link("the catalog", "/api/md/_catalog")}.`,
  });
}

// ---------- site files ----------

export function llmsTxt(products) {
  const top = (products || []).slice(0, 50);
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Based in Nairobi; sells to individuals, students, businesses and institutions across Kenya. Every product page shows the current price in KSh, stock status and specifications. Contact: +254717040531 (call or WhatsApp), ecbtechnologies001@gmail.com.",
    "",
    "<!-- Keep in sync with /ai.txt and /robots.txt. -->",
    "",
    "## Core pages",
    `- [Home](${SITE}/index.md): shop overview, categories and featured products`,
    `- [About](${SITE}/about.md): who ECB Technologies is`,
    `- [Contact](${SITE}/contact.md): address, phone, WhatsApp, email, opening hours (Mon-Sat 9am-7pm, closed Sunday)`,
    `- [Delivery](${SITE}/delivery.md): rider delivery in Nairobi, courier to all 47 counties, free pickup`,
    `- [FAQ](${SITE}/faq.md): ordering, accounts, returns and support`,
    "",
    "## Buying guides",
    ...GUIDES.map((g) => `- [${INFO_PAGES[g][0]}](${SITE}${g}.md): ${INFO_PAGES[g][1]}`),
    "",
    "## Product categories",
    ...LISTED_CATEGORIES.map(([slug, name]) => `- [${name}](${SITE}/category/${slug}.md): ${name} with prices in KSh`),
    `- [All products](${SITE}/category.md): every product, paginated`,
    "",
    "## Products (latest 50; the full list is in llms-full.txt and the catalog)",
    ...top.map((p) => `- [${p.name}](${SITE}/item/${p.slug}.md): ${ksh(p.price)}`),
    "",
    "## Machine-readable",
    `- [Full content](${SITE}/llms-full.txt): core pages, guides and every product with price in one file`,
    `- [Markdown catalog](${SITE}/api/md/_catalog): every markdown URL`,
    `- [Sitemap](${SITE}/sitemap.xml)`,
    `- [AI usage policy](${SITE}/ai.txt)`,
    "",
    "## Optional",
    ...LEGAL.map((g) => `- [${INFO_PAGES[g][0]}](${SITE}${g}.md)`),
    `- Instagram: ${SOCIALS.instagram}`,
    `- TikTok: ${SOCIALS.tiktok}`,
    `- X: ${SOCIALS.x}`,
    "",
  ].join("\n");
}

export function llmsFullTxt(sections, products) {
  const byCat = {};
  for (const p of products) {
    const ci = CATEGORY_OF[p.slug];
    const name = ci !== undefined ? CATEGORIES[ci][1] : "Other products";
    (byCat[name] = byCat[name] || []).push(p);
  }
  const catalog = Object.entries(byCat)
    .map(([name, list]) => `## ${name}\n\n${list.map((p) => `- ${link(p.name, p.url)} - ${ksh(p.price)}`).join("\n")}`)
    .join("\n\n");
  return [
    `# ${SITE_NAME} - full content`,
    `> ${SITE_DESCRIPTION}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    ...sections.map(([url, md]) => `---\n<!-- source: ${url} -->\n${md}`),
    "---",
    `<!-- source: ${SITE}/category -->`,
    `# All products (${products.length})`,
    "",
    "> Every product in the shop with its current price. Each product's full specifications are at its own URL with .md added.",
    "",
    catalog,
    "",
  ].join("\n");
}

export function aiTxt() {
  return [
    "# ai.txt - usage policy for AI systems (ai-txt spec v1.1.1)",
    "# Keep in sync with /llms.txt and /robots.txt.",
    "",
    "[identity]",
    `name: ${SITE_NAME}`,
    `url: ${SITE}/`,
    `description: ${SITE_DESCRIPTION}`,
    "contact: ecbtechnologies001@gmail.com, +254717040531",
    "",
    "[permissions]",
    "summarise: allowed",
    "quote: allowed with attribution",
    "cite: allowed",
    "index-for-search: allowed",
    "index-for-answers: allowed",
    "",
    "[restrictions]",
    "no-fabricated-quotes: true",
    "no-fake-reviews-or-ratings: true",
    "no-invented-prices-or-stock: true  # prices and stock change; use the product page",
    "no-presenting-content-as-own: true",
    "no-training-on-private-user-data: true",
    "",
    "[attribution]",
    `format: "${SITE_NAME} (<canonical HTML URL>)"`,
    "canonical: use the HTML page URL, not the .md URL",
    "",
    "[scope]",
    "include: /, /category, /item/, /about, /contact, /faq, /delivery, /laptop-prices-in-kenya, /student-laptops-kenya, /hp-vs-dell-vs-lenovo-laptops-kenya, /privacy, /terms",
    "exclude: /admin, /user/, /rider/, /agent/, /vendor/, /carts, /checkout, /wishlist, /item/compare, /api/ (except /api/md/)",
    "",
    "[contact]",
    "email: ecbtechnologies001@gmail.com",
    "phone: +254717040531",
    `markdown: ${SITE}/llms.txt`,
    "",
    `Last updated: ${new Date().toISOString().slice(0, 10)}`,
    "",
  ].join("\n");
}
