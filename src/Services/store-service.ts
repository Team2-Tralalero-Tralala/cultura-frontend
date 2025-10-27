import axios from "axios";
import type { StoreData } from "@/Types/Store";
const apiUrl = import.meta.env.VITE_API_URL;

export async function getAllStore(
  communityId: number,
  page: number,
  limit: number
) {
  const params = { page, limit };
  return axios.get(`${apiUrl}/super/community/${communityId}/store`, {
    params,
    withCredentials: true,
  });
}
/**
 * คำอธิบาย : บริการสำหรับจัดการร้านค้า (Store) ผ่าน API
 * ฟังก์ชันที่มีอยู่ :
 * - createStore : สร้างร้านค้าใหม่ในชุมชน
 * - editStore : แก้ไขข้อมูลร้านค้าที่มีอยู่
 * - getStoreById : ดึงข้อมูลร้านค้าตาม ID
 *  Input : พารามิเตอร์ที่จำเป็นสำหรับแต่ละฟังก์ชัน
 *  Output : ผลลัพธ์จากการเรียก API (Promise)
 */

/**
 * คำอธิบาย : ฟังก์ชันสำหรับสร้างร้านค้าใหม่ในชุมชน
 * Input :
 *   - communityId (number) : ID ของชุมชนที่ต้องการสร้างร้านค้า
 *   - data (StoreData | FormData) : ข้อมูลร้านค้าที่จะสร้าง
 * Output : ผลลัพธ์จากการเรียก API เพื่อสร้างร้านค้า (Promise)
 */
export async function createStore(
  communityId: number,
  data: StoreData | FormData
) {
  return await axios.post(
    `${apiUrl}/shared/community/${communityId}/store`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );
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
