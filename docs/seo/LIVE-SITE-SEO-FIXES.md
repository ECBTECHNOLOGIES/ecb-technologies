# SEO fixes for the live site (ecbtechkenya.com)

**For:** the developer who maintains the live ECB Technologies website (the
custom shop with Agent Login and Rider Login).
**From:** the ECB SEO work, 2026-10-31.
**Why:** an Ahrefs audit of https://ecbtechkenya.com found missing or broken
basics that stop Google (and AI search) from understanding and showing the
shop. Everything below is standard HTML in the page `<head>` plus two XML
files. No change to how orders, agents or riders work.

Each item says what to change and how to check it. The business details
below are verified (Google Business Profile and the owner). Use them exactly.

---

## 1. Page title: ≤ 60 characters (currently 101)

Current: `ECB Technologies | High Quality , Genuine and Affordable Laptops, Phones ,Accessories & More in Kenya`

| Page | `<title>` |
|---|---|
| Home | `Laptops & Phones Shop in Nairobi CBD \| ECB Technologies` |
| Category | `{Category name} Prices in Kenya \| ECB Technologies` (e.g. `Laptops Prices in Kenya \| ECB Technologies`) |
| Brand | `{Brand} {Category} in Kenya \| ECB Technologies` (e.g. `HP Laptops in Kenya \| ECB Technologies`) |
| Product | `{Product name} Price in Kenya`. Add ` \| ECB Technologies` only if the total stays ≤ 60 characters. If the name alone is over 60, use just the name. |
| Contact | `Contact & Shop Location, Moi Avenue Nairobi \| ECB Technologies` |

Every page needs a **different** title.

## 2. Meta description: required on every page (currently missing)

Keep it to 160 characters or fewer, unique per page.

```html
<meta name="description" content="Laptops, phones and accessories at Techmart Iconic Business Plaza, Moi Avenue, Nairobi CBD. Pay by M-Pesa or card. Store pickup or delivery across Kenya.">
```

- **Products:** the first ~155 characters of the product's short
  description, with HTML stripped. If it's empty, use: `Buy {name} for
  KSh {price} at ECB Technologies, Moi Avenue, Nairobi CBD. M-Pesa or card,
  store pickup or delivery across Kenya.`
- **Categories:** the category description, or `Shop {category} at ECB
  Technologies, Moi Avenue, Nairobi CBD. Prices in KSh, M-Pesa or card,
  delivery across Kenya.`

## 3. Canonical URL: required on every page (currently missing)

```html
<link rel="canonical" href="https://www.ecbtechkenya.com/{clean path}">
```

- Use one host everywhere: pick `https://www.ecbtechkenya.com` or
  `https://ecbtechkenya.com`, and 301-redirect the other to it.
- Product and category pages point to their own clean URL, without
  tracking or sort parameters.
- Pages with **search, sort or price-filter parameters** (e.g.
  `?sort=`, `?min_price=`, `?q=`) get
  `<meta name="robots" content="noindex, follow">`, with a canonical
  pointing to the unfiltered category.
- Account, cart, checkout, wishlist, compare, agent and rider pages get
  `<meta name="robots" content="noindex, nofollow">`.

## 4. One H1 per page (the homepage currently has two)

