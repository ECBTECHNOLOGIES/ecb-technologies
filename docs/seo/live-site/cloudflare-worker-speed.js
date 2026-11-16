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
import { REDIRECTS, CATEGORIES, CATEGORY_OF } from "./catalog-map.js";
import { DUPE_REDIRECTS } from "./dupes.js";
import { SKIN_CSS, SKIN_FONTS } from "./skin.js";
import {
  isContentPath, wantsMarkdown, mdPathFor, renderPath, markdownPage, notFoundMd, productCards,
  llmsTxt as llmsSpec, llmsFullTxt, aiTxt, INFO_PAGES, CORE_PAGES, LISTED_CATEGORIES,
} from "./markdown.js";
import {
  STUDIES, studyHtml, studyJsonLd, studyMarkdown, hubHtml, hubMarkdown, citeSection, RESEARCH_CSS, median as medianOf,
  lowerName,
} from "./research.js";
import { buildPages, publicJson, pageHtml as guideHtml, pageMarkdown as guideMarkdown, hubHtml as guidesHubHtml, hubMarkdown as guidesHubMarkdown, PSEO_CSS, GUIDE_PATH } from "./pseo.js";

// Monochrome skin (skin.js) on/off, from the Worker's SKIN variable.
let SKIN = false;
let ENV = null; // set per request (KV for the catalogue's last-change date)
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
  waOrderButton, waFloat, llmsTxt, parseKsh, decode, SOCIALS, X_HANDLE, socialLinks, nothingFooter,
} from "./seo.js";

const VERSION = "48";

// IndexNow (Bing, Yandex, Seznam, Naver): public ownership key, served at
// /<key>.txt. Submissions are triggered with the INDEXNOW_TOKEN secret.
const INDEXNOW_KEY = "a6a895d27584eebb2a87a7a9125acdb9";
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
    ENV = env || null;
    try {
      // ---- AI-readable files (markdown.js) ----
      if (request.method === "OPTIONS" && isAgentPath(url.pathname)) return new Response(null, { status: 204, headers: corsHeaders() });
      if (url.pathname === "/llms.txt") return textFile(request, await llmsWithResearch(env, ctx), 86400);
      if (url.pathname === "/llms-full.txt") return await llmsFull(request, env, ctx);
      if (url.pathname === "/ai.txt") return textFile(request, aiTxt(), 86400);
      if (url.pathname === "/api/md/_catalog") return await mdCatalog(request, env, ctx);
      if (url.pathname === "/ecb-research-state") return await researchStateResponse(env, ctx);
      if (url.pathname === "/guides/pages.json") return await guidesJson(request, env, ctx);
      if (url.pathname === "/ecb-assets/og.png") return ogImage();
      if (url.pathname === `/${INDEXNOW_KEY}.txt`) return new Response(INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      if (url.pathname === "/ecb-indexnow" && request.method === "POST") return await indexNow(Object.assign(url, { request }), env);
      if (url.pathname.startsWith("/ecb-assets/")) return serveBundle(url);
      const isRead = request.method === "GET" || request.method === "HEAD";
      // One hop to the final address: www, no trailing slash, and old or
      // merged product addresses resolved all the way (Google reports long
      // chains as "Redirect error").
      if (isRead) {
        const target = finalUrl(url);
        if (target) return Response.redirect(target, 301);
      }
      // Markdown: /page.md, /index.md, /api/md/<path>, or Accept: text/markdown.
      if (isRead) {
        let mdPath = null;
        let negotiated = false;
        if (url.pathname.startsWith("/api/md/")) mdPath = "/" + url.pathname.slice(8).replace(/\.md$/, "");
        else if (url.pathname.endsWith(".md")) mdPath = url.pathname.slice(0, -3);
        else if (isContentPath(url.pathname.replace(/\/+$/, "") || "/") && wantsMarkdown(request.headers.get("Accept"))) {
          mdPath = url.pathname;
          negotiated = true;
        }
        if (mdPath !== null) {
          mdPath = mdPath.replace(/\/+$/, "") || "/";
          if (mdPath === "/index") mdPath = "/";
          if (mdPath === "/research" || mdPath.startsWith("/research/")) return await serveResearchMd(request, mdPath, negotiated, env, ctx);
          if (GUIDE_PATH.test(mdPath)) return await serveGuideMd(request, mdPath, negotiated, env, ctx);
          return await serveMarkdown(request, url, mdPath, negotiated, ctx);
        }
      }
      if (isRead && /^\/research(\/[a-z0-9-]+)?\/?$/.test(url.pathname)) return agentHeaders(await researchPage(request, url, env, ctx), url);
      if (isRead && /^\/(best|compare|series|laptops)\/?$/.test(url.pathname)) return Response.redirect(`${SITE}/guides`, 301);
      if (isRead && GUIDE_PATH.test(url.pathname.replace(/\/+$/, ""))) return agentHeaders(await guidePage(request, url, env, ctx), url);
      // Cart actions and quick-view copies: never indexed.
      if (isRead && (/^\/item\/(quick|show)\//.test(url.pathname) || /^\/(addcart|addnumcart|addtonumcart|addbyone|reducebyone|removecart)(\/|$)/.test(url.pathname))) {
        const res = await fetch(request);
        const out = new Response(res.body, res);
        out.headers.set("X-Robots-Tag", "noindex, nofollow");
        return out;
      }
      if (request.method === "GET" && SKIP.test(url.pathname)) return privatePage(request, url);
      if (request.method === "HEAD") return agentHeaders(await fetch(request), url);
      if (request.method !== "GET") return fetch(request);
      // Search results always come live from the shop (never from the page cache).
      const res = hasSession(request) || url.searchParams.has("search") ? await live(request, ctx) : await cached(request, url, env, ctx);
      return agentHeaders(res, url);
    } catch (error) {
      return fetch(request);
    }
  },
};

