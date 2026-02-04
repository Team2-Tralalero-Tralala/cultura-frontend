/*
 * คำอธิบาย : Component สำหรับแสดง carousel ภาพแบบ hero banner
 * ประกอบด้วยภาพหลัก, ปุ่มนำทางซ้าย-ขวา, และจุดบอกตำแหน่ง (pagination dots)
 * Input:
 *   - items: รายการภาพ (array of { image })
 *   - options: ตัวเลือกเสริมของ Embla
 *   - className: คลาสเสริมภายนอก
 * Output: React Component ที่ render carousel
 */

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

export type CarouselItem = {
  image: string;
};

interface HeroCarouselProps {
  /** รายการภาพที่จะแสดงใน carousel */
  items: CarouselItem[];
  /** ตัวเลือกเสริมของ Embla */
  options?: Parameters<typeof useEmblaCarousel>[0];
  /** คลาสเสริมภายนอกของคอมโพเนนต์ */
  className?: string;
}

/*
 * คำอธิบาย : แสดง carousel ภาพแบบ hero banner พร้อมปุ่มนำทางและ pagination dots
 * Input : HeroCarouselProps (items, options, className)
 * Output : React Component ที่ render carousel พร้อม navigation controls
 */
export default function HeroCarousel({ items, options, className }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  /*
   * ฟังก์ชัน : scrollPrev
   * คำอธิบาย : เลื่อนไปยังสไลด์ก่อนหน้า
   * Input : ไม่มี
   * Output : void
   */
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  /*
   * ฟังก์ชัน : scrollNext
   * คำอธิบาย : เลื่อนไปยังสไลด์ถัดไป
   * Input : ไม่มี
   * Output : void
   */
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  /*
   * ฟังก์ชัน : scrollTo
   * คำอธิบาย : เลื่อนไปยังสไลด์ตาม index ที่กำหนด
   * Input : index (number) - ดัชนีของสไลด์ที่ต้องการ
   * Output : void
   */
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  /*
   * ฟังก์ชัน : onSelect
   * คำอธิบาย : อัปเดต state เมื่อสไลด์เปลี่ยน
   * Input : ไม่มี
   * Output : void
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {/* Main Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%]">
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
                <img
                  src={item.image}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-16 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-white "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-white "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === selectedIndex ? "bg-white w-3 h-3" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
