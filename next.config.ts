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
      {
        source: "/product-category/:slug*",
        destination: "/products",
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
