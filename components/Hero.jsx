import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export default function Hero() {
  return (
    <section className="px-6 pb-10 pt-14 text-center sm:pb-14 sm:pt-20">
      <p className="type-caption font-semibold text-ink-48">
        {BUSINESS.address.street}, {BUSINESS.address.area}
      </p>
      <h1 className="type-hero mx-auto mt-3 max-w-3xl text-ink">
        Laptops, phones and accessories.
      </h1>
      <p className="type-lead mx-auto mt-4 max-w-2xl text-ink-80">
        Genuine products, priced in KSh. Pick up at our shop or get delivery anywhere in
        Kenya.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="btn-primary">
          Shop now
        </Link>
        <Link href="/products?on_sale=true" className="btn-secondary">
          View deals
        </Link>
      </div>
    </section>
  );
}
