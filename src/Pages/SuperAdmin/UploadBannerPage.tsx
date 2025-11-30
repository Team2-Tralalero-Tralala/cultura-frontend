/* 
 * File: UploadBannerPage.tsx
 * Component: UploadBannerPage (Client)
 * มาตรฐาน: CS v1.1.1
 * แนวทางคอมเมนต์:
 *  - คอมเมนต์หัวไฟล์/ฟังก์ชัน/บล็อกโค้ดสำคัญ (TH)
 *  - ไม่แก้ logic/ลำดับ/โครงสร้าง/การ import
 *  - เน้น a11y, security, consistency, และ data flow ชัดเจน
 * หน้าที่:
 *   - จัดการรูป Banner หน้าแรก (สูงสุด 5 รูป)
 *   - โหลด/อัปโหลด/แทนที่/ลบ แบนเนอร์ ผ่าน API ที่กำหนด
 *   - แสดงพรีวิวภาพจากฝั่งเซิร์ฟเวอร์และไฟล์ที่เลือกในเครื่อง
 * หมายเหตุ:
 *   - ใช้ axios + Bearer token (ผ่าน request interceptor)
 */

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import UploadCard from "@/Components/calendar/upload/UploadCard";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import { Modal } from "@/Components/Modal/Modal";
import axios from "axios";
import Breadcrumb from "@/Components/BreadcrumbNavigation";

/* -------------------- Config & axios --------------------
 * อธิบาย: อ่านค่า ENV → สร้างฐาน URL → ตั้งค่า axios instance
 * Security:
 *  - แนบ Authorization: Bearer <token> จาก localStorage (ถ้ามี)
 * Observability:
 *  - debug console เฉพาะ method + URL ที่ resolve แล้ว (ไม่ log token/credentials)
 */
const apiBaseEnv = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBase =
    apiBaseEnv && /^https?:\/\//i.test(apiBaseEnv)
        ? apiBaseEnv.replace(/\/+$/, "")
        : "http://localhost:3000";

const apiPrefix = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/+$/, "");

const apiClient = axios.create({ baseURL: apiBase, withCredentials: true });
apiClient.interceptors.request.use((config) => {
    // แนบ Bearer token ถ้ามี (ระวังอย่า log ค่า token)
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    // Debug: แสดง method + URL (ปลอดภัย ไม่เผย header)
    const resolvedUrl = apiClient.getUri({ url: config.url!, params: config.params });
    console.debug("[API] →", config.method?.toUpperCase(), resolvedUrl);
    return config;
});

/* -------------------- Utils --------------------
 * staticBasePath: เผื่อรองรับ static path กรณีมี reverse proxy/asset host (ยังไม่ใช้งาน)
 * isAbsoluteUrl: ตรวจสอบว่าเป็น URL แบบ absolute หรือไม่
 * getBannerPreviewUrl: แปลง path ฝั่ง server → เป็น URL ที่พร้อมนำไปแสดง
 */
const staticBasePath =
    (import.meta.env.VITE_STATIC_PREFIX ?? "/uploads").replace(/\/+$/, "") || "/";

/** ตรวจว่าเป็น URL http(s) ครบถ้วนหรือไม่ */
const isAbsoluteUrl = (urlString?: string) => !!urlString && /^https?:\/\//i.test(urlString);

/** สร้าง URL สำหรับพรีวิวแบนเนอร์จากข้อมูลที่ได้ (รองรับทั้ง url/path) */
const getBannerPreviewUrl = (item: { path: string; url?: string }) => {
    if (isAbsoluteUrl(item.url)) return item.url as string;
    const rawPath = item.path || "";
    const normalizedPath = "/" + rawPath.replace(/^\/+/, "");
    return `${apiBase}${normalizedPath}`;
};

/* ---------- Types ----------
 * โครงสร้างข้อมูลตามที่ API ส่งกลับ และชนิดที่ใช้ใน UI
 */
