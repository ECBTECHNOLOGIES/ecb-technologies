// Cloudflare Worker for www.ecbtechkenya.com / ecbtechkenya.com (the GeniusCart shop).
//
// - /sitemap.xml: built live from the shop itself, listing the home page, main
//   pages, every category and every product. Cached for 6 hours, so new and
//   removed products show up automatically.
// - /robots.txt: the shop's own robots.txt, with the Sitemap line added.
// - /assets/images/brands/*: the theme asks for brand logos that don't exist,
//   and the shop answers each with a full 62 KB "not found" page. Missing ones
//   now get a tiny, cached "not found" instead (the buttons keep showing text).
// - Everything else passes straight through to the shop, unchanged.
//
// Deploy: Cloudflare dashboard → Workers & Pages → Create → Worker → paste this →
// Deploy. Then add routes so it only handles these two paths:
//   ecbtechkenya.com/sitemap.xml, www.ecbtechkenya.com/sitemap.xml,
//   ecbtechkenya.com/robots.txt, www.ecbtechkenya.com/robots.txt,
//   ecbtechkenya.com/assets/images/brands/*, www.ecbtechkenya.com/assets/images/brands/*

const CACHE_SECONDS = 6 * 60 * 60;
// Every URL in the sitemap uses the canonical host (the bare domain redirects
// to www), whichever host the sitemap is requested on.
const SITE = "https://www.ecbtechkenya.com";
// Not in the sitemap: copies of a product listed in a second category (their
// canonical is the original) and categories that are empty (noindex).
const SKIP_ITEMS = new Set(["asus-tuf-vg34vql3a-34-wqhd-34401440-180hz-1ms-speakers-mpr5345unh", "hp-e24t-g4-touch-monitor-24-touch-ips-full-hd-60hz-oe58676hhj", "hp-omen-34c-34-wqhd-34401440-165hz-1ms-built-in-speakers-xnx5562f7x", "hp-s27-fhd-27-fhd-ips-100hz-jvs88365q9", "hp-s27q-qhd-27-qhd-ips-100hz-qfx9007zpo", "hp-series-5-532sf-32-full-hd-100hz-bwy0125uwr", "lg-27u730a-27-4k-uhd-usb-c-60hz-speakers-xbo9866uvz", "lg-34cb99-w-34-34401440-60hz-usb-c-built-in-speakers-uuf7786abq", "lg-34u650a-b-34-ips-34401440-100hz-built-in-speakers-n4a59434gp", "lg-34wr55qk-b-34-va-wqhd-34401440-100hz-usb-c-0bv5745qpe", "msi-pro-mp341cqw-e12-34-34401440-120hz-1ms-white-g7y5200lgy", "samsung-m8-smart-monitor-ls32fm801umxue-32-4k-smart-usb-c-60hz-built-in-speakers-webcam-white-obr0357c69", "samsung-odyssey-ark-2nd-gen-ls55cg97wnmxue-55-smart-4k-38402160-165hz-1ms-1000r-va-speakers-black-9xk7168lco", "samsung-odyssey-g5-g55c-ls27cg552emxue-27-qhd-2k-165hz-black-jqh4573x68", "samsung-odyssey-g9-ls49fg910emxue-49-5k-51201440-1000r-144hz-1ms-va-black-pgj6550srp", "samsung-odyssey-g9-oled-ls49dg932smxue-49-5k-51201440-1800r-240hz-003ms-silver-g9q6694bpf", "samsung-odyssey-g9-smart-oled-ls49dg952smxue49-smart-5k-51201440-1800r-240hz-003ms-speakers-silver-kr97548wqa", "samsung-odyssey-neo-g9-ls57cg952nmxue-57-dual-4k-76802160-240hz-1ms-1000r-white-pj174487o5", "samsung-viewfinity-s6-ls34c650vamxue-34-34401440-100hz-usb-c-webcam-built-in-speakers-jdx6155yem", "xiaomi-g34wqi-34-wqhd-34401440-180hz-1ms-white-hhg5039c98"]);
const SKIP_PAGES = /^\/category\/(TV-and-Home-Appliances|laptops\/Student-Deals|Computing-Accessories\/monitors)$/i;

