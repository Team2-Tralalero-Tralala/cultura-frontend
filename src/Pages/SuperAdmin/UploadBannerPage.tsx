/* 
 * File: UploadBannerPage.tsx
 * Component: UploadBannerPage (Client)
 * มาตรฐาน: CS v1.1.1 (คอมเมนต์ไทยเท่านั้น ไม่แก้โค้ด)
 * หน้าที่:
 *   - จัดการรูป Banner หน้าแรก (สูงสุด 5 รูป)
 *   - โหลดรายการแบนเนอร์จาก API, อัปโหลดใหม่, แทนที่ (edit/replace), ลบ
 *   - แสดงพรีวิวรูปทั้งจากเซิร์ฟเวอร์และไฟล์ที่เลือกในเครื่อง
 *   - ใช้ axios พร้อม Bearer token ผ่าน interceptor
 * โครงสร้างหลัก:
 *   - Config & axios (กำหนด base URL, prefix, และ interceptor)
 *   - Utils (ตรวจ URL, สร้างพรีวิว URL, แปลงผลลัพธ์ API)
 *   - API helpers (fetchBanners/uploadBanners/deleteBanner/replaceBanner)
 *   - ResultModal (แจ้งผลสำเร็จ/ล้มเหลว)
 *   - UploadBannerPage (ตัวหน้าเพจหลัก + handlers + UI flow)
 * หมายเหตุ:
 *   - โค้ดคอมเมนต์เท่านั้น ไม่มีการแก้ไข logic, import, หรือ signature ใด ๆ
 */

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import axios from "axios";

/* -------------------- Config & axios --------------------
 * กำหนดค่า Base URL และ Prefix จาก ENV
 * - API_BASE: โดเมนฐาน (ไม่มี /api ต่อท้าย)
 * - API_PREFIX: พาธ prefix (เช่น /api)
 * ตั้งค่า axios instance:
 * - withCredentials: true (แนบคุกกี้ถ้ามี)
 * - interceptor: แนบ Authorization Bearer จาก localStorage
 * - debug: แสดงปลายทางเต็มที่กำลังเรียก
 */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE =
    RAW_BASE && /^https?:\/\//i.test(RAW_BASE)
        ? RAW_BASE.replace(/\/+$/, "")
        : "http://localhost:3000";
const API_PREFIX = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/+$/, "");

const api = axios.create({ baseURL: API_BASE, withCredentials: true });
api.interceptors.request.use((cfg) => {
    const t = localStorage.getItem("access_token");
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    // debug: ดูปลายทางจริงที่กำลังจะยิง (method + URL ที่ resolve แล้ว)
    const full = api.getUri({ url: cfg.url!, params: cfg.params });
    console.debug("[API] →", cfg.method?.toUpperCase(), full);
    return cfg;
});


/* -------------------- Utils --------------------
 * STATIC_PREFIX: พาธฐานของไฟล์ static (เผื่อใช้ในอนาคต—ยังไม่ได้อ้างอิง)
 * isAbsUrl: ตรวจว่า string เป็น URL แบบ absolute (http/https) หรือไม่
 * bannerPreviewUrl: คืน URL สำหรับพรีวิวรูปจาก item (รองรับกรณี URL แบบ absolute และกรณี path จากเซิร์ฟเวอร์)
 */
const STATIC_PREFIX = (import.meta.env.VITE_STATIC_PREFIX ?? "/uploads").replace(/\/+$/, "") || "/";

const isAbsUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);

const bannerPreviewUrl = (it: { path: string; url?: string }) => {
    if (isAbsUrl(it.url)) return it.url as string;
    const raw = it.path || "";
    const lead = "/" + raw.replace(/^\/+/, "");
    return `${API_BASE}${lead}`;
};

/* ---------- Types ----------
 * RawBannerItem: โครงสร้างที่ได้จาก API (image เป็น path/public path)
 * BannerItem   : โครงสร้างที่ใช้ภายในหน้าเพจ (แยก id/order/path/url ชัดเจน)
 */
