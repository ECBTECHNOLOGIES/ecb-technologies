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
- Follow-up (Worker v22):
  - The hero photo is sized per screen: 750 px on phones and tablets,
    1200 px on desktop, set through `<head>` CSS.
  - The first slide's photo is preloaded.
  - Roboto 400/700/900 are preloaded so text doesn't re-flow when the font
    arrives. Desktop CLS had risen to 0.15 from the home intro re-flowing
    and is now 0.003.
  - Lighthouse home: desktop 100, phone 84–91.

## 2026-11-15: monochrome redesign (nothing.tech design language), Worker v24
- `skin.js` is a CSS layer the Worker adds after all theme CSS, on every
  public page and on login, register, cart and checkout. Admin is untouched.
  It is controlled by the Worker variable `SKIN` (plain text "1"); remove the
  variable and redeploy to switch back to the original theme instantly.
- Design language follows the Nothing DESIGN.md:
  - pure black / white / grey, no accent colour;
  - sparse dot grid on a #f2f2f2 page;
  - grey product tiles where white product photos blend in (multiply);
  - 6px buttons, 8px cards, hairline borders, no shadows.
- Fonts are open-licence stand-ins for Nothing's proprietary ones, served
  from our own domain by Cloudflare Fonts:
  - Doto (dot matrix) for section titles, page titles, prices and the
    "ECB TECHNOLOGIES" wordmark;
  - Space Mono uppercase for every label, button, menu link and product
    name;
  - Inter, light weight, for editorial headings and body text.
- **Header:** black mono top bar, white capsule bar with the dot-matrix
  wordmark (the logo image is hidden, not deleted), mono menu.
- **Hero:** black, dot-matrix headline, white button.
- **Product cards:** grey tile, mono name, mono price, black "Add to cart".
- **Category and info pages:** big dot-matrix title on the grey page
  instead of the photo banner, so the banner image is no longer downloaded.
- **Product page:**
  - name in Inter Light;
  - price in Doto;
  - black "Add to cart", outlined "Buy now" and "Order on WhatsApp";
  - spec table with mono labels;
  - the "Product Details" banner is removed.
- **Bug fixed:** the home promo strip (Laptop deals / Samsung phones / Gaming)
  had been invisible on desktop since the speed changes; it is visible again.
- Page-cache keys include a fingerprint of the skin, so editing it refreshes
  cached pages.
- **Lighthouse:**
  - desktop 100 on home, category and product pages;
  - phone: category 99, product about 93, home about 86;
  - CLS 0.

## 2026-11-15: declutter (skin.js)
- **Header:**
  - The top bar is hidden; agent and rider logins move to the footer bottom
    links.
  - Header shows icons only (account + cart; wishlist and compare hidden).
  - On phones: one row with menu, wordmark and cart, then search.
- **Menu:** six links (Laptops, Phones, Accessories, Gaming, Printers,
  Deals). Laptops now points to /category/laptops and Accessories to PC
  Accessories.
- **Hero:** headline and one button; the badges and the corner text are
  gone.
- **Home intro:** centred; two actions (WhatsApp, Call).
- **Removed sections:** brands row, "Our Unique Selections" (it repeated the
  featured products), "Why shop", the trust strip, the empty footer map,
  and the social icons (they link nowhere until real URLs are added).
- **Featured:** 8 products in a 4-column grid with no tabs; "View all"
  leads to the rest.
- **Product cards:** no wishlist hearts, no "NEW" badge on every item.
- **Product page:** no empty 0.0 rating, compare/report links, share icons,
  "Sold by" box or empty stock pill.
- **Category page:** no grid/list switch.
- Home page height went from about 6,300 px to 3,900 px on desktop.

## 2026-11-15: Ahrefs page fixes, socials, Sunday, live search, nothing.tech pass 2 (Worker v26)
- **Ahrefs page fixes:**
  - `<meta name="robots" content="index, follow, max-image-preview:large…">`
    and an `X-Robots-Tag` header on every page (`noindex, follow` where
    applicable).
  - `twitter:site` and `twitter:creator` are `@ecbtechnologies`.
  - Dates: `article:published_time` / `article:modified_time` /
    `og:updated_time`, plus a WebPage/ItemPage/CollectionPage node with
    datePublished/dateModified. Published dates: products use the upload
    time in their photo's file name; written pages use the day they were
    written; other pages use the site setup date (from the logo upload).
- **Socials:** Instagram, TikTok and X are in the footer, in the
  ElectronicsStore `sameAs` and in llms.txt. Facebook and YouTube icons are
  removed (no profiles yet).
- **Sunday:** the Visit section reads "Sunday: Closed".
- **Search:**
  - Results pages bypass the page cache, so they always come live from the
    shop.
  - New `/ecb-search?q=` endpoint returns the shop's first 8 matches as JSON
    (cached 60 seconds).
  - Every search box shows live suggestions (photo, name, current price,
    "See all N results"), with keyboard support.
- **Slider:** titles shortened to "Laptops" and "Smartphones", each with a
  "Nairobi CBD" label (admin).
- **skin.js, nothing.tech pass 2:**
  - Full-bleed hero photo with text bottom-left (photo 1920 px on desktop,
    1000 px on phones).
  - Home shows the intro, categories, 8 products and Visit only (promos and
    best sellers hidden).
  - Product tiles are image, name in dot-matrix and price, with no buttons.
  - Product page: flat, dot-matrix name, mono price; no trail, trust strip
    or tabs.
  - Category intro is one mono line.
  - Footer follows the nothing.tech pattern: big dot-matrix category links,
    dark action tiles, one row of small links + socials, and a dot grid on
    black.
- The hero photo is now `optimized-images/hero-friends-selfie.jpg` (four
  friends, selfie), on both slides. Phone crop is set to the left (20%) so
  the selfie and phone stay in frame.
- Home: the intro block (heading, line, WhatsApp/Call/Shop buttons) is
  removed; the page goes from the hero straight to a "Shop by category"
  title and the category row. The H1 moved to the first slide's label:
  "Laptops & Phones · Nairobi CBD". The meta description and structured
  data still carry the address, delivery and hours.

## 2026-11-15: wrap-up (Worker v31)
- **Prices with cents (admin):** eight products had cents typed in
  (e.g. 57000.30), which the theme shows as "KSH57,000,30". They are now
  whole shillings:
  - #1112 → 57,000
  - #1076 → 67,000
  - #814 → 95,500
  - #781 → 104,500
  - #826 → 175,500
  - #578 → 121,000
  - #899 → 42,500
  - #910 → 25,000
  - `parseKsh` in seo.js reads such prices correctly in future.
