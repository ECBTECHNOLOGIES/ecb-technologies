import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CartIcon from "./CartIcon";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import BackButton from "./BackButton";

const LOGO_URL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/04/Ebc-864-by-216-6.png`;

export default async function Navbar() {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-white">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center">
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

          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden flex-1 md:block">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>

            <CartIcon />
            <Suspense fallback={null}>
              <MobileMenu />
            </Suspense>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
          <Suspense fallback={null}>
            <BackButton />
          </Suspense>
          <div className="flex-1">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
