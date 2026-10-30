# ECB Technologies SEO Audit: Pass 1 (Code-Level)

Date: 2026-10-30
Scope: the Next.js storefront in this repository. The live site, Search
Console, analytics, Google Business Profile and the WooCommerce catalogue
could **not** be reached from the audit environment. Everything below comes
from the source code, and nothing here describes live search performance.

Labels: **VERIFIED** (confirmed in code or first-party config) · **TESTED**
(exercised on a local production build against a mocked catalogue) ·
**PROPOSED** · **ASSUMPTION** · **UNKNOWN**.

---

## 1. Business facts (source of truth: `lib/business.js`)

| Fact | Value | Status |
|---|---|---|
| Name | ECB Technologies | VERIFIED |
| Canonical domain | https://www.ecbtechkenya.com (`metadataBase`, sitemap, robots) | VERIFIED in code. Apex → www redirect is UNKNOWN |
| Shop address | Iconic Business Plaza, Moi Avenue, Nairobi (CBD) | VERIFIED (checkout pickup address) |
| Phone / WhatsApp | 0717 040 531 / +254717040531 | VERIFIED. Whether WhatsApp is monitored is UNKNOWN |
| Email | ecbtechnologies001@gmail.com | VERIFIED |
| Hours | Mon–Fri 8am–5:30pm, Sat–Sun & public holidays 8am–12pm | VERIFIED as *pickup* hours. **Owner must confirm they are the shop's opening hours and match GBP** |
| Payment | M-Pesa, debit/credit card | VERIFIED (checkout) |
| Delivery | Countrywide flat rates per town (`lib/shipping-rates.json`), free store pickup | VERIFIED |
| Warranty terms | Not published anywhere in the code | UNKNOWN |
| Returns/refund policy | No policy page exists | UNKNOWN |
| Product condition | Variable products carry a "Condition" attribute (e.g. "Brand New"; other values exist) | VERIFIED that the attribute exists. Values per product are UNKNOWN |
| Building floor / shop number, GPS coordinates | Not in code | UNKNOWN |
| Analytics / Search Console / Merchant Center | No GA4, GTM, Meta pixel or verification tags in the code | VERIFIED absent from code. Could exist via DNS or Vercel; UNKNOWN |

Before this pass, the site described the business inconsistently. The footer
said only "Nairobi, Kenya", the contact page left out Moi Avenue, and the hero
claimed "Nairobi's #1 Tech Store", which nothing substantiates. All of these
now read from `lib/business.js`.

## 2. Changes made in this pass

| # | Change | Files | Priority | Status |
|---|---|---|---|---|
| 1 | Single NAP source, used by the footer, contact page, checkout, pickup selector and JSON-LD | `lib/business.js`, `components/Footer.jsx`, `app/contact/page.jsx`, `app/checkout/page.jsx`, `components/TownSelect.jsx` | P0 | TESTED |
| 2 | Site JSON-LD: `WebSite` + `ElectronicsStore` (address, phone, hours, payment, area served). This replaces the bare `Organization` block. JSON-LD is now escaped against `</script>` injection | `app/layout.tsx` | P1 | TESTED |
| 3 | Title template (`%s \| ECB Technologies`), a Nairobi-CBD default title and description, and Open Graph defaults (`en_KE`) | `app/layout.tsx` | P1 | TESTED |
| 4 | Product pages: `"<Product> Price in Kenya"` title, a description that falls back from short description to long description to a price, location and delivery sentence, a self-canonical, and an `og:image` | `app/products/[slug]/page.jsx` | P1 | TESTED |
| 5 | Product pages: `Product` JSON-LD (brand, SKU, images, `Offer`/`AggregateOffer` in KES, availability from WooCommerce stock status, `AggregateRating` only when WooCommerce has real ratings) plus `BreadcrumbList` matching the visible breadcrumb | `app/products/[slug]/page.jsx` | P1 | TESTED (validate on the live site with the Rich Results Test) |
| 6 | Product pages: a product-specific **WhatsApp enquiry** link (prefilled with the product name and URL), a call button, and a pickup, delivery and payment strip | `app/products/[slug]/page.jsx` | P1 | TESTED |
| 7 | Listing pages (`/products`): a distinct title and description per category and for Deals; a canonical for each category, Deals and page; **noindex,follow** for search, price-range and sort URLs, canonicalised to the base listing | `app/products/page.jsx` | P1 | TESTED |
| 8 | Bug: subcategory listings (e.g. brand or Student Deals categories) rendered the H1 "All Products" because the lookup only searched top-level categories. They now show the real category name | `app/products/page.jsx` | P1 | TESTED |
| 9 | The WooCommerce category description, when the owner has written one, now appears under the category H1 on page 1 | `app/products/page.jsx` | P2 | TESTED |
| 10 | Bug: `?page=abc` produced `NaN` pagination. Page numbers are now clamped | `app/products/page.jsx` | P2 | TESTED |
| 11 | Sitemap now includes every non-empty category, subcategories included (previously top level only), plus Deals | `app/sitemap.ts` | P1 | TESTED |
| 12 | Legacy URLs: `/product/<slug>/` (old WooCommerce product permalinks, which previously returned 404) now 308-redirect to `/products/<slug>`. Unmapped `/product-category/<…>/<slug>/` URLs resolve to their real category instead of the unfiltered catalogue | `next.config.ts`, `app/product-category/[...slug]/route.js` | P0 | TESTED. ASSUMPTION: the old product base was the WooCommerce default `/product/` |
| 13 | `noindex,follow` and titles on cart, checkout and track-order | `app/{cart,checkout,track-order}/layout.jsx` | P2 | TESTED |
| 14 | Hero badge "Nairobi's #1 Tech Store" (unsubstantiated) replaced with "Electronics Shop · Moi Avenue, Nairobi CBD" | `components/Hero.jsx` | P1 | TESTED |

