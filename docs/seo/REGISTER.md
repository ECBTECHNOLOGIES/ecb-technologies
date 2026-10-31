# SEO Implementation Register

The running record of SEO work on this codebase. Update it at the end of
every batch. Status values: **DONE** (implemented and tested on a local
production build against a mock catalogue), **BLOCKED** (waiting on access
or owner input), **TODO**.

Last updated: 2026-10-30

## 0. Decision update (2026-10-31): keep the live site

The live ecbtechkenya.com is a custom shop system (not WordPress) with
Agent Login and Rider Login, and **the shop uses it daily**. Replacing it
with this Next.js store would break operations, so **the domain switch is
cancelled**. SEO fixes for the live site are specified, ready for its
developer, in `docs/seo/LIVE-SITE-SEO-FIXES.md`.

Findings from the DNS check (Cloudflare):
- Every record points to `217.20.120.93`.
- There are no `wp`/`api` records, so the WooCommerce backend this repo
  reads from is unreachable. That's why the Vercel build shows no products.
- `app.ecbtechkenya.com` serves a "We shall be back soon" holding page.
- The `mail`/`smtp`/`pop`/`ftp` records are Proxied, which breaks email.
  They should be DNS only.
- The live site states Mon–Sat 9:00–19:00, but the owner told us "daily
  9–7". Confirm and align.

This repo stays as a reference implementation. The sections below
describe it, not the live site.

## 0b. (Superseded) Earlier finding: the live domain serves a different website

The audit on 2026-10-30 found that **ecbtechkenya.com does not serve this
codebase.** It serves a separate site, with a "Premium Laptops That Fits Your
Purpose" slider, account/wishlist/compare icons, `/assets/images/` URLs, no
canonical, no JSON-LD and no sitemap. None of the work below affects the
live site until one of the following happens:

- **A.** Point `ecbtechkenya.com` and `www.ecbtechkenya.com` at this
  Next.js app in Cloudflare, with the apex domain 301-redirecting to
  `www`; or
- **B.** Give access to the live site's own code or CMS, so the fixes can
  be applied there.

**Owner decision (2026-10-30): A.** Replace the current live site with
this store. The plan, in order:

1. Already done: Vercel deploys this repo on every push to `main`, at
   https://ecb-technologies-five.vercel.app (confirmed from GitHub
   deployment statuses on 2026-10-30). Cloudflare only manages the DNS.
2. Test on the preview: catalogue, product pages, cart, checkout with a
   real M-Pesa or card payment, and order tracking.
3. Show the owner the preview and get explicit approval.
4. Switch: in Vercel → Domains, add `www.ecbtechkenya.com` and
   `ecbtechkenya.com` (redirecting to www). In Cloudflare DNS, point `www`
   (CNAME `cname.vercel-dns.com`) and `@` (A `76.76.21.21`) at Vercel as
   "DNS only". Leave `api` and the MX records alone. Note the old site's settings first, so switching back
   is possible.
5. Resubmit `/sitemap.xml` in Search Console and re-run the Ahrefs checks
   on the live URL.

**BLOCKER (2026-10-30): do not switch the domain yet.** The Vercel build
renders, but with no products and a broken logo, so it cannot reach the
WooCommerce backend (`NEXT_PUBLIC_WP_URL`, which serves the logo too). The
current live site appears to run its own catalogue (images under
`/assets/images/`, not WordPress). Products are managed by a third party;
the owner is asking them:

1. Which system holds the product catalogue now: WooCommerce at
   `api.ecbtechkenya.com`, or the current live site's own admin?
2. If WooCommerce: is it still running and up to date, and are valid
   REST API keys and `NEXT_PUBLIC_WP_URL` set in the Vercel project?
3. If the live site's own system: what platform is it, and does it have
   a product API? This store would need a new data connector for it.

Access this needs in the cloud environment settings (the owner adds
these; never paste them into chat):