- **More duplicates (admin + dupes.js):**
  - MSI MAG 275UPD E14: #726, and #701 (the KSh 5,700,027 copy), are
    deactivated → #676.
  - Samsung Odyssey G9 LS49FG910EMXUE: #717 is deactivated → #658 (#741
    redirects straight to #658).
- **Titles:**
  - Product names that don't fit in 60 characters are shortened at a word
    boundary and end with the price ("… – KSh 153,500"), so variants
    (touch / non-touch, 8GB / 16GB…) get different titles.
  - Names that contain "|" are no longer cut at the first "|".
  - Subcategories are named "Gaming Laptops", "Budget Laptops".
- **Sitemap:** cross-category copies (canonical elsewhere) and empty
  subcategories are excluded. 640 URLs.
- **IndexNow:**
  - Key file at /a6a895d27584eebb2a87a7a9125acdb9.txt.
  - `POST /ecb-indexnow?token=…` (token is the Worker secret
    INDEXNOW_TOKEN, not in the repo) with a JSON array of URLs submits them.
  - All sitemap URLs were submitted. Yandex accepted them, and IndexNow
    shares submissions with Bing. Bing's and api.indexnow.org's own
    endpoints rate-limit Cloudflare's shared IPs (429).
- **Full check of all 640 sitemap pages:**
  - all 200;
  - title ≤ 60 and unique;
  - description, canonical = own URL, exactly one H1, JSON-LD, robots meta
    and X-Robots-Tag present;
  - redesign applied.

## Still open (owner)
- Google Search Console: add the property and submit
  https://www.ecbtechkenya.com/sitemap.xml.
- Bing Webmaster Tools: submit the sitemap (or import from Search Console).
- Cloudflare → Caching → Configuration → Crawler Hints: turn on.
- Google Business Profile: hours Mon–Sat 9am–7pm, Sunday closed; add the
  website and the Instagram / TikTok / X links.
- Security: change the admin password; replace the Cloudflare token, R2 keys
  and reCAPTCHA keys that were pasted in chat.
- Refresh the three buying guides every month or two (prices change).
- Facebook / YouTube: send the links if those profiles are created.

## 2026-11-15: AI-readable site (markdown.js, Worker v34)
- **Markdown version of every public page:**
  - Three ways to get it: `/<page>.md` (home: `/index.md`),
    `Accept: text/markdown` on the page URL (only when text/markdown out-ranks
    text/html; `*/*` or no Accept always gets HTML), or `/api/md/<path>`.
  - Built from the page's own data:
    - products: price, stock, category, SKU, intro, spec table, photo,
      how to buy;
    - categories: the product list with prices, paginated like the HTML;
    - info pages and guides: their text and tables;
    - FAQ: questions and answers;
    - contact: the shop facts.
  - Headers: `text/markdown`, `X-Markdown-Tokens`, `X-Robots-Tag: noindex,
    follow`, `Content-Location` and `Link rel=canonical` pointing to the HTML
    page, `Vary: Accept` when negotiated, CORS for GET/HEAD/OPTIONS, and
    cache 1h + stale 1 day.
  - Unknown, private, admin, cart and checkout paths return a markdown 404.
    Moved or merged products 301 to the new `.md`.
- **`/llms.txt`** (llmstxt.org): built from code with core pages, guides,
  categories, the latest 50 products, machine-readable files, legal and
  socials. Links point to the `.md` versions.
- **`/llms-full.txt`:** 10 core, guide and legal pages rendered in full,
  then every product with its price, grouped by category (about 145k
  characters, cached 1 day).
- **`/ai.txt`** (ai-txt v1.1.1): identity, permissions, restrictions (no
  invented prices or stock, no fake reviews), attribution, scope, contact.
- **`/api/md/_catalog`:** every markdown URL (JSON).
- **Normal pages:**
  - `<link rel="alternate" type="text/markdown">` and `<meta name="ai-summary">`
    on public pages;
  - `Link: rel="describedby"` header for llms.txt, llms-full.txt and ai.txt,
    plus `rel="alternate"` to the markdown;
  - `Vary: Accept`.
  - ElectronicsStore and WebSite JSON-LD were already present.
- **robots.txt:** OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
  PerplexityBot and Perplexity-User are named in the main group (allowed on
  public pages, kept out of private ones), with pointers to llms.txt and
  ai.txt. Training crawlers stay allowed (owner's choice; blocking them would
  not affect citations). `.md` URLs are not in the sitemap.
- **Not added:** `/.well-known/mcp.json`, because the shop runs no MCP server.
- **Check:** `scripts/live-site/check-markdown.py` requests the `.md` of every
  sitemap URL and tests negotiation, the 404 behaviour and the site files.
  The first run gave 640/640 (one transient origin error, then OK) and all
  11 checks passed.
- **To give a new page type a markdown version:** add its path to
  `isContentPath` and a renderer in `renderPath` (markdown.js); llms.txt, the
  catalog and llms-full.txt pick it up from there.

## 2026-11-15: research pages from the shop's own data (Worker v39)
- **New pages, built live from the product list (`research.js`, pure and
  tested):**
  - `/research`: hub page.
  - `/research/laptop-prices-kenya`: 348 laptops; 7 findings, each with its
    own anchor; tables by budget, brand and processor; FAQ; methodology;
    how to cite.
  - `/research/tech-prices-kenya`: 635 products by category.
  - Each page has Dataset and FAQPage JSON-LD and a `.md` version.
  - The pages use the `/delivery` page as a shell, so they keep the site's
    header and footer. They are cached for 1 hour.
- **Rules:**
  - A finding needs at least 20 rows.
  - Prices of KSh 1,000 or less, or KSh 2,000,000 or more, are dropped, and
    so are duplicates.
  - Shares use largest remainder, so they add up to 100%.
  - A gap under 5% is written as "about the same".
  - The shop's "SmartPhones" category also holds tablets and e-readers, so
    the study calls it "Phones & Tablets".
- **Honest dates:** KV `research-state` stores a hash of slug:price for
  every product. "Last updated", `dateModified` and the sitemap `lastmod`
  change only when that hash changes. Other sitemap URLs no longer carry an
  invented lastmod.