// "348 Laptops in Kenya with Prices (2026)" and a one-sentence summary
// (count, order, price range and median, newest three, date), from the same
// product rows as llms.txt and the research pages.
async function categorySummary(hints, url) {
  const c = hints.seo.category;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return; // top-level categories only
  const products = await productList(NOOP_CTX);
  const rows = products.filter((p) => {
    const ci = CATEGORY_OF[p.slug];
    return ci !== undefined && CATEGORIES[ci][0].toLowerCase() === parts[1].toLowerCase() && p.price > 1000 && p.price < 2000000;
  });
  if (rows.length < 5) return;
  const prices = rows.map((r) => r.price);
  const year = new Date().getFullYear();
  const raw = c.name.replace(/&amp;/g, "&");
  // Shop category names are inconsistent ("SmartPhones", "Gaming"); use plain nouns.
  const NOUN = { smartphones: "Phones & Tablets", gaming: "Gaming Products", printers: "Printers", laptops: "Laptops" };
  const name = NOUN[parts[1].toLowerCase()] || raw;
  const t = `${c.count} ${name} in Kenya with Prices (${year})`;
  if (t.length <= 60) hints.title = t.replace(/&/g, "&amp;");
  // Listing names can be cut off ("…"): drop the partial last word and keep the part before a comma.
  const shortName = (nm) => {
    let x = nm.endsWith("…") ? nm.slice(0, -1).replace(/\s+\S*$/, "") : nm;
    return x.split(/,| \| /)[0].replace(/[\s\-–(/]+$/, "").trim();
  };
  const newest = rows.slice(0, 3).map((r) => shortName(r.name));
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });
  c.summary =
    `ECB Technologies lists ${c.count} ${lowerName(name)} in Nairobi, newest first, priced from KSh ${Math.min(...prices).toLocaleString("en-US")} to KSh ${Math.max(...prices).toLocaleString("en-US")} ` +
    `(median KSh ${medianOf(prices).toLocaleString("en-US")}). Newest: ${newest.join(", ")}. Prices as of ${today}.`;
}

// ---------- AI-readable versions (markdown.js) ----------

const isAgentPath = (p) => p.endsWith(".md") || p.startsWith("/api/md/") || ["/llms.txt", "/llms-full.txt", "/ai.txt"].includes(p);
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
});
const DESCRIBED_BY = '</llms.txt>; rel="describedby"; type="text/plain", </llms-full.txt>; rel="describedby"; type="text/plain", </ai.txt>; rel="describedby"; type="text/plain"';

// HTML pages: advertise the markdown version and the site files.
function agentHeaders(res, url) {
  if (!(res.headers.get("Content-Type") || "").includes("text/html") || res.status !== 200) return res;
  const out = new Response(res.body, res);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const links = [DESCRIBED_BY];
  if (isContentPath(path)) {
    links.push(`<${SITE}${mdPathFor(path)}>; rel="alternate"; type="text/markdown"`);
    out.headers.append("Vary", "Accept");
  }
  out.headers.set("Link", links.join(", "));
  return out;
}

function textFile(request, body, maxAge, type = "text/plain") {
  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": `${type}; charset=utf-8`,
      "Cache-Control": `public, max-age=3600, s-maxage=${maxAge}, stale-while-revalidate=604800`,
      "X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
      ...corsHeaders(),
    },
  });
}

