// Cloudflare Worker "ecb-speed" for www.ecbtechkenya.com (the GeniusCart shop).
//
// Makes shop pages load faster without touching the shop's code.
//
// A. Page cache. A visitor without a shop session (first visit, Google,
//    GTmetrix) gets a ready-made copy of the page from Cloudflare instead of
//    waiting ~0.7 s for the shop to build it. Copies are refreshed in the
//    background when older than 5 minutes. Anyone with a shop session (items
//    in cart, logged in, agents, riders) always gets the live page. A cached
//    page fetches a fresh form token on first interaction, so forms keep
//    working.
// B. One stylesheet. The theme's 13 stylesheets (one of them a broken link)
//    are merged in their original order into one file, cached for a year.
//    Built ahead of time by scripts/live-site/build-css.py.
// C. Smaller images. Product, category and banner images are resized to the
//    size they're shown at and sent as AVIF/WebP (Cloudflare Images). If
//    that ever fails, the browser falls back to the original image.
// D. Page shows straight away (the theme's "hide until every script loads"
//    rule is removed), images below the fold load lazily, the page-header
//    banner is preloaded, and carousels keep their height while they start.
// B2. On home, category and product pages only the styles those pages use
//    (about 100 KB instead of 1.2 MB, per page type, built by
//    scripts/live-site/used-css.js) are
//    put in the page; the full stylesheet loads on first interaction or once
//    the page is idle. If the theme's styles change, the full stylesheet is
//    used until used-css.js is run again.
// E. Small fixes: duplicate <title> removed, a meta description added where
//    missing, a missing jQuery plugin stubbed, brand logos and hero pictures
//    that don't exist on the server are left out (brand names show as text).
//
// F. Each product, category and info page gets its own <title> (products:
//    "<name> Price in Kenya | ECB Technologies"), categories and info pages
//    get a meta description, search/sort/filter pages get noindex, and the
//    product price intro shows above the spec table.
//
// G. SEO and conversion (seo.js): one www canonical per page (the bare
//    domain redirects to www), structured data, social cards, one H1 per page,
//    answer-first intros, category breadcrumbs, WhatsApp ordering, /llms.txt,
//    and 301s from old product addresses (catalog-map.js).
//
// Admin, agent, rider, user, cart and checkout pages pass through unchanged
// (apart from a noindex header).

import { USED_FOR, USED_CSS } from "./used-css.js";
import { BUNDLE_HASH, BUNDLE_CSS, THEME_VERSION } from "./bundle-css.js";
import { REDIRECTS } from "./catalog-map.js";
import { DUPE_REDIRECTS } from "./dupes.js";
import { SKIN_CSS, SKIN_FONTS } from "./skin.js";

