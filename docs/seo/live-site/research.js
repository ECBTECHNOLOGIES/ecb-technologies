// Research pages built from the shop's own live catalogue (served by the
// ecb-speed Worker): one pure calculation per dataset, read by the HTML page,
// its markdown version, the FAQ answers and llms.txt, so a number can only
// come from one place.
//
//   /research                       hub
//   /research/laptop-prices-kenya   laptops: price, brand, processor
//   /research/tech-prices-kenya     every product by category
//
// Rules: no finding with fewer than MIN_SAMPLE rows behind it; gaps under
// SAME_WITHIN are "about the same"; shares say their denominator; nothing is
// estimated. Brand, processor and generation are read from each product's
// name (as typed by the shop), and the page says so.

import { CATEGORIES, CATEGORY_OF } from "./catalog-map.js";

export const MIN_SAMPLE = 20;
export const SAME_WITHIN = 0.05; // 5%
const SITE = "https://www.ecbtechkenya.com";

// ---------- helpers ----------

export const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
export const ksh = (n) => `KSh ${Math.round(n).toLocaleString("en-US")}`;
export const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

// Shares of a total that add up to exactly 100 (largest remainder).
export function shares(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (100 * c) / total);
  const out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => {
    if (left > 0) {
      out[i]++;
      left--;
    }
  });
  return out;
}

// Compares two values: "more" / "less" / "about the same".
export function compare(a, b) {
  if (a == null || b == null) return null;
  if (Math.abs(a - b) <= SAME_WITHIN * Math.max(a, b)) return "same";
  return a > b ? "more" : "less";
}

// ---------- reading products ----------

const BRAND_KEYS = [
  ["Apple", ["macbook", "apple"]],
  ["Microsoft", ["surface", "microsoft"]],
  ["HP", ["hp", "elitebook", "probook", "zbook", "omen", "victus", "omnibook", "pavilion", "envy", "spectre"]],
  ["Dell", ["dell", "latitude", "xps", "inspiron", "precision", "vostro", "alienware"]],
  ["Lenovo", ["lenovo", "thinkpad", "ideapad", "yoga", "legion"]],
  ["Asus", ["asus", "rog", "zenbook", "vivobook"]],
  ["Acer", ["acer", "aspire", "predator", "nitro", "swift"]],
  ["MSI", ["msi"]],
  ["Samsung", ["samsung", "galaxy"]],
];
export function brandOf(slug) {
  const words = slug.split("-");
  for (const [brand, keys] of BRAND_KEYS) if (keys.some((k) => words[0] === k || (k.length > 3 && words.includes(k)))) return brand;
  return "Other";
}
export function cpuOf(slug) {
  const s = `-${slug}-`;
  if (/-(core-)?ultra-[579]-/.test(s)) return "Core Ultra";
  if (/-i9-/.test(s)) return "Core i9";
  if (/-i7-/.test(s)) return "Core i7";
  if (/-i5-/.test(s)) return "Core i5";
  if (/-i3-/.test(s)) return "Core i3";
  if (/-ryzen-/.test(s)) return "AMD Ryzen";
  if (/-(celeron|pentium)-/.test(s)) return "Celeron / Pentium";
  if (/-snapdragon-/.test(s)) return "Snapdragon";
  if (/macbook/.test(s) && /-m[1-5]-/.test(s)) return "Apple M-series";
  return null;
}
export function genOf(slug) {
  const m = `-${slug}-`.match(/-(\d{1,2})(st|nd|rd|th)-gen/);
  return m ? Number(m[1]) : null;
}