// Every product (name, URL, price) from the shop's full listing, cached 6 hours.
async function productList(ctx) {
  const key = `${SITE}/__ecb/products/v1`;
  const hit = await caches.default.match(key);
  if (hit) return hit.json();
  const html = await (await fetch(`${SITE}/category?pageby=10000`, { headers: { "User-Agent": "Mozilla/5.0 (ECB llms)" } })).text();
  const list = productCards(html).filter((p) => !REDIRECTS[p.slug] && !DUPE_REDIRECTS[p.slug]);
  if (list.length > 10) {
    ctx.waitUntil(caches.default.put(key, new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=21600" } })));
  }
  return list;
}

// Renders one path to markdown from the shop's own page. Returns { status, md, canonical }.
async function renderMarkdown(path, url) {
  if (!isContentPath(path)) return { status: 404, md: notFoundMd(path) };
  const q = new URL(SITE + path);
  const page = url.searchParams.get("page");
  if (page && /^\d+$/.test(page)) q.searchParams.set("page", page);
  const res = await fetch(q.toString(), { headers: { "User-Agent": "Mozilla/5.0 (ECB markdown)", Accept: "text/html" } });
  const finalPath = new URL(res.url || q.toString()).pathname.replace(/\/+$/, "") || "/";
  if (res.status !== 200 || finalPath !== path || !(res.headers.get("Content-Type") || "").includes("text/html")) {
    return { status: 404, md: notFoundMd(path) };
  }
  const fixed = fixHtml(await res.text(), q);
  const seo = extractSeo(fixed.html, q, fixed);
  if (path.startsWith("/item/") && !(seo.product && seo.product.name)) return { status: 404, md: notFoundMd(path) };
  const rendered = renderPath(path, q, fixed.html, seo);
  if (!rendered) return { status: 404, md: notFoundMd(path) };
  return { status: 200, md: markdownPage(rendered, seo.canonical), canonical: seo.canonical };
}

async function serveMarkdown(request, url, path, negotiated, ctx) {
  // Product addresses that changed or were merged.
  const slug = path.startsWith("/item/") ? path.slice(6) : "";
  const moved = slug && (REDIRECTS[slug] || DUPE_REDIRECTS[slug]);
  if (moved) return Response.redirect(`${SITE}/item/${moved}.md`, 301);
  const page = url.searchParams.get("page");
  const key = `${SITE}/__ecb/md/v${VERSION}${path}${page && /^\d+$/.test(page) ? `?page=${page}` : ""}`;
  let r;
  const hit = await caches.default.match(key);
  if (hit) r = { status: hit.status, md: await hit.text(), canonical: hit.headers.get("Content-Location") };
  else {
    r = await renderMarkdown(path, url);
    if (r.status === 200) {
      ctx.waitUntil(caches.default.put(key, new Response(r.md, { headers: { "Cache-Control": "public, max-age=3600", "Content-Location": r.canonical } })));
    }
  }
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(Math.ceil(r.md.length / 4)),
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": r.status === 200 ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" : "public, max-age=60",
    ...corsHeaders(),
  };
  if (r.canonical) {
    headers["Content-Location"] = r.canonical;
    headers.Link = `<${r.canonical}>; rel="canonical", ${DESCRIBED_BY}`;
  }
  if (negotiated) headers.Vary = "Accept";
  return new Response(request.method === "HEAD" ? null : r.md, { status: r.status, headers });
}

// Every markdown URL, as JSON.
async function mdCatalog(request, env, ctx) {
  const products = await productList(ctx);
  const routes = [
    "/",
    ...Object.keys(INFO_PAGES),
    "/category",
    ...LISTED_CATEGORIES.map(([slug]) => `/category/${slug}`),
    "/research",
    ...Object.keys(STUDIES).map((slug) => `/research/${slug}`),
    "/guides",
    ...(await guides(env, ctx)).pages.map((d) => d.url.slice(SITE.length)),
    "/category/laptops/Gaming",
    "/category/laptops/Budget",
    ...products.map((p) => `/item/${p.slug}`),
  ].map((p) => ({ markdown: `${SITE}${mdPathFor(p)}`, html: `${SITE}${p === "/" ? "/" : p}` }));
  const body = JSON.stringify({ site: SITE, generated: new Date().toISOString(), count: routes.length, routes }, null, 1);
  return new Response(request.method === "HEAD" ? null : body, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=21600", "X-Robots-Tag": "noindex", ...corsHeaders() },
  });
}

// Core pages, guides and legal pages rendered in full, then every product.
async function llmsFull(request, env, ctx) {
  const key = `${SITE}/__ecb/llms-full/v${VERSION}`;
  const hit = await caches.default.match(key);
  let body = hit ? await hit.text() : null;
  if (!body) {
    const paths = CORE_PAGES;
    const rendered = await Promise.all(paths.map((p) => renderMarkdown(p, new URL(SITE + p))));
    const sections = paths.map((p, i) => [`${SITE}${p === "/" ? "/" : p}`, rendered[i].md]).filter((x, i) => rendered[i].status === 200);
    const { studies: all, changedAt } = await studies(env, ctx);
    const research = [[`${SITE}/research`, hubMarkdown(all, changedAt)], ...Object.keys(all).map((slug) => [`${SITE}/research/${slug}`, studyMarkdown(slug, all[slug], changedAt)])];
    body = llmsFullTxt([...sections.slice(0, 1), ...research, ...sections.slice(1)], await productList(ctx));
    if (body.length > 500000) console.warn(`llms-full.txt is ${body.length} chars`);
    ctx.waitUntil(caches.default.put(key, new Response(body, { headers: { "Cache-Control": "public, max-age=86400" } })));
  }
  return textFile(request, body, 86400);
}

// ---------- research pages (research.js) ----------

const NOOP_CTX = { waitUntil() {} };

