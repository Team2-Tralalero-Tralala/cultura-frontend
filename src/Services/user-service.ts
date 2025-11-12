/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของผู้ใช้
 * Base URL: ${VITE_API_URL}/super/community
 */
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
/*
 * คำอธิบาย : ฟังก์ชันสำหรับรีเซ็ตรหัสผ่านของผู้ใช้ (Reset Password)
 * ใช้สำหรับให้ผู้ดูแลระบบ (Super Admin) เปลี่ยนรหัสผ่านของผู้ใช้ตาม userId ที่กำหนด
 * Input :
 *   - userId (number) : รหัสประจำตัวผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน
 *   - newPassword (string) : รหัสผ่านใหม่ที่ต้องการตั้งให้กับผู้ใช้
 * Output :
 *   - ส่งคำขอ PATCH ไปยัง API `/super/account/:userId/reset-password`
 *   - คืนค่า Promise ของการเรียก axios (response จาก backend)
 */
export async function resetPassword(userId: number, newPassword: string) {
  return await axios.patch(
    `${apiUrl}/super/account/${userId}/reset-password`,
    { newPassword },
    { withCredentials: true }
  );
}
