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

/**
 * ฟังก์ชัน: fetchHomestayDetailByAdmin()
 * Input : homestayId (หมายเลขที่พัก)
 * Output: homestay + ความสัมพันธ์ (community, location, image, tag)
 */
export async function fetchHomestayDetailByAdmin(homestayId: number) {
  const res = await api.get(`/admin/community/homestay/${homestayId}`);
  return res.data?.data;
}
