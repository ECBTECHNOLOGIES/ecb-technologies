// SEO and conversion layer for the ecb-speed Worker (www.ecbtechkenya.com).
//
// Works on the HTML of public pages, after the speed changes:
// - one canonical URL per page (www, no tracking/sort/filter parameters)
// - structured data (JSON-LD): the store (ElectronicsStore) and WebSite with
//   site search on every page; Product + Offer + BreadcrumbList on products;
//   CollectionPage + ItemList + BreadcrumbList on categories
// - Open Graph / X cards with a proper 1200x630 share image
// - one H1 per page; a short "answer first" intro on the home page and on
//   category pages
// - category link in product breadcrumbs (internal links)
// - "Order on WhatsApp" on product pages and a WhatsApp chat button
// - main-menu links go to real category pages instead of search results
//
// Facts used are the shop's confirmed details (address, phone, hours,
// delivery, payment). Nothing about ratings, warranty or delivery fees is
// invented.

import { CATEGORIES, CATEGORY_OF } from "./catalog-map.js";

export const SITE = "https://www.ecbtechkenya.com";
const PHONE = "+254717040531";
const WHATSAPP = "254717040531";
const LOGO = `${SITE}/assets/images/1789718740logopng.png`;
export const SHARE_IMAGE = `${SITE}/ecb-assets/og.png`;
const ADDRESS = "Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, Nairobi CBD";

const BRANDS = [
  "HP", "Dell", "Lenovo", "Apple", "Samsung", "Acer", "Asus", "MSI", "Microsoft", "Xiaomi", "Redmi", "Kyocera",
  "Epson", "Canon", "Brother", "Logitech", "Gigabyte", "Infinix", "Tecno", "Itel", "Oppo", "Vivo", "Realme",
  "OnePlus", "Google", "Huawei", "Honor", "Nokia", "Sony", "JBL", "Anker", "Oraimo", "Hisense", "TCL", "LG",
  "Razer", "Alienware", "Toshiba", "Fujitsu", "Panasonic", "Xerox", "Sandisk", "Kingston", "Seagate",
  "Western Digital", "Transcend", "TP-Link", "Tenda", "Hikvision", "Dahua", "Nintendo", "PlayStation", "Xbox",
  "Meta", "Amazon", "Beats", "Bose", "Edifier", "Havit", "Zebra", "Pantum", "Ricoh", "AOC", "ViewSonic", "BenQ",
];

