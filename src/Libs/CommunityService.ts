import type { CommunityFormData } from "@/Types/Community";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

/*
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลวิสาหกิจชุมชนใหม่ผ่าน API
 * โดยส่งข้อมูลฟอร์ม (CommunityFormData หรือ FormData) ไปยัง Backend ผ่าน Axios
 * Input :
 *   - data (CommunityFormData | FormData) : ข้อมูลฟอร์มที่ต้องการสร้าง
 * Output :
 *   - Promise<Response> : คำตอบจาก API หลังจากสร้างข้อมูลสำเร็จหรือเกิดข้อผิดพลาด
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
    },
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

/*
 * อธิบาย : ฟังก์ชันดึงรายการชุมชนทั้งหมด (สำหรับ SuperAdmin) พร้อมระบบค้นหาและกรองสถานะ
 * Input : page, limit, search, status
 * Output : Promise ข้อมูลรายการชุมชนและ pagination
 */
export async function getCommunities(
  page = 1,
  limit = 10,
  search = "",   // default ค่าว่าง
  status = "all" // default all
) {
  return api.get("/super/communities", {
    params: { page, limit, search, status }
  });
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
 */
export async function updateCommunityOwn(data: CommunityFormData | FormData) {
  return await axios.put(`${apiUrl}/admin/community/own`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}

/**
 * ดึงรายละเอียดชุมชนของแอดมินปัจจุบัน
 * Mapping: GET /member/community
 */
export async function getCommunityDetailByMember() {
  return api.get(`/member/community`);
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับดึงรายละเอียดชุมชนที่เปิดสาธารณะ (Public)
 *           ใช้สำหรับหน้า Guest และ Tourist
 *           Mapping GET /shared/community/:communityId
 *
 * Input :
 *   - communityId (number) : รหัสของชุมชนที่ต้องการดูรายละเอียด
 *   - params (object) :
 *       - packagePage (number)   : หน้าของแพ็กเกจ
 *       - packageLimit (number)  : จำนวนแพ็กเกจต่อหน้า
 *       - storePage (number)     : หน้าของร้านค้า
 *       - storeLimit (number)    : จำนวนร้านค้าต่อหน้า
 *       - homestayPage (number)  : หน้าของที่พัก
 *       - homestayLimit (number) : จำนวนที่พักต่อหน้า
 *
 * Output :
 *   - Promise<Response> : ข้อมูลรายละเอียดชุมชน พร้อมรายการ package / store / homestay
 */
export async function getCommunityDetailPublic(
  communityId: number,
  params?: {
    packagePage?: number;
    packageLimit?: number;
    storePage?: number;
    storeLimit?: number;
    homestayPage?: number;
    homestayLimit?: number;
  },
) {
  return axios.get(`${apiUrl}/shared/community/${communityId}`, { params });
}
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
    { withCredentials: true },
  );

  return res.data;
}

type MemberQuery = { q?: string; limit?: number };

export async function getCommunityMembers(communityId: number, params?: MemberQuery) {
  const { q = "", limit = 20 } = params ?? {};
  return api.get(`/super/community/${communityId}/members`, { params: { q, limit } });
}
