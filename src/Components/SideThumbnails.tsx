/**
 * คำอธิบาย : Component สำหรับแสดงรูปภาพและวิดีโอแบบ Gallery พร้อม Thumbnail ด้านข้าง
 * รองรับการแสดงผลทั้งรูปภาพและวิดีโอ โดยมี Thumbnail ให้เลือกกดเปลี่ยนสื่อหลักได้
 */
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

/**
 * ประเภทข้อมูลสื่อ (Media Item)
 */
export type MediaItem = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

/**
 * Props ของ SideThumbnails Component
 */
interface SideThumbnailsProps {
  items: MediaItem[];
  className?: string;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับแสดง Side Thumbnails
 * Input: items (รายการรูป/วิดีโอ), className (คลาส CSS เพิ่มเติม)
 * Output : JSX Element แสดงผล Gallery
 */
export default function SideThumbnails({
  items,
  className,
}: SideThumbnailsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // เมื่อเปลี่ยนสื่อหลัก ให้เลื่อน Scroll หา Thumbnail นั้น
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!items || items.length === 0) return null;

  const currentItem = items[selectedIndex];

  return (
    <div className={`w-full ${className ?? ""}`}>
      {/* Grid: Desktop แบ่ง 3:1 / Mobile เรียงบนล่าง */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* ===== ส่วนที่ 1: สื่อหลัก (Main Viewer) ===== */}
        <div className="lg:col-span-3">
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black relative">
            {currentItem.type === "video" ? (
              <video
                key={currentItem.src}
                src={currentItem.src}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={currentItem.src}
                alt={currentItem.alt}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            )}
          </div>
        </div>

        {/* ===== ส่วนที่ 2: รายการ Thumbnail (Right Side) ===== */}
        <div className="lg:col-span-1 relative min-h-[100px]">
          <div
            ref={scrollRef}
            className="
              flex gap-2
              overflow-x-auto w-full
              lg:flex-col lg:absolute lg:inset-0 lg:overflow-y-auto lg:overflow-x-hidden
              scrollbar-thin pr-1
            "
          >
            {items.map((item, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`
                    flex-shrink-0 relative overflow-hidden rounded-lg border-2 transition-all duration-200 group
                    w-24 h-16
                    /* Desktop: ใช้ aspect-video เพื่อรักษาสัดส่วนและความสวยงาม ไม่บังคับจำนวนรูป */
                    lg:w-full lg:h-auto lg:aspect-video
                    ${
                      isActive
                        ? "border-green-600 opacity-100 ring-2 ring-green-600/20"
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                    }
                  `}
                >
                  {/* Thumbnail Content */}
                  {item.type === "video" ? (
                    <div className="w-full h-full bg-gray-900 relative flex items-center justify-center">
                      {/* แสดง Video แบบ Mute เป็น Thumbnail */}
                      <video
                        src={item.src}
                        className="w-full h-full object-cover opacity-70"
                        muted
                        preload="metadata"
                      />
                      {/* ไอคอน Play ทับด้านบนเพื่อให้รู้ว่าเป็นวิดีโอ */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-1 backdrop-blur-sm">
                          <Icon
                            icon="mdi:play"
                            className="text-white text-xl"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
