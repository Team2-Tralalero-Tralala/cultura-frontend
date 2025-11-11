/**
 * File: AvatarUploader.tsx
 * Component: AvatarUploader
 * Description:
 *   - อัปโหลดรูปโปรไฟล์วงกลม พร้อมปุ่มแก้ไขเล็กๆ ที่มุมล่างขวา
 *   - แสดงไอคอนรูปคนเมื่อยังไม่มีรูป
 *   - ใช้ react-easy-crop สำหรับครอปรูป
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Cropper from "react-easy-crop";

/**
 * ฟังก์ชัน: cropImageToFile
 * วัตถุประสงค์: ครอปภาพตามขนาดที่กำหนดและแปลงกลับเป็นไฟล์ใหม่
 * Input:
 *   - file: ไฟล์ต้นฉบับ (File)
 *   - area: พื้นที่ครอป (x, y, width, height)
 *   - mime: ประเภทไฟล์ (image/jpeg, image/png)
 *   - quality: คุณภาพของภาพ (0.0 - 1.0)
 * Output:
 *   - ไฟล์ภาพใหม่หลังครอป (File)
 */
async function cropImageToFile(
  file: File,
  area: { x: number; y: number; width: number; height: number },
  mime = "image/jpeg",
  quality = 0.95
): Promise<File> {
  const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });

  const canvasElement = document.createElement("canvas");
  canvasElement.width = Math.max(1, Math.floor(area.width));
  canvasElement.height = Math.max(1, Math.floor(area.height));

  const canvasContext = canvasElement.getContext("2d")!;
  canvasContext.drawImage(
    imageElement,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  const blob: Blob = await new Promise((resolve) =>
    canvasElement.toBlob((blobData) => resolve(blobData!), mime, quality)
  );

  const newFileName = file.name.replace(/\.(\w+)$/, "_cropped.$1");
  return new File([blob], newFileName, { type: blob.type });
}

/**
 * Type: AvatarUploaderProps
 * วัตถุประสงค์: ระบุ Props ที่รับเข้ามาใน AvatarUploader
 */
