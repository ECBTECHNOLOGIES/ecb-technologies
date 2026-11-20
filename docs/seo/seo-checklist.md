# SEO checklist: status for www.ecbtechkenya.com

Audited 20 November 2026: all sitemap pages, all 2,944 internal links, and
structured data on 133 sample pages. Audit scripts are in the session
scratchpad; the checks that repeat are in `scripts/live-site/`.

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Fix indexing issues | Done | All sitemap URLs return 200, are indexable, self-canonical. Terms and Privacy noindexed (template text, see below). |
| 2 | Breadcrumbs | Done | Visible trail + BreadcrumbList on every page except the homepage (correct). |
| 3 | Canonical tags | Done | Every page self-canonical; duplicate listings point to the kept copy. |
| 4 | Core Web Vitals | Passing | Throttled mobile test: LCP 1.1–1.6 s, CLS 0, blocking time ≤ 350 ms (home). |
| 5 | Orphan pages | Done | 0 orphans. Product pages now link 6 similar-price products in their category. |
| 6 | Schema markup | Done | Product/Offer, FAQPage, BreadcrumbList, ItemList, CollectionPage, Dataset, ElectronicsStore. |
| 7 | Heading structure | Done | One H1 per page; first heading is the H1; product, category and modal headings re-levelled (same look). |
| 8 | Original content | Done | Guides, research and the HP/Dell/Lenovo page are built from the live catalogue (own data). |
| 9 | Duplicate content | Done | 0 duplicate titles and descriptions; duplicate listings (incl. trimmed-name copies) get a canonical. |
| 10 | High-quality backlinks | Owner | Needs outreach: suppliers, Kenyan tech blogs, student unions, directories. Share the /research pages (citable data). |
| 11 | Clean, descriptive URLs | Done | Guides use readable paths; product slugs come from the shop (with an ID suffix, kept: changing them would break links). |
| 12 | Broken links and 404s | Done | Internal links: all 200 (the only exceptions are cart/AJAX links blocked in robots.txt). Stale comparison-page link fixed. |
| 13 | JS content crawlable | Done | All content is in the server HTML; nothing important is added by JavaScript. |
| 14 | Keyword cannibalization | Done | One page per keyword cluster (`keyword-map.mjs`: 53 mapped, 0 broken); guide generator rejects reused keywords and >60% overlap. |
| 15 | Mobile friendly | Done | Viewport set, no horizontal scroll at 390 px. |
| 16 | Author / E-E-A-T | Done | Guides: "By ECB Technologies" byline, "About this guide" box, author in schema, published ranking formula, shop address. |
| 17 | Titles 50–60 characters | Done | Max 60; short product titles now include the price. A few short guide/legal titles stay (padding would be filler). |
| 18 | Unique meta descriptions | Done | All unique, none over 160 characters, none empty. |
| 19 | Merge thin/overlapping pages | Done | Guide quality gates; near-duplicates 301 to the kept page; pruning script for pages with no impressions after 90 days. |
| 20 | Image optimization and alt text | Done | Resized via Cloudflare, lazy-loaded below the fold, alt text on all images. |
| 21 | Match search intent | Done | Keyword map assigns an intent to each cluster and page type. |
| 22 | High-volume, low-KD keywords | Owner / tool | Needs a keyword tool (Semrush, Ahrefs, Google Keyword Planner). Add finds to `keyword-map.js`. |
| 23 | Internal links to important pages | Done | Footer, hubs, guides, Related guides, similar products. |
| 24 | Comparison / alternatives pages | Done | /compare/* guides and /hp-vs-dell-vs-lenovo-laptops-kenya (live data). |
| 25 | Best listicles | Done | /best/* guides, ranked by a published spec score. |
| 26 | Topic clusters / pillars | Done | /guides hub → series and brand pillars → model, combo and comparison pages. |
| 27 | Google Business Profile | Owner | A profile exists (linked in the site's schema). Keep hours, photos and the website link current; ask buyers for reviews. |
| 28 | Monitor losing pages | Script | `node scripts/live-site/gsc-opportunities.mjs Pages.csv` (Compare export). |
| 29 | Validate schema (Rich Results Test) | Done (offline) | 133 pages checked for required fields. Spot-check a product and a guide in Google's tool. |
| 30 | dateModified on refresh | Done | Set from the catalogue's last change on every page. |
| 31 | Update page-2 pages | Script | List 2 of `gsc-opportunities.mjs`. |
| 32 | Sitemap in Bing and GSC | Done / owner | IndexNow submitted (Bing and Yandex). Owner: add the site in Bing Webmaster Tools (import from GSC) and submit `/sitemap.xml`. |
| 33 | robots.txt and noindex | Done | robots.txt blocks only cart, account and AJAX paths; noindex only on Terms, Privacy and filtered/empty listings. |
| 34 | High impressions, low CTR | Script | List 1 of `gsc-opportunities.mjs`. |
| 35 | site: search for cut-off titles | Done | No title is over 60 characters, so none is cut off for length. |
| 36 | "People also ask" FAQ pages | Partly | Every product, guide and the shop page has an FAQ. Use list 4 of `gsc-opportunities.mjs` (real searches) to add more. |

## Found during the audit (owner / host)

1. **Debug mode is on** (`APP_DEBUG=true` in the shop's `.env`). Any server
   error printed a full stack trace with server paths. The Worker now replaces
   these with a plain error page, but the setting should be turned off on the
   server: set `APP_DEBUG=false` and run `php artisan config:clear`.
2. **Terms and Privacy are the software's template** ("Genius Shop", dated
   8-24-2024). Replace them with ECB's own text in the admin (Pages); then
   remove `terms|privacy` from the noindex rule in the Worker and from
   `SKIP_PAGES` in the sitemap Worker.
3. **"Buy / Return Policy" tab is empty** on product pages. Add the return
   and warranty policy in the admin.
4. **Facebook Pixel ID is wrong**: the pixel uses `UA-137437974-1`, a Google
   Analytics ID, so it tracks nothing. Put the real Pixel ID in the admin.
5. **Cross-sell endpoint errors** (`/item/show/cross/products/<id>`: missing
   view `includes.cross_product`). Nothing on the site calls it, so shoppers
   aren't affected; restoring the theme file would fix it.
