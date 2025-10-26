/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของข้อมูลที่พัก (Homestay)
 * ใช้สำหรับดึงข้อมูลที่พักทั้งหมดในชุมชน (เฉพาะ SuperAdmin)
 *
 * Base URL: ${VITE_API_URL}/super/community/:communityId/homestays/all
 */

import axios from "axios";

// axios instance (แนบ cookie อัตโนมัติ)
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

/*
 * ฟังก์ชัน : getHomestaysAll
 * อธิบาย : ดึงข้อมูลที่พัก (homestay) ทั้งหมดในชุมชน (เฉพาะ superadmin)
 * Input :
 *   - communityId : รหัสชุมชน
 *   - page : หน้าที่ต้องการ (เริ่มต้น 1)
 *   - limit : จำนวนข้อมูลต่อหน้า (เริ่มต้น 10)
 * Output :
 *   - รายการ homestay ทั้งหมด + pagination metadata
 * Mapping : GET /super/community/:communityId/homestays/all
 */

export async function getHomestaysAll(
  communityId: number,
  page = 1,
  limit = 10
) {
 return api.get(`/super/community/${communityId}/homestays/all`, {
   params: { page, limit },
 });
}
  /*
 * ฟังก์ชัน : deleteHomestay
 * อธิบาย : ลบข้อมูลที่พัก (Soft Delete)
 * Input : id - รหัสโฮมสเตย์
 * Output : Response จาก API
 * Mapping : PATCH /homestaydata/:id
 */

export async function deleteHomestay(id: number) {
  return api.patch(`/homestaydata/${id}`);
}

/*
 * ฟังก์ชัน : getHomestaysAllAdmin
 * อธิบาย : ดึงข้อมูลที่พัก (homestay) ทั้งหมดในชุมชน (เฉพาะ Admin)
 * Input :
 *   - communityId : รหัสชุมชน
 *   - page : หน้าที่ต้องการ (เริ่มต้น 1)
 *   - limit : จำนวนข้อมูลต่อหน้า (เริ่มต้น 10)
 * Output :
 *   - รายการ homestay ทั้งหมด + pagination metadata
 * Mapping : GET /admin/community/:communityId/homestays/all
 */

export async function getHomestaysAllAdmin(
  communityId: number,
  page = 1,
  limit = 10
) {
  return api.get(`/admin/community/${communityId}/homestays/all`, {
    params: { page, limit },
  });
}

 /**
 * ฟังก์ชัน : deleteHomestayAdmin
 * คำอธิบาย : เรียก API เพื่อ soft delete โฮมสเตย์ (Admin)
 * Input:
 * - id : number  (รหัสโฮมสเตย์ที่ต้องการลบ)
 * Output:
 * - Promise ของ response จาก API
 * Mapping:
 * - PATCH /admin/homestays/:id
 * - สิทธิ์ : admin เท่านั้น
 */

export async function deleteHomestayAdmin(id: number) {
  return api.patch(`/admin/homestays/${id}`);
}