"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Deals", href: "/products?on_sale=true" },
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
          className={`text-sm font-bold transition-colors active:text-[#5B8DEF] ${
            isActive(link.href)
              ? "text-[#5B8DEF]"
              : "text-brand-blue hover:text-[#2651AB]"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
