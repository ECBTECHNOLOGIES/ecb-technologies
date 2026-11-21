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
import { DUPE_CANONICAL } from "./dupes.js";

export const SITE = "https://www.ecbtechkenya.com";
const PHONE = "+254717040531";
const WHATSAPP = "254717040531";
const LOGO = `${SITE}/assets/images/1789718740logopng.png`;
export const SHARE_IMAGE = `${SITE}/ecb-assets/og.png`;
// The shop's social profiles (owner-confirmed).
export const SOCIALS = {
  instagram: "https://www.instagram.com/ecb_technologies/",
  tiktok: "https://www.tiktok.com/@ecbtechnologies",
  x: "https://x.com/ecbtechnologies",
};
export const X_HANDLE = "@ecbtechnologies";
// The site was set up when the logo was uploaded (1789718740 in its file name).
const SITE_SINCE = new Date(1789718740 * 1000).toISOString();
// Pages written on a known date.
const PAGE_PUBLISHED = {
  "/delivery": "2026-11-15T10:00:00+03:00",
  "/research/laptop-prices-kenya": "2026-11-15T10:00:00+03:00",
  "/student-laptops-kenya": "2026-11-15T10:00:00+03:00",
  "/hp-vs-dell-vs-lenovo-laptops-kenya": "2026-11-15T10:00:00+03:00",
};
// Pages last edited on a known date (content, not template).
const PAGE_MODIFIED = {
  "/delivery": "2026-11-15T10:00:00+03:00",
  "/research/laptop-prices-kenya": "2026-11-15T10:00:00+03:00",
  "/student-laptops-kenya": "2026-11-15T10:00:00+03:00",
  "/hp-vs-dell-vs-lenovo-laptops-kenya": "2026-11-15T10:00:00+03:00",
  "/contact": "2026-11-15T10:00:00+03:00",
};
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
  sameAs: ["https://share.google/56ymLkB3i6DS0HHvJ", SOCIALS.instagram, SOCIALS.tiktok, SOCIALS.x],
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
  [`${SITE}/category?search=accessories`]: `${SITE}/category/Computing-Accessories`,
  [`${SITE}/category?search=gaming`]: `${SITE}/category/gaming`,
  [`${SITE}/category?search=printers`]: `${SITE}/category/printers`,
};

// The theme prints prices like "KSH57,000" and, when cents were typed in,
// "KSH57,000,30" (cents after a comma). Returns whole shillings.
export function parseKsh(text) {
  let t = String(text || "").replace(/[^\d,.]/g, "");
  t = t.replace(/[,.](\d{1,2})$/, "");
  const n = Number(t.replace(/[,.]/g, ""));
  return n > 0 ? n : null;
}

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

// Duplicate listings found in the live catalogue (copy slug -> oldest listing),
// set by the Worker each time it loads the product list.
let LIVE_DUPES = {};
export function setLiveDupes(map) {
  LIVE_DUPES = map || {};
}

