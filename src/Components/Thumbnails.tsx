// File: Thumbnails.tsx
/*
 * คำอธิบาย : แกลเลอรี่ภาพพร้อมแถบ Thumbnail ด้านล่าง
 * หน้าที่ : แสดงภาพหลักแบบสไลด์ และสลับภาพผ่านแถบ Thumbnail (ชิดซ้าย โปร่งใส กระทัดรัด)
 * มาตรฐานคอมเมนต์ : ใช้ Header block + JSDoc บนฟังก์ชันสำคัญ
 */

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";

/** รายการสื่อที่รองรับ (ปัจจุบัน: image) */
export type MediaItem = { type: "image"; src: string; alt?: string };

interface ThumbnailsProps {
  /** รายการสื่อที่จะแสดง */
  items: MediaItem[];
  /** ตัวเลือกเสริมของ Embla */
  options?: EmblaOptionsType;
  /** คลาสเสริมภายนอกของคอมโพเนนต์ */
  className?: string;
}

/*
 * Thumbnails
 * แสดงภาพหลัก + แถบ Thumbnail ด้านล่าง
 * - ชิดซ้าย (ไม่อยู่ตรงกลาง)
 * - โปร่งใส (ไม่มีพื้นหลังเทา)
 * - ลดขนาดให้กะทัดรัด (max-w-3xl)
 */
export default function Thumbnails({ items, options, className }: ThumbnailsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps" as const,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  /* ค่าคงที่ : จำนวนช่อง thumbnail ที่แสดงพร้อมกัน */
  const THUMBNAILS_VISIBLE_COUNT = 5 as const;

  /* Placeholder สำหรับเติมช่องว่างให้ครบจำนวน thumbnail */
  const placeholders = Array.from(
    { length: Math.max(0, THUMBNAILS_VISIBLE_COUNT - items.length) },
    (_, i) => i
  );

  /** ไปยังสไลด์ตามดัชนีที่เลือกจาก thumbnail */
  const onThumbClick = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  /** อัปเดตดัชนีเมื่อสไลด์เปลี่ยน และเลื่อนแถบ thumbnail ให้ตามภาพหลัก */
  const onSelect = useCallback(() => {
    if (!emblaApi || !thumbsApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbsApi.scrollTo(index);
  }, [emblaApi, thumbsApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    thumbsApi?.reInit();
  }, [thumbsApi, items]);

  return (
    // ✅ ชิดซ้าย และลดขนาด component ทั้งหมด
    <div className={`w-full max-w-3xl ml-0 ${className ?? ""}`}>
      {/* รูปหลัก */}
      <div
        className="overflow-hidden rounded-lg border border-gray-300 shadow-md bg-transparent"
        ref={emblaRef}
      >
        <div className="flex">
          {items.map((item, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-video w-full bg-transparent">
                <img
                  src={item.src}
                  alt={item.alt ?? `Slide ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnails ด้านล่าง (5 ช่อง, โปร่งใส, ชิดซ้าย) */}
      <div className="mt-3 w-full" ref={thumbsRef}>
        <div className="flex gap-2 justify-start w-full">
          {items.map((thumb, i) => {
            const isActive = i === selectedIndex;
            const widthPercent = 100 / THUMBNAILS_VISIBLE_COUNT;
            return (
              <button
                key={i}
                onClick={() => onThumbClick(i)}
                className={[
                  `relative overflow-hidden rounded-md border transition-all flex-[0_0_calc(${widthPercent}%_-_8px)] aspect-video bg-transparent`,
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300 hover:border-blue-300",
                ].join(" ")}
                aria-label={`Go to slide ${i + 1}`}
                type="button"
              >
                <img
                  src={thumb.src}
                  alt={thumb.alt ?? `Thumb ${i + 1}`}
                  className="h-full w-full object-cover rounded-md"
                  loading="lazy"
                />
              </button>
            );
          })}

          {/* Placeholder สำหรับช่องว่าง */}
          {placeholders.map((i) => (
            <div
              key={`placeholder-${i}`}
              className="flex-[0_0_calc(20%_-_8px)] aspect-video rounded-md border border-transparent bg-transparent"
            />
          ))}
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> develop
