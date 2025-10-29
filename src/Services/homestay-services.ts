/**
 * คำอธิบาย : Service สำหรับจัดการข้อมูลที่พัก (Homestay)
 * ใช้สำหรับเชื่อมต่อ API ฝั่ง SuperAdmin และ Admin
 * เช่น ดึงรายละเอียดที่พักทั้งหมด หรือข้อมูลที่พักรายรายการ
 * ใช้ในฝั่ง Client (Frontend)
 */

import axios from "axios";

// สร้าง instance ของ axios พร้อม baseURL จาก ENV
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * ฟังก์ชัน: fetchHomestayDetail
 * วัตถุประสงค์: ดึงข้อมูลรายละเอียดของที่พัก (homestay) ตามรหัส
 * Mapping: GET /super/homestays/:homestayId
 * Input: homestayId (number) – หมายเลขของที่พัก
 * Output: ข้อมูลที่พักและความสัมพันธ์ทั้งหมด
 */
export async function fetchHomestayDetail(homestayId: number) {
  const res = await api.get(`/super/homestays/${homestayId}`);
  return res.data?.data;
}

/**
 * ฟังก์ชัน: getHomestaysAllAdmin
 * วัตถุประสงค์: ดึงข้อมูลรายการที่พักทั้งหมดของผู้ดูแลชุมชน (Admin)
 * Mapping: GET /admin/community/homestays/all
 * Input: ไม่มี
 * Output: รายการข้อมูลที่พักทั้งหมด
 */
export async function getHomestaysAllAdmin() {
  const res = await api.get(`/admin/community/homestays/all`);
  return res.data?.data;
}