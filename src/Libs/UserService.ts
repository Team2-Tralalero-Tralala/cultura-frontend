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

/*
 * ฟังก์ชัน : getCommunityMembersByAdmin
 * คำอธิบาย :
 *   ดึงรายชื่อสมาชิกทั้งหมดในชุมชนที่แอดมินดูแล
 *
 * Input :
 *   - page  (number) : หน้าปัจจุบัน
 *   - limit (number) : จำนวนข้อมูลต่อหน้า
 *
 * Output :
 *   - ส่งคำขอ GET ไปยัง API `/admin/community/member/all`
 *   - คืนค่า Promise ของ axios response (รายการสมาชิก + pagination)
 */
export async function getCommunityMembersByAdmin(
  page: number = 1,
  limit: number = 10
) {
  return await axios.get(`${apiUrl}/admin/member/all`, {
    params: { page, limit },
    withCredentials: true,
  });
}

/*
 * ฟังก์ชัน : softDeleteCommunityMemberByAdmin
 * คำอธิบาย :
 *   ลบสมาชิกออกจากชุมชนแบบ Soft Delete
 *   (ลบเฉพาะความสัมพันธ์ใน community_members ไม่ลบบัญชีผู้ใช้)
 *
 * Input :
 *   - memberId (number) : user id ของสมาชิกที่ต้องการลบออกจากชุมชน
 *
 * Output :
 *   - ส่งคำขอ PATCH ไปยัง API `/admin/community/member/:memberId`
 *   - คืนค่า Promise ของ axios response
 */
export async function softDeleteCommunityMemberByAdmin(memberId: number) {
  return await axios.patch(
    `${apiUrl}/admin/member/${memberId}`,
    {},
    { withCredentials: true }
  );
}
