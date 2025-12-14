/*
 * File: ChangePasswordPage.tsx (Tourist)
 * Component: ChangePasswordPage
 * หน้าที่: ฟอร์มเปลี่ยนรหัสผ่านสำหรับนักท่องเที่ยว
 */

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import Button from "@/Components/Button";
import { Modal as ConfirmModal } from "@/Components/Modal/Modal";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = apiUrl.replace("/api", "") || "http://localhost:3000";
const apiPrefix = apiUrl;

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

/*
* คําอธิบาย : ฟังก์ชันสำหรับแสดง Modal แจ้งเตือนผลลัพธ์การทำงาน (สำเร็จ หรือ ล้มเหลว)
* Input : open (สถานะเปิด/ปิด), status (ประเภทผลลัพธ์ success/error), message (ข้อความ), onClose (ฟังก์ชันปิด modal)
* Output : JSX Element ของ Modal Result
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
    const iconName = status === "success" ? "circum:circle-check" : "circum:circle-alert";
    const titleText = status === "success" ? "สำเร็จ" : "ไม่สำเร็จ";

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
                <div className={`flex items-center gap-2 px-6 py-4 ${headerClass}`}>
                    <Icon icon={iconName} className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">{titleText}</h3>
                </div>
                <div className="px-6 py-6 text-gray-700 text-base">{message}</div>
                <div className="px-6 pb-6 flex justify-end">
                    <div className="w-24">
                        <Button type="confirm-admin" htmlType="button" onClick={onClose}>
                            ตกลง
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/*
* คําอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้าจอเปลี่ยนรหัสผ่านของนักท่องเที่ยว
* Input : -
* Output : JSX Element หน้าจอเปลี่ยนรหัสผ่าน
*/
export default function TouristChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState<"success" | "error">("success");
    const [resultText, setResultText] = useState<string>("");

    const canSubmit = useMemo(() => {
        if (!currentPassword || !newPassword || !confirmNewPassword) return false;
        if (newPassword !== confirmNewPassword) return false;
        if (!passwordRule.test(newPassword)) return false;
        return true;
    }, [currentPassword, newPassword, confirmNewPassword]);

    const strengthHint = useMemo(() => {
        if (!newPassword) return "";
        if (!passwordRule.test(newPassword)) return "รหัสต้องยาว ≥ 8 และมี a-z, A-Z, 0-9";
        return "รหัสผ่านปลอดภัย";
    }, [newPassword]);

    /*
    * คําอธิบาย : ฟังก์ชันสำหรับล้างค่าใน Input ทั้งหมดให้เป็นค่าว่าง
    * Input : -
    * Output : -
    */
    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    };

    /*
    * คําอธิบาย : ฟังก์ชันสำหรับตรวจสอบการ Submit Form และเปิด Modal ยืนยัน
    * Input : event (Form Event)
    * Output : -
    */
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (submitting) return;
        setConfirmOpen(true);
    };

    /*
    * คําอธิบาย : ฟังก์ชันสำหรับเรียก API เพื่อเปลี่ยนรหัสผ่านเมื่อผู้ใช้กดยืนยัน
    * Input : - (ใช้ข้อมูลจาก State: currentPassword, newPassword)
    * Output : - (Update State ผลลัพธ์การทำงาน)
    */
    const proceedChangePassword = async () => {
        setConfirmOpen(false);

        if (!canSubmit) {
            const validationErrorMessage = "ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง";
            setMessage({ type: "error", text: validationErrorMessage });
            setResultStatus("error");
            setResultText(validationErrorMessage);
            setResultOpen(true);
            return;
        }

        try {
            setSubmitting(true);
            await apiClient.patch(`${apiPrefix}/tourist/change-password`, {
                currentPassword,
                newPassword,
                confirmNewPassword
            });

            const successMessage = "เปลี่ยนรหัสผ่านสำเร็จ";
            setMessage({ type: "success", text: successMessage });
            setResultStatus("success");
            setResultText(successMessage);
            setResultOpen(true);
            resetForm();
        } catch (error: any) {
            const statusCode = error?.response?.status;
            const apiMessage =
                statusCode === 401
                    ? "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่"
                    : error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";

            setMessage({ type: "error", text: apiMessage });
            setResultStatus("error");
            setResultText(apiMessage);
            setResultOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar อยู่นอก Container หลัก */}
            <NavbarTourist />

            {/* ส่วนเนื้อหาหลัก: ใช้ flex-grow ที่ main โดยตรง เพื่อให้พื้นหลังสีขาวขยายเต็มพื้นที่ความสูงที่เหลือ */}
            <main className="flex-grow w-full bg-white px-8 py-8">
                <div className="ml-[200px]">
                    <Breadcrumb
                        current={{
                            label: "เปลี่ยนรหัสผ่าน",
                            to: `/tourist/change-password`,
                        }}
                    />
                    <div className="flex items-center mb-4  pb-4 border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h1>
                    </div>

                    <div className="pl-0">
                        {message && (
                            <div
                                className={`mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${message.type === "success"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                            >
                                <Icon
                                    icon={message.type === "success" ? "mdi:check-circle" : "mdi:alert-circle"}
                                    className="w-5 h-5"
                                />
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                            <div className="w-[246px]">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รหัสผ่าน
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                        placeholder="กรอกรหัสผ่านปัจจุบัน"
                                        className="w-full border border-[#898989] rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        <Icon icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="w-[246px]">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    รหัสผ่านใหม่
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        placeholder="กรอกรหัสผ่านใหม่"
                                        className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 transition-all outline-none ${newPassword && !passwordRule.test(newPassword)
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-[#898989] focus:ring-emerald-500 focus:border-emerald-500"
                                            }`}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <Icon icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className={`mt-2 text-xs flex items-center gap-1 ${!newPassword ? "text-gray-400" :
                                    passwordRule.test(newPassword) ? "text-emerald-600" : "text-red-500"
                                    }`}>
                                    {strengthHint && <Icon icon={passwordRule.test(newPassword) ? "mdi:check" : "mdi:alert-circle-outline"} />}
                                    {strengthHint}
                                </div>
                            </div>

                            <div className="w-[246px]">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ยืนยันรหัสผ่านใหม่
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmNewPassword ? "text" : "password"}
                                        value={confirmNewPassword}
                                        onChange={(event) => setConfirmNewPassword(event.target.value)}
                                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                        className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 transition-all outline-none ${confirmNewPassword && newPassword !== confirmNewPassword
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-[#898989] focus:ring-emerald-500 focus:border-emerald-500"
                                            }`}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                    >
                                        <Icon icon={showConfirmNewPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                                    </button>
                                </div>
                                {confirmNewPassword && newPassword !== confirmNewPassword && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <Icon icon="mdi:close-circle-outline" /> รหัสผ่านใหม่และการยืนยันไม่ตรงกัน
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 w-[246px]">
                                <div className="w-32">
                                    <Button
                                        type="cancel"
                                        htmlType="button"
                                        onClick={() => {
                                            if (submitting) return;
                                            resetForm();
                                            setMessage(null);
                                        }}
                                    >
                                        ยกเลิก
                                    </Button>
                                </div>
                                <div className="w-32">
                                    {/* เปลี่ยนมาใช้ tag button ธรรมดาเพื่อใส่สีเอง */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`
                                                    flex items-center justify-center w-full px-3 py-2 
                                                    border rounded-form text-base text-white
                                                    bg-[#00BF6A] border-[#00BF6A] 
                                                    hover:bg-[#009e55] transition-colors
                                                    ${submitting ? "opacity-70 cursor-not-allowed" : ""}
                                                `}
                                                >
                                        {submitting ? "กำลังบันทึก..." : "ยืนยัน"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <ConfirmModal
                open={confirmOpen}
                onConfirm={() => void proceedChangePassword()}
                onCancel={() => setConfirmOpen(false)}
                title="ยืนยันการเปลี่ยนรหัสผ่าน"
                text="คุณต้องการยืนยันการเปลี่ยนรหัสผ่านใช่หรือไม่?"
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
            />

            <ResultModal
                open={resultOpen}
                status={resultStatus}
                message={resultText}
                onClose={() => setResultOpen(false)}
            />

            {/* Footer อยู่นอก Container หลัก และอยู่ล่างสุด */}
            <Footer />
        </div>
    );
}