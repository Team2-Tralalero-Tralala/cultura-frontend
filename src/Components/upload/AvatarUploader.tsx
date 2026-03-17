/**
คำอธิบาย: Component สำหรับอัปโหลดและครอปรูปภาพโปรไฟล์
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Cropper from "react-easy-crop";
import { ModalAlert } from "@/Components/Modal/ModalAlert";

/**
 * คำอธิบาย: ครอปภาพตามขนาดที่กำหนดและแปลงกลับเป็นไฟล์ใหม่
 * Input:
 *   - file: ไฟล์ต้นฉบับ (File)
 *   - area: พื้นที่ครอป (x, y, width, height)
 *   - mime: ประเภทไฟล์ (image/jpeg)
 *   - quality: คุณภาพของภาพ (0.0 - 1.0)
 * Output:
 *   - ไฟล์ภาพใหม่หลังครอป (Promise<File>)
 */
async function cropImageToFile(
  file: File,
  area: { x: number; y: number; width: number; height: number },
  mime = "image/jpeg",
  quality = 0.95,
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
    canvasElement.height,
  );

  const blob: Blob = await new Promise((resolve) =>
    canvasElement.toBlob((blobData) => resolve(blobData!), mime, quality),
  );

  const newFileName = file.name.replace(/\.(\w+)$/, "_cropped.$1");
  return new File([blob], newFileName, { type: blob.type });
}

/**
 * Type: AvatarUploaderProps
 * วัตถุประสงค์: กำหนด Props สำหรับ AvatarUploader
 */
export type AvatarUploaderProps = {
  avatarSize?: number;
  avatarUrl?: string | null;
  onAvatarChange?: (file: File | null) => void;
  isAutoCropOnPick?: boolean; // Renamed from autoCropOnPick
  isDisabled?: boolean; // Renamed from disabled
  className?: string;
};

/**
 * คำอธิบาย : Component สำหรับอัปโหลดและครอปรูปภาพโปรไฟล์
 * Input:
 *   - avatarSize: ขนาดของ Avatar (px)
 *   - avatarUrl: URL ของรูปปัจจุบัน
 *   - onAvatarChange: Callback เมื่อรูปเปลี่ยน
 *   - isAutoCropOnPick: เปิด Modal crop อัตโนมัติเมื่อเลือกรูป
 *   - isDisabled: สถานะปิดการใช้งาน
 * Output:
 *   - JSX Element สำหรับ Avatar Uploader
 */
export default function AvatarUploader({
  avatarSize = 220,
  avatarUrl = null,
  onAvatarChange,
  isAutoCropOnPick = true,
  isDisabled = false,
  className = "",
}: AvatarUploaderProps) {
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);

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
    [avatarSize],
  );

  /**
   * คำอธิบาย: เปิดหน้าต่างเลือกไฟล์
   * input: ไม่มี
   * output: ไม่มี
   */
  const pickAvatar = () => !isDisabled && inputRef.current?.click();

  /**
   * คำอธิบาย: จัดการเมื่อมีการเลือกไฟล์
   * Input: event (Change Event)
   * Output: ไม่มี
   */
  const handleAvatarPicked: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setIsAlertOpen(true);
      event.currentTarget.value = "";
      return;
    }
    setAvatarFile(selectedFile);
    event.currentTarget.value = "";
    if (isAutoCropOnPick && selectedFile && selectedFile.type.startsWith("image/")) {
      setIsCropping(true);
      setCropZoom(1);
      setCropPosition({ x: 0, y: 0 });
      setCropPixels(null);
      return;
    }
    onAvatarChange?.(selectedFile);
  };

  /**
   * คำอธิบาย: บันทึกตำแหน่งการครอป
   * Input: _unused, areaPixels
   * Output: ไม่มี
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
   * คำอธิบาย: ยืนยันการครอปและสร้างไฟล์ใหม่
   * Input: ไม่มี
   * Output: ไม่มี
   */
  const applyCrop = async () => {
    if (!isCropping || !cropPixels || !avatarFile) return;
    const croppedFile = await cropImageToFile(avatarFile, cropPixels, "image/jpeg", 0.95);
    setAvatarFile(croppedFile);
    onAvatarChange?.(croppedFile);
    setIsCropping(false);
  };

  /**
   * คำอธิบาย: ใช้รูปต้นฉบับโดยไม่ครอป
   * Input: ไม่มี
   * Output: ไม่มี
   */
  const useOriginal = () => {
    onAvatarChange?.(avatarFile ?? null);
    setIsCropping(false);
  };

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
          disabled={isDisabled}
        />

        <div
          onClick={pickAvatar}
          className={[
            "relative overflow-hidden rounded-full border border-gray-400 bg-gray-300 flex items-center justify-center",
            "shadow-[0_4px_10px_rgba(0,0,0,0.15)]",
            isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-200",
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
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={pickAvatar}
          disabled={isDisabled}
          className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center 
           rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50"
        >
          <Icon icon="iconamoon:edit" className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {isCropping && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/70"
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
                type="button"
                className="px-4 py-2 rounded-lg border"
                onClick={() => setIsCropping(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-200"
                onClick={useOriginal}
              >
                ใช้รูปเดิม
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                onClick={applyCrop}
              >
                ใช้รูปที่ครอป
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalAlert
        isOpen={isAlertOpen}
        type="error"
        title="ขนาดไฟล์เกินกำหนด"
        message="ขนาดไฟล์เกิน 5MB กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5MB"
        onClose={() => setIsAlertOpen(false)}
      />
    </>
  );
}

/**
 * คำอธิบาย: สร้าง Object URL สำหรับ Preview
 * Input:
 *   - file: ไฟล์ภาพ (File)
 *   - fallbackUrl: URL เดิม (String)
 * Output:
 *   - URL ที่ใช้แสดงผล (String)
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
