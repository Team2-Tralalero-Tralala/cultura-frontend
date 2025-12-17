// File: Thumbnails.tsx

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";

export type MediaItem = { type: "image"; src: string; alt?: string };

interface ThumbnailsProps {
  items: MediaItem[];
  options?: EmblaOptionsType;
  className?: string;
}

export default function Thumbnails({
  items,
  options,
  className,
}: ThumbnailsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    ...options,
  });

  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  /** thumbnail ที่มองเห็นพร้อมกัน */
  const THUMB_VISIBLE = 5;

  /** เปลี่ยนรูปหลัก */
  const onThumbClick = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  /** sync state */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className={`w-full max-w-3xl ${className ?? ""}`}>
      {/* รูปหลัก */}
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-lg border shadow-md"
      >
        <div className="flex">
          {items.map((item, i) => (
            <div key={i} className="flex-[0_0_100%]">
              <img
                src={item.src}
                alt={item.alt ?? `Slide ${i + 1}`}
                className="w-full aspect-video object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail viewport (เห็นแค่ 5) */}
      <div
        ref={thumbsRef}
        className="mt-3 overflow-hidden"
      >
        <div className="flex gap-2">
          {items.map((thumb, i) => {
            const isActive = i === selectedIndex;

            return (
              <button
                key={i}
                onClick={() => onThumbClick(i)}
                type="button"
                className={[
                  "relative aspect-video overflow-hidden rounded-md border transition-all",
                  "flex-[0_0_calc((100%_-_32px)/5)]", // 👈 สำคัญ
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300 hover:border-blue-300",
                ].join(" ")}
              >
                <img
                  src={thumb.src}
                  alt={thumb.alt ?? `Thumb ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