// The catalogue's fingerprint and when it last changed (global, in KV).
// Written only when prices or products change, so dates are honest.
async function researchState(env, ctx) {
  const products = await productList(ctx || NOOP_CTX);
  const sig = products.map((p) => `${p.slug}:${p.price}`).sort().join("|");
  let h = 0;
  for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) | 0;
  const hash = (h >>> 0).toString(36);
  let state = null;
  if (env && env.PAGES) {
    try {
      state = await env.PAGES.get("research-state", { type: "json", cacheTtl: 300 });
    } catch {}
  }
  if (!state || state.hash !== hash) {
    state = { hash, changedAt: new Date().toISOString(), count: products.length };
    if (env && env.PAGES) (ctx || NOOP_CTX).waitUntil(env.PAGES.put("research-state", JSON.stringify(state)));
  }
  return { products, changedAt: state.changedAt };
}

async function researchStateResponse(env, ctx) {
  const { products, changedAt } = await researchState(env, ctx);
  return new Response(JSON.stringify({ changedAt, products: products.length, studies: Object.keys(STUDIES) }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=600", "X-Robots-Tag": "noindex" },
  });
}

// The full name of a product whose listing name was cut short ("…").
async function fullName(p) {
  if (!p || !/…$/.test(p.name)) return p;
  try {
    const html = await (await fetch(p.url, { headers: { "User-Agent": "Mozilla/5.0 (ECB research)" } })).text();
    const m = html.match(/<h1 class="ecb-pd-name">([^<]+)</);
    if (m) return { ...p, name: decode(m[1]) };
  } catch {}
  return p;
}

async function studies(env, ctx) {
  const { products, changedAt } = await researchState(env, ctx);
  const out = {};
  for (const [slug, meta] of Object.entries(STUDIES)) out[slug] = meta.compute(products);
  for (const s of Object.values(out)) {
    if (s.min) {
      s.min = await fullName(s.min);
      const faq = s.faq.find((f) => f.id === "cheapest-laptop-kenya");
      if (faq) faq.a = `The cheapest laptop is ${s.min.name} at KSh ${s.min.price.toLocaleString("en-US")}.`;
    }
  }
  return { studies: out, changedAt };
}

// HTML: the research content inside the shop's own page template.
async function serveResearch(request, url, env, ctx) {
  const path = url.pathname.replace(/\/+$/, "");
  const slug = path === "/research" ? null : path.slice(10);
  if (slug !== null && !STUDIES[slug]) return new Response("Not found", { status: 404 });
  const { studies: all, changedAt } = await studies(env, ctx);
  const s = slug ? all[slug] : null;
  const year = new Date(changedAt).getFullYear();
  const title = slug ? STUDIES[slug].title(s, year) : "Research: Tech Prices in Kenya";
  const description = (slug ? s.findings[0]?.text || STUDIES[slug].question : "Original statistics on laptop, phone and accessory prices in Kenya, from ECB Technologies' own catalogue.").slice(0, 160);
  const content =
    `<style>${RESEARCH_CSS}</style>` +
    (slug ? studyHtml(slug, s, changedAt) + `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": studyJsonLd(slug, s, changedAt) }).replace(/</g, "\\u003c")}</script>` : hubHtml(all, changedAt));
  return shellPage(request, url, { h1: title, description, content, crumbs: slug ? [["Research", "/research"]] : [], modified: changedAt });
}

