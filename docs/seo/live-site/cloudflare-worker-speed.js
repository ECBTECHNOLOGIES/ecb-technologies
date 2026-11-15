// Cloudflare Worker "ecb-speed" for www.ecbtechkenya.com (the GeniusCart shop).
//
// Makes shop pages appear sooner without touching the shop's code. It only
// edits the HTML of public pages on the way to the visitor:
//
// 1. The theme hides the whole page (body{visibility:hidden}) until every
//    script has loaded. That rule is removed, so the page shows as soon as
//    its styles are in.
// 2. all.css is linked twice; the second copy is dropped.
// 3. Styles only needed after interaction (animations, tables, pop-up
//    messages, jQuery UI) load without blocking the first paint.
// 4. Images after the first six load lazily (only when scrolled near).
// 5. The page-header banner is set straight in the HTML and preloaded,
//    instead of waiting for a script to set it.
// 6. Carousels keep their final height while their script starts, so the
//    page doesn't jump (layout shift).
//
// Admin, agent, rider, user, cart and checkout pages, files under /assets and
// anything that isn't an HTML page pass through unchanged. If anything goes
// wrong, the original page is served.

const SKIP = /^\/(admin|agent|rider|user|vendor|cart|carts|checkout|assets|login|register|logout)(\/|$)/i;
const DEFERRABLE_CSS = /\/(animate|datatables\.min|toastr\.min|jquery-ui)\.css(\?|$)/;
const EAGER_IMAGES = 6;

// Last banner seen, so it can be preloaded early on the next page.
let bannerUrl = "https://www.ecbtechkenya.com/assets/images/1794727757breadcrumb-bannerjpg.jpg";

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

export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    try {
      const url = new URL(request.url);
      const type = response.headers.get("Content-Type") || "";
      if (request.method !== "GET" || response.status !== 200 || !type.includes("text/html") || SKIP.test(url.pathname)) {
        return response;
      }
      return rewrite(response, url.pathname !== "/");
    } catch {
      return response;
    }
  },
};

function rewrite(response, preloadBanner) {
  let sawAllCss = false;
  let images = 0;
  const out = new HTMLRewriter()
    .on("style", {
      text(t) {
        if (t.text.includes("body{visibility:hidden;}")) t.replace(t.text.replace("body{visibility:hidden;}", ""));
      },
    })
    .on("link[rel=stylesheet]", {
      element(e) {
        const href = e.getAttribute("href") || "";
        if (/\/front\/css\/all\.css(\?|$)/.test(href)) {
          if (sawAllCss) return e.remove();
          sawAllCss = true;
        }
        if (DEFERRABLE_CSS.test(href) && !e.getAttribute("media")) {
          e.setAttribute("media", "print");
          e.setAttribute("onload", "this.media='all'");
        }
      },
    })
    .on("title", {
      element(e) {
        if (preloadBanner) e.after(`<link rel="preload" as="image" href="${bannerUrl}" fetchpriority="high">`, { html: true });
      },
    })
    .on("head", {
      element(e) {
        e.append(`<style>${RESERVE_CSS}</style>`, { html: true });
      },
    })
    .on("img", {
      element(e) {
        images++;
        if (images > EAGER_IMAGES && !e.getAttribute("loading")) {
          e.setAttribute("loading", "lazy");
          e.setAttribute("decoding", "async");
        }
      },
    })
    .on("section.gs-breadcrumb-section[data-background]", {
      element(e) {
        const bg = e.getAttribute("data-background");
        if (!bg || /["()<>]/.test(bg)) return;
        bannerUrl = bg;
        if (!e.getAttribute("style")) e.setAttribute("style", `background-image:url(${bg})`);
      },
    })
    .transform(response);
  const res = new Response(out.body, out);
  res.headers.set("X-ECB-Speed", "1");
  return res;
}
