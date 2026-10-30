import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariations,
} from "@/lib/woocommerce";
import GoBackButton from "@/components/GoBackButton";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import { decodeEntities, formatPrice, stripHtml, truncateAtWord } from "@/lib/utils";
import { ADDRESS_LINE, BUSINESS, MAPS_URL, SITE_URL, jsonLdHtml, whatsappUrl } from "@/lib/business";
import { MapPin, MessageCircle, Phone } from "lucide-react";

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
  const image = product.images?.[0];

  return {
    title: `${productName} Price in Kenya`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: productName,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image.src, alt: image.alt || productName }] : undefined,
    },
  };
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(buildJsonLd(product, productName, variations, category))}
      />
      <GoBackButton />

      <nav className="mt-4 mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-brand-blue">
          Products
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${category.id}`} className="hover:text-brand-blue">
              {decodeEntities(category.name)}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{productName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={productName} />

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {productName}
          </h1>

          {product.average_rating > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Rating: {product.average_rating} / 5 ({product.rating_count} reviews)
            </p>
          )}

          <div className="mt-4 border-t border-gray-200 pt-4">
            <ProductPurchaseBox product={product} variations={variations} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a
              href={whatsappUrl(enquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-green px-4 py-2 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Ask on WhatsApp
            </a>
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
            >
              <Phone className="h-4 w-4" />
              Call {BUSINESS.phoneDisplay}
            </a>
          </div>

          <ul className="mt-4 space-y-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <li>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 hover:text-brand-blue">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                Free pickup at {ADDRESS_LINE} ({BUSINESS.hoursDisplay})
              </a>
            </li>
            <li className="pl-[22px]">Delivery available across Kenya</li>
            <li className="pl-[22px]">Pay with M-Pesa or debit/credit card</li>
          </ul>

          {product.short_description && (
            <div
              className="prose prose-sm mt-6 max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900">Description</h2>
          <div
            className="prose prose-sm mt-4 max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}
