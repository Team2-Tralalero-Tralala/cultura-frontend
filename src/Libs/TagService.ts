/*
 * คำอธิบาย : Service สำหรับจัดการข้อมูล Tag
 * หน้าที่ :
 *   - ดึงข้อมูลแท็กทั้งหมด (GET)
 *   - สร้างแท็กใหม่ (POST)
 *   - แก้ไขชื่อแท็ก (PUT)
 *   - ลบแท็ก (DELETE)
 * การเชื่อมต่อ : เชื่อมต่อกับ Backend API ผ่าน Axios โดยใช้ URL จาก environment (VITE_API_URL)
 * หมายเหตุ :
 *   - ส่ง `withCredentials: true` เพื่อแนบ cookie/session ไปกับทุก request
 *   - ใช้ร่วมกับระบบที่มีการ Auth (เช่น session หรือ token)
 */

import api from "@/Libs/Api";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

/**
 * คำอธิบาย : ฟังก์ชันดึงข้อมูลแท็กทั้งหมดใช้ใน Tag Selector
 * Input : ไม่มี
 * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลแท็ก (Promise)
 */
export async function getTags() {
  return await axios.get(`${apiUrl}/shared/tags`, {
    withCredentials: true,
  });
}

/**
 * คำอธิบาย : ฟังก์ชันดึงข้อมูลแท็กทั้งหมด
 * Input :
 *   - page (number) : หมายเลขหน้าปัจจุบัน
 *   - limit (number) : จำนวนรายการต่อหน้า
 *   - search (string | undefined) : คำค้นหา (ถ้ามี)
 * Output : ผลลัพธ์จากการเรียก API เพื่อดึงข้อมูลแท็ก (Promise)
 */
export async function fetchTags(page: number, limit: number, search?: string) {
  const url = `/shared/tags`;

  const res = await api.get(url, {
    params: { page, limit, search },
    withCredentials: true,
  });
  return res.data;
}

/**
 * คำอธิบาย : ฟังก์ชันสร้างแท็กใหม่
 * Input : name - ชื่อของแท็กที่ต้องการสร้าง
 * Output : ผลลัพธ์จากการเรียก API เพื่อสร้างแท็ก (Promise)
 */
export async function createTag(name: string) {
  return await axios.post(`${apiUrl}/super/tag`, { name }, { withCredentials: true });
}

/**
 * คำอธิบาย : ฟังก์ชันแก้ไขแท็ก
 * Input :
 *   - id (number) : รหัสของแท็กที่ต้องการแก้ไข
 *   - name (string) : ชื่อใหม่ของแท็ก
 * Output : ผลลัพธ์จากการเรียก API เพื่อแก้ไขแท็ก (Promise)
 */
export async function updateTag(id: number, name: string) {
  return await axios.put(`${apiUrl}/super/tag/${id}`, { name }, { withCredentials: true });
}

/**
 * คำอธิบาย : ฟังก์ชันลบแท็ก
 * Input : id - รหัสของแท็กที่ต้องการลบ
 * Output : ผลลัพธ์จากการเรียก API เพื่อลบแท็ก (Promise)
 */
export async function deleteTag(id: number) {
  return await axios.patch(
    `${apiUrl}/super/tag/${id}`,
    { isDeleted: true },
    { withCredentials: true },
  );
}
