import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CartIcon from "./CartIcon";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

const LOGO_URL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/04/Ebc-864-by-216-6.png`;

export default async function Navbar() {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-white">
        <div className="flex items-center px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex w-1/2 items-center">
            <Link href="/" className="flex shrink-0 items-center">
              <Image
                src={LOGO_URL}
                alt="ECB Technologies"
                width={172}
                height={43}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex w-1/2 items-center justify-end gap-4">
            <Suspense fallback={null}>
              <NavLinks />
            </Suspense>

            <div className="hidden flex-1 md:block">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>

            <MobileMenu />
            <CartIcon />
          </div>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
