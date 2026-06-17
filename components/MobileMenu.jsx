"use client";

import Link from "next/link";
import { Menu, Truck, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { links } from "./NavLinks";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(href) {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    if (!query) return !searchParams.get("on_sale");
    return searchParams.get("on_sale") === "true";
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center p-2 text-brand-blue"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-gray-100 bg-white shadow-sm">
          <nav className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded px-2 py-2.5 text-sm font-bold ${
                  isActive(link.href) ? "text-brand-blue" : "text-gray-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track-order"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded px-2 py-2.5 text-sm font-bold text-gray-500"
            >
              <Truck className="h-4 w-4" />
              Track Order
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