// Monochrome skin (skin.js) on/off, from the Worker's SKIN variable.
let SKIN = false;
// Short fingerprint of the skin, part of the page-cache key, so editing the
// skin refreshes cached pages.
const SKIN_ID = (() => {
  let h = 0;
  for (let i = 0; i < SKIN_CSS.length; i++) h = (h * 31 + SKIN_CSS.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
})();
import { OG_PNG_BASE64 } from "./og-image.js";
import {
  SITE, SHARE_IMAGE, NAV_FIXES, SEO_CSS, extractSeo, jsonLdTag, escapeHtml, homeIntro, categoryIntro,
  waOrderButton, waFloat, llmsTxt,
} from "./seo.js";

const VERSION = "24";
const SKIP = /^\/(admin|agent|rider|user|vendor|cart|carts|checkout|assets|login|register|logout|addcart|addnumcart|addtonumcart|addbyone|reducebyone|removecart|wishlist|compare|currency|language|subscriber)(\/|$)/i;
const FRESH_SECONDS = 300;
const KV_FRESH_SECONDS = { "/": 600 }; // pages also kept in the global store
const KV_CATEGORY_SECONDS = 7200; // /category/<name> pages
const EAGER_IMAGES = 6;
const IMG = "/cdn-cgi/image/";

const CSS_ORDER = [
  "bootstrap.min.css", "all.css", "slick.css", "nice-select.css", "jquery-ui.css", "animate.css",
  "toastr.min.css", "datatables.min.css", "style.css", "custom.css", "ecb-theme.css", "font.php",
];

// The fonts style.css imported (moved to the page so they load in parallel).
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&amp;family=Saira:ital,wght@0,100..900;1,100..900&amp;display=swap";

const HOME_DESCRIPTION =
  "Laptops, phones and accessories at Techmart Iconic Business Plaza, Moi Avenue, Nairobi CBD. Pay by M-Pesa or card. Store pickup or delivery across Kenya.";

const RESERVE_CSS =
  ".ecb-cats-grid:not(.slick-initialized),.ecb-promos-grid:not(.slick-initialized)," +
  ".ecb-bestsell-slider:not(.slick-initialized),.ecb-uniq-slider:not(.slick-initialized){overflow:hidden;visibility:hidden}" +
  "@media (max-width:767px){" +
  ".ecb-cats-grid:not(.slick-initialized){height:77px}" +
  ".ecb-promos-grid:not(.slick-initialized){height:176px}" +
  ".ecb-bestsell-slider:not(.slick-initialized){height:231px}" +
  ".ecb-uniq-slider:not(.slick-initialized){height:295px}}" +
  "@media (min-width:768px){" +
  ".ecb-cats-grid:not(.slick-initialized),.ecb-promos-grid:not(.slick-initialized){visibility:visible}" +
  ".ecb-bestsell-slider:not(.slick-initialized){height:384px}" +
  ".ecb-uniq-slider:not(.slick-initialized){height:316px}}";

const INTRO_CSS =
  ".ecb-pd-intro{padding:18px 22px 6px}.ecb-pd-intro h2{font-size:17px;font-weight:600;margin:0 0 6px;color:#1a2840}" +
  ".ecb-pd-intro p{margin:0 0 10px;font-size:14px;line-height:1.55;color:#4a5568}";

// Runs in the visitor's browser. Only acts on a cached copy (no session cookie
// yet): on first interaction it gets a session and a fresh form token.
const TOKEN_SCRIPT =
  "<script>(function(){var d=0;function go(){if(d)return;d=1;" +
  "if(/(^|; )XSRF-TOKEN=/.test(document.cookie))return;" +
  "fetch('/user/login',{credentials:'same-origin'}).then(function(r){return r.text()}).then(function(t){" +
  "var m=t.match(/name=\"_token\" value=\"([^\"]+)\"/);if(!m)return;" +
  "document.querySelectorAll('input[name=\"_token\"]').forEach(function(e){e.value=m[1]});" +
  "document.querySelectorAll('meta[name=\"csrf-token\"]').forEach(function(e){e.setAttribute('content',m[1])});" +
  "}).catch(function(){})}" +
  "['pointerdown','keydown','touchstart','scroll','mousemove','focusin'].forEach(function(e){addEventListener(e,go,{once:true,passive:true})});" +
  "})();</script>";

const fullCssLoader = (href) =>
  "<script>(function(){var d=0;function l(){if(d)return;d=1;var k=document.createElement('link');k.rel='stylesheet';" +
  `k.href='${href}';` +
  "var s=document.getElementById('ecb-css');s.parentNode.insertBefore(k,s.nextSibling)}" +
  "['pointerdown','keydown','touchstart','scroll','mousemove','focusin'].forEach(function(e){addEventListener(e,l,{once:true,passive:true})});" +
  "addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(l)},6000)})})();</script>";

const SHIM_SCRIPT = "<script>if(window.jQuery&&!jQuery.fn.counterUp)jQuery.fn.counterUp=function(){return this};</script>";

// Image sizes: [widths for srcset], sizes attribute.
const IMAGE_RULES = [
  [/\/assets\/images\/thumbnails\//, [160, 285], "(max-width:767px) 64vw, 160px"],
  [/\/assets\/images\/categories\//, [110, 220], "(max-width:767px) 52px, 100px"],
  [/\/assets\/images\/arrival\//, [220, 440], "(max-width:767px) 168px, 215px"],
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    SKIN = !!(env && env.SKIN === "1");
    try {
      if (url.pathname === "/llms.txt") {
        return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      }
      if (url.pathname === "/ecb-assets/og.png") return ogImage();
      if (url.pathname.startsWith("/ecb-assets/")) return serveBundle(url);
      const isRead = request.method === "GET" || request.method === "HEAD";
      // One version of the site: the bare domain redirects to www.
      if (isRead && url.hostname === "ecbtechkenya.com") {
        return Response.redirect(`${SITE}${url.pathname}${url.search}`, 301);
      }
      // Product addresses that changed when the shop regenerated them.
      const slug = url.pathname.startsWith("/item/") ? url.pathname.slice(6) : "";
      const old = isRead && slug && (REDIRECTS[slug] || DUPE_REDIRECTS[slug]);
      if (old) return Response.redirect(`${SITE}/item/${old}${url.search}`, 301);
      if (request.method === "GET" && SKIP.test(url.pathname)) return privatePage(request, url);
      if (request.method !== "GET") return fetch(request);
      if (hasSession(request)) return await live(request, ctx);
      return await cached(request, url, env, ctx);
    } catch (error) {
      return fetch(request);
    }
  },
};

function ogImage() {
  const bin = Uint8Array.from(atob(OG_PNG_BASE64), (c) => c.charCodeAt(0));
  return new Response(bin, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800" } });
}

// Account, cart, checkout, agent and rider pages: unchanged, but kept out of
// search results.
const PRIVATE = /^\/(user|vendor|rider|agent|cart|carts|checkout|wishlist|compare|login|register)(\/|$)/i;
async function privatePage(request, url) {
  const res = await fetch(request);
  if (!PRIVATE.test(url.pathname) || !(res.headers.get("Content-Type") || "").includes("text/html")) return res;
  const out = new Response(res.body, res);
  out.headers.set("X-Robots-Tag", "noindex, follow");
  if (!SKIN) return out;
  // Same look on account, cart and checkout pages (styles only).
  return new HTMLRewriter()
    .on("head", {
      element(e) {
        e.append(`<link rel="stylesheet" href="${SKIN_FONTS}"><style id="ecb-skin">${SKIN_CSS}</style>`, { html: true });
      },
    })
    .transform(out);
}

function hasSession(request) {
  return /(^|;\s*)(laravel_session|XSRF-TOKEN)=/.test(request.headers.get("Cookie") || "");
}

function isHtml(res) {
  return res.status === 200 && (res.headers.get("Content-Type") || "").includes("text/html");
}

// Live page from the shop, sped up (visitors with a session).
async function live(request, ctx) {
  const res = await fetch(request);
  if (!isHtml(res)) return res;
  return rewriteText(res, new URL(request.url));
}

// ---------- A. page cache ----------

function cacheKey(url) {
  const k = new URL(url);
  for (const p of [...k.searchParams.keys()]) if (/^(utm_|fbclid|gclid|msclkid|_ga)/i.test(p)) k.searchParams.delete(p);
  k.searchParams.sort();
  return `https://www.ecbtechkenya.com/__ecb/page/v${VERSION}${SKIN ? "s" + SKIN_ID : ""}/${k.host}${k.pathname}${k.search}`;
}

function kvSeconds(url) {
  if (url.search) return 0;
  if (KV_FRESH_SECONDS[url.pathname]) return KV_FRESH_SECONDS[url.pathname];
  if (/^\/category\/[a-z0-9-]+$/i.test(url.pathname)) return KV_CATEGORY_SECONDS;
  return 0;
}

function toVisitor(body, at, how) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-cache, private",
      "X-ECB-Speed": VERSION,
      "X-ECB-Cache": `${how}; age=${Math.max(0, Math.round((Date.now() - at) / 1000))}`,
    },
  });
}

