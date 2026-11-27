// Cloudflare Worker for www.ecbtechkenya.com / ecbtechkenya.com (the GeniusCart shop).
//
// - /sitemap.xml: a sitemap index of /sitemap-pages.xml, /sitemap-categories.xml,
//   /sitemap-guides.xml and /sitemap-products.xml, built live from the shop and
//   the speed Worker's KV (guides that passed their gates, live duplicates).
//   Only indexable URLs: no duplicates, empty categories or redirects. Cached
//   for 6 hours, so new and removed products show up automatically.
// - /robots.txt: the shop's own robots.txt, with the Sitemap line added.
// - /assets/images/brands/*: the theme asks for brand logos that don't exist,
//   and the shop answers each with a full 62 KB "not found" page. Missing ones
//   now get a tiny, cached "not found" instead (the buttons keep showing text).
// - Everything else passes straight through to the shop, unchanged.
//
// Deploy: Cloudflare dashboard → Workers & Pages → Create → Worker → paste this →
// Deploy. Then add routes so it only handles these paths:
//   ecbtechkenya.com/sitemap*, www.ecbtechkenya.com/sitemap*,
//   ecbtechkenya.com/robots.txt, www.ecbtechkenya.com/robots.txt,
//   ecbtechkenya.com/assets/images/brands/*, www.ecbtechkenya.com/assets/images/brands/*

const CACHE_SECONDS = 6 * 60 * 60;
// Every URL in the sitemap uses the canonical host (the bare domain redirects
// to www), whichever host the sitemap is requested on.
const SITE = "https://www.ecbtechkenya.com";
// Not in the sitemap: copies of a product listed in a second category (their
// canonical is the original) and categories that are empty (noindex).
const SKIP_ITEMS = new Set(["asus-tuf-vg34vql3a-34-wqhd-34401440-180hz-1ms-speakers-mpr5345unh", "hp-e24t-g4-touch-monitor-24-touch-ips-full-hd-60hz-oe58676hhj", "hp-omen-34c-34-wqhd-34401440-165hz-1ms-built-in-speakers-xnx5562f7x", "hp-s27-fhd-27-fhd-ips-100hz-jvs88365q9", "hp-s27q-qhd-27-qhd-ips-100hz-qfx9007zpo", "hp-series-5-532sf-32-full-hd-100hz-bwy0125uwr", "lg-27u730a-27-4k-uhd-usb-c-60hz-speakers-xbo9866uvz", "lg-34cb99-w-34-34401440-60hz-usb-c-built-in-speakers-uuf7786abq", "lg-34u650a-b-34-ips-34401440-100hz-built-in-speakers-n4a59434gp", "lg-34wr55qk-b-34-va-wqhd-34401440-100hz-usb-c-0bv5745qpe", "msi-pro-mp341cqw-e12-34-34401440-120hz-1ms-white-g7y5200lgy", "samsung-m8-smart-monitor-ls32fm801umxue-32-4k-smart-usb-c-60hz-built-in-speakers-webcam-white-obr0357c69", "samsung-odyssey-ark-2nd-gen-ls55cg97wnmxue-55-smart-4k-38402160-165hz-1ms-1000r-va-speakers-black-9xk7168lco", "samsung-odyssey-g5-g55c-ls27cg552emxue-27-qhd-2k-165hz-black-jqh4573x68", "samsung-odyssey-g9-ls49fg910emxue-49-5k-51201440-1000r-144hz-1ms-va-black-pgj6550srp", "samsung-odyssey-g9-oled-ls49dg932smxue-49-5k-51201440-1800r-240hz-003ms-silver-g9q6694bpf", "samsung-odyssey-g9-smart-oled-ls49dg952smxue49-smart-5k-51201440-1800r-240hz-003ms-speakers-silver-kr97548wqa", "samsung-odyssey-neo-g9-ls57cg952nmxue-57-dual-4k-76802160-240hz-1ms-1000r-white-pj174487o5", "samsung-viewfinity-s6-ls34c650vamxue-34-34401440-100hz-usb-c-webcam-built-in-speakers-jdx6155yem", "xiaomi-g34wqi-34-wqhd-34401440-180hz-1ms-white-hhg5039c98"]);
const SKIP_PAGES = /^\/(category\/(TV-and-Home-Appliances|laptops\/Student-Deals|Computing-Accessories\/monitors)|terms|privacy)$/i;

