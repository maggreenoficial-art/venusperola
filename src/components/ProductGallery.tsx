"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-white">
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${alt} - foto ${activeIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={activeIndex === 0}
        />
      </div>

      {images.length > 1 && (
        <div className="scroll-x-touch flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden border bg-white transition-colors sm:h-20 sm:w-20",
                index === activeIndex
                  ? "border-accent"
                  : "border-white/10 hover:border-white/30"
              )}
              aria-label={`Ver foto ${index + 1}`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-contain"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