async function cached(request, url, env, ctx) {
  const key = cacheKey(url);
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) {
    const at = Number(hit.headers.get("X-ECB-At")) || 0;
    if (Date.now() - at > FRESH_SECONDS * 1000) ctx.waitUntil(refresh(url, key, env, ctx));
    return toVisitor(hit.body, at, "HIT");
  }

  const kvTtl = kvSeconds(url);
  if (kvTtl && env.PAGES) {
    const { value, metadata } = await env.PAGES.getWithMetadata(key, { type: "text", cacheTtl: 60 });
    if (value) {
      const at = (metadata && metadata.at) || 0;
      ctx.waitUntil(store(cache, key, value, at));
      if (Date.now() - at > FRESH_SECONDS * 1000) ctx.waitUntil(refresh(url, key, env, ctx));
      return toVisitor(value, at, "GLOBAL");
    }
  }

  // Not cached here yet: the visitor gets the live page (with their new
  // session), and an anonymous copy is saved for the next visitor.
  const res = await fetch(request);
  if (!isHtml(res)) return res;
  const out = await rewriteText(res, url);
  const [a, b] = out.body.tee();
  ctx.waitUntil(
    new Response(b).text().then((html) => save(env, cache, key, html, url, kvTtl))
  );
  const visitor = new Response(a, out);
  visitor.headers.set("X-ECB-Cache", "MISS");
  return visitor;
}

