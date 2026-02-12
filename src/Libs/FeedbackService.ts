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
  const response = await axios.get(`${apiUrl}/admin/package/feedbacks/${packageId}`, {
    withCredentials: true,
  });

  return response.data;
};

export default getPackageFeedbacksByPackageId;

/**
 * ฟังก์ชัน : getPackageFeedbacksByPackageIdMember
 * คำอธิบาย : ดึงรายการ Feedback ของแพ็กเกจตามรหัสแพ็กเกจ (เฉพาะ Member)
 * Input : packageId: number 
 * Output : Promise<any[]> - รายการ Feedback ทั้งหมดของแพ็กเกจนั้น
 */
export const getPackageFeedbacksByPackageIdMember = async (packageId: number) => {
  const response = await axios.get(`${apiUrl}/member/package/feedbacks/${packageId}`, {
    withCredentials: true,
  });

  return response.data;
};
/**
 * พารามิเตอร์สำหรับการตอบกลับ Feedback
 * ต้องตรงกับ ReplyFeedbackDto ที่ backend ใช้ validate
 */
export interface ReplyFeedbackPayload {
  replyMessage: string;
}

/**
 * ฟังก์ชัน : replyPackageFeedback
 * คำอธิบาย : เรียก API เพื่อตอบกลับข้อความรีวิวของสมาชิก
 * Route : POST /member/feedback/:feedbackId/reply
 *
 * Input :
 *   - feedbackId : หมายเลข Feedback ที่ต้องการตอบกลับ
 *   - payload : { replyMessage: string } ข้อความตอบกลับรีวิว
 *
 * Output :
 *   - ข้อมูล Feedback ที่ถูกอัปเดตแล้ว (ส่วนของการตอบกลับ)
 */
export const replyPackageFeedback = async (
  feedbackId: number,
  payload: ReplyFeedbackPayload
) => {
  const response = await axios.post(
    `${apiUrl}/member/feedback/${feedbackId}/reply`,
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

/**
 * ฟังก์ชัน : replyPackageFeedbackAdmin 
 * คำอธิบาย : เรียก API เพื่อตอบกลับข้อความรีวิวของสมาชิก
 * Route : POST /member/feedback/:feedbackId/reply
 *
 * Input :
 *   - feedbackId : หมายเลข Feedback ที่ต้องการตอบกลับ
 *   - payload : { replyMessage: string } ข้อความตอบกลับรีวิว
 *
 * Output :
 *   - ข้อมูล Feedback ที่ถูกอัปเดตแล้ว (ส่วนของการตอบกลับ)
 */
export const replyPackageFeedbackAdmin = async (
  feedbackId: number,
  payload: ReplyFeedbackPayload
) => {
  const response = await axios.post(
    `${apiUrl}/admin/feedback/${feedbackId}/reply`,
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
};
