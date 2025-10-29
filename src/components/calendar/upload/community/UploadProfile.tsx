/* 
 * File: UploadProfile.tsx
 * Component: UploadProfile (Client)
 * คำอธิบาย (ตามมาตรฐาน CS v1.1.1):
 *   - พื้นที่อัปโหลด 2 จุด: Cover (แบนเนอร์) และ Avatar (วงกลม) พร้อมพรีวิว
 *   - รองรับโหมดแก้ไข/ครอปภาพด้วย react-easy-crop (เปิดเมื่อเลือกไฟล์ หรือกดปุ่ม “แก้ไข/ครอป”)
 *   - โครงสร้าง/พฤติกรรมเดิมคงไว้ — เพิ่มเฉพาะคอมเมนต์อธิบายให้ครบถ้วนเท่านั้น
 * Input (Props): UploadProfileProps (ดูรายละเอียดใต้บล็อกชนิดข้อมูล)
 * Output: <section> มีปุ่มอัปโหลด cover และ avatar (overlay), พร้อม modal ครอป
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Cropper from "react-easy-crop";

/**
 * ฟังก์ชัน: cropImageToFile
 * คำอธิบาย: ครอปภาพจากไฟล์ต้นฉบับตามพิกเซลที่กำหนด แล้วคืนค่ากลับเป็นไฟล์ใหม่
 * Input:
 *   - file: ไฟล์รูปต้นฉบับ
 *   - area: พื้นที่พิกัดพิกเซล {x, y, width, height} สำหรับครอป
 *   - mime: MIME type เอาท์พุต (ดีฟอลต์ "image/jpeg")
 *   - quality: คุณภาพการบีบอัด (0–1)
 * Output: Promise<File> (ไฟล์ภาพที่ครอปแล้ว)
 * หมายเหตุ: ใช้ Canvas สร้าง Blob แล้วห่อเป็น File; เปลี่ยนชื่อไฟล์เติม "_cropped"
 */
async function cropImageToFile(
    file: File,
    area: { x: number; y: number; width: number; height: number },
    mime = "image/jpeg",
    quality = 0.95
): Promise<File> {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = URL.createObjectURL(file);
    });
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.floor(area.width));
    c.height = Math.max(1, Math.floor(area.height));
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise(r => c.toBlob(b => r(b!), mime, quality));
    const name = file.name.replace(/\.(\w+)$/, "_cropped.$1");
    return new File([blob], name, { type: blob.type });
}

/** 
 * ชนิดข้อมูล: UploadProfileProps
 * คำอธิบาย:
 *   - Layout/Style: ขนาด, มุมโค้ง, สีพื้นหลัง/เส้นขอบ
 *   - ข้อความ/ไอคอน: ข้อความแนะนำและชื่อไอคอนเมื่อยังไม่เลือกรูป
 *   - พฤติกรรม: จำกัดชนิดไฟล์, ปิดการใช้งาน, โฟกัส avatar อัตโนมัติ
 *   - ค่าภายนอก/อีเวนต์: URL เริ่มต้น + callback เมื่อไฟล์เปลี่ยน
 *   - Action UI: โหมดแสดงปุ่ม (hover/always), ป้ายปุ่ม “เปลี่ยนรูป/แก้ไข”
 *   - autoCropOnPick: เลือกไฟล์แล้วเปิดครอปอัตโนมัติหรือไม่
 */
export type UploadProfileProps = {
    // Layout
    width?: number | string;
    coverHeight?: number | string;
    avatarSize?: number;               // เส้นผ่านศูนย์กลางวงกลม
    className?: string;

    // มุมโค้ง
    roundedCover?: string;
    roundedAvatar?: string;

    // สี/สไตล์ (เผื่ออยากปรับต่อ)
    coverBgClass?: string;             // พื้นหลัง cover
    coverBorderClass?: string;         // เส้นขอบ cover
    avatarBgClass?: string;            // พื้นหลัง avatar
    avatarBorderClass?: string;        // เส้นขอบ avatar

    // ข้อความ + ไอคอน
    coverLabel?: string;
    avatarLabel?: string;
    iconName?: string;                 // iconify name (default: "cil:image-plus")
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
    changeLabel?: string;               // ป้าย “เปลี่ยนรูป”
    editLabel?: string;                 // ป้าย “แก้ไข/ครอป”

    // เปิดครอปอัตโนมัติเมื่อเลือกไฟล์
    autoCropOnPick?: boolean;
};