export type AvatarUploaderProps = {
  avatarSize?: number;
  avatarUrl?: string | null;
  onAvatarChange?: (file: File | null) => void;
  autoCropOnPick?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * Component: AvatarUploader
 * วัตถุประสงค์: ใช้สำหรับอัปโหลดและครอปรูปโปรไฟล์ในรูปแบบวงกลม
 */
export default function AvatarUploader({
  avatarSize = 220,
  avatarUrl = null,
  onAvatarChange,
  autoCropOnPick = true,
  disabled = false,
  className = "",
}: AvatarUploaderProps) {
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarPreviewUrl = useObjectUrl(avatarFile, avatarUrl);

  const [isCropping, setIsCropping] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const avatarStyle = useMemo(
    () => ({ width: `${avatarSize}px`, height: `${avatarSize}px` }),
    [avatarSize]
  );

  /**
   * ฟังก์ชัน: pickAvatar
   * วัตถุประสงค์: เปิดหน้าต่างเลือกไฟล์ภาพจากเครื่อง
   */
  const pickAvatar = () => !disabled && inputRef.current?.click();

  /**
   * ฟังก์ชัน: handleAvatarPicked
   * วัตถุประสงค์: เมื่อผู้ใช้เลือกไฟล์ภาพ → เก็บไฟล์ลง state และเตรียมครอป
   * Input: event (React.ChangeEvent<HTMLInputElement>)
   */
  const handleAvatarPicked: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setAvatarFile(selectedFile);
    event.currentTarget.value = "";
    if (autoCropOnPick && selectedFile && selectedFile.type.startsWith("image/")) {
      setIsCropping(true);
      setCropZoom(1);
      setCropPosition({ x: 0, y: 0 });
      setCropPixels(null);
      return;
    }
    onAvatarChange?.(selectedFile);
  };

  /**
   * ฟังก์ชัน: onCropComplete
   * วัตถุประสงค์: เก็บตำแหน่งและขนาดพื้นที่ที่ผู้ใช้ครอปไว้ใน state
   * Input: areaPixels (ตำแหน่งครอปจาก react-easy-crop)
   */
  const onCropComplete = (_unused: any, areaPixels: any) => {
    setCropPixels({
      x: Math.round(areaPixels.x),
      y: Math.round(areaPixels.y),
      width: Math.round(areaPixels.width),
      height: Math.round(areaPixels.height),
    });
  };

  /**
   * ฟังก์ชัน: applyCrop
   * วัตถุประสงค์: ครอปภาพตามขนาดที่เลือกและอัปเดตภาพใหม่
   */
  const applyCrop = async () => {
    if (!isCropping || !cropPixels || !avatarFile) return;
    const croppedFile = await cropImageToFile(avatarFile, cropPixels, "image/jpeg", 0.95);
    setAvatarFile(croppedFile);
    onAvatarChange?.(croppedFile);
    setIsCropping(false);
  };

  /**
   * ฟังก์ชัน: useOriginal
   * วัตถุประสงค์: ใช้ภาพต้นฉบับโดยไม่ครอป
   */
  const useOriginal = () => {
    onAvatarChange?.(avatarFile ?? null);
    setIsCropping(false);
  };

  // Section: Render
  return (
    <>
      <div className={`relative inline-block ${className}`} style={avatarStyle}>
        {/* Input File */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarPicked}
          aria-hidden="true"
          disabled={disabled}
        />

        {/* วงกลมแสดงรูป */}
        <div
          onClick={pickAvatar}
          className={[
            "relative overflow-hidden rounded-full border border-gray-400 bg-gray-300 flex items-center justify-center",
            "shadow-[0_4px_10px_rgba(0,0,0,0.15)]",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-gray-200",
          ].join(" ")}
          style={avatarStyle}
        >
          {avatarPreviewUrl ? (
            <img
              src={avatarPreviewUrl}
              alt="avatar"
              className="absolute inset-0 w-full h-full object-cover rounded-full"
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center text-gray-700 select-none">
              <Icon icon="mdi:account" className="w-20 h-20" />
              <span className="text-base font-medium mt-2">เพิ่มรูปโปรไฟล์</span>
            </div>
          )}
        </div>

        {/* ปุ่มแก้ไข (ดินสอ) */}
        <button
          type="button"
          onClick={pickAvatar}
          disabled={disabled}
          className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center 
           rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50"
        >
          <Icon icon="iconamoon:edit" className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {/* Modal ครอปภาพ */}
      {isCropping && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-4 w-[90vw] max-w-[640px] h-[80vh] max-h-[720px] flex flex-col gap-3">
            <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
              <Cropper
                image={avatarPreviewUrl!}
                crop={cropPosition}
                zoom={cropZoom}
                aspect={1}
                cropShape="round"
                showGrid
                onCropChange={setCropPosition}
                onZoomChange={setCropZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={cropZoom}
              onChange={(event) => setCropZoom(Number(event.target.value))}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => setIsCropping(false)}
              >
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-slate-200"
                onClick={useOriginal}
              >
                ใช้รูปเดิม
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                onClick={applyCrop}
              >
                ใช้รูปที่ครอป
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook: useObjectUrl
 * วัตถุประสงค์: สร้าง URL ชั่วคราวจากไฟล์ภาพสำหรับแสดง preview
 * Input:
 *   - file: ไฟล์ภาพ (File | null)
 *   - fallbackUrl: URL สำรองถ้าไม่มีไฟล์
 * Output:
 *   - URL ของภาพ (string | null)
 */
function useObjectUrl(file: File | null, fallbackUrl: string | null) {
  const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);
  useEffect(() => {
    if (!file) {
      setUrl(fallbackUrl ?? null);
      return;
    }
    const tempUrl = URL.createObjectURL(file);
    setUrl(tempUrl);
    return () => URL.revokeObjectURL(tempUrl);
  }, [file, fallbackUrl]);
  return url;
}
