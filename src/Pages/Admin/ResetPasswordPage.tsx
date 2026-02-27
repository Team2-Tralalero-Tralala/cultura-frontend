/**
 * คำอธิบาย : หน้าสำหรับตั้งรหัสผ่านใหม่ (Reset Password Page)
 * ใช้ในกรณีที่ผู้ดูแลชุมชน (Admin) ต้องการรีเซ็ตรหัสผ่านของผู้ใช้ที่เลือก
 * โดยจะดึง userId จากพารามิเตอร์ของ URL และส่งรหัสผ่านใหม่ไปยัง API
 */

import Button from "@/Components/Button";
import TextField from "@/Components/Input/TextField";
import api from "@/Libs/Api";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * คำอธิบาย: Component หน้า ResetPasswordPage สำหรับ Admin
 * Input: - (รับ Params userId จาก URL)
 * Output: JSX Element หน้า ResetPasswordPage
 */
export function ResetPasswordPage() {
  const [password, setPassword] = useState<string>("");
  const { userId } = useParams();
  const navigate = useNavigate();

  /**
   * คำอธิบาย : ใช้สำหรับจัดการเหตุการณ์เมื่อผู้ใช้กดปุ่ม "ยืนยัน" เพื่อรีเซ็ตรหัสผ่านใหม่
   * Input :
   * - userId (string | undefined) : รหัสผู้ใช้ที่ได้จากพารามิเตอร์ใน URL (useParams)
   * - password (string) : รหัสผ่านใหม่ที่ผู้ใช้กรอกจาก TextField
   * Output :
   * - หากรีเซ็ตรหัสผ่านสำเร็จ : แสดงแจ้งเตือนสำเร็จและกลับไปหน้าจัดการสมาชิก
   * - หากเกิดข้อผิดพลาด : แสดงแจ้งเตือนข้อผิดพลาด
   */
  async function handleResetPassword() {
    try {
      if (!userId) throw new Error("ไม่พบรหัสผู้ใช้");
      
      await api.patch(`/admin/member/${userId}/reset-password`, {
        newPassword: password, 
      });

      toast.success("รีเซ็ตรหัสผ่านสำเร็จ");
      navigate("/admin/members");
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน";
      toast.error(errorMsg);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">ตั้งรหัสผ่าน</h1>
      <div className="bg-white p-10 rounded-xl h-[100vh]">
        <div className="w-lg">
          <TextField
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่านใหม่"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex mt-5 justify-between gap-2">
            <div className="w-lg">
              <Button type="cancel" onClick={() => navigate(-1)}>
                ยกเลิก
              </Button>
            </div>
            <div className="w-lg">
              <Button type="confirm-admin" onClick={handleResetPassword}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}