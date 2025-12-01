/*
 * คำอธิบาย : Service สำหรับ "ลบสมาชิก" ผ่าน Backend API
 */

import axios from "axios";

const apiUrl =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

/**
 * ฟังก์ชัน : deleteCommunityMember
 * คำอธิบาย : ลบ (soft delete) สมาชิกในชุมชน โดยอ้างอิง userId
 * Input : memberId: number - รหัสสมาชิกที่ต้องการลบ
 * Output: Promise<AxiosResponse> (ผลลัพธ์จาก backend)
 */
export async function deleteCommunityMember(memberId: number) {
  const res = await axios.patch(
  `${apiUrl}/admin/member/${memberId}`,
  {},
  { withCredentials: true }
);

  return res.data;
}
