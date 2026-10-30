import Image from "next/image";
import Link from "next/link";
import { ADDRESS_LINE, BUSINESS, GOOGLE_PROFILE_URL, GOOGLE_REVIEWS, MAPS_URL, whatsappUrl } from "@/lib/business";

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Image
            src={BUSINESS.logo}
            alt="ECB Technologies"
            width={172}
            height={43}
            className="h-10 w-auto rounded bg-white object-contain p-1"
          />
          <p className="mt-3 text-sm text-white/80">
            Laptops, phones and accessories from our shop on Moi Avenue,
            Nairobi CBD, with delivery across Kenya.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            Shop
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/products" className="hover:text-[#5B8DEF]">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?on_sale=true" className="hover:text-[#5B8DEF]">
                Deals
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#5B8DEF]">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-[#5B8DEF]">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            Contact
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5B8DEF]"
              >
                {ADDRESS_LINE}
              </a>
            </li>
            <li>{BUSINESS.hoursDisplay}</li>
            <li>
              <a
                href={GOOGLE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5B8DEF]"
              >
                ★ {GOOGLE_REVIEWS.rating} on Google ({GOOGLE_REVIEWS.count} reviews)
              </a>
            </li>
            <li>
              <a href={`tel:${BUSINESS.phoneE164}`} className="hover:text-[#5B8DEF]">
                Call {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5B8DEF]"
              >
                WhatsApp {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-[#5B8DEF]">
                {BUSINESS.email}
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#5B8DEF]">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} ECB Technologies. All rights reserved.
      </div>
    </footer>
  );
}
