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

## 2026-11-15: full SEO and conversion layer (Worker v12, `seo.js`)
- **One version of the site:**
  - `ecbtechkenya.com` redirects (301) to `www`. `sitemap.xml`, `robots.txt`
    and the brand logos stay on both hosts.
  - Always Use HTTPS is on; minimum TLS is 1.2.
  - Every page has a canonical URL that keeps only `page`. Search, sort
    and filter pages are `noindex, follow` with a canonical to the plain
    category.
- **Titles and descriptions:**
  - Home: "Laptops & Phones Shop in Nairobi CBD | ECB Technologies".
  - Products: "<name> Price in Kenya".
  - Categories: "<Category> Prices in Kenya | ECB Technologies".
  - About, Contact, FAQ, Privacy, Terms and All products each have their
    own title and description.
- **One H1 per page:**
  - Home: the slider headings became h2, and a new H1 + answer-first intro
    (address, payment, delivery, hours) sits below the slider, with
    WhatsApp / Call / Shop buttons.
  - Categories: the banner heading is the H1 at the same size, plus an
    intro line ("Shop 348 Laptops at ECB Technologies…").
  - About: the second H1 became h2.
- **Structured data (JSON-LD):**
  - Every page: ElectronicsStore (address, phone, hours, payment) and
    WebSite with site search.
  - Products: Product with brand, SKU, images, category, and an Offer with
    the KES price and stock status, plus BreadcrumbList.
  - Categories: CollectionPage + ItemList + BreadcrumbList.
  - Other pages: BreadcrumbList.
  - No FAQ/HowTo schema, as Google no longer shows them for most sites.
- **Social cards:** og:url, og:type (product/website), og:site_name,
  og:locale, X/Twitter cards, and product price tags. The share image
  `/ecb-assets/og.png` (1200x630) now says "Open Mon–Sat 9am–7pm"; it said
  "daily" before.
- **Internal links:**
  - Product breadcrumbs include the category (catalog-map.js, 677 products).
  - Menu items Phones, Gaming and Printers go to the real category pages
    instead of search results.
- **Conversion:**
  - "Order on WhatsApp" on every product page, with a message that includes
    the product name, price and link.
  - A floating WhatsApp chat button on public pages.
  - The phone link is `tel:+254717040531`.
  - Clicks are sent to Google Analytics as `whatsapp_click`.
- **Old product addresses:** the 600 changed product URLs redirect (301) from
  the Worker, so Bulk Redirects is no longer needed.
- **Private pages:** account, cart, checkout, agent and rider pages send
  `X-Robots-Tag: noindex`, and robots.txt disallows them. AI and search
  crawlers are allowed everywhere else; Cloudflare AI-bot blocking is off.
- **`/llms.txt`:** a short summary of the shop, its categories and pages for
  AI assistants.
- **Checked:**
  - 138 internal links from the main pages all return 200.
  - Heading sizes are identical to before.
  - Cart and forms still work.
  - Lighthouse: desktop 99–100, phone 91–100.

## 2026-11-15: catalogue clean-up, new pages, live prices (Worker v17)
- **ThinkPad names fixed (admin):** #968–#973 were "THINKPRAD"/"THINKPARD"
  in mixed capitals and are now "Lenovo ThinkPad …". Their addresses are
  unchanged.