export function canonicalFor(url, noindex) {
  let path = url.pathname.replace(/\/+$/, "") || "/";
  // The same product listed more than once points to the oldest listing.
  const slug = path.startsWith("/item/") ? path.slice(6) : "";
  if (slug && LIVE_DUPES[slug]) path = `/item/${LIVE_DUPES[slug]}`;
  else if (slug && DUPE_CANONICAL[slug]) path = `/item/${DUPE_CANONICAL[slug]}`;
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
  // Dates: products from the upload time in their photo's file name; written
  // pages from when they were written; everything else from when the site was
  // set up. "Modified" is when this copy of the page was built from the shop.
  const photoTime = (html.match(/assets\/images\/(?:products|thumbnails)\/(1[6-9]\d{8})/) || [])[1];
  out.published = path.startsWith("/item/") && photoTime ? new Date(Number(photoTime) * 1000).toISOString() : PAGE_PUBLISHED[path] || SITE_SINCE;
  // Never "now": the last real edit we know of, else the published date.
  // (Catalogue pages get the catalogue's last change from the Worker.)
  out.modified = PAGE_MODIFIED[path] || out.published;
  const webPage = (type) => ({
    "@type": type,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description: description || undefined,
    isPartOf: { "@id": `${SITE}/#website` },
    inLanguage: "en-KE",
    datePublished: out.published,
    dateModified: out.modified,
  });

  if (path === "/") {
    out.type = "home";
    out.graph.push(webPage("WebPage"));
    return out;
  }

  if (path.startsWith("/item/")) {
    const slug = path.slice(6);
    const name = decode((html.match(/<h1 class="ecb-pd-name">([\s\S]*?)<\/h1>/) || [])[1]);
    const priceText = (html.match(/id="sizeprice">\s*([^<]+)</) || [])[1] || "";
    const price = parseKsh(priceText);
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
    // Prices with extra digits (data-entry slips) are left out of the offer.
    if (price && price < 2000000) {
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
    out.graph.push(Object.assign(webPage("ItemPage"), { mainEntity: { "@id": `${canonical}#product` } }), product, breadcrumbList(crumbs));
    const qa = productQa(out.product);
    if (qa.length) out.graph.push({ "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
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
        ...webPage("CollectionPage"),
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

  out.graph.push(webPage(path === "/about" ? "AboutPage" : path === "/contact" ? "ContactPage" : "WebPage"));
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

// On phones: a tap-to-call button above the WhatsApp button, and outside
// opening hours (Mon–Sat 9am–7pm, Nairobi time) a small note so nobody waits
// for a call that won't be answered. Fixed position, so no layout shift.
const PHONE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
const AFTER_HOURS_JS = `(function(){try{var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Nairobi',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date());var d='',h=0;p.forEach(function(x){if(x.type==='weekday')d=x.value;if(x.type==='hour')h=+x.value%24});var open=d!=='Sun'&&h>=9&&h<19;if(open)return;var nxt=(d==='Sat'&&h>=19)||d==='Sun'?'Monday 9am':(h<9?'9am today':'9am tomorrow');var el=document.getElementById('ecb-closed');if(!el)return;el.querySelector('b').textContent='Closed now \u00b7 opens '+nxt+'.';el.hidden=false;el.onclick=function(){el.hidden=true}}catch(e){}})();`;
export function contactFloats() {
  return `<a class="ecb-call-float" href="tel:+254717040531" aria-label="Call ECB Technologies on 0717 040 531" onclick="if(window.gtag)gtag('event','call_click',{location:'float'})">${PHONE_ICON}</a>` +
    `<div id="ecb-closed" class="ecb-closed" role="status" hidden><b></b> WhatsApp us and we'll reply when we open.</div><script>${AFTER_HOURS_JS}</script>`;
}

export function waFloat(p, canonical) {
  const text = p && p.name ? `Hello ECB Technologies, I have a question about: ${p.name}. ${canonical}` : "Hello ECB Technologies, I'd like to ask about a product.";
  return contactFloats() + `<a class="ecb-wa-float" href="${escapeHtml(whatsappLink(text))}" target="_blank" rel="noopener" aria-label="Chat with ECB Technologies on WhatsApp" onclick="${track("float")}">${WA_ICON.replace(/20/g, "28")}</a>`;
}

export function homeIntro() {
  return (
    '<section class="ecb-seo-intro"><div class="container">' +
    "<h1>Laptops, Phones &amp; Accessories Shop in Nairobi CBD</h1>" +
    '<p>Genuine laptops and phones. Moi Avenue, Nairobi CBD. <a href="/delivery">Delivery to all 47 counties</a>.</p>' +
    '<div class="ecb-seo-cta">' +
    `<a class="ecb-cta-wa" href="${escapeHtml(whatsappLink("Hello ECB Technologies, I'd like to ask about a product."))}" target="_blank" rel="noopener" onclick="${track("home")}">${WA_ICON}WhatsApp</a>` +
    `<a class="ecb-cta-call" href="tel:${PHONE}">Call</a>` +
    '<a class="ecb-cta-shop" href="/category/laptops">Shop laptops</a>' +
    "</div></div></section>"
  );
}

// "Buying in Nairobi" questions for one product (price, where, delivery,
// stock), answered only with facts from the page and the shop.
export function productQa(p) {
  if (!p || !p.name) return [];
  const name = p.name.replace(/\s+/g, " ").trim();
  const out = [];
  if (p.price > 0 && p.price < 2000000 && !p.outStock) {
    out.push([`How much is the ${name} in Kenya?`, `KSh ${p.price.toLocaleString("en-US")} at ECB Technologies in Nairobi CBD. The price on this page is the current price.`]);
  }
  out.push([
    `Where can I buy the ${name} in Nairobi?`,
    `At ECB Technologies, ${ADDRESS}, Monday to Saturday, 9am to 7pm. Order online or on WhatsApp (0717 040 531) and pick it up free, or have it delivered.`,
  ]);
  out.push([`Can the ${name} be delivered outside Nairobi?`, "Yes. Couriers deliver to all 47 counties and riders deliver within Nairobi; pickup at the shop is free."]);
  if (p.outStock) out.push([`Is the ${name} in stock?`, "It is out of stock right now. Ask on WhatsApp (0717 040 531) about the next delivery or a similar model."]);
  return out;
}

export function productQaHtml(p) {
  const qa = productQa(p);
  if (!qa.length) return "";
  return `<section class="container ecb-pd-local-qa"><h2>Buying in Nairobi</h2>${qa.map(([q, a]) => `<h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p>`).join("")}<p><a href="/laptop-shop-nairobi">About the shop: address, hours and delivery</a></p></section>`;
}

export function categoryIntro(c) {
  if (!c || !c.count) return "";
  const guides = /^laptops$/i.test((c.parts || [])[0] || "")
    ? ' · <a href="/research/laptop-prices-kenya">Price guide</a> · <a href="/student-laptops-kenya">Student picks</a> · <a href="/hp-vs-dell-vs-lenovo-laptops-kenya">HP vs Dell vs Lenovo</a> · <a href="/guides">All laptop guides</a> · <a href="/categories">All categories</a>'
    : "";
  const research = /^laptops$/i.test((c.parts || [])[0] || "") ? ' · <a href="/research/laptop-prices-kenya">Laptop price statistics</a>' : ' · <a href="/research/tech-prices-kenya">Price statistics</a>';
  return (
    '<div class="container ecb-seo-cat-intro">' +
    (c.summary ? `<p class="ecb-cat-summary">${escapeHtml(c.summary)}</p>` : "") +
    "<p>" +
    `${c.count.toLocaleString("en-US")} ${escapeHtml(c.name)} at ECB Technologies, Nairobi CBD · Prices in KSh · <a href="/delivery">Delivery across Kenya</a>${guides}${research}` +
    "</p></div>"
  );
}

// Footer in the nothing.tech pattern: big dot-matrix links, a short list of
// action tiles, then one row of small links and socials.
export function nothingFooter() {
  const big = [["Laptops", "/category/laptops"], ["Phones", "/category/smartphones"], ["Gaming", "/category/gaming"], ["Printers", "/category/printers"], ["Accessories", "/category/Computing-Accessories"]];
  const tiles = [
    ["WhatsApp 0717 040 531", whatsappLink("Hello ECB Technologies, I'd like to ask about a product."), WA_TILE],
    ["Visit: Moi Avenue, Nairobi CBD", "/contact", PIN_TILE],
    ["Delivery across Kenya", "/delivery", BOX_TILE],
    ["Buying guides", "/research/laptop-prices-kenya", INFO_TILE],
    ["Mon – Sat · 9am – 7pm", "/contact", CLOCK_TILE],
  ];
  const small = [["About", "/about"], ["Contact", "/contact"], ["FAQ", "/faq"], ["All categories", "/categories"], ["Visit the shop", "/laptop-shop-nairobi"], ["Research", "/research"], ["Laptop guides", "/guides"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Agent login", "/user/vendor-login"], ["Rider login", "/rider/login"]];
  const social = [["Instagram", SOCIALS.instagram], ["TikTok", SOCIALS.tiktok], ["X", SOCIALS.x]];
  return (
    '<div class="nf-wrap">' +
    '<nav class="nf-big" aria-label="Shop">' + big.map(([t, h]) => `<a href="${h}">${t}</a>`).join("") + "</nav>" +
    '<div class="nf-tiles">' +
    tiles.map(([t, h, icon]) => `<a class="nf-tile" href="${escapeHtml(h)}"${h.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}><span>${t}</span>${icon}</a>`).join("") +
    "</div>" +
    '<div class="nf-bottom"><div class="nf-links">' + small.map(([t, h]) => `<a href="${h}">${t}</a>`).join("") + "</div>" +
    '<div class="nf-links nf-social">' + social.map(([t, h]) => `<a href="${h}" target="_blank" rel="noopener me">${t}</a>`).join("") + "</div></div>" +
    '<p class="nf-copy">© ' + new Date().getFullYear() + " ECB Technologies · Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, Nairobi</p>" +
    "</div>"
  );
}
const tileIcon = (path) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const WA_TILE = tileIcon('<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"/>');
const PIN_TILE = tileIcon('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>');
const BOX_TILE = tileIcon('<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>');
const INFO_TILE = tileIcon('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>');
const CLOCK_TILE = tileIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');

const IG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
const TT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.68V9.01a7.34 7.34 0 0 0 4.29 1.38V7.3a4.28 4.28 0 0 1-3.23-1.48z"/></svg>';
const X_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>';

export const socialLinks = (cls) =>
  [
    [SOCIALS.instagram, "Instagram", IG_ICON],
    [SOCIALS.tiktok, "TikTok", TT_ICON],
    [SOCIALS.x, "X", X_ICON],
  ]
    .map(([href, name, icon]) => `<a href="${href}" class="${cls}" target="_blank" rel="noopener me" aria-label="ECB Technologies on ${name}">${icon}</a>`)
    .join("");

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
  ".ecb-call-float{display:none}@media (max-width:767px){.ecb-call-float{position:fixed;right:20px;bottom:84px;z-index:1030;width:48px;height:48px;border-radius:50%;background:#1683ff;color:#fff!important;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.22)}}" +
  ".ecb-closed{position:fixed;left:12px;right:84px;bottom:20px;z-index:1029;background:#1a2840;color:#fff;font-size:13px;line-height:1.4;padding:9px 12px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.2)}.ecb-closed[hidden]{display:none}@media (min-width:768px){.ecb-closed{left:auto;right:88px;max-width:340px}}" +
  "@media print{.ecb-wa-float,.ecb-call-float,.ecb-closed{display:none}}" +
  // The banner heading became an h1; keep the theme's h2 sizes for it.
  ".ecb-guide-page .ecb-about-lead-body h2{font-size:24px;line-height:1.3;margin:30px 0 10px;color:#1a2840}" +
  ".ecb-guide-page .ecb-about-lead-body h3{font-size:18px;line-height:1.35;margin:22px 0 6px;color:#1a2840}" +
  ".ecb-guide-page .ecb-about-lead-body table{font-size:14px}.ecb-guide-page .ecb-about-lead-body td a{word-break:break-word}" +
  "@media (max-width:767px){.ecb-guide-page .ecb-about-lead-body table{display:block;overflow-x:auto}" +
  ".ecb-guide-page .ecb-about-lead-body h2{font-size:20px}.ecb-guide-page .ecb-about-lead-body h3{font-size:17px}}" +
  // Hero photo: soft left edge (no visible seam), toned to sit with the navy.
  ".ecb-hero-img-bg{-webkit-mask-image:linear-gradient(90deg,transparent 0,rgba(0,0,0,.55) 16%,#000 34%);mask-image:linear-gradient(90deg,transparent 0,rgba(0,0,0,.55) 16%,#000 34%);filter:brightness(.86) saturate(.92)}" +
  "@media (min-width:768px) and (max-width:991px){.ecb-hero-img-bg{-webkit-mask-image:none;mask-image:none}}" +
  ".ecb-hero-badge-corner{text-shadow:0 1px 3px rgba(3,21,47,.9),0 2px 18px rgba(3,21,47,.85)}" +
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
- Instagram: ${SOCIALS.instagram}
- TikTok: ${SOCIALS.tiktok}
- X: ${SOCIALS.x}
- Every product page lists the current price in KSh, stock status and specifications.

## Categories

${cats}
- [All products](${SITE}/category)

## Buying guides

- [Laptop prices in Kenya](${SITE}/research/laptop-prices-kenya)
- [Student laptops under KSh 40,000](${SITE}/student-laptops-kenya)
- [HP vs Dell vs Lenovo laptops in Kenya](${SITE}/hp-vs-dell-vs-lenovo-laptops-kenya)

## Pages

- [Delivery across Kenya](${SITE}/delivery)
- [About ECB Technologies](${SITE}/about)
- [Contact and directions](${SITE}/contact)
- [Frequently asked questions](${SITE}/faq)
- [Sitemap with every product](${SITE}/sitemap.xml)
`;
}