- **Category pages** (top level):
  - title `N <Category> in Kenya with Prices (YYYY)` (only if it fits in
    60 characters);
  - a summary line (count, range, median, three newest, the "prices as of"
    date);
  - a link to the matching study.
- **llms.txt:** adds a "Research" section and a "Cite this site for"
  section (one question per study, each with its findings and anchor URLs).
  llms-full.txt includes the studies.
- **robots.txt:** GPTBot, ClaudeBot, Google-Extended and Applebot-Extended
  are now named in the same group as `*` too.
- **Footer:** adds a Research link.
- **Tests:** `node scripts/live-site/test-research.mjs` (10 tests).
- **Not built:**
  - Audio Accessories findings: 12 rows, under the minimum.
  - Phone brand breakdown: samples too small.
  - A product "at a glance" box: left out to keep the minimal design. The
    same facts are already in the meta description, the JSON-LD and the
    `.md`.
- **Admin to-do:** the HP OMEN Transcend 14 laptop is filed under
  SmartPhones; move it to Laptops or Gaming.

## 2026-11-15: programmatic laptop guides (Worker v41)
- **`pseo.js`:** `buildPages(products)` is pure and tested. It decides which
  guide pages exist from the live catalogue, writes each one in the pSEO
  JSON shape, and reports every rejected candidate with its reason.
- **35 pages published**, plus the `/guides` hub:
  - Curation (11): best laptops under 25k, 30k, 40k, 50k, 60k, 70k, 80k and
    150k; 2-in-1; touchscreen; 16 GB RAM.
  - Personas (4): business, programming, design and video editing, gaming.
  - Directory (6): HP, Lenovo and Dell; Core i5, Core i7, Core Ultra and
    Ryzen.
  - Profiles (5): ThinkPad, EliteBook, Latitude, ZBook, HP x360.
  - Comparisons (8): ThinkPad vs EliteBook, EliteBook vs Latitude, ThinkPad
    vs Latitude, EliteBook vs ProBook, Core i5 vs i7, Core Ultra vs i7,
    8 GB vs 16 GB RAM, MacBook vs Windows.
- **Gates:**
  - at least 10 matching laptops (8 per side for comparisons);
  - a unique slug and a unique primary keyword;
  - no more than 60% of listed laptops shared with an accepted page;
  - not already covered by an existing guide;
  - at least 600 words (900 for comparisons and profiles);
  - at least 3 FAQs, 5 internal links and 2 related pages.
  Links to pages that fail a gate are removed.
- **16 SKIPPED:**
  - Under 20k: only 7 laptops.
  - Under 100k: duplicates the under-80k page.
  - Apple directory: duplicates the design page.
  - HP vs Dell, HP vs Lenovo and student laptops: existing guides already
    cover them.
  - ProBook, XPS and MacBook profiles: under 900 words.
  - Playbooks not built: Templates, Conversions, Examples, Locations
    (doorway risk), Integrations, Glossary and Translations.
  Every reason is in `/guides/pages.json`.
- **Ranking:** a published spec score out of 42 (processor class, processor
  age, RAM, SSD). Pros and cons follow only from the listing. One example is
  the Windows 11 support note for 7th-gen and older Intel chips.
- **URLs:**
  - `/best/*`, `/compare/*`, `/series/*` and `/laptops/*`; each has a `.md`
    version.
  - Bare `/best`, `/compare`, `/series` and `/laptops` return 301 to
    `/guides`.
  - A guide that drops below its gate later returns 302 to `/guides`
    (never a 404). Unknown slugs return 404.
- **Discovery:**
  - The sitemap lists only published guides (KV `guides-state`, written by
    the speed Worker), with lastmod set from the catalogue change.
  - llms.txt has a "Laptop guides" section.
  - The guides are in the markdown catalog.
  - Footer link "Laptop guides"; laptop category pages link to `/guides`.
- **Schema:** CollectionPage or Article, ItemList and FAQPage. The template
  adds BreadcrumbList.
- **Snapshot:** the JSON output is in `pseo-pages.json`.
- **Checks:**
  - `node scripts/live-site/test-pseo.mjs` (11 tests).
  - Live crawl: all 36 pages return 200 with one H1 each and no duplicate
    titles; all 225 internal links resolve.

## 2026-11-15: search suggestions removed (Worker v42)
- The live suggestion dropdown under the search box is gone: its script and
  CSS (seo.js) and the `/ecb-search` endpoint (now 404). Search fields get
  `autocomplete="off"`, so browsers do not show their own list either.
  Pressing Enter still opens the full results page.

## 2026-11-15: hero headline (Worker v45)
- Home hero: the small label ("Laptops & Phones · Nairobi CBD") and the
  one-word titles are replaced by one headline per slide: "The laptop you
  need. / At a price that makes sense." and "The phone you want. / At a price
  that makes sense." The first is the page h1. Text is in `HERO_HEADLINES`
  (cloudflare-worker-speed.js); sizes are in skin.js.

## 2026-11-16: shorter hero headline (Worker v46)
- "Genuine laptops. / Honest prices." and "The latest phones. / Honest prices."
  Bigger type (80/60/36 px) now that the lines are short.

## 2026-11-16: hreflang and honest modified dates (Worker v47)
- Every indexable page has `<link rel="alternate" hreflang="en-KE">` and
  `hreflang="x-default"`, both pointing to its canonical URL (single-language
  site). Pages marked noindex get none.
- `article:modified_time`, `og:updated_time` and JSON-LD `dateModified` were
  "now" on every request. They now show:
  - home, categories and products: when the catalogue last changed (KV
    `research-state`, written only when a product or price changes);
  - pages we edited: the edit date (`PAGE_MODIFIED` in seo.js);
  - every other page: the published date.
- Cart, checkout, login and 404 pages are private (`X-Robots-Tag: noindex`),
  so they carry no dates or hreflang.

## 2026-11-16: Search Console "Redirect error" (Worker v48)
- Redirects took up to 4 hops (5 with http), for example: bare domain + trailing
  slash + old product URL + merged duplicate. They now take one 301 to the
  final URL (`finalUrl()`): www, no trailing slash, and old and merged
  addresses resolved all the way. All 637 old product addresses: 1 hop to a
  200 page. All 679 sitemap URLs: 200 with no redirect.
