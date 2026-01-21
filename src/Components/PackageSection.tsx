/*
 * คำอธิบาย : Component สำหรับแสดงส่วนของแพ็กเกจ (เช่น แพ็กเกจมาใหม่, แพ็กเกจยอดนิยม)
 * ประกอบด้วยหัวข้อ, การ์ดแพ็กเกจที่เลื่อนได้แนวนอนด้วยปุ่มนำทาง, และปุ่มดูเพิ่มเติมที่ขยายแสดงเพิ่มเติม
 */

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CardPackage from "./CardPackage";

export type PackageData = {
  id: number;
  image: string;
  title: string;
  location: string;
  bookingStart?: string | Date | null;
  bookingEnd?: string | Date | null;
  bookingStatus?: "OPEN" | "CLOSED" | "UPCOMING";
  statusText?: string;
  booked?: number;
  capacity?: number;
  tags?: string[];
  priceTHB?: number;
};

interface PackageSectionProps {
  /** หัวข้อของส่วน (เช่น "แพ็กเกจมาใหม่") */
  title: string;
  /** แสดงป้าย "New" ด้านข้างหัวข้อหรือไม่ */
  isShowNewBadge?: boolean;
  /** รายการแพ็กเกจที่จะแสดง */
  packages: PackageData[];
  /** ฟังก์ชันที่เรียกเมื่อคลิกปุ่มดูเพิ่มเติม */
  onViewMore?: () => void;
}

/*
 * คำอธิบาย : แสดงส่วนของแพ็กเกจพร้อมการ์ดที่เลื่อนได้แนวนอนด้วยปุ่มนำทาง
 * แสดง 4 การ์ดต่อครั้ง และสามารถขยายเพื่อแสดงเพิ่มเติมได้
 * Input:
 *   - title: หัวข้อของส่วน
 *   - isShowNewBadge: แสดงป้าย "New" หรือไม่
 *   - packages: รายการแพ็กเกจ
 *   - onViewMore: ฟังก์ชันเมื่อคลิกดูเพิ่มเติม
 * Output: React Component ที่ render ส่วนของแพ็กเกจ
 */
export default function PackageSection({
  title,
  isShowNewBadge = false,
  packages,
  onViewMore,
}: PackageSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 4,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const navigate = useNavigate();

  /*
   * ฟังก์ชัน : scrollPrev
   * คำอธิบาย : เลื่อนไปยังการ์ดก่อนหน้า
   * Input : ไม่มี
   * Output : void
   */
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  /*
   * ฟังก์ชัน : scrollNext
   * คำอธิบาย : เลื่อนไปยังการ์ดถัดไป
   * Input : ไม่มี
   * Output : void
   */
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  /*
   * ฟังก์ชัน : onSelect
   * คำอธิบาย : อัปเดต state เมื่อสไลด์เปลี่ยน
   * Input : ไม่มี
   * Output : void
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  /*
   * ฟังก์ชัน : handleViewMore
   * คำอธิบาย : จัดการเมื่อคลิกปุ่มดูเพิ่มเติม - ขยายเพื่อแสดงแพ็กเกจเพิ่มเติม
   * Input : ไม่มี
   * Output : void
   */
  const handleViewMore = () => {
    setIsExpanded(!isExpanded);
    if (onViewMore) {
      onViewMore();
    }
  };

  return (
    <section className="w-full py-8 ">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
          {isShowNewBadge && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
              New
            </span>
          )}
        </div>

        {/* Package Cards with Carousel */}
        {!isExpanded ? (
          <div className="relative">
            <div className="overflow-hidden w-full pl-16 mx-auto" ref={emblaRef}>
              <div className="flex">
                {packages.map((pkg, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_25%] min-w-0 px-2"
                  >
                    <CardPackage
                      image={pkg.image}
                      title={pkg.title}
                      location={pkg.location}
                      bookingStart={pkg.bookingStart}
                      bookingEnd={pkg.bookingEnd}
                      bookingStatus={pkg.bookingStatus}
                      statusText={pkg.statusText}
                      booked={pkg.booked}
                      capacity={pkg.capacity}
                      tags={pkg.tags}
                      priceTHB={pkg.priceTHB}
                      onClick={() => {
                        navigate(`/tourist/package/${pkg.id}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            {packages.length > 4 && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  aria-label="Previous packages"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  aria-label="Next packages"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-700"
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
          </div>
        ) : (
          /* Expanded View - Show all packages in grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {packages.map((pkg, index) => (
              <CardPackage
                key={index}
                image={pkg.image}
                title={pkg.title}
                location={pkg.location}
                bookingStart={pkg.bookingStart}
                bookingEnd={pkg.bookingEnd}
                bookingStatus={pkg.bookingStatus}
                statusText={pkg.statusText}
                booked={pkg.booked}
                capacity={pkg.capacity}
                tags={pkg.tags}
                priceTHB={pkg.priceTHB}
                onClick={() => {
                  console.log("Package clicked:", pkg.title);
                }}
              />
            ))}
          </div>
        )}

        {/* View More Button */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleViewMore}
            className="px-6 py-2 border-2 border-gray-300 rounded-full text-base text-black hover:border-gray-400 transition-colors"
          >
            {isExpanded ? "แสดงน้อยลง" : "ดูเพิ่มเติม"}
          </button>
        </div>
      </div>
    </section>
  );
}