// Rows: products with a usable price (over KSh 1,000 and under KSh 2,000,000).
export function cleanRows(products) {
  const seen = new Set();
  return products.filter((p) => {
    if (!p || !p.slug || !(p.price > 1000 && p.price < 2000000) || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

// ---------- study 1: laptops ----------

export const LAPTOP_BANDS = [
  [0, 30000, "Under KSh 30,000"],
  [30000, 50000, "KSh 30,000 – 49,999"],
  [50000, 80000, "KSh 50,000 – 79,999"],
  [80000, 120000, "KSh 80,000 – 119,999"],
  [120000, Infinity, "KSh 120,000 and over"],
];

export function computeLaptopStudy(products) {
  const rows = cleanRows(products).filter((p) => CATEGORY_OF[p.slug] !== undefined && CATEGORIES[CATEGORY_OF[p.slug]][0] === "laptops");
  const n = rows.length;
  const prices = rows.map((r) => r.price);
  const out = { id: "laptop-prices-kenya", n, findings: [], tables: [], faq: [] };
  if (n < MIN_SAMPLE) return out;
  const sorted = [...rows].sort((a, b) => a.price - b.price);
  const med = median(prices);
  out.median = med;
  out.min = sorted[0];
  out.max = sorted[n - 1];

  // Bands
  const bandCounts = LAPTOP_BANDS.map(([lo, hi]) => rows.filter((r) => r.price >= lo && r.price < hi).length);
  const bandShares = shares(bandCounts);
  out.tables.push({
    id: "by-budget",
    title: "Laptops by budget",
    head: ["Budget", "Laptops", "Share of all laptops"],
    rows: LAPTOP_BANDS.map(([, , label], i) => [label, String(bandCounts[i]), `${bandShares[i]}%`]),
  });

  // Brands
  const byBrand = {};
  for (const r of rows) (byBrand[brandOf(r.slug)] = byBrand[brandOf(r.slug)] || []).push(r.price);
  const brands = Object.entries(byBrand).sort((a, b) => b[1].length - a[1].length);
  out.tables.push({
    id: "by-brand",
    title: "Laptops by brand",
    head: ["Brand", "Laptops", "From", "Median"],
    rows: brands.map(([b, xs]) => [b, String(xs.length), ksh(Math.min(...xs)), xs.length >= 5 ? ksh(median(xs)) : "too few to say"]),
  });

  // Processors
  const byCpu = {};
  for (const r of rows) {
    const c = cpuOf(r.slug);
    if (c) (byCpu[c] = byCpu[c] || []).push(r.price);
  }
  const cpus = Object.entries(byCpu).sort((a, b) => median(a[1]) - median(b[1]));
  const withCpu = Object.values(byCpu).reduce((a, x) => a + x.length, 0);
  out.tables.push({
    id: "by-processor",
    title: "Laptops by processor",
    head: ["Processor", "Laptops", "From", "Median"],
    rows: cpus.map(([c, xs]) => [c, String(xs.length), ksh(Math.min(...xs)), xs.length >= 5 ? ksh(median(xs)) : "too few to say"]),
    note: `${withCpu} of ${n} laptops name a recognisable processor; the rest are left out of this table.`,
  });

  // Findings
  out.findings.push({
    id: "median-laptop-price",
    text: `The median laptop at ECB Technologies costs ${ksh(med)}, across ${n} laptops priced from ${ksh(out.min.price)} to ${ksh(out.max.price)}.`,
  });
  const under30 = bandCounts[0];
  out.findings.push({
    id: "laptops-under-30000",
    text: `${under30} of ${n} laptops (${bandShares[0]}%) cost under KSh 30,000; ${bandCounts[4]} (${bandShares[4]}%) cost KSh 120,000 or more.`,
  });
  const i5 = byCpu["Core i5"] || [];
  const i7 = byCpu["Core i7"] || [];
  if (i5.length >= MIN_SAMPLE && i7.length >= MIN_SAMPLE) {
    const a = median(i7);
    const b = median(i5);
    const c = compare(a, b);
    out.i5 = { n: i5.length, median: b, from: Math.min(...i5) };
    out.i7 = { n: i7.length, median: a, from: Math.min(...i7) };
    out.findings.push({
      id: "core-i7-vs-core-i5",
      text:
        c === "same"
          ? `Core i7 and Core i5 laptops cost about the same: a median of ${ksh(a)} for Core i7 (${i7.length} laptops) and ${ksh(b)} for Core i5 (${i5.length} laptops).`
          : `The median Core i7 laptop costs ${ksh(a)}, ${ksh(Math.abs(a - b))} ${c === "more" ? "more" : "less"} than the median Core i5 laptop (${ksh(b)}); based on ${i7.length} Core i7 and ${i5.length} Core i5 laptops.`,
    });
  }
  const [topBrand, topXs] = brands[0];
  if (topXs.length >= MIN_SAMPLE && topBrand !== "Other") {
    out.topBrand = { name: topBrand, n: topXs.length };
    out.findings.push({
      id: "most-common-laptop-brand",
      text: `${topBrand} makes ${topXs.length} of the ${n} laptops (${pct(topXs.length, n)}%), more than any other brand.`,
    });
  }
  const ultra = byCpu["Core Ultra"] || [];
  if (ultra.length >= MIN_SAMPLE) {
    out.findings.push({
      id: "core-ultra-laptop-price",
      text: `Laptops with an Intel Core Ultra processor have a median price of ${ksh(median(ultra))} across ${ultra.length} models, the newest Intel generation in stock.`,
    });
  }
  const modern = rows.filter((r) => ["Core i5", "Core i7"].includes(cpuOf(r.slug)) && (genOf(r.slug) || 0) >= 8);
  const student = modern.filter((r) => r.price <= 40000).sort((a, b) => a.price - b.price);
  if (student.length >= MIN_SAMPLE) {
    out.student = { n: student.length, from: student[0].price };
    out.findings.push({
      id: "student-laptops-under-40000",
      text: `${student.length} laptops with an 8th-generation or newer Intel Core i5 or i7 cost KSh 40,000 or less; the cheapest is ${ksh(student[0].price)}.`,
    });
  }
  const genKnown = rows.filter((r) => ["Core i5", "Core i7"].includes(cpuOf(r.slug)) && genOf(r.slug));
  if (genKnown.length >= MIN_SAMPLE) {
    const eight = genKnown.filter((r) => genOf(r.slug) >= 8).length;
    out.findings.push({
      id: "8th-gen-or-newer-share",
      text: `${eight} of the ${genKnown.length} Core i5 and Core i7 laptops whose name states a generation (${pct(eight, genKnown.length)}%) are 8th generation or newer, the oldest Intel chips Windows 11 supports.`,
    });
  }

  // FAQ (same numbers)
  out.faq.push({
    id: "how-much-does-a-laptop-cost-in-kenya",
    q: "How much does a laptop cost in Kenya?",
    a: `At ECB Technologies in Nairobi, laptops cost from ${ksh(out.min.price)} to ${ksh(out.max.price)}, with a median of ${ksh(med)} across ${n} laptops. ${under30} (${bandShares[0]}%) cost under KSh 30,000.`,
  });
  if (out.i5) out.faq.push({ id: "core-i5-laptop-price-kenya", q: "How much is a Core i5 laptop in Kenya?", a: `Core i5 laptops at ECB Technologies start at ${ksh(out.i5.from)}; the median is ${ksh(out.i5.median)} across ${out.i5.n} models.` });
  if (out.i7) out.faq.push({ id: "core-i7-laptop-price-kenya", q: "How much is a Core i7 laptop in Kenya?", a: `Core i7 laptops at ECB Technologies start at ${ksh(out.i7.from)}; the median is ${ksh(out.i7.median)} across ${out.i7.n} models.` });
  out.faq.push({ id: "cheapest-laptop-kenya", q: "What is the cheapest laptop at ECB Technologies?", a: `The cheapest laptop is ${out.min.name} at ${ksh(out.min.price)}.`, link: out.min.url });
  if (out.student) out.faq.push({ id: "best-laptop-under-40000-kenya", q: "How many good laptops are there under KSh 40,000?", a: `${out.student.n} laptops with an 8th-gen or newer Core i5/i7 cost KSh 40,000 or less, from ${ksh(out.student.from)}.` });
  if (out.topBrand) out.faq.push({ id: "most-common-laptop-brand-kenya", q: "Which laptop brand has the most models?", a: `${out.topBrand.name}, with ${out.topBrand.n} of ${n} laptops (${pct(out.topBrand.n, n)}%).` });
  return out;
}

export const lowerName = (s) => s.split(" ").map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase())).join(" ");

// ---------- study 2: every product by category ----------

export function computeCategoryStudy(products) {
  const rows = cleanRows(products).filter((p) => CATEGORY_OF[p.slug] !== undefined);
  const n = rows.length;
  const out = { id: "tech-prices-kenya", n, findings: [], tables: [], faq: [] };
  if (n < MIN_SAMPLE) return out;
  // The shop's "SmartPhones" category also holds tablets and e-readers, so say so.
  const label = { smartphones: "Phones & Tablets" };
  const byCat = CATEGORIES.map(([slug, catName]) => {
    const name = label[slug] || catName;
    const xs = rows.filter((r) => CATEGORIES[CATEGORY_OF[r.slug]][0] === slug).map((r) => r.price);
    return { slug, name, n: xs.length, median: xs.length ? median(xs) : null, from: xs.length ? Math.min(...xs) : null, max: xs.length ? Math.max(...xs) : null };
  }).filter((c) => c.n > 0);
  const catShares = shares(byCat.map((c) => c.n));
  out.categories = byCat;
  out.tables.push({
    id: "by-category",
    title: "Products by category",
    head: ["Category", "Products", "Share", "From", "Median", "Up to"],
    rows: byCat.map((c, i) => [c.name, String(c.n), `${catShares[i]}%`, ksh(c.from), c.n >= MIN_SAMPLE ? ksh(c.median) : "too few to say", ksh(c.max)]),
  });
  const biggest = [...byCat].sort((a, b) => b.n - a.n)[0];
  out.findings.push({
    id: "largest-category",
    text: `${biggest.name} make up ${biggest.n} of the ${n} products at ECB Technologies (${pct(biggest.n, n)}%), the largest category.`,
  });
  const big = byCat.filter((c) => c.n >= MIN_SAMPLE).sort((a, b) => a.median - b.median);
  if (big.length >= 2) {
    out.findings.push({
      id: "median-price-by-category",
      text: `Median prices by category: ${big.map((c) => `${c.name} ${ksh(c.median)} (${c.n} products)`).join("; ")}.`,
    });
  }
  const laptops = byCat.find((c) => c.slug === "laptops");
  const phones = byCat.find((c) => c.slug === "smartphones");
  if (laptops && phones && laptops.n >= MIN_SAMPLE && phones.n >= MIN_SAMPLE) {
    const c = compare(phones.median, laptops.median);
    out.findings.push({
      id: "phones-tablets-vs-laptops",
      text:
        c === "same"
          ? `Phones and tablets cost about the same as laptops at the median: ${ksh(phones.median)} for phones and tablets (${phones.n}) and ${ksh(laptops.median)} for laptops (${laptops.n}).`
          : `The median phone or tablet costs ${ksh(phones.median)}, ${ksh(Math.abs(phones.median - laptops.median))} ${c} than the median laptop (${ksh(laptops.median)}); based on ${phones.n} phones and tablets and ${laptops.n} laptops.`,
    });
  }
  const under50 = rows.filter((r) => r.price < 50000).length;
  out.findings.push({
    id: "products-under-50000",
    text: `${under50} of ${n} products (${pct(under50, n)}%) cost under KSh 50,000.`,
  });
  for (const c of big) {
    out.faq.push({
      id: `${c.slug.toLowerCase()}-price-kenya`,
      q: `How much do ${lowerName(c.name)} cost at ECB Technologies?`,
      a: `${c.name} cost from ${ksh(c.from)} to ${ksh(c.max)}, with a median of ${ksh(c.median)} across ${c.n} products.`,
    });
  }
  return out;
}

// ---------- pages ----------

export const STUDIES = {
  "laptop-prices-kenya": {
    compute: computeLaptopStudy,
    title: (s, y) => `Laptop Prices in Kenya ${y}: ${s.n} Laptops Analyzed`,
    summary: (s) => s.findings.slice(0, 2).map((f) => f.text).join(" "),
    question: "What do laptops cost in Kenya, by budget, brand and processor?",
    related: [["Laptops", "/category/laptops"], ["Student laptops under KSh 40,000", "/student-laptops-kenya"], ["HP vs Dell vs Lenovo", "/hp-vs-dell-vs-lenovo-laptops-kenya"]],
  },
  "tech-prices-kenya": {
    compute: computeCategoryStudy,
    title: (s, y) => `Tech Prices in Kenya ${y}: ${s.n} Products Analyzed`,
    summary: (s) => s.findings.slice(0, 2).map((f) => f.text).join(" "),
    question: "What do laptops, phones, printers and accessories cost in Kenya?",
    related: [["All products", "/category"], ["Laptop prices in Kenya", "/research/laptop-prices-kenya"]],
  },
};

const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });
const monthYear = (iso) => new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" });

