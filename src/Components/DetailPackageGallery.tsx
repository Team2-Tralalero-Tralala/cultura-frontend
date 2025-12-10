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
 *   Component สำหรับแสดงแกลเลอรีสื่อ (รูป/วิดีโอ) ของแพ็กเกจ
 *   โดยเลือกสื่อหลัก และให้ผู้ใช้คลิกเปลี่ยนผ่านแถบ thumbnail ด้านล่าง
 * Input  :
 *   - packageDetail : ข้อมูลรายละเอียดแพ็กเกจที่มีไฟล์สื่อ (files)
 * Output :
 *   - JSX.Element ส่วน UI แสดงสื่อหลัก + แถบ thumbnail
 */
function DetailPackageGallery({ packageDetail }: { packageDetail: PackageDetailData }) {
  const [activeMediaItem, setActiveMediaItem] = useState<PackageMedia | null>(null);

  /**
   * Memo : sortedMediaFiles
   * คำอธิบาย : เรียงลำดับไฟล์สำหรับใช้เป็น thumbnail
   *   โดยให้ชนิด VIDEO มาก่อน ตามด้วย COVER และ GALLERY ตามลำดับ
   */
  const sortedMediaFiles = useMemo(() => {
    const mediaFiles = packageDetail.files || [];

    const videoMediaFiles = mediaFiles.filter((fileItem) => fileItem.type === "VIDEO");
    const coverMediaFiles = mediaFiles.filter((fileItem) => fileItem.type === "COVER");
    const galleryMediaFiles = mediaFiles.filter((fileItem) => fileItem.type === "GALLERY");

    // วิดีโออยู่ซ้ายสุด ตามด้วย cover และรูป gallery
    return [...videoMediaFiles, ...coverMediaFiles, ...galleryMediaFiles];
  }, [packageDetail.files]);

  /**
   * useEffect : เลือก media หลักตอนโหลดครั้งแรกหรือเมื่อ packageDetail.files เปลี่ยน
   * ลำดับการเลือก :
   *   1. COVER
   *   2. VIDEO
   *   3. GALLERY
   *   4. null (ถ้าไม่มีสื่อเลย)
   */
  useEffect(() => {
    const mediaFiles = packageDetail.files || [];

    const coverMedia = mediaFiles.find((fileItem) => fileItem.type === "COVER");
    const videoMedia = mediaFiles.find((fileItem) => fileItem.type === "VIDEO");
    const galleryMedia = mediaFiles.find((fileItem) => fileItem.type === "GALLERY");

    setActiveMediaItem(coverMedia || videoMedia || galleryMedia || null);
  }, [packageDetail.files]);

  /**
   * ฟังก์ชัน : buildMediaUrl
   * คำอธิบาย : สร้าง URL ของ media แต่ละรายการจากข้อมูลใน state
   * Input  : media?: PackageMedia | null
   * Output : string (URL ของไฟล์ หรือ "" ถ้าไม่มีข้อมูล)
   */
  const buildMediaUrl = (media?: PackageMedia | null): string =>
    media ? buildFileUrl(media.path) : "";

  return (
    <div className="space-y-4">
      {/* สื่อหลักด้านบน (รูป/วิดีโอ) */}
      <div className="w-full">
        {activeMediaItem ? (
          activeMediaItem.type === "VIDEO" ? (
            <video
              src={buildMediaUrl(activeMediaItem)}
              controls
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2 bg-black"
            />
          ) : (
            <img
              src={buildMediaUrl(activeMediaItem)}
              alt="package-main"
              className="w-full h-[400px] object-cover rounded-xl shadow mb-2"
            />
          )
        ) : (
          <img
            src="https://placehold.co/800x400?text=No+Image"
            alt="no-image"
            className="w-full h-[400px] object-cover rounded-xl shadow mb-2"
          />
        )}
      </div>

      {/* แถบ thumbnail ด้านล่าง (ถ้ามีไฟล์มากกว่า 0) */}
      {sortedMediaFiles.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-full">
            {sortedMediaFiles.map((mediaItem) => {
              const isActive = activeMediaItem?.id === mediaItem.id;
              const mediaUrl = buildMediaUrl(mediaItem);

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
                    <div className="relative w-[120px] h-[80px]">
                      <video
                        src={mediaUrl}
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      {/* ปุ่มเล่นซ้อนทับบน thumbnail วิดีโอ */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="ml-1 border-l-8 border-y-[8px] border-y-transparent border-l-emerald-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
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
