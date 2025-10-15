// src/Libs/Tags.ts

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

//ดึงข้อมูลแท็กทั้งหมด
export async function getAllTags() {
  return await axios.get(`${apiUrl}/tags`, {
    withCredentials: true,
  });
}

//สร้างแท็กใหม่
export async function createTag(name: string) {
  return await axios.post(`${apiUrl}/tags`, { name }, {
    withCredentials: true,
  });
}

//แก้ไขแท็ก
export async function updateTag(id: number, name: string) {
  return await axios.put(`${apiUrl}/tags/${id}`, { name }, {
    withCredentials: true,
  });
}

//ลบแท็ก
export async function deleteTag(id: number) {
  return await axios.delete(`${apiUrl}/tags/${id}`, {
    withCredentials: true,
  });
}