- Allowed domains: `api.ecbtechkenya.com`, `ecbtechkenya.com`,
  `www.ecbtechkenya.com`, `api.cloudflare.com`, `workers.dev`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `NEXT_PUBLIC_WP_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`,
  `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

Until the switch, the status here means "done in this codebase", not
"live".

## 1. Batch log

| # | Task | Component | Status | Validation |
|---|---|---|---|---|
| 1 | Consistent business details; ElectronicsStore and WebSite JSON-LD | `lib/business.js`, `app/layout.tsx` | DONE | Rendered JSON-LD checked |
| 2 | Canonicals; noindex on filter, sort and search URLs; per-category titles | `app/products/page.jsx` | DONE | Canonical and robots checked per URL |
| 3 | Product and BreadcrumbList JSON-LD; specifications as `additionalProperty` | `app/products/[slug]/page.jsx` | DONE | JSON-LD parsed |
| 4 | Legacy WordPress redirects (`/product/*`, `/product-category/*`, old sitemaps) | `next.config.ts`, `app/product-category` | DONE | 308 redirects followed |
| 5 | Titles ≤60 characters, descriptions ≤160, one H1 per page | `lib/seo.js` | DONE | Automated audit of 7 page types |
| 6 | Full Open Graph and Twitter card tags; 1200×630 share image | `lib/seo.js`, `public/og.png` | DONE | Automated audit |
| 7 | Image alt text on the site (WooCommerce alt, else product name, numbered) | `lib/utils.js` `imageAlt` | DONE | 0 images without alt |
| 8 | Fill missing alt text in WooCommerce itself | `scripts/fill-image-alt-text.mjs` | BLOCKED: owner runs it | Dry run tested on mock |
| 9 | Sitemap index plus pages, categories and products sitemaps (with image entries); 503 instead of an empty sitemap if WooCommerce fails | `lib/sitemaps.js`, `app/sitemap.xml`, `app/sitemaps/*` | DONE | XML well-formed, 200s |
| 10 | Delivery page: 146 towns and fees from the courier tariff, with FAQ | `app/delivery`, `lib/delivery.js` | DONE | 146 rows rendered |
| 11 | Product specifications table and fact-only product FAQ | `lib/product-content.js` | DONE | Rendered on mock product |
| 12 | Catalogue export with issue flags | `scripts/export-catalogue.mjs` | BLOCKED: owner runs it | Tested on mock |
| 13 | Redesign (single-accent design system) | site-wide | DONE | Screenshots at desktop and 390px; no horizontal overflow |

## 2. Deliberately not done, and why

| Item | Reason |
|---|---|
| FAQPage schema | Google limits FAQ rich results to authoritative government and health sites. The FAQs are visible on the page but carry no FAQPage markup. |
| Warranty, returns and delivery-time claims | Not verified. Never invent them. Waiting on the owner's policy terms. |
| 47 county pages | Would be doorway pages. One delivery page covers every town actually served. County pages only where real demand and unique content exist (needs Search Console data). |
| Separate `/brands/*` pages | Brand subcategories (HP, Lenovo, …) already exist as category pages. Duplicate brand pages would compete with them. Revisit after the catalogue export. |
| Price, spec, use-case and listicle page families | Need the real catalogue to check that each page has enough in-stock products. Build after the catalogue export (§3). |
| Published/modified dates, hreflang | Not applicable to shop pages on a single-language site. |

## 3. Next batches (in order)

1. **Owner:** resolve §0, then run the following and share the CSV:
   - `node --env-file=.env.local scripts/export-catalogue.mjs`
   - `node --env-file=.env.local scripts/fill-image-alt-text.mjs --apply`
2. Catalogue issue register from the CSV: zero prices, duplicates, missing brands, thin descriptions, missing specs.
3. Clean category URLs (`/laptops`, `/laptops/hp`) with 308s from `?category=`. Needs owner approval.
4. Data-driven page families gated by inventory thresholds (spec, price band, use-case), plus ItemList and CollectionPage markup.
5. Policy pages (warranty, returns) once terms are supplied, then `hasMerchantReturnPolicy` and `shippingDetails` markup and a Merchant Center feed.
6. Search Console, GA4 and Merchant Center access to set baselines and build the keyword-to-URL map from real queries.