async function refresh(url, key, env, ctx) {
  const res = await fetch(url.toString(), { headers: { "User-Agent": "Mozilla/5.0 (ECB page cache)", Accept: "text/html" } });
  if (!isHtml(res)) return;
  const html = await (await rewriteText(res, url)).text();
  await save(env, caches.default, key, html, url, kvSeconds(url));
}

async function save(env, cache, key, html, url, kvTtl) {
  // Never keep a page that looks personal or broken.
  if (html.length < 20000 || !/<\/html>\s*$/i.test(html) || /logout/i.test(html.slice(0, 60000))) return;
  const at = Date.now();
  await store(cache, key, html, at);
  if (kvTtl && env.PAGES) {
    const old = await env.PAGES.getWithMetadata(key, { type: "stream" });
    if (old.value) await old.value.cancel();
    const oldAt = (old.metadata && old.metadata.at) || 0;
    if (at - oldAt > kvTtl * 1000) await env.PAGES.put(key, html, { metadata: { at }, expirationTtl: 7 * 86400 });
  }
}

function store(cache, key, html, at) {
  return cache.put(
    key,
    new Response(html, {
      headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=604800", "X-ECB-At": String(at) },
    })
  );
}

// ---------- B. one stylesheet ----------
// Built ahead of time by scripts/live-site/build-css.py (bundle-css.js), so
// visitors never wait for it. If the theme's ecb-theme.css version on the page
// differs from the one it was built from, the page keeps its original
// stylesheets until build-css.py is run again.

const BUNDLE_PATH = `/ecb-assets/bundle-${BUNDLE_HASH}.css`;