type RawBannerItem = {
    id: number;
    image: string;
    order?: number;
    url?: string;
};

type BannerItem = {
    id: number;
    order: number;
    path: string;
    url?: string;
};

/* -------------------- API helpers --------------------
 * fetchBanners: GET รายการแบนเนอร์ → map ให้เป็น BannerItem พร้อม url พรีวิว
 * uploadBanners: POST ไฟล์หลายไฟล์ (field name: "banner")
 * deleteBanner: DELETE แบนเนอร์ตาม id
 * replaceBanner: PUT แทนที่ไฟล์ของแบนเนอร์ตาม id (field name: "banner")
 * หมายเหตุ: โครงสร้าง field name ต้องตรงกับฝั่ง server/multer
 */
async function fetchBanners(): Promise<BannerItem[]> {
    const r = await api.get(`${API_PREFIX}/banner`, { params: { _: Date.now() } });
    // รองรับรูปแบบห่อผลลัพธ์ที่หลากหลาย (data.data | data.banners | data)
    const rawArr = Array.isArray(r.data?.data) ? r.data.data
        : Array.isArray(r.data?.banners) ? r.data.banners
            : Array.isArray(r.data) ? r.data
                : [];

    // map → BannerItem (กำหนด order fallback ด้วย index+1)
    return (rawArr as RawBannerItem[]).map((it, index) => {
        const item: BannerItem = {
            id: it.id,
            path: it.image,
            order: it.order ?? (index + 1),
        };

        return {
            ...item,
            url: item.url ?? bannerPreviewUrl(item) // สร้าง URL สำหรับพรีวิว
        };
    });
}

