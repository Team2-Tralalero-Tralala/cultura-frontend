/*
 * File: ChangePasswordPage.tsx
 * Component: ChangePasswordPage (Client)
 * มาตรฐานที่ใช้ตรวจ: CS v1.1.1 (คอมเมนต์อธิบายส่วนประกอบ/ฟังก์ชัน, a11y, ความปลอดภัย, ความสม่ำเสมอของโค้ด)
 * สรุปหน้าที่:
 *  - แสดงฟอร์มเปลี่ยนรหัสผ่าน (current/new/confirm) พร้อมตรวจความแข็งแรง (PASSWORD_RULE)
 *  - เปิด ConfirmModal ก่อนยิง API และแจ้งผลผ่าน ResultModal
 * หมายเหตุ: โค้ดเดิมไม่ถูกเปลี่ยนพฤติกรรม ใส่คอมเมนต์/โน้ตตรวจมาตรฐานเท่านั้น
 */

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import Button from "@/Components/Button";

/* ===== API instance: แยก BASE_URL กับ PREFIX =====
 * ABS_BASE   : โดเมน/พอร์ต (เช่น http://localhost:4000) — ใช้เป็น axios.baseURL
 * API_PREFIX : path prefix ของ endpoint (แนะนำให้เป็น path เริ่มด้วย "/" เพื่อไม่ override baseURL)
 * NOTE[config]:
 *   - ปัจจุบันตั้งค่า fallback ของ API_PREFIX เป็น "http://localhost:3000/api" (absolute URL)
 *     ส่งผลให้ axios อาจ override baseURL ถ้าเรียกด้วย URL เต็ม (ตั้งใจ/ไม่ตั้งใจ)
 *   - แนะนำให้ปรับ ENV เป็นค่า relative เช่น "/api" เพื่อความสม่ำเสมอระหว่าง env (DEV/PROD)
 */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL?.trim();     // ex. http://localhost:4000
const ABS_BASE =
    RAW_BASE && /^https?:\/\//i.test(RAW_BASE) ? RAW_BASE.replace(/\/+$/, "") : "http://localhost:4000";

const API_PREFIX = (import.meta.env.VITE_API_PREFIX || "http://localhost:3000/api").replace(/\/+$/, ""); // ex. /api, /api/users, /

/* Axios instance: เพิ่ม withCredentials และแนบ Bearer token จาก localStorage
 * NOTE[security]: ควรพิจารณา refresh token flow / token rotation และหลีกเลี่ยงเก็บ token ระยะยาวใน localStorage หากเสี่ยง XSS
 */
const api = axios.create({
    baseURL: ABS_BASE,              // ไม่ต่อ /api ที่นี่ — ไปต่อที่ path ตอนเรียก
    withCredentials: true,
});
api.interceptors.request.use((cfg) => {
    const t = localStorage.getItem("access_token");
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});
console.log("API =", ABS_BASE, "PREFIX =", API_PREFIX); // NOTE[debug]: ถ้า build PROD แนะนำตัด log นี้ออก

/* กฎความแข็งแรงของรหัสผ่าน:
 * - ยาวอย่างน้อย 8 ตัวอักษร (ที่นี่จำกัดสูงสุด 72)
 * - ต้องมี: a-z, A-Z, ตัวเลข, และอักขระพิเศษ อย่างน้อยอย่างละ 1
 */
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,72}$/;

/* ========================= Modal: Confirm =========================
 * บทบาท: โมดัลยืนยันก่อนส่งคำขอเปลี่ยนรหัสผ่าน
 * a11y: role="dialog" + aria-modal="true" + backdrop ปิดได้ด้วยคลิก
 */
