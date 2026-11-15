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

// Paths on the shop that are not useful public pages for search engines.
const EXCLUDE = /^\/(admin|user|rider|agent|vendor|carts?|checkout|addcart|addtonumcart|removecart|compare|item\/compare|item\/show|wishlist|assets|login|register|logout|currency|language)(\/|$)/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/sitemap.xml") return cached(request, ctx, () => buildSitemap(url));
    if (url.pathname === "/robots.txt") return robots(url);
    if (url.pathname.startsWith("/assets/images/brands/")) return brandLogo(request, ctx);
    return fetch(request);
  },
};

async function cached(request, ctx, build) {
  const cache = caches.default;
  const key = new Request(`${request.url}?v=2`, { method: "GET" });
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

async function buildSitemap(url) {
  const origin = SITE;
  try {
    const [home, all] = await Promise.all([getText(`${origin}/`), getText(`${origin}/category?pageby=10000`)]);

    const products = new Set();
    for (const m of all.matchAll(/href="https?:\/\/(?:www\.)?ecbtechkenya\.com\/item\/([A-Za-z0-9-]+)"/g)) {
      if (!["compare", "show"].includes(m[1])) products.add(`/item/${m[1]}`);
    }

    const pages = new Set(["/", "/category", "/about", "/contact", "/faq"]);
    for (const m of (home + all).matchAll(/href="https?:\/\/(?:www\.)?ecbtechkenya\.com(\/[^"#?]*)"/g)) {
      const path = m[1].replace(/\/+$/, "") || "/";
      if (path.startsWith("/item/") || EXCLUDE.test(path) || /^\/category\/TV-and-Home-Appliances$/i.test(path)) continue;
      if (/\.(png|jpe?g|webp|gif|svg|css|js|ico|woff2?|pdf)$/i.test(path)) continue;
      pages.add(path);
    }

    if (products.size < 10) throw new Error(`only ${products.size} products found`);

    const today = new Date().toISOString().slice(0, 10);
    const entry = (path, priority) =>
      `  <url><loc>${xmlEscape(origin + path)}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
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
