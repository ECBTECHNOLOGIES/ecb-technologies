import Link from "next/link";
import HeroCarousel from "./HeroCarousel";

export default function Hero() {
  return (
    <section className="relative flex h-[calc(100vh-80px)] items-center justify-center overflow-hidden">
      <HeroCarousel />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-green">
          Nairobi&apos;s #1 Tech Store
        </span>
        <h1 className="mt-3 text-[60px] font-bold leading-tight text-white">
          Tech That Moves With You
        </h1>
        <p className="mt-4 text-[18px] text-white/85">
          Genuine laptops, phones &amp; accessories. Walk in at Iconic Business
          Plaza or order online, we deliver across Kenya.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-brand-green px-9 py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-700"
          >
            Shop Now
          </Link>
          <Link
            href="/products?on_sale=true"
            className="rounded-lg border-2 border-white px-9 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-gray-900"
          >
            View Deals
          </Link>
        </div>
      </div>
    </section>
  );
}
