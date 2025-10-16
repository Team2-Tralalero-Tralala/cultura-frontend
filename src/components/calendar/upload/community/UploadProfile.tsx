/* 
 * File: UploadProfile.tsx
 * Component: UploadProfile (Client)
 * คำอธิบาย (ตามมาตรฐาน CS v1.1.1):
 *   - คอมโพเนนต์พื้นที่อัปโหลด 2 จุด: Cover (แบนเนอร์) และ Avatar (วงกลม)
 *   - แสดงตัวอย่างภาพ (preview) ทันทีหลังเลือกไฟล์
 *   - โครงสร้าง/พฤติกรรมเดิมคงไว้ — เพิ่มเฉพาะคอมเมนต์อธิบายให้ครบถ้วนเท่านั้น
 * Input (Props): UploadProfileProps (ดูรายละเอียดใต้บล็อกชนิดข้อมูล)
 * Output: <section> ที่ภายในมีปุ่มอัปโหลด cover และปุ่มอัปโหลด avatar แบบ overlay
 */

"use client";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";

/** 
 * ชนิดข้อมูล: UploadProfileProps
 * คำอธิบาย:
 *   - กลุ่ม Layout/Style: ควบคุมขนาด, มุมโค้ง, สีพื้นหลัง/เส้นขอบ ของแต่ละโซน
 *   - กลุ่มข้อความ/ไอคอน: ปรับข้อความแนะนำและไอคอนขณะยังไม่เลือกรูป
 *   - กลุ่มพฤติกรรม: จำกัดชนิดไฟล์ที่รับ, ปิดการใช้งาน (disabled), โฟกัส avatar อัตโนมัติ
 *   - กลุ่มค่าภายนอก/อีเวนต์: รับ URL เริ่มต้นจากภายนอก และส่ง callback เมื่อผู้ใช้เลือกไฟล์
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
};

/*
 * ฟังก์ชัน: toSize
 * คำอธิบาย : แปลงค่าจำนวน (number) ให้เป็นหน่วย px; ถ้าเป็น string จะคืนตามเดิม; ถ้าเป็น null/undefined ใช้ fallback
 * Input  : v?: number|string, fallback?: string
 * Output : string | undefined
 */
const toSize = (v?: number | string, fallback?: string) =>
    v == null ? fallback : typeof v === "number" ? `${v}px` : v;

/*
 * คอมโพเนนต์หลัก: UploadProfile
 * คำอธิบาย : เรนเดอร์โซนอัปโหลด Cover และ Avatar พร้อมพรีวิวแบบทันที
 * หมายเหตุ : โครงสร้าง/คลาส/พฤติกรรมเดิม “ไม่เปลี่ยน” — เพิ่มเฉพาะคอมเมนต์ให้ครบตามมาตรฐาน
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

    // style (ทำให้ทึบ/ชัดแบบในภาพ)
    coverBgClass = "bg-emerald-200",
    coverBorderClass = "border-black/20",
    avatarBgClass = "bg-slate-200",
    avatarBorderClass = "border-black/20",

    // labels + icon
    coverLabel = "คลิกเพื่อเพิ่มรูปภาพหน้าปก",
    avatarLabel = "เพิ่มรูปโลโก้ / โปรไฟล์",
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
}: UploadProfileProps) {
    /** ---------- Refs/IDs ---------- */
    const uid = useId();
    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const avatarButtonRef = useRef<HTMLButtonElement>(null);

    /** ---------- State: ไฟล์ที่ผู้ใช้เลือก (เฉพาะรอบนี้) ---------- */
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    /** ---------- Preview URLs: สร้างจากไฟล์ที่เลือก หรือใช้ URL ที่ส่งมาจากภายนอก ---------- */
    const coverPreview = useObjectUrl(coverFile, coverUrl);
    const avatarPreview = useObjectUrl(avatarFile, avatarUrl);

    /*
     * Effects: โฟกัสปุ่ม Avatar อัตโนมัติ (ถ้าระบุให้ทำ)
     * เงื่อนไข: ทำงานเมื่อ autoFocusAvatar เปลี่ยน; ไม่ยุ่งเมื่อ disabled
     */
    useEffect(() => {
        if (autoFocusAvatar) avatarButtonRef.current?.focus();
    }, [autoFocusAvatar]);

    /** ---------- Handlers: เปิดตัวเลือกไฟล์ (cover/avatar) ---------- */
    const pickCover = () => !disabled && coverInputRef.current?.click();
    const pickAvatar = () => !disabled && avatarInputRef.current?.click();

    /*
     * Handler: onCoverPicked
     * คำอธิบาย: รับไฟล์จาก input ของ cover → เซ็ตสเตท + เรียก callback และรีเซ็ตค่า input เพื่อเลือกไฟล์ชื่อซ้ำได้
     */
    const onCoverPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setCoverFile(f);
        onCoverChange?.(f);
        e.currentTarget.value = "";
    };

    /*
     * Handler: onAvatarPicked
     * คำอธิบาย: รับไฟล์จาก input ของ avatar → เซ็ตสเตท + เรียก callback และรีเซ็ตค่า input เพื่อเลือกไฟล์ชื่อซ้ำได้
     */
    const onAvatarPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setAvatarFile(f);
        onAvatarChange?.(f);
        e.currentTarget.value = "";
    };

    /** ---------- Styles แบบคำนวณจากพร็อพ ---------- */
    const wrapStyle = useMemo(() => ({ width: toSize(width, "100%") }), [width]);
    const coverStyle = useMemo(() => ({ height: toSize(coverHeight, "360px") }), [coverHeight]);
    const avatarStyle = useMemo(() => ({ width: `${avatarSize}px`, height: `${avatarSize}px` }), [avatarSize]);

    /** ---------- Render ---------- */
    return (
        <section className={`relative ${className}`} style={wrapStyle} aria-label="Upload cover & profile">
            {/* โซน Cover: ปุ่มกดเพื่อเลือกไฟล์ + แสดงพรีวิวหรือข้อความแนะนำ */}
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
                    <img src={coverPreview} alt="ภาพหน้าปกที่เลือก" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                ) : (
                    <span id={`cover-hint-${uid}`} className="select-none text-lg font-medium text-slate-800">
                        {coverLabel}
                    </span>
                )}
            </button>

            {/* โซน Avatar (วงกลม): ปุ่ม overlay + พรีวิว หรือไอคอน + ข้อความแนะนำ */}
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
                        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[#CFCFCF]", // ⬅️ hover เข้มขึ้นนิด
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
                    {/* แสดงพรีวิวรูปโปรไฟล์ หากยังไม่เลือกจะแสดงไอคอน + คำแนะนำ */}
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="รูปโปรไฟล์ที่เลือก" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
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
            </div>
        </section>
    );
}

/* 
 * ฟังก์ชัน/ฮุค: useObjectUrl
 * คำอธิบาย : สร้าง URL สำหรับพรีวิวจากไฟล์ที่เลือก (URL.createObjectURL)
 *             และคืนค่า fallbackUrl เมื่อไม่มีไฟล์; ทำความสะอาด URL ใน cleanup เพื่อเลี่ยง memory leak
 * Input  : file: File | null, fallbackUrl: string | null
 * Output : string | null (URL สำหรับพรีวิว)
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