Each hero slider slide uses an `<h1>` ("Premium Laptops That Fits Your
Purpose", "High Quality Gadgets").

- Change the slide headings to `<p>` or `<h2>`.
- Give the homepage one real H1, e.g.
  `<h1>Laptops, Phones & Accessories in Nairobi CBD</h1>` (it can be
  visually small).
- On product pages the H1 is the product name; on category pages it's the
  category name.

## 5. Social tags: Open Graph and X/Twitter (currently incomplete)

On every page:

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="ECB Technologies">
<meta property="og:locale" content="en_KE">
<meta property="og:url" content="{same as canonical}">
<meta property="og:title" content="{same as <title>}">
<meta property="og:description" content="{same as meta description}">
<meta property="og:image" content="{image URL}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{short description of the image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{same as <title>}">
<meta name="twitter:description" content="{same as meta description}">
<meta name="twitter:image" content="{image URL}">
```

- **Product pages:** use the main product photo as the image.
- **All other pages:** use a 1200×630 share image (currently the 200×50
  logo). A ready-made one is available here; download it and host it on
  the site, e.g. at `/og.png`:
  https://raw.githubusercontent.com/ECBTECHNOLOGIES/ecb-technologies/main/public/og.png

## 6. Structured data (JSON-LD): currently none

### 6a. On every page, once (in `<head>` or before `</body>`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.ecbtechkenya.com/#website",
      "name": "ECB Technologies",
      "url": "https://www.ecbtechkenya.com",
      "publisher": { "@id": "https://www.ecbtechkenya.com/#store" },
      "inLanguage": "en-KE"
    },
    {
      "@type": "ElectronicsStore",
      "@id": "https://www.ecbtechkenya.com/#store",
      "name": "ECB Technologies",
      "alternateName": "ECB Technologies Kenya",
      "url": "https://www.ecbtechkenya.com",
      "logo": "https://www.ecbtechkenya.com/assets/images/1789718740logopng.png",
      "telephone": "+254717040531",
      "email": "ecbtechnologies001@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue",
        "addressLocality": "Nairobi",
        "addressCountry": "KE"
      },
      "openingHoursSpecification": [{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      }],
      "paymentAccepted": "M-Pesa, Credit Card, Debit Card",
      "currenciesAccepted": "KES",
      "areaServed": { "@type": "Country", "name": "Kenya" },
      "sameAs": [
        "https://share.google/56ymLkB3i6DS0HHvJ"
      ]
    }
  ]
}
</script>
```

Two notes on the values above:
- **Opening hours:** the site's top bar says Mon–Sat 9:00–7:00. Make the
  JSON-LD, the top bar and the Google Business Profile all say the same
  thing. If the shop also opens on Sunday, add `"Sunday"`.
- **`sameAs`:** add the full URLs of the Instagram, TikTok, Facebook,
  YouTube and X profiles linked in the top bar.

### 6b. On every product page

Fill this from the product's real data. Only include fields you actually
have. Never invent a rating, SKU or stock status.

```html
<script type="application/ld+json">
[{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{product name}",
  "url": "{canonical URL}",
  "image": ["{photo 1 URL}", "{photo 2 URL}"],
  "description": "{plain-text short description}",
  "sku": "{sku, if set}",
  "brand": { "@type": "Brand", "name": "{brand}" },
  "category": "{category name}",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Processor", "value": "{e.g. Intel Core i5-8350U}" },
    { "@type": "PropertyValue", "name": "RAM", "value": "{e.g. 8GB}" }
  ],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "KES",
    "price": {current price as a number, no commas},
    "availability": "https://schema.org/InStock",
    "url": "{canonical URL}",
    "seller": { "@id": "https://www.ecbtechkenya.com/#store" }
  }
},{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecbtechkenya.com" },
    { "@type": "ListItem", "position": 2, "name": "{Category}", "item": "{category URL}" },
    { "@type": "ListItem", "position": 3, "name": "{product name}", "item": "{canonical URL}" }
  ]
}]
</script>
```

- **availability:** use `OutOfStock` when the product is sold out.
- **Products with options at different prices:** use
  `{"@type":"AggregateOffer","priceCurrency":"KES","lowPrice":…,"highPrice":…,"offerCount":…}`.
- **Ratings:** add `aggregateRating` only if the site shows real customer
  reviews on that page.

To check: paste a product URL into https://search.google.com/test/rich-results.
It should report "Product" and "Breadcrumbs" with no errors.

## 7. XML sitemap: currently not found

Serve a sitemap at `https://www.ecbtechkenya.com/sitemap.xml` listing every
indexable page, generated automatically from the database so new products
appear on their own. For example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.ecbtechkenya.com/</loc>
  </url>
  <url>
    <loc>https://www.ecbtechkenya.com/{product url}</loc>
    <lastmod>{product updated date, ISO 8601}</lastmod>
    <image:image><image:loc>{product photo URL}</image:loc></image:image>
  </url>
</urlset>
```

- Include the homepage, every category and brand page, every published
  product (with its photos), and the contact page.
- Exclude cart, account, checkout, wishlist, compare, agent and rider
  pages, and any search or filter URL.
- If there are more than about 5,000 URLs, split into several sitemaps
  under a sitemap index.

Then add this line to `robots.txt`:

```
Sitemap: https://www.ecbtechkenya.com/sitemap.xml
```

…and submit the sitemap in Google Search Console (Sitemaps → Add).

`robots.txt` should also block the private areas, without blocking CSS,
JS or images:

```
User-agent: *
Disallow: /cart
Disallow: /checkout
Disallow: /my-account
Disallow: /wishlist
Disallow: /compare
Disallow: /agent
Disallow: /rider
```

Adjust the paths to the site's real ones.

## 8. Image alt text

Every `<img>` needs a meaningful `alt` attribute:

- **Product photos:** the product name (e.g. `alt="HP EliteBook 840 G5 Core i5 8GB 256GB"`). For extra gallery photos, add ` - photo 2`, ` - photo 3`, and so on.
- **Category tiles:** the category name.
- **Logo:** `alt="ECB Technologies"`.
- **Purely decorative images:** `alt=""`.

Do not stuff keywords into alt text.

Also add `width` and `height` to images, and `loading="lazy"` for images
below the first screen.

## 9. Cloudflare DNS: email is likely broken (owner or helper, 2 minutes)

In Cloudflare → DNS, the `mail`, `smtp`, `pop` and `ftp` records are
"Proxied". Cloudflare can't proxy email or FTP, so any
@ecbtechkenya.com mailbox will not receive mail. Edit each of those four
records and set it to **DNS only** (grey cloud). Leave the website
records (`ecbtechkenya.com`, `www`) as they are.

---

## Checklist: done when Ahrefs shows

- [ ] Title 60 characters or fewer, unique per page
- [ ] Meta description present, 160 characters or fewer
- [ ] Canonical present and correct
- [ ] Exactly one H1
- [ ] Open Graph: og:type, og:url, og:title, og:description, og:image (1200×630)
- [ ] Twitter card: card, title, description, image
- [ ] Structured data: ElectronicsStore and WebSite on every page; Product and BreadcrumbList on product pages (Rich Results Test passes)
- [ ] Sitemap found (robots.txt `Sitemap:` line), submitted in Search Console
- [ ] All images have alt text

Not needed (Ahrefs lists these, but they don't apply to a single-language
shop): hreflang, and published/modified dates (those are for blog articles).
