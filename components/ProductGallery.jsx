"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL, imageAlt } from "@/lib/utils";

export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="type-caption flex aspect-square w-full items-center justify-center rounded-[18px] bg-parchment text-ink-48">
        No image available
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-parchment">
        <Image
          src={active.src}
          alt={imageAlt(active, productName, activeIndex)}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="product-shadow object-contain p-10 sm:p-16"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id ?? index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment transition-shadow sm:h-20 sm:w-20 ${
                index === activeIndex ? "shadow-[inset_0_0_0_2px_#0071e3]" : ""
              }`}
            >
              <Image
                src={image.src}
                alt={imageAlt(image, productName, index)}
                fill
                sizes="100px"
                className="object-contain p-2"
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
