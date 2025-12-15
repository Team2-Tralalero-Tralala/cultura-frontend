/*
 * คำอธิบาย : Service สำหรับเชื่อมต่อ API ของคำขอคืนเงิน (Refund Requests)
 * ใช้สำหรับผู้ดูแลชุมชน (Admin) เพื่อดึง อนุมัติ และปฏิเสธคำขอคืนเงิน
 *
 * Base URL: ${VITE_API_URL}/admin/booking/refunds
 */

import axios from "axios";

export const api = axios.create({
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
  return api.get(`/admin/booking/refunds/all`, { params: { page, limit } });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Mapping : PATCH /admin/booking/refunds/:bookingId/approve
 */
export async function approveRefund(bookingId: number) {
  return api.patch(`/admin/booking/refunds/${bookingId}/approve`);
}

/*
 * ฟังก์ชัน : rejectRefund
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Mapping : PATCH /admin/refunds/:bookingId/reject
 * Input : reason (string)
 */
export async function rejectRefund(bookingId: number, reason: string) {
  return api.patch(`/admin/booking/refunds/${bookingId}/reject`, { reason });
}


/*
 * คำอธิบาย : ฟังก์ชันดึงรายการคำขอคืนเงินทั้งหมด
 * Mapping : GET /member/booking-history/refunds
 * Output : PaginationResponse<Refund>
 */
export async function fetchRefundRequestsMember(page = 1, limit = 10) {
  return api.get(`/member/booking-history`, { params: { page, limit } });
}

/*
 * คำอธิบาย : ฟังก์ชันสำหรับอนุมัติคำขอคืนเงิน
 * Mapping : PATCH /member/booking-history/:bookingId/approve-refund
 */
export async function approveRefundMember(bookingId: number) {
  return api.patch(`/member/booking-history/${bookingId}/approve-refund`);
}

/*
 * ฟังก์ชัน : rejectRefund
 * อธิบาย : ปฏิเสธคำขอคืนเงิน พร้อมเหตุผล
 * Mapping : PATCH /member/booking-history/:bookingId/reject-refund
 * Input : reason (string)
 */
export async function rejectRefundMember(bookingId: number, reason: string) {
  return api.patch(`/member/booking-history/${bookingId}/reject-refund`, { reason });
}

/*
 * คำอธิบาย : ดึงประวัติการจองทั้งหมดของ Member (รองรับการกรองสถานะ ALL, BOOKED, PENDING ฯลฯ)
 * Mapping : GET /member/booking-histories
 * Input : page, limit, status (default='ALL')
 */
export async function getMemberBookingHistories(
  page = 1, 
  limit = 10, 
  status = "ALL"
) {
  // ใช้ตัวแปร api ตัวเดิมที่คุณประกาศไว้ด้านบน
  return api.get(`/member/booking-histories`, { 
    params: { 
      page, 
      limit, 
      status // ส่ง status ไปเพื่อให้ Backend ตัวใหม่ทำงาน (Dispatcher)
    } 
  });
}