// Our own content inside the shop's page template (header, footer, skin),
// borrowed from /delivery.
const escAttr = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
async function shellPage(request, url, { h1, title, description, content, crumbs, modified }) {
  const shellRes = await fetch(`${SITE}/delivery`, { headers: { "User-Agent": "Mozilla/5.0 (ECB pages)", Cookie: request.headers.get("Cookie") || "" } });
  let html = await shellRes.text();
  const trail = [...crumbs.map(([t, href]) => `<a href="${href}">${escAttr(t)}</a></li><li>`), escAttr(h1)].join("");
  html = html
    .replace(/<meta name="keywords"[^>]*>/, "")
    .replace(/(<meta name="description"\s+content=")[^"]*"/, `$1${escAttr(description)}"`)
    .replace(/(<h2 class="breadcrumb-title">)[\s\S]*?(<\/h2>)/, `$1${escAttr(h1)}$2`)
    .replace(/(<ul class="bread-menu">[\s\S]*?<li>[\s\S]*?<\/li>\s*<li>)[\s\S]*?(<\/li>\s*<\/ul>)/, `$1${trail}$2`)
    .replace(/(<div class="ecb-about-lead-body">)[\s\S]*?(<\/div>)/, `$1${content}$2`);
  if (!/<meta name="description"/.test(html)) html = html.replace("</head>", `<meta name="description" content="${escAttr(description)}"></head>`);
  const res = new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-cache, private" } });
  return rewriteText(res, url, { modified, title });
}

// Research pages for visitors without a session are cached for an hour, keyed
// by when the catalogue last changed.
async function researchPage(request, url, env, ctx) {
  if (hasSession(request)) return serveResearch(request, url, env, ctx);
  const key = `${SITE}/__ecb/research/v${VERSION}${SKIN ? "s" + SKIN_ID : ""}${url.pathname.replace(/\/+$/, "")}`;
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-cache, private", "X-Robots-Tag": "index, follow", "X-ECB-Cache": "HIT" } });
  const res = await serveResearch(request, url, env, ctx);
  if (res.status !== 200) return res;
  const html = await res.text();
  ctx.waitUntil(caches.default.put(key, new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } })));
  return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-cache, private", "X-Robots-Tag": "index, follow", "X-ECB-Cache": "MISS" } });
}

async function serveResearchMd(request, path, negotiated, env, ctx) {
  const slug = path === "/research" ? null : path.slice(10);
  if (slug !== null && !STUDIES[slug]) return serveMarkdown(request, new URL(SITE + path), path, negotiated, ctx);
  const { studies: all, changedAt } = await studies(env, ctx);
  const md = slug ? studyMarkdown(slug, all[slug], changedAt) : hubMarkdown(all, changedAt);
  const canonical = `${SITE}${path}`;
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(Math.ceil(md.length / 4)),
    "X-Robots-Tag": "noindex, follow",
    "Content-Location": canonical,
    Link: `<${canonical}>; rel="canonical", ${DESCRIBED_BY}`,
    "Last-Modified": new Date(changedAt).toUTCString(),
    "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    ...corsHeaders(),
  };
  if (negotiated) headers.Vary = "Accept";
  return new Response(request.method === "HEAD" ? null : md, { headers });
}

// ---------- laptop guides (pseo.js) ----------

// Built from the same catalogue snapshot as the research pages. The list of
// live URLs goes to KV for the sitemap Worker (written only when it changes).
let guidesMemo = null;
async function guides(env, ctx) {
  const { products, changedAt } = await researchState(env, ctx);
  if (guidesMemo && guidesMemo.changedAt === changedAt) return guidesMemo.built;
  const built = buildPages(products, { changedAt });
  guidesMemo = { changedAt, built };
  if (env && env.PAGES) {
    const urls = built.pages.map((d) => d.url);
    try {
      const prev = await env.PAGES.get("guides-state", { type: "json", cacheTtl: 300 });
      if (!prev || prev.changedAt !== changedAt || prev.urls.join() !== urls.join()) {
        (ctx || NOOP_CTX).waitUntil(env.PAGES.put("guides-state", JSON.stringify({ changedAt, urls })));
      }
    } catch {}
  }
  return built;
}

async function serveGuide(request, url, env, ctx) {
  const path = url.pathname.replace(/\/+$/, "");
  const built = await guides(env, ctx);
  if (path === "/guides") {
    return shellPage(request, url, {
      h1: "Laptop guides",
      title: "Laptop Buying Guides for Kenya | ECB Technologies",
      description: `${built.pages.length} laptop buying guides built from our live catalogue: best laptops by budget, for business, programming, design and gaming, comparisons and series.`,
      content: `<style>${RESEARCH_CSS}${PSEO_CSS}</style>${guidesHubHtml(built)}`,
      crumbs: [],
      modified: built.changedAt,
    });
  }
  const doc = built.pages.find((d) => d.url === SITE + path);
  if (!doc) {
    // A guide that no longer has enough products goes to the hub, never a 404.
    if (built.skipped.some((s) => s.url === SITE + path)) return Response.redirect(`${SITE}/guides`, 302);
    return fetch(new Request(`${SITE}/ecb-not-found-${Date.now()}`, request));
  }
  const ld = `<script type="application/ld+json">${JSON.stringify(doc.schema.structured_data).replace(/</g, "\\u003c")}</script>`;
  return shellPage(request, url, {
    h1: doc.content.h1,
    title: doc.seo.title,
    description: doc.seo.meta_description,
    content: `<style>${RESEARCH_CSS}${PSEO_CSS}</style>${guideHtml(doc)}${ld}`,
    crumbs: [["Guides", "/guides"]],
    modified: built.changedAt,
  });
}

async function guidePage(request, url, env, ctx) {
  if (hasSession(request)) return serveGuide(request, url, env, ctx);
  const key = `${SITE}/__ecb/guides/v${VERSION}${SKIN ? "s" + SKIN_ID : ""}${url.pathname.replace(/\/+$/, "")}`;
  const hit = await caches.default.match(key);
  if (hit) return new Response(hit.body, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-cache, private", "X-Robots-Tag": "index, follow", "X-ECB-Cache": "HIT" } });
  const res = await serveGuide(request, url, env, ctx);
  if (res.status !== 200) return res;
  const html = await res.text();
  ctx.waitUntil(caches.default.put(key, new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } })));
  return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-cache, private", "X-Robots-Tag": "index, follow", "X-ECB-Cache": "MISS" } });
}

async function serveGuideMd(request, path, negotiated, env, ctx) {
  const built = await guides(env, ctx);
  const doc = built.pages.find((d) => d.url === SITE + path);
  if (path !== "/guides" && !doc) return new Response(notFoundMd(path), { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Robots-Tag": "noindex" } });
  const md = doc ? guideMarkdown(doc) : guidesHubMarkdown(built);
  const canonical = `${SITE}${path}`;
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(Math.ceil(md.length / 4)),
    "X-Robots-Tag": "noindex, follow",
    "Content-Location": canonical,
    Link: `<${canonical}>; rel="canonical", ${DESCRIBED_BY}`,
    "Last-Modified": new Date(built.changedAt).toUTCString(),
    "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    ...corsHeaders(),
  };
  if (negotiated) headers.Vary = "Accept";
  return new Response(request.method === "HEAD" ? null : md, { headers });
}

// Every guide in the pSEO JSON format, plus every candidate that was rejected.
async function guidesJson(request, env, ctx) {
  const built = await guides(env, ctx);
  const body = JSON.stringify({ site: SITE, generated: built.changedAt, count: built.pages.length, pages: built.pages.map(publicJson), skipped: built.skipped }, null, 1);
  return new Response(request.method === "HEAD" ? null : body, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=3600", "X-Robots-Tag": "noindex", ...corsHeaders() },
  });
}

async function llmsWithResearch(env, ctx) {
  const { studies: all, products } = await studies(env, ctx).then(async (r) => ({ ...r, products: await productList(ctx) }));
  const base = llmsSpec(products);
  const research = [
    "## Research (original statistics from our catalogue)",
    `- [Research hub](${SITE}/research.md): every report`,
    ...Object.entries(all).map(([slug, s]) => `- [${STUDIES[slug].title(s, new Date().getFullYear())}](${SITE}/research/${slug}.md): ${s.findings[0] ? s.findings[0].text : STUDIES[slug].question}`),
    "",
    citeSection(all),
    "",
    "## Laptop guides (built from the live catalogue)",
    `- [All guides](${SITE}/guides.md)`,
    ...(await guides(env, ctx)).pages.map((d) => `- [${d.content.h1}](${d.url}.md): ${d.seo.meta_description}`),
    "",
  ].join("\n");
  return base.replace("## Core pages", `${research}\n## Core pages`);
}

// Sends every sitemap URL to IndexNow. Needs ?token=<INDEXNOW_TOKEN>.
async function indexNow(url, env) {
  if (!env.INDEXNOW_TOKEN || url.searchParams.get("token") !== env.INDEXNOW_TOKEN) return new Response("Not found", { status: 404 });
  // The URL list comes in the POST body (the published sitemap); a Worker's
  // own request for /sitemap.xml would reach the shop, which has none.
  let urls = [];
  try {
    urls = (await url.request.json()).filter((u) => typeof u === "string" && u.startsWith(`${SITE}/`));
  } catch {}
  if (!urls.length) return new Response(JSON.stringify({ submitted: 0, error: "POST a JSON array of URLs" }), { status: 400 });
  const body = JSON.stringify({ host: "www.ecbtechkenya.com", key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10000) });
  const results = {};
  for (const endpoint of ["https://www.bing.com/indexnow", "https://yandex.com/indexnow", "https://api.indexnow.org/indexnow"]) {
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
      results[endpoint] = `${res.status} ${(await res.text()).slice(0, 120)}`;
    } catch (e) {
      results[endpoint] = `error ${e.message}`;
    }
  }
  return new Response(JSON.stringify({ submitted: urls.length, results }), { headers: { "Content-Type": "application/json" } });
}

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

