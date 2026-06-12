"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL } from "@/lib/utils";

export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        No image available
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={active.src}
          alt={active.alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id ?? index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-md border bg-gray-50 ${
                index === activeIndex ? "border-brand-green" : "border-gray-200"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt || productName}
                fill
                sizes="100px"
                className="object-contain p-1"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
