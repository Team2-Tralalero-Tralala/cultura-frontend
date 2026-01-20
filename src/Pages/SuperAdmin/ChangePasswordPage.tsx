/*
 * Component: ChangePasswordPage
 * หน้าที่: หน้าจอเปลี่ยนรหัสผ่านสำหรับผู้ดูแลระบบ/พนักงาน
 */

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Button from "@/Components/Button"; 
import TextField from "@/Components/TextField"; 
import { Modal as ConfirmModal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import Breadcrumb from "@/Components/BreadcrumbNavigation";
import api from "@/Libs/api"; 

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

/*
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้าจอเปลี่ยนรหัสผ่าน
 * Input : -
 * Output : JSX Element หน้าจอเปลี่ยนรหัสผ่าน
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

  /*
   * คำอธิบาย : คำนวณความพร้อมของข้อมูล (Validation)
   * Input : currentPassword, newPassword, confirmNewPassword
   * Output : boolean
   */
  const canSubmit = useMemo(() => {
    if (!currentPassword || !newPassword || !confirmNewPassword) return false;
    if (newPassword !== confirmNewPassword) return false;
    if (!passwordRule.test(newPassword)) return false;
    return true;
  }, [currentPassword, newPassword, confirmNewPassword]);

  /*
   * คำอธิบาย : คำนวณข้อความแนะนำความปลอดภัยของรหัสผ่าน
   * Input : newPassword
   * Output : JSX Element หรือ String
   */
  const strengthHint = useMemo(() => {
    if (!newPassword) return null;
    if (!passwordRule.test(newPassword)) {
      return (
        <div className="mt-1 text-xs text-red-500">
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

  /*
   * คำอธิบาย : ฟังก์ชันสำหรับล้างค่าใน Input ทั้งหมด
   * Input : -
   * Output : -
   */
  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  /*
   * คำอธิบาย : ฟังก์ชันตรวจสอบก่อนส่ง Form และเปิด Modal ยืนยัน
   * Input : event
   * Output : -
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsConfirmOpen(true);
  };

  /*
   * คำอธิบาย : ฟังก์ชันเรียก API เปลี่ยนรหัสผ่าน
   * Input : -
   * Output : -
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
        confirmNewPassword
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
    <>
      <Breadcrumb
        current={{
          label: "เปลี่ยนรหัสผ่าน",
          to: `/account/change-password`,
        }}
      />
      <main className="min-h-screen bg-white px-8 py-8 rounded-xl">
        <div className="flex items-center mb-6">
          <a
            className="flex items-center gap-2 mr-4 text-gray-800 hover:text-dark-green"
            href="/super/communities/all"
          >
            <Icon icon="lucide:arrow-left" className="w-7 h-7" />
            <h1 className="text-[20px] font-bold">เปลี่ยนรหัสผ่าน</h1>
          </a>
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
              {strengthHint}
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
                helperText={!!confirmNewPassword && newPassword !== confirmNewPassword ? "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน" : ""}
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
                <Button
                  type="confirm-admin"
                  htmlType="submit"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
                </Button>
              </div>
            </div>
          </form>
        </div>

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
      </main>
    </>
  );
}