function serveBundle(url) {
  if (url.pathname !== BUNDLE_PATH) return new Response("Not found", { status: 404 });
  return new Response(BUNDLE_CSS, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ---------- C. images ----------

function imagePath(src) {
  try {
    const u = new URL(src, "https://www.ecbtechkenya.com/");
    if (!/(^|\.)ecbtechkenya\.com$/.test(u.hostname) || !u.pathname.startsWith("/assets/images/")) return null;
    return u.pathname;
  } catch {
    return null;
  }
}

const resized = (path, w) => `${IMG}width=${w},quality=80,format=auto${path}`;

async function exists(u) {
  const key = "https://www.ecbtechkenya.com/__ecb/exists?u=" + encodeURIComponent(u);
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return (await hit.text()) === "1";
  let ok = true;
  try {
    const r = await fetch(u, { method: "HEAD" });
    ok = r.ok && !(r.headers.get("Content-Type") || "").includes("text/html");
    if (r.status >= 500) ok = true;
  } catch {}
  await cache.put(key, new Response(ok ? "1" : "0", { headers: { "Cache-Control": "public, max-age=86400" } }));
  return ok;
}

// ---------- D/E. page rewrite ----------

// Finds the page-header banner and the main product photo, so they can be
// announced in <head> before the browser reaches them.
function scan(html) {
  const banner = html.match(/class="gs-breadcrumb-section[^"]*"\s+data-background="([^"]+)"/);
  const main = html.match(/<img\s+id="ecbMainImg"\s+src="([^"]+)"/);
  const theme = html.match(/ecb-theme\.css\?v=([\w.-]+)/);
  const font = html.match(/\/cf-fonts\/s\/roboto\/([\d.]+)\//);
  const heroBgs = [...html.matchAll(/class="ecb-hero-img-bg"\s+style="background-image:url\('([^']+)'\)/g)].map((m) => imagePath(m[1]));
  return {
    themeVersion: theme ? theme[1] : null,
    fontVersion: font ? font[1] : "5.2.10",
    heroBgs: heroBgs.every(Boolean) ? heroBgs : [],
    banner: banner ? imagePath(banner[1]) : null,
    mainImg: main ? imagePath(main[1]) : null,
  };
}

// ---------- F. titles, descriptions, product intro ----------

const HOME_TITLE = "Laptops &amp; Phones Shop in Nairobi CBD | ECB Technologies";

const PAGE_TITLES = {
  "/faq": "Frequently Asked Questions | ECB Technologies",
  "/privacy": "Privacy Policy | ECB Technologies",
  "/terms": "Terms and Conditions | ECB Technologies",
  "/contact": "Contact Us &amp; Shop Location, Nairobi CBD | ECB Technologies",
  "/about": "About ECB Technologies | Laptops &amp; Phones Shop in Nairobi",
};

const PAGE_DESCRIPTIONS = {
  "/faq":
    "Common questions about buying from ECB Technologies: ordering, payment by M-Pesa or card, delivery across Kenya and visiting our shop in Nairobi CBD.",
  "/privacy": "How ECB Technologies collects, uses and protects your personal information when you shop with us.",
  "/terms": "The terms and conditions for buying laptops, phones and accessories from ECB Technologies in Nairobi, Kenya.",
  "/about":
    "ECB Technologies sells genuine laptops, phones and accessories from our shop on Moi Avenue, Nairobi CBD, with delivery across Kenya.",
  "/contact":
    "Visit ECB Technologies at Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, Nairobi CBD. Call 0717 040 531. Open Mon-Sat 9am-7pm.",
};
const NOINDEX_PARAMS = /^(search|sort|min|max|min_price|max_price|pageby|view_check|type|minprice|maxprice)$/i;

// "<name><suffix> | ECB Technologies" if it fits in 60 characters,
// otherwise without the brand, otherwise just the name.
function fitTitle(name, suffix) {
  const len = (t) => t.replace(/&[a-z#0-9]+;/gi, "x").length;
  for (const t of [`${name}${suffix} | ECB Technologies`, `${name}${suffix}`]) if (len(t) <= 60) return t;
  return name;
}

function fixHtml(html, url) {
  let title = null;
  let description = null;
  let noindex = false;
  // The theme prints product titles before <!DOCTYPE>, which leaves a second,
  // generic <title> in <head> and puts the page in quirks mode.
  const pre = html.match(/^\uFEFF?\s*<title>([\s\S]*?)<\/title>\s*(?=<!DOCTYPE)/i);
  if (pre) html = html.slice(pre[0].length);
  const crumb = ((html.match(/<h2 class="breadcrumb-title">\s*([^<]*?)\s*<\/h2>/) || [])[1] || "").replace(/\s+/g, " ");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/item/")) {
    const name = pre ? pre[1].split("|")[0].trim() : "";
    // Keep the price in the meta description and the intro equal to the
    // current price (descriptions were written with the price of the day).
    const pm = html.match(/id="sizeprice">\s*KSH\s*([\d,]+)/i);
    const live = pm ? Number(pm[1].replace(/,/g, "")) : 0;
    if (live > 0 && live < 2000000) {
      const ksh = `KSh ${live.toLocaleString("en-US")}`;
      html = html.replace(/(<meta name="description"\s+content="[^"]*?)KSh [\d,]+/, `$1${ksh}`);
      html = html.replace(/(<h2 class="ecb-price-intro">[\s\S]{0,900}?<strong>)KSh [\d,]+(<\/strong>)/, `$1${ksh}$2`);
    }
    if (name) title = fitTitle(name, " Price in Kenya");
    // The theme turns <strong>Label</strong> pairs in the description into a
    // spec table and hides the rest, which garbled the price intro. Show the
    // intro above the table instead.
    html = html.replace(
      /(<div class="ecb-pd-description-body">)\s*(<h2 class="ecb-price-intro">[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>)/,
      '<div class="ecb-pd-intro">$2</div>$1'
    );
  } else if (path === "/") {
    title = HOME_TITLE;
    description = HOME_DESCRIPTION;
  } else if (path === "/category" && !url.search) {
    title = "Shop All Laptops, Phones &amp; Accessories | ECB Technologies";
    description = "All laptops, smartphones, printers, gaming gear and accessories at ECB Technologies, Moi Avenue, Nairobi CBD. Prices in KSh, delivery across Kenya.";
  } else if (/^\/category\/[^/]+(\/[^/]+)?$/.test(path) && crumb) {
    title = fitTitle(crumb, " Prices in Kenya");
    description = `Shop ${crumb} at ECB Technologies, Moi Avenue, Nairobi CBD. Prices in KSh, pay by M-Pesa or card, delivery across Kenya.`;
  } else if (path !== "/" && !path.startsWith("/category") && crumb) {
    title = PAGE_TITLES[path] || fitTitle(crumb, "");
    description = PAGE_DESCRIPTIONS[path] || null;
  }
  // Info pages share the About template, whose fixed "Who We Are / Your
  // One-Stop Shop" heading became every page's H1. Keep it on /about only.
  if (path !== "/about" && /<main class="ecb-about-page"/.test(html)) {
    html = html
      .replace('<main class="ecb-about-page"', '<main class="ecb-about-page ecb-guide-page"')
      .replace(/<span class="ecb-about-lead-eyebrow">[\s\S]*?<\/span>\s*<h1 class="ecb-about-lead-title">[\s\S]*?<\/h1>/, "");
  }
  if (path.startsWith("/category") && [...url.searchParams.keys()].some((k) => NOINDEX_PARAMS.test(k))) noindex = true;
  return { html, title, description, noindex, crumb: crumb ? crumb.replace(/&amp;/g, "&") : "" };
}

async function rewriteText(res, url) {
  const fixed = fixHtml(await res.text(), url);
  const html = fixed.html;
  const hints = scan(html);
  hints.title = fixed.title;
  hints.description = fixed.description;
  hints.noindex = fixed.noindex;
  hints.seo = extractSeo(html, url, fixed);
  if (hints.seo.type === "category" && hints.seo.category && hints.seo.category.count === 0) hints.noindex = true;
  const bundle = hints.themeVersion === THEME_VERSION ? BUNDLE_PATH : null;
  if (hints.banner && /["'()<>\s]/.test(hints.banner)) hints.banner = null;
  if (hints.mainImg && /["'()<>\s]/.test(hints.mainImg)) hints.mainImg = null;
  return rewrite(new Response(html, res), url, bundle, hints);
}

function rewrite(response, url, bundle, hints) {
  let images = 0;
  let titles = 0;
  let hasDescription = false;
  let bundleAdded = false;
  let brandMissing = false;
  let h1Seen = 0;
  const seen = new Set();
  const seo = hints.seo || { graph: [], type: "page" };
  const product = seo.product && seo.product.name ? seo.product : null;
  const shareImage = (product && product.image) || SHARE_IMAGE;
  const social = {
    "og:type": seo.type === "product" ? "product" : "website",
    "og:site_name": "ECB Technologies",
    "og:locale": "en_KE",
    "og:url": seo.canonical,
    "og:title": escapeHtml(seo.title || ""),
    "og:description": escapeHtml(seo.description || ""),
    "og:image": shareImage,
    "twitter:card": "summary_large_image",
    "twitter:title": escapeHtml(seo.title || ""),
    "twitter:description": escapeHtml(seo.description || ""),
    "twitter:image": shareImage,
  };
  if (!product) Object.assign(social, { "og:image:width": "1200", "og:image:height": "630" });
  if (product && product.price) Object.assign(social, { "product:price:amount": String(product.price), "product:price:currency": "KES" });
  const isHome = url.pathname === "/";
  const pageType = isHome ? "home" : /^\/item\//.test(url.pathname) ? "item" : /^\/category(\/|$)/.test(url.pathname) ? "category" : null;
  const useSubset = !!(bundle && pageType && USED_FOR && USED_CSS[pageType] && bundle.includes(`bundle-${USED_FOR}.css`));

  const rw = new HTMLRewriter()
    .on("style", {
      text(t) {
        if (t.text.includes("body{visibility:hidden;}")) t.replace(t.text.replace("body{visibility:hidden;}", ""));
      },
    })
    .on("head > title", {
      element(e) {
        titles++;
        if (titles > 1) return e.remove();
        if (hints.title) e.setInnerContent(hints.title, { html: true });
      },
    })
    .on('meta[name="description"]', {
      element() {
        hasDescription = true;
      },
    })
    .on('meta[property^="og:"], meta[name^="twitter:"], meta[property^="product:"]', {
      element(e) {
        const key = e.getAttribute("property") || e.getAttribute("name");
        if (seen.has(key)) return e.remove();
        seen.add(key);
        if (social[key]) e.setAttribute("content", social[key]);
      },
    })
    .on('link[rel="canonical"]', {
      element(e) {
        e.remove();
      },
    })
    .on("h1", {
      element(e) {
        h1Seen++;
        // Home: the slider headings become h2; the real H1 is in the intro.
        if (isHome || h1Seen > 1) e.tagName = "h2";
      },
    })
    .on("h2.breadcrumb-title", {
      element(e) {
        if (!isHome && seo.h1Count === 0) e.tagName = "h1";
      },
    })
    .on("div.ecb-hero-outer", {
      element(e) {
        if (isHome) e.after(homeIntro(), { html: true });
      },
    })
    .on("section.gs-breadcrumb-section", {
      element(e) {
        if (seo.type === "category" && !url.search) e.after(categoryIntro(seo.category), { html: true });
      },
    })
    .on("ul.bread-menu > li:first-child", {
      element(e) {
        if (product && product.category) {
          e.after(`<li><a href="${SITE}/category/${product.category[0]}">${escapeHtml(product.category[1])}</a></li>`, { html: true });
        }
      },
    })
    .on("div.ecb-pd-cta-row", {
      element(e) {
        if (product) e.after(waOrderButton(product, seo.canonical), { html: true });
      },
    })
    .on('a[href^="tel:"]', {
      element(e) {
        if ((e.getAttribute("href") || "").replace(/\D/g, "").endsWith("717040531")) e.setAttribute("href", "tel:+254717040531");
      },
    })
    .on("div.ecb-footer-bottom-links", {
      element(e) {
        // The top bar is hidden in the skin; staff logins move here.
        if (SKIN) e.append('<a href="/user/vendor-login">Agent login</a><a href="/rider/login">Rider login</a>', { html: true });
      },
    })
    .on("a.ecb-navbar__link", {
      element(e) {
        // "Laptops" in the menu pointed to all products.
        if (e.getAttribute("href") === `${SITE}/category`) e.setAttribute("href", `${SITE}/category/laptops`);
      },
    })
    .on("a[href]", {
      element(e) {
        const to = NAV_FIXES[e.getAttribute("href")];
        if (to) e.setAttribute("href", to);
      },
    })
    .on("link[rel=stylesheet]", {
      element(e) {
        const href = e.getAttribute("href") || "";
        const m = href.match(/\/assets\/front\/css\/([\w.-]+\.(?:css|php))/);
        if (!m) return;
        if (m[1] === "styles.php") return e.remove(); // broken link (404)
        if (!bundle) {
          if (/^(animate|datatables\.min|toastr\.min|jquery-ui)\.css$/.test(m[1]) && !e.getAttribute("media")) {
            e.setAttribute("media", "print");
            e.setAttribute("onload", "this.media='all'");
          }
          return;
        }
        if (!CSS_ORDER.includes(m[1])) return;
        if (bundleAdded) return e.remove();
        bundleAdded = true;
        const main = useSubset
          ? `<style id="ecb-css">${USED_CSS[pageType]}</style><noscript><link rel="stylesheet" href="${bundle}"></noscript>`
          : `<link rel="stylesheet" href="${bundle}">`;
        e.replace(main + `<link rel="stylesheet" href="${GOOGLE_FONTS}">`, { html: true });
      },
    })
    .on("head", {
      element(e) {
        e.append(`<style>${RESERVE_CSS}${INTRO_CSS}${SEO_CSS}</style>`, { html: true });
        if (hints.banner && !SKIN) {
          const pri = hints.mainImg ? "auto" : "high";
          e.prepend(
            `<link rel="preload" as="image" href="${resized(hints.banner, 750)}" media="(max-width:767px)" fetchpriority="${pri}">` +
              `<link rel="preload" as="image" href="${resized(hints.banner, 1600)}" media="(min-width:768px)" fetchpriority="${pri}">`,
            { html: true }
          );
          e.append(
            `<style>.gs-breadcrumb-section{background-image:url(${resized(hints.banner, 750)})}` +
              `@media (min-width:768px){.gs-breadcrumb-section{background-image:url(${resized(hints.banner, 1600)})}}</style>`,
            { html: true }
          );
        }
        if (hints.mainImg) {
          e.prepend(`<link rel="preload" as="image" href="${resized(hints.mainImg, 600)}" fetchpriority="high">`, { html: true });
        }
        if (hints.heroBgs && hints.heroBgs.length) {
          const rules = hints.heroBgs
            .map((p, i) => `.ecb-hero-slide:nth-child(${i + 1}) .ecb-hero-img-bg{background-image:url('${resized(p, 1200)}')!important}`)
            .join("");
          e.append(`<style>@media (min-width:992px){${rules}}</style>`, { html: true });
          // The first slide's photo is the largest thing on screen: fetch it early.
          e.prepend(
            `<link rel="preload" as="image" href="${resized(hints.heroBgs[0], 750)}" media="(max-width:991px)" fetchpriority="high">` +
              `<link rel="preload" as="image" href="${resized(hints.heroBgs[0], 1200)}" media="(min-width:992px)" fetchpriority="high">`,
            { html: true }
          );
        }
        // Load the Roboto weights used above the fold before first paint, so
        // text doesn't re-flow (layout shift) when the font arrives.
        e.prepend(
          ["400", "700", "900"]
            .map((w) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/cf-fonts/s/roboto/${hints.fontVersion}/latin/${w}/normal.woff2">`)
            .join(""),
          { html: true }
        );
        e.onEndTag((end) => {
          const desc = isHome ? HOME_DESCRIPTION : hints.description;
          if (!hasDescription && desc) end.before(`<meta name="description" content="${desc}">`, { html: true });
          if (hints.noindex) end.before(`<meta name="robots" content="noindex, follow">`, { html: true });
          if (seo.canonical) end.before(`<link rel="canonical" href="${seo.canonical}">`, { html: true });
          const missing = Object.entries(social)
            .filter(([k, v]) => v && !seen.has(k))
            .map(([k, v]) => (k.startsWith("twitter:") ? `<meta name="${k}" content="${v}">` : `<meta property="${k}" content="${v}">`))
            .join("");
          end.before(missing, { html: true });
          if (seo.graph && seo.graph.length) end.before(jsonLdTag(seo.graph), { html: true });
          if (SKIN) end.before(`<link rel="stylesheet" href="${SKIN_FONTS}"><style id="ecb-skin">${SKIN_CSS}</style>`, { html: true });
        });
      },
    })
    .on('script[src*="jquery.min.js"]', {
      element(e) {
        e.after(SHIM_SCRIPT, { html: true });
      },
    })
    .on("body", {
      element(e) {
        e.append(TOKEN_SCRIPT, { html: true });
        e.append(waFloat(product, seo.canonical), { html: true });
        if (useSubset) e.append(fullCssLoader(bundle), { html: true });
      },
    })
    .on("img", {
      element(e) {
        images++;
        if (images > EAGER_IMAGES && !e.getAttribute("loading")) {
          e.setAttribute("loading", "lazy");
          e.setAttribute("decoding", "async");
        }
        const src = e.getAttribute("src") || "";
        const path = imagePath(src);
        if (!path || e.getAttribute("srcset")) return;
        const rule = IMAGE_RULES.find(([re]) => re.test(path));
        if (!rule) return;
        const [, widths, sizes] = rule;
        e.setAttribute("data-o", src);
        e.setAttribute("src", resized(path, widths[widths.length - 1]));
        e.setAttribute("srcset", widths.map((w) => `${resized(path, w)} ${w}w`).join(", "));
        e.setAttribute("sizes", sizes);
        e.setAttribute("onerror", "this.onerror=null;this.removeAttribute('srcset');this.src=this.dataset.o");
      },
    })
    .on("a.ecb-brand-logo > img", {
      async element(e) {
        const src = e.getAttribute("src") || "";
        brandMissing = !!imagePath(src) && !(await exists(new URL(src, "https://www.ecbtechkenya.com/").toString()));
        if (brandMissing) e.remove();
      },
    })
    .on("a.ecb-brand-logo > span.ecb-brand-text", {
      element(e) {
        if (!brandMissing) return;
        const style = (e.getAttribute("style") || "").replace(/display\s*:\s*none\s*;?/i, "");
        e.setAttribute("style", `display:flex;${style}`);
      },
    })
    .on(".ecb-hero-img-bg[style]", {
      async element(e) {
        const style = e.getAttribute("style") || "";
        const m = style.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
        const path = m && imagePath(m[1]);
        if (!path) return;
        if (!(await exists(new URL(path, "https://www.ecbtechkenya.com/").toString()))) e.removeAttribute("style");
        // Phones/tablets get 750px; the <head> CSS below swaps in 1200px on desktop.
        else e.setAttribute("style", style.replace(m[0], `url('${resized(path, 750)}')`));
      },
    })
    .on("section.gs-breadcrumb-section[data-background]", {
      element(e) {
        // The banner is set by the <style> added in <head>; without the
        // attribute the theme's script leaves it alone.
        const path = imagePath(e.getAttribute("data-background") || "");
        if (path && path === hints.banner) e.removeAttribute("data-background");
      },
    })
    .on("img#ecbMainImg", {
      element(e) {
        const src = e.getAttribute("src") || "";
        const path = imagePath(src);
        if (!path || path !== hints.mainImg) return;
        e.setAttribute("data-o", src);
        e.setAttribute("src", resized(path, 600));
        e.setAttribute("fetchpriority", "high");
        e.setAttribute("onerror", "this.onerror=null;this.src=this.dataset.o");
      },
    });

  const out = rw.transform(response);
  const res = new Response(out.body, out);
  res.headers.set("X-ECB-Speed", VERSION);
  res.headers.delete("Content-Length");
  return res;
}
