/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของข้อมูลวิสาหกิจชุมชน (Community)
 * ใช้สำหรับจัดการข้อมูลของวิสาหกิจชุมชน เช่น การสร้าง แก้ไข ลบ และดึงข้อมูลตามรหัส
 * โดยเชื่อมต่อผ่าน REST API จากฝั่ง Backend (SuperAdmin)
 *
 * Base URL: ${VITE_API_URL}/super/community
 */
import type { CommunityFormData } from "@/Types/CommunityForm";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลวิสาหกิจชุมชนใหม่ผ่าน API
 * โดยส่งข้อมูลฟอร์ม (CommunityFormData หรือ FormData) ไปยัง Backend ผ่าน Axios
 * Input :
 *   - data (CommunityFormData | FormData) : ข้อมูลฟอร์มที่ต้องการสร้าง
 * Output :
 *   - Promise<Response> : คำตอบจาก API หลังจากสร้างข้อมูลสำเร็จหรือเกิดข้อผิดพลาด
 * หมายเหตุ :
 *   - ใช้ header "multipart/form-data" เพื่อรองรับการอัปโหลดไฟล์ (เช่น รูปภาพหรือวิดีโอ)
 *   - เปิดใช้ withCredentials:true เพื่อส่ง cookie/token สำหรับการยืนยันตัวตนร่วมด้วย
 */
export async function createCommunity(data: CommunityFormData | FormData) {
  return await axios.post(`${apiUrl}/super/community`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลวิสาหกิจชุมชนตามรหัส (ID)
 * Input : id (number) - รหัสของวิสาหกิจชุมชนที่ต้องการค้นหา
 * Output : Response ที่ประกอบด้วยข้อมูลของวิสาหกิจชุมชน
 */
export async function getCommunityById(id: number) {
  return await axios.get(`${apiUrl}/super/community/${id}`, {
    withCredentials: true,
  });
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับอัปเดตข้อมูลวิสาหกิจชุมชน
 * Input :
 *   - id (number) : รหัสของวิสาหกิจชุมชนที่ต้องการอัปเดต
 *   - data (CommunityFormData | FormData) : ข้อมูลที่ต้องการอัปเดต
 * Output :
 *   - Promise<Response> : คำตอบจาก API หลังอัปเดตข้อมูลสำเร็จ
 * หมายเหตุ :
 *   - ใช้ header "multipart/form-data" เพื่อรองรับการอัปโหลดไฟล์ใหม่หรือไฟล์ที่แก้ไข
 */
export async function updateCommunity(id: number, data: CommunityFormData | FormData) {
  return await axios.put(`${apiUrl}/super/community/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบ (Soft Delete) วิสาหกิจชุมชน
 * โดยจะเปลี่ยนสถานะ isDeleted แทนการลบข้อมูลถาวร
 * Input :
 *   - id (number) : รหัสของวิสาหกิจชุมชนที่ต้องการลบ
 * Output :
 *   - Promise<Response> : คำตอบจาก API หลังการลบสำเร็จ
 */
export async function deleteCommunity(communityId: number) {
  return await axios.patch(
    `${apiUrl}/super/community/${communityId}`,
    {},
    {
      withCredentials: true,
    }
  );
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายชื่อผู้ดูแล (Admin) ที่ยังไม่ถูกผูกกับชุมชนที่ยังอยู่
 * ใช้เพื่อให้ Super Admin สามารถเลือกผู้ดูแลใหม่สำหรับชุมชนได้
 * Output :
 *   - Promise<Response> : รายชื่อ Admin ที่ยังไม่ถูก assign กับชุมชนใด ๆ
 */
export async function getUnassignedAdmins() {
  return await axios.get(`${apiUrl}/super/admins/unassigned`, {
    withCredentials: true,
  });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายชื่อสมาชิก (Member) ที่ยังไม่ถูกผูกกับชุมชนที่ยังอยู่
 * ใช้ในหน้าแก้ไขหรือสร้างชุมชน เพื่อเพิ่มสมาชิกใหม่เข้าในชุมชน
 * Output :
 *   - Promise<Response> : รายชื่อ Member ที่ยังไม่ถูก assign กับชุมชนใด ๆ
 */
export async function getUnassignedMembers() {
  return await axios.get(`${apiUrl}/super/members/unassigned`, {
    withCredentials: true,
  });
}

// axios instance (แนบ cookie)
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

/**
 * ดึงรายชื่อชุมชนทั้งหมด (Superadmin)
 * Mapping: GET /super/communities
 */
export async function getCommunities(page = 1, limit = 10) {
  return api.get("/super/communities", { params: { page, limit } });
}

/**
 * ดึงรายละเอียดชุมชนตาม ID
 * Mapping: GET /super/community/detail/:communityId
 */
export async function getCommunityDetailById(id: number) {
  return api.get(`/super/community/detail/${id}`);
}

/**
 * ดึงรายละเอียดชุมชนของแอดมินปัจจุบัน
 * Mapping: GET /admin/community
 */
export async function getCommunityDetailByAdmin() {
  return api.get(`/admin/community`);
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลวิสาหกิจชุมชนของผู้ดูแลชุมชน (Admin)
 * Output : Response ที่ประกอบด้วยข้อมูลของวิสาหกิจชุมชน
 */
export async function getCommunityOwn() {
  return await axios.get(`${apiUrl}/admin/community/own`, {
    withCredentials: true,
  });
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับอัปเดตข้อมูลวิสาหกิจชุมชนสำหรับผู้ดูแลชุมชน (Admin)
 * Input :
 *   - data (CommunityFormData | FormData) : ข้อมูลที่ต้องการอัปเดต
 * Output :
 *   - Promise<Response> : คำตอบจาก API หลังอัปเดตข้อมูลสำเร็จ
 * หมายเหตุ :
 *   - ใช้ header "multipart/form-data" เพื่อรองรับการอัปโหลดไฟล์ใหม่หรือไฟล์ที่แก้ไข
 */
export async function updateCommunityOwn(data: CommunityFormData | FormData) {
  return await axios.put(`${apiUrl}/admin/community/own`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}
