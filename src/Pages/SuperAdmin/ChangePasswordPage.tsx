/*
 * File: ChangePasswordPage.tsx
 * Component: ChangePasswordPage (Client)
 * มาตรฐานที่ใช้ตรวจ: CS v1.1.1 (คอมเมนต์อธิบายส่วนประกอบ/ฟังก์ชัน, a11y, ความปลอดภัย, ความสม่ำเสมอของโค้ด)
 * สรุปหน้าที่:
 *  - แสดงฟอร์มเปลี่ยนรหัสผ่าน (current/new/confirm) พร้อมตรวจความแข็งแรง (PASSWORD_RULE)
 *  - เปิด SweetAlert2 Modal (Confirm) ก่อนยิง API และแจ้งผลผ่าน ResultModal
 * หมายเหตุ: ไม่เปลี่ยนพฤติกรรมเดิม เพิ่มคอมเมนต์และสลับไปใช้ Modal ที่ให้มาเท่านั้น
 */


import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import Button from "@/Components/Button";
import { Modal as ConfirmModal } from "@/Components/Modal/Modal";

/* ===== API instance: แยก BASE_URL กับ PREFIX =====
 * - apiBaseRaw   : ค่าจาก ENV เดิม
 * - apiBaseUrl   : โดเมนฐาน (ตัด / ท้ายให้เรียบ)
 * - apiPrefix    : พาธ prefix (เช่น /api)
 */
const apiBaseRaw = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl =
    apiBaseRaw && /^https?:\/\//i.test(apiBaseRaw)
        ? apiBaseRaw.replace(/\/+$/, "")
        : "http://localhost:4000";

const apiPrefix = (import.meta.env.VITE_API_PREFIX || "http://localhost:3000/api").replace(/\/+$/, "");

/* Axios instance: เพิ่ม withCredentials และแนบ Bearer token จาก localStorage */
const apiClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});
apiClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

/* กฎความแข็งแรงของรหัสผ่าน (camelCase) */
const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

/* ========================= Modal: Result =========================
 * บทบาท: แสดงผลสำเร็จ/ผิดพลาดหลังทำงาน (โครงเดิม, ปรับชื่อแปรเฉพาะในฟังก์ชัน)
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

    const headerClass =
        status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800";
    const iconName = "circum:circle-alert"; // NOTE: ใช้ไอคอนเดียวกับของเดิม
    const titleText = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
            <div className="relative z-10 w-[612px] h-[200px] max-w-md rounded-2xl bg-white shadow-xl">
                <div className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl ${headerClass}`}>
                    <Icon icon={iconName} className="h-5 w-5" />
                    <h3 className="text-base font-semibold">{titleText}</h3>
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

/* ========================= Page: ChangePassword ========================= */
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

    /* ---------- state: โมดัลยืนยัน + ผลลัพธ์ ---------- */
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
    const [resultText, setResultText] = useState<string>("");

    /* คำนวณสิทธิ์ส่งฟอร์ม */
    const canSubmit = useMemo(() => {
        if (!currentPassword || !newPassword || !confirmNewPassword) return false;
        if (newPassword !== confirmNewPassword) return false;
        if (!passwordRule.test(newPassword)) return false;
        return true;
    }, [currentPassword, newPassword, confirmNewPassword]);

    /* hint ความแข็งแรงของรหัส */
    const strengthHint = useMemo(() => {
        if (!newPassword) return "";
        if (!passwordRule.test(newPassword)) {
            return "รหัสต้องยาว ≥ 8 และมี a-z, A-Z, 0-9";
        }
        return "รหัสผ่านแข็งแรง ✓";
    }, [newPassword]);

    /* utility: รีเซ็ตฟอร์ม */
    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    };

    /* submit form -> เปิด Confirm */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setConfirmOpen(true);
    };

    /* ยืนยันใน Confirm → ตรวจ canSubmit → ยิง API */
    const proceedChangePassword = async () => {
        setConfirmOpen(false);

        if (!canSubmit) {
            const messageText = "ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง";
            setMessage({ type: "error", text: messageText });
            setResultStatus("error");
            setResultText(messageText);
            setResultOpen(true);
            return;
        }

        try {
            setSubmitting(true);
            await apiClient.post(`${apiPrefix}/users/account/change-password/me`, {
                currentPassword,
                newPassword,
                confirmNewPassword,
            });

            const messageText = "เปลี่ยนรหัสผ่านสำเร็จ";
            setMessage({ type: "success", text: messageText });
            setResultStatus("success");
            setResultText(messageText);
            setResultOpen(true);
            resetForm();
        } catch (err: any) {
            const statusCode = err?.response?.status;
            const apiMessage =
                statusCode === 401
                    ? "กรุณาเข้าสู่ระบบอีกครั้ง"
                    : err?.response?.data?.message || err?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่";
            setMessage({ type: "error", text: apiMessage });
            setResultStatus("error");
            setResultText(apiMessage);
            setResultOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirm = () => {
        void proceedChangePassword();
    };

    /* =============================== Render =============================== */
    return (
        <main className="min-h-screen bg-white px-8 py-8 rounded-xl">
            <div className="">
                <h2 className="text-2xl font-normal text-gray-800 mb-6">เปลี่ยนรหัสผ่าน</h2>

                {/* แถบข้อความสั้นด้านบน */}
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

                {/* ฟอร์มหลัก */}
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
                            <button
                                type="button"
                                aria-label={showCurrent ? "ซ่อนรหัสผ่านปัจจุบัน" : "แสดงรหัสผ่านปัจจุบัน"}
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowCurrent((prev) => !prev)}
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
                                onClick={() => setShowNew((prev) => !prev)}
                            >
                                <Icon icon={showNew ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
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
                                onClick={() => setShowConfirm((prev) => !prev)}
                            >
                                <Icon icon={showConfirm ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                        {confirmNewPassword && newPassword !== confirmNewPassword && (
                            <p className="mt-1 text-xs text-red-600">รหัสผ่านใหม่และการยืนยันไม่ตรงกัน</p>
                        )}
                    </div>

                    {/* ปุ่มควบคุม */}
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

            {/* Confirm Modal (ใช้คอมโพเนนต์เดิม, ไม่เปลี่ยน logic) */}
            <ConfirmModal
                open={confirmOpen}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
                title="ยืนยันการเปลี่ยนรหัสผ่าน"
                text="คุณต้องการยืนยันการเปลี่ยนรหัสผ่านหรือไม่"
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
            />

            {/* ผลลัพธ์ */}
            <ResultModal
                open={resultOpen}
                status={resultStatus}
                message={resultText}
                onClose={() => setResultOpen(false)}
            />
        </main>
    );
}