// Paths on the shop that are not useful public pages for search engines.
const EXCLUDE = /^\/(admin|user|rider|agent|vendor|carts?|checkout|addcart|addtonumcart|removecart|compare|item\/compare|item\/show|wishlist|assets|login|register|logout|currency|language)(\/|$)/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Old WordPress sitemap addresses still registered in Search Console
    // answer with the new sitemaps, so they stop failing.
    if (url.pathname === "/sitemap.xml" || url.pathname === "/sitemap_index.xml") return cached(request, ctx, () => buildIndex(env));
    // People typing /sitemap get the visitor site map page.
    if (url.pathname === "/sitemap" || url.pathname === "/sitemap/" || url.pathname === "/sitemap.html") return Response.redirect(`${SITE}/site-map`, 301);
    if (url.pathname === "/product-sitemap.xml") return cached(request, ctx, () => buildSitemap("/sitemap-products.xml", env));
    if (SITEMAPS[url.pathname]) return cached(request, ctx, () => buildSitemap(url.pathname, env));
    if (url.pathname === "/robots.txt") return robots(url);
    if (url.pathname.startsWith("/assets/images/brands/")) return brandLogo(request, ctx);
    return fetch(request);
  },
};

async function cached(request, ctx, build) {
  const cache = caches.default;
  const key = new Request(`${request.url}?v=20`, { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;
  const response = await build();
  if (response.status === 200) ctx.waitUntil(cache.put(key, response.clone()));
  return response;
}

async function brandLogo(request, ctx) {
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.status !== 404) return res;
  const tiny = new Response(null, {
    status: 404,
    headers: { "Cache-Control": "public, max-age=86400", "Content-Type": "image/png" },
  });
  ctx.waitUntil(cache.put(request, tiny.clone()));
  return tiny;
}

async function getText(url) {
  // Ask the shop directly (bypassing this Worker) with a normal browser user agent.
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (ECB sitemap builder)" },
    cf: { cacheTtl: 0 },
  });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Every indexable URL, sorted into the sitemaps of the index. Left out:
// duplicate product copies (their canonical is another listing; the speed
// Worker keeps the live list in KV "dupes-live"), empty categories (noindex),
// private paths and pages that redirect.
async function collect(env) {
  const origin = SITE;
  const [home, all] = await Promise.all([getText(`${origin}/`), getText(`${origin}/category?pageby=10000`)]);
  let dupes = {};
  try {
    dupes = (env && env.PAGES ? await env.PAGES.get("dupes-live", { type: "json" }) : null) || {};
  } catch {}
  const products = new Set();
  for (const m of all.matchAll(/href="https?:\/\/(?:www\.)?ecbtechkenya\.com\/item\/([A-Za-z0-9-]+)"/g)) {
    if (!["compare", "show"].includes(m[1]) && !SKIP_ITEMS.has(m[1]) && !dupes[m[1]]) products.add(`/item/${m[1]}`);
  }
  if (products.size < 300) throw new Error(`only ${products.size} products found`);
  const categories = new Set();
  const pages = new Set(["/", "/about", "/contact", "/faq", "/delivery", "/hp-vs-dell-vs-lenovo-laptops-kenya", "/categories", "/site-map"]);
  for (const m of (home + all).matchAll(/href="https?:\/\/(?:www\.)?ecbtechkenya\.com(\/[^"#?]*)"/g)) {
    const path = m[1].replace(/\/+$/, "") || "/";
    if (path.startsWith("/item/") || EXCLUDE.test(path) || SKIP_PAGES.test(path) || REDIRECTED.test(path)) continue;
    if (/\.(png|jpe?g|webp|gif|svg|css|js|ico|woff2?|pdf)$/i.test(path)) continue;
    (path === "/category" || path.startsWith("/category/") ? categories : pages).add(path);
  }
  const guides = new Set(["/research", "/research/laptop-prices-kenya", "/research/tech-prices-kenya"]);
  let changedAt = null;
  try {
    const st = env && env.PAGES ? await env.PAGES.get("research-state", { type: "json" }) : null;
    if (st && st.changedAt) changedAt = st.changedAt.slice(0, 10);
    // Laptop guides: only the pages that passed the quality gates.
    const gs = env && env.PAGES ? await env.PAGES.get("guides-state", { type: "json" }) : null;
    if (gs && Array.isArray(gs.urls)) {
      for (const u of [`${SITE}/guides`, ...gs.urls]) {
        const path = u.replace(SITE, "");
        if (/^\/(guides|laptop-shop-nairobi|student-laptops-kenya|best|compare|series|laptops|phones|learn)(\/[a-z0-9-]+)?$/.test(path)) guides.add(path);
      }
    }
  } catch {}
  for (const g of guides) pages.delete(g);
  return { pages, categories, guides, products, changedAt };
}
// Pages that now redirect (keyword map merges): never list them.
const REDIRECTED = /^\/(laptop-prices-in-kenya|best\/best-laptops-under-40k-kenya|best\/best-laptops-under-100k-kenya|laptops\/apple-laptops-kenya)$/;

// Static pages have no honest change date, so they carry no lastmod; the
// catalogue-driven sitemaps carry the date the catalogue last changed.
const SITEMAPS = {
  "/sitemap-pages.xml": { pick: (c) => c.pages, dated: false, priority: (p) => (p === "/" ? "1.0" : "0.5") },
  "/sitemap-categories.xml": { pick: (c) => c.categories, dated: true, priority: () => "0.8" },
  "/sitemap-guides.xml": { pick: (c) => c.guides, dated: true, priority: () => "0.6" },
  "/sitemap-products.xml": { pick: (c) => c.products, dated: true, priority: () => "0.7" },
};

const xml = (body) =>
  new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": `public, max-age=${CACHE_SECONDS}`, "X-Robots-Tag": "noindex" },
  });
