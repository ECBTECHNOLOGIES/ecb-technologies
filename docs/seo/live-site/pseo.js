// Programmatic guide pages built from the shop's live catalogue (served by the
// ecb-speed Worker). One pure function, buildPages(products), decides which
// pages exist, writes them in one machine-readable shape, and reports every
// candidate it rejected and why. HTML, markdown, JSON, the sitemap and the hub
// all read that one result, so a URL is listed only if its page exists.
//
//   /guides                 hub (every page, grouped by playbook)
//   /best/<slug>            curation (budgets) and personas
//   /compare/<a>-vs-<b>     comparisons
//   /series/<slug>          profiles (laptop lines)
//   /laptops/<slug>         directory (brand / processor listings)
//   /guides/pages.json      every page in the pSEO JSON format, plus SKIPPED
//
// Quality gates (a candidate failing any of them is not published):
//   - enough real products behind it (MIN_PRODUCTS, or MIN_SIDE per side);
//   - unique slug and unique primary keyword;
//   - not a near-duplicate of a page already accepted (shared listed products);
//   - not covered by an existing guide on the site;
//   - minimum words (600 utility / 900 informational), 3+ FAQs,
//     5+ internal links, 2+ related pages.
//
// Every fact comes from the product list (name, price, address) or from the
// short, checkable background notes in SERIES_FACTS. Specs are read from the
// product address as the shop typed it; the pages say so.

import { CATEGORIES, CATEGORY_OF } from "./catalog-map.js";
import { median, ksh, pct, brandOf, cpuOf, genOf, cleanRows, LAPTOP_BANDS } from "./research.js";

const SITE = "https://www.ecbtechkenya.com";
export const MIN_PRODUCTS = 10;
export const MIN_SIDE = 8;
export const LIST_SIZE = 10;
export const MAX_OVERLAP = 0.6; // share of listed products another page may repeat
export const MIN_WORDS = { utility: 600, informational: 900 };
const WHATSAPP = "254717040531";
const PHONE = "0717 040 531";

// ---------- specs from the product address ----------

export function specsOf(slug) {
  const s = `-${slug.toLowerCase()}-`;
  let ram = null;
  let ssd = null;
  const pair = s.match(/-(4|8|16|32)-(128|256|512|1tb)-/) || s.match(/-(8|16|32)(128|256|512)-/);
  if (pair) {
    ram = +pair[1];
    ssd = pair[2] === "1tb" ? 1024 : +pair[2];
  }
  const r = s.match(/-(4|8|12|16|24|32|64)-?gb(?:-?(?:ram|ddr\d?|lpddr\d?x?))?-/);
  if (r && ram === null) ram = +r[1];
  const d = s.match(/-(128|256|512)-?(?:gb)?-?(?:ssd|nvme|m2)-/) || s.match(/-(128|256|512)-?gb-/) || s.match(/-(1|2)-?tb-/);
  if (d && ssd === null) ssd = /tb-$/.test(d[0]) ? +d[1] * 1024 : +d[1];
  const cpu = cpuOf(slug);
  let tier = null;
  if (cpu === "Celeron / Pentium") tier = 1;
  else if (cpu === "Core i3") tier = 2;
  else if (cpu === "Core i5" || cpu === "Snapdragon") tier = 3;
  else if (cpu === "Core i7") tier = 4;
  else if (cpu === "Core i9" || cpu === "Apple M-series") tier = 5;
  else if (cpu === "Core Ultra") tier = /-(core-)?ultra-5-/.test(s) ? 4 : 5;
  else if (cpu === "AMD Ryzen") {
    const m = s.match(/-ryzen-(3|5|7|9)-/);
    tier = m ? { 3: 2, 5: 3, 7: 4, 9: 5 }[m[1]] : 3;
  }
  const gen = genOf(slug);
  return {
    cpu,
    tier,
    gen,
    ram,
    ssd,
    touch: /-touch(screen)?-/.test(s) && !/-non-touch-/.test(s),
    convertible: /-(x360|2-in-1|yoga|flip|folio|detachable)-/.test(s),
    gpu: /-(rtx|gtx|quadro|geforce|radeon-rx|radeon-pro|mx\d{3})-/.test(s) || /-rtx\d/.test(s),
  };
}

// How recent the processor is: 0 (old) .. 7 (current).
export function recency(sp) {
  if (sp.cpu === "Core Ultra" || sp.cpu === "Apple M-series" || sp.cpu === "Snapdragon") return 7;
  if (sp.gen == null) return sp.cpu === "AMD Ryzen" ? 4 : 2;
  if (sp.gen <= 6) return 0;
  if (sp.gen === 7) return 1;
  if (sp.gen <= 9) return 3;
  if (sp.gen === 10) return 4;
  if (sp.gen === 11) return 5;
  if (sp.gen === 12) return 6;
  return 7;
}

// The published ranking formula (shown on every list page).
export function score(sp) {
  const ram = sp.ram == null ? 1 : sp.ram >= 24 ? 8 : sp.ram >= 16 ? 6 : sp.ram >= 12 ? 4 : sp.ram >= 8 ? 3 : 0;
  const ssd = sp.ssd == null ? 1 : sp.ssd >= 1024 ? 5 : sp.ssd >= 512 ? 4 : sp.ssd >= 256 ? 2 : 0;
  return (sp.tier || 1) * 3 + recency(sp) * 2 + ram + ssd;
}
export const SCORE_MAX = 5 * 3 + 7 * 2 + 8 + 5;
export const SCORE_TEXT =
  "Each laptop gets a spec score out of 42, read from its listing: processor class ×3 (Celeron 1, Core i3 2, Core i5 3, Core i7 / Core Ultra 5 4, Core i9 / Core Ultra 7 / Apple M 5), processor age ×2 (Intel 7th gen and older 0–1, 8th–9th gen 3, 10th 4, 11th 5, 12th 6, 13th gen, Core Ultra and Apple M 7), memory (8 GB 3, 16 GB 6, 24 GB+ 8) and storage (256 GB 2, 512 GB 4, 1 TB+ 5). Ties go to the lower price. Nobody paid for a place, and no laptop is ranked by hand.";

const ordinal = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
// Launch years of Intel mobile generations (for "how old is this chip").
const GEN_YEAR = { 4: 2013, 5: 2015, 6: 2015, 7: 2016, 8: 2017, 9: 2019, 10: 2019, 11: 2020, 12: 2022, 13: 2023 };

export function specLine(sp) {
  const parts = [];
  if (sp.cpu) parts.push(sp.gen && /^Core i/.test(sp.cpu) ? `${sp.cpu} ${ordinal(sp.gen)} gen` : sp.cpu);
  if (sp.ram) parts.push(`${sp.ram} GB RAM`);
  if (sp.ssd) parts.push(sp.ssd >= 1024 ? `${sp.ssd / 1024} TB SSD` : `${sp.ssd} GB SSD`);
  if (sp.convertible) parts.push("2-in-1");
  else if (sp.touch) parts.push("touchscreen");
  if (sp.gpu) parts.push("dedicated graphics");
  return parts.join(" · ");
}

