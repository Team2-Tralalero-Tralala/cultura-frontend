/*
 * คำอธิบาย : หน้าสำหรับตั้งรหัสผ่านใหม่ (Reset Password Page)
 * ใช้ในกรณีที่ผู้ดูแลระบบ (Super Admin) ต้องการรีเซ็ตรหัสผ่านของผู้ใช้ที่เลือก
 * โดยจะดึง userId จากพารามิเตอร์ของ URL และส่งรหัสผ่านใหม่ไปยัง API ผ่านฟังก์ชัน resetPassword()
 */

import Button from "@/Components/Button";
import TextField from "@/Components/Input/TextField";
import { Modal } from "@/Components/Modal/Modal";
import { ModalAlert } from "@/Components/Modal/ModalAlert";
import { resetPassword } from "@/Libs/UserService";
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import zod from "zod";

const passwordSchema = zod
  .string()
  .min(1, "กรุณากรอกรหัสผ่านใหม่")
  .refine((val) => val === "" || val.length >= 8, {
    message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
  })
  .regex(/[a-zA-Z]|^$/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ")
  .regex(/[a-z]|^$/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z)")
  .regex(/[A-Z]|^$/, "ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z)")
  .regex(/[0-9]|^$/, "ต้องประกอบด้วยตัวเลข (0-9)");

/**
 * คำอธิบาย: Component หน้า ResetPasswordPage สำหรับ Super Admin
 * Input: - (รับ Params userId จาก URL)
 * Output: JSX Element หน้า ResetPasswordPage
 */
export function ResetPasswordPage() {
  const [password, setPassword] = useState<string>("");
  const { userId } = useParams();
  const navigate = useNavigate();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  /**
   * คำอธิบาย : ใช้สำหรับตรวจสอบความถูกต้องของรหัสผ่าน
   * Input : password (string) : รหัสผ่านที่ผู้ใช้กรอก
   * Output : string : ข้อความ error หากรหัสผ่านไม่ถูกต้อง
   */
  const passwordError = useMemo(() => {
    if (!password) return "";
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return "";
  }, [password]);
  /**
   * คำอธิบาย : ใช้สำหรับตรวจสอบว่าสามารถกดปุ่มยืนยันได้หรือไม่
   * Input : password (string) : รหัสผ่านที่ผู้ใช้กรอก
   * Output : boolean : true หากสามารถกดปุ่มยืนยันได้
   */
  const canSubmit = useMemo(() => {
    if (!password) return false;
    if (passwordError) return false;
    return true;
  }, [password, passwordError]);

  /*
   * คำอธิบาย : ใช้สำหรับจัดการเหตุการณ์เมื่อผู้ใช้กดปุ่ม "ยืนยัน" เพื่อรีเซ็ตรหัสผ่านใหม่
   * Input :
   *   - userId (string | undefined) : รหัสผู้ใช้ที่ได้จากพารามิเตอร์ใน URL (useParams)
   *   - password (string) : รหัสผ่านใหม่ที่ผู้ใช้กรอกจาก TextField
   * Output :
   *   - หากรีเซ็ตรหัสผ่านสำเร็จ : แสดง alert("รีเซ็ตรหัสผ่านสำเร็จ")
   *   - หากเกิดข้อผิดพลาด : แสดง alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
   */
  function handleResetPasswordClick() {
    if (!canSubmit) {
      setAlertType("error");
      setAlertTitle("ตรวจสอบข้อมูล");
      setAlertMessage("ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง");
      setIsAlertOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  }
  /**
   * คำอธิบาย : ใช้สำหรับจัดการเหตุการณ์เมื่อผู้ใช้กดปุ่ม "ยืนยัน" เพื่อรีเซ็ตรหัสผ่านใหม่
   * Input :
   *   - userId (string | undefined) : รหัสผู้ใช้ที่ได้จากพารามิเตอร์ใน URL (useParams)
   *   - password (string) : รหัสผ่านใหม่ที่ผู้ใช้กรอกจาก TextField
   * Output :
   *   - หากรีเซ็ตรหัสผ่านสำเร็จ : แสดง alert("รีเซ็ตรหัสผ่านสำเร็จ")
   *   - หากเกิดข้อผิดพลาด : แสดง alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
   */
  async function handleConfirmResetPassword() {
    setIsConfirmModalOpen(false);
    try {
      if (!userId) throw new Error("ไม่พบรหัสผู้ใช้");
      await resetPassword(Number(userId), password);

      setAlertType("success");
      setAlertTitle("สำเร็จ");
      setAlertMessage("รีเซ็ตรหัสผ่านสำเร็จ");
      setIsAlertOpen(true);

      setTimeout(() => {
        setIsAlertOpen(false);
        navigate("/super/accounts/all");
      }, 2000);
    } catch (error) {
      setAlertType("error");
      setAlertTitle("เกิดข้อผิดพลาด");
      setAlertMessage("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
      setIsAlertOpen(true);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">ตั้งรหัสผ่าน</h1>
      <div className="bg-white p-10 rounded-xl h-[100vh]">
        <div className="w-lg">
          <div>
            <TextField
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่านใหม่"
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
            <div className="text-xs text-gray-500 pl-4 pt-2">
              <li>ความยาวอย่างน้อย 8 ตัวอักษร</li>
              <li>ประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z)</li>
              <li>ประกอบด้วยตัวเลข (0-9)</li>
            </div>
          </div>
          <div className="flex mt-5 justify-between gap-2">
            <div className="w-lg">
              <Button type="cancel" onClick={() => navigate(-1)}>
                ยกเลิก
              </Button>
            </div>
            <div className="w-lg">
              <Button type="confirm-admin" onClick={handleResetPasswordClick}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmResetPassword}
        onCancel={() => setIsConfirmModalOpen(false)}
        title="ยืนยันการตั้งรหัสผ่านใหม่"
        text="คุณต้องการตั้งรหัสผ่านใหม่ใช่หรือไม่?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />
      <ModalAlert
        isOpen={isAlertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
}
