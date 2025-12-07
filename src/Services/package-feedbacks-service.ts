/**
 * คำอธิบาย : เรียก API เพื่อนำรายการ Feedback ของแพ็กเกจตาม packageId
 * Input : packageId: number
 * Output : Feedback ทั้งหมดของแพ็กเกจนั้น
 */

import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * ฟังก์ชัน : getPackageFeedbacksByPackageId
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ (เฉพาะแอดมิน)
 * Input : packageId: number - รหัสแพ็กเกจ
 * Output : Promise<any[]> - รายการ Feedback ทั้งหมดของแพ็กเกจนั้น
 */
export const getPackageFeedbacksByPackageId = async (packageId: number) => {
  const response = await axios.get(`${apiUrl}/admin/package/feedback/${packageId}`, {
    withCredentials: true,
  });

  return response.data;
};

export default getPackageFeedbacksByPackageId;