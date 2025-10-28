/*
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

/* ========== ฟังก์ชันครอปภาพ ========== */
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
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), mime, quality));
    const name = file.name.replace(/\.(\w+)$/, "_cropped.$1");
    return new File([blob], name, { type: blob.type });
}

/* ========== Props ========== */
export type AvatarUploaderProps = {
    avatarSize?: number;
    avatarUrl?: string | null;
    onAvatarChange?: (file: File | null) => void;
    autoCropOnPick?: boolean;
    disabled?: boolean;
    className?: string;
};

/* ========== Component ========== */
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
    const avatarPreview = useObjectUrl(avatarFile, avatarUrl);

    const [cropTarget, setCropTarget] = useState(false);
    const [cropZoom, setCropZoom] = useState(1);
    const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
    const [cropPixels, setCropPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const avatarStyle = useMemo(() => ({ width: `${avatarSize}px`, height: `${avatarSize}px` }), [avatarSize]);

    /* ---------- เลือกรูป ---------- */
    const pickAvatar = () => !disabled && inputRef.current?.click();

    const onAvatarPicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setAvatarFile(f);
        e.currentTarget.value = "";
        if (autoCropOnPick && f && f.type.startsWith("image/")) {
            setCropTarget(true);
            setCropZoom(1);
            setCropPos({ x: 0, y: 0 });
            setCropPixels(null);
            return;
        }
        onAvatarChange?.(f);
    };

    const onCropComplete = (_: any, areaPixels: any) => {
        setCropPixels({
            x: Math.round(areaPixels.x),
            y: Math.round(areaPixels.y),
            width: Math.round(areaPixels.width),
            height: Math.round(areaPixels.height),
        });
    };

    const applyCrop = async () => {
        if (!cropTarget || !cropPixels || !avatarFile) return;
        const out = await cropImageToFile(avatarFile, cropPixels, "image/jpeg", 0.95);
        setAvatarFile(out);
        onAvatarChange?.(out);
        setCropTarget(false);
    };

    const useOriginal = () => {
        onAvatarChange?.(avatarFile ?? null);
        setCropTarget(false);
    };

    /* ---------- Render ---------- */
    return (
        <>
            <div
                className={`relative inline-block ${className}`}
                style={avatarStyle}
            >
                {/* input file */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarPicked}
                    aria-hidden="true"
                    disabled={disabled}
                />

                {/* วงกลมหลัก */}
                <div
                    onClick={pickAvatar}
                    className={[
                        "relative overflow-hidden rounded-full border border-gray-400 bg-gray-300 flex items-center justify-center",
                        "shadow-[0_4px_10px_rgba(0,0,0,0.15)]",
                        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-200",
                    ].join(" ")}
                    style={avatarStyle}
                >
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
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

                {/* ปุ่มดินสอมุมล่างขวา */}
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
            {cropTarget && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-2xl p-4 w-[90vw] max-w-[640px] h-[80vh] max-h-[720px] flex flex-col gap-3">
                        <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
                            <Cropper
                                image={avatarPreview!}
                                crop={cropPos}
                                zoom={cropZoom}
                                aspect={1}
                                cropShape="round"
                                showGrid
                                onCropChange={setCropPos}
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
                            onChange={(e) => setCropZoom(Number(e.target.value))}
                        />

                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded-lg border" onClick={() => setCropTarget(false)}>ยกเลิก</button>
                            <button className="px-4 py-2 rounded-lg bg-slate-200" onClick={useOriginal}>ใช้รูปเดิม</button>
                            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white" onClick={applyCrop}>ใช้รูปที่ครอป</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ---------- Hook: useObjectUrl ---------- */
function useObjectUrl(file: File | null, fallbackUrl: string | null) {
    const [url, setUrl] = useState<string | null>(fallbackUrl ?? null);
    useEffect(() => {
        if (!file) {
            setUrl(fallbackUrl ?? null);
            return;
        }
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file, fallbackUrl]);
    return url;
}