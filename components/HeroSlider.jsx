"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Kenya's #1 Electronics Store",
    subtitle: "Laptops, Phones & More",
    cta: "Shop Now",
    href: "/products",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89",
  },
  {
    title: "Latest Smartphones",
    subtitle: "Best prices in Nairobi",
    cta: "Shop Phones",
    href: "/products?category=285",
    image: "https://images.unsplash.com/photo-1758467700578-7491a5c7eedd",
  },
  {
    title: "Student Deals",
    subtitle: "Special discounts on laptops",
    cta: "View Deals",
    href: "/products?category=390",
    image: "https://images.unsplash.com/photo-1593642634367-d91a135587b5",
  },
  {
    title: "Work From Anywhere",
    subtitle: "Premium laptops at great prices",
    cta: "Shop Laptops",
    href: "/products?category=272",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
  },
  {
    title: "Complete Your Setup",
    subtitle: "Accessories for every device",
    cta: "Shop Accessories",
    href: "/products?category=276",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd",
  },
];

const AUTOPLAY_INTERVAL_MS = 4000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  function goTo(i) {
    setIndex((i + slides.length) % slides.length);
  }

  return (
    <section className="relative h-[60vh] overflow-hidden sm:h-[65vh] md:h-[70vh]">
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={`${slide.image}?auto=format&fit=crop&w=1920&q=80`}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4 text-white sm:px-6 lg:px-8">
              <h1 className="max-w-xl text-2xl font-extrabold sm:text-4xl">
                {slide.title}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/90 sm:text-base">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="mt-4 inline-block rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-700"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="absolute left-2 top-[82%] z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 sm:top-1/2"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="absolute right-2 top-[82%] z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 sm:top-1/2"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-brand-green" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
