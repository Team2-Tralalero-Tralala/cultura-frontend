/*
 * คำอธิบาย : หน้าสำหรับตั้งรหัสผ่านใหม่ (Reset Password Page)
 * ใช้ในกรณีที่ผู้ดูแลระบบ (Super Admin) ต้องการรีเซ็ตรหัสผ่านของผู้ใช้ที่เลือก
 * โดยจะดึง userId จากพารามิเตอร์ของ URL และส่งรหัสผ่านใหม่ไปยัง API ผ่านฟังก์ชัน resetPassword()
 * ฟังก์ชันหลัก :
 *   - handleReset() : ตรวจสอบค่ารหัสผู้ใช้และรหัสผ่านใหม่ จากนั้นเรียก API เพื่อรีเซ็ตรหัสผ่าน
 * Input :
 *   - userId (จาก useParams) : รหัสผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน
 *   - password (string) : ค่ารหัสผ่านใหม่จาก TextField
 * Output :
 *   - แสดงข้อความแจ้งเตือนเมื่อรีเซ็ตรหัสผ่านสำเร็จหรือเกิดข้อผิดพลาด
 */

import Button from "@/Components/Button";
import TextField from "@/Components/TextField";
import { resetPassword } from "@/Services/user-service";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export function ResetPassword() {
  const [password, setPassword] = useState<string>("");
  const { userId } = useParams();
  const navigate = useNavigate();
  /*
   * ฟังก์ชัน : handleReset
   * คำอธิบาย : ใช้สำหรับจัดการเหตุการณ์เมื่อผู้ใช้กดปุ่ม "ยืนยัน" เพื่อรีเซ็ตรหัสผ่านใหม่
   * Input :
   *   - userId (string | undefined) : รหัสผู้ใช้ที่ได้จากพารามิเตอร์ใน URL (useParams)
   *   - password (string) : รหัสผ่านใหม่ที่ผู้ใช้กรอกจาก TextField
   * Output :
   *   - หากรีเซ็ตรหัสผ่านสำเร็จ : แสดง alert("รีเซ็ตรหัสผ่านสำเร็จ")
   *   - หากเกิดข้อผิดพลาด : แสดง alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
   */
  async function handleReset() {
    try {
      if (!userId) throw new Error("ไม่พบรหัสผู้ใช้");
      await resetPassword(Number(userId), password);
      alert("รีเซ็ตรหัสผ่านสำเร็จ");
      navigate("/super/accounts/all");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
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
              <Button type="cancel">ยกเลิก</Button>
            </div>
            <div className="w-lg">
              <Button type="confirm-admin" onClick={handleReset}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
