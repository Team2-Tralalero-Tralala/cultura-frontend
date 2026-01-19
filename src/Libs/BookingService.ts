/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของคำขอคืนเงิน (Refund Requests)
 * ใช้สำหรับผู้ดูแลชุมชน (Admin) เพื่อดึง อนุมัติ และปฏิเสธคำขอคืนเงิน
 *
 * Base URL: ${VITE_API_URL}/admin/booking/refunds
 */

import api from "@/Libs/Api";
import axios from "axios";

export const apiRefund = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/*
 * คำอธิบาย : ฟังก์ชันดึงรายการคำขอคืนเงินทั้งหมด
 * Mapping : GET /admin/booking/refunds/all?page=&limit=
 * Output : PaginationResponse<Refund>
 */
export async function fetchRefundRequests(page = 1, limit = 10) {
  return apiRefund.get(`/admin/booking/refunds/all`, { params: { page, limit } });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Mapping : PATCH /admin/booking/refunds/:bookingId/approve
 */
export async function approveRefund(bookingId: number) {
  return apiRefund.patch(`/admin/booking/refunds/${bookingId}/approve`);
}

/*
 * ฟังก์ชัน : rejectRefund
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Mapping : PATCH /admin/refunds/:bookingId/reject
 * Input : reason (string)
 */
export async function rejectRefund(bookingId: number, reason: string) {
  return apiRefund.patch(`/admin/booking/refunds/${bookingId}/reject`, { reason });
}

/*
 * คำอธิบาย : ฟังก์ชันดึงรายการคำขอคืนเงินทั้งหมด
 * Mapping : GET /member/booking-history/refunds
 * Output : PaginationResponse<Refund>
 */
export async function fetchRefundRequestsMember(page = 1, limit = 10) {
  return apiRefund.get(`/member/booking-history`, { params: { page, limit } });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Mapping : PATCH /member/booking-history/:bookingId/approve-refund
 */
export async function approveRefundMember(bookingId: number) {
  return apiRefund.patch(`/member/booking-history/${bookingId}/approve-refund`);
}

/*
 * ฟังก์ชัน : rejectRefund
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Mapping : PATCH /member/booking-history/:bookingId/reject-refund
 * Input : reason (string)
 */
export async function rejectRefundMember(bookingId: number, reason: string) {
  return apiRefund.patch(`/member/booking-history/${bookingId}/reject-refund`, { reason });
}

/**
 * คำอธิบาย : ฟังก์ชันสำหรับดึงข้อมูลประวัติการจองของสมาชิก พร้อมรองรับการแบ่งหน้าและการกรองด้วยสถานะ
 * Input : page (เลขหน้าปัจจุบัน), limit (จำนวนรายการต่อหน้า), status (สถานะที่ต้องการกรอง)
 * Output : Promise ข้อมูลรายการจองและข้อมูล Pagination
 */
export async function getMemberBookingHistories(page = 1, limit = 10, status = "ALL") {
  /**
   * คำอธิบาย : เรียก API สำหรับดึงข้อมูลประวัติการจองของสมาชิก
   * โดยรองรับการแบ่งหน้า (Pagination) และการกรองตามสถานะการจอง
   * Query Params :
   *  - page   : หมายเลขหน้าที่ต้องการดึงข้อมูล
   *  - limit  : จำนวนรายการต่อหน้า
   *  - status : สถานะการจอง (ALL, PENDING, BOOKED, REFUNDED ฯลฯ)
   */
  return apiRefund.get(`/member/booking-histories`, {
    params: {
      page,
      limit,
      status, // ส่ง status ไปเพื่อให้ Backend ตัวใหม่ทำงาน (Dispatcher)
    },
  });
}

/*
 * Interface สำหรับข้อมูลการจอง
 */
export interface BookingData {
  packageId: number;
  totalParticipant: number;
  transferSlip?: string;
  touristBankId?: number;
}

/*
 * Interface สำหรับ Response จากการสร้างการจอง
 */
export interface CreateBookingResponse {
  status: number;
  error: boolean;
  message: string;
  data: {
    id: number;
    touristId: number;
    packageId: number;
    totalParticipant: number;
    status: string;
    bookingAt: string;
    transferSlip?: string;
    touristBankId?: number;
    package: {
      id: number;
      name: string;
      price: number;
    };
    tourist: {
      id: number;
      fname: string;
      lname: string;
    };
  };
}

/*
 * Interface สำหรับ Response จากการอัปโหลดไฟล์
 */
export interface UploadFileResponse {
  status: number;
  error: boolean;
  message: string;
  data: {
    filePath: string;
  };
}

/*
 * คำอธิบาย : อัปโหลดหลักฐานการชำระเงิน
 * Input :
 *   - paymentProof (File) - ไฟล์หลักฐานการชำระเงิน
 * Output : Promise<string> - path ของไฟล์ที่อัปโหลดแล้ว
 */
export async function uploadPaymentProof(paymentProof: File): Promise<string> {
  const formData = new FormData();
  formData.append("paymentProof", paymentProof);

  const response = await api.post<UploadFileResponse>("/tourist/upload/payment-proof", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data.filePath;
}

/*
 * คำอธิบาย : สร้างการจองแพ็กเกจใหม่
 * Input :
 *   - bookingId (number) - รหัสการจอง (reference ID, อาจใช้ placeholder หรือ generate จาก frontend)
 *   - bookingData (BookingData) - ข้อมูลการจอง
 * Output : Promise<CreateBookingResponse> - ข้อมูลการจองที่สร้างแล้ว
 */
export async function createBooking(
  bookingId: number,
  bookingData: BookingData,
): Promise<CreateBookingResponse> {
  const response = await api.post<CreateBookingResponse>(
    `/tourist/booking/${bookingId}`,
    bookingData,
  );
  return response.data;
}