async function uploadBanners(files: File[]) {
    const fd = new FormData();
    files.forEach((f) => fd.append("banner", f, f.name));
    const r = await api.post(`${API_PREFIX}/banner`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data;
}

async function deleteBanner(id: number) {
    await api.delete(`${API_PREFIX}/banner/${id}`);
}

async function replaceBanner(id: number, file: File) {
    const fd = new FormData();
    fd.append("banner", file, file.name);
    const r = await api.put(`${API_PREFIX}/banner/${id}`, fd);
    return r.data;
}

/* -------------------- Result Modal --------------------
 * คอมโพเนนต์แจ้งผล (สำเร็จ/ผิดพลาด)
 * Props:
 *  - open   : เปิด/ปิดโมดัล
 *  - status : "success" | "error" (กำหนดหัวและชื่อเรื่อง)
 *  - message: ข้อความเนื้อหา
 *  - onClose: ปิดโมดัล
 * เกณฑ์ A11y:
 *  - role="dialog" + aria-modal="true" + คลิกฉากหลังเพื่อปิด
 */
function ResultModal({
    open,
    status,
    message,
    onClose,
}: {
    open: boolean;
    status: "success" | "error";
    message: string;
    onClose: () => void;
}) {
    if (!open) return null;
    const headClass = status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800";
    const title = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";
    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
            <div className="relative z-10 w-[612px] max-w-full h-[200px] rounded-2xl bg-white shadow-xl">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl ${headClass}`}>
                    <Icon icon="circum:circle-alert" className="h-5 w-5" />
                    <h3 className="text-base font-semibold">{title}</h3>
                </div>
                <div className="px-5 py-4 text-gray-700">{message}</div>
                <div className="px-5 pb-5">
                    <Button type="confirm-admin" htmlType="button" onClick={onClose}>
                        ตกลง
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* -------------------- Page --------------------
 * คอมโพเนนต์หลัก: UploadBannerPage
 * สเตตหลัก:
 *  - serverBanners : รายการแบนเนอร์จาก API (ฝั่งเซิร์ฟเวอร์)
 *  - bannerFiles   : ไฟล์ที่เลือกในเครื่อง (ยังไม่ส่ง/หรือส่งแล้วแต่คงไว้เป็น local state)
 *  - localPreviews : object URLs สำหรับพรีวิวไฟล์ที่เลือกในเครื่อง
 *  - combinedPreviews: รวมพรีวิว server + local (เรียงตามที่แสดง)
 *  - remainBanner  : จำนวนช่องที่เหลือให้อัปโหลด (สูงสุด 5)
 *  - confirm/result modals: คุมการยืนยันและข้อความผลลัพธ์
 *  - pendingIndex/pendingAction/tempFile: จัดคิวงาน edit/delete และไฟล์ใหม่ชั่วคราว
 */
export default function UploadBannerPage() {
    // Server banners
    const [serverBanners, setServerBanners] = useState<BannerItem[]>([]);
    const serverCount = serverBanners.length;

    // Local (not yet synced) files
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [localPreviews, setLocalPreviews] = useState<{ url: string }[]>([]);
    useEffect(() => {
        // สร้าง object URLs สำหรับไฟล์ที่เลือก เพื่อพรีวิวในหน้า
        const urls = bannerFiles.map((f) => ({ url: URL.createObjectURL(f) }));
        setLocalPreviews(urls);
        // cleanup: ยกเลิก URL เพื่อเลี่ยง memory leak
        return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
    }, [bannerFiles]);

    // Combine previews (server first, then local)
    const combinedPreviews = useMemo(
        () => [...serverBanners.map((b) => ({ url: b.url ?? bannerPreviewUrl(b) })), ...localPreviews],
        [serverBanners, localPreviews]
    );

    // Limits (เหลือช่องว่างให้อัปโหลดอีกเท่าไร จาก limit 5)
    const remainBanner = Math.max(0, 5 - (serverCount + bannerFiles.length));

    // Confirm/Result modals & states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDesc, setConfirmDesc] = useState("");
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
    const [tempFile, setTempFile] = useState<File | null>(null);

    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
    const [resultMessage, setResultMessage] = useState("");

    // input ซ่อนสำหรับเลือกไฟล์ตอนกด "แก้ไข"
    const editInputRef = useRef<HTMLInputElement | null>(null);

    /**
     * ฟังก์ชัน: refresh
     * คำอธิบาย: โหลดรายการแบนเนอร์จาก API ใหม่, sort ตาม order, รีเซ็ตไฟล์ที่เลือกในเครื่อง
     * การเรียกใช้: ใน useEffect (ครั้งแรก) และหลังอัปโหลด/แทนที่/ลบ สำเร็จ
     */
    const refresh = async () => {
        try {
            const items = await fetchBanners();
            items.sort((a, b) => a.order - b.order);
            setServerBanners(items);
            setBannerFiles([]);
        } catch (e) {
            console.error("Failed to fetch banners:", e);
            // TODO: สามารถแสดง ResultModal แจ้งข้อผิดพลาดเพิ่มได้
        }
    };

    // โหลดข้อมูลครั้งแรกหลัง mount
    useEffect(() => {
        refresh();
    }, []);

    /* ------------ Handlers (อีเวนต์หลัก) ------------ */

    /**
     * handleAddFiles: เมื่อเลือกไฟล์ใหม่จาก UploadCard
     * - ตัดให้ไม่เกิน remainBanner
     * - อัปโหลดทันที แล้ว refresh หน้ารายการ
     * - แจ้งผลด้วย ResultModal
     */
    const handleAddFiles = async (files: File[]) => {
        const toAdd = files.slice(0, remainBanner);
        if (!toAdd.length) return;

        try {
            await uploadBanners(toAdd);
            await refresh();
            setBannerFiles([]);

            setResultStatus("success");
            setResultMessage(`อัปโหลดสำเร็จ ${toAdd.length} ไฟล์`);
            setResultOpen(true);
        } catch (e: any) {
            setResultStatus("error");
            setResultMessage(e?.message || "อัปโหลดไม่สำเร็จ");
            setResultOpen(true);
            // เก็บไฟล์ไว้ใน local (พรีวิว) เผื่อผู้ใช้จะส่งใหม่ภายหลัง
            setBannerFiles((prev) => [...prev, ...toAdd]);
        }
    };

    /**
     * onEditClick: เริ่ม flow แก้ไขรูป ณ index ที่เลือก
     * - กำหนด pendingIndex, pendingAction แล้วเปิด <input type="file"> ที่ซ่อนอยู่
     */
    const onEditClick = (index: number) => {
        setPendingIndex(index);
        setPendingAction("edit");
        editInputRef.current?.click();
    };

    /**
     * handleEditFileChange: รับไฟล์ใหม่สำหรับการ "แก้ไข"
     * - เก็บไฟล์ไว้ใน tempFile
     * - เปิด Confirm modal เพื่อยืนยัน
     */
    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(e.target.files ?? []);
        if (!fileList.length) return;
        setTempFile(fileList[0]);
        setConfirmTitle("ยืนยันการแก้ไขรูปภาพหรือไม่");
        setConfirmDesc("คุณจะไม่สามารถย้อนกลับได้");
        setConfirmOpen(true);
        e.target.value = "";
    };

    /**
     * onDeleteClick: เริ่ม flow ลบรูป ณ index ที่เลือก
     * - เปิด Confirm modal เพื่อยืนยันการลบ
     */
    const onDeleteClick = (index: number) => {
        setPendingIndex(index);
        setPendingAction("delete");
        setConfirmTitle("ยืนยันการลบรูปภาพหรือไม่");
        setConfirmDesc("คุณจะไม่สามารถย้อนกลับได้");
        setConfirmOpen(true);
    };

    /**
     * handleCancelConfirm: ปิดโมดัลยืนยันและล้าง state ชั่วคราว
     */
    const handleCancelConfirm = () => {
        setConfirmOpen(false);
        setTempFile(null);
        setPendingIndex(null);
        setPendingAction(null);
    };

    /**
     * handleConfirmAction: ดำเนินการตามที่ผู้ใช้ยืนยัน (edit/delete)
     * - กรณี delete:
     *   • ถ้าเป็นรูปจากเซิร์ฟเวอร์ → เรียก API ลบ แล้ว refresh
     *   • ถ้าเป็นรูป local → ลบออกจาก bannerFiles
     * - กรณี edit:
     *   • ต้องมี tempFile
     *   • ถ้าเป็นรูปจากเซิร์ฟเวอร์ → เรียก API replace แล้ว refresh
     *   • ถ้าเป็นรูป local → แทนที่ไฟล์ใน bannerFiles
     * - แสดงผลลัพธ์ผ่าน ResultModal
     * - ปิด confirm และล้าง state ชั่วคราว
     */
    const handleConfirmAction = async () => {
        if (pendingIndex == null || pendingAction == null) {
            setConfirmOpen(false);
            return;
        }

        const isServerItem = pendingIndex < serverCount;
        try {
            if (pendingAction === "delete") {
                if (isServerItem) {
                    await deleteBanner(serverBanners[pendingIndex].id);
                    await refresh();
                } else {
                    const localIdx = pendingIndex - serverCount;
                    setBannerFiles((prev) => prev.filter((_, i) => i !== localIdx));
                }
                setResultStatus("success");
                setResultMessage("ลบรูปภาพสำเร็จ");
                setResultOpen(true);
            }

            if (pendingAction === "edit") {
                if (!tempFile) throw new Error("ไม่ได้เลือกไฟล์ใหม่");

                if (isServerItem) {
                    await replaceBanner(serverBanners[pendingIndex].id, tempFile);
                    await refresh();
                } else {
                    const localIdx = pendingIndex - serverCount;
                    setBannerFiles((prev) => {
                        const arr = [...prev];
                        arr[localIdx] = tempFile;
                        return arr;
                    });
                }

                setResultStatus("success");
                setResultMessage("แก้ไขรูปภาพสำเร็จ");
                setResultOpen(true);
            }
        } catch (e: any) {
            setResultStatus("error");
            setResultMessage(e?.message || "ไม่สำเร็จ");
            setResultOpen(true);
        }

        setConfirmOpen(false);
        setTempFile(null);
        setPendingIndex(null);
        setPendingAction(null);
    };

    /**
     * renderPreviewCards: เรนเดอร์การ์ดพรีวิว (server + local)
     * - มีปุ่มแก้ไข/ลบลอยอยู่มุมล่างขวา
     * - index ของการ์ดคือ index ใน combinedPreviews (ใช้ตัดสิน server/local)
     */
    const renderPreviewCards = (previews: { url: string }[]) =>
        previews.map((p, idx) => (
            <div
                key={idx}
                className="relative shrink-0 overflow-hidden rounded-xl shadow border border-gray-200"
                style={{ width: 200, height: 120 }}
            >
                <img src={p.url} alt={`preview-banner-${idx}`} className="w-full h-full object-cover" draggable={false} />
                <div className="absolute bottom-2 right-2 z-20 flex space-x-2">
                    <button
                        type="button"
                        onClick={() => onEditClick(idx)}
                        className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        title="แก้ไขรูป"
                    >
                        <Icon icon="mdi:pencil" className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDeleteClick(idx)}
                        className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        title="ลบรูป"
                    >
                        <Icon icon="mdi:delete" className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>
        ));

    /* ---------- Render หลักของหน้า ---------- */
    return (
        <main className="min-h-screen bg-gray-50 py-8 px-6">
            <div className="max-w-6xl h-full mx-auto bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start justify-between mb-8">
                    <h1 className="text-lg font-medium text-gray-800">การเพิ่ม/แก้ไข รูปภาพ</h1>
                </div>

                {/* เส้น Timeline/หัวข้อย่อย (ตกแต่ง UI) */}
                <div className="relative pl-20 mb-8
                                    before:content-[''] before:absolute before:left-6 before:top-0 before:bottom-0 before:w-[1px] before:bg-black
                                    after:content-[''] after:absolute after:left-[13px] after:top-2 after:w-6 after:h-6 after:rounded-full after:bg-black
                                ">
                    <section>
                        <h2 className="text-base font-medium text-gray-800 mb-4">รูปภาพในหน้าหลัก</h2>
                        <div className="flex flex-wrap items-start gap-4">
                            {renderPreviewCards(combinedPreviews)}

                            {/* ปุ่ม/การ์ดสำหรับเพิ่มรูป (แสดงเมื่อยังไม่ครบ 5) 
                               - UploadCard เป็นคอมโพเนนต์ที่ส่งคืน File[] ผ่าน onChange
                               - ที่นี่ส่งต่อไป handleAddFiles เพื่ออัปโหลดทันที */}
                            {remainBanner > 0 && (
                                <UploadCard
                                    max={remainBanner}
                                    accept="image/*"
                                    multiple={remainBanner > 1}
                                    value={bannerFiles}                 // ใช้เป็น File[] ที่เลือกในเครื่อง
                                    onChange={(files: File[]) => handleAddFiles(files)}   // ส่งไฟล์ไปอัปโหลด
                                    itemW={200}
                                    itemH={120}
                                    square={false}
                                />
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Hidden input สำหรับ flow "แก้ไข" (replace) */}
            <input type="file" accept="image/*" ref={editInputRef} className="hidden" onChange={handleEditFileChange} />

            {/* โมดัลยืนยัน */}
            <Modal
                open={confirmOpen}
                title={confirmTitle}
                text={confirmDesc}
                onCancel={handleCancelConfirm}
                onConfirm={handleConfirmAction}
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
            />

            {/* โมดัลผลลัพธ์ (สำเร็จ/ผิดพลาด) */}
            <ResultModal open={resultOpen} status={resultStatus} message={resultMessage} onClose={() => setResultOpen(false)} />
        </main>
    );
}
