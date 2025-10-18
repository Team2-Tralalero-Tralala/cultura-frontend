/* 
 * File: ChangePasswordPage.tsx
 * Component: ChangePasswordPage (Client)
 * คำอธิบาย (ตามมาตรฐาน CS v1.1.1):
 *   - หน้าเปลี่ยนรหัสผ่าน (ผู้ใช้ต้องกรอกรหัสปัจจุบัน, รหัสใหม่, และยืนยันรหัสใหม่)
 *   - มีปุ่ม "แสดง/ซ่อนรหัสผ่าน" และ validate ข้อมูลเบื้องต้น
 * Input: none (ใช้ state ภายใน)
 * Output: ฟอร์มเปลี่ยนรหัส + ปุ่มยืนยัน/ยกเลิก
 */

"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

export default function ChangePasswordPage() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword)
            return alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        if (newPassword !== confirmPassword)
            return alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
        if (newPassword.length < 6)
            return alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");

        // TODO: เรียก API เปลี่ยนรหัสผ่าน
        alert("เปลี่ยนรหัสผ่านสำเร็จ!");
    };

    return (
        <main className="min-h-screen bg-gray-50 px-10 py-10">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">เปลี่ยนรหัสผ่าน</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่าน
                        </label>
                        <div className="relative">
                            <input
                                type={showOld ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านปัจจุบัน"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowOld((p) => !p)}
                            >
                                <Icon icon={showOld ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            รหัสผ่านใหม่
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านใหม่"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowNew((p) => !p)}
                            >
                                <Icon icon={showNew ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ยืนยันรหัสผ่าน
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowConfirm((p) => !p)}
                            >
                                <Icon icon={showConfirm ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            className="px-6 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800"
                        >
                            ยืนยัน
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
