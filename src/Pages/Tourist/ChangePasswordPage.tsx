/**
 * คำอธิบาย: ฟอร์มเปลี่ยนรหัสผ่านสำหรับนักท่องเที่ยว
 */

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import { Modal as ConfirmModal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import Footer from "@/Components/Footer";
import NavbarTourist from "@/Components/NavbarTourist";
import api from "@/Libs/Api";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

/**
 * คำอธิบาย: ฟังก์ชัน Component หลักสำหรับหน้าจอเปลี่ยนรหัสผ่านของนักท่องเที่ยว
 * Input: -
 * Output: JSX Element หน้าจอเปลี่ยนรหัสผ่าน
 */
export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  /**
   * คำอธิบาย: คำนวณสถานะความพร้อมของการส่งข้อมูล (Validation เบื้องต้น)
   * Input: - (ใช้ currentPassword, newPassword, confirmNewPassword)
   * Output: boolean (true หากข้อมูลครบและถูกต้อง, false หากไม่พร้อม)
   */
  const canSubmit = useMemo(() => {
    if (!currentPassword || !newPassword || !confirmNewPassword) return false;
    if (newPassword !== confirmNewPassword) return false;
    if (!passwordRule.test(newPassword)) return false;
    return true;
  }, [currentPassword, newPassword, confirmNewPassword]);

  /**
   * คำอธิบาย: คำนวณข้อความแนะนำความปลอดภัยของรหัสผ่าน
   * Input: - (ใช้ newPassword)
   * Output: JSX Element (รายการข้อกำหนด) หรือ String หรือ null
   */
  const strengthHint = useMemo(() => {
    if (!newPassword) return null;
    if (!passwordRule.test(newPassword)) {
      return (
        <div className="mt-1 text-xs">
          <p className="mb-1">รหัสผ่านต้องประกอบด้วย:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>ความยาว 8 ตัวอักษรขึ้นไป</li>
            <li>ตัวอักษรพิมพ์ใหญ่ (A-Z)</li>
            <li>ตัวอักษรพิมพ์เล็ก (a-z)</li>
            <li>ตัวเลข (0-9)</li>
          </ul>
        </div>
      );
    }
    return (
      <div className="mt-1 text-xs text-emerald-600">
        <Icon icon="mdi:check" className="inline mr-1" />
        รหัสผ่านปลอดภัย
      </div>
    );
  }, [newPassword]);

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับล้างค่าใน Input ทั้งหมดให้เป็นค่าว่าง
   * Input: -
   * Output: -
   */
  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับตรวจสอบการ Submit Form และเปิด Modal ยืนยัน
   * Input: event (Form Event)
   * Output: -
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsConfirmOpen(true);
  };

  /**
   * คำอธิบาย: ฟังก์ชันสำหรับเรียก API เพื่อเปลี่ยนรหัสผ่านเมื่อผู้ใช้กดยืนยัน
   * Input: - (ใช้ข้อมูลจาก State: currentPassword, newPassword)
   * Output: - (Update State ผลลัพธ์การทำงาน)
   */
  const proceedChangePassword = async () => {
    setIsConfirmOpen(false);

    if (!canSubmit) {
      const validationErrorMessage = "ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง";
      setMessage({ type: "error", text: validationErrorMessage });

      setAlertType("warning");
      setAlertTitle("ตรวจสอบข้อมูล");
      setAlertMessage(validationErrorMessage);
      setIsAlertOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/shared/account/change-password/me`, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      const successMessage = "เปลี่ยนรหัสผ่านสำเร็จ";
      setMessage({ type: "success", text: successMessage });

      setAlertType("success");
      setAlertTitle("ดำเนินการสำเร็จ");
      setAlertMessage(successMessage);
      setIsAlertOpen(true);

      resetForm();
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const apiMessage =
        statusCode === 401
          ? "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่"
          : error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";

      setMessage({ type: "error", text: apiMessage });

      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage(apiMessage);
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavbarTourist />
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
                className={`mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
                  message.type === "success"
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
                <TextField
                  id="current-password"
                  type="password"
                  label="รหัสผ่าน"
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>

              <div className="w-[246px]">
                <TextField
                  id="new-password"
                  type="password"
                  label="รหัสผ่านใหม่"
                  placeholder="กรอกรหัสผ่านใหม่"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  error={!!newPassword && !passwordRule.test(newPassword)}
                />
                <div
                  className={`text-xs ${!newPassword ? "text-gray-400" : passwordRule.test(newPassword) ? "text-emerald-600" : "text-red-500"}`}
                >
                  {strengthHint}
                </div>
              </div>

              <div className="w-[246px]">
                <TextField
                  id="confirm-password"
                  type="password"
                  label="ยืนยันรหัสผ่านใหม่"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  required
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  error={!!confirmNewPassword && newPassword !== confirmNewPassword}
                  helperText={
                    !!confirmNewPassword && newPassword !== confirmNewPassword
                      ? "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"
                      : ""
                  }
                />
              </div>

              <div className="flex gap-4 pt-4 w-[246px]">
                <div className="w-32">
                  <Button
                    type="cancel"
                    htmlType="button"
                    onClick={() => {
                      if (isSubmitting) return;
                      resetForm();
                      setMessage(null);
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
                <div className="w-32">
                  <Button type="confirm-tourist" htmlType="submit">
                    {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <ConfirmModal
        open={isConfirmOpen}
        onConfirm={() => void proceedChangePassword()}
        onCancel={() => setIsConfirmOpen(false)}
        title="ยืนยันการเปลี่ยนรหัสผ่าน"
        text="คุณต้องการยืนยันการเปลี่ยนรหัสผ่านใช่หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />

      <ModalAlert
        open={isAlertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />
      <Footer />
    </div>
  );
}