/**
 * ฟังก์ชัน: toSize
 * คำอธิบาย: number → 'Npx', string → ค่าที่ส่งมา, null/undefined → fallback
 * Input : v?: number|string, fallback?: string
 * Output: string | undefined
 */
const toSize = (v?: number | string, fallback?: string) =>
    v == null ? fallback : typeof v === "number" ? `${v}px` : v;

/**
 * คอมโพเนนต์หลัก: UploadProfile
 * คำอธิบาย: เรนเดอร์โซนอัปโหลด Cover และ Avatar พร้อมแถบปุ่ม (เปลี่ยนรูป/แก้ไข) และ modal ครอป
 * หมายเหตุ: ไม่แก้ไขลอจิกเดิม — เพิ่มคอมเมนต์และคำอธิบายให้ครบถ้วนตามมาตรฐานเท่านั้น
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

    /** ---------- State: ไฟล์ที่ผู้ใช้เลือก (เฉพาะรอบนี้) ---------- */
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    /** ---------- Preview URLs: จากไฟล์ที่เลือก หรือ URL ที่ส่งเข้ามา ---------- */
    const coverPreview = useObjectUrl(coverFile, coverUrl);
    const avatarPreview = useObjectUrl(avatarFile, avatarUrl);

    /** ---------- Crop states ---------- */
    const [cropTarget, setCropTarget] = useState<null | "cover" | "avatar">(null); // เป้าหมายที่จะครอป
    const [cropZoom, setCropZoom] = useState(1);                                   // ระดับซูม
    const [cropPos, setCropPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // ตำแหน่งครอปเปอร์
    const [cropPixels, setCropPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null); // พื้นที่จริงพิกเซล

    /** ---------- แสดง/ซ่อนปุ่ม action ต่อโซน ---------- */
    const [showActions, setShowActions] = useState<null | "cover" | "avatar">(null);

    /** ---------- อ้างอิงรากเพื่อปิด action เมื่อคลิกนอก ---------- */
    const rootRef = useRef<HTMLElement | null>(null);

    /*
     * Effect: คลิกนอกคอมโพเนนต์แล้วซ่อนปุ่ม (cover/avatar)
     * ติดตั้ง listener ตอน mount และลบออกเมื่อ unmount
     */
    useEffect(() => {
        const handleClickAway = (e: MouseEvent | TouchEvent) => {
            if (!rootRef.current) return;
            const el = rootRef.current;
            if (!el.contains(e.target as Node)) {
                setShowActions(null);   // คลิกนอกคอมโพเนนต์ ⇒ ปิดปุ่ม
            }
        };
        document.addEventListener("mousedown", handleClickAway, true);
        document.addEventListener("touchstart", handleClickAway, true);
        return () => {
            document.removeEventListener("mousedown", handleClickAway, true);
            document.removeEventListener("touchstart", handleClickAway, true);
        };
    }, []);

    /**
     * Handler: onCropComplete
     * คำอธิบาย: รับพื้นที่ครอปจริง (พิกเซล) จาก react-easy-crop แล้วจัดเก็บใน state
     * หมายเหตุ: ใช้ any ตามโค้ดเดิม (ไม่เปลี่ยนลอจิก)
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
     * คำอธิบาย: ประมวลผลครอปกับไฟล์ที่เลือก (cover/avatar) แล้วอัปเดต state + ยิง callback
     */
    const applyCrop = async () => {
        if (!cropTarget || !cropPixels) return;
        const src = cropTarget === "cover" ? coverFile : avatarFile;
        if (!src) return;
        const out = await cropImageToFile(src, cropPixels, "image/jpeg", 0.95);
        if (cropTarget === "cover") { setCoverFile(out); onCoverChange?.(out); }
        else { setAvatarFile(out); onAvatarChange?.(out); }
        setCropTarget(null);
    };

    /**
     * Handler: useOriginal
     * คำอธิบาย: ยืนยันใช้ไฟล์เดิมโดยไม่ครอป (ยิง callback ตามโซน)
     */
    const useOriginal = () => {
        if (cropTarget === "cover") onCoverChange?.(coverFile ?? null);
        if (cropTarget === "avatar") onAvatarChange?.(avatarFile ?? null);
        setCropTarget(null);
    };

    /*
     * Effect: โฟกัสปุ่ม Avatar อัตโนมัติ (ถ้าระบุให้ทำ)
     * เงื่อนไข: ทำงานเมื่อ autoFocusAvatar เปลี่ยน
     */
    useEffect(() => {
        if (autoFocusAvatar) avatarButtonRef.current?.focus();
    }, [autoFocusAvatar]);

    /** ---------- Handlers: เปิด file picker ---------- */
    const pickCover = () => !disabled && coverInputRef.current?.click();
    const pickAvatar = () => !disabled && avatarInputRef.current?.click();

    /**
     * Handler: onCoverPicked
     * คำอธิบาย: เมื่อเลือกไฟล์ cover — เซ็ต state, reset ค่า input, และถ้าตั้ง autoCropOnPick จะเปิด modal ครอปทันที
     * หมายเหตุ: เมื่อเปิดครอปอัตโนมัติ จะยังไม่ยิง onCoverChange จนกว่าจะกดยืนยันครอป
     */
    const onCoverPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setCoverFile(f);
        e.currentTarget.value = "";

        if (autoCropOnPick && f && f.type.startsWith("image/")) {
            setCropTarget("cover");          // เปิด modal ครอป
            setCropZoom(1); setCropPos({ x: 0, y: 0 }); setCropPixels(null);
            return;                          // อย่าเรียก onCoverChange ที่นี่
        }
        onCoverChange?.(f);
    };

    /**
     * Handler: onAvatarPicked
     * คำอธิบาย: เมื่อเลือกไฟล์ avatar — เซ็ต state, reset ค่า input, และเปิดครอปอัตโนมัติถ้ากำหนด
     */
    const onAvatarPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setAvatarFile(f);
        e.currentTarget.value = "";

        if (autoCropOnPick && f && f.type.startsWith("image/")) {
            setCropTarget("avatar");         // เปิด modal ครอป
            setCropZoom(1); setCropPos({ x: 0, y: 0 }); setCropPixels(null);
            return;
        }
        onAvatarChange?.(f);
    };

    /** ---------- Styles คำนวณจากพร็อพ ---------- */
    const wrapStyle = useMemo(() => ({ width: toSize(width, "100%") }), [width]);
    const coverStyle = useMemo(() => ({ height: toSize(coverHeight, "360px") }), [coverHeight]);
    const avatarStyle = useMemo(() => ({ width: `${avatarSize}px`, height: `${avatarSize}px` }), [avatarSize]);

    /** ---------- Render ---------- */
    return (
        <>
            <section
                ref={rootRef}
                className={`relative ${className}`}
                style={wrapStyle}
                aria-label="Upload cover & profile"
                onClick={() => setShowActions(null)}    // คลิกพื้นหลังเพื่อซ่อนปุ่ม action
            >
                {/* โซน Cover: ปุ่มเลือกไฟล์ + พรีวิว/ข้อความแนะนำ */}
                <button
                    type="button"
                    id={`cover-${uid}`}
                    onClick={pickCover}
                    disabled={disabled}
                    className={[
                        "relative w-full",
                        "border", "border-black",
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
                    {/* ถ้ามีพรีวิวจะแสดงภาพ ครอบเต็มพื้นที่; หากไม่มีก็แสดงคำแนะนำ */}
                    {coverPreview ? (
                        <div className="absolute inset-0">
                            <img
                                src={coverPreview}
                                alt="ภาพหน้าปกที่เลือก"
                                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                draggable={false}
                                onClick={(e) => { e.stopPropagation(); setShowActions("cover"); }}  // คลิกเพื่อโชว์ปุ่ม action
                            />

                            {/* แถบปุ่ม: แสดงเมื่อเลือกโซน cover */}
                            {showActions === "cover" && (
                                <div
                                    className="absolute inset-x-0 bottom-0 p-3 flex gap-2 justify-end bg-gradient-to-t from-black/50 to-transparent"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setShowActions(null); coverInputRef.current?.click(); }}
                                        className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-sm font-medium"
                                    >
                                        {changeLabel}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowActions(null); setCropTarget("cover"); }}
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
                            "border", "border-black",
                            "bg-[#D9D9D9]",
                            "shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
                            "overflow-hidden",
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
                        {/* แสดงพรีวิวรูปโปรไฟล์ หรือไอคอน/ข้อความแนะนำ */}
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="รูปโปรไฟล์ที่เลือก"
                                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                draggable={false}
                                onClick={(e) => { e.stopPropagation(); setShowActions("avatar"); }}
                            />
                        ) : (
                            <div className="px-6 text-slate-800">
                                <div className="mb-3 flex items-center justify-center">
                                    {icon ?? <Icon icon={iconName} className="w-10 h-10" />}
                                </div>
                                <span id={`avatar-hint-${uid}`} className="block text-xl md:text-lg leading-snug">
                                    {avatarLabel}
                                </span>
                            </div>
                        )}
                    </button>

                    {/* ปุ่ม action สำหรับ avatar (แสดงใต้ภาพเมื่อเลือก) */}
                    {showActions === "avatar" && (
                        <div
                            className="mt-2 flex justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}         // กันคลิกแล้วปุ่มหาย
                        >
                            <button
                                type="button"
                                onClick={() => { setShowActions(null); avatarInputRef.current?.click(); }}
                                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium"
                            >
                                {changeLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowActions(null); setCropTarget("avatar"); }}
                                className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                            >
                                {editLabel}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal ครอปภาพ: โผล่เมื่อมี cropTarget */}
            {cropTarget && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-2xl p-4 w-[90vw] max-w-[640px] h-[80vh] max-h-[720px] flex flex-col gap-3">
                        {/* พื้นที่ครอปภาพ */}
                        <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
                            <Cropper
                                image={cropTarget === "cover" ? coverPreview! : avatarPreview!}
                                crop={cropPos}
                                zoom={cropZoom}
                                aspect={cropTarget === "avatar" ? 1 : 16 / 9}
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
                            <button className="px-4 py-2 rounded-lg border" onClick={() => setCropTarget(null)}>ยกเลิก</button>
                            <button className="px-4 py-2 rounded-lg bg-slate-200" onClick={useOriginal}>ใช้รูปเดิม</button>
                            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white" onClick={applyCrop}>ใช้รูปที่ครอป</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * ฮุค: useObjectUrl
 * คำอธิบาย: สร้าง URL สำหรับพรีวิวจากไฟล์ที่เลือก (URL.createObjectURL)
 *           และคืนค่า fallbackUrl เมื่อไม่มีไฟล์; ทำความสะอาด URL ใน cleanup เพื่อเลี่ยง memory leak
 * Input : file: File | null, fallbackUrl: string | null
 * Output: string | null (URL สำหรับพรีวิว)
 */
function useObjectUrl(file: File | null, fallbackUrl: string | null) {
    const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);
    useEffect(() => {
        if (!file) { setUrl(fallbackUrl ?? null); return; }
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file, fallbackUrl]);
    return url;
}
