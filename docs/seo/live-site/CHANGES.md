# Changes applied to the live site (www.ecbtechkenya.com)

## 2026-11-14/15: product SEO (GeniusCart admin)
- All 677 products: meta description with price + location, 6 meta tags
  (price in Kenya, Nairobi, Nairobi CBD, price band), product tags (price
  band, brand, use case), and a "price in Kenya" intro at the top of the
  description. Tools: `scripts/live-site/`.
- 600 product addresses changed on their first save (a GeniusCart
  behaviour). Old-to-new redirects are in `cloudflare-redirects.csv`
  (Cloudflare Bulk Redirects); the owner still needs to upload them.

## 2026-11-15: speed and discoverability
- Admin uploads, with the originals in `original-images/`:
  - 6 category images: about 1.7–2 MB each, now 11–20 KB each.
  - 3 "Best Month Offer" banners: 400–500 KB each, now about 65 KB each.
  - Breadcrumb banner: 803 KB, now 68 KB.
  - Homepage weight: 13.8 MB, now 3.3 MB.
- Banner links fixed. They pointed to a 404 on ecb.lumina.co.ke and now go
  to Gaming laptops, Laptops and the Samsung search on the shop.
- Cloudflare (via API):
  - Worker `ecb-sitemap` (`cloudflare-worker-sitemap.js`) with routes for
    `/sitemap.xml`, `/robots.txt` and `/assets/images/brands/*` on both
    the bare domain and www. The sitemap lists 696 URLs and rebuilds every
    6 hours. robots.txt now has the `Sitemap:` line. Missing brand logos
    return an empty cached 404 instead of a 62 KB page.
  - Early Hints, Speed Brain and Cloudflare Fonts turned on. HTTP/3 was
    already on. Rocket Loader left off.
  - Cache rule: `/assets/images/` (except brands) cached at the edge and in
    browsers for 30 days.
- Hosting: the original nameservers were `*.server-217-20-120-93.da.direct`,
  which is DirectAdmin, not cPanel. The control panel is likely at
  `https://<server>:2222`.

## 2026-11-15: speed Worker
- Worker `ecb-speed` (`cloudflare-worker-speed.js`) on `www.ecbtechkenya.com/*`
  and `ecbtechkenya.com/*`. `/assets/*` and `/admin*` are skipped (routes
  with no Worker). The `ecb-sitemap` routes still win for their paths.
  It only changes the HTML of public pages:
  - removes the theme's "hide the page until every script loads" rule
  - drops the second copy of all.css
  - loads animate, datatables, toastr and jQuery UI CSS without blocking
  - lazy-loads images after the first six
  - sets and preloads the page-header banner
  - reserves carousel space so nothing jumps
  User, agent, rider, cart, checkout and login pages are not touched.
- Measured in a throttled phone simulation, before and after:

  | Page | Before | After |
  |---|---|---|
  | Home | 2.9 s | 1.7 s |
  | Category | 3.1 s | 1.6 s |
  | Product | 3.5 s | 1.6 s |

  Desktop is about 1.5 s. CLS stays at or below 0.05. Add-to-cart was tested.
- To undo: Cloudflare → Workers Routes, delete the two `ecb-speed` routes.
- Noted: `counterUp is not a function` is a script error that was already on
  every page, harmless. Product grids show one per row on phones; that is
  the theme's own layout.

## 2026-11-15: speed Worker v7 (target: GTmetrix A, 97-100%)
`ecb-speed` now also:
- **Page cache:** visitors without a shop session (first visits, Google,
  GTmetrix) get a ready-made copy from Cloudflare. Server wait drops from
  about 700 ms to about 60 ms. Copies refresh in the background after
  5 minutes. The home page and categories are also kept in a global
  store (KV namespace `ecb-page-cache`) for Cloudflare locations with no
  copy yet. Visitors with a session (cart, login, agents, riders) always
  get the live page. A cached page fetches a fresh form token on first
  interaction; forms and add-to-cart were tested.
- **One stylesheet:** the 13 stylesheets are merged into one
  (`bundle-css.js`, built by `scripts/live-site/build-css.py`, cached for a
  year). The broken `styles.php` link is removed.
- **Trimmed styles:** home, category and product pages carry only the
  styles they use (94-128 KB instead of 1.2 MB), built by
  `scripts/live-site/used-css.js`. The full file loads on interaction or
  when the page is idle. Screenshots were pixel-identical across trimmed,
  full and original styles.
- **Images:** resized and served as AVIF/WebP via Cloudflare Image
  Transformations, now turned on (free plan, 5,000 unique images/month).
  This covers thumbnails, categories, banners, main product photos and
  the page-header banner. If a resized image fails, the browser falls
  back to the original.
- **Load order:** the banner and the main product photo are announced at
  the top of `<head>`.
- **Missing pictures:** brand logos and hero pictures that don't exist on
  the server are left out, and brand names show as text. Both hero
  slider pictures are missing; re-upload them in Admin → Sliders.
- **Other fixes:** the duplicate `<title>` is removed, the home page gets a
  meta description, and the `counterUp` console error is stubbed out.
- **Cache rules:** images and fonts 1 year, theme JS/CSS 30 days.

Lighthouse results:

| Page | Desktop | Phone |
|---|---|---|
| Home | 100 | 93 |
| Category | 100 | 100 |
| Product | 100 | 93–99 |
| About | 99 | 91 |

TBT and CLS are near 0 everywhere.

**After any theme CSS change:** run `build-css.py`, then `used-css.js`, then
redeploy the Worker. Until then, pages automatically fall back to the
original stylesheets, as long as the `ecb-theme.css?v=` version changed.

## 2026-11-15: titles and product intro (Worker v8)
- Product SEO was already live on all 677 products: meta keywords and
  description in each page's `<head>`. The theme has no visible tags
  section, so they are never shown on the page itself.
- Found: the theme prints each product's `<title>` *before* `<!DOCTYPE>`.
  That gave every product page two titles (its own and the generic home
  title) and put it in browser quirks mode. The Worker now:
  - moves the product title into `<head>` as
    "<name> Price in Kenya | ECB Technologies", keeping it to 60
    characters or fewer (the brand is dropped when it doesn't fit);
  - gives each category "<Category> Prices in Kenya | ECB Technologies"
    plus a meta description;
  - gives About and Contact their own titles and descriptions;
  - adds `noindex, follow` to search, sort and filter pages.
- Found: the theme builds the spec table from bold labels and hides the
  raw description, which garbled the price intro ("KSh 51,000 | at ECB
  Technologies…"). The intro now shows as a heading and paragraph above
  the table.
- Product pages render in standards mode now. The layout is the same
  except a few pixels of spacing.

## Still open
- Upload `cloudflare-redirects.csv` to Bulk Redirects. The current token
  lacks the lists/redirect-rules permissions.
- Theme code, needs hosting (file) access: about 1 MB of render-blocking
  CSS (Bootstrap and the theme), jQuery UI JS loaded on every page, and two
  Google Analytics tags.
- Roll the Cloudflare API token. It and its R2 keys were pasted in chat.