- **Duplicate listings (admin + Worker):**
  - 34 same-category copies are deactivated. Re-enable them in Admin →
    Products → Deactivated Product. Each old address redirects (301) to
    the listing that stays (`dupes.js`).
  - The listing went from 677 to 643 products; Gaming went from 70 to 39.
  - 20 copies of monitors listed under both Gaming and PC Accessories stay
    live; each copy's canonical points to the original listing.
  - The HP EliteBook 840 G7 pair (#483/#484) has different prices, so both
    stay.
  - The LG monitor listed under Printers (#714) is deactivated.
- **New pages (Admin → Other Pages, linked in the footer, in the sitemap
  and in `llms.txt`):**
  - `/delivery`: Delivery Across Kenya
  - `/laptop-prices-in-kenya`: prices by budget, brand and processor, with
    a Q&A section
  - `/student-laptops-kenya`: 46 laptops at KSh 40,000 or less with an
    8th-gen or newer Core i5/i7
  - `/hp-vs-dell-vs-lenovo-laptops-kenya`: models, from/typical/max prices
    and series
  - All figures come from the catalogue on 15 November 2026. Sources are in
    `docs/seo/live-site/pages/`. Prices go stale, so refresh these pages
    every month or two.
- **Info pages:** the theme's fixed "Who We Are / Your One-Stop Shop for Tech
  & More" heading is removed on all pages except About. Each page's own
  title is now its H1.
- **Internal links:** the Laptops category intro links to the three guides,
  and the home and category intros link to /delivery.
- **Live prices:** product meta descriptions and the price intro always show
  the current price, not the price on the day they were written.
- **Impossible prices:** prices over KSh 2,000,000 are left out of Google's
  price data (Offer). See "Still open".

### Deactivated duplicates
| Deactivated ID | Redirects to |
|---|---|
| 687 | /item/asus-tuf-vg34vql3a-34-wqhd-34401440-180hz-1ms-speakers-je53691zsf |
| 712 | /item/asus-tuf-vg34vql3a-34-wqhd-34401440-180hz-1ms-speakers-je53691zsf |
| 666 | /item/dji-osmo-pocket-4p-creator-combo-vlog-amj6453hol |
| 698 | /item/hp-e24t-g4-touch-monitor-24-touch-ips-full-hd-60hz-bjs1657pf1 |
| 702 | /item/hp-omen-27q-gaming-monitor-27-qhd-ips-165hz-wnz2589iaz |
| 727 | /item/hp-omen-27q-gaming-monitor-27-qhd-ips-165hz-wnz2589iaz |
| 688 | /item/hp-omen-34c-34-wqhd-34401440-165hz-1ms-built-in-speakers-zwx38989la |
| 691 | /item/hp-omen-34c-34-wqhd-34401440-165hz-1ms-built-in-speakers-zwx38989la |
| 699 | /item/hp-s27-fhd-27-fhd-ips-100hz-fe41859j6y |
| 697 | /item/lg-34cb99-w-34-34401440-60hz-usb-c-built-in-speakers-nf61365sfn |
| 715 | /item/lg-34u650a-b-34-ips-34401440-100hz-built-in-speakers-ez84221atb |
| 689 | /item/lg-34wr55qk-b-34-va-wqhd-34401440-100hz-usb-c-ql74054tqb |
| 714 | /item/lg-34wr55qk-b-34-va-wqhd-34401440-100hz-usb-c-ql74054tqb |
| 686 | /item/msi-mag-346cq-34-34401440-180hz-1ms-z4y3485zzp |
| 711 | /item/msi-mag-346cq-34-34401440-180hz-1ms-z4y3485zzp |
| 703 | /item/msi-modern-md271ul-27-4k-ips-usb-c-60hz-wel3405ntg |
| 685 | /item/msi-pro-mp341cqw-e12-34-34401440-120hz-1ms-white-xle3091ckt |
| 710 | /item/msi-pro-mp341cqw-e12-34-34401440-120hz-1ms-white-xle3091ckt |
| 682 | /item/samsung-m8-smart-monitor-ls32fm801umxue-32-4k-smart-usb-c-60hz-built-in-speakers-webcam-white-cub2207v4b |
| 707 | /item/samsung-m8-smart-monitor-ls32fm801umxue-32-4k-smart-usb-c-60hz-built-in-speakers-webcam-white-cub2207v4b |
| 695 | /item/samsung-odyssey-ark-2nd-gen-ls55cg97wnmxue-55-smart-4k-38402160-165hz-1ms-1000r-va-speakers-black-fso5311sft |
| 720 | /item/samsung-odyssey-ark-2nd-gen-ls55cg97wnmxue-55-smart-4k-38402160-165hz-1ms-1000r-va-speakers-black-fso5311sft |
| 708 | /item/samsung-odyssey-g5-g55c-ls27cg552emxue-27-qhd-2k-165hz-black-xby4396jzx |
| 693 | /item/samsung-odyssey-g9-oled-ls49dg932smxue-49-5k-51201440-1800r-240hz-003ms-silver-9xf49688pz |
| 718 | /item/samsung-odyssey-g9-oled-ls49dg932smxue-49-5k-51201440-1800r-240hz-003ms-silver-9xf49688pz |
| 721 | /item/samsung-odyssey-neo-g9-ls57cg952nmxue-57-dual-4k-76802160-240hz-1ms-1000r-white-zsi8794rna |
| 690 | /item/samsung-viewfinity-s6-ls34c650vamxue-34-34401440-100hz-usb-c-webcam-built-in-speakers-q8f4396qzf |
| 716 | /item/samsung-viewfinity-s6-ls34c650vamxue-34-34401440-100hz-usb-c-webcam-built-in-speakers-q8f4396qzf |
| 705 | /item/samsung-viewfinity-s8-ls27b800pxmxue-27-4k-ips-60hz-usb-c-1vk37893bk |
| 684 | /item/xiaomi-g34wqi-34-wqhd-34401440-180hz-1ms-white-xav2868hko |
| 709 | /item/xiaomi-g34wqi-34-wqhd-34401440-180hz-1ms-white-xav2868hko |
| 706 | /item/hp-series-5-532sf-32-full-hd-100hz-h61399733o |
| 694 | /item/samsung-odyssey-g9-smart-oled-ls49dg952smxue-49-smart-5k-51201440-1800r-240hz-003ms-speakers-silver-ia95136ebp |
| 743 | /item/samsung-odyssey-g9-smart-oled-ls49dg952smxue49-smart-5k-51201440-1800r-240hz-003ms-speakers-silver-kr97548wqa |

## Still open
- **Wrong prices, to fix in the admin.** These have extra digits:
  - #701 MSI MAG 275UPD E14: KSh 5,700,027
  - Dell XPS 13 9300 i5 10th Gen: KSh 5,700,030
  - Lenovo ThinkPad P15 Gen 1: KSh 6,700,010
  - Dell 7450 2-in-1 X360 Ultra 7: KSh 17,550,020
  - Lenovo IdeaPad 5 X360 Core Ultra 5: KSh 9,550,020
  - HP 15 Core Ultra 7 15th Gen: KSh 10,449,960
- **Social profile links.** The top bar and footer icons point to "#".
  They need the real URLs (Admin → Social Settings); then add them to
  `sameAs` in `seo.js`.
- **Confirm WhatsApp is on 0717 040 531.**
- **Search Console and Bing Webmaster Tools.** Submit
  https://www.ecbtechkenya.com/sitemap.xml.
- **Cloudflare → Caching → Configuration → Crawler Hints:** turn on.
- **Google Business Profile:** hours Mon–Sat 9am–7pm.
- Theme code, needs hosting (file) access: about 1 MB of render-blocking
  CSS (Bootstrap and the theme), jQuery UI JS loaded on every page, and two
  Google Analytics tags.
- Roll the Cloudflare API token. It and its R2 keys were pasted in chat.

## 2026-11-15: hero photo
- Both home slider slides (Admin → Home Page Settings → Sliders, #28 and
  #31) now use the photo `optimized-images/hero-couple-phones.jpg`
  (1920×1280, 284 KB). Visitors get a 1600 px AVIF from Cloudflare.
- Slide text fixed: "That Fits" → "That Fit", "Smarphones" → "Smartphones".
- `seo.js` softens the photo's left edge (mask), tones it slightly
  (brightness .86, saturation .92) to sit with the navy, and adds a shadow
  behind the "LATEST TECH / BEST PRICES" corner text.
