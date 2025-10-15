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
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างข้อมูลวิสาหกิจชุมชนใหม่
 * Input : data (CommunityFormData) - ข้อมูลฟอร์มจากหน้า Create Community
 * Output : Response จาก API หลังสร้างข้อมูลสำเร็จ
 */
export async function createCommunity(data: CommunityFormData) {
  return await axios.post(`${apiUrl}/super/community`, data, {
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
 * Input : id (number) - รหัสของวิสาหกิจชุมชน
 *         data (any) - ข้อมูลที่ต้องการอัปเดต
 * Output : Response จาก API หลังอัปเดตข้อมูลสำเร็จ
 */
export async function updateCommunity(id: number, data: CommunityFormData) {
  return (
    await axios.put(`${apiUrl}/super/community/${id}`, data),
    {
      withCredentials: true,
    }
  );
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบ (Soft Delete) วิสาหกิจชุมชน
 * โดยใช้ PATCH เพื่อเปลี่ยนสถานะ isDeleted แทนการลบถาวร
 * Input : id (number) - รหัสของวิสาหกิจชุมชนที่ต้องการลบ
 * Output : Response จาก API หลังการลบสำเร็จ
 */
export async function deleteCommunity(id: number) {
  return await axios.patch(`${apiUrl}/super/community/${id}`, {
    withCredentials: true,
  });
}

export async function getUnassignedAdmins() {
  return await axios.get(`${apiUrl}/super/admins/unassigned`, {
    withCredentials: true,
  });
}

export async function getUnassignedMembers() {
  return await axios.get(`${apiUrl}/super/members/unassigned`, {
    withCredentials: true,
  });
}
