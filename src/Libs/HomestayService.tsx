/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของข้อมูลที่พัก (Homestay)
 * ใช้สำหรับดึงข้อมูลที่พักทั้งหมดในชุมชน (เฉพาะ SuperAdmin)
 *
 * Base URL: ${VITE_API_URL}/super/homestays/:communityId
 */

import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// axios instance (แนบ cookie อัตโนมัติ)
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึงข้อมูลที่พัก (homestay) ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Mapping : GET /super/community/:communityId/homestays
 */
export async function getHomestaysAll(communityId: number) {
  return api.get(`/super/community/${communityId}/homestays`);
  
}