type RawBannerItem = {
    id: number;           // ไอดีแบนเนอร์ (จาก DB)
    image: string;        // path หรือ public path ของรูป
    order?: number;       // ลำดับการแสดง (อาจไม่มี)
    url?: string;         // URL เต็ม (อาจไม่มี)
};

type BannerItem = {
    id: number;
    order: number;
    path: string;
    url?: string;
};

/* -------------------- API helpers --------------------
 * ฟังก์ชันเรียก API แบบแยกหน้าที่ชัดเจน
 * ข้อกำหนดสำคัญ:
 *   - upload/replace ใช้ field name = "banner" (ต้องตรงกับฝั่ง server/multer)
 */

/** ดึงรายการแบนเนอร์ทั้งหมด → map เป็น BannerItem พร้อม URL พรีวิว */
async function fetchBanners(): Promise<BannerItem[]> {
    const response = await apiClient.get(`${apiPrefix}/banner`, { params: { _: Date.now() } });

    // รองรับหลายรูปแบบ payload (data.data | data.banners | data | อื่น ๆ ที่เป็น array)
    const rawList = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.banners)
            ? response.data.banners
            : Array.isArray(response.data)
                ? response.data
                : [];

    // แปลงเป็น BannerItem และเติม url พรีวิวให้พร้อมใช้งาน
    return (rawList as RawBannerItem[]).map((rawItem, index) => {
        const bannerItem: BannerItem = {
            id: rawItem.id,
            path: rawItem.image,
            order: rawItem.order ?? index + 1,
        };
        return {
            ...bannerItem,
            url: bannerItem.url ?? getBannerPreviewUrl(bannerItem),
        };
    });
}

/** อัปโหลดไฟล์แบนเนอร์ชุดใหม่ (สูงสุดเท่าช่องว่างที่เหลือ) */
async function uploadBanners(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("banner", file, file.name));
    const response = await apiClient.post(`${apiPrefix}/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}

/** ลบแบนเนอร์ตามไอดี */
async function deleteBanner(id: number) {
    await apiClient.delete(`${apiPrefix}/banner/${id}`);
}

/** แทนที่ไฟล์ของแบนเนอร์ตามไอดี (replace) */
async function replaceBanner(id: number, file: File) {
    const formData = new FormData();
    formData.append("banner", file, file.name);
    const response = await apiClient.put(`${apiPrefix}/banner/${id}`, formData);
    return response.data;
}

/* -------------------- Result Modal --------------------
 * คอมโพเนนต์แจ้งผลสำเร็จ/ไม่สำเร็จ
 * a11y:
 *  - role="dialog" + aria-modal="true"
 *  - คลิกฉากหลังเพื่อปิดได้
 */
function ResultModal({
    isOpen,
    status,
    message,
    onClose,
}: {
    isOpen: boolean;
    status: "success" | "error";
    message: string;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    // Theme หัวโมดัลตามสถานะ
    const headerClass =
        status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800";
    const modalTitle = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* ฉากหลัง: กดเพื่อปิด */}
            <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />

            {/* กล่องผลลัพธ์ */}
            <div className="relative z-10 w-[612px] max-w-full h-[200px] rounded-2xl bg-white shadow-xl">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl ${headerClass}`}>
                    <Icon icon="circum:circle-alert" className="h-5 w-5" />
                    <h3 className="text-base font-semibold">{modalTitle}</h3>
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
 * คอมโพเนนต์หลัก: จัด state และ event handlers ทั้งหมดของหน้า Upload Banner
 * State กลุ่มหลัก:
 *  - serverBanners        : ข้อมูลจาก API (ของจริงบนเซิร์ฟเวอร์)
 *  - bannerFiles          : ไฟล์ที่เลือกจากเครื่อง (ยังไม่ซิงก์)
 *  - localPreviews        : object URL สำหรับพรีวิวไฟล์ในเครื่อง
 *  - combinedPreviews     : รวมรายการพรีวิว (server ก่อน ตามด้วย local)
 *  - remainingBannerSlots : จำนวนช่องที่ยังเพิ่มได้ (จากเพดาน 5)
 *  - Confirm/Result modal : สถานะและข้อความของโมดัลยืนยัน/ผลลัพธ์
 *  - pendingIndex/Action  : คิวงานสำหรับ edit/delete + tempFile สำหรับ replace
 */