export function finalUrl(url) {
  let path = url.pathname;
  if (path.length > 1 && path.endsWith("/") && !path.startsWith("/admin")) path = path.replace(/\/+$/, "") || "/";
  if (path.startsWith("/item/")) {
    let slug = path.slice(6);
    const seen = new Set();
    while ((REDIRECTS[slug] || DUPE_REDIRECTS[slug]) && !seen.has(slug)) {
      seen.add(slug);
      slug = REDIRECTS[slug] || DUPE_REDIRECTS[slug];
    }
    path = `/item/${slug}`;
  }
  if (url.hostname === "www.ecbtechkenya.com" && path === url.pathname) return null;
  return `${SITE}${path}${url.search}`;
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

function toVisitor(body, at, how, robots) {
  return new Response(body, {
    status: 200,
    headers: {
      "X-Robots-Tag": robots || "index, follow",
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
    return toVisitor(hit.body, at, "HIT", hit.headers.get("X-ECB-Robots"));
  }

  const kvTtl = kvSeconds(url);
  if (kvTtl && env.PAGES) {
    const { value, metadata } = await env.PAGES.getWithMetadata(key, { type: "text", cacheTtl: 60 });
    if (value) {
      const at = (metadata && metadata.at) || 0;
      ctx.waitUntil(store(cache, key, value, at));
      if (Date.now() - at > FRESH_SECONDS * 1000) ctx.waitUntil(refresh(url, key, env, ctx));
      return toVisitor(value, at, "GLOBAL", /<meta name="robots" content="noindex/.test(value) ? "noindex, follow" : "index, follow");
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
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=604800",
        "X-ECB-At": String(at),
        "X-ECB-Robots": /<meta name="robots" content="noindex/.test(html) ? "noindex, follow" : "index, follow",
      },
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

// Product <title>: "<name> Price in Kenya | ECB Technologies" when it fits in
// 60 characters; otherwise the name (minus any "Price in Kenya – …" the shop
// typed into it), shortened at a word boundary.
function productTitle(name, price) {
  const len = (t) => t.replace(/&[a-z#0-9]+;/gi, "x").length;
  const n = name.replace(/\s*Price in Kenya\b[\s\S]*$/i, "").replace(/\s+/g, " ").trim() || name;
  for (const t of [`${n} Price in Kenya | ECB Technologies`, `${n} Price in Kenya`]) if (len(t) <= 60) return t;
  // Long names: shorten, and add the price so variants (touch / non-touch,
  // 8GB / 16GB…) that share the start of their name still differ.
  const suffix = price ? ` – KSh ${price.toLocaleString("en-US")}` : "";
  if (len(n + suffix) <= 60) return n + suffix;
  let short = n;
  while (len(short + suffix) > 60) short = short.replace(/\s+\S*$/, "");
  return short.replace(/[\s|,–—-]+$/, "") + suffix;
}

function fixHtml(html, url) {
  let title = null;
  let description = null;
  let noindex = false;
  // The theme prints product titles before <!DOCTYPE>, which leaves a second,
  // generic <title> in <head> and puts the page in quirks mode.
  const pre = html.match(/^\uFEFF?\s*<title>([\s\S]*?)<\/title>\s*(?=<!DOCTYPE)/i);
  if (pre) html = html.slice(pre[0].length);
  let crumb = ((html.match(/<h2 class="breadcrumb-title">\s*([^<]*?)\s*<\/h2>/) || [])[1] || "").replace(/\s+/g, " ");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/item/")) {
    // The theme's title is "<name> | ECB Technologies Kenya"; names can contain "|".
    const raw = pre ? pre[1].trim() : "";
    const cut = raw.lastIndexOf(" | ");
    const name = (cut > 0 ? raw.slice(0, cut) : raw).trim();
    // Keep the price in the meta description and the intro equal to the
    // current price (descriptions were written with the price of the day).
    const pm = html.match(/id="sizeprice">\s*([^<]+)</i);
    const live = pm ? parseKsh(pm[1]) || 0 : 0;
    if (live > 0 && live < 2000000) {
      const ksh = `KSh ${live.toLocaleString("en-US")}`;
      html = html.replace(/(<meta name="description"\s+content="[^"]*?)KSh [\d,]+/, `$1${ksh}`);
      html = html.replace(/(<h2 class="ecb-price-intro">[\s\S]{0,900}?<strong>)KSh [\d,]+(<\/strong>)/, `$1${ksh}$2`);
    }
    if (name) title = productTitle(name, live > 0 && live < 2000000 ? live : 0);
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
    // Subcategories show their parent's name in the banner: "Gaming" under
    // "Laptops" becomes "Gaming Laptops".
    const sub = path.split("/")[3];
    if (sub) {
      crumb = `${decodeURIComponent(sub).replace(/-/g, " ")} ${crumb}`;
      html = html.replace(/(<h2 class="breadcrumb-title">)\s*[^<]*?\s*(<\/h2>)/, `$1${crumb}$2`);
    }
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
  // The shop is closed on Sundays.
  html = html.replace(/(<span class="ecb-visit-detail-sub">)\s*Sunday:[^<]*/, "$1Sunday: Closed");
  if (path.startsWith("/category") && [...url.searchParams.keys()].some((k) => NOINDEX_PARAMS.test(k))) noindex = true;
  return { html, title, description, noindex, crumb: crumb ? crumb.replace(/&amp;/g, "&") : "" };
}

// When prices or products last changed (written by researchState, read-only here).
async function catalogueChangedAt() {
  if (!ENV || !ENV.PAGES) return null;
  try {
    const st = await ENV.PAGES.get("research-state", { type: "json", cacheTtl: 300 });
    return st && st.changedAt ? st.changedAt : null;
  } catch {
    return null;
  }
}

async function rewriteText(res, url, extra) {
  const fixed = fixHtml(await res.text(), url);
  const html = fixed.html;
  const hints = scan(html);
  hints.title = fixed.title;
  hints.description = fixed.description;
  hints.noindex = fixed.noindex;
  hints.seo = extractSeo(html, url, fixed);
  if (extra && extra.title) hints.title = escAttr(extra.title);
  // Home, categories and products change when the catalogue does.
  if (!(extra && extra.modified) && /^\/($|category|item\/)/.test(url.pathname)) {
    const changedAt = await catalogueChangedAt();
    if (changedAt && new Date(changedAt) > new Date(hints.seo.published)) extra = { ...(extra || {}), modified: changedAt };
  }
  if (extra && extra.modified) {
    hints.seo.modified = extra.modified;
    for (const g of hints.seo.graph) if (g.dateModified) g.dateModified = extra.modified;
  }
  // Category pages: count + year in the title and a quotable first sentence.
  if (hints.seo.type === "category" && hints.seo.category && hints.seo.category.count && !url.search) await categorySummary(hints, url);
  if (hints.seo.type === "category" && hints.seo.category && hints.seo.category.count === 0) hints.noindex = true;
  const bundle = hints.themeVersion === THEME_VERSION ? BUNDLE_PATH : null;
  if (hints.banner && /["'()<>\s]/.test(hints.banner)) hints.banner = null;
  if (hints.mainImg && /["'()<>\s]/.test(hints.mainImg)) hints.mainImg = null;
  return rewrite(new Response(html, res), url, bundle, hints);
}

const HERO_HEADLINES = [
  "Genuine laptops.<br>Honest prices.",
  "The latest phones.<br>Honest prices.",
];

function rewrite(response, url, bundle, hints) {
  let images = 0;
  let titles = 0;
  let hasDescription = false;
  let bundleAdded = false;
  let brandMissing = false;
  let h1Seen = 0;
  let heroLabels = 0;
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
    "twitter:site": X_HANDLE,
    "twitter:creator": X_HANDLE,
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
        // With the skin, the home goes straight from the hero to the categories;
        // the H1 moves into the first slide's label instead.
        if (isHome && !SKIN) e.after(homeIntro(), { html: true });
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
    // Home hero: one headline per slide instead of a small label and a
    // one-word title. The first slide's headline is the page's h1.
    .on("p.ecb-hero-eyebrow", {
      element(e) {
        if (isHome && SKIN) e.remove();
      },
    })
    .on(".ecb-hero-title", {
      element(e) {
        if (!isHome || !SKIN) return;
        const i = heroLabels++;
        const line = HERO_HEADLINES[i];
        if (!line) return;
        if (i === 0) e.tagName = "h1";
        e.setInnerContent(line, { html: true });
      },
    })
    .on("div.ecb-cats-grid", {
      element(e) {
        if (isHome && SKIN) e.before('<h2 class="ecb-cats-title">Shop by category</h2>', { html: true });
      },
    })
    .on("div.ecb-footer-main", {
      element(e) {
        if (SKIN) e.setInnerContent(nothingFooter(), { html: true });
      },
    })
    .on("div.ecb-footer-bottom", {
      element(e) {
        if (SKIN) e.remove();
      },
    })
    .on("div.ecb-footer-socials", {
      element(e) {
        e.setInnerContent(socialLinks("ecb-footer-social"), { html: true });
      },
    })
    .on("a.ecb-topbar__social-link, a.ecb-trust-social", {
      element(e) {
        const name = (e.getAttribute("aria-label") || e.getAttribute("class") || "").toLowerCase();
        const href = /insta/.test(name) ? SOCIALS.instagram : /tiktok/.test(name) ? SOCIALS.tiktok : /\bx\b|twitter/.test(name) ? SOCIALS.x : null;
        if (!href) return e.remove(); // Facebook / YouTube: no profile yet
        e.setAttribute("href", href);
        e.setAttribute("target", "_blank");
        e.setAttribute("rel", "noopener me");
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
            .map((p, i) => `.ecb-hero-slide:nth-child(${i + 1}) .ecb-hero-img-bg{background-image:url('${resized(p, 1920)}')!important}`)
            .join("");
          e.append(`<style>@media (min-width:992px){${rules}}</style>`, { html: true });
          // The first slide's photo is the largest thing on screen: fetch it early.
          e.prepend(
            `<link rel="preload" as="image" href="${resized(hints.heroBgs[0], 1000)}" media="(max-width:991px)" fetchpriority="high">` +
              `<link rel="preload" as="image" href="${resized(hints.heroBgs[0], 1920)}" media="(min-width:992px)" fetchpriority="high">`,
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
          end.before(
            hints.noindex
              ? `<meta name="robots" content="noindex, follow">`
              : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`,
            { html: true }
          );
          if (seo.published) end.before(`<meta property="article:published_time" content="${seo.published}">`, { html: true });
          // AI agents: markdown alternate and a short factual summary.
          const mdPath = url.pathname.replace(/\/+$/, "") || "/";
          if (!hints.noindex && isContentPath(mdPath)) {
            end.before(`<link rel="alternate" type="text/markdown" href="${SITE}${mdPathFor(mdPath)}">`, { html: true });
            const summary = isHome
              ? "ECB Technologies is an electronics shop in Nairobi CBD, Kenya, selling genuine laptops, smartphones, printers and accessories with prices in KSh, M-Pesa or card payment, and delivery to all 47 counties."
              : seo.description;
            if (summary) end.before(`<meta name="ai-summary" content="${escapeHtml(summary)}">`, { html: true });
          }
          if (seo.modified) end.before(`<meta property="article:modified_time" content="${seo.modified}"><meta property="og:updated_time" content="${seo.modified}">`, { html: true });
          if (seo.canonical) end.before(`<link rel="canonical" href="${seo.canonical}">`, { html: true });
          // One language, one region: each page is its own en-KE and x-default version.
          if (seo.canonical && !hints.noindex) end.before(`<link rel="alternate" hreflang="en-KE" href="${seo.canonical}"><link rel="alternate" hreflang="x-default" href="${seo.canonical}">`, { html: true });
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
    // No suggestion lists under the search box (not even the browser's own).
    .on('input[name="search"]', {
      element(e) {
        e.setAttribute("autocomplete", "off");
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
        else e.setAttribute("style", style.replace(m[0], `url('${resized(path, 1000)}')`));
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
  res.headers.set("X-Robots-Tag", hints.noindex ? "noindex, follow" : "index, follow");
  res.headers.delete("Content-Length");
  return res;
}
