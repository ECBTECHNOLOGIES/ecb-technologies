"use client";

import Link from "next/link";
import { Menu, Package, X } from "lucide-react";
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
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
      >
        {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full h-[calc(100dvh-56px)] bg-white/95 backdrop-blur-xl">
          <nav className="flex flex-col px-8 py-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2 text-[28px] font-semibold tracking-tight ${
                  isActive(link.href) ? "text-ink" : "text-ink-80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track-order"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 py-2 text-[28px] font-semibold tracking-tight text-ink-80"
            >
              <Package className="h-6 w-6" strokeWidth={1.75} />
              Track Order
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
