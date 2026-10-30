import Link from "next/link";
import {
  ADDRESS_LINE,
  BUSINESS,
  GOOGLE_PROFILE_URL,
  GOOGLE_REVIEWS,
  MAPS_URL,
  whatsappUrl,
} from "@/lib/business";

const SHOP_LINKS = [
  { label: "All products", href: "/products" },
  { label: "Deals", href: "/products?on_sale=true" },
  { label: "Cart", href: "/cart" },
  { label: "Track an order", href: "/track-order" },
];

export default function Footer() {
  const contactLinks = [
    { label: `Call ${BUSINESS.phoneDisplay}`, href: `tel:${BUSINESS.phoneE164}` },
    { label: "WhatsApp", href: whatsappUrl(), external: true },
    { label: BUSINESS.email, href: `mailto:${BUSINESS.email}` },
    { label: "Contact us", href: "/contact" },
  ];

  return (
    <footer className="border-t border-hairline bg-parchment text-ink-80">
      <div className="mx-auto max-w-[980px] px-6 pb-8 pt-12">
        <p className="type-fine border-b border-hairline pb-4 text-ink-48">
          Genuine laptops, phones and accessories from our shop on {BUSINESS.address.street},{" "}
          {BUSINESS.address.area}, with delivery across Kenya. Prices are in Kenya Shillings.
        </p>

        <div className="grid gap-8 py-8 sm:grid-cols-3">
          <div>
            <h3 className="type-fine font-semibold text-ink">Shop</h3>
            <ul className="mt-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-fine leading-[2.2] hover:text-ink hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="type-fine font-semibold text-ink">Contact</h3>
            <ul className="mt-2">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="type-fine leading-[2.2] hover:text-ink hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="type-fine font-semibold text-ink">Visit</h3>
            <ul className="type-fine mt-2 space-y-2 leading-normal">
              <li>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
                  {ADDRESS_LINE}
                </a>
              </li>
              <li>{BUSINESS.hoursDisplay}</li>
              <li>
                <a
                  href={GOOGLE_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink hover:underline"
                >
                  ★ {GOOGLE_REVIEWS.rating} on Google · {GOOGLE_REVIEWS.count} reviews
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="type-fine border-t border-hairline pt-4 text-ink-48">
          Copyright © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