- `/item/quick/view/*`, `/item/show/*` and the cart actions (`/addcart`,
  `/addnumcart`, `/addtonumcart`, `/addbyone`, `/reducebyone`, `/removecart`)
  are disallowed in robots.txt and sent with `X-Robots-Tag: noindex, nofollow`.
  These URLs sit in data attributes on product cards. Several return 500 at
  the origin, and quick view was an indexable copy of each product.
- robots.txt lists only the www sitemap.

## 2026-11-16: internal linking (hubs, depth, anchors)
- **Audit:** crawl from the homepage, before and after
  (`scratchpad/linkgraph.py`).
  - Before: no orphans and no links to wrong versions of a URL, but 104
    products were 4–6 clicks deep, there were 700 generic anchors
    ("View All", "Shop Now"), and `/categories` returned 500.
  - After: every sitemap page is at most 3 clicks deep; 51 generic anchors
    remain at first (those 49 "Shop Now" are fixed below).
- **Categories hub `/categories`:** served by the Worker in place of the
  origin's 500. It is a plain list of links: every category with its count,
  its subcategories, and the guides and research hubs. Linked from the
  homepage ("All categories and subcategories"), the footer and the laptop
  category intro. Listed in the sitemap.
- **Pagination:** links every page (laptops 1–29) instead of 1–10, with
  labelled previous/next arrows.
- **Anchors:**
  - hero "Shop Now" now says "Shop laptops" or "Shop phones";
  - "View All" now says "All products";
  - on product pages, related products link "More <Category>" to the
    product's own category;
  - the "Shop Now" button on content pages (about, delivery, research,
    guides) now says "Shop laptops" and links /category/laptops instead of
    the homepage.
- **Guides:** the money page is linked as "Laptops in Kenya: all prices".
  Guides also link /categories.
- **Every internal link** is rewritten to its final URL (www, no trailing
  slash, old and merged product addresses resolved), so no click lands on a
  301.
- **Not built:** a locations hub. There is one shop; /delivery covers all 47
  counties, and per-town pages would be doorway pages. The blog hub
  already exists as /guides.

## 2026-11-16: AEO pages, then emergency fixes after the shop's database was restored (Worker v61)
### AEO (AI search prompts)
- **`docs/seo/aeo/`:** 31 prompts based on real queries, filled in for ECB
  (laptop/phone shop, Nairobi CBD, students/business/programmers/designers/
  gamers). Each names the page that should be cited and the fact it should
  quote. `aeo-prompts.csv` is the monthly tracking sheet (ChatGPT,
  Perplexity, Gemini, Google AI Overview, Copilot). The agency-only template
  ("optimize for AI search") is not used.
- **`/laptop-shop-nairobi`:** a local page for the one real shop. It has
  - shop facts (address, hours, phone, delivery, checkout);
  - what it stocks, with live counts;
  - which laptop suits which buyer (links to each guide);
  - how to buy, and the newest laptops in stock;
  - an FAQ answering the "who/where/which shop" prompts with facts only
    (no "best" claim);
  - structured data: `WebPage` about `#store`, plus `FAQPage`.
  It is in the guides hub, the sitemap, llms.txt ("Cite this site for") and
  the footer ("Visit the shop").
- **Product pages:** a "Buying in Nairobi" Q&A (price in Kenya, where to buy,
  delivery outside Nairobi, stock), plus `FAQPage` JSON-LD.
- Guide pages' publisher now points to `#store` (the `#organization` node
  did not exist).

### The shop's database was restored on 16 Nov (around 15:50 EAT)
- **What changed at the origin:**
  - products are back on their old slugs (600 of 678);
  - the 4 admin pages created on 15 Nov are gone (/delivery and the 3
    guides);
  - product meta descriptions, keywords and the "price in Kenya" intros are
    empty;
  - product `<title>` is just "ECB Technologies";
  - duplicate listings are active again;
  - 8 prices have cents again;
  - category images are back to 1.7–1.9 MB;
  - category assignments changed (Gaming 36 → 71).
- **Worker fixes:**
  - **Redirects:** product redirects are made only when the requested slug
    is not live and a related slug is, in either direction (old ↔ new) or
    a merged duplicate (`liveSlugFor`). Before this fix, the Worker sent
    every live old slug to a 404.
  - **Product list:** `productList` keeps the last good list in KV
    (`products-last-good-v2`) and rejects a list smaller than 300 or 80%
    of the last good one. It retries 3 times. It no longer drops products
    whose slug is in the redirect table.
  - **Categories:** CATEGORY_OF maps both slugs of each product. It was
    rebuilt from the live categories (677/678 mapped). catalog-map.py now
    retries cut-off pages.
  - **Lost pages:** /delivery and the 3 guides are served by the Worker from
    `static-pages.js` (from pages/pages.json), with the unconfirmed M-Pesa
    claims removed. The page template now comes from /about, with its
    about-only sections removed.
  - **Product titles:** taken from the product H1 when the theme gives none.
  - **Product descriptions:** an empty one is filled from the page (name,
    live price, specs, shop, delivery). The shop's own text is never
    replaced. Empty keyword tags are removed.
  - **Duplicate listings:** found from the live list (same slug base and
    price). Each copy's canonical points to the oldest listing (19 copies).
- **After the fixes:** all 738 sitemap pages return 200, each with a real
  title, a description and one H1. All old and new product addresses
  resolve to a live page. 35 guides are published.
- **Still to redo in the admin** (needs the owner or admin access):
  - recreate /delivery and the 3 guide pages;
  - product meta and intros (scripts/live-site);
  - deactivate the duplicates;
  - round the 8 prices;
  - re-upload the compressed category images and banners;
  - check banner links;
  - find out why the database was restored.

## 2026-11-16: keyword map (Worker v70)
- **`docs/seo/live-site/keyword-map.js`** (source) holds 60 keyword clusters,
  each assigned to one page. Each has a primary keyword, cluster terms, AI
  prompts, intent, status and a note.
  - Volume and KD are left empty: they come from Keyword Planner or Semrush
    and are never estimated.
  - Collecting real Google suggestions automatically was blocked, so the
    clusters come from the catalogue and common Kenyan query phrasing.
  - Review by 2027-02-16 (every 3 months).
