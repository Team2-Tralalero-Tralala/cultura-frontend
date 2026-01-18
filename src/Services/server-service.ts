/*
 * คำอธิบาย : Service สำหรับตรวจสอบสถานะเซิร์ฟเวอร์
 * ใช้สำหรับตรวจสอบว่าเซิร์ฟเวอร์อยู่ในโหมด maintenance หรือไม่
 */

import api from "@/Libs/api";

/*
 * Interface สำหรับ Response จาก API
 */
export interface ServerStatusResponse {
  status: number;
  error: boolean;
  message: string;
  data: {
    serverOnline: boolean;
  };
}

/*
 * คำอธิบาย : ดึงสถานะเซิร์ฟเวอร์จาก API
 * Input : ไม่มี
 * Output : Promise<ServerStatusResponse> - ข้อมูลสถานะเซิร์ฟเวอร์
 */
export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const response = await api.get<ServerStatusResponse>("/shared/server-status");
  return response.data;
}