// Paths on the shop that are not useful public pages for search engines.
const EXCLUDE = /^\/(admin|user|rider|agent|vendor|carts?|checkout|addcart|addtonumcart|removecart|compare|item\/compare|item\/show|wishlist|assets|login|register|logout|currency|language)(\/|$)/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/sitemap.xml") return cached(request, ctx, () => buildSitemap(url, env));
    if (url.pathname === "/robots.txt") return robots(url);
    if (url.pathname.startsWith("/assets/images/brands/")) return brandLogo(request, ctx);
    return fetch(request);
  },
};

async function cached(request, ctx, build) {
  const cache = caches.default;
  const key = new Request(`${request.url}?v=6`, { method: "GET" });
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

async function buildSitemap(url, env) {
  const origin = SITE;
  try {
    const [home, all] = await Promise.all([getText(`${origin}/`), getText(`${origin}/category?pageby=10000`)]);

    const products = new Set();
    for (const m of all.matchAll(/href="https?:\/\/(?:www\.)?ecbtechkenya\.com\/item\/([A-Za-z0-9-]+)"/g)) {
      if (!["compare", "show"].includes(m[1]) && !SKIP_ITEMS.has(m[1])) products.add(`/item/${m[1]}`);
    }

    const pages = new Set(["/", "/category", "/about", "/contact", "/faq", "/delivery", "/laptop-prices-in-kenya",
      "/student-laptops-kenya", "/hp-vs-dell-vs-lenovo-laptops-kenya"]);
    for (const m of (home + all).matchAll(/href="https?:\/\/(?:www\.)?ecbtechkenya\.com(\/[^"#?]*)"/g)) {
      const path = m[1].replace(/\/+$/, "") || "/";
      if (path.startsWith("/item/") || EXCLUDE.test(path) || SKIP_PAGES.test(path)) continue;
      if (/\.(png|jpe?g|webp|gif|svg|css|js|ico|woff2?|pdf)$/i.test(path)) continue;
      pages.add(path);
    }

    if (products.size < 10) throw new Error(`only ${products.size} products found`);

    // Honest dates only: research pages carry the date the catalogue last
    // changed (kept in KV by the ecb-speed Worker); other pages have no lastmod
    // rather than a made-up "today".
    let researchDate = null;
    try {
      const st = env && env.PAGES ? await env.PAGES.get("research-state", { type: "json" }) : null;
      if (st && st.changedAt) researchDate = st.changedAt.slice(0, 10);
    } catch {}
    for (const p of ["/research", "/research/laptop-prices-kenya", "/research/tech-prices-kenya"]) pages.add(p);
    const entry = (path, priority) =>
      `  <url><loc>${xmlEscape(origin + path)}</loc>${path.startsWith("/research") && researchDate ? `<lastmod>${researchDate}</lastmod>` : ""}<priority>${priority}</priority></url>`;
    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...[...pages].map((p) => entry(p, p === "/" ? "1.0" : p.startsWith("/category") ? "0.8" : "0.5")),
      ...[...products].map((p) => entry(p, "0.7")),
      "</urlset>",
      "",
    ].join("\n");

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    // Never serve an empty sitemap; tell crawlers to retry later instead.
    return new Response(`Sitemap temporarily unavailable: ${error.message}`, {
      status: 503,
      headers: { "Retry-After": "3600", "Content-Type": "text/plain" },
    });
  }
}

async function robots(url) {
  // All crawlers, search engines and AI assistants included, may read every
  // public page. Only account, cart, checkout, agent/rider and admin areas
  // are kept out (they are also marked noindex).
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
    "Disallow: /admin",
    "Disallow: /user/",
    "Disallow: /rider/",
    "Disallow: /agent/",
    "Disallow: /vendor/",
    "Disallow: /carts",
    "Disallow: /checkout",
    "Disallow: /wishlist",
    "Disallow: /item/compare",
    "Allow: /",
    "",
    "Sitemap: https://ecbtechkenya.com/sitemap.xml",
    "Sitemap: https://www.ecbtechkenya.com/sitemap.xml",
    "",
  ].join("\n");
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