// Pros and cons that follow from the listing (never from guesses).
export function prosCons(p, ctx) {
  const sp = p.sp;
  const pros = [];
  const cons = [];
  if (sp.ram >= 16) pros.push(`${sp.ram} GB RAM, comfortable for many tabs and heavy apps`);
  else if (sp.ram === 8) cons.push("8 GB RAM: fine for office work and browsing, tight for heavy multitasking");
  else if (sp.ram && sp.ram < 8) cons.push(`${sp.ram} GB RAM is the minimum for Windows 11; expect slowdowns`);
  else cons.push("memory is not stated in the listing; ask before you buy");
  if (sp.ssd >= 512) pros.push(`${sp.ssd >= 1024 ? `${sp.ssd / 1024} TB` : `${sp.ssd} GB`} SSD`);
  else if (sp.ssd && sp.ssd <= 128) cons.push(`${sp.ssd} GB storage fills up quickly`);
  if (sp.cpu === "Core Ultra" || sp.cpu === "Apple M-series") pros.push(`current-generation ${sp.cpu} processor`);
  else if (sp.gen >= 11) pros.push(`${ordinal(sp.gen)}-gen Intel processor (launched ${GEN_YEAR[sp.gen] || "2023 or later"})`);
  else if (sp.gen && sp.gen <= 7) cons.push(`${ordinal(sp.gen)}-gen Intel (${GEN_YEAR[sp.gen]}) is not on Microsoft's Windows 11 supported processor list`);
  else if (sp.gen && sp.gen <= 9) cons.push(`${ordinal(sp.gen)}-gen Intel processor from ${GEN_YEAR[sp.gen]}: the oldest generation Windows 11 supports`);
  if (sp.convertible) pros.push("folds into a tablet (2-in-1)");
  else if (sp.touch) pros.push("touchscreen");
  if (sp.gpu) pros.push("dedicated graphics card");
  if (ctx && ctx.median && p.price <= ctx.median * 0.85) pros.push(`${ksh(ctx.median - p.price)} below the median of this list`);
  if (ctx && ctx.cheapest === p.slug) pros.push("cheapest laptop on this page");
  return { pros: pros.slice(0, 3), cons: cons.slice(0, 2) };
}

