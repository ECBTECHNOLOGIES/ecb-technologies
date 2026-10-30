import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Suspense } from "react";
import CartIcon from "./CartIcon";
import SearchBar from "./SearchBar";
import {
  MobileSearchButton,
  MobileSearchPanel,
  MobileSecondRow,
} from "./MobileSearchToggle";
import { MobileSearchProvider } from "./MobileSearchContext";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import BackButton from "./BackButton";
import { BUSINESS } from "@/lib/business";

export default async function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <MobileSearchProvider>
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${BUSINESS.name} home`}>
            <Image
              src={BUSINESS.logo}
              alt={BUSINESS.name}
              width={172}
              height={43}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden w-60 md:block">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>

            <Link
              href="/track-order"
              aria-label="Track your order"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-80 transition-colors hover:text-ink sm:flex"
            >
              <Package className="h-5 w-5" strokeWidth={1.75} />
            </Link>

            <CartIcon />
            <MobileSearchButton />
            <Suspense fallback={null}>
              <MobileMenu />
            </Suspense>
          </div>
        </div>

        <MobileSecondRow>
          <Suspense fallback={null}>
            <BackButton />
          </Suspense>
          <Suspense fallback={null}>
            <MobileSearchPanel />
          </Suspense>
        </MobileSecondRow>
      </MobileSearchProvider>
    </header>
  );
}
