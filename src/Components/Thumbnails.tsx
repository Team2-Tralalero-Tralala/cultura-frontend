/**
 * คำอธิบาย :
 * Component สำหรับแสดงรูปภาพหลักพร้อม Thumbnail ด้านล่าง
 * ผู้ใช้สามารถคลิก Thumbnail เพื่อเปลี่ยนรูปหลักได้
 * เหมาะสำหรับหน้ารายละเอียด เช่น ร้านค้า, สินค้า หรือแกลเลอรีรูปภาพ
 *
 * วิธีใช้งาน (Usage) :
 *
 * <Thumbnails
 *   items={[
 *     {
 *       type: "image",
 *       src: "https://example.com/image-1.jpg",
 *       alt: "ตัวอย่างรูปที่ 1",
 *     },
 *     {
 *       type: "image",
 *       src: "https://example.com/image-2.jpg",
 *       alt: "ตัวอย่างรูปที่ 2",
 *     },
 *   ]}
 * />
 *
 * ตัวอย่างการใช้งานจริง :
 *
 * <div className="mb-12">
 *   {store?.storeImage?.length ? (
 *     <Thumbnails
 *       items={store.storeImage.map((file, index) => ({
 *         type: "image",
 *         src:
 *           resolveBackendUploadUrl(file.image) ||
 *           "https://placehold.co/600x400?text=No+Image",
 *         alt: `${store.name} - รูป ${index + 1}`,
 *       }))}
 *     />
 *   ) : (
 *     <p className="text-gray-500 text-[16px]">ไม่มีรูปภาพ</p>
 *   )}
 * </div>
 */

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";

/**
 * ประเภทของสื่อที่ใช้แสดงใน Carousel
 */
export type MediaItem = {
  type: "image";
  src: string;
  alt?: string;
};

/**
 * กำหนดสีที่ใช้ใน Thumbnail
 */
export interface ThumbnailColors {
  activeBorder?: string;
  activeRing?: string;
  hoverBorder?: string;
  scrollbarThumb?: string;
  scrollbarTrack?: string;
}

/**
 * Props ของ Thumbnails Component
 */
interface ThumbnailsProps {
  items: MediaItem[];
  options?: EmblaOptionsType;
  className?: string;
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

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const VISIBLE_COUNT = 5;

  const {
    activeBorder = "#22c55e",
    activeRing = "#22c55e",
    hoverBorder = "#4ade80",
    scrollbarThumb = "#22c55e",
    scrollbarTrack = "#e5e7eb",
  } = colors ?? {};

  /**
   * ฟังก์ชันสำหรับคลิก Thumbnail เพื่อเลื่อนไปยังรูปที่เลือก
   */
  const onThumbClick = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  /**
   * ฟังก์ชันสำหรับอัปเดต index ของรูปที่ถูกเลือก
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

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
          {items.map((item, index) => (
            <div key={index} className="flex-[0_0_100%]">
              <img
                src={item.src}
                alt={item.alt ?? `Slide ${index + 1}`}
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Thumbnail ===== */}
      <div
        ref={thumbsRef}
        className="mt-3 overflow-x-auto overflow-y-hidden thumbs-scrollbar"
      >
        <div className="flex gap-2">
          {items.map((thumb, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onThumbClick(index)}
                style={{
                  borderColor: isActive ? activeBorder : undefined,
                  boxShadow: isActive
                    ? `0 0 0 2px ${activeRing}`
                    : undefined,
                }}
                className={[
                  "relative aspect-video overflow-hidden rounded-md border transition-all",
                  `flex-[0_0_calc((100%_-_32px)/${VISIBLE_COUNT})]`,
                  !isActive && "hover:border-[color:var(--hover-border)]",
                ].join(" ")}
              >
                <img
                  src={thumb.src}
                  alt={thumb.alt ?? `Thumb ${index + 1}`}
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
