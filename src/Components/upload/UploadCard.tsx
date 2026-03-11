/*
 * File: UploadCard.tsx
 * Component: UploadCard (Client)
 * คำอธิบาย: การ์ดอัปโหลดไฟล์แบบรูป/วิดีโอ แสดงพรีวิวในกรอบสี่เหลี่ยม/จัตุรัส
 *            รองรับ controlled/uncontrolled, จำกัดจำนวนสูงสุด, และ A11y ครบถ้วน
 * Input (Props): ดู UploadCardProps
 * Output: JSX: แกลเลอรีไฟล์ + ปุ่มเพิ่ม + ปุ่มลบต่อสลอต
 * หมายเหตุ:
 *  - ใช้ URL.createObjectURL สำหรับพรีวิว และ revoke เมื่อเลิกใช้งาน ป้องกัน memory leak
 *  - ปรับลำดับและชื่อฟังก์ชันให้ชัด + คอมเมนต์ก่อนประกาศตาม CS
 */

"use client";
import React, { useRef, useState, useEffect, useId, useMemo } from "react";
import type { CSSProperties, ChangeEventHandler } from "react";
import { IconifySvg, IMAGE_ICON, VIDEO_ICON } from "./UploadIcons";
import { saveLogoVariantToPublic, saveToPublic } from "@/Libs/PublicFolder";
import { toast } from "react-toastify";

export type UploadCardProps = {
  // จำกัดจำนวนสูงสุด
  max?: number;

  // ประเภทไฟล์: 'image/*' | 'video/*' | 'image/*,video/*'
  accept?: string;
  multiple?: boolean;

  // ขนาดกรอบต่อสลอต (ดีฟอลต์ 160x160)
  itemW?: number | string; // ความกว้าง (px หรือ CSS unit)
  itemH?: number | string; // ความสูง
  square?: boolean; // true = ใช้ itemW เป็นทั้งกว้าง/สูง

  // สไตล์/เลย์เอาท์
  itemClass?: string; // เสริมคลาสให้กรอบ (เช่น shadow/border)
  rounded?: string; // มุมโค้ง (เช่น 'rounded-xl')
  gapCls?: string; // ระยะห่างระหว่างสลอต
  containerClass?: string; // คลาสของคอนเทนเนอร์
  wrap?: boolean; // true=ขึ้นบรรทัดใหม่, false=สไลด์แนวนอน

  // ควบคุมไฟล์ภายนอก (controlled/uncontrolled)
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  disabled?: boolean;

  // ไอคอน (ใช้ 2 ตัวตามที่กำหนด)
  iconName?: string; // ถ้าไม่ระบุ จะเลือกจาก accept ให้เอง
  iconSizeCls?: string; // ขนาดไอคอนปุ่มเพิ่ม'

  variant?: "white" | "black";
  persistToPublic?: boolean;
  /** callback หลังบันทึกลง public เสร็จ (คืนพาธเช่น "/my-image-1697800000.png") */
  onPersisted?: (paths: string[]) => void;
};

/*
 * ฟังก์ชัน: toCssSize
 * คำอธิบาย : แปลงตัวเลขให้เป็นขนาด CSS (px) หรือคืนค่า string เดิม
 * Input  : v?: number|string
 * Output : string|undefined
 */
const toCssSize = (v?: number | string) =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

/*
 * ฟังก์ชัน: pickDefaultIcon
 * คำอธิบาย : เลือกไอคอนเริ่มต้นจาก accept (ถ้ามีคำว่า "video" → VIDEO_ICON)
 * Input  : accept?: string
 * Output : string (icon name)
 */
function pickDefaultIcon(accept?: string) {
  const acceptLower = (accept || "").toLowerCase();
  if (acceptLower.includes("video")) return VIDEO_ICON;
  return IMAGE_ICON;
}

const splitName = (name: string) => {
  const lastDotIndex = name.lastIndexOf(".");
  return lastDotIndex >= 0
    ? { base: name.slice(0, lastDotIndex), ext: name.slice(lastDotIndex) }
    : { base: name, ext: "" };
};

/**
 * คอมโพเนนต์: UploadCard
 * คำอธิบาย : แสดงพรีวิวไฟล์แบบกริด + ปุ่มเพิ่มไฟล์ (เปิด file input) + ปุ่มลบรายสลอต
 * โหมด     : controlled (มี prop value) / uncontrolled (ใช้ state ภายใน)
 */
