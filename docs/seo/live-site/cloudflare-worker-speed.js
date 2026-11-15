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
// Admin, agent, rider, user, cart and checkout pages pass through unchanged.

import { USED_FOR, USED_CSS } from "./used-css.js";
import { BUNDLE_HASH, BUNDLE_CSS, THEME_VERSION } from "./bundle-css.js";

const VERSION = "7";
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
  ".ecb-cats-grid:not(.slick-initialized){visibility:visible}" +
  ".ecb-bestsell-slider:not(.slick-initialized){height:384px}" +
  ".ecb-uniq-slider:not(.slick-initialized){height:316px}}";

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
    try {
      if (url.pathname.startsWith("/ecb-assets/")) return serveBundle(url);
      if (request.method !== "GET" || SKIP.test(url.pathname)) return fetch(request);
      if (hasSession(request)) return await live(request, ctx);
      return await cached(request, url, env, ctx);
    } catch (error) {
      return fetch(request);
    }
  },
};

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
  return `https://www.ecbtechkenya.com/__ecb/page/v${VERSION}/${k.host}${k.pathname}${k.search}`;
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
  return {
    themeVersion: theme ? theme[1] : null,
    banner: banner ? imagePath(banner[1]) : null,
    mainImg: main ? imagePath(main[1]) : null,
  };
}

async function rewriteText(res, url) {
  const html = await res.text();
  const hints = scan(html);
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
        if (titles > 1) e.remove();
      },
    })
    .on('meta[name="description"]', {
      element() {
        hasDescription = true;
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
        e.append(`<style>${RESERVE_CSS}</style>`, { html: true });
        if (hints.banner) {
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
        e.onEndTag((end) => {
          if (!hasDescription && isHome) end.before(`<meta name="description" content="${HOME_DESCRIPTION}">`, { html: true });
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
        else e.setAttribute("style", style.replace(m[0], `url('${resized(path, 1600)}')`));
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