const unavailable = (error) =>
  // Never serve an empty sitemap; tell crawlers to retry later instead.
  new Response(`Sitemap temporarily unavailable: ${error.message}`, { status: 503, headers: { "Retry-After": "3600", "Content-Type": "text/plain" } });

// /sitemap.xml: the index of the four sitemaps (each lists its own pages).
async function buildIndex(env) {
  try {
    const c = await collect(env);
    const lastmod = c.changedAt ? `<lastmod>${c.changedAt}</lastmod>` : "";
    return xml(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...Object.entries(SITEMAPS).map(([path, s]) => `  <sitemap><loc>${SITE}${path}</loc>${s.dated ? lastmod : ""}</sitemap>`),
        "</sitemapindex>",
        "",
      ].join("\n"),
    );
  } catch (error) {
    return unavailable(error);
  }
}

async function buildSitemap(path, env) {
  try {
    const c = await collect(env);
    const s = SITEMAPS[path];
    const lastmod = s.dated && c.changedAt ? `<lastmod>${c.changedAt}</lastmod>` : "";
    return xml(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...[...s.pick(c)].sort().map((p) => `  <url><loc>${xmlEscape(SITE + p)}</loc>${lastmod}<priority>${s.priority(p)}</priority></url>`),
        "</urlset>",
        "",
      ].join("\n"),
    );
  } catch (error) {
    return unavailable(error);
  }
}

async function robots(url) {
  // All crawlers, search engines and AI assistants included, may read every
  // page except the admin area. Account, cart, checkout and cart-action URLs
  // are crawlable on purpose: they send noindex, which Google must be able to
  // read to drop them.
  const text = [
    "# ECB Technologies - robots.txt",
    "# Keep in sync with /llms.txt and /ai.txt.",
    "# Site guide for AI: https://www.ecbtechkenya.com/llms.txt",
    "# AI usage policy: https://www.ecbtechkenya.com/ai.txt",
    "# Every public page also has a markdown version at <page>.md (noindex; the HTML page is canonical).",
    "",
    "# AI search and user-fetch crawlers are welcome on all public pages, as are",
    "# search engines. Training crawlers (GPTBot, ClaudeBot, Google-Extended,",
    "# Applebot-Extended, CCBot, Bytespider) are currently allowed by the * group.",
    "# Named AI crawlers share the * rules (same group), so private paths stay",
    "# blocked for them too.",
    "User-agent: OAI-SearchBot",
    "User-agent: ChatGPT-User",
    "User-agent: GPTBot",
    "User-agent: Claude-SearchBot",
    "User-agent: Claude-User",
    "User-agent: ClaudeBot",
    "User-agent: PerplexityBot",
    "User-agent: Perplexity-User",
    "User-agent: Google-Extended",
    "User-agent: Applebot-Extended",
    "User-agent: *",
    // Only the admin area is blocked. Cart, checkout, account and cart-action
    // URLs send "noindex" instead: a robots.txt block hides that noindex, so
    // Google kept them as "Indexed, though blocked by robots.txt".
    "Disallow: /admin",
    "Allow: /",
    "",
    "Sitemap: https://www.ecbtechkenya.com/sitemap.xml",
    "",
  ].join("\n");
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
