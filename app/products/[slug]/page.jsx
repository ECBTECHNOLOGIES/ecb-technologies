import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariations,
} from "@/lib/woocommerce";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import { decodeEntities } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) return {};

  return {
    title: `${decodeEntities(product.name)} | ECB Technologies`,
    description: product.short_description?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-gray-500">
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