function ConfirmModal({
    open,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    if (!open) return null;
    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop: ปิดโมดัลเมื่อคลิกพื้นที่มืด */}
            <div className="absolute inset-0 bg-black/50 z-0" onClick={onCancel} />
            <div className="relative z-10 w-[621px] h-[395px] rounded-[24px] bg-white shadow-2xl p-8">
                <div className="flex flex-col items-center text-center mt-4">
                    {/* NOTE[ui]: ไอคอนเตือน/ยืนยัน */}
                    <Icon icon="circum:circle-alert" className="h-[164px] w-[164px] text-gray-800" />
                    <h3 className="text-3xl mt-2 font-semibold text-gray-900 mb-2">ยืนยันการเปลี่ยนรหัสผ่าน</h3>
                    <p className="text-gray-600 mb-6 text-lg">คุณต้องการยืนยันการเปลี่ยนรหัสผ่านหรือไม่</p>
                    {/* ปุ่มใช้งานเดิม: รักษาความสม่ำเสมอของดีไซน์/พฤติกรรม */}
                    <div className="flex items-center gap-4 w-[251px] h-[42px] max-w-md">
                        <Button type="cancel" htmlType="button" onClick={onCancel}>
                            ยกเลิก
                        </Button>
                        <Button type="confirm-admin" htmlType="button" onClick={onConfirm}>
                            ยืนยัน
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ========================= Modal: Result =========================
 * บทบาท: แสดงผลสำเร็จ/ผิดพลาดหลังทำงาน
 * NOTE[ui]: ตอนนี้กำหนด icon เหมือนกันทั้ง success/error → พิจารณาเปลี่ยนเป็นคนละไอคอนเพื่อ feedback ชัดเจน
 *   ตัวอย่าง: success => "mdi:check-circle", error => "circum:circle-alert"
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
    const head = status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800";
    const icon = status === "success" ? "circum:circle-alert" : "circum:circle-alert"; // NOTE[ui]: ทั้งสองสถานะใช้ไอคอนเดียวกัน
    const title = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";
    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
            <div className="relative z-10 w-[612px] h-[200px] max-w-md rounded-2xl bg-white shadow-xl">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl ${head}`}>
                    <Icon icon={icon} className="h-5 w-5" />
                    <h3 className="text-base font-semibold">{title}</h3>
                </div>
                <div className="px-5 py-4 text-gray-700">{message}</div>
                <div className="px-5 pb-5 ">
                    <Button type="confirm-admin" htmlType="button" onClick={onClose}>
                        ตกลง
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ========================= Page: ChangePassword =========================
 * หน้าที่: แสดงฟอร์มเปลี่ยนรหัสผ่าน, เปิด ConfirmModal ก่อนยิง API, และแสดงผลผ่าน ResultModal
 * ฟลว์หลัก:
 *   - ผู้ใช้กรอก → submit → เปิด ConfirmModal
 *   - กดยืนยันใน ConfirmModal → เรียก proceedChangePassword → ยิง API → แสดง ResultModal
 */
export default function ChangePasswordPage() {
    /* ---------- state: ฟิลด์รหัสผ่าน ---------- */
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    /* ---------- state: toggle แสดง/ซ่อนรหัสผ่าน ---------- */
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* ---------- state: สถานะการส่งและข้อความรวมด้านบน ---------- */
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    /* ---------- state: โมดัลยืนยัน + โมดัลผลลัพธ์ ---------- */
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
    const [resultText, setResultText] = useState<string>("");

    /* คำนวณสิทธิ์ส่งฟอร์ม:
     * - ฟิลด์ครบ
     * - new === confirm
     * - new ตรงตาม PASSWORD_RULE
     */
    const canSubmit = useMemo(() => {
        if (!currentPassword || !newPassword || !confirmNewPassword) return false;
        if (newPassword !== confirmNewPassword) return false;
        if (!PASSWORD_RULE.test(newPassword)) return false;
        return true;
    }, [currentPassword, newPassword, confirmNewPassword]);

    /* ข้อความช่วยบอกความแข็งแรงของรหัส */
    const strengthHint = useMemo(() => {
        if (!newPassword) return "";
        if (!PASSWORD_RULE.test(newPassword)) {
            return "รหัสต้องยาว ≥ 8 และมี a-z, A-Z, 0-9, อักขระพิเศษ";
        }
        return "รหัสผ่านแข็งแรง ✓";
    }, [newPassword]);

    /* utility: รีเซ็ตฟอร์มเมื่อทำรายการสำเร็จ */
    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    };

    /* submit form -> เปิด confirm (กันกดรัวตอนกำลังส่งด้วย submitting) */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setConfirmOpen(true);
    };

    /* ยืนยันใน Confirm → ตรวจ canSubmit → ยิง API
     * NOTE[endpoint]: เรียก `${API_PREFIX}/users/account/change-password/me`
     * NOTE[debug]: console.log ด้านล่าง log URL ที่ "ไม่พ่วง /users" → ใช้เช็ค path เท่านั้น (อาจสับสนตอน debug)
     * NOTE[ux]: แสดง ResultModal ทั้งกรณีสำเร็จ/ล้มเหลว + แสดงข้อความ error จาก API หากมี
     */
    const proceedChangePassword = async () => {
        setConfirmOpen(false);

        if (!canSubmit) {
            const t = "ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง";
            setMessage({ type: "error", text: t });
            setResultStatus("error");
            setResultText(t);
            setResultOpen(true);
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`${API_PREFIX}/users/account/change-password/me`, {
                currentPassword,
                newPassword,
                confirmNewPassword,
            });
            console.log("POST →", api.getUri({ url: `${API_PREFIX}/account/change-password/me` })); // NOTE[debug]: เส้นทางไม่ตรงกับที่ยิงจริง

            const t = "เปลี่ยนรหัสผ่านสำเร็จ";
            setMessage({ type: "success", text: t });
            setResultStatus("success");
            setResultText(t);
            setResultOpen(true);
            resetForm();
        } catch (err: any) {
            // NOTE[error-handling]: รองรับ axios error structure และกรณี token หมดอายุ (401)
            const status = err?.response?.status;
            const apiMsg =
                status === 401
                    ? "กรุณาเข้าสู่ระบบอีกครั้ง"
                    : err?.response?.data?.message || err?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่";
            setMessage({ type: "error", text: apiMsg });
            setResultStatus("error");
            setResultText(apiMsg);
            setResultOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    /* =============================== Render =============================== */
    return (
        <main className="min-h-screen bg-white px-8 py-8 rounded-xl">
            <div className="">
                <h2 className="text-2xl font-normal text-gray-800 mb-6">เปลี่ยนรหัสผ่าน</h2>

                {/* แถบข้อความสั้นด้านบน (สำเร็จ/ผิดพลาด) — a11y: role="status" */}
                {message && (
                    <div
                        role="status"
                        className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* ฟอร์มหลัก: ปิดการ submit ซ้ำด้วย submitting + confirm modal */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div className="w-[249px]">
                        <label className="block text-base font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านปัจจุบัน"
                                className="w-full border border-gray-500 rounded-sm px-3 py-2 pr-10 focus:ring-2 focus:ring-emerald-500"
                                autoComplete="current-password"
                                required
                            />
                            {/* Toggle แสดง/ซ่อนรหัสผ่าน: a11y ด้วย aria-label */}
                            <button
                                type="button"
                                aria-label={showCurrent ? "ซ่อนรหัสผ่านปัจจุบัน" : "แสดงรหัสผ่านปัจจุบัน"}
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowCurrent((p) => !p)}
                            >
                                <Icon icon={showCurrent ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="w-[249px]">
                        <label className="block text-base font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านใหม่"
                                className="w-full border border-gray-500 rounded-sm px-3 py-2 pr-10 focus:ring-2 focus:ring-emerald-500"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                aria-label={showNew ? "ซ่อนรหัสผ่านใหม่" : "แสดงรหัสผ่านใหม่"}
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowNew((p) => !p)}
                            >
                                <Icon icon={showNew ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                        {/* hint ความแข็งแรงของรหัสผ่าน */}
                        <p className="mt-1 text-xs text-gray-500">{strengthHint}</p>
                    </div>

                    {/* Confirm Password */}
                    <div className="w-[249px]">
                        <label className="block text-base font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                className="w-full border border-gray-500 rounded-sm px-3 py-2 pr-10 focus:ring-2 focus:ring-emerald-500"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                aria-label={showConfirm ? "ซ่อนการยืนยันรหัสผ่าน" : "แสดงการยืนยันรหัสผ่าน"}
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowConfirm((p) => !p)}
                            >
                                <Icon icon={showConfirm ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                        {/* แจ้งเตือนถ้า new != confirm */}
                        {confirmNewPassword && newPassword !== confirmNewPassword && (
                            <p className="mt-1 text-xs text-red-600">รหัสผ่านใหม่และการยืนยันไม่ตรงกัน</p>
                        )}
                    </div>

                    {/* ปุ่มควบคุม: cancel (รีเซ็ตเฉพาะ state ฟอร์ม), submit (เปิด confirm) */}
                    <div className="flex gap-3 pt-2">
                        <div className="w-30">
                            <Button
                                type="cancel"
                                htmlType="button"
                                onClick={() => {
                                    if (submitting) return;
                                    setMessage(null);
                                    resetForm();
                                }}
                            >
                                ยกเลิก
                            </Button>
                        </div>
                        <div className="w-30">
                            <Button type="confirm-admin" htmlType="submit">
                                {submitting ? "กำลังบันทึก..." : "ยืนยัน"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* โมดัลยืนยัน + โมดัลผลลัพธ์ */}
            <ConfirmModal open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={proceedChangePassword} />
            <ResultModal open={resultOpen} status={resultStatus} message={resultText} onClose={() => setResultOpen(false)} />
        </main>
    );
}
