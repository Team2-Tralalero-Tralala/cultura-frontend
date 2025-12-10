/**
 * Component : DetailPackageGallery
 * คำอธิบาย :
 *   แสดงสื่อของแพ็กเกจ (รูปภาพ/วิดีโอ) ในรูปแบบแกลเลอรี
 *   โดยมีสื่อหลักด้านบน และแถบตัวอย่าง (thumbnail) ให้ผู้ใช้เลือกสลับดูได้
 * Input :
 *   - packageDetail : ข้อมูลรายละเอียดแพ็กเกจที่มีรายการไฟล์แนบ (files)
 * Output :
 *   - แสดงสื่อหลักของแพ็กเกจ พร้อม thumbnail เรียงลำดับ (VIDEO, COVER, GALLERY)
 */

import { useEffect, useMemo, useState } from "react";

/**
 * ค่าคงที่ : API_BASE_URL
 * คำอธิบาย : base URL ของ API ที่ดึงมาจาก environment variable
 *   ตัวอย่างค่า : "http://localhost:3000/api"
 */
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * ค่าคงที่ : BASE_URL
 * คำอธิบาย : origin ของเว็บ (ไม่มี path /api ต่อท้าย)
 *   ใช้สำหรับประกอบเป็น URL ของไฟล์รูป/วิดีโอ
 *   ตัวอย่างค่า : "http://localhost:3000"
 */
const BASE_URL = new URL(API_BASE_URL).origin;
type MediaType = "COVER" | "GALLERY" | "VIDEO";

/**
 * Interface : PackageMedia
 * คำอธิบาย : โครงสร้างข้อมูลไฟล์สื่อของแพ็กเกจแต่ละรายการ
 */
interface PackageMedia {
  id: number;
  path: string;
  type: MediaType;
}

/**
 * Interface : PackageDetailData
 * คำอธิบาย : ข้อมูลรายละเอียดแพ็กเกจที่จำเป็นสำหรับ Component นี้
 */
interface PackageDetailData {
  // สามารถมี field อื่น ๆ เพิ่มเติมได้ แต่ใน Component นี้ใช้เฉพาะ files
  files: PackageMedia[];
}

/**
 * ฟังก์ชัน : buildFileUrl
 * คำอธิบาย :
 *   แปลง path ของไฟล์ให้เป็น URL ที่เรียกดูได้ในเบราว์เซอร์
 *   รองรับหลายกรณี เช่น
 *   - "uploads/store1.jpg"
 *   - "/uploads/store1.jpg"
 *   - หรือเป็น URL เต็มอยู่แล้ว (http:// หรือ https://)
 * Input  :
 *   - rawPath?: string  — path ดิบที่มาจาก backend
 * Output :
 *   - string            — URL ที่สมบูรณ์พร้อมใช้งาน
 */
const buildFileUrl = (rawPath?: string): string => {
  if (!rawPath) return "";

  // ถ้าเป็น URL เต็มอยู่แล้วให้ใช้ได้เลย
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }

  // ตัด "/" ด้านหน้าทิ้ง เช่น "/uploads/store1.jpg" -> "uploads/store1.jpg"
  const cleanPath = rawPath.replace(/^\/+/, "");

  // ประกอบเป็น URL เต็ม เช่น http://localhost:3000/uploads/store1.jpg
  return `${BASE_URL}/${cleanPath}`;
};
/**
 * ฟังก์ชัน : DetailPackageGallery
 * คำอธิบาย :
 *   Component สำหรับแสดงสื่อของแพ็กเกจ (ภาพ / วิดีโอ)
 *   - แสดงสื่อหลักด้านบน 1 รายการ (เลือกจาก COVER > VIDEO > GALLERY)
 *   - แสดงแถบ Thumbnail ด้านล่าง สามารถคลิกเพื่อสลับสื่อที่แสดงด้านบนได้
 *   - รองรับทั้งไฟล์ประเภท COVER, GALLERY และ VIDEO
 *
 * Input :
 *   - packageDetail.files : รายการไฟล์ของแพ็กเกจ (id, path, type)
 *
 * Output :
 *   - JSX ส่วนของสื่อในหน้า Detail Package
 */