`robots.txt` was **not** changed.

## 3. Findings not yet fixed (need owner input or live access)

| Finding | Why it matters | Next action | Priority |
|---|---|---|---|
| Confirm the shop's opening hours match the pickup hours and GBP | The LocalBusiness markup and footer now show these hours, and mismatches erode trust | Owner confirms, or edits `BUSINESS.hoursDisplay`/`openingHours` | P0 |
| No warranty, returns or delivery-timeline policy pages | These are the buyer's main trust questions. They are also needed for Merchant Center and for `shippingDetails`/`hasMerchantReturnPolicy` markup | Owner supplies real terms, then we build `/warranty`, `/returns` and `/delivery` | P1 |
| No analytics or conversion tracking in the code | There is no baseline and no way to attribute WhatsApp, call or purchase events | Owner supplies a GA4 property (or confirms an existing one), then we add events for `whatsapp_click`, `call_click`, `add_to_cart`, `begin_checkout` and `purchase` | P0 |
| Search Console and Merchant Center access unknown | Needed for the indexing baseline and free listings | Owner grants access. A product feed can be generated from the same WooCommerce data once policies exist | P1 |
| Category URLs are query strings (`/products?category=272`) | They work and are now canonicalised, but clean paths (`/laptops`, `/laptops/hp`) are stronger and more shareable | PROPOSED: migrate to slug paths with 308s from the query URLs. This needs a decision, because it changes every category URL | P2 |
| Category names drive titles (e.g. a subcategory named "HP" gives the title "HP - Prices in Kenya") | Titles are less specific than they could be | Owner renames brand subcategories in WooCommerce to "HP Laptops", "Samsung Phones" and so on, and writes a 1–2 sentence description per category (it now renders automatically) | P1 |
| Home page H1 "Tech That Moves With You" contains no category or location terms | Weak relevance signal for the home page | PROPOSED, for example "Laptops, Phones & Accessories in Nairobi CBD". Brand and design decision | P2 |
| Product catalogue integrity (zero prices, duplicates, missing brands or specs, condition values) | Inaccurate prices are a P0 risk | Needs read access to the WooCommerce catalogue. `scripts/` has a pattern for such audits | P0 |
| Image alt text falls back to the product name when WooCommerce has none | Acceptable, but not descriptive | Fill alt text in WooCommerce for the top products | P3 |
| Hero image is generic Unsplash stock | It misses the chance to show the real shop | Owner supplies real store photos (also needed for GBP) | P3 |
| Keyword research, competitor gap analysis, AI-visibility benchmark | Required by the playbook. None can be done credibly without live SERP access or tools | Run with Search Console data and a keyword tool. Do not estimate volumes | P1 |

## 4. Verification checklist after deploy

1. Rich Results Test on 3 products (simple, variable, out of stock): the Product and Breadcrumb markup has no errors, and the price and availability match the page.
2. `curl -I https://www.ecbtechkenya.com/product/<old-slug>/` returns 308 → `/products/<slug>` → 200.
3. Fetch `/products?category=<id>&orderby=price` and check that the page has `noindex` and a canonical of `?category=<id>`.
4. Submit the sitemap in Search Console. Over the following weeks, track indexed product and category counts.
5. Tap "Ask on WhatsApp" on mobile and check that the prefilled message opens in the WhatsApp chat.
