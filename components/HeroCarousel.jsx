"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89",
  "https://images.unsplash.com/photo-1758467700578-7491a5c7eedd",
  "https://images.unsplash.com/photo-1593642634367-d91a135587b5",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
  "https://images.unsplash.com/photo-1585771724684-38269d6639fd",
];

const AUTOPLAY_INTERVAL_MS = 4000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={`${src}?auto=format&fit=crop&w=1920&q=80`}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-black/70" />

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-brand-green" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
