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

import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type Tag = {
  id: number;
  name: string;
};

console.log("API URL:", apiUrl);

export async function getTags() {
  return await axios.get(`${apiUrl}/shared/tags`, {
    withCredentials: true,
  });
}

/**
* คำอธิบาย : ดึงข้อมูลแท็กทั้งหมด
*/
export async function fetchTags(page: number, limit: number, search: string) {
    const params: any = { page, limit, search };
    if (search) params.search = search;
    const res = await axios.get(`${apiUrl}/super/shared/tags`, {
      params,
      withCredentials: true,
    });
    return {
      data: res.data.data.data,
      pagination: res.data.data.pagination,

    }
  };

/**
* คำอธิบาย : สร้างแท็กใหม่
*/
export async function createTag(name: string) {
  return await axios.post(`${apiUrl}/super/tag`, { name }, {
    withCredentials: true,
  });
}

/**
* คำอธิบาย : แก้ไขแท็ก
*/
export async function updateTag(id: number, name: string) {
  return await axios.put(`${apiUrl}/super/tag/${id}`, { name }, {
    withCredentials: true,
  });
}

/**
* คำอธิบาย : ลบแท็ก
*/
export async function deleteTag(id: number) {
  return await axios.patch(`${apiUrl}/super/tag/${id}`, updateTag,{
    withCredentials: true,
  });
}
