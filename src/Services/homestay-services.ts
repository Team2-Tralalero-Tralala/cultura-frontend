/**
 * คำอธิบาย : Service สำหรับดึงข้อมูลรายละเอียดที่พัก (Homestay)
 * ใช้เชื่อมต่อกับ API: GET /super/homestay/:homestayId
 */

import axios from "axios";

// ตั้งค่า baseURL จาก ENV
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * ฟังก์ชัน: fetchHomestayDetail()
 * Input : homestayId (หมายเลขที่พัก)
 * Output: homestay + relations
 */
export async function fetchHomestayDetail(homestayId: number) {
  const res = await api.get(`/super/homestays/${homestayId}`);
  return res.data?.data;
}



/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึงข้อมูลที่พัก (homestay) ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Mapping : GET /super/community/:communityId/homestays
 */
// export async function getHomestaysAll(communityId: number) {
//   return api.get(`/super/community/${communityId}/homestays`);
// }

export async function getHomestaysAll(
  communityId: number,
  page = 1,
  limit = 10
) {
  return api.get(`/super/community/${communityId}/homestays`, {
    params: { page, limit },   // ส่ง page/limit แบบเดียวกับ getCommunities
  });
}
