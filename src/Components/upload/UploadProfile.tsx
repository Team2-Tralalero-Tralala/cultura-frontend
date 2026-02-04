/*
 * File: UploadProfile.tsx
 * Component: UploadProfile (Client)
 * หน้าที่:
 *   - พื้นที่อัปโหลด 2 จุด: Cover (แบนเนอร์) และ Avatar (วงกลม) พร้อมพรีวิว
 *   - โหมดแก้ไข/ครอปภาพผ่าน react-easy-crop (เปิดเมื่อเลือกไฟล์ หรือกด “แก้ไข/ครอป”)
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Cropper from "react-easy-crop";

/**
 * ฟังก์ชัน: cropImageToFile
 */
async function cropImageToFile(
  file: File,
  area: { x: number; y: number; width: number; height: number },
  mime = "image/jpeg",
  quality = 0.95
): Promise<File> {
  // โหลดภาพจากไฟล์เป็น <img> เพื่อวาดลง Canvas
  const imageEl = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

  // เตรียม canvas ตามขนาด area ที่ต้องการครอป
  const canvasEl = document.createElement("canvas");
  canvasEl.width = Math.max(1, Math.floor(area.width));
  canvasEl.height = Math.max(1, Math.floor(area.height));

  // วาดเฉพาะส่วนที่ครอป
  const canvasCtx = canvasEl.getContext("2d")!;
  canvasCtx.drawImage(
    imageEl,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvasEl.width,
    canvasEl.height
  );

  // ออกเป็น Blob → ห่อเป็น File ใหม่ (ตั้งชื่อเติม _cropped)
  const blob: Blob = await new Promise((resolve) =>
    canvasEl.toBlob((b) => resolve(b!), mime, quality)
  );
  const outputName = file.name.replace(/\.(\w+)$/, "_cropped.$1");
  return new File([blob], outputName, { type: blob.type });
}

/**
 * ชนิดข้อมูล: UploadProfileProps
 * หมายเหตุการเข้าถึง (a11y):
 *  - ปุ่ม/อินพุตทุกจุดมี aria-* และ label อ้างอิง id จาก useId()
 *  - รูปภาพพรีวิวมี alt อธิบายสั้น ๆ
 */
export type UploadProfileProps = {
  // Layout
  width?: number | string;
  coverHeight?: number | string;
  avatarSize?: number; // เส้นผ่านศูนย์กลางวงกลม
  className?: string;

  // มุมโค้ง
  roundedCover?: string;
  roundedAvatar?: string;

  // สี/สไตล์
  coverBgClass?: string;
  coverBorderClass?: string;
  avatarBgClass?: string;
  avatarBorderClass?: string;

  // ข้อความ + ไอคอน
  coverLabel?: string;
  avatarLabel?: string;
  iconName?: string; // iconify name (default: "cil:image-plus")
  icon?: React.ReactNode;

  // พฤติกรรม
  disabled?: boolean;
  coverAccept?: string;
  avatarAccept?: string;
  autoFocusAvatar?: boolean;

  // ค่าจากภายนอก
  coverUrl?: string | null;
  avatarUrl?: string | null;

  // อีเวนต์
  onCoverChange?: (file: File | null) => void;
  onAvatarChange?: (file: File | null) => void;

  // Action bar mode/labels
  actionBarMode?: "hover" | "always";
  changeLabel?: string; // ป้าย “เปลี่ยนรูป”
  editLabel?: string; // ป้าย “แก้ไข/ครอป”

  // เปิดครอปอัตโนมัติเมื่อเลือกไฟล์
  autoCropOnPick?: boolean;
};

/**
 * ยูทิลิตี้: formatSize
 * แปลง number → `${n}px` หรือคืน string เดิม; ไม่มีค่าส่ง fallback
 */
const formatSize = (value?: number | string, fallback?: string) =>
  value == null ? fallback : typeof value === "number" ? `${value}px` : value;

/**
 * คอมโพเนนต์หลัก: UploadProfile
 * โครงสร้าง:
 *  - ปุ่ม/อินพุตสำหรับ Cover + Avatar (ซ่อน input file ไว้หลังปุ่ม)
 *  - พรีวิวรูป (ไฟล์ที่ครอป > ไฟล์ต้นฉบับ > URL จากภายนอก)
 *  - Modal ครอป (react-easy-crop) + ปุ่ม Apply/Cancel
 */
