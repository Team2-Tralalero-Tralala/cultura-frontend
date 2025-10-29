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
    let directoryHandle = await loadPublicDir();
    if (!directoryHandle) directoryHandle = (await pickPublicDir()) as FileSystemDirectoryHandle;
    if (!directoryHandle) throw new Error("No permission for public folder");
    return directoryHandle;
}

/** แปลงภาพเป็น PNG เพื่อให้ชื่อคงที่ .png */
async function toPNGBlob(file: File): Promise<Blob> {
    if (file.type === "image/png") return file;

    // อ่านไฟล์เป็น data URL
    const dataUrlString = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    // โหลดเป็น <img> เพื่อวาดลง canvas
    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgEl = new Image();
        imgEl.onload = () => resolve(imgEl);
        imgEl.onerror = reject;
        imgEl.src = dataUrlString;
    });

    // วาดลง canvas แล้วแปลงเป็น PNG Blob
    const canvas = document.createElement("canvas");
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.drawImage(imageElement, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((pngBlobData) => (pngBlobData ? resolve(pngBlobData) : reject(new Error("toBlob failed"))), "image/png", 0.92);
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

/**  เขียนทับไฟล์โลโก้ชื่อคงที่ใน /public (ลบของเดิมก่อน) */
export async function saveLogoVariantToPublic(variant: LogoVariant, logoFile: File): Promise<string> {
    const publicDirHandle = await ensureDir();
    const baseName = variant === "white" ? "logo-white" : "logo-black";

    await deleteIfExists(publicDirHandle, baseName);

    const targetFileName = `${baseName}.png`;
    const fileHandle = await publicDirHandle.getFileHandle(targetFileName, { create: true });
    const writableStream = await fileHandle.createWritable();

    const pngBlob = await toPNGBlob(logoFile);
    await writableStream.write(await pngBlob.arrayBuffer());
    await writableStream.close();

    // cache-bust เวลาเปิดดูใน <img>
    return `/${targetFileName}?v=${Date.now()}`;
}

/** เคสทั่วไป: เซฟชื่อที่กำหนด (จะเขียนทับไฟล์ชื่อนั้น) */
export async function saveToPublic(file: File, fileName?: string): Promise<string> {
    const publicDirHandle = await ensureDir();
    const targetFileName = fileName ?? file.name;

    try {
        await (publicDirHandle as any).removeEntry?.(targetFileName);
    } catch {
    }

    const fileHandle = await publicDirHandle.getFileHandle(targetFileName, { create: true });
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(await file.arrayBuffer());
    await writableStream.close();

    return `/${targetFileName}?v=${Date.now()}`;
}


export async function clearPublicDirBinding() { await del(KEY); }