export const UploadCard: React.FC<UploadCardProps> = ({
  max = 5,
  accept = "image/*",
  multiple = true,

  itemW = 160,
  itemH,
  square = true,

  itemClass = "",
  rounded = "rounded-xl",
  gapCls = "gap-4",
  containerClass = "",
  wrap = true,

  value,
  defaultValue,
  onChange,
  disabled = false,

  iconName,
  iconSizeCls = "w-10 h-10",

  variant,
  persistToPublic = false,
  onPersisted,
}) => {
  // ---------- Refs/IDs ----------
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoId = useId();
  const inputId = `upload-input-${autoId}`;
  const counterId = `upload-counter-${autoId}`;

  // ---------- State: controlled/uncontrolled ----------
  const [filesUnctrl, setFilesUnctrl] = useState<File[]>(defaultValue ?? []);
  const files = value ?? filesUnctrl;

  // ---------- Preview URLs (image/video) ----------
  const [previews, setPreviews] = useState<{ url: string; kind: "image" | "video" }[]>([]);
  useEffect(() => {
    const urls = files.map((f): { url: string; kind: "image" | "video" } => ({
      url: URL.createObjectURL(f),
      kind: f.type.startsWith("video/") ? "video" : "image",
    }));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [files]);

  // ---------- Size styles ----------
  const w = toCssSize(itemW);
  const h = toCssSize(square ? (itemW ?? itemH) : itemH);
  const sizeStyle: CSSProperties = { width: w ?? h, height: h ?? w };

  /*
   * ฟังก์ชัน: emitChange
   * คำอธิบาย : อัปเดตรายการไฟล์ (รองรับ controlled/uncontrolled) และแจ้งผ่าน onChange
   * Input  : next: File[]
   * Output : void
   */
  const emitChange = (next: File[]) => {
    if (value === undefined) setFilesUnctrl(next);
    onChange?.(next);
  };

  /*
     * ฟังก์ชัน: handleInputChange
     * คำอธิบาย : รับไฟล์จาก <input type="file"> เติมเข้า list โดยไม่เกิน max
     * Input  : e: ChangeEvent<HTMLInputElement>
     * Output : void
    //  */
  // const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
  //     const picked = Array.from(e.target.files ?? []);
  //     if (!picked.length) return;

  //     const remain = Math.max(0, max - files.length);
  //     if (remain <= 0) return;

  //     emitChange([...files, ...picked.slice(0, remain)]);
  //     // reset เพื่อให้เลือกไฟล์ชื่อเดิมซ้ำได้
  //     e.currentTarget.value = "";
  // };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;

    // กรองไฟล์ที่ขนาดเกิน 5MB ออก
    const validFiles = picked.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < picked.length) {
      toast.error("ขนาดไฟล์บางไฟล์เกิน 5MB กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5MB");
    }

    if (!validFiles.length) {
      e.currentTarget.value = "";
      return;
    }

    // ถ้ามี variant ให้ใช้ไฟล์แรกเท่านั้น (เขียนทับ)
    const slice = (variant ? validFiles.slice(0, 1) : validFiles).slice(0, Math.max(0, max - files.length));
    if (!slice.length) return;

    emitChange([...files, ...slice]);

    if (persistToPublic) {
      let paths: string[] = [];
      if (variant) {
        const p = await saveLogoVariantToPublic(variant, slice[0]); // ✅ overwrite
        paths = [p];
      } else {
        // กรณีทั่วไป ตั้งชื่อเองตามต้องการ
        const saved = await Promise.all(
          slice.map(async (f) => {
            const { name } = f;
            return await saveToPublic(f, name); // หรือจะใส่ timestamp ก็ได้
          }),
        );
        paths = saved;
      }
      onPersisted?.(paths);
    }

    e.currentTarget.value = "";
  };

  /*
   * ฟังก์ชัน: removeAt
   * คำอธิบาย : ลบไฟล์ตาม index (เคารพ disabled)
   * Input  : i:number
   * Output : void
   */
  const removeAt = (i: number) => {
    if (disabled) return;
    emitChange(files.filter((_, idx) => idx !== i));
  };

  /*
   * ฟังก์ชัน: openPicker
   * คำอธิบาย : เปิด dialog เลือกไฟล์ (เคารพ disabled และจำนวนสูงสุด)
   * Input  : -
   * Output : void
   */
  const openPicker = () => {
    if (disabled || files.length >= max) return;
    inputRef.current?.click();
  };

  // ---------- Derived/UI classes ----------
  const container = [
    "flex items-start",
    wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto",
    gapCls,
    containerClass,
  ].join(" ");

  const addCardBase = [
    "relative border-1 border-dashed border-black-100 bg-white", // FIX: border-black-200 → slate-200
    "shrink-0 overflow-hidden", // กันโดน flex บีบ
    rounded,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
  ].join(" ");

  // ไอคอนหลัก: ถ้าไม่ส่ง iconName มา จะเลือกตาม accept ให้เอง
  const mainIcon = iconName ?? pickDefaultIcon(accept);

  // dynamic multiple: หากเหลือช่องเดียวไม่จำเป็นต้องเปิด multiple
  // const effectiveMultiple = multiple && max - files.length > 1;
  const effectiveMultiple =
    !disabled && !Boolean(/** single when variant */ variant)
      ? multiple && max - files.length > 1
      : false;

  // ข้อความสถานะ (เพื่อ A11y)
  const counterText = `${files.length} / ${max}`;

  // เขียนไฟล์ลงโฟลเดอร์ public
  const publicDirRef = useRef<FileSystemDirectoryHandle | null>(null);

  async function ensurePublicDir(): Promise<FileSystemDirectoryHandle | null> {
    if (!("showDirectoryPicker" in window)) {
      console.warn("File System Access API not supported in this browser.");
      alert("เบราว์เซอร์นี้ไม่รองรับการเขียนไฟล์ลงโฟลเดอร์ (ใช้ Chrome/Edge)");
      return null;
    }
    if (!publicDirRef.current) {
      // ให้ผู้ใช้เลือกโฟลเดอร์ public ของโปรเจกต์คุณ
      const handle = await (window as any).showDirectoryPicker();
      publicDirRef.current = handle as FileSystemDirectoryHandle;
    }
    const perm = await (publicDirRef.current as any).requestPermission?.({ mode: "readwrite" });
    if (perm && perm !== "granted") {
      alert("ไม่ได้รับสิทธิ์เขียนโฟลเดอร์");
      return null;
    }
    return publicDirRef.current;
  }

  async function saveNewFilesToPublic(newFiles: File[]): Promise<string[] | null> {
    const dir = await ensurePublicDir();
    if (!dir) return null;

    const saved: string[] = [];
    for (const f of newFiles) {
      const { base, ext } = splitName(f.name);
      const name = `${base}-${Date.now()}${ext || ""}`; // กันชนชื่อซ้ำ
      const fh = await dir.getFileHandle(name, { create: true });
      const w = await fh.createWritable();
      await w.write(await f.arrayBuffer());
      await w.close();
      saved.push(`/${name}`);
    }
    return saved;
  }

  return (
    <div className={container} aria-live="polite" aria-atomic="false">
      {/* พรีวิวกรอบละ 1 สื่อ (รูปหรือวิดีโอ) + ปุ่มลบ */}
      {previews.map(({ url, kind }, i) => (
        <div
          key={i}
          className={`relative shrink-0 overflow-hidden ${itemClass} ${rounded}`}
          style={sizeStyle}
        >
          {kind === "video" ? (
            <video
              src={url}
              className={`block w-full h-full object-cover ${rounded}`}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={url}
              alt={`ไฟล์ที่เลือก ${i + 1}`}
              className={`block w-full h-full object-cover ${rounded}`}
              draggable={false}
            />
          )}

          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label={`ลบไฟล์ลำดับที่ ${i + 1}`}
            disabled={disabled}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/60 text-white w-7 h-7 flex items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-50"
            title="ลบไฟล์"
          >
            ×
          </button>
        </div>
      ))}

      {/* ปุ่มเพิ่ม (แสดงเมื่อยังไม่ครบ max) */}
      {files.length < max && (
        <button
          type="button"
          id={`add-btn-${autoId}`}
          aria-label="เพิ่มไฟล์"
          aria-describedby={counterId}
          onClick={openPicker}
          disabled={disabled}
          className={`${addCardBase} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"
            } flex flex-col items-center justify-center ${itemClass}`}
          style={sizeStyle}
        >
          {/* input file แบบซ่อนสายตา (เชื่อมกับปุ่มผ่าน ref) */}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={effectiveMultiple}
            className="hidden"
            onChange={handleInputChange}
            aria-hidden="true"
            disabled={disabled}
          />
          <IconifySvg name={mainIcon} className={iconSizeCls} />
          <span id={counterId} className="text-sm text-slate-700 mt-2">
            {counterText}
          </span>
        </button>
      )}
    </div>
  );
};

export default UploadCard;