const STORE = {
  "@type": "ElectronicsStore",
  "@id": `${SITE}/#store`,
  name: "ECB Technologies",
  alternateName: "ECB Technologies Kenya",
  url: `${SITE}/`,
  logo: LOGO,
  image: SHARE_IMAGE,
  telephone: PHONE,
  email: "ecbtechnologies001@gmail.com",
  priceRange: "KSh",
  currenciesAccepted: "KES",
  paymentAccepted: "M-Pesa, Credit Card, Debit Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi County",
    addressCountry: "KE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  areaServed: { "@type": "Country", name: "Kenya" },
  sameAs: ["https://share.google/56ymLkB3i6DS0HHvJ"],
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: "ECB Technologies",
  url: `${SITE}/`,
  inLanguage: "en-KE",
  publisher: { "@id": `${SITE}/#store` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/category?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const KEEP_PARAMS = /^page$/i;

// Main-menu links that went to search results, and the category they mean.
export const NAV_FIXES = {
  [`${SITE}/category?search=phones`]: `${SITE}/category/smartphones`,
  [`${SITE}/category?search=gaming`]: `${SITE}/category/gaming`,
  [`${SITE}/category?search=printers`]: `${SITE}/category/printers`,
};

export function decode(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function canonicalFor(url, noindex) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const u = new URL(SITE + path);
  if (!noindex) for (const [k, v] of url.searchParams) if (KEEP_PARAMS.test(k)) u.searchParams.set(k, v);
  return u.toString();
}

function brandOf(name) {
  const lower = name.toLowerCase();
  for (const b of BRANDS) {
    const l = b.toLowerCase();
    if (lower === l || lower.startsWith(l + " ")) return b;
  }
  return null;
}

const abs = (u) => {
  try {
    return new URL(u, SITE + "/").toString();
  } catch {
    return null;
  }
};

export const whatsappLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Reads what the structured data and intros need from the page HTML.
export function extractSeo(html, url, base) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const canonical = canonicalFor(url, base.noindex);
  const out = { canonical, path, type: "page", graph: [STORE, WEBSITE] };
  const crumb = base.crumb;
  const title = base.title || decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
  const description = decode((html.match(/<meta name="description"\s+content="([^"]*)"/) || [])[1] || base.description || "");
  out.description = description;
  out.title = decode(title);
  out.h1Count = (html.match(/<h1[\s>]/g) || []).length;

  if (path === "/") {
    out.type = "home";
    return out;
  }

  if (path.startsWith("/item/")) {
    const slug = path.slice(6);
    const name = decode((html.match(/<h1 class="ecb-pd-name">([\s\S]*?)<\/h1>/) || [])[1]);
    const priceText = (html.match(/id="sizeprice">\s*([^<]+)</) || [])[1] || "";
    const price = Number(priceText.replace(/[^\d.]/g, "")) || null;
    const sku = decode((html.match(/ecb-pd-meta-label">SKU<\/span>\s*<span class="ecb-pd-meta-value">([^<]*)</) || [])[1]);
    const inStock = /ecb-pd-stock-badge--in/.test(html);
    const outStock = /ecb-pd-stock-badge--out/.test(html);
    const images = [...new Set([...html.matchAll(/class="ecb-pd-thumb[^"]*"\s+data-src="([^"]+)"/g)].map((m) => abs(m[1])))].filter(Boolean);
    const main = abs((html.match(/<img\s+id="ecbMainImg"\s+src="([^"]+)"/) || [])[1] || "");
    if (main && !images.includes(main)) images.unshift(main);
    const ci = CATEGORY_OF[slug];
    const category = ci !== undefined ? CATEGORIES[ci] : null;
    out.type = "product";
    out.product = { name, price, inStock, outStock, image: images[0] || null, category, slug };
    if (!name) return out;
    const brand = brandOf(name);
    const product = {
      "@type": "Product",
      "@id": `${canonical}#product`,
      name,
      url: canonical,
      description: description || undefined,
      image: images.length ? images.slice(0, 6) : undefined,
      sku: sku || undefined,
      brand: brand ? { "@type": "Brand", name: brand } : undefined,
      category: category ? category[1] : undefined,
    };
    if (price) {
      product.offers = {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "KES",
        price: String(price),
        availability: outStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        seller: { "@id": `${SITE}/#store` },
      };
    }
    const crumbs = [["Home", `${SITE}/`]];
    if (category) crumbs.push([category[1], `${SITE}/category/${category[0]}`]);
    crumbs.push([name, canonical]);
    out.graph.push(product, breadcrumbList(crumbs));
    return out;
  }

  if (path === "/category" || path.startsWith("/category/")) {
    const parts = path.split("/").slice(2);
    const cm = html.match(/class="ecb-cat-count">\s*(?:<strong>)?\s*(\d[\d,]*)/);
    const count = cm ? Number(cm[1].replace(/,/g, "")) : null;
    const items = [...new Set([...html.matchAll(/href="(https:\/\/www\.ecbtechkenya\.com\/item\/[A-Za-z0-9-]+)"/g)].map((m) => m[1]))]
      .filter((u) => !/\/item\/(compare|show)/.test(u))
      .slice(0, 30);
    const name = crumb || (parts.length ? parts[parts.length - 1].replace(/-/g, " ") : "All products");
    out.type = "category";
    out.category = { name, count, parts };
    const crumbs = [["Home", `${SITE}/`]];
    if (parts.length) {
      const top = CATEGORIES.find((c) => c[0].toLowerCase() === parts[0].toLowerCase());
      crumbs.push([top ? top[1] : parts[0].replace(/-/g, " "), `${SITE}/category/${parts[0]}`]);
      if (parts.length > 1) crumbs.push([name, canonical]);
    } else crumbs.push(["All products", `${SITE}/category`]);
    out.graph.push(
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: title,
        url: canonical,
        description: description || undefined,
        isPartOf: { "@id": `${SITE}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: count || items.length,
          itemListElement: items.map((u, i) => ({ "@type": "ListItem", position: i + 1, url: u })),
        },
      },
      breadcrumbList(crumbs)
    );
    return out;
  }

  if (crumb) out.graph.push(breadcrumbList([["Home", `${SITE}/`], [crumb, canonical]]));
  return out;
}

function breadcrumbList(crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
  };
}

export function jsonLdTag(graph) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

const WA_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.24-.27.53-.34.71-.34h.51c.16 0 .38-.06.6.46.24.55.79 1.89.86 2.03.07.14.11.3.02.48-.09.18-.14.3-.27.46-.13.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.27.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.2 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.25.09 1.57.74 1.84.88.27.14.45.2.52.32.06.11.06.66-.18 1.34z"/></svg>';

const track = (where) => `if(window.gtag)gtag('event','whatsapp_click',{location:'${where}'})`;

export function waOrderButton(p, canonical) {
  const price = p.price ? ` (KSh ${p.price.toLocaleString("en-US")})` : "";
  const link = whatsappLink(`Hello ECB Technologies, I'd like to order: ${p.name}${price}. ${canonical}`);
  return `<a class="ecb-wa-order" href="${escapeHtml(link)}" target="_blank" rel="noopener" onclick="${track("product")}">${WA_ICON}Order on WhatsApp</a>`;
}

export function waFloat(p, canonical) {
  const text = p && p.name ? `Hello ECB Technologies, I have a question about: ${p.name}. ${canonical}` : "Hello ECB Technologies, I'd like to ask about a product.";
  return `<a class="ecb-wa-float" href="${escapeHtml(whatsappLink(text))}" target="_blank" rel="noopener" aria-label="Chat with ECB Technologies on WhatsApp" onclick="${track("float")}">${WA_ICON.replace(/20/g, "28")}</a>`;
}

export function homeIntro() {
  return (
    '<section class="ecb-seo-intro"><div class="container">' +
    "<h1>Laptops, Phones &amp; Accessories Shop in Nairobi CBD</h1>" +
    `<p>ECB Technologies sells genuine laptops, smartphones, printers, gaming gear and accessories from our shop at ${ADDRESS}. ` +
    "Pay by M-Pesa or card, collect free at the shop, or get rider delivery in Nairobi and courier delivery to all 47 counties. " +
    "Open Monday to Saturday, 9am to 7pm.</p>" +
    '<div class="ecb-seo-cta">' +
    `<a class="ecb-cta-wa" href="${escapeHtml(whatsappLink("Hello ECB Technologies, I'd like to ask about a product."))}" target="_blank" rel="noopener" onclick="${track("home")}">${WA_ICON}Chat on WhatsApp</a>` +
    `<a class="ecb-cta-call" href="tel:${PHONE}">Call 0717 040 531</a>` +
    '<a class="ecb-cta-shop" href="/category/laptops">Shop laptops</a>' +
    "</div></div></section>"
  );
}

export function categoryIntro(c) {
  if (!c || !c.count) return "";
  const what = c.name;
  return (
    '<div class="container ecb-seo-cat-intro"><p>' +
    `Shop ${c.count.toLocaleString("en-US")} ${escapeHtml(what)} at ECB Technologies, with prices in KSh. ` +
    `Visit our shop at ${ADDRESS}, pay by M-Pesa or card, and get delivery to all 47 counties in Kenya.` +
    "</p></div>"
  );
}

export const SEO_CSS =
  ".ecb-seo-intro{background:#fff;border-bottom:1px solid #e8edf5}" +
  ".ecb-seo-intro .container{padding-top:20px;padding-bottom:20px}" +
  ".ecb-seo-intro h1{font-size:21px;font-weight:700;color:#1a2840;margin:0 0 8px;line-height:1.25}" +
  ".ecb-seo-intro p{font-size:14.5px;line-height:1.6;color:#4a5568;margin:0 0 14px;max-width:920px}" +
  ".ecb-seo-cta{display:flex;flex-wrap:wrap;gap:10px}" +
  ".ecb-seo-cta a{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none}" +
  ".ecb-cta-wa{background:#25d366;color:#fff!important}.ecb-cta-call{background:#eef4ff;color:#1683ff!important}" +
  ".ecb-cta-shop{background:#1a2840;color:#fff!important}" +
  "@media (min-width:768px){.ecb-seo-intro h1{font-size:26px}}" +
  ".ecb-seo-cat-intro p{margin:18px auto 0;font-size:14.5px;line-height:1.6;color:#4a5568}" +
  ".ecb-wa-order{display:flex;align-items:center;justify-content:center;gap:8px;height:48px;border-radius:8px;background:#25d366;color:#fff!important;font-weight:700;font-size:14.5px;text-decoration:none;margin:0 0 16px}" +
  ".ecb-wa-order:hover{background:#1ebe5a}" +
  ".ecb-wa-float{position:fixed;right:16px;bottom:16px;z-index:1030;width:56px;height:56px;border-radius:50%;background:#25d366;color:#fff!important;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.22)}" +
  "@media print{.ecb-wa-float{display:none}}" +
  // The banner heading became an h1; keep the theme's h2 sizes for it.
  "h1.breadcrumb-title{font-size:48px}@media (max-width:1199.97px){h1.breadcrumb-title{font-size:32px}}";

export function llmsTxt() {
  const cats = CATEGORIES.map(([slug, name]) => `- [${name}](${SITE}/category/${slug})`).join("\n");
  return `# ECB Technologies

> Electronics shop in Nairobi CBD, Kenya, selling genuine laptops, smartphones, printers, gaming gear and accessories, with prices in Kenyan shillings (KSh).

- Shop: ${ADDRESS}, Kenya
- Phone and WhatsApp: ${PHONE} (0717 040 531)
- Opening hours: Monday to Saturday, 9am to 7pm
- Payment: M-Pesa or card
- Delivery: rider delivery within Nairobi, courier delivery to all 47 counties, free pickup at the shop
- Every product page lists the current price in KSh, stock status and specifications.

## Categories

${cats}
- [All products](${SITE}/category)

## Pages

- [About ECB Technologies](${SITE}/about)
- [Contact and directions](${SITE}/contact)
- [Frequently asked questions](${SITE}/faq)
- [Sitemap with every product](${SITE}/sitemap.xml)
`;
}
