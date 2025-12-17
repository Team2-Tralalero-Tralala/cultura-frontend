/*
 * File: Thumbnails.tsx
 * คำอธิบาย : แกลเลอรี่ภาพพร้อม Thumbnail ด้านล่าง
 * - Thumbnail เห็นพร้อมกันสูงสุด 5 รูป
 * - ถ้ามากกว่า 5 สามารถ drag หรือ scroll bar เลื่อนได้
 * - รองรับ custom สีผ่าน props
 */

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";

/** ประเภทสื่อที่รองรับ */
export type MediaItem = {
  type: "image";
  src: string;
  alt?: string;
};

/** สีที่สามารถ custom ได้ */
export interface ThumbnailColors {
  activeBorder?: string;
  activeRing?: string;
  hoverBorder?: string;
  scrollbarThumb?: string;
  scrollbarTrack?: string;
}

interface ThumbnailsProps {
  items: MediaItem[];
  options?: EmblaOptionsType;
  className?: string;

  /** custom สี */
  colors?: ThumbnailColors;
}

export default function Thumbnails({
  items,
  options,
  className,
  colors,
}: ThumbnailsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    ...options,
  });

  const [thumbsRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  /** จำนวน thumbnail ที่เห็นพร้อมกัน */
  const VISIBLE_COUNT = 5;

  /** สี default */
  const {
    activeBorder = "#22c55e",
    activeRing = "#22c55e",
    hoverBorder = "#4ade80",
    scrollbarThumb = "#22c55e",
    scrollbarTrack = "#e5e7eb",
  } = colors ?? {};

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
      {/* ===== รูปหลัก ===== */}
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-lg border border-gray-300 shadow-md"
      >
        <div className="flex">
          {items.map((item, i) => (
            <div key={i} className="flex-[0_0_100%]">
              <img
                src={item.src}
                alt={item.alt ?? `Slide ${i + 1}`}
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Thumbnail + Scrollbar ===== */}
      <div
        ref={thumbsRef}
        className="mt-3 overflow-x-auto overflow-y-hidden thumbs-scrollbar"
      >
        <div className="flex gap-2">
          {items.map((thumb, i) => {
            const isActive = i === selectedIndex;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onThumbClick(i)}
                style={{
                  borderColor: isActive ? activeBorder : undefined,
                  boxShadow: isActive
                    ? `0 0 0 2px ${activeRing}`
                    : undefined,
                }}
                className={[
                  "relative aspect-video overflow-hidden rounded-md border transition-all",
                  "flex-[0_0_calc((100%_-_32px)/5)]",
                  !isActive && "hover:border-[color:var(--hover-border)]",
                ].join(" ")}
              >
                <img
                  src={thumb.src}
                  alt={thumb.alt ?? `Thumb ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
