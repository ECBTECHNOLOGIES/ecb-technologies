import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariations,
} from "@/lib/woocommerce";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import { decodeEntities, formatPrice, imageAlt, stripHtml, truncateAtWord } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { DELIVERY_STATS } from "@/lib/delivery";
import { buildProductFaqs, getSpecifications } from "@/lib/product-content";
import { BUSINESS, MAPS_URL, SITE_URL, STREET_ADDRESS, jsonLdHtml, whatsappUrl } from "@/lib/business";
import { ChevronRight, CreditCard, MessageCircle, Phone, Store, Truck } from "lucide-react";

function getBrandName(product) {
  if (product.brands?.[0]?.name) return decodeEntities(product.brands[0].name);
  const brandAttribute = product.attributes?.find((attr) => /brand/i.test(attr.name));
  return brandAttribute?.options?.[0] ?? null;
}

function buildDescription(product, productName) {
  const summary = decodeEntities(stripHtml(product.short_description || product.description || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (summary.length >= 70) return truncateAtWord(summary);

  const price = Number(product.price) > 0 ? ` for ${formatPrice(product.price)}` : "";
  return truncateAtWord(
    `Buy ${productName}${price} at ECB Technologies, Moi Avenue, Nairobi CBD. M-Pesa or card, store pickup or delivery across Kenya.`
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) return {};

  const productName = decodeEntities(product.name);
  const description = buildDescription(product, productName);
  const priced = `${productName} Price in Kenya`;

  return pageMetadata({
    // Model name first; keyword suffix only when it fits in ~60 characters.
    title: priced.length <= 60 ? priced : productName,
    description,
    path: `/products/${product.slug}`,
    images: product.images?.slice(0, 4).map((image, index) => ({
      url: image.src,
      alt: imageAlt(image, productName, index),
    })),
  });
}

const SCHEMA_AVAILABILITY = {
  instock: "https://schema.org/InStock",
  outofstock: "https://schema.org/OutOfStock",
  onbackorder: "https://schema.org/BackOrder",
};

// Product + BreadcrumbList markup built only from data that is visible on the
// page (name, images, price, stock, WooCommerce ratings) - never invented.
function buildJsonLd(product, productName, variations, category) {
  const url = `${SITE_URL}/products/${product.slug}`;
  const brand = getBrandName(product);

  const variationPrices = variations
    .map((variation) => Number(variation.price))
    .filter((price) => price > 0);
  const anyVariationInStock = variations.some((variation) => variation.stock_status === "instock");

  let offers;
  if (variationPrices.length) {
    offers = {
      "@type": "AggregateOffer",
      priceCurrency: "KES",
      lowPrice: Math.min(...variationPrices),
      highPrice: Math.max(...variationPrices),
      offerCount: variationPrices.length,
      availability: anyVariationInStock ? SCHEMA_AVAILABILITY.instock : SCHEMA_AVAILABILITY.outofstock,
      url,
    };
  } else if (Number(product.price) > 0) {
    offers = {
      "@type": "Offer",
      priceCurrency: "KES",
      price: Number(product.price),
      availability: SCHEMA_AVAILABILITY[product.stock_status] ?? SCHEMA_AVAILABILITY.outofstock,
      url,
      seller: { "@id": `${SITE_URL}/#store` },
    };
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    url,
    image: product.images?.map((image) => image.src),
    description: buildDescription(product, productName),
    sku: product.sku || undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    category: category ? decodeEntities(category.name) : undefined,
    additionalProperty: getSpecifications(product).map((spec) => ({
      "@type": "PropertyValue",
      name: spec.name,
      value: spec.value,
    })),
    offers,
    aggregateRating:
      product.rating_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(product.average_rating),
            reviewCount: product.rating_count,
          }
        : undefined,
  };

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Products", url: `${SITE_URL}/products` },
    ...(category
      ? [{ name: decodeEntities(category.name), url: `${SITE_URL}/products?category=${category.id}` }]
      : []),
    { name: productName, url },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  return [productJsonLd, breadcrumbJsonLd];
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) notFound();

  const variations =
    product.type === "variable"
      ? await getProductVariations(product.id).catch(() => [])
      : [];

  const category = product.categories?.[0];
  const productName = decodeEntities(product.name);
  const enquiryMessage = `Hi ECB Technologies, I'm interested in the ${productName}. Is it available? ${SITE_URL}/products/${product.slug}`;

  const brand = getBrandName(product);
  const specifications = getSpecifications(product);
  const faqs = buildProductFaqs(product, productName, variations);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(buildJsonLd(product, productName, variations, category))}
      />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="type-fine flex flex-wrap items-center gap-1.5 pt-6 text-ink-48">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-ink">
            Products
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/products?category=${category.id}`} className="hover:text-ink">
                {decodeEntities(category.name)}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ProductGallery images={product.images} productName={productName} />
          </div>

          <div>
            {brand && <p className="type-caption font-semibold text-ink-48">{brand}</p>}
            <h1 className="type-display mt-1 text-ink">{productName}</h1>

            {product.rating_count > 0 && (
              <p className="type-caption mt-2 text-ink-48">
                ★ {product.average_rating} · {product.rating_count}{" "}
                {product.rating_count === 1 ? "review" : "reviews"}
              </p>
            )}

            <div className="mt-6">
              <ProductPurchaseBox product={product} variations={variations} />
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <a
                href={whatsappUrl(enquiryMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex items-center gap-1.5 text-[17px]"
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                Ask on WhatsApp
              </a>
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="link inline-flex items-center gap-1.5 text-[17px]"
              >
                <Phone className="h-[18px] w-[18px]" strokeWidth={1.75} />
                Call {BUSINESS.phoneDisplay}
              </a>
            </div>

            <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
              <div className="flex gap-4 py-4">
                <Store className="mt-0.5 h-5 w-5 shrink-0 text-ink-80" strokeWidth={1.5} />
                <div>
                  <dt className="text-[15px] font-semibold text-ink">Free pickup in store</dt>
                  <dd className="type-caption mt-0.5 text-ink-48">
                    {STREET_ADDRESS}. {BUSINESS.hoursDisplay}.{" "}
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="link">
                      Directions
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 py-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-ink-80" strokeWidth={1.5} />
                <div>
                  <dt className="text-[15px] font-semibold text-ink">Delivery across Kenya</dt>
                  <dd className="type-caption mt-0.5 text-ink-48">
                    {DELIVERY_STATS.townCount} towns via Fargo Courier, from{" "}
                    {formatPrice(DELIVERY_STATS.minFee)}.{" "}
                    <Link href="/delivery" className="link">
                      Fees by town
                    </Link>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 py-4">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-ink-80" strokeWidth={1.5} />
                <div>
                  <dt className="text-[15px] font-semibold text-ink">M-Pesa or card</dt>
                  <dd className="type-caption mt-0.5 text-ink-48">Pay securely at checkout.</dd>
                </div>
              </div>
            </dl>

            {product.short_description && (
              <div
                className="prose-ecb mt-8"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}
          </div>
        </div>
      </div>

      {(product.description || specifications.length > 0) && (
        <section className="mt-20 bg-parchment py-16 sm:py-20">
          <div className="mx-auto max-w-[980px] space-y-14 px-6">
            {specifications.length > 0 && (
              <div>
                <h2 className="type-display text-ink">Specifications</h2>
                <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
                  {specifications.map((spec) => (
                    <div key={spec.name} className="grid gap-1 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
                      <dt className="text-[15px] font-semibold text-ink">{spec.name}</dt>
                      <dd className="text-[15px] text-ink-80">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {product.description && (
              <div>
                <h2 className="type-display text-ink">Overview</h2>
                <div
                  className="prose-ecb mt-8"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[980px] px-6 py-16 sm:py-20">
        <h2 className="type-display text-ink">Questions about the {productName}</h2>
        <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-6">
              <dt className="type-tagline text-ink">{faq.q}</dt>
              <dd className="mt-2 text-[17px] text-ink-80">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <p className="type-caption mt-6 text-ink-48">
          Another question?{" "}
          <a href={whatsappUrl(enquiryMessage)} target="_blank" rel="noopener noreferrer" className="link">
            Ask us on WhatsApp
          </a>
          .
        </p>
      </section>
    </div>
  );
}
