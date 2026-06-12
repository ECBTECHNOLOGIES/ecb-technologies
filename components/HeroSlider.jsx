"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Genuine Apple Devices",
    subtitle: "MacBooks, iPhones & iPads at the best prices in Nairobi",
    cta: "Shop Apple",
    href: "/products?category=273",
    bg: "from-brand-blue to-blue-900",
  },
  {
    title: "Student Deals",
    subtitle: "Special discounts on laptops and accessories for students",
    cta: "View Deals",
    href: "/products?on_sale=true",
    bg: "from-brand-red to-red-800",
  },
  {
    title: "Latest Electronics",
    subtitle: "Explore our full range of phones, laptops and accessories",
    cta: "Shop Now",
    href: "/products",
    bg: "from-gray-800 to-gray-950",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function goTo(i) {
    setIndex((i + slides.length) % slides.length);
  }

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden">
      <div
        className={`bg-gradient-to-r ${slide.bg} px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-xl text-3xl font-extrabold sm:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">
            {slide.subtitle}
          </p>
          <Link
            href={slide.href}
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