// Listing names are cut at about 40 characters ("…"): keep whole words.
export function shortName(nm) {
  const x = nm.endsWith("…") ? nm.slice(0, -1).replace(/\s+\S*$/, "") : nm;
  return x.split(/,| \| /)[0].replace(/[\s\-–(/]+$/, "").trim();
}

// ---------- background facts (short, checkable, in our own words) ----------

export const SERIES_FACTS = {
  thinkpad: { name: "Lenovo ThinkPad", maker: "Lenovo", match: /-thinkpad-/, timeline: [["1992", "IBM launches the ThinkPad line"], ["2005", "Lenovo buys IBM's PC business, ThinkPad included"], ["2012", "the thin ThinkPad X1 Carbon arrives"]], about: "Business laptops known for their keyboards, the red TrackPoint and spare parts that are easy to find." },
  elitebook: { name: "HP EliteBook", maker: "HP", match: /-elitebook-/, timeline: [["2008", "HP introduces the EliteBook line"], ["2014", "EliteBook Folio thin models"], ["2016", "EliteBook x360 convertibles"]], about: "HP's top business line: metal bodies, good keyboards and business security features." },
  probook: { name: "HP ProBook", maker: "HP", match: /-probook-/, timeline: [["2009", "HP introduces the ProBook line"]], about: "HP's mid-range business line: most of the EliteBook's practicality for less money." },
  latitude: { name: "Dell Latitude", maker: "Dell", match: /-latitude-/, timeline: [["1994", "Dell introduces the Latitude line"], ["2017", "Latitude 2-in-1 models"]], about: "Dell's business line, from basic 3000 models to premium 7000 and 9000 models." },
  zbook: { name: "HP ZBook", maker: "HP", match: /-zbook-/, timeline: [["2013", "HP introduces ZBook mobile workstations"]], about: "Mobile workstations for design, engineering and video work, often with workstation graphics." },
  xps: { name: "Dell XPS", maker: "Dell", match: /-xps-/, timeline: [["1993", "Dell introduces the XPS name"], ["2015", "XPS 13 with a near-borderless screen"]], about: "Dell's premium consumer line: thin aluminium and carbon-fibre laptops with sharp screens." },
  macbook: { name: "Apple MacBook", maker: "Apple", match: /macbook/, timeline: [["2006", "the first MacBook and MacBook Pro"], ["2008", "MacBook Air"], ["2020", "Apple's own M1 chip replaces Intel"]], about: "Apple's laptops; models with Apple M chips are fast, quiet and have long battery life." },
  x360: { name: "HP x360", maker: "HP", match: { test: (s) => /-x360-/.test(s) && brandOf(s.slice(1, -1)) === "HP" }, timeline: [["2015", "HP starts using the x360 name for laptops whose screen folds all the way back"]], about: "HP laptops whose screen folds 360° to work as a tablet; all have touchscreens." },
};

// ---------- candidates ----------

const BUDGETS = [20000, 25000, 30000, 40000, 50000, 60000, 70000, 80000, 100000, 150000];
const EXISTING = {
  "/student-laptops-kenya": "best laptops for students in Kenya",
  "/hp-vs-dell-vs-lenovo-laptops-kenya": "HP vs Dell vs Lenovo laptops",
  "/laptop-prices-in-kenya": "laptop prices in Kenya",
};
const k = (n) => `${n / 1000}k`;
const kshK = (n) => `KSh ${n.toLocaleString("en-US")}`;

function candidates() {
  const c = [];
  // Curation: budgets.
  for (const b of BUDGETS) {
    c.push({
      kind: "list", playbook: "Curation", type: "utility", slug: `best-laptops-under-${k(b)}`, path: `/best/best-laptops-under-${k(b)}-kenya`,
      kw: `best laptops under ${k(b)} in Kenya`, title: (n, y) => `Best Laptops Under ${kshK(b)} in Kenya (${y}): Top ${n}`,
      h1: `Best laptops under ${kshK(b)} in Kenya`, filter: (p) => p.price <= b, budget: b,
      angle: (s) => `${s.pool} laptops at ECB Technologies cost ${kshK(b)} or less. These are the ${s.n} with the best specs for the money, ranked by a published formula, not by hand.`,
    });
  }
  // Personas.
  c.push(
    { kind: "list", playbook: "Personas", type: "utility", slug: "business-laptops", path: "/best/business-laptops-kenya", kw: "business laptops in Kenya", h1: "Best business laptops in Kenya",
      title: (n, y) => `Best Business Laptops in Kenya (${y}): ${n} Picks`, persona: "office workers, consultants and companies buying in bulk",
      pain: ["a keyboard that is comfortable for a full workday", "a laptop that runs Windows 11 and gets security updates", "spare parts and repairs that are easy to find in Nairobi"],
      filter: (p) => /-(thinkpad|elitebook|latitude|probook)-/.test(`-${p.slug}-`) && recency(p.sp) >= 3,
      angle: (s) => `Business lines (ThinkPad, EliteBook, Latitude, ProBook) with an 8th-gen or newer processor, so every pick runs Windows 11. ${s.pool} laptops qualify.` },
    { kind: "list", playbook: "Personas", type: "utility", slug: "programming-laptops", path: "/best/laptops-for-programming-kenya", kw: "best laptops for programming in Kenya", h1: "Best laptops for programming in Kenya",
      title: (n, y) => `Best Laptops for Programming in Kenya (${y}): ${n} Picks`, persona: "developers, software students and data analysts",
      pain: ["enough memory for an editor, a browser, Docker or virtual machines at once", "a recent processor that compiles quickly", "fast storage for large projects"],
      filter: (p) => p.sp.ram >= 16 && (p.sp.tier || 0) >= 3 && recency(p.sp) >= 4,
      angle: (s) => `Every pick has 16 GB of RAM or more and a 10th-gen or newer Core i5 class processor or better: the floor for running an IDE, a browser and containers together. ${s.pool} laptops qualify.` },
    { kind: "list", playbook: "Personas", type: "utility", slug: "design-laptops", path: "/best/laptops-for-graphic-design-and-video-editing-kenya", kw: "laptops for graphic design and video editing in Kenya", h1: "Laptops for graphic design and video editing in Kenya",
      title: (n, y) => `Laptops for Design & Video Editing in Kenya (${y})`, noun: "laptop for design and video editing", persona: "graphic designers, video editors, architects and engineers",
      pain: ["graphics power for Adobe apps, CAD and rendering", "16 GB of RAM or more for large files", "a fast processor for exports"],
      filter: (p) => p.sp.ram >= 16 && (p.sp.gpu || p.sp.cpu === "Apple M-series" || /-(zbook|precision)-/.test(`-${p.slug}-`)),
      angle: (s) => `Each pick has 16 GB of RAM or more and either a dedicated graphics card, a workstation chassis (ZBook, Precision) or an Apple M chip. ${s.pool} laptops qualify.` },
    { kind: "list", playbook: "Personas", type: "utility", slug: "gaming-laptops", path: "/best/gaming-laptops-kenya", kw: "gaming laptops in Kenya", h1: "Gaming laptops in Kenya",
      title: (n, y) => `Gaming Laptops in Kenya (${y}): ${n} With Real Graphics Cards`, noun: "gaming laptop", persona: "gamers and students who also game",
      pain: ["a dedicated graphics card (integrated graphics struggle with modern games)", "cooling that holds up in long sessions", "a price that leaves room for a headset and mouse"],
      filter: (p) => p.sp.gpu || /-(omen|victus|legion|rog|nitro|predator|alienware|gaming)-/.test(`-${p.slug}-`),
      angle: (s) => `Only laptops with a dedicated graphics card or a gaming line (OMEN, Victus, Legion and similar) are listed. ${s.pool} laptops qualify.` },
    { kind: "list", playbook: "Curation", type: "utility", slug: "2-in-1-laptops", path: "/best/2-in-1-laptops-kenya", kw: "2-in-1 laptops in Kenya", h1: "Best 2-in-1 laptops in Kenya",
      title: (n, y) => `Best 2-in-1 Laptops in Kenya (${y}): ${n} Convertibles`, filter: (p) => p.sp.convertible,
      angle: (s) => `${s.pool} laptops here fold into a tablet (x360, Yoga, 2-in-1 and Folio models). These are the ${s.n} best specified.` },
    { kind: "list", playbook: "Curation", type: "utility", slug: "touchscreen-laptops", path: "/best/touchscreen-laptops-kenya", kw: "touchscreen laptops in Kenya", h1: "Best touchscreen laptops in Kenya",
      title: (n, y) => `Best Touchscreen Laptops in Kenya (${y}): Top ${n}`, filter: (p) => p.sp.touch && !p.sp.convertible,
      angle: (s) => `${s.pool} laptops have a touchscreen but a normal hinge (for fold-over models see the 2-in-1 list).` },
    { kind: "list", playbook: "Curation", type: "utility", slug: "16gb-ram-laptops", path: "/best/16gb-ram-laptops-kenya", kw: "16GB RAM laptops in Kenya", h1: "Best 16 GB RAM laptops in Kenya",
      title: (n, y) => `Best 16GB RAM Laptops in Kenya (${y}): Top ${n}`, filter: (p) => p.sp.ram === 16,
      angle: (s) => `${s.pool} laptops have exactly 16 GB of RAM, the sweet spot for multitasking.` },
  );
  // Directory: brands and processors.
  for (const [brand, label] of [["HP", "HP"], ["Lenovo", "Lenovo"], ["Dell", "Dell"], ["Apple", "Apple MacBook"]]) {
    c.push({ kind: "list", playbook: "Directory", type: "utility", slug: `${brand.toLowerCase()}-laptops`, path: `/laptops/${brand.toLowerCase()}-laptops-kenya`,
      kw: `${label} laptops price in Kenya`, h1: `${label} laptops in Kenya`, title: (n, y, s) => `${label} Laptops in Kenya (${y}): ${s.pool} Models & Prices`,
      filter: (p) => brandOf(p.slug) === brand, directory: true,
      noun: `${label} laptop`,
      angle: (s) => `${s.pool} ${label} laptops in stock, from ${ksh(s.from)} to ${ksh(s.max)}. Below: the best specified two in each budget band, and how the whole range splits by memory, storage and screen.` });
  }
  for (const [cpu, label, slug] of [["Core i5", "Core i5", "core-i5"], ["Core i7", "Core i7", "core-i7"], ["Core Ultra", "Intel Core Ultra", "core-ultra"], ["AMD Ryzen", "AMD Ryzen", "amd-ryzen"]]) {
    c.push({ kind: "list", playbook: "Directory", type: "utility", slug: `${slug}-laptops`, path: `/laptops/${slug}-laptops-kenya`,
      kw: `${label} laptop price in Kenya`, h1: `${label} laptops in Kenya`, title: (n, y, s) => `${label} Laptops in Kenya (${y}): ${s.pool} Models & Prices`,
      filter: (p) => p.sp.cpu === cpu, directory: true, noun: `${label} laptop`,
      angle: (s) => `${s.pool} ${label} laptops in stock, from ${ksh(s.from)} to ${ksh(s.max)} (median ${ksh(s.median)}). Below: the best specified two in each budget band.` });
  }
  // Profiles: laptop series.
  for (const [key, f] of Object.entries(SERIES_FACTS)) {
    c.push({ kind: "profile", playbook: "Profiles", type: "informational", slug: `${key}-series`, path: `/series/${key}-kenya`, key,
      kw: `${f.name} price in Kenya`, h1: `${f.name} in Kenya: models, prices and history`, title: (n, y, s) => `${f.name} in Kenya (${y}): ${s.pool} Models, Prices`,
      filter: (p) => f.match.test(`-${p.slug}-`) });
  }
  // Comparisons.
  const series = (key) => (p) => SERIES_FACTS[key].match.test(`-${p.slug}-`);
  const cmp = (a, b, la, lb, fa, fb, kw) => ({ kind: "compare", playbook: "Comparisons", type: "informational", slug: `${a}-vs-${b}`, path: `/compare/${a}-vs-${b}-kenya`, kw,
    h1: `${la} vs ${lb}: which to buy in Kenya`, title: (n, y) => `${la} vs ${lb} in Kenya (${y}): Prices & Specs`, sides: [[la, fa], [lb, fb]] });
  c.push(
    cmp("thinkpad", "elitebook", "ThinkPad", "EliteBook", series("thinkpad"), series("elitebook"), "ThinkPad vs EliteBook"),
    cmp("elitebook", "latitude", "EliteBook", "Latitude", series("elitebook"), series("latitude"), "EliteBook vs Latitude"),
    cmp("thinkpad", "latitude", "ThinkPad", "Latitude", series("thinkpad"), series("latitude"), "ThinkPad vs Latitude"),
    cmp("elitebook", "probook", "EliteBook", "ProBook", series("elitebook"), series("probook"), "EliteBook vs ProBook"),
    cmp("core-i5", "core-i7", "Core i5", "Core i7", (p) => p.sp.cpu === "Core i5", (p) => p.sp.cpu === "Core i7", "Core i5 vs Core i7 laptop"),
    cmp("core-ultra", "core-i7", "Core Ultra", "Core i7", (p) => p.sp.cpu === "Core Ultra", (p) => p.sp.cpu === "Core i7", "Core Ultra vs Core i7"),
    cmp("8gb", "16gb-ram", "8 GB RAM", "16 GB RAM", (p) => p.sp.ram === 8, (p) => p.sp.ram === 16, "8GB vs 16GB RAM laptop"),
    cmp("macbook", "windows-laptops", "MacBook", "Windows laptops", series("macbook"), (p) => !/macbook/.test(p.slug), "MacBook vs Windows laptop"),
    cmp("hp", "dell", "HP", "Dell", (p) => brandOf(p.slug) === "HP", (p) => brandOf(p.slug) === "Dell", "HP vs Dell laptops"),
    cmp("hp", "lenovo", "HP", "Lenovo", (p) => brandOf(p.slug) === "HP", (p) => brandOf(p.slug) === "Lenovo", "HP vs Lenovo laptops"),
  );
  c.push({ kind: "list", playbook: "Personas", type: "utility", slug: "student-laptops", path: "/best/student-laptops-kenya", kw: "best laptops for students in Kenya", filter: () => true, h1: "", title: () => "" });
  return c;
}

// Playbooks with no data behind them on this site (reported, not built).
export const PLAYBOOK_SKIPS = [
  { playbook: "Templates", reason: "The shop sells hardware; it has no templates, documents or files to offer." },
  { playbook: "Conversions", reason: "No conversion the shop can do honestly: currency rates are not in the dataset, and unit converters would have nothing to do with the catalogue." },
  { playbook: "Examples", reason: "No dataset of examples (setups, builds or customer projects) exists to show." },
  { playbook: "Locations", reason: "One shop (Moi Avenue, Nairobi CBD) with the same prices and courier to all 47 counties. Per-county or per-town pages would differ only by the place name: doorway pages. /delivery already covers every county." },
  { playbook: "Integrations", reason: "The catalogue has no software or services that integrate with anything." },
  { playbook: "Glossary", reason: "Term pages (what is a 2-in-1, what does 8th gen mean) would be general knowledge, not the shop's data; the spec explanations live on the list pages where they help a buyer decide." },
  { playbook: "Translations", reason: "No native Swahili copy exists to build from, and machine-translated pages with hreflang would be thin duplicates. Revisit if the shop writes Swahili pages itself." },
];

// ---------- building ----------

function laptopsOf(products) {
  return cleanRows(products)
    .filter((p) => CATEGORY_OF[p.slug] !== undefined && CATEGORIES[CATEGORY_OF[p.slug]][0] === "laptops")
    .map((p) => {
      const sp = specsOf(p.slug);
      return { ...p, sp, score: score(sp), short: shortName(p.name) };
    });
}
const byScore = (a, b) => b.score - a.score || a.price - b.price || (a.slug < b.slug ? -1 : 1);
const statsOf = (rows) => {
  const prices = rows.map((r) => r.price);
  return { pool: rows.length, from: Math.min(...prices), max: Math.max(...prices), median: median(prices) };
};
const share = (rows, f) => pct(rows.filter(f).length, rows.length);

export function buildPages(products, { changedAt = new Date().toISOString() } = {}) {
  const L = laptopsOf(products);
  const year = new Date(changedAt).getFullYear();
  const accepted = [];
  const skipped = [];
  const usedSlugs = new Set();
  const usedKw = new Set();
  for (const c of candidates()) {
    const skip = (reason) => skipped.push({ status: "SKIPPED", url: SITE + c.path, playbook_type: c.playbook, reason });
    const covered = Object.entries(EXISTING).find(([path, kw]) => kw.toLowerCase() === c.kw.toLowerCase() || (path === "/hp-vs-dell-vs-lenovo-laptops-kenya" && c.kind === "compare" && /^HP vs (Dell|Lenovo)/.test(c.kw)));
    if (covered) {
      skip(`Covered by the existing guide ${SITE}${covered[0]}; a second page would compete with it for the same search.`);
      continue;
    }
    if (usedSlugs.has(c.path) || usedKw.has(c.kw.toLowerCase())) {
      skip("Duplicate slug or primary keyword.");
      continue;
    }
    let page;
    if (c.kind === "compare") {
      const sides = c.sides.map(([label, f]) => [label, L.filter(f)]);
      const thin = sides.find(([, rows]) => rows.length < MIN_SIDE);
      if (thin) {
        skip(`Only ${thin[1].length} ${thin[0]} laptops in stock (minimum ${MIN_SIDE} per side).`);
        continue;
      }
      page = { ...c, sides: sides.map(([label, rows]) => ({ label, rows: [...rows].sort(byScore), stats: statsOf(rows) })) };
      page.listed = page.sides.flatMap((s) => s.rows.slice(0, 3).map((r) => r.slug));
    } else {
      const pool = L.filter(c.filter);
      if (pool.length < MIN_PRODUCTS) {
        skip(`Only ${pool.length} matching laptops in stock (minimum ${MIN_PRODUCTS}).`);
        continue;
      }
      const ranked = [...pool].sort(byScore);
      // Directory pages help people browse a range: the best two in each budget band.
      const items = c.directory ? LAPTOP_BANDS.flatMap(([lo, hi]) => ranked.filter((r) => r.price >= lo && r.price < hi).slice(0, 2)) : ranked.slice(0, LIST_SIZE);
      page = { ...c, pool, items, stats: statsOf(pool) };
      page.listed = page.items.map((r) => r.slug);
    }
    // Near-duplicate check against pages already accepted.
    const dupe = accepted.find((a) => {
      const shared = a.listed.filter((s) => page.listed.includes(s)).length;
      return shared / Math.min(a.listed.length, page.listed.length) > MAX_OVERLAP && a.kind === page.kind;
    });
    if (dupe) {
      skip(`Lists mostly the same laptops as ${SITE}${dupe.path} (over ${Math.round(MAX_OVERLAP * 100)}% shared); merged into that page.`);
      continue;
    }
    usedSlugs.add(c.path);
    usedKw.add(c.kw.toLowerCase());
    accepted.push(page);
  }
  // Links need every accepted page, so content is written in a second pass.
  const out = [];
  for (const p of accepted) {
    const doc = writePage(p, accepted, { year, changedAt, laptops: L });
    const words = wordCount(doc);
    const internal = doc.internal_links.filter((u) => u.startsWith(SITE) && !u.includes("/item/"));
    const problems = [];
    if (words < MIN_WORDS[p.type]) problems.push(`${words} words (minimum ${MIN_WORDS[p.type]})`);
    if (doc.content.faq.length < 3) problems.push(`${doc.content.faq.length} FAQs (minimum 3)`);
    if (internal.length < 5) problems.push(`${internal.length} internal links (minimum 5)`);
    if (doc.related_pages.length < 2) problems.push(`${doc.related_pages.length} related pages (minimum 2)`);
    if (problems.length) {
      skipped.push({ status: "SKIPPED", url: SITE + p.path, playbook_type: p.playbook, reason: `Failed quality gate: ${problems.join(", ")}.` });
      continue;
    }
    doc._words = words;
    out.push(doc);
  }
  // A page that failed the gate must not be linked from the others.
  const live = new Set(out.map((d) => d.url));
  for (const d of out) {
    d.internal_links = d.internal_links.filter((u) => !isGuideUrl(u) || live.has(u));
    d.related_pages = d.related_pages.filter((r) => live.has(r.url));
    for (const s of d.content.sections) s.body = s.body.replace(/\[([^\]]+)\]\((https:\/\/www\.ecbtechkenya\.com\/(?:best|compare|series|laptops)\/[^)]+)\)/g, (m, t, u) => (live.has(u) ? m : t));
  }
  return { pages: out, skipped: [...skipped, ...PLAYBOOK_SKIPS.map((s) => ({ status: "SKIPPED", ...s }))], changedAt };
}
const isGuideUrl = (u) => /^https:\/\/www\.ecbtechkenya\.com\/(best|compare|series|laptops)\//.test(u);