function methodology(s, changedAt) {
  return [
    "Source: every product listed on www.ecbtechkenya.com, read from the shop's own catalogue at the time shown below.",
    "Prices are the current listed prices in Kenyan shillings, as shown on each product page.",
    "Excluded: listings without a usable price (under KSh 1,000 or over KSh 2,000,000) and duplicate listings of the same product.",
    "Brand, processor and generation come from the product names as typed by the shop; products whose name doesn't state them are left out of those tables.",
    `Findings with fewer than ${MIN_SAMPLE} products behind them are not shown; differences within ${Math.round(SAME_WITHIN * 100)}% are reported as about the same.`,
    "Medians are rounded to the nearest shilling; shares to whole percent (band and category shares add up to 100%).",
    `Refreshed automatically when the catalogue changes; data last changed ${fmtDate(changedAt)}.`,
  ];
}

export function studyHtml(slug, s, changedAt) {
  const meta = STUDIES[slug];
  const url = `${SITE}/research/${slug}`;
  const year = new Date(changedAt).getFullYear();
  const title = meta.title(s, year);
  const parts = [];
  parts.push(`<p class="ecb-rs-meta">Data last changed ${fmtDate(changedAt)} · ${s.n} products · <a href="${url}.md">Markdown</a></p>`);
  parts.push('<h2 id="key-findings">Key findings</h2><ol class="ecb-rs-findings">');
  for (const f of s.findings) parts.push(`<li id="${f.id}"><p>${escHtml(f.text)}</p><a class="ecb-rs-anchor" href="#${f.id}">Link to this finding</a></li>`);
  parts.push("</ol>");
  for (const t of s.tables) {
    parts.push(`<h2 id="${t.id}">${escHtml(t.title)}</h2><table><thead><tr>${t.head.map((h) => `<th>${escHtml(h)}</th>`).join("")}</tr></thead><tbody>`);
    parts.push(t.rows.map((r) => `<tr>${r.map((c) => `<td>${escHtml(c)}</td>`).join("")}</tr>`).join(""));
    parts.push("</tbody></table>");
    if (t.note) parts.push(`<p class="ecb-rs-note">${escHtml(t.note)}</p>`);
  }
  if (s.faq.length) {
    parts.push('<h2 id="faq">Questions</h2>');
    for (const f of s.faq) parts.push(`<div class="ecb-rs-faq" id="${f.id}"><h3>${escHtml(f.q)}</h3><p>${escHtml(f.a)}${f.link ? ` <a href="${f.link}">View it</a>.` : ""}</p><a class="ecb-rs-anchor" href="#${f.id}">Link to this answer</a></div>`);
  }
  parts.push('<h2 id="methodology">Methodology</h2><ul>' + methodology(s, changedAt).map((m) => `<li>${escHtml(m)}</li>`).join("") + "</ul>");
  parts.push(`<h2 id="cite">Cite this research</h2><p>ECB Technologies, "${escHtml(title)}", ${monthYear(changedAt)}, <a href="${url}">${url}</a>.</p>`);
  parts.push('<h2 id="related">Related</h2><ul>' + meta.related.map(([t, u]) => `<li><a href="${u}">${escHtml(t)}</a></li>`).join("") + "</ul>");
  return parts.join("");
}

