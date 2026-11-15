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
