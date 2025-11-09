/**
 * คำอธิบาย : บริการสำหรับจัดการร้านค้า (Store) ผ่าน API
 */
import axios from "axios";
import type { StoreData } from "@/Types/Store";
import api from "@/Libs/api";
const apiUrl = import.meta.env.VITE_API_URL;

export async function getAllStore(communityId: number, page: number, limit: number) {
  const params = { page, limit };
  return axios.get(`${apiUrl}/super/community/${communityId}/store`, {
    params,
    withCredentials: true,
  });
}

/**
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างร้านค้าใหม่ในชุมชน
 * Input :
 *   - communityId (number) : ID ของชุมชนที่ต้องการสร้างร้านค้า
 *   - data (StoreData | FormData) : ข้อมูลร้านค้าที่จะสร้าง
 * Output : ผลลัพธ์จากการเรียก API เพื่อสร้างร้านค้า (Promise)
 */
export async function createStore(communityId: number, data: StoreData | FormData) {
  return await axios.post(`${apiUrl}/super/community/${communityId}/store`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}
/**
 * คำอธิบาย : ฟังก์ชันสำหรับแก้ไขข้อมูลร้านค้าที่มีอยู่
 * Input :
 *   - storeId (number) : ID ของร้านค้าที่ต้องการแก้ไข
 *   - data (StoreData | FormData) : ข้อมูลร้านค้าที่จะอัปเดต
 * Output : ผลลัพธ์จากการเรียก API เพื่อแก้ไขร้านค้า (Promise)
 */
export async function editStore(storeId: number, data: StoreData | FormData) {
  return await axios.put(`${apiUrl}/shared/store/${storeId}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}
/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลร้านค้าตาม ID
 * Input :
 *   - storeId (number) : ID ของร้านค้าที่ต้องการดึงข้อมูล
 * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลร้านค้า (Promise)
 */
export async function getStoreById(storeId: number) {
  return await axios.get(`${apiUrl}/shared/store/${storeId}`, {
    withCredentials: true,
  });
}

 /*
  * คำอธิบาย : ฟังก์ชันสำหรับโหลดข้อมูลร้านค้าทั้งหมดของชุมชนที่อยู่ในชุมชนของ admin
  * Input : page, limit
  * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลร้านค้า (Promise)
  */
export async function getAllStoreAdmin(
  page: number,
  limit: number
) {
  const params = { page, limit };
  return axios.get(`${apiUrl}/admin/community/own/stores/all`, {
    params,
    withCredentials: true,
  });
}

/**
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างร้านค้าใหม่ในชุมชน
 * Input :
 *   - communityId (number) : ID ของชุมชนที่ต้องการสร้างร้านค้า
 *   - data (StoreData | FormData) : ข้อมูลร้านค้าที่จะสร้าง
 * Output : ผลลัพธ์จากการเรียก API เพื่อสร้างร้านค้า (Promise)
 */
export async function createStoreByAdmin(data: StoreData | FormData) {
  return await axios.post(`${apiUrl}/admin/community/store`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}

/**
 * ฟังก์ชัน : deleteStore
 * คำอธิบาย :
 *   ฟังก์ชันสำหรับเรียก API เพื่อลบร้านค้าออกจากระบบ (Soft Delete)
 *   โดยจะส่งคำขอแบบ DELETE ไปยังเส้นทาง `/shared/store/:storeId/delete`
 *   เพื่อให้ฝั่ง Backend ทำการตั้งค่า `isDeleted = true` และ `deleteAt = new Date()`
 *   ใช้สำหรับผู้ใช้ที่มีสิทธิ์เป็น "superadmin" หรือ "admin" เท่านั้น
 *
 * Input :
 *   - storeId : หมายเลขรหัสร้านค้า (number) ที่ต้องการลบ
 *
 * Output :
 *   - Promise<Response> : ผลลัพธ์จากการเรียก API
 *     • หากสำเร็จ → คืนค่า response ของร้านค้าที่ถูกลบ
 *     • หากล้มเหลว → ขว้าง error ที่ได้จาก backend
 */
export async function deleteStore(storeId: number) {
  return api.delete(`/shared/store/${storeId}/delete`);
}
