// src/lib/publicFolder.ts
import { get, set, del } from "idb-keyval";

const KEY = "PUBLIC_DIR_HANDLE_V1";
export type LogoVariant = "white" | "black";

export async function loadPublicDir(): Promise<FileSystemDirectoryHandle | null> {
    try { return (await get(KEY)) ?? null; } catch { return null; }
}
export async function pickPublicDir(): Promise<FileSystemDirectoryHandle | null> {
    const handle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker();
    const perm = await (handle as any).requestPermission?.({ mode: "readwrite" });
    if (perm && perm !== "granted") return null;
    await set(KEY, handle);
    return handle;
}
async function ensureDir(): Promise<FileSystemDirectoryHandle> {
    let dir = await loadPublicDir();
    if (!dir) dir = (await pickPublicDir()) as FileSystemDirectoryHandle;
    if (!dir) throw new Error("No permission for public folder");
    return dir;
}

/** แปลงภาพเป็น PNG เพื่อให้ชื่อคงที่ .png */
async function toPNGBlob(file: File): Promise<Blob> {
    if (file.type === "image/png") return file;
    const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((res, rej) => {
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png", 0.92);
    });
}

/** ลบไฟล์เดิมถ้ามี (ลองหลายสกุล) */
async function deleteIfExists(dir: FileSystemDirectoryHandle, base: string) {
    const candidates = [
        base,                 // เผื่อมีไฟล์ไม่มีนามสกุล
        `${base}.png`,
        `${base}.jpg`,
        `${base}.jpeg`,
        `${base}.webp`,
        `${base}.svg`,
    ];
    for (const name of candidates) {
        try {
            // ถ้าอยู่ให้ลบ (ไม่มี -> throw ก็ข้ามไป)
            await (dir as any).removeEntry?.(name);
        } catch {
            // ignore
        }
    }
}

/** ✅ เขียนทับไฟล์โลโก้ชื่อคงที่ใน /public (ลบของเดิมก่อน) */
export async function saveLogoVariantToPublic(variant: LogoVariant, file: File): Promise<string> {
    const dir = await ensureDir();
    const base = variant === "white" ? "logo-white" : "logo-black";
    await deleteIfExists(dir, base);

    // เราจะเก็บเป็น .png เสมอ
    const target = `${base}.png`;
    const fh = await dir.getFileHandle(target, { create: true });
    const ws = await fh.createWritable();
    const blob = await toPNGBlob(file);
    await ws.write(await blob.arrayBuffer());
    await ws.close();

    // cache-bust เวลาเปิดดูใน <img>
    return `/${target}?v=${Date.now()}`;
}

/** เคสทั่วไป: เซฟชื่อที่กำหนด (จะเขียนทับไฟล์ชื่อนั้น) */
export async function saveToPublic(file: File, name?: string): Promise<string> {
    const dir = await ensureDir();
    const target = name ?? file.name;
    // ถ้าอยากให้ behavior แบบเขียนทับจริง ๆ ก็ลบทิ้งก่อน
    try { await (dir as any).removeEntry?.(target); } catch { }
    const fh = await dir.getFileHandle(target, { create: true });
    const ws = await fh.createWritable();
    await ws.write(await file.arrayBuffer());
    await ws.close();
    return `/${target}?v=${Date.now()}`;
}

export async function clearPublicDirBinding() { await del(KEY); }