// ---------- writing ----------

const link = (text, url) => `[${text}](${url})`;
const productLink = (r) => link(r.short, `${SITE}/item/${r.slug}`);
const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

function relatedOf(p, all) {
  const scoreOf = (a) => a.listed.filter((s) => p.listed.includes(s)).length + (a.playbook === p.playbook ? 0.5 : 0);
  const others = all.filter((a) => a !== p);
  const sib = others.filter((a) => a.playbook === p.playbook).sort((a, b) => near(p, a) - near(p, b) || scoreOf(b) - scoreOf(a)).slice(0, 2);
  const cross = others.filter((a) => a.playbook !== p.playbook && !sib.includes(a)).sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, 3);
  return { sib, cross };
}
// Budget pages: the nearest budgets are the natural siblings.
const near = (p, a) => (p.budget && a.budget ? Math.abs(Math.log(a.budget / p.budget)) : 0);

function listRows(items, ctx) {
  return items.map((r, i) => {
    const pc = prosCons(r, ctx);
    return {
      rank: i + 1, name: r.short, url: `${SITE}/item/${r.slug}`, price: r.price, specs: specLine(r.sp), score: r.score,
      pros: pc.pros, cons: pc.cons,
    };
  });
}
const itemMd = (it) =>
  `${it.rank}. **${link(it.name, it.url)}**: ${ksh(it.price)}. ${it.specs || "Specs as listed on the product page"}. Spec score ${it.score}/${SCORE_MAX}.` +
  (it.pros.length ? ` Pros: ${it.pros.join("; ")}.` : "") + (it.cons.length ? ` Cons: ${it.cons.join("; ")}.` : "");