export default function UploadProfile({
  // layout
  width = "100%",
  coverHeight = 360,
  avatarSize = 280,
  className = "",

  // radius
  roundedCover = "rounded-2xl",
  roundedAvatar = "rounded-full",

  // labels + icon
  coverLabel = "คลิกเพื่อเพิ่มรูปภาพหน้าปก (JPG/JPEG/PNG)",
  avatarLabel = "เพิ่มรูปโลโก้ / โปรไฟล์ (JPG/JPEG/PNG)",
  iconName = "cil:image-plus",
  icon,

  // behavior
  disabled = false,
  coverAccept = "image/*",
  avatarAccept = "image/*",
  autoFocusAvatar = false,

  // controlled
  coverUrl = null,
  avatarUrl = null,

  // events
  onCoverChange,
  onAvatarChange,

  // action UI
  changeLabel = "เปลี่ยนรูป",
  editLabel = "แก้ไข/ครอป",

  // ครอปอัตโนมัติหลังเลือกไฟล์
  autoCropOnPick = true,
}: UploadProfileProps) {
  /** ---------- Refs/IDs ---------- */
  const uid = useId();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const coverButtonRef = useRef<HTMLButtonElement | null>(null);

  /** ---------- State: ไฟล์ต้นฉบับ/ไฟล์ที่ครอปแล้ว ---------- */
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [coverCroppedFile, setCoverCroppedFile] = useState<File | null>(null);
  const [avatarCroppedFile, setAvatarCroppedFile] = useState<File | null>(null);

  /** ---------- Preview URLs (UI/Cropper) ---------- */
  // สำหรับ UI จริง: ให้ความสำคัญรูปที่ครอปแล้วก่อน
  const coverPreview = useObjectUrl(coverCroppedFile ?? coverFile, coverUrl);
  const avatarPreview = useObjectUrl(avatarCroppedFile ?? avatarFile, avatarUrl);

  // สำหรับ Cropper: ใช้ไฟล์ต้นฉบับก่อนเพื่อคุณภาพสูงสุด
  const coverCropPreview = useObjectUrl(coverFile ?? coverCroppedFile, coverUrl);
  const avatarCropPreview = useObjectUrl(avatarFile ?? avatarCroppedFile, avatarUrl);

  /** ---------- Crop states ---------- */
  const [cropTarget, setCropTarget] = useState<null | "cover" | "avatar">(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  /** ---------- การแสดงปุ่ม action ต่อโซน ---------- */
  const [showActions, setShowActions] = useState<null | "cover" | "avatar">(null);

  /** ---------- Aspect cover จากกล่องจริง ---------- */
  const [coverAspect, setCoverAspect] = useState(16 / 9);

  /*
   * Effect: คลิกนอกคอมโพเนนต์ → ซ่อนปุ่ม action
   */
  useEffect(() => {
    const handleClickAway = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setShowActions(null);
    };
    document.addEventListener("mousedown", handleClickAway, true);
    document.addEventListener("touchstart", handleClickAway, true);
    return () => {
      document.removeEventListener("mousedown", handleClickAway, true);
      document.removeEventListener("touchstart", handleClickAway, true);
    };
  }, []);

  /*
   * Effect: คำนวณ aspect ของ cover จากขนาดกล่องจริง (width / height)
   */
  useEffect(() => {
    if (!coverButtonRef.current) return;
    const el = coverButtonRef.current;

    const parseCoverHeight = () => {
      if (typeof coverHeight === "number") return coverHeight;
      const numeric = parseFloat(String(coverHeight));
      return Number.isFinite(numeric) && numeric > 0 ? numeric : 360;
    };

    const updateAspect = () => {
      const rect = el.getBoundingClientRect();
      const h = parseCoverHeight();
      if (rect.width > 0 && h > 0) setCoverAspect(rect.width / h);
    };

    updateAspect();

    const resizeObserver = new ResizeObserver(() => updateAspect());
    resizeObserver.observe(el);
    window.addEventListener("resize", updateAspect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateAspect);
    };
  }, [coverHeight]);

  /**
   * Handler: onCropComplete
   * เก็บพื้นที่ครอปจริง (พิกเซล) จาก react-easy-crop
   */
  const onCropComplete = (_: any, areaPixels: any) => {
    setCropPixels({
      x: Math.round(areaPixels.x),
      y: Math.round(areaPixels.y),
      width: Math.round(areaPixels.width),
      height: Math.round(areaPixels.height),
    });
  };

  /**
   * Handler: applyCrop
   * ครอปจากไฟล์ต้นฉบับ (ถ้ามี) → อัปเดตไฟล์ที่ครอป + ยิง callback ภายนอก
   */
  const applyCrop = async () => {
    if (!cropTarget || !cropPixels) return;

    const sourceFile =
      cropTarget === "cover" ? coverFile ?? coverCroppedFile : avatarFile ?? avatarCroppedFile;
    if (!sourceFile) return;

    const croppedOutput = await cropImageToFile(sourceFile, cropPixels, "image/jpeg", 0.95);

    if (cropTarget === "cover") {
      setCoverCroppedFile(croppedOutput);
      onCoverChange?.(croppedOutput);
    } else {
      setAvatarCroppedFile(croppedOutput);
      onAvatarChange?.(croppedOutput);
    }
    setCropTarget(null);
  };

  /**
   * Handler: useOriginal
   * ยืนยันใช้ไฟล์เดิมโดยไม่ครอป (ปิด modal อย่างเดียว)
   */
  const useOriginal = () => setCropTarget(null);

  /*
   * Effect: โฟกัสปุ่ม Avatar อัตโนมัติ (ถ้าระบุ)
   */
  useEffect(() => {
    if (autoFocusAvatar) avatarButtonRef.current?.focus();
  }, [autoFocusAvatar]);

  /** ---------- เปิด file picker ---------- */
  const pickCover = () => !disabled && coverInputRef.current?.click();
  const pickAvatar = () => !disabled && avatarInputRef.current?.click();

  /**
   * Handler: onCoverPicked
   * เซ็ตไฟล์ cover → ล้างผลครอปเดิม → เปิดครอปอัตโนมัติ (ถ้ากำหนด) → call onCoverChange
   */
  const onCoverPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const pickedFile = e.target.files?.[0] ?? null;
    setCoverFile(pickedFile);
    setCoverCroppedFile(null);
    e.currentTarget.value = "";

    if (autoCropOnPick && pickedFile && pickedFile.type.startsWith("image/")) {
      setCropTarget("cover");
      setCropZoom(1);
      setCropPos({ x: 0, y: 0 });
      setCropPixels(null);
      return;
    }
    onCoverChange?.(pickedFile);
  };

  /**
   * Handler: onAvatarPicked
   * เซ็ตไฟล์ avatar → ล้างผลครอปเดิม → เปิดครอปอัตโนมัติ (ถ้ากำหนด) → call onAvatarChange
   */
  const onAvatarPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const pickedFile = e.target.files?.[0] ?? null;
    setAvatarFile(pickedFile);
    setAvatarCroppedFile(null);
    e.currentTarget.value = "";

    if (autoCropOnPick && pickedFile && pickedFile.type.startsWith("image/")) {
      setCropTarget("avatar");
      setCropZoom(1);
      setCropPos({ x: 0, y: 0 });
      setCropPixels(null);
      return;
    }
    onAvatarChange?.(pickedFile);
  };

  /** ---------- Styles คำนวณจากพร็อพ ---------- */
  const wrapStyle = useMemo(() => ({ width: formatSize(width, "100%") }), [width]);
  const coverStyle = useMemo(() => ({ height: formatSize(coverHeight, "360px") }), [coverHeight]);
  const avatarStyle = useMemo(
    () => ({ width: `${avatarSize}px`, height: `${avatarSize}px` }),
    [avatarSize]
  );

  /** ---------- Render ---------- */
  return (
    <>
      <section
        ref={rootRef}
        className={`relative ${className}`}
        style={wrapStyle}
        aria-label="Upload cover & profile"
        onClick={() => setShowActions(null)}
      >
        {/* โซน Cover: ปุ่มเลือกไฟล์ + พรีวิว/ข้อความแนะนำ */}
        <button
          type="button"
          id={`cover-${uid}`}
          ref={coverButtonRef}
          onClick={pickCover}
          disabled={disabled}
          className={[
            "relative w-full",
            "border",
            "border-black",
            "bg-[#055035]/[0.19]",
            "shadow-[0_2px_0_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.08)]",
            "overflow-hidden flex items-center justify-center",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[#055035]/[0.19]",
            roundedCover,
          ].join(" ")}
          style={coverStyle}
          aria-describedby={`cover-hint-${uid}`}
        >
          {/* input ซ่อนสำหรับเลือกไฟล์ cover */}
          <input
            ref={coverInputRef}
            type="file"
            accept={coverAccept}
            className="hidden"
            onChange={onCoverPicked}
            aria-hidden="true"
            disabled={disabled}
          />

          {/* พรีวิวภาพหรือคำแนะนำ */}
          {coverPreview ? (
            <div className="absolute inset-0">
              <img
                src={coverPreview}
                alt="ภาพหน้าปกที่เลือก"
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions("cover");
                }}
              />

              {/* แถบปุ่มของ cover */}
              {showActions === "cover" && (
                <div
                  className="absolute inset-x-0 bottom-0 p-3 flex gap-2 justify-end bg-gradient-to-t from-black/50 to-transparent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowActions(null);
                      coverInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-sm font-medium"
                  >
                    {changeLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActions(null);
                      setCropTarget("cover");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm font-medium"
                  >
                    {editLabel}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span id={`cover-hint-${uid}`} className="select-none text-lg font-medium text-slate-800">
              {coverLabel}
            </span>
          )}
        </button>

        {/* โซน Avatar: ปุ่ม overlay + พรีวิว/ไอคอน + ปุ่ม action ใต้ภาพ */}
        <div className="absolute left-10 -bottom-80 sm:left-14 sm:-bottom-14 z-10">
          <button
            type="button"
            id={`avatar-${uid}`}
            ref={avatarButtonRef}
            onClick={pickAvatar}
            disabled={disabled}
            className={[
              "relative",
              "border",
              "border-black",
              "bg-[#D9D9D9]",
              "shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
              "overflow-hidden",
              // แก้ class ให้เป็นแบบ tailwind ปกติ (คงผลลัพธ์เดิม)
              "flex flex-col items-center justify-center text-center",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[#CFCFCF]",
              roundedAvatar,
            ].join(" ")}
            style={avatarStyle}
            aria-describedby={`avatar-hint-${uid}`}
          >
            {/* input ซ่อนสำหรับเลือกไฟล์ avatar */}
            <input
              ref={avatarInputRef}
              type="file"
              accept={avatarAccept}
              className="hidden"
              onChange={onAvatarPicked}
              aria-hidden="true"
              disabled={disabled}
            />
            {/* พรีวิวรูปโปรไฟล์ หรือไอคอน/ข้อความแนะนำ */}
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="รูปโปรไฟล์ที่เลือก"
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions("avatar");
                }}
              />
            ) : (
              <div className="px-6 text-slate-8 00">
                <div className="mb-3 flex items-center justify-center">
                  {icon ?? <Icon icon={iconName} className="w-10 h-10" />}
                </div>
                <span id={`avatar-hint-${uid}`} className="block text-xl md:text-lg leading-snug">
                  {avatarLabel}
                </span>
              </div>
            )}
          </button>

          {/* ปุ่ม action สำหรับ avatar */}
          {showActions === "avatar" && (
            <div className="mt-2 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setShowActions(null);
                  avatarInputRef.current?.click();
                }}
                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium"
              >
                {changeLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowActions(null);
                  setCropTarget("avatar");
                }}
                className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
              >
                {editLabel}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal ครอปภาพ: แสดงเมื่อมี cropTarget */}
      {cropTarget && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-4 w-[90vw] max-w-[640px] h-[80vh] max-h-[720px] flex flex-col gap-3">
            {/* พื้นที่ครอปภาพ */}
            <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
              <Cropper
                image={cropTarget === "cover" ? coverCropPreview! : avatarCropPreview!}
                crop={cropPos}
                zoom={cropZoom}
                aspect={cropTarget === "avatar" ? 1 : coverAspect}
                cropShape={cropTarget === "avatar" ? "round" : "rect"}
                showGrid
                onCropChange={setCropPos}
                onZoomChange={setCropZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>

            {/* แถบซูม */}
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={cropZoom}
              onChange={(e) => setCropZoom(Number(e.target.value))}
            />

            {/* ปุ่มควบคุม modal ครอป */}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setCropTarget(null)}>
                ยกเลิก
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-200" onClick={useOriginal}>
                ใช้รูปเดิม
              </button>
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white" onClick={applyCrop}>
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
 * ฮุค: useObjectUrl
 * บทบาท: สร้าง/คืนค่า object URL สำหรับพรีวิวจาก File; ไม่มีไฟล์ให้คืน fallbackUrl
 * ความปลอดภัยหน่วยความจำ: cleanup URL.createObjectURL ใน useEffect return
 */
function useObjectUrl(file: File | null, fallbackUrl: string | null) {
  const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);

  useEffect(() => {
    if (!file) {
      setUrl(fallbackUrl ?? null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, fallbackUrl]);

  return url;
}
