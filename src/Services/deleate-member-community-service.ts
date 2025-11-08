/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูลสมาชิกชุมชน (Community Members)
 * ฟังก์ชัน deleteCommunityMember() ใช้สำหรับ "ลบสมาชิก" ผ่าน Backend API
 * หมายเหตุ:
 *  - ใช้ฐาน URL จาก .env: VITE_API_BASE (fallback localhost)
 *  - ใช้ axios และแนบ credentials
 */

import axios from "axios";

/** ค่าฐาน URL ของ API (ควรลงท้ายโดยไม่มี /) */
const apiUrl =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

/**
 * ฟังก์ชัน : deleteCommunityMember
 * คำอธิบาย : ลบ (soft delete) สมาชิกในชุมชน โดยอ้างอิง userId
 * Input : memberId: number - รหัสสมาชิกที่ต้องการลบ
 * Output: Promise<AxiosResponse> (ผลลัพธ์จาก backend)
 */
export async function deleteCommunityMember(memberId: number) {
  const res = await axios.delete(`${apiUrl}/admin/member/${memberId}`, {
    withCredentials: true,
  });
  return res.data;
}