- **`scripts/live-site/keyword-map.mjs`** audits every target page live:
  - is the primary keyword in the title, H1, description and opening text;
  - cannibalization: another page of the same intent with the keyword in
    its title, unless that page's keyword is just more specific.
  It writes `docs/seo/keyword-map/keyword-map.csv` (Semrush template
  columns plus the audit) and `README.md`.
  - First run: 43 mapped, 9 to optimize, 5 cannibalization flags.
  - Now: 52 mapped, 0 to optimize, 6 to create, 0 cannibalization.
- **Cannibalization fixes:**
  - `/laptop-prices-in-kenya` (a static copy with stale numbers) now 301s to
    `/research/laptop-prices-kenya` (live).
  - The student page is rebuilt live from the catalogue (`pseo.js`) and
    takes the under-40k cluster. `/best/best-laptops-under-40k-kenya`
    301s to it. Merged guide pages now 301 to the page they merged into,
    instead of 302 to the hub.
  - Homepage title is now brand-first ("ECB Technologies | Genuine Laptops &
    Phones, Honest Prices"). "Laptop shop in Nairobi" belongs to
    `/laptop-shop-nairobi`.
- **Optimized:**
  - Category H1s, titles and descriptions now come from the map: "Laptops
    in Kenya", "Phones & Tablets in Kenya", "Computer Accessories",
    "Gaming Monitors & Laptops", "Printer Prices"…
  - Subcategory titles are fixed ("Student Laptop Deals in Kenya",
    "Monitors Price in Kenya…").
  - Directory H1s say "… laptop prices in Kenya".
  - The design guide's title includes "Graphic Design".
  - Guide descriptions lead with their keyword.
  - /delivery is titled "Laptop and Phone Delivery Across Kenya".
  - Category descriptions no longer state the unconfirmed "M-Pesa or card".
- **Anchors:** the categories hub and the guides use the map's keywords
  ("Laptops in Kenya (349)", "Laptop prices in Kenya", "Budget laptops in
  Kenya").
- **To create:**
  - iPhone, Samsung, Google Pixel and iPad price pages: code is in
    `pseo.js`, but they fail the 600-word minimum at 440–515 words (10–17
    models; listings carry only name, storage and price). They publish
    automatically once they pass.
  - ProBook and MacBook (word gate).
- **Restore fallout fixed on the way:**
  - /delivery and /hp-vs-dell-vs-lenovo `.md` are rendered from the saved
    copies.
  - Worker-inserted links point to the research page.

## 2026-11-20: sitemap index (only indexable URLs)
- **`/sitemap.xml` is now a sitemap index** of four sitemaps (new Worker
  routes `/sitemap*` on both hosts):
  - `/sitemap-pages.xml` (9)
  - `/sitemap-categories.xml` (10)
  - `/sitemap-guides.xml` (40)
  - `/sitemap-products.xml` (625)
  Search Console reports indexing per sitemap, so each page type can be
  checked on its own.
- **Only indexable URLs:** every listed URL returns 200, is indexable and
  has a self-referencing canonical (checked: 684/684).
- **Left out:**
  - 53 duplicate product copies whose canonical is another listing. They
    were the "Alternate page with proper canonical tag" entries. The speed
    Worker writes the live duplicate map to KV `dupes-live`, which the
    sitemap Worker reads; the old hand-made skip list used pre-restore
    slugs.
  - Merged pages that redirect.
  - Empty categories. Student-Deals and monitors have 0 products since the
    restore, so they are noindex.
- **lastmod:** catalogue-driven sitemaps carry the date the catalogue last
  changed. Static pages carry none.
- **Submitted:** IndexNow accepted all 684 at Yandex (202). Bing and
  api.indexnow.org rate-limit Cloudflare's IPs (429). Google is submitted in
  Search Console (owner).

## 2026-11-20: original design back, brand colours (Worker v78)
- **The owner asked for the old homepage design and the brand colours.**
  The monochrome "Nothing" skin is off: the Worker's `SKIN` variable is now
  "0" (the deploy script binding). The skin code is still there; set
  `SKIN` to "1" to bring it back.
- **The site uses the theme's own design:** red ECB logo, brand blue
  `#1683ff` (buttons, links, menu), red `#e8191a` (prices, Deals), navy
  hero. Every SEO, speed and content change still applies.
- **Homepage:**
  - The extra intro block under the hero ("Laptops, Phones & Accessories
    Shop in Nairobi CBD" with the WhatsApp / Call / Shop laptops buttons)
    is gone, as asked on 15 Nov.
  - The H1 is the first hero slide's own heading: its label moves inside
    the H1 and looks the same ("Laptops, Phones & Accessories / In Kenya";
    the theme's "ACCESORIES" typo is fixed).
- **Guide, research and shop pages:** the typewriter-style label font is
  replaced by the theme font. Prices are in brand red, the call-to-action
  box and finding links in brand blue.

## 2026-11-20: automatic backups
- **`scripts/backup/backup.py`** runs every day at 02:17 Nairobi time in a
  scheduled cloud session and commits to the `backups` branch:
  - the markdown of all sitemap pages (684);
  - the catalogue as CSV and JSON (678 products);
  - llms.txt, llms-full.txt, robots.txt and the sitemaps;
  - Cloudflare: both Workers as deployed with their bindings, routes, KV
    data keys, zone settings, rulesets, and DNS (JSON and BIND export).
  It refuses to overwrite a good catalogue with a cut-off one (fewer than
  300 products).
- **Not covered:** the shop's files and database, and ecb.lumina.co.ke. The
  DirectAdmin panel (port 2222) can't be reached from the cloud sandbox,
  whose proxy only allows 443. `docs/backups.md` has the steps to schedule
  full server backups and to restore the POS site.
- `docs/lumina-placeholder/` (`index.html` + `.htaccess`) is a branded
  "being restored" page for the POS software site that replaces the empty "Index of /" until the POS
  site is restored.
- `/categories.md` now exists (it was a 404 found by the first backup run).

## 2026-11-20: admin login "nothing happens"
- **Cause:**
  - The shop's answer to Sign In is "Credentials Doesn't Match": the 16 Nov
    restore brought back an older admin password.
  - The theme draws that message below the fold, so it looked like nothing
    happened.
- **Fix:**
  - `/admin/login` (both hosts) is now routed through ecb-speed. The Worker
    pins alerts to the top of the screen, and the bare domain 301s to www.
  - Sign-in POSTs still pass straight to the shop.
- **Password reset:** the owner resets it in phpMyAdmin (`admins` table,
  bcrypt `$2y$` hash) or with "Forgot password?". No credential is stored
  in the repo.

## 2026-11-20: old sitemap addresses in Search Console
- Search Console still lists old sitemaps from the WordPress era
  (`sitemap_index.xml` on both hosts, `product-sitemap.xml`), all "Couldn't
  fetch".
  - `/sitemap_index.xml` now serves the new sitemap index.
  - `/product-sitemap.xml` now serves the product sitemap (new routes on
    both hosts).
- The homepage URL was also submitted as a sitemap (Nov 17: "1 error"). It
  is to be removed in Search Console; `sitemap.xml` is to be submitted.

## 2026-11-20: HTML site map and footer links
- **`/site-map`:** an HTML sitemap for visitors, served by the Worker in the
  site template. It lists:
  - the main pages, the 7 categories and their subcategories;
  - all guides and research, grouped;
  - all 625 indexable products, grouped by category (duplicate listings
    left out).
  It links the XML sitemap and is listed in `sitemap-pages.xml`.
- **Theme footer** (now that the skin is off): "Customer Care" gets All
  Categories, Laptop Guides, Price Research, Visit Our Shop, Delivery Across
  Kenya and Site Map. The bottom row gets "Sitemap". These hub links had
  only been in the skin's footer.

## 2026-11-20: indexing clean-up (Search Console: 1,138 Not found, 224 403, 180 other 4xx…)
- **Old WordPress/WooCommerce addresses** now get one 301 to their real
  equivalent (`legacyTarget()` in the speed Worker). Before, they took a
  trailing-slash 301 and then a 404.
  - `/product/<slug>/`: the closest live product by words in the slug
    (Jaccard ≥ 0.5), else the matching category.
  - `/product-category/…`, `/product-tag/…`: category or brand page.
  - `/shop`, `/blog`, `/about-us`, `/contact-us`, `/cart`, `/my-account`,
    `/home`, `/index.php`, `/page/N`: their equivalents.
  - `/?s=` and `/search?q=` (was a 500): the search page.
  - `/?p=…` and other WordPress query strings: `/`.
  - `wp-admin`, `wp-content`, `feed`, `author`, `tag` and dated posts:
    `410 Gone`, so Google drops them.
- **Soft 404:** listing pages past the last page (e.g.
  `/category/laptops?page=99`) were empty, 200 and indexable. They now
  return a real 404 with noindex.
- **robots.txt** also disallows the non-page endpoints that filled the 4xx
  and redirect rows: `/subscriber/` (405), `/currency/`, `/language/`
  (302), `/wishlists`, `/track-order`, `/search`.
- **403s:** these are the server refusing directory listings
  (`/assets/…/`). That is correct; they are not pages.

## 2026-11-20: sitemap check, 5xx retry
- **Checked:** all 7 sitemap files (index, the 4 sitemaps, and the old
  `sitemap_index.xml` / `product-sitemap.xml` addresses) are valid XML, with
  no duplicate URLs. All 685 URLs return 200, are indexable and have a
  self-referencing canonical.
- **5xx:** the shop's server sometimes returns 500 under load; 3 product
  URLs did during the check, and all were fine on retry. The speed Worker
  now retries 5xx twice (400 ms, 800 ms) on a cache miss before passing
  the error on. Background refreshes already kept the old copy on errors.
- `/sitemap`, `/sitemap/` and `/sitemap.html` now 301 to `/site-map` (they
  were a 404).

## 2026-11-20: programmatic SEO system (model template, batches, pruning)
- **New template, "{model} price in Kenya"** (`/laptops/<model>-price-kenya`,
  `pseo.js`):
  - The model is read from the product address: brand, series and model
    number, up to the first processor or memory word.
  - One page per model with **3 or more distinct configurations** in stock
    (27 models on 20 Nov).
  - "Useful at a glance": a configuration table (processor, RAM, storage,
    screen, price) and which configuration to buy (cheapest, best specs
    for the money, most memory, what the dearer one adds), plus series
    background, buying in Nairobi, FAQ and CollectionPage, ItemList and
    FAQPage structured data.
  - Configurations are labelled by what differs, because listing names are
    cut off and often identical.
  - Word minimum 300 ("glance" type); the other gates still apply.
- **Release in batches:**
  - At most 15 new model pages go live per day (most configurations first);
    the rest are listed as "Queued" and 302 to /guides until their day.
  - KV `guides-first-seen` records each guide's first publication date. The
    existing guides were backfilled with 2026-11-15.
  - Day 1: 15 model pages live, 12 queued.
- **Pruning (step 8):**
  - `scripts/live-site/prune-guides.mjs <Pages.csv> [--apply]` reads a
    Search Console Performance → Pages export and lists guides that have
    been live for 90+ days with 0 impressions. It also lists the
    top-performing guides, so the winning page types can be doubled down
    on.
  - `--apply` writes KV `guides-pruned`. Those pages are then served with
    noindex and left out of the sitemap and llms.txt, but kept for visitors
    and links.
- `/guides/pages.json` adds `first_published` and `pruned`.
- `/guides` has a "Laptop models: prices by configuration" section.
- `test-pseo.mjs`: 16 tests (model keys and names, daily batches, pruning
  flags, model pages list only their model).
- Sitemap: 700 URLs, all 200, indexable, self-canonical.

## 2026-11-20: scaling guide pages without thin or duplicate pages
- New "combo" pages cross two filters the shop can actually fill (brand,
  series, processor, generation, RAM, SSD, feature, use, and budget), e.g.
  `/best/dell-core-i5-laptops-kenya`, `/best/hp-laptops-with-32gb-ram-kenya`,
  `/best/laptops-with-16gb-ram-and-512gb-ssd-kenya`.
- Each one must pass the same checks as every guide page: at least 10
  matching laptops, at most 60% overlap with any page already accepted, a
  keyword no other page uses, 600+ words, 3+ FAQs, 5+ internal links and 2+
  related pages. Pages that fail are skipped with a reason; near-duplicates
  301 to the page they merge into.
- Content beyond the ranked list: "How this group compares" shows the share
  and median price against both parent groups (e.g. all HP laptops, all
  laptops under KSh 40,000), plus RAM and processor age. Every page has
  CollectionPage + ItemList + FAQPage structured data, a title of 60
  characters or less and its own meta description.
- Release: model and combo pages go live 15 a day (88 queued at deploy).
  Queued pages redirect (302) to /guides and stay out of the sitemap until
  released. A page that fails a check no longer uses up a release slot, and
  a duplicate only gets a 301 once the page it merges into is live.
- About 140 pages pass with the current ~680 products; the rest are skipped
  as too few laptops (142), duplicates (107) or too short.

## 2026-11-20: full SEO checklist audit (see docs/seo/seo-checklist.md)
- Security: server errors no longer show Laravel's debug trace (the shop runs
  with APP_DEBUG on); the Worker returns a plain error page instead.
- Headings: "Product Details" banner is no longer a heading above the H1;
  product section headings h4 → h2, category sidebar h6 → h2, contact modal
  h4 → h3. Same look (sizes copied into CSS). "Buying in Nairobi" Q&A styled
  (it rendered at 48px without the skin).
- Titles: short product titles include the price (50–60 characters); other
  short titles get "| ECB Technologies" when it fits.
- Meta descriptions over 160 characters are cut at a sentence or word;
  "Lorem Ipsum" descriptions replaced.
- Terms and Privacy (software template text): noindex, out of the sitemap.
- Duplicates: copies whose address is the other's, trimmed (same price) are
  merged (2 monitor pairs had identical titles).
- /hp-vs-dell-vs-lenovo-laptops-kenya: built from live data (was a 15 Nov
  snapshot with a dead product link), with FAQs and FAQPage schema.
- Guides: byline, "About this guide" box, author in structured data; cache
  key includes the catalogue version and release day, so pages never keep
  links to guides that are no longer live.
- Product pages: six similar-price products from the same category (360
  products had only one internal link).
- Tracking pixels get an empty alt.
- IndexNow: 695 URLs (Yandex accepted; Bing rate-limited, already has them).
- New: scripts/live-site/gsc-opportunities.mjs (low CTR, page 2, losing
  pages, question queries from a Search Console export).

## 2026-11-20: programmatic SEO guide, remaining steps
- Checked: every sitemap page is within 2 clicks of the homepage (47 at one
  click, 647 at two).
- New template "<model> alternatives in Kenya" (/laptops/<model>-alternatives-kenya):
  laptops within 20% of the model's median price, ranked by spec score, with a
  "Compared with the <model>" section (price, best configuration, how many
  alternatives beat it for the same money, RAM and processor age) and a FAQ.
  Same gates and daily release as combo pages; of 27 models, 23 alternatives
  pages repeat a neighbour's list and are merged, 4 are queued.
- Hub: new "Alternatives to popular models" section.
- Templates can be turned off without a deploy (KV "guides-disabled"):
  `node scripts/live-site/guide-templates.mjs --disable combo` (and
  `--enable`). Without arguments, or with a Search Console Pages.csv, the
  script reports pages, impressions, clicks, CTR, position and pages with no
  impressions per template. /guides/pages.json now lists each page's template.
- Hand-written intros: `docs/seo/live-site/intros.js` (path → text), shown
  above the generated summary as "From the shop". Empty until the shop fills it.
- Guide data is rebuilt at least every 5 minutes, so KV changes (pruning,
  templates) apply without a price change.

## 2026-11-21: ranking without backlinks (low-competition pages + GSC loop)
- 8 buying-advice articles under /learn/ (articles.js): processor
  generations, how much RAM, 256 vs 512 GB SSD, used-laptop checklist,
  ThinkPad / EliteBook / Latitude models explained, touchscreen worth it.
  Each answers the question in the first paragraph and uses live numbers
  (price premiums measured within the same model). Gates: 600+ words, 3+
  FAQs, 5+ internal links; FAQPage schema; listed under "Buying advice" on
  /guides; /learn redirects to /guides.
- Search Console loop: scripts/live-site/gsc-page-gaps.mjs (one page's
  missing queries and positions 10–30, with where to add each) and
  scripts/live-site/page-additions.mjs (pushes docs/seo/live-site/
  additions.json to KV "guides-additions": extra sections and FAQ entries,
  no deploy). Routine in docs/seo/gsc-loop.md.
- IndexNow is pinged automatically when new guide pages are released.
- Backlink plan with 10 targets: docs/seo/backlinks.md.
- Fixed the student page FAQ ("Which laptops for student … has" →
  "Which student laptop under KSh 40,000 has").
- Guide call to action no longer names M-Pesa or card (until Paystack is
  back).

## 2026-11-21: local SEO, 30-day plan (see docs/seo/local-30-days.md)
- Address spelled one way everywhere: "Iconic Business Centre, T12" in the
  footer and contact page → "Techmart Iconic Business Plaza, 3rd Floor, Room
  T12, Moi Avenue, Nairobi CBD" (matches the structured data).
- Phones: tap-to-call button above the WhatsApp button (GA event
  `call_click`).
- Outside Mon–Sat 9am–7pm (Nairobi): a dismissible "Closed now · opens …"
  note pointing to WhatsApp.
- /review (and /reviews): 302 to the Google Business Profile (REVIEW_URL;
  swap in the profile's direct review link).
- Owner pack: Google Business Profile categories, description, services,
  review request messages, WhatsApp away/greeting messages, missed-call
  auto-reply, AI-recommendation checklist; city pages only with real
  per-town delivery facts (to avoid doorway pages).

## 2026-11-22: Brian Dean playbook (see docs/seo/skyscraper-30-days.md)
- Flagship page /student-laptops-kenya (flagship.js): Agree–Promise–Preview
  opening; best laptop per course (business/law/medicine, computer science,
  engineering, design) with realistic budget caps; budget tiers from KSh
  25,000; where extra money goes (measured same-model RAM premium); 5-minute
  pre-purchase check; 4 more FAQs. ~2,000 words, all from live stock.
- On-page checklist: scripts/live-site/onpage-check.mjs (title, URL, first
  100 words, H1, H2 variation, links near top, description). Fixes from its
  first run: keyword opener when a guide's intro lacked it ("Looking for the
  best laptops under KSh 25,000 in Kenya?"), keyword in directory-page H2s,
  "Best" in the gaming and design titles, keyword-first article intros.
  87 of 89 guides pass (2 deliberate exceptions).
- "Related:" links near the top of every guide.
- Outbound links to Microsoft (Windows 11 requirements, Windows 10 end of
  support) where the articles cite them.
- additions.json can now set a page's title and description (CTR tests,
  with a "since" date).

## 2026-11-22: Glossary playbook
- /learn/laptop-terms-explained: 39 laptop terms in plain English, grouped
  (processor, memory and storage, screen, graphics, business features,
  buying terms), with live stock counts and prices where the catalogue has
  the data, and links to the guide where each term matters. One page, not
  a thin page per term (the skip reason says so in /guides/pages.json).
- Check: every URL used by the 90 published guides (329, including all
  links in their content) returns 200.

## 2026-11-27: "Indexed, though blocked by robots.txt"
- robots.txt now blocks only /admin. Cart, checkout, account, wishlist,
  compare, track-order and cart-action URLs are crawlable so Google can read
  their noindex and drop them (a robots block hides the noindex).
- Added X-Robots-Tag noindex to /item/compare, /wishlist(s), /track-order,
  /subscriber, /currency and /language responses (they had none).

## 2026-11-27: master brief, batch 1 (see docs/seo/question-map.md)
- robots.txt: Content-Signal: search=yes, ai-input=yes, ai-train=yes.
- 7 new pages: /learn/laptop-buying-guide-kenya (pillar),
  /learn/refurbished-vs-used-laptops-kenya, /learn/core-i3-vs-i5-vs-i7-vs-ryzen,
  /learn/gaming-laptop-guide-kenya, /learn/laptop-battery-and-overheating-fixes,
  /learn/laptop-upgrade-ram-ssd, /laptops/macbook-price-kenya (commercial;
  MacBooks only, live prices). All with FAQs, FAQPage + breadcrumb schema,
  sitemap, related links near the top, live stock data where it applies.
- FAQs added without a deploy (additions.json): Chromebook, high school and
  online classes on /student-laptops-kenya; Excel/accounting on
  /best/business-laptops-kenya.
- Question map: 94 of 100 questions answered on live pages; 6 not, with
  reasons (no ASUS/Acer stock, no verified repair prices, repairs and
  new-vs-used condition not confirmed by the shop).
- Articles without stock-dependent data now also require 50+ laptops in
  stock (thin-catalogue safety); model-page test keys on the template.

## 2026-11-27: second 100 questions (see docs/seo/question-map-2.md)
- 7 new pages: /learn/best-laptop-for-your-profession-kenya (accountants,
  lawyers, marketers, developers, designers; live picks with price caps),
  /learn/best-laptops-for-autocad-and-revit-kenya (Windows laptops with
  16 GB+ and a dedicated GPU, cheapest first; Autodesk requirements),
  /learn/macbook-buying-guide-kenya, /learn/windows-11-and-laptop-software-kenya
  (live Windows 11 Pro and Office 2021 prices from the catalogue),
  /learn/laptop-screen-and-build-quality-guide, /learn/laptop-accessories-guide-kenya
  (monitors, mice, arms and UPS in stock; no universal-compatibility claims),
  /learn/buying-a-laptop-safely-kenya (M-Pesa safety, warranty, serial checks;
  states only verified ECB facts).
- 29 FAQs and one section added to 9 existing pages via additions.json.
- Articles can now use the whole catalogue (actx.P), not only laptops.
- 96 of 100 questions answered; 4 not published (prices of parts the shop
  doesn't stock: RAM, SSD, battery, charger).

## 2026-11-27: third 100 questions (see docs/seo/question-map-3.md)
- 8 new pages: /learn/best-value-laptops-kenya (live budget bands and
  specs-per-shilling ranking), /learn/laptop-slow-freezing-not-charging-fixes,
  /learn/laptop-security-guide-kenya (Defender, encryption, remote-access
  scams; security software in stock), /learn/laptop-wifi-and-internet-guide,
  /learn/laptops-for-small-business-kenya (accounts, QuickBooks, POS,
  meetings, team buying, laptops vs desktops; live picks),
  /learn/business-vs-consumer-laptops, /learn/laptop-maintenance-guide,
  /learn/laptop-ports-explained (projectors and wireless printers in stock).
- 15 FAQs added to 7 existing pages (additions.json).
- 100 of 100 questions answered on live pages; 30 /learn pages in total.

## 2026-11-27: fourth 100 questions (see docs/seo/question-map-4.md, content-map.md)
- 6 new pages: /learn/laptop-requirements-video-photo-editing-3d (Adobe and
  Blender requirements; RTX and Apple-chip picks; points to the existing
  /best design and video list, which keeps the "best laptop for video
  editing" intent), /learn/laptop-charger-and-battery-guide,
  /learn/check-if-laptop-is-genuine, /learn/laptops-for-engineering-data-and-programming-software
  (SolidWorks, MATLAB, SPSS, Python/ML, Android Studio, VMs, SketchUp, music,
  web), /learn/laptop-product-families-explained (live counts per family),
  /learn/business-laptop-procurement-kenya (TCO, spares, replacement cycle,
  WhatsApp quote link; no invented discounts).
- Expanded: screens (refresh rate, OLED vs IPS, screen replacement),
  upgrades (CPU/GPU limits, shared memory, dual channel, NVMe), Windows
  (dual boot, Windows Hello, Android apps), small business (Teams, Zoom),
  student page (accounting and nursing named; KCSE FAQ).
- Master index of all 400 questions: docs/seo/content-map.md (390 answered).

## 2026-11-27: fifth 100 questions (see docs/seo/question-map-5.md)
- 8 new pages: /learn/ai-pc-npu-and-snapdragon-laptops (NPUs, Copilot+,
  Core vs Core Ultra naming, ARM vs x86, Windows on ARM; Core Ultra,
  Snapdragon, Core 5/7 and Ryzen PRO in stock), /learn/laptop-performance-guide,
  /learn/laptop-graphics-cards-explained (power-limit caveat; RTX in stock),
  /learn/laptop-storage-backup-and-recovery, /learn/windows-11-home-vs-pro
  (erase warnings; live Windows 11 Pro price), /learn/laptop-webcam-microphone-and-audio-guide,
  /learn/laptop-hardware-problems-and-inspection, /learn/work-from-home-laptop-setup.
- Expanded: best value (KSh 100–120k band, live "on offer" section from
  catalogue names only, tight-budget and older-premium sections, live
  60k/120k FAQs); procurement (finance teams, warranties, endpoint
  management, data theft, procurement policy, replacement budgeting).
- Redirect: /learn/windows-11-home-vs-pro-and-reset-guide → /learn/windows-11-home-vs-pro
  (renamed on publication day).
- Master map: 490 of 500 questions answered.
