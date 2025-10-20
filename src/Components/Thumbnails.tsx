// File: Thumbnails.tsx
/*
 * ชื่อไฟล์      : Thumbnails.tsx
 * คำอธิบาย     : คอมโพเนนต์แกลเลอรี่ภาพพร้อมสไลด์หลัก + แถบ Thumbnail ด้านล่าง
 * บริบทการใช้   : ฝั่ง Client (React)
 * คุณสมบัติหลัก : - สไลด์ภาพหลักเลื่อนด้วย Embla (loop)
 *                 - แถบ Thumbnail ด้านล่างแบบชิดซ้าย โปร่งใส กะทัดรัด (แสดง 5 ช่อง)
 *                 - กดที่ Thumbnail เพื่อเลื่อนไปยังภาพหลักตามดัชนี
 * มาตรฐานคอมเมนต์: ใช้ Header block และ JSDoc บนฟังก์ชันสำคัญ
 *
 * Input Props   :
 *   - items     : รายการสื่อที่จะแสดง (รองรับชนิด image)
 *   - options   : ตัวเลือกเสริมสำหรับ Embla carousel
 *   - className : คลาสเสริมภายนอก
 *
 * Output        : React Element ของคอมโพเนนต์แกลเลอรี่
 *
 * อ้างอิงมาตรฐาน: Coding Standard – การเขียนคอมเมนต์ไฟล์/ฟังก์ชันฝั่ง Client
 * หมายเหตุ      : โค้ดนี้ยึดตามแนวทางในเอกสารมาตรฐานทีม (ดูรายละเอียดข้อ 8.1 และ 8.3)
 */

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";

/**
 * รายการชนิดสื่อที่รองรับภายในแกลเลอรี่
 * @typedef MediaItem
 * @property {"image"} type - ประเภทสื่อ (ปัจจุบันรองรับ image)
 * @property {string} src - แหล่งที่มาของรูปภาพ (URL/Path)
 * @property {string} [alt] - คำอธิบายรูปเพื่อการเข้าถึง (accessibility)
 */
export type MediaItem = { type: "image"; src: string; alt?: string };

/**
 * พารามิเตอร์สำหรับคอมโพเนนต์ Thumbnails
 * @typedef ThumbnailsProps
 * @property {MediaItem[]} items - รายการสื่อที่จะแสดงในสไลด์และ thumbnail
 * @property {EmblaOptionsType} [options] - ตัวเลือกเสริมของ Embla
 * @property {string} [className] - คลาสเสริมภายนอกของคอมโพเนนต์
 */
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

/**
 * คอมโพเนนต์แกลเลอรี่ภาพที่ใช้ Embla สำหรับสไลด์หลักและแถบ Thumbnail
 * @function Thumbnails
 * @param {ThumbnailsProps} props - พารามิเตอร์สำหรับคอมโพเนนต์
 * @returns {JSX.Element} องค์ประกอบ React
 */
export default function Thumbnails({ items, options, className }: ThumbnailsProps) {
  // -- Embla instances สำหรับสไลด์หลักและแถบ thumbnail --
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps" as const,
  });

  /** ดัชนีสไลด์ที่ถูกเลือกอยู่ในขณะนี้ (sync กับแถบ thumbnail) */
  const [selectedIndex, setSelectedIndex] = useState(0);

  /** จำนวนช่อง thumbnail ที่ต้องการให้มองเห็นพร้อมกัน (สำหรับคำนวณความกว้าง) */
  const THUMBNAILS_VISIBLE_COUNT = 5 as const;

  /**
   * สร้าง placeholder เพื่อเติมช่องว่างให้ครบจำนวน thumbnail ที่กำหนด
   * ประโยชน์: ทำให้แถบ thumbnail คง layout เดิม แม้จำนวนรูปจะน้อยกว่าเกณฑ์
   */
  const placeholders = Array.from(
    { length: Math.max(0, THUMBNAILS_VISIBLE_COUNT - items.length) },
    (_, i) => i
  );

  /**
   * ไปยังสไลด์หลักตามดัชนีที่คลิกจาก thumbnail
   * @param {number} index - ดัชนีสไลด์ที่ต้องการเลื่อนไป
   * @returns {void} ไม่คืนค่า
   */
  const onThumbClick = useCallback(
    (index: number): void => {
      // ป้องกันการเรียกใช้ก่อน emblaApi พร้อม
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  /**
   * อัปเดตดัชนีที่เลือกเมื่อสไลด์หลักเปลี่ยน และเลื่อนแถบ thumbnail ให้ตามภาพหลัก
   * เหตุผล: คงความสอดคล้องระหว่างสไลด์หลักและ thumbnail
   * @returns {void} ไม่คืนค่า
   */
  const onSelect = useCallback((): void => {
    if (!emblaApi || !thumbsApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbsApi.scrollTo(index);
  }, [emblaApi, thumbsApi]);

  /**
   * life-cycle: subscribe เหตุการณ์ของ Embla เมื่อพร้อมใช้งาน
   * - select : เรียก onSelect เมื่อสไลด์เปลี่ยน
   * - reInit : sync ดัชนีเมื่อมีการ re-initialize
   */
  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // sync ครั้งแรกเมื่อพร้อม
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  /**
   * life-cycle: re-init แถบ thumbnail เมื่ออ็อบเจ็กต์ thumbsApi พร้อมหรือรายการเปลี่ยน
   * เหตุผล: ให้ Embla ของ thumbnail คำนวณขนาดใหม่ตามจำนวน/อัตราส่วนรูป
   */
  useEffect(() => {
    thumbsApi?.reInit();
  }, [thumbsApi, items]);

  return (
    <div className={`w-full max-w-3xl ml-0 ${className ?? ""}`}>
      {/* ======================= รูปหลัก (Main Slider) ======================= */}
      <div
        className="overflow-hidden rounded-lg border border-gray-300 shadow-md bg-transparent"
        ref={emblaRef}
        aria-roledescription="carousel"
        aria-label="Main image slider"
      >
        <div className="flex">
          {items.map((item, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              {/* ใช้ aspect-video เพื่อคงอัตราส่วนภาพให้สม่ำเสมอ */}
              <div className="relative aspect-video w-full bg-transparent">
                {/* หมายเหตุ: ใช้ loading="lazy" ลด LCP บนภาพรอง/ถัดไป */}
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

      {/* ========== แถบ Thumbnails (ชิดซ้าย / โปร่งใส / 5 ช่องที่มองเห็น) ========== */}
      <div className="mt-3 w-full" ref={thumbsRef} aria-label="Thumbnails">
        <div className="flex gap-2 justify-start w-full">
          {items.map((thumb, i) => {
            const isActive = i === selectedIndex;
            const widthPercent = 100 / THUMBNAILS_VISIBLE_COUNT;

            return (
              <button
                key={i}
                onClick={() => onThumbClick(i)}
                className={[
                  // คำนวณความกว้างตามจำนวนที่ต้องการให้เห็นพร้อมกัน
                  `relative overflow-hidden rounded-md border transition-all flex-[0_0_calc(${widthPercent}%_-_8px)] aspect-video bg-transparent`,
                  // สไตล์เน้นกรอบเมื่อเป็น thumbnail ที่ active
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300 hover:border-blue-300",
                ].join(" ")}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive ? "true" : "false"}
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

          {/* Placeholder: เติมช่องว่างให้ครบ layout เมื่อรูปมีน้อยกว่าเกณฑ์ */}
          {placeholders.map((i) => (
            <div
              key={`placeholder-${i}`}
              className="flex-[0_0_calc(20%_-_8px)] aspect-video rounded-md border border-transparent bg-transparent"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
