import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/woocommerce";
import { decodeEntities } from "@/lib/utils";
import CartIcon from "./CartIcon";
import SearchBar from "./SearchBar";
import CategoryNav from "./CategoryNav";
import NavLinks from "./NavLinks";

const LOGO_URL =
  "https://www.ecbtechkenya.com/wp-content/uploads/2025/04/Ebc-864-by-216-6.png";

export default async function Navbar() {
  let categories = [];
  try {
    const allCategories = await getCategories({ parent: 0, orderby: "count", order: "desc" });
    categories = allCategories
      .filter((category) => category.slug !== "uncategorized")
      .slice(0, 8)
      .map((category) => ({ ...category, name: decodeEntities(category.name) }));
  } catch {
    categories = [];
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
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

          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>

          <div className="hidden flex-1 md:block">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>

          <CartIcon />
        </div>

        <div className="px-4 pb-3 md:hidden">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <CategoryNav categories={categories} />
    </header>
  );
}