export default function UploadBannerPage() {
    /* -------------------- Server/Local banners -------------------- */
    const [serverBanners, setServerBanners] = useState<BannerItem[]>([]);
    const serverCount = serverBanners.length;

    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [localPreviews, setLocalPreviews] = useState<{ url: string }[]>([]);

    useEffect(() => {
        // สร้าง object URL สำหรับไฟล์ที่เลือก (เพื่อแสดงพรีวิวทันที)
        const previewUrls = bannerFiles.map((file) => ({ url: URL.createObjectURL(file) }));
        setLocalPreviews(previewUrls);

        // Cleanup: revoke URL เพื่อป้องกัน memory leak
        return () => previewUrls.forEach((u) => URL.revokeObjectURL(u.url));
    }, [bannerFiles]);

    // รวมพรีวิว: รายการเซิร์ฟเวอร์ตามด้วยไฟล์ที่เพิ่งเลือก
    const combinedPreviews = useMemo(
        () => [
            ...serverBanners.map((banner) => ({ url: banner.url ?? getBannerPreviewUrl(banner) })),
            ...localPreviews,
        ],
        [serverBanners, localPreviews]
    );

    // เพดานจำกัด: แสดง/อัปโหลดได้ไม่เกิน 5 รายการ
    const remainingBannerSlots = Math.max(0, 5 - (serverCount + bannerFiles.length));

    /* -------------------- Modals & Pending actions -------------------- */
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDescription, setConfirmDescription] = useState("");
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
    const [tempFile, setTempFile] = useState<File | null>(null);

    const [isResultOpen, setIsResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
    const [resultMessage, setResultMessage] = useState("");

    // input ซ่อน: ใช้เปิด dialog เลือกไฟล์ตอนเริ่ม "แก้ไข"
    const editInputRef = useRef<HTMLInputElement | null>(null);

    /* -------------------- Effects -------------------- */
    /** โหลดแบนเนอร์ครั้งแรกและหลังทำงานสำเร็จ (refresh ทั้งหน้า) */
    const refreshBanners = async () => {
        try {
            const items = await fetchBanners();
            items.sort((a, b) => a.order - b.order);
            setServerBanners(items);
            setBannerFiles([]); // reset ไฟล์ฝั่ง client เมื่อ sync แล้ว
        } catch (error) {
            console.error("Failed to fetch banners:", error);
            // TODO: อาจแจ้งผ่าน ResultModal กรณีจำเป็น
        }
    };

    useEffect(() => {
        // เรียกครั้งแรกหลัง mount
        refreshBanners();
    }, []);

    /* -------------------- Handlers -------------------- */

    /**
     * handleAddFiles
     * - รับ File[] จาก UploadCard → ตัดให้ไม่เกินช่องว่างที่เหลือ → อัปโหลดทันที
     * - สำเร็จ: refresh + modal success
     * - ล้มเหลว: modal error + เก็บไฟล์ไว้ใน local เพื่อให้ผู้ใช้ลองใหม่
     */
    const handleAddFiles = async (files: File[]) => {
        const filesToUpload = files.slice(0, remainingBannerSlots);
        if (!filesToUpload.length) return;

        try {
            await uploadBanners(filesToUpload);
            await refreshBanners();
            setBannerFiles([]);

            setResultStatus("success");
            setResultMessage(`อัปโหลดสำเร็จ ${filesToUpload.length} ไฟล์`);
            setIsResultOpen(true);
        } catch (error: any) {
            setResultStatus("error");
            setResultMessage(error?.message || "อัปโหลดไม่สำเร็จ");
            setIsResultOpen(true);

            // เก็บไว้เพื่อแสดงพรีวิวต่อ (user อาจลองอัปโหลดใหม่ภายหลัง)
            setBannerFiles((prev) => [...prev, ...filesToUpload]);
        }
    };

    /**
     * onEditClick
     * - เริ่ม flow แก้ไขรูป ณ index → เปิด file picker
     */
    const onEditClick = (index: number) => {
        setPendingIndex(index);
        setPendingAction("edit");
        editInputRef.current?.click();
    };

    /**
     * handleEditFileChange
     * - หลังเลือกไฟล์ใหม่จาก file picker → เก็บไฟล์ชั่วคราว → เปิด confirm
     */
    const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (!selectedFiles.length) return;

        setTempFile(selectedFiles[0]);
        setConfirmTitle("ยืนยันการแก้ไขรูปภาพหรือไม่");
        setConfirmDescription("คุณจะไม่สามารถย้อนกลับได้");
        setIsConfirmOpen(true);

        // รีเซ็ตค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้ในครั้งถัดไป
        event.target.value = "";
    };

    /**
     * onDeleteClick
     * - เปิด confirm modal เพื่อยืนยันลบรูป ณ index ที่เลือก
     */
    const onDeleteClick = (index: number) => {
        setPendingIndex(index);
        setPendingAction("delete");
        setConfirmTitle("ยืนยันการลบรูปภาพหรือไม่");
        setConfirmDescription("คุณจะไม่สามารถย้อนกลับได้");
        setIsConfirmOpen(true);
    };

    /** ปิด confirm และล้างสถานะชั่วคราวทั้งหมด */
    const handleCancelConfirm = () => {
        setIsConfirmOpen(false);
        setTempFile(null);
        setPendingIndex(null);
        setPendingAction(null);
    };

    /**
     * handleConfirmAction
     * - ทำตาม action (delete/edit) ที่ยืนยันแล้ว
     * - แยกกรณี item จาก server vs local (อิงด้วย serverCount)
     * - สำเร็จ/ล้มเหลว: แจ้งผ่าน ResultModal
     */
    const handleConfirmAction = async () => {
        if (pendingIndex == null || pendingAction == null) {
            setIsConfirmOpen(false);
            return;
        }

        const isServerItem = pendingIndex < serverCount;

        try {
            if (pendingAction === "delete") {
                if (isServerItem) {
                    await deleteBanner(serverBanners[pendingIndex].id);
                    await refreshBanners();
                } else {
                    // ลบจากรายการ local preview
                    const localIndex = pendingIndex - serverCount;
                    setBannerFiles((prev) => prev.filter((_, i) => i !== localIndex));
                }

                setResultStatus("success");
                setResultMessage("ลบรูปภาพสำเร็จ");
                setIsResultOpen(true);
            }

            if (pendingAction === "edit") {
                if (!tempFile) throw new Error("ไม่ได้เลือกไฟล์ใหม่");

                if (isServerItem) {
                    await replaceBanner(serverBanners[pendingIndex].id, tempFile);
                    await refreshBanners();
                } else {
                    // แทนที่ไฟล์ในฝั่ง local ตามตำแหน่ง
                    const localIndex = pendingIndex - serverCount;
                    setBannerFiles((prev) => {
                        const next = [...prev];
                        next[localIndex] = tempFile;
                        return next;
                    });
                }

                setResultStatus("success");
                setResultMessage("แก้ไขรูปภาพสำเร็จ");
                setIsResultOpen(true);
            }
        } catch (error: any) {
            setResultStatus("error");
            setResultMessage(error?.message || "ไม่สำเร็จ");
            setIsResultOpen(true);
        }

        // ปิด confirm และล้างสถานะชั่วคราว
        setIsConfirmOpen(false);
        setTempFile(null);
        setPendingIndex(null);
        setPendingAction(null);
    };

    /**
     * renderPreviewCards
     * - เรนเดอร์การ์ดพรีวิวทั้งหมด (รวมปุ่มแก้ไข/ลบ)
     * a11y:
     *  - alt อ้างอิง index เพื่อบอกตำแหน่งรูปในกลุ่ม
     *  - title ปุ่มชัดเจน "แก้ไขรูป"/"ลบรูป"
     */
    const renderPreviewCards = (previews: { url: string }[]) =>
        previews.map((preview, index) => (
            <div
                key={index}
                className="relative shrink-0 overflow-hidden rounded-xl shadow border border-gray-200"
                style={{ width: 200, height: 120 }}
            >
                <img
                    src={preview.url}
                    alt={`preview-banner-${index}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                <div className="absolute bottom-2 right-2 z-20 flex space-x-2">
                    <button
                        type="button"
                        onClick={() => onEditClick(index)}
                        className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        title="แก้ไขรูป"
                    >
                        <Icon icon="mdi:pencil" className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDeleteClick(index)}
                        className="w-7 h-7 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        title="ลบรูป"
                    >
                        <Icon icon="mdi:delete" className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>
        ));

    /* -------------------- Render -------------------- */
    return (
        <>
            <Breadcrumb
                current={{
                    label: "การเพิ่ม/แก้ไข รูปภาพ",
                    to: `/super/banners`,
                }}
            />

            {/* โครงหน้าหลัก */}
            <main className="min-h-screen bg-white px-8 py-8 rounded-xl">
                <div className="flex items-center mb-6 ">
                    <a
                        className="items-center gap-2 mr-4 text-gray-800 hover:text-dark-green"
                        href="/super/setting"
                        data-discover="true"
                        aria-label="ย้อนกลับ"
                    >
                        {/* ไอคอน back (inline SVG) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true"
                            role="img"
                            className="iconify iconify--lucide w-7 h-7"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m12 19l-7-7l7-7m7 7H5"
                            />
                        </svg>
                    </a>
                    <h1 className="text-[20px] font-bold">การเพิ่ม/แก้ไข รูปภาพ</h1>
                </div>

                {/* กลุ่มแสดง/เพิ่มพรีวิวแบนเนอร์ */}
                <div
                    className="relative pl-20 mb-8
                                    before:content-[''] before:absolute before:left-6 before:top-0 before:bottom-0 before:w-[1px] before:bg-black
                                    after:content-[''] after:absolute after:left-[13px] after:top-2 after:w-6 after:h-6 after:rounded-full after:bg-black
                                    ml-20 mt-10
                                "
                >
                    <section>
                        <h2 className="text-base font-medium text-gray-800 mb-4">รูปภาพในหน้าหลัก</h2>

                        <div className="flex flex-wrap items-start gap-4">
                            {renderPreviewCards(combinedPreviews)}

                            {/* การ์ดเพิ่มรูป (แสดงเมื่อยังไม่ครบ 5) */}
                            {remainingBannerSlots > 0 && (
                                <UploadCard
                                    max={remainingBannerSlots}
                                    accept="image/*"
                                    multiple={remainingBannerSlots > 1}
                                    value={bannerFiles}
                                    onChange={(files: File[]) => handleAddFiles(files)}
                                    itemW={200}
                                    itemH={120}
                                    square={false}
                                />
                            )}
                        </div>
                    </section>
                </div>

                {/* input ซ่อนสำหรับ flow replace (กด "แก้ไข" แล้วค่อยคลิก) */}
                <input
                    type="file"
                    accept="image/*"
                    ref={editInputRef}
                    className="hidden"
                    onChange={handleEditFileChange}
                />

                {/* โมดัลยืนยัน (Confirm) */}
                <Modal
                    open={isConfirmOpen}
                    title={confirmTitle}
                    text={confirmDescription}
                    onCancel={handleCancelConfirm}
                    onConfirm={handleConfirmAction}
                    confirmText="ยืนยัน"
                    cancelText="ยกเลิก"
                />

                {/* โมดัลผลลัพธ์ (สำเร็จ/ผิดพลาด) */}
                <ResultModal
                    isOpen={isResultOpen}
                    status={resultStatus}
                    message={resultMessage}
                    onClose={() => setIsResultOpen(false)}
                />
            </main>
        </>
    );
}