const tableMd = (head, rows) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");

// Laptops per budget band, with the best specified in each.
function bandRows(rows) {
  return LAPTOP_BANDS.map(([lo, hi, label]) => {
    const xs = rows.filter((r) => r.price >= lo && r.price < hi).sort(byScore);
    return { label, n: xs.length, best: xs[0] || null };
  });
}
const lowBand = (l) => l.replace(/^Under/, "under").replace(/ and over$/, " and over");
const bestCell = (b) => (b.best ? `${link(b.best.short, `${SITE}/item/${b.best.slug}`)} (${ksh(b.best.price)})` : "none in stock");

function featureRows(rows) {
  const st = statsOf(rows);
  const gens = rows.map((r) => r.sp.gen).filter(Boolean);
  return {
    models: rows.length, from: st.from, median: st.median, max: st.max,
    ram16: share(rows, (r) => r.sp.ram >= 16), ssd512: share(rows, (r) => r.sp.ssd >= 512),
    touch: share(rows, (r) => r.sp.touch), conv: share(rows, (r) => r.sp.convertible),
    recent: share(rows, (r) => recency(r.sp) >= 4), win11: share(rows, (r) => recency(r.sp) >= 3 && r.sp.cpu !== "Apple M-series"),
    newestGen: gens.length ? Math.max(...gens) : null, oldestGen: gens.length ? Math.min(...gens) : null,
    gpu: share(rows, (r) => r.sp.gpu),
  };
}