function DetailPackageGallery({
  packageDetail,
}: {
  packageDetail: PackageDetailData;
}) {
  /**
   * state : activeMediaItem
   * คำอธิบาย : เก็บไฟล์สื่อที่กำลังถูกแสดงด้านบน
   */
  const [activeMediaItem, setActiveMediaItem] =
    useState<PackageMedia | null>(null);

  /**
   * ตัวแปร : sortedMediaFiles
   * คำอธิบาย :
   *   - กรองไฟล์ที่ไม่มี path ทิ้งก่อน
   *   - เรียงลำดับไฟล์ใหม่ให้ VIDEO อยู่ซ้ายสุด ตามด้วย COVER และ GALLERY
   *   - ใช้ useMemo เพื่อไม่ให้คำนวณซ้ำเมื่อ packageDetail.files ไม่เปลี่ยน
   */
  const sortedMediaFiles = useMemo(() => {
    // กรองเฉพาะไฟล์ที่มี path จริง ๆ
    const mediaFiles = (packageDetail.files || []).filter(
      (mediaItem) => !!mediaItem.path && mediaItem.path.trim() !== ""
    );

    const videoMediaFiles = mediaFiles.filter(
      (fileItem) => fileItem.type === "VIDEO"
    );
    const coverMediaFiles = mediaFiles.filter(
      (fileItem) => fileItem.type === "COVER"
    );
    const galleryMediaFiles = mediaFiles.filter(
      (fileItem) => fileItem.type === "GALLERY"
    );

    // เรียงตามลำดับที่ต้องการ
    return [...videoMediaFiles, ...coverMediaFiles, ...galleryMediaFiles];
  }, [packageDetail.files]);

  /**
   * useEffect :
   *   - ใช้เลือก "สื่อหลัก" ครั้งแรกเมื่อโหลด component / เมื่อไฟล์เปลี่ยน
   *   - ลำดับการเลือก: COVER > VIDEO > GALLERY
   *   - ถ้าไม่เจอเลยให้เป็น null แล้ว fallback ไปเป็นรูป No Image
   */
  useEffect(() => {
    const mediaFiles = (packageDetail.files || []).filter(
      (mediaItem) => !!mediaItem.path && mediaItem.path.trim() !== ""
    );

    const coverMedia = mediaFiles.find(
      (fileItem) => fileItem.type === "COVER"
    );
    const videoMedia = mediaFiles.find(
      (fileItem) => fileItem.type === "VIDEO"
    );
    const galleryMedia = mediaFiles.find(
      (fileItem) => fileItem.type === "GALLERY"
    );

    setActiveMediaItem(coverMedia || videoMedia || galleryMedia || null);
  }, [packageDetail.files]);

  /**
   * ฟังก์ชัน : buildMediaUrl
   * คำอธิบาย : แปลง path ของไฟล์ให้เป็น URL ที่พร้อมใช้งานบนหน้าเว็บ
   * หมายเหตุ : buildFileUrl เป็น util ภายนอกที่ประกอบ BASE_URL + path
   */
  const buildMediaUrl = (media?: PackageMedia | null): string =>
    media ? buildFileUrl(media.path) : "";

  const activeMediaUrl = buildMediaUrl(activeMediaItem);

  return (
    <div className="space-y-4">
      {/* ===== สื่อหลักด้านบน (รูปหรือวิดีโอ) ===== */}
      <div className="w-full">
        {activeMediaItem && activeMediaUrl ? (
          activeMediaItem.type === "VIDEO" ? (
            <video
              src={activeMediaUrl}
              controls
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2 bg-black"
            />
          ) : (
            <img
              src={activeMediaUrl}
              alt="package-main"
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2"
            />
          )
        ) : (
          // กรณีไม่มีสื่อเลย แสดงภาพ Placeholder
          <img
            src="https://placehold.co/800x400?text=No+Image"
            alt="no-image"
            className="w-full h-[400px] object-cover rounded-xl shadow mb-2"
          />
        )}
      </div>

      {/* ===== แถบ Thumbnail ด้านล่าง (เลื่อนแนวนอนได้ ถ้ามีไฟล์) ===== */}
      {sortedMediaFiles.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-full">
            {sortedMediaFiles.map((mediaItem) => {
              const mediaUrl = buildMediaUrl(mediaItem);
              // ถ้า URL ว่าง ไม่ต้องเรนเดอร์ thumbnail นั้น
              if (!mediaUrl) return null;

              const isActive = activeMediaItem?.id === mediaItem.id;

              return (
                <button
                  key={mediaItem.id}
                  type="button"
                  onClick={() => setActiveMediaItem(mediaItem)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    isActive ? "border-emerald-600" : "border-gray-200"
                  }`}
                >
                  {mediaItem.type === "VIDEO" ? (
                    // Thumbnail สำหรับ VIDEO : แสดงภาพตัวอย่าง + ปุ่ม play ทับด้านบน
                    <div className="relative w-[120px] h-[80px]">
                      <video
                        src={mediaUrl}
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="ml-1 border-l-8 border-y-[8px] border-y-transparent border-l-emerald-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Thumbnail สำหรับภาพนิ่ง
                    <img
                      src={mediaUrl}
                      alt={mediaItem.type}
                      className="w-[120px] h-[80px] object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailPackageGallery;
