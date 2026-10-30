import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old WordPress URLs that Google still has indexed (sitelinks) -
      // send them to their nearest equivalent on the new Next.js site.
      {
        source: "/laptops",
        destination: "/products?category=272",
        permanent: true,
      },
      {
        source: "/hp-laptops",
        destination: "/products?category=272",
        permanent: true,
      },
      {
        source: "/computer-accessories",
        destination: "/products?category=274",
        permanent: true,
      },
      {
        source: "/mobile-accessories",
        destination: "/products?category=276",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      // WooCommerce's real category archive URLs were /product-category/<slug>/,
      // not the bare slugs above - map the ones Google actually has indexed to
      // their specific category first, falling back to the unfiltered catalog
      // for any other category slug that isn't explicitly listed.
      {
        source: "/product-category/laptops",
        destination: "/products?category=272",
        permanent: true,
      },
      {
        source: "/product-category/computer-accessories",
        destination: "/products?category=274",
        permanent: true,
      },
      {
        source: "/product-category/mobile-accessories",
        destination: "/products?category=276",
        permanent: true,
      },
      // "Uncategorized" is WooCommerce's meaningless default bucket category,
      // not a real one - but Google indexed its archive page (titled "Buy
      // Latest Uncategorized in Kenya"), so send that traffic to Deals
      // instead of dumping it on the unfiltered catalog.
      {
        source: "/uncategorized",
        destination: "/products?on_sale=true",
        permanent: true,
      },
      {
        source: "/product-category/uncategorized",
        destination: "/products?on_sale=true",
        permanent: true,
      },
      // Sitemap URLs from the old WordPress site (Yoast / WP core) that
      // Search Console may still have on file.
      ...[
        "/sitemap_index.xml",
        "/product-sitemap.xml",
        "/product_cat-sitemap.xml",
        "/page-sitemap.xml",
        "/post-sitemap.xml",
        "/wp-sitemap.xml",
      ].map((source) => ({ source, destination: "/sitemap.xml", permanent: true })),
      // Any other /product-category/<slug> is resolved to its matching
      // category by app/product-category/[...slug]/route.js.
      //
      // WooCommerce's product permalinks were /product/<slug>/ and the
      // headless site reads the same WooCommerce catalogue, so slugs match 1:1.
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ecbtechkenya.com",
      },
      {
        protocol: "https",
        hostname: "ecbtechkenya.com",
      },
      {
        protocol: "https",
        hostname: "api.ecbtechkenya.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
