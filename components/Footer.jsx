import Image from "next/image";
import Link from "next/link";

const LOGO_URL =
  "https://www.ecbtechkenya.com/wp-content/uploads/2025/04/Ebc-864-by-216-6.png";

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Image
            src={LOGO_URL}
            alt="ECB Technologies"
            width={172}
            height={43}
            className="h-10 w-auto rounded bg-white object-contain p-1"
          />
          <p className="mt-3 text-sm text-white/80">
            Your trusted electronics store in Nairobi, Kenya. Laptops,
            phones, accessories and more.
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
                Student Deals
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#5B8DEF]">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            Contact
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>Nairobi, Kenya</li>
            <li>
              <a
                href="https://www.ecbtechkenya.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5B8DEF]"
              >
                www.ecbtechkenya.com
              </a>
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
