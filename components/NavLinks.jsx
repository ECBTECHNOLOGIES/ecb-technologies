"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Deals", href: "/products?on_sale=true" },
  { label: "Contact", href: "/contact" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(href) {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    if (!query) return !searchParams.get("on_sale");
    return searchParams.get("on_sale") === "true";
  }

  return (
    <div className="hidden items-center gap-6 md:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-bold transition-colors ${
            isActive(link.href)
              ? "text-brand-blue"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
