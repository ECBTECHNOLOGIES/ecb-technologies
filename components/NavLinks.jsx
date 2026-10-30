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
    <nav className="hidden items-center gap-7 md:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-[14px] transition-colors ${
            isActive(link.href) ? "text-ink" : "text-ink-80/80 hover:text-ink"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
