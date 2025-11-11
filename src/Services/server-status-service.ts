/*
 * คำอธิบาย : Service สำหรับตรวจสอบสถานะเซิร์ฟเวอร์
 * โดยดึงข้อมูลสถานะว่าเซิร์ฟเวอร์ออนไลน์หรือออฟไลน์
 */
import api from "@/Libs/api";

/*
 * คำอธิบาย : Type definition สำหรับ response ของการตรวจสอบสถานะเซิร์ฟเวอร์
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface ServerStatusResponse {
  serverOnline: boolean;
}

/*
 * คำอธิบาย : ดึงสถานะเซิร์ฟเวอร์จาก API
 * Input : ไม่มี
 * Output :
 *    - คืนค่า Promise ของ ServerStatusResponse ที่ประกอบด้วย serverOnline (boolean)
 */
export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const url = `/shared/server-status`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data;
}