function writePage(p, all, { year, changedAt }) {
  const url = SITE + p.path;
  const asOf = new Date(changedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });
  const { sib, cross } = relatedOf(p, all);
  const parent = `${SITE}/category/laptops`;
  const sections = [];
  const faq = [];
  let intro;
  let schemaItems = [];
  let title;
  let description;
  if (p.kind === "list") {
    const s = { ...p.stats, n: p.items.length };
    const ctx = { median: median(p.items.map((r) => r.price)), cheapest: [...p.items].sort((a, b) => a.price - b.price)[0].slug };
    const items = listRows(p.items, ctx);
    title = p.title(items.length, year, s);
    const top = [...items].sort((a, b) => b.score - a.score || a.price - b.price)[0];
    const cheapest = items.find((it) => it.url.endsWith(ctx.cheapest));
    intro = `${p.angle(s)} The best specified is the ${top.name} at ${ksh(top.price)} (${top.specs}). The cheapest on the list is the ${cheapest.name} at ${ksh(cheapest.price)}. Prices as of ${asOf}, from the live shop.`;
    description = `${s.pool} laptops checked, top ${items.length} ranked by specs: from ${ksh(Math.min(...items.map((i) => i.price)))}. Prices as of ${asOf}. ECB Technologies, Nairobi CBD.`;
    if (p.persona) {
      sections.push({ heading: `What ${p.persona} need`, body: `People in this group usually need ${p.pain.slice(0, -1).join(", ")} and ${p.pain[p.pain.length - 1]}. The filter for this page turns those needs into rules a listing either meets or does not: ${p.angle(s)}` });
    }
    sections.push({ heading: p.directory ? "The best pick in every budget" : `The ${items.length} best picks`, body: items.map(itemMd).join("\n"), items });
    // Summary table.
    sections.push({
      heading: "Comparison summary",
      body: tableMd(["#", "Laptop", "Processor and memory", "Price", "Score"], items.map((it) => [String(it.rank), link(it.name, it.url), it.specs || "see listing", ksh(it.price), `${it.score}/${SCORE_MAX}`])),
    });
    const f = featureRows(p.pool);
    const brands = {};
    for (const r of p.pool) brands[brandOf(r.slug)] = (brands[brandOf(r.slug)] || 0) + 1;
    const topBrands = Object.entries(brands).sort((a, b) => b[1] - a[1]);
    sections.push({
      heading: p.directory ? "Filter the full range" : `All ${s.pool} matching laptops at a glance`,
      body:
        `Of the ${s.pool} laptops that match, ${f.ram16}% have 16 GB of RAM or more, ${f.ssd512}% have a 512 GB SSD or bigger, ${f.touch}% have a touchscreen and ${f.recent}% have a 10th-gen or newer processor (or an Apple M / Intel Core Ultra chip). ` +
        `Prices run from ${ksh(f.from)} to ${ksh(f.max)}, with half below ${ksh(f.median)}. ` +
        (topBrands.length > 1 ? `By brand: ${topBrands.map(([b, n]) => `${b} ${n}`).join(", ")}.` : "") + "\n\n" +
        tableMd(["Filter", "Laptops"], [
          ["16 GB RAM or more", String(p.pool.filter((r) => r.sp.ram >= 16).length)],
          ["512 GB SSD or more", String(p.pool.filter((r) => r.sp.ssd >= 512).length)],
          ["Touchscreen", String(p.pool.filter((r) => r.sp.touch).length)],
          ["2-in-1 (folds into a tablet)", String(p.pool.filter((r) => r.sp.convertible).length)],
          ["Dedicated graphics", String(p.pool.filter((r) => r.sp.gpu).length)],
          [`Under ${ksh(f.median)} (the median)`, String(p.pool.filter((r) => r.price < f.median).length)],
        ]),
    });
    sections.push({ heading: "How we ranked them", body: `${SCORE_TEXT} Specs are read from each product's listing as the shop typed it; where a listing does not state the memory or storage, the laptop scores 1 point for it and the con says so, so check the product page or ask us.` });
    if (p.persona) {
      const best = (f2) => items.find(f2);
      const lines = [
        [best((it) => /32 GB|24 GB/.test(it.specs)), "most memory on the list"],
        [cheapest, "lowest price on the list"],
        [best((it) => /2-in-1|touchscreen/.test(it.specs)), "touch input for notes, signing or sketching"],
      ].filter(([it]) => it);
      sections.push({ heading: `Which one for which ${p.persona.split(",")[0].replace(/s$/, "")}`, body: lines.map(([it, why]) => `- ${link(it.name, it.url)} (${ksh(it.price)}): ${why}.`).join("\n") + `\n- Anything else on the list: the higher the score, the longer it will stay comfortable.` });
    }
    faq.push(
      { question: `Which ${p.noun || p.h1.replace(/^Best /, "").replace(/ in Kenya$/, "").replace(/s\b(?=[^s]*$)/, "")} has the best specs?`, answer: `By our spec score, the ${top.name} at ${ksh(top.price)} (${top.specs}), as of ${asOf}.` },
      { question: `What is the cheapest option on this list?`, answer: `The ${cheapest.name} at ${ksh(cheapest.price)}${cheapest.specs ? ` (${cheapest.specs})` : ""}.` },
      { question: `How many laptops match?`, answer: `${s.pool} laptops at ECB Technologies match, priced from ${ksh(s.from)} to ${ksh(s.max)} with a median of ${ksh(s.median)}.` },
      { question: "Can I see one before paying?", answer: `Yes. Visit the shop at Techmart Iconic Business Plaza, 3rd floor, Moi Avenue, Nairobi CBD (Monday to Saturday, 9am to 7pm), or ask for photos on WhatsApp (${PHONE}). We deliver across Kenya and you can pay by M-Pesa or card.` },
    );
    schemaItems = items.map((it) => ({ name: it.name, url: it.url, price: it.price }));
  } else if (p.kind === "compare") {
    const [A, B] = p.sides;
    const fa = featureRows(A.rows);
    const fb = featureRows(B.rows);
    title = p.title(0, year);
    const cheaper = fa.median < fb.median ? A : B;
    const pricier = cheaper === A ? B : A;
    const gap = Math.abs(fa.median - fb.median);
    intro = `At ECB Technologies, the median ${A.label} laptop costs ${ksh(fa.median)} (${fa.models} in stock) and the median ${B.label} laptop costs ${ksh(fb.median)} (${fb.models} in stock). ${gap <= 0.05 * Math.max(fa.median, fb.median) ? "That is about the same, so choose on features." : `${cheaper.label} is ${ksh(gap)} cheaper at the median.`} The table below compares them on the specs that matter, using every laptop in stock, as of ${asOf}.`;
    description = `${A.label} vs ${B.label}: median ${ksh(fa.median)} vs ${ksh(fb.median)}, ${fa.models} and ${fb.models} models compared on RAM, SSD, processor age and price. Prices as of ${asOf}.`;
    const rowsM = [
      ["Laptops in stock", String(fa.models), String(fb.models)],
      ["Price from", ksh(fa.from), ksh(fb.from)],
      ["Median price", ksh(fa.median), ksh(fb.median)],
      ["Price up to", ksh(fa.max), ksh(fb.max)],
      ["16 GB RAM or more", `${fa.ram16}%`, `${fb.ram16}%`],
      ["512 GB SSD or more", `${fa.ssd512}%`, `${fb.ssd512}%`],
      ["10th gen or newer (or Core Ultra / Apple M)", `${fa.recent}%`, `${fb.recent}%`],
      ["Touchscreen", `${fa.touch}%`, `${fb.touch}%`],
      ["2-in-1", `${fa.conv}%`, `${fb.conv}%`],
      ["Dedicated graphics", `${fa.gpu}%`, `${fb.gpu}%`],
    ];
    if (fa.newestGen && fb.newestGen) rowsM.push(["Intel generations in stock", `${ordinal(fa.oldestGen)}–${ordinal(fa.newestGen)}`, `${ordinal(fb.oldestGen)}–${ordinal(fb.newestGen)}`]);
    sections.push({ heading: "Feature matrix", body: tableMd(["", A.label, B.label], rowsM) });
    const ba = bandRows(A.rows);
    const bb = bandRows(B.rows);
    const biggest = (bs) => bs.reduce((m, b) => (b.n > m.n ? b : m), bs[0]);
    sections.push({
      heading: "Price by budget",
      body:
        `Most ${A.label} laptops here fall in the ${lowBand(biggest(ba).label)} band (${biggest(ba).n}); most ${B.label} laptops fall in the ${lowBand(biggest(bb).label)} band (${biggest(bb).n}). The best specified model in each band:\n\n` +
        tableMd(["Budget", `${A.label} (count)`, `Best ${A.label}`, `${B.label} (count)`, `Best ${B.label}`], ba.map((b, i) => [b.label, String(b.n), bestCell(b), String(bb[i].n), bestCell(bb[i])])),
    });
    for (const side of p.sides) {
      const key = Object.keys(SERIES_FACTS).find((k2) => SERIES_FACTS[k2].name.toLowerCase().endsWith(side.label.toLowerCase()));
      const about = key ? `${SERIES_FACTS[key].about} ${SERIES_FACTS[key].timeline.map(([y, t]) => `${y}: ${t}`).join("; ")}. ` : "";
      const best3 = listRows(side.rows.slice(0, 3), {});
      sections.push({
        heading: `${side.label}: what you get`,
        body: `${about}We have ${side.rows.length} ${side.label} laptops from ${ksh(side.stats.from)} to ${ksh(side.stats.max)}. The three best specified:\n\n${best3.map(itemMd).join("\n")}`,
        items: best3,
      });
    }
    const rec = [];
    const more = (x, y, what) => (x > y + 5 ? A.label : y > x + 5 ? B.label : null) && { side: x > y ? A.label : B.label, what };
    const r1 = more(fa.ram16, fb.ram16, "multitasking and heavy apps (more of its models have 16 GB RAM or more)");
    const r2 = more(fa.recent, fb.recent, "the longest software support (more of its models have a 10th-gen or newer processor)");
    const r3 = more(fa.touch, fb.touch, "touch and pen use (more of its models have a touchscreen)");
    rec.push(`- **Tight budget:** ${cheaper.label}. Its median is ${ksh(cheaper === A ? fa.median : fb.median)} and the cheapest is ${ksh(cheaper === A ? fa.from : fb.from)}.`);
    for (const r of [r1, r2, r3]) if (r) rec.push(`- **For ${r.what.split(" (")[0]}:** ${r.side} (${r.what.split(" (")[1]}.`);
    rec.push(`- **Highest spec available:** ${pricier.label}, up to ${ksh(pricier === A ? fa.max : fb.max)}.`);
    sections.push({ heading: "Which should you buy?", body: rec.join("\n") });
    sections.push({
      heading: "Verdict",
      body: `${cheaper.label} costs less at the median (${ksh(Math.min(fa.median, fb.median))} against ${ksh(Math.max(fa.median, fb.median))}). ${[r1, r2, r3].filter(Boolean).length ? `${[r1, r2, r3].filter(Boolean).map((r) => `${r.side} leads on ${r.what.split(" (")[0]}`).join("; ")}.` : "On memory, processor age and touch the two are within 5 points of each other."} Either way, compare the exact model: the spread inside each group is wider than the gap between them.`,
    });
    sections.push({ heading: "How we compared them", body: `Every ${A.label} and ${B.label} laptop in stock is counted, not a sample. Shares are of each side's own total. The best picks use the same spec score as our lists: ${SCORE_TEXT.replace(/^Each laptop gets a spec score out of 42, read from its listing: /, "")}` });
    faq.push(
      { question: `Which is cheaper, ${A.label} or ${B.label}?`, answer: `${cheaper.label}, at the median: ${ksh(Math.min(fa.median, fb.median))} against ${ksh(Math.max(fa.median, fb.median))} at ECB Technologies (${asOf}).` },
      { question: `Which has more RAM, ${A.label} or ${B.label}?`, answer: `${fa.ram16}% of our ${A.label} laptops and ${fb.ram16}% of our ${B.label} laptops have 16 GB of RAM or more.` },
      { question: `What is the cheapest ${A.label} and the cheapest ${B.label}?`, answer: `${A.label} from ${ksh(fa.from)} and ${B.label} from ${ksh(fb.from)}.` },
      { question: "Do you deliver outside Nairobi?", answer: `Yes, by courier to all 47 counties; riders deliver within Nairobi, and pickup at the shop on Moi Avenue is free.` },
    );
    schemaItems = p.sides.flatMap((sd) => sd.rows.slice(0, 3).map((r) => ({ name: r.short, url: `${SITE}/item/${r.slug}`, price: r.price })));
  } else {
    const f = SERIES_FACTS[p.key];
    const rows = [...p.pool].sort(byScore);
    const fr = featureRows(rows);
    title = p.title(0, year, p.stats);
    intro = `We have ${rows.length} ${f.name} laptops, from ${ksh(fr.from)} to ${ksh(fr.max)} with a median of ${ksh(fr.median)}. ${f.about} Below: the models in stock by generation, the best specified, and how the line developed. Prices as of ${asOf}.`;
    description = `${rows.length} ${f.name} laptops in stock from ${ksh(fr.from)} (median ${ksh(fr.median)}): models by generation, best picks and history. ECB Technologies, Nairobi CBD.`;
    sections.push({ heading: "Timeline", body: f.timeline.map(([y, t]) => `- **${y}:** ${t}`).join("\n") + (fr.newestGen ? `\n- **In stock now:** Intel ${ordinal(fr.oldestGen)} to ${ordinal(fr.newestGen)} gen models.` : "") });
    const gens = {};
    for (const r of rows) {
      const g = r.sp.cpu === "Core Ultra" || r.sp.cpu === "Apple M-series" ? r.sp.cpu : r.sp.gen ? `${ordinal(r.sp.gen)} gen` : "Not stated";
      (gens[g] = gens[g] || []).push(r.price);
    }
    const order = (g) => (g === "Not stated" ? 99 : /gen/.test(g) ? parseInt(g, 10) : 50);
    sections.push({
      heading: "Models in stock by processor generation",
      body: tableMd(["Generation", "Laptops", "From", "Median"], Object.entries(gens).sort((a, b) => order(a[0]) - order(b[0])).map(([g, ps]) => [g, String(ps.length), ksh(Math.min(...ps)), ps.length >= 3 ? ksh(median(ps)) : "too few"])),
    });
    const bands = bandRows(rows);
    sections.push({
      heading: "Best pick in every budget",
      body: `Where the ${rows.length} ${f.name} laptops sit on price, and the best specified model in each band:\n\n` + tableMd(["Budget", "Laptops", "Best specified"], bands.map((b) => [b.label, String(b.n), bestCell(b)])),
    });
    const best = listRows(rows.slice(0, 6), { median: fr.median, cheapest: [...rows].sort((a, b) => a.price - b.price)[0].slug });
    sections.push({ heading: `The best specified ${f.name} laptops`, body: best.map(itemMd).join("\n"), items: best });
    const cheapest = [...rows].sort((a, b) => a.price - b.price)[0];
    const genPrices = Object.entries(gens).filter(([g, ps]) => /gen/.test(g) && ps.length >= 3).sort((a, b) => order(a[0]) - order(b[0]));
    const step = genPrices.length >= 2 ? `Moving from a ${genPrices[0][0]} model (median ${ksh(median(genPrices[0][1]))}) to a ${genPrices[genPrices.length - 1][0]} model (median ${ksh(median(genPrices[genPrices.length - 1][1]))}) is the biggest price step in this line.` : "";
    sections.push({
      heading: "What the numbers say",
      body: `${fr.ram16}% of our ${f.name} laptops have 16 GB of RAM or more, ${fr.ssd512}% have a 512 GB SSD or bigger, ${fr.touch}% have a touchscreen and ${fr.recent}% have a 10th-gen or newer processor (or an Apple M / Core Ultra chip). ${step} The cheapest is the ${shortName(cheapest.name)} at ${ksh(cheapest.price)}. ${fr.win11 < 100 && p.key !== "macbook" ? `${100 - fr.win11}% have a 7th-gen or older processor (or one we cannot confirm), which Windows 11 does not officially support; check the generation before you buy.` : ""}`.trim(),
    });
    sections.push({ heading: "How we ranked them", body: SCORE_TEXT });
    faq.push(
      { question: `How much is ${/^[AEIOH]/.test(f.name) ? "an" : "a"} ${f.name} in Kenya?`, answer: `At ECB Technologies, ${f.name} laptops cost from ${ksh(fr.from)} to ${ksh(fr.max)}, with a median of ${ksh(fr.median)} across ${rows.length} models (${asOf}).` },
      { question: `What is the cheapest ${f.name}?`, answer: `The ${shortName(cheapest.name)} at ${ksh(cheapest.price)}.` },
      { question: `Which ${f.name} generations do you stock?`, answer: Object.entries(gens).sort((a, b) => order(a[0]) - order(b[0])).map(([g, ps]) => `${g}: ${ps.length}`).join("; ") + "." },
      { question: "Is there a warranty?", answer: `Ask on WhatsApp (${PHONE}) for the warranty on the exact model; it is shown on each product page where the shop lists it.` },
    );
    schemaItems = best.map((it) => ({ name: it.name, url: it.url, price: it.price }));
  }
  // Links.
  const guideLinks = [...sib, ...cross].map((a) => ({ url: SITE + a.path, title: a.h1 }));
  const extra = [
    { url: parent, title: "All laptops" },
    { url: `${SITE}/guides`, title: "All laptop guides" },
    { url: `${SITE}/research/laptop-prices-kenya`, title: "Laptop price statistics" },
    { url: `${SITE}/laptop-prices-in-kenya`, title: "Laptop prices in Kenya" },
  ];
  if (/student|budget|under/i.test(p.kw) || (p.budget && p.budget <= 50000)) extra.push({ url: `${SITE}/student-laptops-kenya`, title: "Best laptops for students" });
  if (/HP|Dell|Lenovo|ThinkPad|EliteBook|Latitude/.test(p.kw)) extra.push({ url: `${SITE}/hp-vs-dell-vs-lenovo-laptops-kenya`, title: "HP vs Dell vs Lenovo" });
  sections.push({ heading: "Related guides", body: [...guideLinks, ...extra].map((l) => `- ${link(l.title, l.url)}`).join("\n") });
  const cta = `Ask about any laptop here on WhatsApp (${PHONE}) or visit the shop on Moi Avenue, Nairobi CBD, Monday to Saturday, 9am–7pm. Delivery to all 47 counties; pay by M-Pesa or card.`;
  const internal_links = [...new Set([parent, ...guideLinks.map((l) => l.url), ...extra.map((l) => l.url)])];
  const itemList = {
    "@type": "ItemList", name: title, numberOfItems: schemaItems.length,
    itemListElement: schemaItems.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: it.url, name: it.name })),
  };
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": p.kind === "list" ? "CollectionPage" : "Article", "@id": `${url}#page`, url, name: title, headline: title, description, inLanguage: "en-KE", dateModified: changedAt, isPartOf: { "@id": `${SITE}/#website` }, about: p.kw, mainEntity: itemList, publisher: { "@id": `${SITE}/#organization` } },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: faq.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })) }
      // (The shop's own template already adds the BreadcrumbList.)
    ],
  };
  const secondary = [];
  if (p.kind === "list") secondary.push(`${p.kw.replace(/ in Kenya$/, "")} price`, `${p.kw.replace(/ in Kenya$/, "")} Nairobi`);
  if (p.kind === "compare") secondary.push(`${p.sides[0].label} price in Kenya`, `${p.sides[1].label} price in Kenya`, `${p.kw} Nairobi`);
  if (p.kind === "profile") secondary.push(`${SERIES_FACTS[p.key].name} Nairobi`, `${SERIES_FACTS[p.key].name} models`, `used ${SERIES_FACTS[p.key].name} price`);
  return {
    url,
    playbook_type: p.playbook,
    seo: {
      title: title.length > 60 ? title.replace(/ \(\d{4}\)/, "") : title,
      meta_description: description.length > 158 ? description.slice(0, 155).replace(/\s+\S*$/, "") + "…" : description,
      primary_keyword: p.kw,
      secondary_keywords: secondary,
      search_intent: p.kind === "compare" ? "commercial investigation (comparison)" : p.kind === "profile" ? "informational + commercial (series research)" : "commercial (shortlist to buy)",
    },
    content: { h1: p.h1, introduction: intro, sections: sections.map(({ heading, body }) => ({ heading, body })), faq, call_to_action: cta },
    schema: { type: p.kind === "list" ? "CollectionPage + ItemList + FAQPage" : "Article + ItemList + FAQPage", structured_data: structured },
    internal_links,
    related_pages: guideLinks.slice(0, 4).map((l) => ({ url: l.url, title: l.title })),
    data_requirements_used: [
      `live product list (name, price, address) as of ${changedAt}`,
      p.kind === "compare" ? `${p.sides.map((s) => `${s.rows.length} ${s.label}`).join(" and ")} laptops` : `${p.pool.length} matching laptops`,
      "specs read from product addresses (processor, generation, RAM, SSD, touch, 2-in-1, graphics)",
      ...(p.kind === "profile" ? ["SERIES_FACTS timeline (pseo.js)"] : []),
    ],
    _view: { sections, kind: p.kind, wa: wa(`Hi ECB, I saw "${p.h1}" on your site.`) },
  };
}