export function studyJsonLd(slug, s, changedAt) {
  const meta = STUDIES[slug];
  const url = `${SITE}/research/${slug}`;
  const title = meta.title(s, new Date(changedAt).getFullYear());
  const graph = [
    {
      "@type": "Dataset",
      "@id": `${url}#dataset`,
      name: title,
      description: meta.summary(s),
      url,
      creator: { "@id": `${SITE}/#store` },
      publisher: { "@id": `${SITE}/#store` },
      dateModified: changedAt,
      isAccessibleForFree: true,
      spatialCoverage: { "@type": "Place", name: "Kenya" },
      variableMeasured: ["Listed price (KES)", "Category", "Brand", "Processor"],
      measurementTechnique: "Medians and shares calculated from every product listed on www.ecbtechkenya.com",
      distribution: [{ "@type": "DataDownload", encodingFormat: "text/markdown", contentUrl: `${url}.md` }],
    },
  ];
  if (s.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return graph;
}

export function studyMarkdown(slug, s, changedAt) {
  const meta = STUDIES[slug];
  const url = `${SITE}/research/${slug}`;
  const year = new Date(changedAt).getFullYear();
  const lines = [
    `# ${meta.title(s, year)}`,
    "",
    `> ${meta.summary(s)}`,
    "",
    `Canonical: ${url}`,
    `Last updated: ${changedAt.slice(0, 10)} (when the catalogue last changed)`,
    "",
    "## Key findings",
    "",
    ...s.findings.map((f, i) => `${i + 1}. ${f.text} ([link](${url}#${f.id}))`),
  ];
  for (const t of s.tables) {
    lines.push("", `## ${t.title}`, "", `| ${t.head.join(" | ")} |`, `| ${t.head.map(() => "---").join(" | ")} |`, ...t.rows.map((r) => `| ${r.join(" | ")} |`));
    if (t.note) lines.push("", t.note);
  }
  if (s.faq.length) lines.push("", "## Questions", "", ...s.faq.flatMap((f) => [`### ${f.q}`, "", `${f.a} ([link](${url}#${f.id}))`, ""]));
  lines.push("## Methodology", "", ...methodology(s, changedAt).map((m) => `- ${m}`));
  lines.push("", "## Cite this research", "", `ECB Technologies, "${meta.title(s, year)}", ${monthYear(changedAt)}, ${url}`);
  lines.push("", "## Related", ...meta.related.map(([t, u]) => `- [${t}](${SITE}${u})`));
  return lines.join("\n") + "\n";
}

export function hubHtml(studies, changedAt) {
  return (
    `<p class="ecb-rs-meta">Original statistics from ECB Technologies' own catalogue. Data last changed ${fmtDate(changedAt)}.</p><ul class="ecb-rs-hub">` +
    Object.entries(studies)
      .map(([slug, s]) => `<li><h2><a href="/research/${slug}">${escHtml(STUDIES[slug].title(s, new Date(changedAt).getFullYear()))}</a></h2><p>${escHtml(STUDIES[slug].summary(s))}</p></li>`)
      .join("") +
    "</ul>"
  );
}

export function hubMarkdown(studies, changedAt) {
  return [
    "# Research",
    "",
    "> Original statistics from ECB Technologies' own catalogue of laptops, phones and accessories in Kenya.",
    "",
    `Canonical: ${SITE}/research`,
    `Last updated: ${changedAt.slice(0, 10)}`,
    "",
    ...Object.entries(studies).map(([slug, s]) => `- [${STUDIES[slug].title(s, new Date(changedAt).getFullYear())}](${SITE}/research/${slug}): ${STUDIES[slug].summary(s)}`),
    "",
  ].join("\n");
}

// llms.txt "Cite this site for" section.
export function citeSection(studies) {
  const lines = ["## Cite this site for", ""];
  for (const [slug, s] of Object.entries(studies)) {
    const url = `${SITE}/research/${slug}`;
    lines.push(`- [${STUDIES[slug].question}](${url}.md)`);
    for (const f of s.findings) lines.push(`  - ${f.text} (${url}#${f.id})`);
  }
  return lines.join("\n");
}

export const RESEARCH_CSS =
  ".ecb-rs-meta{font-family:inherit;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#5c5e5e}" +
  ".ecb-rs-findings{padding-left:22px}.ecb-rs-findings li{margin:0 0 18px}.ecb-rs-findings li p{margin:0 0 4px;font-size:16px;line-height:1.6;color:#000}" +
  ".ecb-rs-anchor{font-family:inherit;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#1683ff!important;text-decoration:none!important}" +
  ".ecb-rs-anchor:hover{color:#000!important;text-decoration:underline!important}" +
  ".ecb-rs-note{font-size:13px;color:#5c5e5e}.ecb-rs-faq{margin:0 0 20px}.ecb-rs-faq p{margin:0 0 4px}" +
  ".ecb-rs-hub{list-style:none;padding:0}.ecb-rs-hub li{border-top:1px solid #e2e2e2;padding:18px 0}.ecb-rs-hub h2{font-size:22px!important;margin:0 0 6px!important}" +
  ":target{scroll-margin-top:120px}";
