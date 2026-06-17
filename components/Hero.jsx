import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 items-center bg-white md:grid-cols-2">
      <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-16">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-blue sm:text-sm">
          Nairobi&apos;s #1 Tech Store
        </span>
        <h1 className="mt-3 text-[32px] font-bold leading-tight text-gray-900 sm:text-[48px] lg:text-[60px]">
          Tech That Moves With You
        </h1>
        <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-[18px]">
          Genuine laptops, phones &amp; accessories. Walk in at Iconic
          Business Plaza or order online, we deliver across Kenya.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
          <Link
            href="/products"
            className="font-heading rounded-lg bg-brand-blue px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#2651AB] sm:px-9 sm:py-3.5 sm:text-sm"
          >
            Shop Now
          </Link>
          <Link
            href="/products?on_sale=true"
            className="font-heading rounded-lg border-2 border-brand-blue px-6 py-2.5 text-xs font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white sm:px-9 sm:py-3.5 sm:text-sm"
          >
            View Deals
          </Link>
        </div>
      </div>

      <div className="px-6 pb-8 md:flex md:items-center md:px-6 md:py-10 md:pr-10 lg:pr-16">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1755436612568-a197417c1ddf?fm=jpg&q=80&w=2000&auto=format&fit=crop"
            alt="Modern desk setup with computer, chair and plants"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