export function wordCount(doc) {
  const text = [doc.content.introduction, ...doc.content.sections.map((s) => `${s.heading} ${s.body}`), ...doc.content.faq.map((f) => `${f.question} ${f.answer}`), doc.content.call_to_action].join(" ");
  return text.replace(/\]\([^)]*\)/g, "]").replace(/[|#*\-[\]]/g, " ").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

// The JSON the prompt asks for (internal fields removed).
export function publicJson(doc) {
  const { _view, _words, ...rest } = doc;
  return rest;
}

// ---------- rendering ----------

const escH = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Small markdown subset used by the sections: paragraphs, lists, tables, links, bold.
export function mdToHtml(md) {
  const inline = (t) => escH(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => `<a href="${u.replace(SITE, "")}">${a}</a>`);
  const out = [];
  for (const block of md.split(/\n\n+/)) {
    const lines = block.split("\n");
    if (lines[0].startsWith("|")) {
      const cells = (l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const [head, , ...rows] = lines;
      out.push(`<div class="ecb-rs-table"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    } else if (/^\d+\. /.test(lines[0])) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`);
    } else if (lines[0].startsWith("- ")) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`);
    } else out.push(`<p>${inline(block)}</p>`);
  }
  return out.join("");
}

const slugId = (h) => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function itemsHtml(items) {
  return `<ol class="ecb-pg-items">${items
    .map(
      (it) =>
        `<li><p class="ecb-pg-name"><a href="${it.url.replace(SITE, "")}">${escH(it.name)}</a> <span class="ecb-pg-price">${escH(ksh(it.price))}</span></p>` +
        `<p class="ecb-rs-meta">${escH(it.specs || "Specs on the product page")} · score ${it.score}/${SCORE_MAX}</p>` +
        (it.pros.length ? `<p class="ecb-pg-pc"><b>+</b> ${it.pros.map(escH).join("; ")}</p>` : "") +
        (it.cons.length ? `<p class="ecb-pg-pc"><b>−</b> ${it.cons.map(escH).join("; ")}</p>` : "") +
        `</li>`,
    )
    .join("")}</ol>`;
}

export function pageHtml(doc) {
  const c = doc.content;
  const v = doc._view;
  const body = v.sections
    .map((s) => {
      const lead = s.items && !/^\d+\. /.test(s.body) ? mdToHtml(s.body.split("\n\n")[0]) : "";
      return `<h2 id="${slugId(s.heading)}">${escH(s.heading)}</h2>${s.items ? lead + itemsHtml(s.items) : mdToHtml(s.body)}`;
    })
    .join("");
  const faq = `<h2 id="faq">Questions</h2>${c.faq.map((f) => `<h3 id="${slugId(f.question)}">${escH(f.question)}</h3><p>${escH(f.answer)}</p>`).join("")}`;
  return (
    `<div class="ecb-rs ecb-pg"><p class="ecb-rs-lead"><strong>${escH(c.introduction)}</strong></p>${body}${faq}` +
    `<p class="ecb-pg-cta">${escH(c.call_to_action)} <a href="${v.wa}" rel="nofollow">WhatsApp us</a></p>` +
    `<p class="ecb-rs-meta">Built from the live catalogue · <a href="${doc.url.replace(SITE, "")}.md">Markdown</a> · <a href="/guides">All guides</a></p></div>`
  );
}

export function pageMarkdown(doc) {
  const c = doc.content;
  return [
    `# ${c.h1}`,
    "",
    `> ${c.introduction}`,
    "",
    `Canonical: ${doc.url}`,
    "",
    ...c.sections.flatMap((s) => [`## ${s.heading}`, "", s.body, ""]),
    "## Questions",
    "",
    ...c.faq.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
    c.call_to_action,
    "",
  ].join("\n");
}

const GROUPS = ["Curation", "Personas", "Comparisons", "Directory", "Profiles"];
export function hubHtml(built) {
  return (
    `<div class="ecb-rs ecb-pg"><p class="ecb-rs-lead"><strong>Laptop buying guides built from the live catalogue: ${built.pages.length} pages, each checked for enough real products before it is published.</strong> Prices update when the shop's prices change.</p>` +
    GROUPS.map((g) => {
      const ps = built.pages.filter((d) => d.playbook_type === g);
      return ps.length ? `<h2>${g === "Profiles" ? "Laptop series" : g === "Directory" ? "By brand and processor" : g === "Curation" ? "Best laptops by budget and feature" : g === "Personas" ? "Best laptops for you" : g}</h2><ul>${ps.map((d) => `<li><a href="${d.url.replace(SITE, "")}">${escH(d.content.h1)}</a></li>`).join("")}</ul>` : "";
    }).join("") +
    `<h2>More</h2><ul><li><a href="/research">Price research</a></li><li><a href="/student-laptops-kenya">Best laptops for students</a></li><li><a href="/hp-vs-dell-vs-lenovo-laptops-kenya">HP vs Dell vs Lenovo</a></li><li><a href="/laptop-prices-in-kenya">Laptop prices in Kenya</a></li></ul></div>`
  );
}
export function hubMarkdown(built) {
  return [
    "# Laptop guides",
    "",
    `> ${built.pages.length} laptop buying guides built from ECB Technologies' live catalogue.`,
    "",
    ...GROUPS.flatMap((g) => {
      const ps = built.pages.filter((d) => d.playbook_type === g);
      return ps.length ? [`## ${g}`, "", ...ps.map((d) => `- [${d.content.h1}](${d.url}.md)`), ""] : [];
    }),
  ].join("\n");
}

export const PSEO_CSS =
  ".ecb-pg h2{margin:34px 0 12px}.ecb-pg h3{font-size:16px;margin:18px 0 6px}.ecb-pg-items{padding-left:22px}.ecb-pg-items li{margin:0 0 18px}" +
  ".ecb-pg-name{margin:0 0 2px;font-size:16px}.ecb-pg-price{font-family:'Space Mono',ui-monospace,monospace;white-space:nowrap;margin-left:6px}" +
  ".ecb-pg-pc{margin:2px 0;font-size:14px;color:#333}.ecb-pg-pc b{display:inline-block;width:14px}.ecb-pg-cta{margin-top:28px;padding:16px;border:1px solid #000;border-radius:12px}" +
  ".ecb-pg ul{padding-left:20px}.ecb-pg li{line-height:1.6}";

export const GUIDE_PATH = /^\/(guides|best\/[a-z0-9-]+|compare\/[a-z0-9-]+|series\/[a-z0-9-]+|laptops\/[a-z0-9-]+)$/;
