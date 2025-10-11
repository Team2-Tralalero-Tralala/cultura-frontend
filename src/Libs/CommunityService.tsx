/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของข้อมูลวิสาหกิจชุมชน (Community)
 * ใช้สำหรับจัดการข้อมูลของวิสาหกิจชุมชน เช่น การสร้าง แก้ไข ลบ และดึงข้อมูลตามรหัส
 * โดยเชื่อมต่อผ่าน REST API จากฝั่ง Backend (SuperAdmin)
 *
 * Base URL: ${VITE_API_URL}/super/community
 */
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type CommunityFormData = {
  adminId: number;
  name: string;
  alias?: string;
  type: string;
  registerNumber: string;
  registerDate: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  description: string;
  mainActivityName: string;
  mainActivityDescription: string;
  houseNumber: string;
  villageNumber: number;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  locationDetail: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  urlWebsite: string;
  urlFacebook: string;
  urlLine: string;
  urlTiktok: string;
  urlOther: string;
  mainAdmin: string;
  mainAdminPhone: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  member: string[];
};
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
  return await axios.get(`${apiUrl}/super/community/${id}`);
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับอัปเดตข้อมูลวิสาหกิจชุมชน
 * Input : id (number) - รหัสของวิสาหกิจชุมชน
 *         data (any) - ข้อมูลที่ต้องการอัปเดต
 * Output : Response จาก API หลังอัปเดตข้อมูลสำเร็จ
 */
export async function updateCommunity(id: number, data: any) {
  return await axios.put(`${apiUrl}/super/community/${id}`, data);
}
/*
 * คำอธิบาย : ฟังก์ชันสำหรับลบ (Soft Delete) วิสาหกิจชุมชน
 * โดยใช้ PATCH เพื่อเปลี่ยนสถานะ isDeleted แทนการลบถาวร
 * Input : id (number) - รหัสของวิสาหกิจชุมชนที่ต้องการลบ
 * Output : Response จาก API หลังการลบสำเร็จ
 */
export async function deleteCommunity(id: number) {
  return await axios.patch(`${apiUrl}/super/community/${id}`);
}
