/*
 * คำอธิบาย : Service สำหรับจัดการการเปิด/ปิดระบบ
 * โดยแบ่งออกเป็นส่วนหลัก ได้แก่
 * 1. เปิดระบบ (enable system)
 * 2. ปิดระบบ (disable system)
 * 3. ตรวจสอบสถานะระบบ
 */
import api from "@/Libs/Api";

/*
 * คำอธิบาย : Type definition สำหรับ response ของการเปิด/ปิดระบบ
 * หน้าที่ : กำหนดสัญญาโครงสร้างข้อมูลที่ใช้ทั้งฝั่งหน้าเว็บและบริการเรียกข้อมูล
 */
export interface SystemToggleResponse {
  success: boolean;
  message: string;
  data: {
    serverOnline: boolean;
  };
}

/*
 * คำอธิบาย : เปิดระบบผ่าน API
 * Input : ไม่มี
 * Output :
 *    - คืนค่า Promise ของ SystemToggleResponse ที่ประกอบด้วย success, message, และ data
 */
export async function enableSystem(): Promise<SystemToggleResponse> {
  const url = `/super/server/enable`;

  const res = await api.post(
    url,
    {},
    {
      withCredentials: true,
    },
  );

  return res.data;
}

/*
 * คำอธิบาย : ปิดระบบผ่าน API
 * Input : ไม่มี
 * Output :
 *    - คืนค่า Promise ของ SystemToggleResponse ที่ประกอบด้วย success, message, และ data
 */
export async function disableSystem(): Promise<SystemToggleResponse> {
  const url = `/super/server/disable`;

  const res = await api.post(
    url,
    {},
    {
      withCredentials: true,
    },
  );

  return res.data;
}

/*
 * คำอธิบาย : ดึงสถานะปัจจุบันของระบบจาก API
 * Input : ไม่มี
 * Output :
 *    - คืนค่า Promise ของ object ที่ประกอบด้วย serverStatus (boolean)
 */
export async function getSystemStatus(): Promise<{ serverStatus: boolean }> {
  const url = `/shared/system/status`;

  const res = await api.get(url, {
    withCredentials: true,
  });

  return res.data;
}
